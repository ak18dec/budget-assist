from typing import List, Dict, Any
from app.repositories import notifications_repo, budgets_repo, transactions_repo, goals_repo

from datetime import date, timedelta
from app.models import Goal
import logging
from typing import Callable, Dict, Any, List
from threading import Lock

logger = logging.getLogger(__name__)

_handlers: Dict[str, List[Callable[[Dict[str, Any]], Any]]] = {}
_lock = Lock()

def register(event_name: str, handler: Callable[[Dict[str, Any]], Any]):
    with _lock:
        _handlers.setdefault(event_name, []).append(handler)
        logger.debug(f"Registered handler for event: {event_name}")


def emit(event_name: str, payload: Dict[str, Any]):
    logger.info(f"Event emitted: {event_name}")
    handlers = _handlers.get(event_name, [])
    logger.debug(f"Found {len(handlers)} handlers for {event_name}")
    results = []
    for h in handlers:
        try:
            results.append(h(payload))
        except Exception as e:
            logger.error(f"Error in handler for {event_name}: {e}")
            results.append({"error": str(e)})
    return results

# ---------------------------
# Event Handlers
# ---------------------------

def on_transaction_created(payload: Dict[str, Any]):
    """
    Handle transaction.created events.
    Receives a dict payload with transaction data.
    Rules:
    1. Transaction > 500 → notify
    2. Budget threshold reached → notify
    3. Budget exceeded → notify
    4. Balance negative → notify
    """

    tx = payload
    logger.info(f"Processing transaction created event: {tx}")

    # 1 Large transaction rule
    if tx.get("amount", 0) > 500:
        logger.warning("⚠️ Large transaction recorded")
        notifications_repo.add_notification(
            notification_type="transaction.large",
            title="Large Transaction",
            message=f"A transaction of {tx['amount']} was added in {tx.get('category', 'Unknown')}"
        )

    # 2 Budget threshold / exceeded rules (triggered automatically by SQLite trigger)
    category = tx.get("category")
    if category:
        budget = budgets_repo.get_budget_by_category(category)
        logger.debug(f"Checking budget for category '{category}': {budget}")
        if not budget:
            logger.warning(f"No budget found for category: {category}")
            return
        spending = budget.spent_this_month
        limit = budget.monthly_limit
        alert_threshold = budget.alert_threshold
        # alert threshold (e.g., 80%)
        if spending >= alert_threshold * limit:
            logger.info(f"Budget threshold reached for {category}")
            notifications_repo.add_notification(
                notification_type="budget.threshold",
                title=f"{category} Budget Alert",
                message=f"Your spending has reached {spending}/{limit} ({spending/limit*100:.0f}%)"
            )
        # exceeded limit
        if spending >= limit:
            logger.warning(f"Budget exceeded for {category}")
            notifications_repo.add_notification(
                notification_type="budget.exceeded",
                title=f"{category} Budget Exceeded",
                message=f"You have exceeded your budget of {limit} for {category}!"
            )

    # 4 Balance negative
    check_negative_balance()

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

    upcoming_goals: list[Goal] = goals_repo.get_goals_due_between(
        start=today - timedelta(days=30),  # include overdue
        end=today + timedelta(days=max_days)
    )

    for goal in upcoming_goals:
        delta_days = (goal.target_date - today).days
        if delta_days > max_days:
            continue

        message = goal_due_message(goal, locale="IN")

        notifications_repo.add_notification(
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
    balance = transactions_repo.get_balance()
    if balance < 0:
        logger.error(f"Negative balance detected: {balance}")
        notifications_repo.add_notification(
            notification_type="balance.negative",
            title="Negative Balance",
            message=f"Your total balance is negative: {balance}"
        )

# ---------------------------
# Register handlers
# ---------------------------
def setup_event_handlers():
    logger.info("Registering notification event handlers")
    register("transaction.created", on_transaction_created)
    register("goal.check_due", on_goal_due_check)