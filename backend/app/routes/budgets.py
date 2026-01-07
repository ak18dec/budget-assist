from fastapi import APIRouter
from app import storage, models

router = APIRouter()


@router.post("/", response_model=models.Budget)
def create_budget(budget: models.Budget):
    created = storage.add_budget(budget)
    return created
