from typing import Dict, Any
from app.agents import tools
from app.agents.intent_classifier import classify_intent
from app.llm.openai_hf_proxy import extract_intent
from app import storage
import json


# --- Safety validators for LLM outputs --- #
def validate_transaction_entities(entities: Dict[str, Any]) -> bool:
    """Ensure transaction entities are valid."""
    return entities.get("amount") is not None

def validate_goal_entities(entities: Dict[str, Any]) -> bool:
    """Ensure goal exists for goal contribution."""
    goal_name = entities.get("goal_name")
    if not goal_name:
        return False
    return any(g.name.lower() == goal_name.lower() for g in storage.goals)

# --- Core tool router --- #
async def _choose_and_call(intent_result: Dict[str, Any]) -> Dict[str, Any]:
    intent = intent_result.get("intent")
    entities = intent_result.get("entities", {})

    # --- Goal contribution --- #
    if intent == "add_goal_contribution":
        if not validate_goal_entities(entities):
            return {"tool": "add_goal_contribution", "result": {"ok": False, "error": "Goal not found or missing"}}
        return {"tool": "add_goal_contribution", "result": tools.add_goal_contribution_tool(entities)}

    # --- Income --- #
    if intent == "add_income":
        if not validate_transaction_entities(entities):
            return {"tool": "add_income", "result": {"ok": False, "error": "Missing amount"}}
        return {"tool": "add_income", "result": tools.add_income_tool(entities)}

    # --- Expense --- #
    if intent == "add_transaction":
        if not validate_transaction_entities(entities):
            return {"tool": "add_transaction", "result": {"ok": False, "error": "Missing amount"}}
        return {"tool": "add_transaction", "result": tools.add_transaction_tool(entities)}

    # --- Queries --- #
    if intent == "ask_budget_status":
        return {"tool": "get_budget_status", "result": tools.get_budget_status_tool(entities)}
    if intent == "ask_goal_progress":
        return {"tool": "get_goal_status", "result": tools.get_goal_status_tool(entities)}
    if intent == "ask_spending_summary":
        return {"tool": "predict_cashflow", "result": tools.predict_cashflow_tool(entities)}

    # --- Unknown --- #
    return {"tool": "none", "result": {"ok": False, "message": "unknown intent"}}

    # if intent == "show_transactions":
    #     return {"tool": "list_transactions", "result": tools.list_transactions_tool()}
    # if intent == "show_budgets":
    #     return {"tool": "get_budget_status", "result": tools.get_budget_status_tool()}
    # if intent == "show_goals":
    #     return {"tool": "get_goal_status", "result": tools.get_goal_status_tool()}
    # if intent == "health_check":
    #     return {"tool": "financial_health", "result": tools.financial_health_tool()}

    # return {"tool": "none", "result": {"ok": False, "message": "unknown intent"}}


async def run_agent(message: str, use_llm: bool = True) -> Dict[str, Any]:
    """
    Main entry point for user message.

    Steps:
    1. Extract intent + entities using LLM or fallback to local classifier
    2. Route to correct tool with validation
    3. Synthesize response
    """
    # Step 1: extract intent + entities
    if use_llm:
        # build minimal financial summary for LLM
        summary = storage.get_financial_summary().model_dump()
        llm_output = await extract_intent(message, summary)
        # Expect LLM to return structured JSON like:
        # {"intent": "add_goal_contribution", "amount": 100, "goal_name": "vacation", "date": "2026-01-27"}
        try:
            intent_result = json.loads(llm_output)
        except Exception:
            # fallback to local deterministic classifier
            intent_result = classify_intent(message)
    else:
        intent_result = classify_intent(message)

    print("Intent Results-----------------",intent_result)
    # Step 2: call the correct tool
    tool_call = await _choose_and_call(intent_result)
    tool = tool_call["tool"]
    result = tool_call["result"]

    # Step 3: synthesize user response
    text = "Sorry, I couldn't determine an action for that request."

    if tool == "add_transaction":
        if result.get("ok"):
            tx = result.get("transaction")
            text = f"Added expense #{tx.get('id')}: ${tx.get('amount')} - {tx.get('category')} on {tx.get('date')}"
        else:
            text = f"Failed to add expense: {result.get('error') or result.get('message')}"
    elif tool == "add_goal_contribution":
        if result.get("ok"):
            g = result.get("goal")
            text = f"Added ${g.get('amount', '')} to goal '{g.get('name')}'. Saved {g.get('saved', 0)} / {g.get('target', 0)}"
        else:
            text = result.get("error", "Failed to add to goal.")
    elif tool == "add_income":
        if result.get("ok"):
            tx = result.get("transaction")
            text = f"Added income of ${tx.get('amount')} on {tx.get('date')}"
        else:
            text = f"Failed to add income: {result.get('error') or result.get('message')}"
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
    elif tool == "list_transactions":
        txs = result.get("transactions", [])
        if not txs:
            text = "You have no transactions yet."
        else:
            lines = [
                f"${t['amount']} on {t['category']} ({t['date']})"
                for t in txs[-5:]
            ]
            text = "Here are your recent transactions:\n" + "\n".join(lines)
    elif tool == "financial_health":
        summary = result["summary"]
        budgets = result["budgets"]
        goals = result["goals"]

        total_expense = summary['total_expense']
        avg_daily = total_expense / 30

        text = (
            f"This month you’ve spent ${total_expense:.2f}. "
            f"Your average daily spend is ${avg_daily:.2f}.\n"
        )

        if budgets:
            off_track = [b for b in budgets if b["remaining"] < 0]
            if off_track:
                text += "⚠️ Some budgets are over limit.\n"
            else:
                text += "✅ Your budgets look on track.\n"

        if goals:
            slow = [g for g in goals if g["progress"] < 0.5]
            if slow:
                text += "Some goals may need more contributions."
            else:
                text += "Your goals are progressing well."
    elif tool == "none":
        text = "Sorry, I couldn't determine an action for that request."
    
    return {"response": text, "tool": tool, "tool_result": result, "intent": intent_result}

