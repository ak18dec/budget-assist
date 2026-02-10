from app import storage, models
from datetime import date, datetime, timedelta
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

# --- Helper to parse date safely --- #
def _parse_date(d: Any) -> date:
    if not d:
        return date.today()
    if isinstance(d, date):
        return d
    try:
        return datetime.fromisoformat(str(d)).date()
    except Exception:
        return date.today()

# --- Expense --- #
def add_transaction_tool(entities: Dict[str, Any]) -> Dict[str, Any]:
    amount = entities.get("amount")
    category = entities.get("category", "misc")
    d = _parse_date(entities.get("date"))
    if amount is None:
        return {"ok": False, "error": "Missing amount"}

    logger.info(f"Adding transaction: ${amount} in {category} on {d}")
    tx_base = models.TransactionBase(amount=float(amount), category=category, date=d, type=models.TransactionType.EXPENSE)
    tx = storage.add_transaction(tx_base)
    return {"ok": True, "transaction": tx.model_dump()}

# --- Income --- #
def add_income_tool(entities: Dict[str, Any]) -> Dict[str, Any]:
    amount = entities.get("amount")
    d = _parse_date(entities.get("date"))

    if amount is None:
        return {"ok": False, "error": "Missing amount"}

    logger.info(f"Adding income: ${amount} on {d}")
    income_base = models.TransactionBase(amount=float(amount), category="income", date=d, type=models.TransactionType.INCOME)
    tx = storage.add_transaction(income_base)  # reuse storage for simplicity
    return {"ok": True, "transaction": tx.model_dump()}

# --- Goal contribution --- #
def add_goal_contribution_tool(entities: Dict[str, Any]) -> Dict[str, Any]:
    goal_name = entities.get("goal_name")
    amount = entities.get("amount")

    if not goal_name:
        return {"ok": False, "error": "Missing goal name"}

    if amount is None:
        return {"ok": False, "error": "Missing amount"}

    # find goal by name (case-insensitive exact match)
    goal = next((g for g in storage.goals if g.name.lower() == goal_name.lower()), None)
    if not goal:
        logger.warning(f"Goal '{goal_name}' not found")
        return {"ok": False, "error": f"Goal '{goal_name}' not found"}

    # Update goal's saved amount
    goal.saved_amount += float(amount)
    logger.info(f"Added ${amount} to goal '{goal_name}'")

    return {
        "ok": True,
        "goal": {
            "id": goal.id,
            "name": goal.name,
            "saved": goal.saved_amount,
            "target": goal.target_amount,
            "amount": amount
        },
    }

# --- Queries --- #
def get_budget_status_tool(_: Dict[str, Any] = None) -> Dict[str, Any]:
    # Match budgets to categories using exact matching (case-insensitive)
    data = []
    for b in storage.budgets:
        # Exact match: normalize budget category to lowercase
        budget_category = (b.category or "").lower() if hasattr(b, 'category') else (b.name or "").lower()
        spent = 0.0
        for t in storage.transactions:
            # Normalize transaction category to lowercase for comparison
            tx_category = (t.category or "").lower()
            # Use exact match instead of substring match
            if budget_category and budget_category == tx_category:
                spent += t.amount
        remaining = b.monthly_limit - spent
        data.append({"id": b.id, "name": b.name, "amount": b.monthly_limit, "spent": spent, "remaining": remaining})
    return {"ok": True, "budgets": data}


def get_goal_status_tool(_: Dict[str, Any] = None) -> Dict[str, Any]:
    data = []
    for g in storage.goals:
        progress = 0.0
        if g.target_amount:
            try:
                progress = float(g.saved_amount) / float(g.target_amount)
            except Exception:
                progress = 0.0
        remaining = g.target_amount - g.saved_amount
        data.append({"id": g.id, "name": g.name, "target": g.target_amount, "saved": g.saved_amount, "progress": progress, "remaining": remaining})
    return {"ok": True, "goals": data}


