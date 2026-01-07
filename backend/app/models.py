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


class Budget(BaseModel):
    id: int
    name: str
    amount: float


class Goal(BaseModel):
    id: int
    name: str
    target_amount: float
    saved_amount: float = 0.0


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