def run_agent_from_intent(intent_result: Dict) -> Dict:
    """
    Maps structured LLM intent to the correct tool
    and formats a user-friendly response.
    """
    intent = intent_result.get("intent")
    entities = intent_result.get("entities", {})

    # Map intent -> tool
    tool_map = {
        "add_transaction": tools.add_transaction_tool,
        "add_income": tools.add_income_tool,
        "add_goal_contribution": tools.add_goal_contribution_tool,
        "ask_budget_status": tools.get_budget_status_tool,
        "ask_goal_progress": tools.get_goal_status_tool,
        "ask_spending_summary": tools.predict_cashflow_tool
    }

    tool_func = tool_map.get(intent)
    if not tool_func:
        return {"response": "Sorry, I couldn't understand your request.", "tool": "none", "tool_result": {}, "intent": intent_result}

    # Execute tool
    tool_result = tool_func(entities)

    # Generate user-facing message
    if intent == "add_transaction":
        if tool_result.get("ok"):
            tx = tool_result.get("transaction")
            text = f"Added transaction #{tx.get('id')}: ${tx.get('amount')} - {tx.get('category')} on {tx.get('date')}"
        else:
            text = f"Failed to add transaction: {tool_result.get('error') or tool_result.get('message')}"

    elif intent == "add_income":
        if tool_result.get("ok"):
            tx = tool_result.get("transaction")
            text = f"Added income #{tx.get('id')}: ${tx.get('amount')} on {tx.get('date')}"
        else:
            text = f"Failed to add income: {tool_result.get('error') or tool_result.get('message')}"

    elif intent == "add_goal_contribution":
        if tool_result.get("ok"):
            goal = tool_result.get("goal")
            text = f"Added ${goal.get('amount')} to goal '{goal.get('name')}'. Total saved: ${goal.get('saved'):.2f} / ${goal.get('target'):.2f}"
        else:
            text = f"Failed to contribute to goal: {tool_result.get('error') or tool_result.get('message')}"

    elif intent == "ask_budget_status":
        budgets = tool_result.get("budgets", [])
        if not budgets:
            text = "No budgets available."
        else:
            parts = [f"{b['name']}: remaining ${b['remaining']:.2f}" for b in budgets]
            text = "Budget status — " + "; ".join(parts)

    elif intent == "ask_goal_progress":
        goals = tool_result.get("goals", [])
        if not goals:
            text = "No goals configured."
        else:
            parts = [f"{g['name']}: {g['progress']*100:.0f}% (remaining ${g.get('remaining'):.2f})" for g in goals]
            text = "Goal progress — " + "; ".join(parts)

    elif intent == "ask_spending_summary":
        if not tool_result.get("ok"):
            text = tool_result.get("prediction", "No prediction available.")
        else:
            week = tool_result.get("next_week_estimate")
            month = tool_result.get("next_30_estimate")
            text = f"Estimated next week spend: ${week:.2f}. Next 30 days: ${month:.2f}."

    else:
        text = "Sorry, I couldn't determine an action for that request."

    return {"response": text, "tool": intent, "tool_result": tool_result, "intent": intent_result}