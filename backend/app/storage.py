from typing import List, Dict
from datetime import date
from app.models import Transaction, Budget, Goal, FinancialSummary, TransactionType

_tx_auto_id = 1
_budget_auto_id = 1
_goal_auto_id = 1

transactions: List[Transaction] = [
    Transaction(id=1, amount=12.5, category="coffee", date=date(2025, 12, 1), description="Morning latte", type="EXPENSE"),
    Transaction(id=2, amount=45.0, category="groceries", date=date(2025, 12, 2), description="Weekly shop", type="EXPENSE"),
    Transaction(id=3, amount=1200.0, category="rent", date=date(2025, 12, 1), description="Monthly rent", type="EXPENSE"),
]
budgets: List[Budget] = [
    Budget(id=1, name="Monthly Groceries", monthly_limit=400.0, alert_threshold=0.9, category="groceries", spent_this_month=400.0),
    Budget(id=2, name="Entertainment Budget", monthly_limit=50.0, alert_threshold=0.7, category="entertainment", spent_this_month=0.0),
    Budget(id=3, name="Transport Budget", monthly_limit=1200.0, alert_threshold=0.8, category="transport", spent_this_month=0.0),
    Budget(id=4, name="Rent", monthly_limit=1200.0, alert_threshold=1.0, category="rent", spent_this_month=1200.0),
    Budget(id=5, name="Utilities", monthly_limit=120.0, alert_threshold=0.7, category="utilities", spent_this_month=65.5),
]
goals: List[Goal] = [
    Goal(id=1, name="Emergency Fund", target_amount=1000.0, saved_amount=200.0, target_date=date(2025, 12, 31), description="Emergency fund for unexpected expenses"),
    Goal(id=2, name="Vacation", target_amount=1500.0, saved_amount=300.0, target_date=date(2026, 6, 30), description="Vacation fund for summer trip"),
    Goal(id=3, name="New Laptop", target_amount=2000.0, saved_amount=500.0, target_date=date(2026, 3, 31), description="Saving for a new laptop"),
]

# keep auto ids in sync with seeded data
_tx_auto_id = max(tx.id for tx in transactions) + 1
_budget_auto_id = max(b.id for b in budgets) + 1
_goal_auto_id = max(g.id for g in goals) + 1


def add_transaction(tx_data) -> Transaction:
    global _tx_auto_id
    tx = Transaction(id=_tx_auto_id, **tx_data.dict())
    _tx_auto_id += 1
    transactions.append(tx)
    return tx


def list_transactions() -> List[Transaction]:
    return list(transactions)


def add_budget(budget_data) -> Budget:
    global _budget_auto_id
    b = Budget(id=_budget_auto_id, **budget_data.dict())
    _budget_auto_id += 1
    budgets.append(b)
    return b

def list_budgets() -> List[Budget]:
    return list(budgets)

def add_goal(goal_data) -> Goal:
    global _goal_auto_id
    g = Goal(id=_goal_auto_id, **goal_data.dict())
    _goal_auto_id += 1
    goals.append(g)
    return g

def list_goals() -> List[Goal]:
    return list(goals)

def get_financial_summary() -> FinancialSummary:
    total_income = sum(
        tx.amount for tx in transactions if tx.type == TransactionType.INCOME
    )

    total_expense = sum(
        abs(tx.amount) for tx in transactions if tx.type == TransactionType.EXPENSE
    )

    total_balance = total_income - total_expense

    return FinancialSummary(
        total_balance=total_balance,
        total_income=total_income,
        total_expense=total_expense,
        transactions_count=len(transactions),
        budgets=list(budgets),
        goals=list(goals),
    )

def update_goal(goal_id: int, goal_data) -> Goal:
    for idx, g in enumerate(goals):
        if g.id == goal_id:
            updated_goal = g.model_copy(update=goal_data.dict())
            goals[idx] = updated_goal
            return updated_goal
    raise ValueError("Goal not found") # In real code, raise HTTPException with 404 status

def update_budget(budget_id: int, budget_data) -> Budget:
    for idx, b in enumerate(budgets):
        if b.id == budget_id:
            updated_budget = b.model_copy(update=budget_data.dict())
            budgets[idx] = updated_budget
            return updated_budget
    raise ValueError("Budget not found") # In real code, raise HTTPException with 404 status