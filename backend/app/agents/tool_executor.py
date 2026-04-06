import logging
from typing import Dict, Any

from app.repositories import transactions_repo, budgets_repo, goals_repo, summary_repo

logger = logging.getLogger(__name__)


def execute_intent(intent_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Unified tool execution layer.
    Maps intent → repository action with validation + safe responses.
    """
    intent = intent_data.get("intent")
    entities = intent_data.get("entities", {})

    try:
        if intent == "add_transaction":
            return _handle_add_transaction(entities)

        elif intent in ["list_transactions", "show_transactions"]:
            return _success(
                "list_transactions",
                _serialize_list(transactions_repo.list_transactions())
            )

        elif intent in ["list_budgets", "show_budgets"]:
            return _success(
                "list_budgets",
                _serialize_list(budgets_repo.list_budgets())
            )

        elif intent in ["list_goals", "show_goals"]:
            return _success(
                "list_goals",
                _serialize_list(goals_repo.list_goals())
            )

        elif intent in ["show_summary", "financial_summary", "financial_health_analysis"]:
            return _success(
                "financial_summary",
                summary_repo.get_financial_summary()
            )

        else:
            return _success(None, None)

    except Exception as e:
        logger.error(f"Tool execution failed: {e}")
        return _error(str(e))


def _handle_add_transaction(entities: Dict[str, Any]) -> Dict[str, Any]:
    from app.models import TransactionBase, TransactionType
    from datetime import date

    amount = entities.get("amount")
    category = entities.get("category", "misc")
    tx_type = entities.get("type", "EXPENSE")

    if not amount:
        return _error("Missing amount")

    tx = TransactionBase(
        amount=float(amount),
        category=category,
        type=TransactionType(tx_type),
        date=date.today(),
        description=entities.get("description")
    )

    created = transactions_repo.add_transaction(tx)

    return _success("add_transaction", created.model_dump())

# -----------------------
# Helpers
# -----------------------

def _serialize_list(data):
    return [item.model_dump() for item in data]


def _success(tool: str, result: Any) -> Dict[str, Any]:
    return {
        "tool": tool,
        "result": result
    }


def _error(message: str) -> Dict[str, Any]:
    return {
        "tool": "error",
        "result": {"error": message}
    }