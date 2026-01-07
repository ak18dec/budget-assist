from typing import Dict, Any
from app.agents import tools
from app.agents.intent_classifier import classify_intent


def _choose_and_call(intent_result: Dict[str, Any]) -> Dict[str, Any]:
    intent = intent_result.get("intent")
    entities = intent_result.get("entities", {})
    if intent == "add_transaction":
        return {"tool": "add_transaction", "result": tools.add_transaction_tool(entities)}
    if intent == "ask_budget_status":
        return {"tool": "get_budget_status", "result": tools.get_budget_status_tool(entities)}
    if intent == "ask_goal_progress":
        return {"tool": "get_goal_status", "result": tools.get_goal_status_tool(entities)}
    if intent == "ask_spending_summary":
        return {"tool": "predict_cashflow", "result": tools.predict_cashflow_tool(entities)}
    return {"tool": "none", "result": {"ok": False, "message": "unknown intent"}}


def run_agent(message: str) -> Dict[str, Any]:
    # 1) extract intent + entities using local classifier
    intent_result = classify_intent(message)

    # 2) call tool
    tool_call = _choose_and_call(intent_result)
    tool = tool_call["tool"]
    result = tool_call["result"]

    # 3) synthesize user-facing response
    if tool == "add_transaction":
        if result.get("ok"):
            tx = result.get("transaction")
            text = f"Added transaction #{tx.get('id')}: ${tx.get('amount')} - {tx.get('category')} on {tx.get('date')}"
        else:
            text = f"Failed to add transaction: {result.get('error') or result.get('message')}"
    elif tool == "get_budget_status":
        budgets = result.get("budgets", [])
        if not budgets:
            text = "No budgets available."
        else:
            parts = [f"{b['name']}: remaining ${b['remaining']:.2f}" for b in budgets]
            text = "Budget status — " + "; ".join(parts)
    elif tool == "get_goal_status":
        goals = result.get("goals", [])
        if not goals:
            text = "No goals configured."
        else:
            parts = [f"{g['name']}: {g['progress']*100:.0f}% (remaining ${g.get('remaining'):.2f})" for g in goals]
            text = "Goal progress — " + "; ".join(parts)
    elif tool == "predict_cashflow":
        if not result.get("ok"):
            text = result.get("prediction", "No prediction available.")
        else:
            week = result.get("next_week_estimate")
            month = result.get("next_30_estimate")
            text = f"Estimated next week spend: ${week:.2f}. Next 30 days: ${month:.2f}."
    else:
        text = "Sorry, I couldn't determine an action for that request."

    return {"response": text, "tool": tool, "tool_result": result, "intent": intent_result}
