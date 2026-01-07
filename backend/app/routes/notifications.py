from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import List
from app.agents import notifier

router = APIRouter()


class WebhookIn(BaseModel):
    url: HttpUrl


class WebhookOut(BaseModel):
    id: int
    url: HttpUrl


@router.post("/webhooks", response_model=WebhookOut)
def add_webhook(h: WebhookIn):
    entry = notifier.register_webhook(str(h.url))
    return WebhookOut(**entry)


@router.get("/webhooks", response_model=List[WebhookOut])
def list_webhooks():
    return notifier.list_webhooks()


@router.delete("/webhooks/{hook_id}")
def delete_webhook(hook_id: int):
    ok = notifier.remove_webhook(hook_id)
    if not ok:
        raise HTTPException(status_code=404, detail="webhook not found")
    return {"ok": True}
