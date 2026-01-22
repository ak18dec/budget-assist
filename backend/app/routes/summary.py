from datetime import date
from fastapi import APIRouter
from app import storage, models

router = APIRouter()


@router.get("/", response_model=models.FinancialSummary)
def get_summary():
    return storage.get_financial_summary()

@router.get("/financial-chart")
def financial_chart(start: date, end: date):
    return storage.get_monthly_income_expense(start, end)