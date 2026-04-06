from fastapi import APIRouter
from app.models import Budget, BudgetBase
from app.repositories import budgets_repo as storage
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=Budget)
def create_budget(budget: BudgetBase):
    created = storage.add_budget(budget)
    # # Sync RAG with updated budget data
    # try:
    #     rag.sync_financial_data()
    #     logger.info(f"RAG synced after budget creation: {created.name}")
    # except Exception as e:
    #     logger.warning(f"Failed to sync RAG after budget creation: {e}")
    return created

@router.get("", response_model=list[Budget])
def get_budgets():
    return storage.list_budgets()

@router.put("/{budget_id}", response_model=Budget)
def update_budget(budget_id: int, budget: BudgetBase):
    updated = storage.update_budget(budget_id, budget)
    # # Sync RAG with updated budget data
    # try:
    #     rag.sync_financial_data()
    #     logger.info(f"RAG synced after budget update: {updated.name}")
    # except Exception as e:
    #     logger.warning(f"Failed to sync RAG after budget update: {e}")
    return updated