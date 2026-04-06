from fastapi import APIRouter, HTTPException
from app.repositories import notifications_repo as storage
from app.models import Notification

router = APIRouter()

@router.get("", include_in_schema=False, response_model=list[Notification])
@router.get("", response_model=list[Notification])
def get_notifications():
    return storage.list_notifications()

@router.post("/{notification_id}/read")
def mark_notification_read(notification_id: int):
    n = storage.mark_read(notification_id)
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"ok": True}
