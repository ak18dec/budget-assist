from fastapi import APIRouter, HTTPException
from typing import List
from app import storage
from app import models
from app.agents import eventing

router = APIRouter()


@router.post("/", response_model=models.Transaction)
def create_transaction(tx: models.TransactionBase):
    created = storage.add_transaction(tx)
    # Emit event for new transaction
    eventing.emit("transaction.created", {"transaction": created.model_dump()})
    return created


@router.get("/", response_model=List[models.Transaction])
def get_transactions():
    return storage.list_transactions()
