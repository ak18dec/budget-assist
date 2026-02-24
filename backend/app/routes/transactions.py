from fastapi import APIRouter
from app.repositories import transactions_repo as storage
from app.models import Transaction, TransactionBase
from app.agents import notification_engine as eventing
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=Transaction)
def create_transaction(tx: TransactionBase):
    transaction = TransactionBase(**tx.model_dump())  # Validate input and create Transaction instance
    created = storage.add_transaction(transaction)

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


@router.get("/", response_model=list[Transaction])
def get_transactions():
    return storage.list_transactions()
