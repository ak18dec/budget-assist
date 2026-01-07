from fastapi import APIRouter
from app import storage, models

router = APIRouter()


@router.get("/", response_model=models.FinancialSummary)
def get_summary():
    return storage.get_financial_summary()
