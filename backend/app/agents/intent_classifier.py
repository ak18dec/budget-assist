# import re
# from dateutil import parser as dateparser
# from typing import Dict, Any, Optional
# from datetime import date, timedelta

# COMMON_CATEGORIES = [
#     "groceries",
#     "rent",
#     "transport",
#     "bills",
#     "utilities",
#     "entertainment",
#     "dining",
#     "coffee",
#     "shopping",
#     "misc",
# ]

# INCOME_CATEGORIES = [
#     "salary",
#     "bonus",
#     "income",
#     "refund",
#     "reward",
#     "cashback",
#     "deposit",
# ]

# INCOME_KEYWORDS = [
#     "earned",
#     "received",
#     "paid",
#     "deposited",
#     "credited",
#     "transferred in",
# ]

# # --- Fallback local extraction for safety --- #
# def _extract_amount(text: str) -> Optional[float]:
#     # matches $12.50 or 12.50 or 1,200.00 or 4320
#     # First pattern: numbers with commas (1,234 or 1,234.50)
#     # Second pattern: plain numbers (4320 or 432.50)
#     m = re.search(r"\$?([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)", text)
#     if not m:
#         return None
#     s = m.group(1).replace(',', '')
#     try:
#         return float(s)
#     except Exception:
#         return None


# def _extract_date(text: str) -> Optional[str]:
#     lower = text.lower()
#     if "today" in lower:
#         return date.today().isoformat()
#     if "yesterday" in lower:
#         return (date.today() - timedelta(days=1)).isoformat()
#     if "tomorrow" in lower:
#         return (date.today() + timedelta(days=1)).isoformat()

#     has_date_keyword = any(
#         token in lower
#         for token in [
#             "monday",
#             "tuesday",
#             "wednesday",
#             "thursday",
#             "friday",
#             "saturday",
#             "sunday",
#             "jan",
#             "feb",
#             "mar",
#             "apr",
#             "may",
#             "jun",
#             "jul",
#             "aug",
#             "sep",
#             "oct",
#             "nov",
#             "dec",
#         ]
#     )
#     has_date_pattern = bool(
#         re.search(r"\b\d{4}-\d{1,2}-\d{1,2}\b", text)
#         or re.search(r"\b\d{1,2}/\d{1,2}(?:/\d{2,4})?\b", text)
#         or re.search(r"\b\d{1,2}-\d{1,2}(?:-\d{2,4})?\b", text)
#     )
#     # Avoid parsing plain numbers (e.g., amount "50") as a year/date.
#     if not has_date_keyword and not has_date_pattern:
#         return None

#     try:
#         dt = dateparser.parse(text, fuzzy=True, default=None)
#         if dt and dt.year > 2000:
#             return dt.date().isoformat()
#     except Exception:
#         return None
#     return None


# def _extract_category(text: str) -> Optional[str]:
#     lower = text.lower()
#     # look for prepositions indicating a category (including "to")
#     m = re.search(r"(?:on|for|in|to)\s+([a-zA-Z]+)", lower)
#     if m:
#         cat = m.group(1)
#         if cat:
#             return cat
#     # fallback to common categories and income categories
#     all_categories = COMMON_CATEGORIES + INCOME_CATEGORIES
#     for c in all_categories:
#         if c in lower:
#             return c
#     return None

# def _extract_goal_name(text: str) -> Optional[str]:
#     m = re.search(r"(?:to|into|for)\s+([a-zA-Z\s]+?)\s+goal", text.lower())
#     if m:
#         return m.group(1).strip()
#     return None


# def _extract_transaction_type(text: str, category: Optional[str]) -> str:
#     """
#     Determine if transaction is INCOME or EXPENSE based on category and keywords.
#     """
#     lower = text.lower()
    
#     # Check if category is income-related
#     if category and category.lower() in INCOME_CATEGORIES:
#         return "INCOME"
    
#     # Check for income keywords
#     if any(keyword in lower for keyword in INCOME_KEYWORDS):
#         return "INCOME"
    
#     # Default to EXPENSE for spending-related keywords
#     if any(w in lower for w in ["spent", "bought", "purchase", "pay", "paid"]):
#         return "EXPENSE"
    
#     # Default to EXPENSE
#     return "EXPENSE"

# # --- Main intent classifier (fallback if LLM fails) --- #
# def classify_intent(message: str, conversation_history: Optional[str] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
#     """
#     Fallback classifier using simple deterministic rules.
#     This is only used if LLM fails or is disabled.
#     """
#     lower = message.lower()
#     intent = "unknown"
#     entities: Dict[str, Any] = {}

#     # 1️⃣ Try LLM
#     try:
#         result = extract_intent(
#             message=message,
#             summary=get_summary(user_id),
#             conversation_history=conversation_history
#         )