def check_spending_ability_tool(entities: Dict[str, Any]) -> Dict[str, Any]:
    """
    Check if a user can afford a proposed spending within their budget.
    Returns advice on whether the spending is possible.
    """
    amount = entities.get("amount")
    category = entities.get("category", "misc")

    if amount is None:
        return {"ok": False, "error": "Missing amount to check"}

    # Normalize category for matching
    category_lower = (category or "misc").lower()

    # Find matching budget
    matching_budget = None
    for b in storage.budgets:
        budget_category = (b.category or "").lower() if hasattr(b, 'category') else (b.name or "").lower()
        if budget_category and budget_category == category_lower:
            matching_budget = b
            break

    if not matching_budget:
        # No budget set for this category - can afford
        return {
            "ok": True,
            "can_afford": True,
            "message": f"No budget limit set for {category}. You can spend ${amount:.2f}.",
            "remaining": None,
            "limit": None
        }

    # Calculate current spending for the category
    spent = 0.0
    for t in storage.transactions:
        tx_category = (t.category or "").lower()
        if budget_category and budget_category == tx_category:
            spent += t.amount

    remaining = matching_budget.monthly_limit - spent
    can_afford = (remaining - amount) >= 0

    if can_afford:
        new_remaining = remaining - amount
        message = f"Yes, you can afford ${amount:.2f} for {category}. Your {category} budget is ${matching_budget.monthly_limit:.2f}. Currently spent: ${spent:.2f}. Would leave you with ${new_remaining:.2f} remaining."
    else:
        overage = amount - remaining
        message = f"No, you cannot afford ${amount:.2f} for {category}. Your budget is ${matching_budget.monthly_limit:.2f}. Currently spent: ${spent:.2f}. This would exceed your budget by ${overage:.2f}."

    logger.info(f"Spending check for {category}: ${amount} - can_afford={can_afford}")

    return {
        "ok": True,
        "can_afford": can_afford,
        "message": message,
        "proposed_amount": amount,
        "category": category,
        "budget_limit": matching_budget.monthly_limit,
        "current_spent": spent,
        "remaining": remaining
    }


def predict_cashflow_tool(_: Dict[str, Any] = None) -> Dict[str, Any]:
    # Improved prediction: use recent 30 days (or all) to compute avg daily spend, and project 7/30 days
    txs = storage.transactions
    if not txs:
        return {"ok": True, "prediction": "No transactions available to predict."}

    # consider last 30 days
    today = date.today()
    cutoff = today - timedelta(days=30)
    recent = [t for t in txs if getattr(t, 'date', today) >= cutoff]
    if not recent:
        recent = txs

    dates = [t.date for t in recent]
    span_days = (max(dates) - min(dates)).days or 1
    total = sum(t.amount for t in recent)
    avg_daily = total / span_days
    next_week = avg_daily * 7
    next_30 = avg_daily * 30

    # per-category averages
    by_cat = {}
    for t in recent:
        cat = (t.category or "misc").lower()
        by_cat.setdefault(cat, 0.0)
        by_cat[cat] += t.amount
    for k in list(by_cat.keys()):
        by_cat[k] = {"total": by_cat[k], "avg_daily": by_cat[k] / span_days}

    return {"ok": True, "avg_daily": avg_daily, "next_week_estimate": next_week, "next_30_estimate": next_30, "by_category": by_cat}


def list_transactions_tool(_: Dict[str, Any] = None):
    return {
        "ok": True,
        "transactions": [
            {
                "amount": t.amount,
                "category": t.category,
                "date": t.date.isoformat()
            }
            for t in storage.transactions
        ]
    }

def financial_health_tool(_: Dict[str, Any] = None):
    summary = storage.get_financial_summary()
    budgets = get_budget_status_tool().get("budgets", [])
    goals = get_goal_status_tool().get("goals", [])

    return {
        "ok": True,
        "summary": summary.model_dump(),
        "budgets": budgets,
        "goals": goals,
    }
