import os
from datetime import datetime, timedelta, timezone

from jose import jwt

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database.connection import get_db
from app.models.models import User, RoleDomainRule
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    RefreshTokenRequest
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

JWT_REFRESH_TOKEN_EXPIRE_DAYS = int(
    os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "30")
)


@router.post("/register")
def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    # Check whether email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Determine eligible role from email domain
    email_domain = user_data.email.split("@")[-1].lower()

    domain_rule = (
        db.query(RoleDomainRule)
        .filter(
            RoleDomainRule.domain == email_domain,
            RoleDomainRule.is_active == True
        )
        .first()
    )

    if not domain_rule:
        raise HTTPException(
            status_code=400,
            detail="Email domain is not authorized for POLAROPS registration"
        )

    # Hash password
    hashed_password = pwd_context.hash(user_data.password)

    # Create user
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hashed_password,
        role=domain_rule.role,
        station=user_data.station,
        personnel_type=user_data.personnel_type
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Registration successful",
        "user": {
            "id": str(new_user.id),
            "full_name": new_user.full_name,
            "email": new_user.email,
            "role": new_user.role,
            "station": new_user.station,
            "personnel_type": new_user.personnel_type
        }
    }


@router.post("/login")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == login_data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not pwd_context.verify(
        login_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Access token expires after configured minutes
    access_expire = datetime.now(timezone.utc) + timedelta(
        minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )

    # Refresh token expires after configured days
    refresh_expire = datetime.now(timezone.utc) + timedelta(
        days=JWT_REFRESH_TOKEN_EXPIRE_DAYS
    )

    access_token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "station": user.station,
        "type": "access",
        "exp": access_expire
    }

    refresh_token_data = {
        "sub": str(user.id),
        "type": "refresh",
        "exp": refresh_expire
    }

    access_token = jwt.encode(
        access_token_data,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )

    refresh_token = jwt.encode(
        refresh_token_data,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "station": user.station,
            "personnel_type": user.personnel_type
        }
    }

@router.post("/demo-reset-password")
def demo_reset_password(
    email: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.password_hash = pwd_context.hash(new_password)

    db.commit()

    return {
        "message": "Demo password updated successfully",
        "email": user.email
    }

@router.post("/refresh")
def refresh_access_token(
    refresh_data: RefreshTokenRequest
):
    try:
        payload = jwt.decode(
            refresh_data.refresh_token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get("sub")
        token_type = payload.get("type")

        if not user_id or token_type != "refresh":
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )

        access_expire = datetime.now(timezone.utc) + timedelta(
            minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        )

        access_token_data = {
            "sub": user_id,
            "type": "access",
            "exp": access_expire
        }

        access_token = jwt.encode(
            access_token_data,
            JWT_SECRET_KEY,
            algorithm=JWT_ALGORITHM
        )

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token"
        )
