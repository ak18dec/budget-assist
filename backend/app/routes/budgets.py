from fastapi import APIRouter
from typing import List
from app import storage, models, rag
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=models.Budget)
def create_budget(budget: models.BudgetBase):
    created = storage.add_budget(budget)
    # Sync RAG with updated budget data
    try:
        rag.sync_financial_data()
        logger.info(f"RAG synced after budget creation: {created.name}")
    except Exception as e:
        logger.warning(f"Failed to sync RAG after budget creation: {e}")
    return created

@router.get("/", response_model=List[models.Budget])
def get_budgets():
    return storage.list_budgets()

@router.put("/{budget_id}", response_model=models.Budget)
def update_budget(budget_id: int, budget: models.BudgetBase):
    updated = storage.update_budget(budget_id, budget)
    # Sync RAG with updated budget data
    try:
        rag.sync_financial_data()
        logger.info(f"RAG synced after budget update: {updated.name}")
    except Exception as e:
        logger.warning(f"Failed to sync RAG after budget update: {e}")
    return updated