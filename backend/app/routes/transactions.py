from fastapi import APIRouter, HTTPException
from typing import List
from app import storage
from app import models
from app.agents import eventing
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=models.Transaction)
def create_transaction(tx: models.TransactionBase):
    created = storage.add_transaction(tx)

    payload = {
        "id": created.id,
        "amount": created.amount,
        "category": created.category,
        "type": created.type,
        "date": created.date,
        "description": created.description,
    }

    logger.info(f"Emitting transaction.created event for transaction {created.id}")

    # Emit event for new transaction
    eventing.emit("transaction.created", payload)

    return created


@router.get("/", response_model=List[models.Transaction])
def get_transactions():
    return storage.list_transactions()
