from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_current_user, require_role
from app.database.connection import get_db
from app.models.models import (
    Expedition,
    ExpeditionAssignment,
    User,
    Station
)


router = APIRouter(
    prefix="/expeditions",
    tags=["Expeditions"]
)


@router.get("/")
def get_expeditions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    expeditions = (
        db.query(Expedition)
        .order_by(Expedition.created_at.desc())
        .all()
    )

    return [
        {
            "id": str(expedition.id),
            "expedition_code": expedition.expedition_code,
            "expedition_name": expedition.expedition_name,
            "start_date": expedition.start_date,
            "end_date": expedition.end_date,
            "status": expedition.status,
            "description": expedition.description
        }
        for expedition in expeditions
    ]

@router.post("/")
def create_expedition(
    expedition_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(
        require_role(
            "programme_admin",
            "operations_director"
        )
    )
):
    expedition = Expedition(
        expedition_code=expedition_data["expedition_code"],
        expedition_name=expedition_data["expedition_name"],
        start_date=expedition_data.get("start_date"),
        end_date=expedition_data.get("end_date"),
        status=expedition_data.get("status", "planning"),
        description=expedition_data.get("description"),
        created_by=current_user.id
    )

    db.add(expedition)
    db.commit()
    db.refresh(expedition)

    return {
        "message": "Expedition created successfully",
        "expedition": {
            "id": str(expedition.id),
            "expedition_code": expedition.expedition_code,
            "expedition_name": expedition.expedition_name,
            "start_date": expedition.start_date,
            "end_date": expedition.end_date,
            "status": expedition.status,
            "description": expedition.description,
            "created_by": str(current_user.id)
        }
    }

@router.get("/{expedition_id}/assignments")
def get_expedition_assignments(
    expedition_id: str,
    db: Session = Depends(get_db)
):
    assignments = (
        db.query(
            ExpeditionAssignment,
            User,
            Station
        )
        .join(
            User,
            ExpeditionAssignment.user_id == User.id
        )
        .outerjoin(
            Station,
            ExpeditionAssignment.station_id == Station.id
        )
        .filter(
            ExpeditionAssignment.expedition_id == expedition_id
        )
        .all()
    )

    return [
        {
            "assignment_id": str(assignment.id),
            "person": {
                "id": str(user.id),
                "full_name": user.full_name,
                "email": user.email,
                "authority_role": user.role,
                "personnel_type": user.personnel_type
            },
            "appointment_type": assignment.appointment_type,
            "station": (
                {
                    "id": str(station.id),
                    "code": station.station_code,
                    "name": station.station_name
                }
                if station
                else None
            ),
            "authority_scope": assignment.authority_scope,
            "start_date": assignment.start_date,
            "end_date": assignment.end_date,
            "notes": assignment.notes
        }
        for assignment, user, station in assignments
    ]

@router.get("/personnel/available")
def get_available_personnel(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "programme_admin",
            "operations_director",
            "expedition_logistics"
        )
    )
):
    users = (
        db.query(User)
        .order_by(User.full_name.asc())
        .all()
    )

    return [
        {
            "id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "station": user.station,
            "personnel_type": user.personnel_type
        }
        for user in users
    ]

@router.post("/{expedition_id}/assignments")
def assign_person_to_expedition(
    expedition_id: str,
    assignment_data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "programme_admin",
            "operations_director",
            "expedition_logistics"
        )
    )
):
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

    user_id = assignment_data.get("user_id")
    appointment_type = assignment_data.get("appointment_type")
    station_id = assignment_data.get("station_id")

    if not user_id:
        raise HTTPException(
            status_code=400,
            detail="User ID is required"
        )

    if not appointment_type:
        raise HTTPException(
            status_code=400,
            detail="Appointment type is required"
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # ---------------------------------------------------------
    # 1. Prevent duplicate assignment of the same person
    # ---------------------------------------------------------
    existing_assignment = (
        db.query(ExpeditionAssignment)
        .filter(
            ExpeditionAssignment.expedition_id == expedition.id,
            ExpeditionAssignment.user_id == user.id,
            ExpeditionAssignment.appointment_type == appointment_type
        )
        .first()
    )

    if existing_assignment:
        raise HTTPException(
            status_code=409,
            detail=(
                f"{user.full_name} is already assigned to this "
                f"expedition as {appointment_type.replace('_', ' ')}."
            )
        )

    # ---------------------------------------------------------
    # 2. Only one Voyage Leader per expedition
    # ---------------------------------------------------------
    if appointment_type == "voyage_leader":
        existing_voyage_leader = (
            db.query(ExpeditionAssignment)
            .filter(
                ExpeditionAssignment.expedition_id == expedition.id,
                ExpeditionAssignment.appointment_type == "voyage_leader"
            )
            .first()
        )

        if existing_voyage_leader:
            raise HTTPException(
                status_code=409,
                detail="This expedition already has a Voyage Leader."
            )

    # ---------------------------------------------------------
    # 3. Station Leader must have a station
    # ---------------------------------------------------------
    if appointment_type == "station_leader":

        if not station_id:
            raise HTTPException(
                status_code=400,
                detail="A station must be selected for a Station Leader."
            )

        station = (
            db.query(Station)
            .filter(Station.id == station_id)
            .first()
        )

        if not station:
            raise HTTPException(
                status_code=404,
                detail="Station not found"
            )

        # -----------------------------------------------------
        # 4. Only one Station Leader per station per expedition
        # -----------------------------------------------------
        existing_station_leader = (
            db.query(ExpeditionAssignment)
            .filter(
                ExpeditionAssignment.expedition_id == expedition.id,
                ExpeditionAssignment.appointment_type == "station_leader",
                ExpeditionAssignment.station_id == station.id
            )
            .first()
        )

        if existing_station_leader:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"{station.station_name} already has a "
                    f"Station Leader for this expedition."
                )
            )

    # ---------------------------------------------------------
    # 5. Create assignment
    # ---------------------------------------------------------
    assignment = ExpeditionAssignment(
        expedition_id=expedition.id,
        user_id=user.id,
        appointment_type=appointment_type,
        station_id=station_id,
        start_date=assignment_data.get("start_date"),
        end_date=assignment_data.get("end_date"),
        authority_scope=assignment_data.get("authority_scope"),
        notes=assignment_data.get("notes")
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return {
        "message": "Person assigned to expedition successfully",
        "assignment": {
            "id": str(assignment.id),
            "expedition_id": str(assignment.expedition_id),
            "user_id": str(assignment.user_id),
            "appointment_type": assignment.appointment_type,
            "station_id": (
                str(assignment.station_id)
                if assignment.station_id
                else None
            ),
            "start_date": assignment.start_date,
            "end_date": assignment.end_date,
            "authority_scope": assignment.authority_scope,
            "notes": assignment.notes
        }
    }