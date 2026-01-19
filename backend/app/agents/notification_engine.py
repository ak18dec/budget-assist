from typing import List
from app.storage import (
    add_notification, 
    transactions, 
    get_budget_spending, 
    get_goals_due_between, 
    get_balance
)
from datetime import date, timedelta
from app.agents import eventing
from app.models import Goal, Transaction

# ---------------------------
# Event Handlers
# ---------------------------

def on_transaction_created(tx: Transaction):
    print("🟢 on_transaction_created called", tx)
    """
    Handle transaction.created events.
    Rules:
    1. Transaction > 500 → notify
    2. Budget threshold reached → notify
    3. Budget exceeded → notify
    4. Balance negative → notify
    """

    # 1 Large transaction rule
    if tx.get("amount", 0) > 500:
        print("⚠️A large transaction is recorded...")
        add_notification(
            notification_type="transaction.large",
            title="Large Transaction",
            message=f"A transaction of {tx['amount']} was added in {tx.get('category', 'Unknown')}"
        )
    
    # 2 Budget threshold / exceeded rules
    category = tx.get("category")
    if category:
        spending, limit, alert_threshold = get_budget_spending(category)
        # alert threshold (e.g., 80%)
        if spending >= alert_threshold * limit:
            add_notification(
                notification_type="budget.threshold",
                title=f"{category} Budget Alert",
                message=f"Your spending has reached {spending}/{limit} ({spending/limit*100:.0f}%)"
                # f"{tx['category']} budget has reached {int(percent)}%"
            )
        # exceeded limit
        if spending >= limit:
            add_notification(
                notification_type="budget.exceeded",
                title=f"{category} Budget Exceeded",
                message=f"You have exceeded your budget of {limit} for {category}!"
            )

    # 4 Balance negative
    balance = get_balance()
    if balance < 0:
        add_notification(
            notification_type="balance.negative",
            title="Negative Balance",
            message=f"Your total balance is negative: {balance}"
        )


# ---------------------------
# Goal due date handler
# ---------------------------
def on_goal_due_check():
    """
    Check all goals due within 5 days and notify.
    Triggered by cron or event.
    """
    today = date.today()
    max_days = 5

    upcoming_goals: List[Goal] = get_goals_due_between(
        start=today - timedelta(days=30),  # include overdue
        end=today + timedelta(days=max_days)
    )

    for goal in upcoming_goals:
        delta_days = (goal.target_date - today).days
        if delta_days > max_days:
            continue

        message = goal_due_message(goal, locale="IN")

        add_notification(
            notification_type="goal.due_soon",
            title=f"Goal Due Soon: {goal.name}",
            message=message
        )

def format_date_local(date_obj, locale="IN"):
    """
    locale: 'IN' or 'US'
    """
    if locale == "US":
        return date_obj.strftime("%b %d")      # Jan 22 (US)
    return date_obj.strftime("%d %b")          # 22 Jan (India)

def goal_due_message(goal, locale="IN"):
    today = date.today()
    due_date = goal.target_date

    delta_days = (due_date - today).days
    formatted_date = format_date_local(due_date, locale)

    if delta_days == 0:
        return f"Goal '{goal.name}' is due today ({formatted_date})"

    if delta_days == 1:
        return f"Goal '{goal.name}' is due tomorrow ({formatted_date})"

    if delta_days > 1:
        return f"Goal '{goal.name}' is due in {delta_days} days ({formatted_date})"

    # Overdue
    overdue_days = abs(delta_days)
    if overdue_days == 1:
        return f"Goal '{goal.name}' was due yesterday ({formatted_date})"

    return f"Goal '{goal.name}' was due {overdue_days} days ago ({formatted_date})"


# Rule 4 Expenses exceed income (balance negative)
def check_negative_balance():
    income = transactions.total_income()
    expense = transactions.total_expense()

    if expense > income:
        add_notification(
            "balance.negative",
            "Negative Balance",
            "Your expenses exceed your income"
        )


# ---------------------------
# Register handlers
# ---------------------------
def setup_event_handlers():
    print("✅ Registering notification event handlers")
    eventing.register("transaction.created", on_transaction_created)
    eventing.register("goal.check_due", on_goal_due_check)