from datetime import date, datetime, timezone
from app.models import Notification, Transaction, Budget, Goal, FinancialSummary, TransactionType
from collections import defaultdict
from app import file_storage
import logging

logger = logging.getLogger(__name__)

# Initialize storage by loading from files
# If files are empty, use seed data for first-time setup
def _initialize_storage():
    """Load data from files, or use seed data if files are empty."""
    global transactions, budgets, goals, notifications
    global _tx_auto_id, _budget_auto_id, _goal_auto_id, _notification_counter

    # Try to load from files
    transactions = file_storage.load_transactions()
    budgets = file_storage.load_budgets()
    goals = file_storage.load_goals()
    notifications = file_storage.load_notifications()

    # If files are empty, use seed data for first-time setup
    if not transactions:
        transactions = [
            Transaction(id=1, amount=12.5, category="coffee", date=date(2025, 12, 1), description="Morning latte", type="EXPENSE"),
            Transaction(id=2, amount=45.0, category="groceries", date=date(2025, 12, 2), description="Weekly shop", type="EXPENSE"),
            Transaction(id=3, amount=1200.0, category="rent", date=date(2025, 12, 1), description="Monthly rent", type="EXPENSE"),
        ]
        file_storage.save_transactions(transactions)

    if not budgets:
        budgets = [
            Budget(id=1, name="Monthly Groceries", monthly_limit=400.0, alert_threshold=0.9, category="groceries", spent_this_month=400.0),
            Budget(id=2, name="Entertainment Budget", monthly_limit=50.0, alert_threshold=0.7, category="entertainment", spent_this_month=0.0),
            Budget(id=3, name="Transport Budget", monthly_limit=1200.0, alert_threshold=0.8, category="transport", spent_this_month=0.0),
            Budget(id=4, name="Rent", monthly_limit=1200.0, alert_threshold=1.0, category="rent", spent_this_month=1200.0),
            Budget(id=5, name="Utilities", monthly_limit=120.0, alert_threshold=0.7, category="utilities", spent_this_month=65.5),
        ]
        file_storage.save_budgets(budgets)

    if not goals:
        goals = [
            Goal(id=1, name="Emergency Fund", target_amount=1000.0, saved_amount=200.0, target_date=date(2025, 12, 31), description="Emergency fund for unexpected expenses"),
            Goal(id=2, name="Vacation", target_amount=1500.0, saved_amount=300.0, target_date=date(2026, 6, 30), description="Vacation fund for summer trip"),
            Goal(id=3, name="New Laptop", target_amount=2000.0, saved_amount=500.0, target_date=date(2026, 3, 31), description="Saving for a new laptop"),
        ]
        file_storage.save_goals(goals)

    # notifications can be empty on first run
    file_storage.save_notifications(notifications)

    # Sync auto-increment IDs with loaded data
    _tx_auto_id = max((tx.id for tx in transactions), default=0) + 1
    _budget_auto_id = max((b.id for b in budgets), default=0) + 1
    _goal_auto_id = max((g.id for g in goals), default=0) + 1
    _notification_counter = max((n.id for n in notifications), default=0) + 1

    logger.info(f"Storage initialized: {len(transactions)} transactions, {len(budgets)} budgets, {len(goals)} goals, {len(notifications)} notifications")

# Initialize global lists
transactions: list[Transaction] = []
budgets: list[Budget] = []
goals: list[Goal] = []
notifications: list[Notification] = []
_tx_auto_id = 1
_budget_auto_id = 1
_goal_auto_id = 1
_notification_counter = 1

# Load data on module import
_initialize_storage()


def add_transaction(tx_data) -> Transaction:
    global _tx_auto_id
    tx = Transaction(id=_tx_auto_id, **tx_data.dict())
    _tx_auto_id += 1
    transactions.append(tx)

    # Persist to file
    file_storage.save_transactions(transactions)

    # Update budget spending if expense
    if tx.type == TransactionType.EXPENSE and tx.category:
        for idx, b in enumerate(budgets):
            if b.category.lower() == tx.category.lower():
                # Increase spent_this_month
                updated_budget = b.model_copy(
                    update={
                        "spent_this_month": b.spent_this_month + abs(tx.amount)
                    }
                )
                budgets[idx] = updated_budget
                break  # one transaction matches only one budget

        # Persist updated budgets to file
        file_storage.save_budgets(budgets)

    return tx


