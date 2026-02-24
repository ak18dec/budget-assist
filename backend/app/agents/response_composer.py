# from app.llm.openai_hf_proxy import call_llm


# def compose_response(
#     user_input: str,
#     intent: str,
#     entities: dict,
#     tool_result,
#     insights,
#     conversation_history: str = None
# ):
#     """
#     Final LLM response construction.
#     """

#     system_prompt = f"""
# You are BudgetAI, a smart financial assistant.

# Intent detected: {intent}
# Tool Result: {tool_result}
# Insights: {insights}

# Respond clearly and concisely.
# If insights exist, include them naturally.
# """

#     full_prompt = f"""
# Conversation History:
# {conversation_history}

# User:
# {user_input}
# """

#     return call_llm(system_prompt=system_prompt, user_prompt=full_prompt)


# def compose_response(
#     user_input: str,
#     intent: str,
#     entities: dict,
#     tool_result,
#     insights,
#     conversation_history: str = None
# ):
#     """
#     Deterministic response composer.
#     No hallucinated financial numbers allowed.
#     """

#     # ----------------------------
#     # Tool-based responses
#     # ----------------------------

#     if intent == "ask_goal_progress" and tool_result:
#         saved = tool_result.get("saved", 0)
#         target = tool_result.get("target", 0)
#         goal_name = tool_result.get("goal_name", "your goal")

#         response = (
#             f"You have saved ₹{saved} out of ₹{target} "
#             f"for {goal_name}."
#         )

#     elif intent == "ask_budget_status" and tool_result:
#         spent = tool_result.get("spent", 0)
#         budget = tool_result.get("budget", 0)

#         response = (
#             f"You have spent ₹{spent} out of ₹{budget} "
#             f"this month."
#         )

#     elif tool_result:
#         response = str(tool_result)

#     else:
#         response = "I processed your request."

#     # ----------------------------
#     # Append insights safely
#     # ----------------------------

#     if insights:
#         insight_text = "\n\nInsights:\n"
#         for i in insights:
#             insight_text += f"- {i}\n"
#         response += insight_text

#     return response

from app.llm.openai_hf_proxy import call_llm


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

    if intent == "ask_goal_progress" and tool_result:
        saved = tool_result.get("saved", 0)
        target = tool_result.get("target", 0)
        goal_name = tool_result.get("goal_name", "your goal")

        response = (
            f"You have saved ₹{saved} out of ₹{target} "
            f"for {goal_name}."
        )

    elif intent == "ask_budget_status" and tool_result:
        spent = tool_result.get("spent", 0)
        budget = tool_result.get("budget", 0)

        response = (
            f"You have spent ₹{spent} out of ₹{budget} this month."
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

    if insights:
        insight_text = "\n\nFinancial Insights:\n"
        for i in insights:
            insight_text += f"- {i}\n"
        response += insight_text

    # ====================================================
    # 3️⃣ Controlled LLM Polishing (NO DATA MODIFICATION)
    # ====================================================

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