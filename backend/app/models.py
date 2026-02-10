from enum import Enum
from pydantic import BaseModel, Field, field_validator, computed_field
from typing import Optional, List
from datetime import date, datetime
import uuid


class TransactionType(str, Enum):
    EXPENSE = 'EXPENSE'
    INCOME = 'INCOME'

class TransactionBase(BaseModel):
    amount: float
    category: str
    date: date
    description: Optional[str] = None
    type: TransactionType

class Transaction(TransactionBase):
    id: int


class BudgetBase(BaseModel):
    name: str
    category: str
    monthly_limit: float
    alert_threshold: float

    @field_validator('alert_threshold')
    def validate_alert_threshold(cls, v):
        if not (0 < v <= 1):
            raise ValueError('alert_threshold must be between 0 (exclusive) and 1 (inclusive)')
        return v
    
    @field_validator('monthly_limit')
    def validate_monthly_limit(cls, v):
        if v <= 0:
            raise ValueError('monthly_limit must be greater than 0')
        return v

class Budget(BudgetBase):
    id: int
    spent_this_month: float = 0.0

    def calculate_budget_used(self) -> float:
        return min(1.0, self.spent_this_month / self.monthly_limit if self.monthly_limit else 0)
    
    @computed_field
    def remaining_budget(self) -> float:
        return max(0.0, self.monthly_limit - self.spent_this_month)
    
    @computed_field
    def budget_used_percentage(self) -> float:
        return self.calculate_budget_used()
    
    @computed_field
    def is_over_threshold(self) -> bool:
        return self.calculate_budget_used() >= self.alert_threshold 
    


class GoalBase(BaseModel):
    name: str
    target_amount: float
    saved_amount: float = 0.0
    target_date: Optional[date] = None
    description: Optional[str] = None

class Goal(GoalBase):
    id: int

class FinancialSummary(BaseModel):
    total_balance: float
    total_income: float
    total_expense: float
    transactions_count: int
    budgets: List[Budget]
    goals: List[Goal]


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    tool: Optional[str] = None
    tool_result: Optional[dict] = None
    intent: Optional[dict] = None
    context_used: Optional[List[str]] = None
    timestamp: datetime = Field(default_factory=datetime.now)


class ConversationTurn(BaseModel):
    """Represents a single turn in a conversation."""
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)


class IntentResponse(BaseModel):
    intent: str
    entities: dict = Field(default_factory=dict)

class Notification(BaseModel):
    id: int
    notification_type: str
    title: str
    message: str
    created_at: datetime
    read: bool = False