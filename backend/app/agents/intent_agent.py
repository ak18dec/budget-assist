import json
import logging
from typing import Dict, Any

from app.llm.openai_hf_proxy import call_llm

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """
You are a financial intent classifier for a budgeting SaaS application.

Your job:
- Extract structured intent and entities from user input.
- ALWAYS return valid JSON.
- NEVER return explanations.
- NEVER include markdown.
- NEVER include extra text.

Return strictly this JSON format:

{
  "intent": "<intent_name>",
  "entities": { },
  "confidence": 0.0
}

Allowed intents:
- add_transaction
- show_transactions
- show_budgets
- show_summary
- show_goals
- add_goal
- update_goal
- move_money
- add_to_goal
- financial_health_analysis
- unknown

Rules:
- If user mentions amount + category → add_transaction
- If user asks overview → show_summary
- If user asks how am I doing → financial_health_analysis
- If unsure → unknown
"""


def classify_intent(message: str) -> Dict[str, Any]:
    try:
        response = call_llm(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=message,
            temperature=0
        )

        parsed = json.loads(response)

        # Basic validation
        if "intent" not in parsed:
            raise ValueError("Invalid LLM response")

        return parsed

    except Exception as e:
        logger.error(f"Intent classification failed: {e}")

        return {
            "intent": "unknown",
            "entities": {},
            "confidence": 0.0
        }