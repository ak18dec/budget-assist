from typing import Tuple, Any
from app.repositories import transactions_repo, budgets_repo, goals_repo

def execute_tool(intent: str, entities: dict) -> Tuple[str, Any]:
    """
    Deterministic tool execution layer.
    Maps intent → repository action.
    """

    if intent == "add_transaction":
        # Example only — adapt to your schema
        tx = entities
        created = transactions_repo.add_transaction(tx)
        return "add_transaction", created.model_dump()

    if intent == "list_transactions":
        data = transactions_repo.list_transactions()
        return "list_transactions", [t.model_dump() for t in data]

    if intent == "list_budgets":
        data = budgets_repo.list_budgets()
        return "list_budgets", [b.model_dump() for b in data]

    if intent == "list_goals":
        data = goals_repo.list_goals()
        return "list_goals", [g.model_dump() for g in data]

    # No tool needed
    return None, None