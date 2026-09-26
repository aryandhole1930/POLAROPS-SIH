from app.dependencies import get_current_user, require_role
from app.models.models import User
from fastapi import Depends

from app.routes.expeditions import router as expedition_router
from app.routes.auth import router as auth_router
from app.routes.cargo import router as cargo_router
from app.routes.emergency import router as emergency_router
from app.routes.notifications import router as notifications_router

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database.connection import engine

app = FastAPI(
    title="PolarOps API",
    description="Integrated Polar Expedition Logistics and Asset Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
   allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(expedition_router)
app.include_router(cargo_router)
app.include_router(emergency_router)
app.include_router(notifications_router)
@app.get("/")
def root():
    return {
        "message": "PolarOps API is running",
        "status": "online"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/db-test")
def database_test():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            value = result.scalar()

        return {
            "database": "connected",
            "test_result": value
        }

    except Exception as e:
        return {
            "database": "connection_failed",
            "error": str(e)
        }
@app.get("/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "station": current_user.station,
        "personnel_type": current_user.personnel_type
    }
@app.get("/test/admin-only")
def admin_only_test(
    current_user: User = Depends(
        require_role("programme_admin")
    )
):
    return {
        "message": "Access granted",
        "user": current_user.full_name,
        "role": current_user.role
    }