import logging

from app.llm.openai_hf_proxy import call_llm

logger = logging.getLogger(__name__)

def compose_response(
    user_input: str,
    intent: str,
    entities: dict,
    tool_result,
    insights,
    conversation_history: str = None
):
    """
    Deterministic financial response builder
    + Controlled LLM polishing layer
    """

    # ====================================================
    # 1️⃣ Build SAFE factual response (NO LLM)
    # ====================================================

    response = "I processed your request."
    empty_state = False

    if intent == "ask_goal_progress":
        logger.info(f"Composing response for intent {intent} with tool result: {tool_result}")
        if tool_result is None or (isinstance(tool_result, list) and len(tool_result) == 0):
            empty_state = True
            response = "You don't have any goals yet."
        # Handle list of goals
        elif isinstance(tool_result, list):
            if not tool_result:
                empty_state = True
                response = "You don't have any goals yet."
            else:
                response = "Your Goals Progress:\n"
                for goal in tool_result:
                    goal_name = goal.get("name", "Unnamed Goal")
                    saved = goal.get("saved", 0)
                    target = goal.get("target", 0)
                    percentage = (saved / target * 100) if target > 0 else 0
                    response += f"- {goal_name}: ₹{saved} / ₹{target} ({percentage:.1f}%)\n"
        # Handle single goal
        elif isinstance(tool_result, dict):
            saved = tool_result.get("saved", 0)
            target = tool_result.get("target", 0)
            goal_name = tool_result.get("goal_name", "your goal")
            response = (
                f"You have saved ₹{saved} out of ₹{target} "
                f"for {goal_name}."
            )
        else:
            response = "Unexpected response format."

    elif intent == "list_goals" and tool_result:
        if not tool_result:
            empty_state = True
            response = "You don't have any goals yet."
        else:
            response = "Your Goals:\n"
            for goal in tool_result:
                goal_name = goal.get("name", "Unnamed Goal")
                saved = goal.get("saved", 0)
                target = goal.get("target", 0)
                percentage = (saved / target * 100) if target > 0 else 0
                response += f"- {goal_name}: ₹{saved} / ₹{target} ({percentage:.1f}%)\n"

    elif intent == "ask_budget_status" and tool_result:
        spent = tool_result.get("spent", 0)
        budget = tool_result.get("budget", 0)

        response = (
            f"You have spent ₹{spent} out of ₹{budget} this month."
        )

    elif intent == "financial_health_analysis" and tool_result:
        # Build a comprehensive health summary
        total_income = tool_result.get("total_income", 0)
        total_expenses = tool_result.get("total_expenses", 0)
        net_savings = tool_result.get("net_savings", 0)
        budget_status = tool_result.get("budget_status", "unknown")
        
        response = (
            f"Here's your financial health this month:\n"
            f"- Total Income: ₹{total_income}\n"
            f"- Total Expenses: ₹{total_expenses}\n"
            f"- Net Savings: ₹{net_savings}\n"
            f"- Budget Status: {budget_status}"
        )

    elif intent == "add_transaction" and tool_result:
        response = f"Transaction recorded successfully."

    elif intent == "add_goal_contribution" and tool_result:
        response = f"Contribution added to your goal."

    elif tool_result:
        response = str(tool_result)

    # ====================================================
    # 2️⃣ Append insights deterministically
    # ====================================================

    if not empty_state and insights:
        insight_text = "\n\nFinancial Insights:\n"
        for i in insights:
            insight_text += f"- {i}\n"
        response += insight_text

    # ====================================================
    # 3️⃣ Controlled LLM Polishing (NO DATA MODIFICATION)
    # ====================================================
    
    # Only polish tone for non-data-driven intents
    data_driven_intents = [
        "ask_goal_progress",
        "list_goals",
        "ask_budget_status",
        "ask_total_spent",
        "add_transaction",
        "add_goal_contribution",
        "financial_health_analysis",
        "show_summary",
        "financial_summary",
        "list_transactions",
        "list_budgets"
    ]
    
    # Skip LLM polishing for data-driven intents to prevent hallucination
    if intent in data_driven_intents:
        return response

    polishing_system_prompt = """
You are BudgetAI tone optimizer.

IMPORTANT RULES:
- DO NOT change any numbers.
- DO NOT add new financial values.
- DO NOT invent data.
- Only improve clarity and natural flow.
- Keep response factually identical.
- Do not add assumptions.

Return only the improved response text.
"""

    polished = call_llm(
        system_prompt=polishing_system_prompt,
        user_prompt=response
    )

    # Fallback safety
    if not polished or len(polished) < 5:
        return response

    return polished