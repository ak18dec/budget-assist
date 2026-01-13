from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date


class TransactionBase(BaseModel):
    amount: float
    category: str
    date: date
    description: Optional[str] = None


class Transaction(TransactionBase):
    id: int


class BudgetBase(BaseModel):
    name: str
    amount: float

class Budget(BudgetBase):
    id: int

class GoalBase(BaseModel):
    name: str
    target_amount: float
    saved_amount: float = 0.0

class Goal(GoalBase):
    id: int

class FinancialSummary(BaseModel):
    total_spent: float
    transactions_count: int
    budgets: List[Budget]
    goals: List[Goal]


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


class IntentResponse(BaseModel):
    intent: str
    entities: dict = Field(default_factory=dict)
