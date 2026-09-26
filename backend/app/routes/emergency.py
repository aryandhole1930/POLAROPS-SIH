from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies import get_current_user, require_role
from app.models.models import Emergency, User, Notification


router = APIRouter(
    prefix="/emergencies",
    tags=["Emergency Response"]
)


# =========================================================
# GET ALL EMERGENCIES
# =========================================================

@router.get("/")
def get_emergencies(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    emergencies = (
        db.query(Emergency)
        .order_by(Emergency.created_at.desc())
        .all()
    )

    return [
        {
            "id": str(emergency.id),
            "incident_code": emergency.incident_code,
            "emergency_type": emergency.emergency_type,
            "description": emergency.description,
            "location": emergency.location,
            "severity": emergency.severity,
            "status": emergency.status,
            "reported_by": (
                str(emergency.reported_by)
                if emergency.reported_by
                else None
            ),
            "mission_id": (
                str(emergency.mission_id)
                if emergency.mission_id
                else None
            ),
            "reported_at": emergency.reported_at,
            "resolved_at": emergency.resolved_at,
            "created_at": emergency.created_at,
            "updated_at": emergency.updated_at,
        }
        for emergency in emergencies
    ]


# =========================================================
# GET SINGLE EMERGENCY
# =========================================================

@router.get("/{emergency_id}")
def get_emergency(
    emergency_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    emergency = (
        db.query(Emergency)
        .filter(Emergency.id == emergency_id)
        .first()
    )

    if not emergency:
        raise HTTPException(
            status_code=404,
            detail="Emergency incident not found"
        )

    return {
        "id": str(emergency.id),
        "incident_code": emergency.incident_code,
        "emergency_type": emergency.emergency_type,
        "description": emergency.description,
        "location": emergency.location,
        "severity": emergency.severity,
        "status": emergency.status,
        "reported_by": (
            str(emergency.reported_by)
            if emergency.reported_by
            else None
        ),
        "mission_id": (
            str(emergency.mission_id)
            if emergency.mission_id
            else None
        ),
        "reported_at": emergency.reported_at,
        "resolved_at": emergency.resolved_at,
        "created_at": emergency.created_at,
        "updated_at": emergency.updated_at,
    }

# =========================================================
# EMERGENCY NOTIFICATION TARGETING
# =========================================================

EMERGENCY_NOTIFICATION_RULES = {
    "Medical Emergency": {
        "personnel_types": {
            "medical_officer",
            "crew",
            "support_staff",
        },
        "roles": {
            "station_leader",
            "operations_director",
        },
    },

    "Fire": {
        "personnel_types": {
            "engineer",
            "technician",
            "support_staff",
            "crew",
        },
        "roles": {
            "station_leader",
            "operations_director",
        },
    },

    "Equipment Failure": {
        "personnel_types": {
            "engineer",
            "technician",
        },
        "roles": {
            "station_leader",
            "expedition_logistics",
        },
    },

    "Vehicle / Transport Incident": {
        "personnel_types": {
            "crew",
            "engineer",
            "logistics",
        },
        "roles": {
            "station_leader",
            "expedition_logistics",
        },
    },

    "Severe Weather": {
        "personnel_types": {
            "crew",
            "support_staff",
        },
        "roles": {
            "station_leader",
            "operations_director",
        },
    },

    "Personnel Missing": {
        "personnel_types": {
            "crew",
            "logistics",
        },
        "roles": {
            "station_leader",
            "operations_director",
        },
    },

    "Other": {
        "personnel_types": {
            "crew",
            "support_staff",
        },
        "roles": {
            "station_leader",
            "operations_director",
        },
    },
}

# =========================================================
# CREATE EMERGENCY
# =========================================================

@router.post("/")
def create_emergency(
    emergency_data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    incident_code = emergency_data.get("incident_code")
    emergency_type = emergency_data.get("emergency_type")
    location = emergency_data.get("location")

    if not incident_code:
        raise HTTPException(
            status_code=400,
            detail="Incident code is required"
        )

    if not emergency_type:
        raise HTTPException(
            status_code=400,
            detail="Emergency type is required"
        )

    if not location:
        raise HTTPException(
            status_code=400,
            detail="Location is required"
        )

    existing = (
        db.query(Emergency)
        .filter(
            Emergency.incident_code == incident_code
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Incident code already exists"
        )

    emergency = Emergency(
        incident_code=incident_code,
        emergency_type=emergency_type,
        description=emergency_data.get("description"),
        location=location,
        severity=emergency_data.get(
            "severity",
            "medium"
        ),
        status=emergency_data.get(
            "status",
            "open"
        ),
        reported_by=current_user.id,
        mission_id=emergency_data.get("mission_id"),
    )

    db.add(emergency)
    db.commit()
    db.refresh(emergency)

    # =========================================================
    # CREATE TARGETED EMERGENCY NOTIFICATIONS
    # =========================================================

    rules = EMERGENCY_NOTIFICATION_RULES.get(
        emergency.emergency_type,
        EMERGENCY_NOTIFICATION_RULES["Other"]
    )

    personnel_types = rules["personnel_types"]
    roles = rules["roles"]

    station_name = (emergency.location or "").lower()

    if "maitri" in station_name:
        station = "maitri"
    elif "bharati" in station_name:
        station = "bharati"
    else:
        station = None

    query = db.query(User)

    if station:
        query = query.filter(
            User.station == station
        )

    potential_recipients = query.all()

    notification_recipients = []

    for person in potential_recipients:
        if (
            person.personnel_type in personnel_types
            or person.role in roles
        ):
            notification_recipients.append(person)

    for person in notification_recipients:

        notification = Notification(
            user_id=person.id,
            emergency_id=emergency.id,
            title=(
                f"{emergency.emergency_type} — "
                f"{emergency.location}"
            ),
            message=(
                f"{emergency.emergency_type} reported at "
                f"{emergency.location}. "
                f"Incident {emergency.incident_code} "
                f"requires attention."
            ),
            notification_type="emergency",
            priority=(
                "critical"
                if emergency.severity == "critical"
                else "high"
            ),
        )

        db.add(notification)

    db.commit()

    return {
        "message": "Emergency incident created successfully",
        "emergency": {
            "id": str(emergency.id),
            "incident_code": emergency.incident_code,
            "emergency_type": emergency.emergency_type,
            "description": emergency.description,
            "location": emergency.location,
            "severity": emergency.severity,
            "status": emergency.status,
            "reported_by": (
                str(emergency.reported_by)
                if emergency.reported_by
                else None
            ),
            "mission_id": (
                str(emergency.mission_id)
                if emergency.mission_id
                else None
            ),
            "reported_at": emergency.reported_at,
        }
    }


# =========================================================
# UPDATE EMERGENCY STATUS
# =========================================================

@router.patch("/{emergency_id}/status")
def update_emergency_status(
    emergency_id: str,
    status_data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "programme_admin",
            "operations_director",
            "station_leader",
        )
    )
):
    emergency = (
        db.query(Emergency)
        .filter(Emergency.id == emergency_id)
        .first()
    )

    if not emergency:
        raise HTTPException(
            status_code=404,
            detail="Emergency incident not found"
        )

    new_status = status_data.get("status")

    if not new_status:
        raise HTTPException(
            status_code=400,
            detail="Status is required"
        )

    allowed_statuses = {
        "open",
        "assessing",
        "response_in_progress",
        "resolved",
    }

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid emergency status"
        )

    emergency.status = new_status

    if new_status == "resolved":
        from datetime import datetime, timezone

        emergency.resolved_at = datetime.now(timezone.utc)

    else:
        emergency.resolved_at = None

    db.commit()
    db.refresh(emergency)

    return {
        "message": "Emergency status updated successfully",
        "emergency": {
            "id": str(emergency.id),
            "incident_code": emergency.incident_code,
            "status": emergency.status,
            "resolved_at": emergency.resolved_at,
            "updated_at": emergency.updated_at,
        }
    }
@router.get("/{emergency_id}/resources")
def get_emergency_resources(
    emergency_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    emergency = (
        db.query(Emergency)
        .filter(Emergency.id == emergency_id)
        .first()
    )

    if not emergency:
        raise HTTPException(
            status_code=404,
            detail="Emergency incident not found"
        )

    station_name = (emergency.location or "").lower()

    if "maitri" in station_name:
        station = "maitri"
    elif "bharati" in station_name:
        station = "bharati"
    else:
        station = None

    query = db.query(User)

    if station:
        query = query.filter(User.station == station)

    people = query.all()

    resources = []

    relevant_types = {
        "medical_officer",
        "engineer",
        "technician",
        "logistics",
        "support_staff",
        "crew",
    }

    for person in people:
        if person.personnel_type not in relevant_types:
            continue

        resources.append(
            {
                "id": str(person.id),
                "name": person.full_name,
                "email": person.email,
                "role": person.role,
                "personnel_type": person.personnel_type,
                "station": person.station,
            }
        )

    return {
        "emergency_id": str(emergency.id),
        "incident_code": emergency.incident_code,
        "location": emergency.location,
        "resources": resources,
    }