def list_transactions() -> list[Transaction]:
    return list(transactions)


def add_budget(budget_data) -> Budget:
    global _budget_auto_id
    b = Budget(id=_budget_auto_id, **budget_data.dict())
    _budget_auto_id += 1
    budgets.append(b)
    # Persist to file
    file_storage.save_budgets(budgets)
    return b

def list_budgets() -> list[Budget]:
    return list(budgets)

def add_goal(goal_data) -> Goal:
    global _goal_auto_id
    g = Goal(id=_goal_auto_id, **goal_data.dict())
    _goal_auto_id += 1
    goals.append(g)
    # Persist to file
    file_storage.save_goals(goals)
    return g

def list_goals() -> list[Goal]:
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
            # Persist to file
            file_storage.save_goals(goals)
            return updated_goal
    raise ValueError("Goal not found") # In real code, raise HTTPException with 404 status

def update_budget(budget_id: int, budget_data) -> Budget:
    for idx, b in enumerate(budgets):
        if b.id == budget_id:
            updated_budget = b.model_copy(update=budget_data.dict())
            budgets[idx] = updated_budget
            # Persist to file
            file_storage.save_budgets(budgets)
            return updated_budget
    raise ValueError("Budget not found") # In real code, raise HTTPException with 404 status


def add_notification(notification_type: str, title: str, message: str) -> Notification:
    global _notification_counter

    print("Inside add_notification")
    n = Notification(
        id=_notification_counter,
        notification_type=notification_type,
        title=title,
        message=message,
        created_at=datetime.now(timezone.utc),
        read=False
    )
    _notification_counter += 1
    notifications.insert(0, n)
    # Persist to file
    file_storage.save_notifications(notifications)
    print("🔔 Notification added:", n)
    return n

def list_notifications():
    return notifications

def mark_read(id) -> Notification | None:
    for n in notifications:
        if n.id == id:
            n.read = True
            # Persist to file
            file_storage.save_notifications(notifications)
            return n
    return None
        


def get_budget_spending(category: str):
    """
    Returns (spent, limit, alert_threshold) for a given category.
    If no budget exists, returns (0, 0, 0).
    """
    for b in budgets:
        if b.category == category:
            return (
                b.spent_this_month,
                b.monthly_limit,
                b.alert_threshold
            )
    return (0.0, 0.0, 0.0)


def get_goals_due_between(start: date, end: date):
    """
    Returns goals whose target_date is between start and end (inclusive).
    """
    due_goals = []
    for g in goals:
        if start <= g.target_date <= end:
            due_goals.append({
                "id": g.id,
                "title": g.name,
                "due_date": g.target_date,
                "saved_amount": g.saved_amount,
                "target_amount": g.target_amount,
            })
    return due_goals

def get_balance() -> float:
    total_income = sum(
        tx.amount for tx in transactions if tx.type == TransactionType.INCOME
    )
    total_expense = sum(
        abs(tx.amount) for tx in transactions if tx.type == TransactionType.EXPENSE
    )
    return total_income - total_expense

def get_monthly_income_expense(start: date, end: date):
    """
    Returns:
    [
      { "month": "Jan", "income": 0, "expense": 0 },
      ...
    ]
    """
    monthly = defaultdict(lambda: {"income": 0.0, "expense": 0.0})

    for tx in transactions:
        if start <= tx.date <= end:
            month = tx.date.strftime("%b")
            if tx.type == TransactionType.INCOME:
                monthly[month]["income"] += tx.amount
            else:
                monthly[month]["expense"] += abs(tx.amount)

    # ensure months order
    ordered_months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

    result = []
    for m in ordered_months:
        result.append({
            "month": m,
            "income": monthly[m]["income"],
            "expense": monthly[m]["expense"],
        })

    return result