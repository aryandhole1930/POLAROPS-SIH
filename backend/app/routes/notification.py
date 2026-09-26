from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies import get_current_user
from app.models.models import Notification


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# =========================================================
# GET CURRENT USER NOTIFICATIONS
# =========================================================

@router.get("/")
def get_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )

    return {
        "notifications": [
            {
                "id": str(notification.id),
                "emergency_id": (
                    str(notification.emergency_id)
                    if notification.emergency_id
                    else None
                ),
                "title": notification.title,
                "message": notification.message,
                "notification_type": notification.notification_type,
                "priority": notification.priority,
                "is_read": notification.is_read,
                "created_at": notification.created_at,
                "read_at": notification.read_at,
            }
            for notification in notifications
        ]
    }
# =========================================================
# MARK NOTIFICATION AS READ
# =========================================================

@router.patch("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
        .first()
    )

    if not notification:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    from datetime import datetime, timezone

    notification.is_read = True
    notification.read_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(notification)

    return {
        "message": "Notification marked as read",
        "notification": {
            "id": str(notification.id),
            "is_read": notification.is_read,
            "read_at": notification.read_at,
        }
    }