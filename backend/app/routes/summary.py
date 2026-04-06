from datetime import date
from fastapi import APIRouter
from app.models import FinancialSummary
from app.repositories import summary_repo as storage

router = APIRouter()


@router.get("", response_model=FinancialSummary)
def get_summary():
    return storage.get_financial_summary()

@router.get("/financial-chart")
def financial_chart(start: date, end: date):
    return storage.get_monthly_income_expense(start, end)