#         parsed = json.loads(result)

#         if parsed.get("intent") and parsed["intent"] != "unknown":
#             return parsed
#     except Exception as e:
#         logger.warning(f"LLM failed: {e}")

#     # 2️⃣ Fallback (simple rules)
#     return fallback_classifier(message)


#     # --- Check spending ability (can I afford/spend) --- #
#     if any(w in lower for w in ["can i", "can i spend", "can i afford", "should i", "would i"]):
#         if any(w in lower for w in ["spend", "afford", "pay"]):
#             intent = "check_spending_ability"

#     # --- Financial health / status check --- #
#     elif any(phrase in lower for phrase in ["how am i doing", "how are my finances", "how's my spending", "am i doing", "my financial health", "status check"]):
#         intent = "financial_health_analysis"

#     # --- Goal contribution --- #
#     elif any(w in lower for w in ["save", "save to", "contribute to"]) and "goal" in lower:
#         goal_name = _extract_goal_name(message)
#         if goal_name:
#             intent = "add_goal_contribution"
#             entities["goal_name"] = goal_name

#     # --- Transaction fallback --- #
#     elif any(w in lower for w in ["add", "spent", "bought", "purchase", "pay", "paid"]):
#         intent = "add_transaction"
#         cat = _extract_category(message)
#         if cat:
#             entities["category"] = cat
#         # Determine if transaction is income or expense
#         tx_type = _extract_transaction_type(message, cat)
#         entities["type"] = tx_type
#     # --- Budget / goals queries --- #
#     elif "budget" in lower:
#         intent = "ask_budget_status"
#     elif any(w in lower for w in ["goal", "saving"]):
#         intent = "ask_goal_progress"
#     elif any(
#         phrase in lower
#         for phrase in [
#             "spent so far",
#             "spent in total",
#             "total spent",
#             "total spending",
#             "what have i spent in total",
#             "how much have i spent",
#         ]
#     ):
#         intent = "ask_total_spent"
#     elif any(w in lower for w in ["spend", "spent", "summary", "forecast", "predict"]):
#         intent = "ask_spending_summary"
#     # --- Extract common entities --- #
#     amt = _extract_amount(message)
#     if amt is not None:
#         entities["amount"] = amt
#     dt = _extract_date(message)
#     if dt is not None:
#         entities["date"] = dt

#     # For check_spending_ability, also extract category
#     if intent == "check_spending_ability":
#         cat = _extract_category(message)
#         if cat:
#             entities["category"] = cat

#     return {"intent": intent, "entities": entities}
    
#     # elif any(w in lower for w in ["show", "list"]) and "transaction" in lower:
#     #     intent = "show_transactions"
#     # elif any(w in lower for w in ["goal", "goals"]):
#     #     intent = "show_goals"
#     # elif any(w in lower for w in ["budget", "budgets"]):
#     #     intent = "show_budgets"
#     # elif any(w in lower for w in ["doing", "track", "month", "okay", "status"]):
#     #     intent = "health_check"


import json
import logging
import re
from typing import Dict, Any, Optional

from app.llm.openai_hf_proxy import extract_intent
from app.agents.intent_corrector import correct_intent
from app.repositories import summary_repo

logger = logging.getLogger(__name__)

# --------------------------------------------
# Allowed intents (single source of truth)
# --------------------------------------------
ALLOWED_INTENTS = {
    "add_transaction",
    "add_income",
    "add_goal_contribution",
    "ask_budget_status",
    "ask_goal_progress",
    "ask_total_spent",
    "ask_spending_summary",
    "check_spending_ability",
    "financial_health_analysis",
    "move_money",
    "unknown"
}

CONFIDENCE_THRESHOLD = 0.5
MIN_AMOUNT = 0
MAX_AMOUNT = 1_00_00_000  # sanity cap (1 crore)


