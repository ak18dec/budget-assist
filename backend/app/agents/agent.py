import logging
from typing import Dict, Any, Optional

from app.agents.intent_classifier import classify_intent
from app.agents.tool_executor import execute_intent
from app.agents.response_composer import compose_response
from app.agents.insight_engine import generate_insights

logger = logging.getLogger(__name__)


# -----------------------------------------------------
# MAIN AGENT ENTRY POINT
# -----------------------------------------------------

def run_agent(
    user_input: str,
    allow_tools: bool = True,
    conversation_history: Optional[str] = None,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Core AI orchestration engine.

    Steps:
    1. Intent detection
    2. Tool execution (if applicable)
    3. Insight generation
    4. Response composition
    """

    try:
        # --------------------------------------------
        # 1️⃣ INTENT CLASSIFICATION
        # --------------------------------------------
        # intent_result = classify_intent(user_input)
        intent_result = classify_intent(
                            message=user_input,
                            conversation_history=conversation_history,
                            user_id=user_id
                        )

        intent = intent_result.get("intent")
        entities = intent_result.get("entities", {})

        logger.info(f"Intent detected: {intent}")

        tool_result = None
        tool_name = None

        # --------------------------------------------
        # 2️⃣ TOOL EXECUTION
        # --------------------------------------------
        if allow_tools:
            intent_data = {
                "intent": intent,
                "entities": entities
            }

            result = execute_intent(intent_data)
            tool_name = result.get("tool")
            tool_result = result.get("result")
        # --------------------------------------------
        # 3️⃣ INSIGHT GENERATION (Smart Layer)
        # --------------------------------------------
        insights = []

        if user_id:
            insights = generate_insights(user_id=user_id)

        # --------------------------------------------
        # 4️⃣ RESPONSE COMPOSITION
        # --------------------------------------------
        response_text = compose_response(
            user_input=user_input,
            intent=intent,
            entities=entities,
            tool_result=tool_result,
            insights=insights,
            conversation_history=conversation_history
        )

        return {
            "response": response_text,
            "intent": intent,
            "tool": tool_name,
            "tool_result": tool_result,
            "context_used": insights
        }

    except Exception as e:
        logger.error(f"Agent execution error: {str(e)}", exc_info=True)
        return {
            "response": "I encountered an internal error while processing your request.",
            "intent": "unknown",
            "tool": None,
            "tool_result": None,
            "context_used": []
        }