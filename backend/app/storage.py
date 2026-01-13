from typing import List, Dict
from datetime import date
from app.models import Transaction, Budget, Goal, FinancialSummary

_tx_auto_id = 1
_budget_auto_id = 1
_goal_auto_id = 1

transactions: List[Transaction] = [
    Transaction(id=1, amount=12.5, category="coffee", date=date(2025, 12, 1), description="Morning latte"),
    Transaction(id=2, amount=45.0, category="groceries", date=date(2025, 12, 2), description="Weekly shop"),
    Transaction(id=3, amount=1200.0, category="rent", date=date(2025, 12, 1), description="Monthly rent"),
]
budgets: List[Budget] = [
    Budget(id=1, name="groceries", amount=400.0),
    Budget(id=2, name="coffee", amount=50.0),
    Budget(id=3, name="rent", amount=1200.0),
]
goals: List[Goal] = [
    Goal(id=1, name="Emergency Fund", target_amount=1000.0, saved_amount=200.0),
    Goal(id=2, name="Vacation", target_amount=1500.0, saved_amount=300.0),
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
    total_spent = sum(tx.amount for tx in transactions)
    return FinancialSummary(
        total_spent=total_spent,
        transactions_count=len(transactions),
        budgets=list(budgets),
        goals=list(goals),
    )
