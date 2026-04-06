import json
import logging
from typing import Dict, Any

from app.llm.openai_hf_proxy import call_llm

logger = logging.getLogger(__name__)


def correct_intent(
    user_message: str,
    llm_output: Dict[str, Any],
    conversation_history: str = ""
) -> Dict[str, Any]:
    """
    Second-pass correction using LLM.
    Fixes wrong intent or missing entities.
    """

    system_prompt = """
You are an intent correction engine.

You are given:
1. User message
2. Previously predicted intent + entities

Your job:
- Fix incorrect intent if needed
- Fill missing fields if obvious
- DO NOT invent data
- DO NOT change correct values

Return ONLY valid JSON:
{
  "intent": "...",
  "amount": number or null,
  "category": string or null,
  "goal_name": string or null,
  "date": string or null
}
"""

    user_prompt = f"""
User message:
{user_message}

Previous prediction:
{json.dumps(llm_output)}

Conversation history:
{conversation_history}

Correct the output if needed.
"""

    try:
        response = call_llm(system_prompt, user_prompt, temperature=0)

        if response.startswith("```"):
            response = response.replace("```", "").strip()

        return json.loads(response)

    except Exception as e:
        logger.warning(f"Intent correction failed: {e}")
        return llm_output  # fallback to original