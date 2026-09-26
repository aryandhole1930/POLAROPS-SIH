from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies import get_current_user, require_role
from app.models.models import Cargo, Expedition


router = APIRouter(
    prefix="/cargo",
    tags=["Cargo"]
)


@router.get("/")
def get_cargo(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    cargo_items = (
        db.query(Cargo)
        .order_by(Cargo.created_at.desc())
        .all()
    )

    return [
        {
            "id": str(cargo.id),
            "cargo_code": cargo.cargo_code,
            "cargo_name": cargo.cargo_name,
            "cargo_type": cargo.cargo_type,
            "quantity": cargo.quantity,
            "origin": cargo.origin,
            "destination": cargo.destination,
            "status": cargo.status,
            "transport_mode": cargo.transport_mode,
            "eta": cargo.eta,
            "delivered_at": cargo.delivered_at,

            "mission_id": (
                str(cargo.mission_id)
                if cargo.mission_id
                else None
            ),

            "expedition_id": (
                str(cargo.expedition_id)
                if cargo.expedition_id
                else None
            ),

            "created_by": (
                str(cargo.created_by)
                if cargo.created_by
                else None
            ),

            "created_at": cargo.created_at,
            "updated_at": cargo.updated_at
        }
        for cargo in cargo_items
    ]


@router.post("/")
def create_cargo(
    cargo_data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "programme_admin",
            "operations_director",
            "expedition_logistics"
        )
    )
):
    expedition_id = cargo_data.get("expedition_id")

    # Validate expedition if one was supplied
    if expedition_id:
        expedition = (
            db.query(Expedition)
            .filter(Expedition.id == expedition_id)
            .first()
        )

        if not expedition:
            raise HTTPException(
                status_code=404,
                detail="Expedition not found"
            )

    cargo = Cargo(
        cargo_code=cargo_data["cargo_code"],
        cargo_name=cargo_data["cargo_name"],
        cargo_type=cargo_data.get("cargo_type"),
        quantity=cargo_data.get("quantity"),
        origin=cargo_data.get("origin"),
        destination=cargo_data.get("destination"),
        status=cargo_data.get(
            "status",
            "preparing"
        ),
        transport_mode=cargo_data.get(
            "transport_mode"
        ),
        eta=cargo_data.get("eta"),
        delivered_at=cargo_data.get(
            "delivered_at"
        ),
        mission_id=cargo_data.get(
            "mission_id"
        ),
        expedition_id=expedition_id,
        created_by=current_user.id
    )

    db.add(cargo)
    db.commit()
    db.refresh(cargo)

    return {
        "message": "Cargo created successfully",

        "cargo": {
            "id": str(cargo.id),
            "cargo_code": cargo.cargo_code,
            "cargo_name": cargo.cargo_name,
            "cargo_type": cargo.cargo_type,
            "quantity": cargo.quantity,
            "origin": cargo.origin,
            "destination": cargo.destination,
            "status": cargo.status,
            "transport_mode": cargo.transport_mode,
            "eta": cargo.eta,
            "delivered_at": cargo.delivered_at,

            "mission_id": (
                str(cargo.mission_id)
                if cargo.mission_id
                else None
            ),

            "expedition_id": (
                str(cargo.expedition_id)
                if cargo.expedition_id
                else None
            ),

            "created_by": str(
                cargo.created_by
            )
        }
    }


@router.patch("/{cargo_id}/status")
def update_cargo_status(
    cargo_id: str,
    status_data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "programme_admin",
            "operations_director",
            "expedition_logistics"
        )
    )
):
    cargo = (
        db.query(Cargo)
        .filter(Cargo.id == cargo_id)
        .first()
    )

    if not cargo:
        raise HTTPException(
            status_code=404,
            detail="Cargo not found"
        )

    new_status = status_data.get("status")

    if not new_status:
        raise HTTPException(
            status_code=400,
            detail="Status is required"
        )

    cargo.status = new_status

    db.commit()
    db.refresh(cargo)

    return {
        "message": "Cargo status updated successfully",

        "cargo": {
            "id": str(cargo.id),
            "cargo_code": cargo.cargo_code,
            "cargo_name": cargo.cargo_name,
            "status": cargo.status,
            "updated_at": cargo.updated_at
        }
    }


@router.get("/{cargo_id}")
def get_cargo_by_id(
    cargo_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    cargo = (
        db.query(Cargo)
        .filter(Cargo.id == cargo_id)
        .first()
    )

    if not cargo:
        raise HTTPException(
            status_code=404,
            detail="Cargo not found"
        )

    return {
        "id": str(cargo.id),
        "cargo_code": cargo.cargo_code,
        "cargo_name": cargo.cargo_name,
        "cargo_type": cargo.cargo_type,
        "quantity": cargo.quantity,
        "origin": cargo.origin,
        "destination": cargo.destination,
        "status": cargo.status,
        "transport_mode": cargo.transport_mode,
        "eta": cargo.eta,
        "delivered_at": cargo.delivered_at,

        "mission_id": (
            str(cargo.mission_id)
            if cargo.mission_id
            else None
        ),

        "expedition_id": (
            str(cargo.expedition_id)
            if cargo.expedition_id
            else None
        ),

        "created_by": (
            str(cargo.created_by)
            if cargo.created_by
            else None
        ),

        "created_at": cargo.created_at,
        "updated_at": cargo.updated_at
    }