# --------------------------------------------
# MAIN ENTRY POINT
# --------------------------------------------
def classify_intent(
    message: str,
    conversation_history: Optional[str] = None,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    LLM-first intent classification with safe fallback.

    Flow:
    1. Try LLM extraction
    2. Validate response
    3. Fallback if needed
    """

    summary = _get_summary_safe(user_id)

    # ----------------------------------------
    # 1️⃣ Try LLM
    # ----------------------------------------
    try:
        raw = extract_intent(
            message=message,
            summary=summary,
            conversation_history=conversation_history or "",
        )

        parsed = json.loads(raw)

        validated = _validate_llm_output(parsed)

        print(f"Validated LLM output: {validated}")

        # ----------------------------------------
        # 🔥 AUTO-CORRECTION LAYER
        # ----------------------------------------
        if not validated:
            logger.info("Attempting LLM auto-correction...")

            corrected = correct_intent(
                user_message=message,
                llm_output=parsed,
                conversation_history=conversation_history or ""
            )

            validated = _validate_llm_output(corrected)


        # 🔥 NEW: Confidence check
        print(f"checking confidence for validated output: {validated}")
        if validated and validated.get("confidence", 0) >= CONFIDENCE_THRESHOLD:
            return validated

        # logger.warning("LLM output failed validation. Falling back.")

    except Exception as e:
        logger.warning(f"LLM intent extraction failed: {e}")

    # ----------------------------------------
    # 2️⃣ Fallback (minimal rules)
    # ----------------------------------------
    return _fallback_classifier(message)


# --------------------------------------------
# VALIDATION LAYER (CRITICAL)
# --------------------------------------------
def _validate_llm_output(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    intent = data.get("intent", "unknown")
    entities = data.get("entities", {})

    print(f"Validating LLM output for data: {data}")

    print(f"Extracted intent: {intent}")
    print(f"Extracted entities: {entities}")

    # ❌ Invalid intent
    if intent not in ALLOWED_INTENTS:
        print(f"Invalid intent detected: {intent}")
        return None

    # Normalize
    amount = _safe_float(entities.get("amount"))
    category = _safe_str(entities.get("category"))
    goal_name = _safe_str(entities.get("goal_name"))
    date = _safe_str(entities.get("date"))

    print(f"Normalized amount: {amount}")
    print(f"Normalized category: {category}")
    print(f"Normalized goal_name: {goal_name}")
    print(f"Normalized date: {date}")

    # ----------------------------------------
    # 🔥 SANITY CHECKS
    # ----------------------------------------

    print("Running sanity checks...")

    # ❌ Invalid amount
    if amount is not None:
        print(f"Checking amount sanity: {amount}")
        if amount <= MIN_AMOUNT or amount > MAX_AMOUNT:
            logger.warning(f"Invalid amount detected: {amount}")
            return None

    # ----------------------------------------
    # 🔥 INTENT-SPECIFIC VALIDATION
    # ----------------------------------------

    if intent == "add_transaction":
        print("Validating add_transaction intent...")
        if not amount:
            return None

        # 🔥 Auto-fix category if missing
        if not category:
            print("Category missing for add_transaction. Attempting to infer from text...")
            category = _infer_category_from_text(data)

    if intent == "add_income":
        print("Validating add_income intent...")
        if not amount:
            return None

    if intent == "add_goal_contribution":
        print("Validating add_goal_contribution intent...")
        if not amount or not goal_name:
            print("Amount or goal_name missing for add_goal_contribution.")
            return None

    if intent == "check_spending_ability":
        print("Validating check_spending_ability intent...")
        if not amount:
            return None

    # ----------------------------------------
    # Final normalized output
    # ----------------------------------------
    return {
        "intent": intent,
        "entities": {
            "amount": amount,
            "category": category,
            "goal_name": goal_name,
            "date": date,
        },
        "confidence": data.get("confidence", 0.0)
    }

def _infer_category_from_text(data: Dict[str, Any]) -> Optional[str]:
    """
    Backup category inference from raw LLM output (light heuristic)
    """
    text = json.dumps(data).lower()

    if "food" in text:
        return "food"
    if "rent" in text:
        return "rent"
    if "travel" in text:
        return "travel"
    if "grocery" in text:
        return "groceries"

    return "misc"

# --------------------------------------------
# FALLBACK (KEEP IT SIMPLE)
# --------------------------------------------
def _fallback_classifier(message: str) -> Dict[str, Any]:
    msg = message.lower()

    amount = _extract_amount(msg)

    if any(word in msg for word in ["spent", "buy", "paid"]):
        return {
            "intent": "add_transaction",
            "entities": {"amount": amount}
        }

    if any(word in msg for word in ["income", "salary", "earned", "credited"]):
        return {
            "intent": "add_income",
            "entities": {"amount": amount}
        }

    return {
        "intent": "unknown",
        "entities": {}
    }

def _extract_amount(text: str):
    match = re.search(r"\d+", text)
    if match:
        return float(match.group())
    return None


# --------------------------------------------
# HELPERS
# --------------------------------------------
def _get_summary_safe(user_id: Optional[str]) -> Dict[str, Any]:
    try:
        if user_id:
            return summary_repo.get_financial_summary()
    except Exception as e:
        logger.warning(f"Failed to fetch summary: {e}")
    return {}


def _safe_float(value):
    try:
        return float(value) if value is not None else None
    except:
        return None


def _safe_str(value):
    if value is None:
        return None
    return str(value).strip()