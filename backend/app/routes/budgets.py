from fastapi import APIRouter
from typing import List
from app import storage, models

router = APIRouter()


@router.post("/", response_model=models.Budget)
def create_budget(budget: models.BudgetBase):
    created = storage.add_budget(budget)
    return created

@router.get("/", response_model=List[models.Budget])
def get_budgets():
    return storage.list_budgets()