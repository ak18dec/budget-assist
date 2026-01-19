from fastapi import APIRouter, HTTPException
from typing import List
from app.storage import list_notifications, mark_read
from app.models import Notification

router = APIRouter()

@router.get("", include_in_schema=False, response_model=List[Notification])
@router.get("/", response_model=List[Notification])
def get_notifications():
    return list_notifications()

@router.post("/{notification_id}}/read")
def mark_notification_read(notification_id: int):
    n = mark_read(notification_id)
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"ok": True}
