import logging
from typing import Dict, Any

from app.repositories import transactions_repo, budgets_repo, goals_repo, summary_repo

logger = logging.getLogger(__name__)


def execute_intent(intent_data: Dict[str, Any]) -> Dict[str, Any]:
    intent = intent_data.get("intent")
    entities = intent_data.get("entities", {})

    try:
        if intent == "add_transaction":
            return _handle_add_transaction(entities)

        elif intent == "show_transactions":
            return {
                "tool": "list_transactions",
                "result": transactions_repo.list_transactions()
            }

        elif intent == "show_budgets":
            return {
                "tool": "list_budgets",
                "result": budgets_repo.list_budgets()
            }

        elif intent == "show_summary":
            return {
                "tool": "financial_summary",
                "result": summary_repo.get_financial_summary()
            }

        elif intent == "show_goals":
            return {
                "tool": "list_goals",
                "result": goals_repo.list_goals()
            }

        else:
            return {
                "tool": None,
                "result": None
            }

    except Exception as e:
        logger.error(f"Tool execution failed: {e}")
        return {
            "tool": "error",
            "result": {"error": str(e)}
        }


def _handle_add_transaction(entities: Dict[str, Any]) -> Dict[str, Any]:
    from app.models import TransactionBase, TransactionType
    from datetime import date

    amount = entities.get("amount")
    category = entities.get("category", "misc")
    tx_type = entities.get("type", "EXPENSE")

    if not amount:
        return {"tool": "error", "result": {"error": "Missing amount"}}

    tx = TransactionBase(
        amount=float(amount),
        category=category,
        type=TransactionType(tx_type),
        date=date.today(),
        description=entities.get("description")
    )

    created = transactions_repo.add_transaction(tx)

    return {
        "tool": "add_transaction",
        "result": created.model_dump()
    }