from datetime import datetime
from typing import Dict, Any
from app.db import db_transaction
from app.models import Notification


def add_notification(notification_type: str, title: str, message: str) -> Dict[str, Any]:
    created_at = datetime.now().isoformat()
    with db_transaction() as cursor:
        cursor.execute(
            "INSERT INTO notifications (notification_type, title, message, read, created_at) VALUES (?, ?, ?, ?, ?)",
            (notification_type, title, message, 0, created_at),
        )
        return {
            "id": cursor.lastrowid, 
            "type": notification_type, 
            "title": title, 
            "message": message, 
            "read": 0, 
            "created_at": created_at
        }


def list_notifications(limit: int = 50) -> list[Notification]:
    with db_transaction() as cursor:
        cursor.execute("SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?", (limit,))
        return [Notification(**dict(r)) for r in cursor.fetchall()]



def delete_notification(notification_id: int) -> bool:
    with db_transaction() as cursor:
        cursor.execute("DELETE FROM notifications WHERE id = ?", (notification_id,))
        return cursor.rowcount > 0


def clear_notifications() -> None:
    with db_transaction() as cursor:
        cursor.execute("DELETE FROM notifications")

def mark_notification_as_read(notification_id: int) -> bool:
    with db_transaction() as cursor:
        cursor.execute("UPDATE notifications SET read = 1 WHERE id = ?", (notification_id,))
        return cursor.rowcount > 0

def mark_all_notifications_as_read() -> None:
    with db_transaction() as cursor:
        cursor.execute("UPDATE notifications SET read = 1")