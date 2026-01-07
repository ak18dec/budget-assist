from app import storage, models
from datetime import date, datetime
from typing import Dict, Any


def _parse_date(d: Any) -> date:
    if not d:
        return date.today()
    if isinstance(d, date):
        return d
    try:
        return datetime.fromisoformat(str(d)).date()
    except Exception:
        return date.today()


def add_transaction_tool(entities: Dict[str, Any]) -> Dict[str, Any]:
    amount = entities.get("amount")
    category = entities.get("category", "misc")
    d = _parse_date(entities.get("date"))
    if amount is None:
        return {"error": "missing amount"}
    tx_base = models.TransactionBase(amount=float(amount), category=category, date=d)
    tx = storage.add_transaction(tx_base)
    return {"ok": True, "transaction": tx.model_dump()}


def get_budget_status_tool(_: Dict[str, Any] = None) -> Dict[str, Any]:
    # More useful status: match budgets to categories when possible and compute remaining per budget
    data = []
    for b in storage.budgets:
        # attempt to compute spent for this budget by matching budget name to categories
        budget_name = (b.name or "").lower()
        spent = 0.0
        for t in storage.transactions:
            if budget_name and budget_name in (t.category or "").lower():
                spent += t.amount
        remaining = b.amount - spent
        data.append({"id": b.id, "name": b.name, "amount": b.amount, "spent": spent, "remaining": remaining})
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


def predict_cashflow_tool(_: Dict[str, Any] = None) -> Dict[str, Any]:
    # Improved prediction: use recent 30 days (or all) to compute avg daily spend, and project 7/30 days
    txs = storage.transactions
    if not txs:
        return {"ok": True, "prediction": "No transactions available to predict."}

    # consider last 30 days
    from datetime import date, timedelta

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
