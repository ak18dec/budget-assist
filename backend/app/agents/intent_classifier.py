import re
from dateutil import parser as dateparser
from typing import Dict, Any, Optional

COMMON_CATEGORIES = [
    "groceries",
    "rent",
    "transport",
    "bills",
    "utilities",
    "entertainment",
    "dining",
    "coffee",
    "shopping",
    "misc",
]


def _extract_amount(text: str) -> Optional[float]:
    # matches $12.50 or 12.50 or 1,200.00
    m = re.search(r"\$?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)", text)
    if not m:
        return None
    s = m.group(1).replace(',', '')
    try:
        return float(s)
    except Exception:
        return None


def _extract_date(text: str) -> Optional[str]:
    try:
        dt = dateparser.parse(text, fuzzy=True, default=None)
        if dt and dt.year > 2000:
            return dt.date().isoformat()
    except Exception:
        return None
    return None


def _extract_category(text: str) -> Optional[str]:
    lower = text.lower()
    # look for prepositions indicating a category
    m = re.search(r"(?:on|for|in)\s+([a-zA-Z]+)", lower)
    if m:
        cat = m.group(1)
        if cat:
            return cat
    # fallback to common categories
    for c in COMMON_CATEGORIES:
        if c in lower:
            return c
    return None


def classify_intent(message: str) -> Dict[str, Any]:
    lower = message.lower()
    intent = "unknown"
    if any(w in lower for w in ["add", "spent", "bought", "purchase", "pay", "paid"]):
        intent = "add_transaction"
    elif "budget" in lower:
        intent = "ask_budget_status"
    elif any(w in lower for w in ["goal", "saving", "save"]):
        intent = "ask_goal_progress"
    elif any(w in lower for w in ["spend", "spent", "summary", "how much", "forecast", "predict"]):
        intent = "ask_spending_summary"
    elif any(w in lower for w in ["show", "list"]) and "transaction" in lower:
        intent = "show_transactions"
    elif any(w in lower for w in ["goal", "goals"]):
        intent = "show_goals"
    elif any(w in lower for w in ["budget", "budgets"]):
        intent = "show_budgets"
    elif any(w in lower for w in ["doing", "track", "month", "okay", "status"]):
        intent = "health_check"


    entities: Dict[str, Any] = {}
    amt = _extract_amount(message)
    if amt is not None:
        entities["amount"] = amt
    cat = _extract_category(message)
    if cat is not None:
        entities["category"] = cat
    dt = _extract_date(message)
    if dt is not None:
        entities["date"] = dt

    return {"intent": intent, "entities": entities}
