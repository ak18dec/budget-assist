import os
from typing import Dict, Any
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import json
import logging

load_dotenv()

logger = logging.getLogger(__name__)

HF_API_TOKEN = os.getenv("HF_API_TOKEN")
HF_MODEL = os.getenv("HF_MODEL", "meta-llama/Llama-3.1-8B-Instruct")

client = InferenceClient(
    api_key=HF_API_TOKEN,
    model=HF_MODEL,
)

# --- Prompt builder for structured JSON output --- #
def _build_structured_prompt(
    message: str,
    summary: Dict[str, Any],
    rag_context: str = "",
    conversation_history: str = ""
) -> str:
    """
    Instruct the LLM to always output JSON with:
    {
        "intent": "...",
        "amount": ...,
        "category": "...",
        "goal_name": "...",
        "date": "YYYY-MM-DD"
    }
    Fill missing fields with null if not applicable.
    Optionally includes RAG context and conversation history for policy-aware, contextual responses.
    """
    prompt = (
        "You are a helpful financial assistant with knowledge of the user's financial policies and goals.\n"
        "User's financial summary:\n"
        f"- Total spent: ${summary.get('total_expense', 0):.2f}\n"
        f"- Total saved: ${summary.get('total_balance', 0):.2f}\n"
    )

    # Add conversation history if available - EMPHASIZE IT
    if conversation_history:
        prompt += (
            "\n=== CONVERSATION HISTORY (CRITICAL FOR CONTEXT!) ===\n"
            f"{conversation_history}\n"
            "====================================================\n"
            "\n⚠️  IMPORTANT INSTRUCTIONS FOR CONTEXT-DEPENDENT QUESTIONS:\n"
            "- If the user's current message references something from the conversation history,\n"
            "  RECOGNIZE IT AS A FOLLOW-UP QUESTION, NOT a generic query.\n"
            "- Examples of follow-up questions:\n"
            "  * 'How much did I spend?' → User is asking about the amount from previous message\n"
            "  * 'What category was that?' → User is asking about the category mentioned before\n"
            "  * 'Can I afford more?' → User is continuing a spending discussion\n"
            "- EXTRACT the specific amounts/categories from conversation history, don't return generic summaries.\n"
            "- Use conversation history to INFER what amounts/categories/dates the user is referring to.\n"
        )

    # Include RAG context if available
    if rag_context:
        prompt += (
            "\nRelevant financial context from policies:\n"
            f"{rag_context}\n"
        )

    prompt += (
        "\n=== INTENT CLASSIFICATION GUIDE ===\n"
        "Choose the intent that BEST MATCHES the user's current message, considering conversation history:\n"
        "- 'add_transaction': User is spending/buying something new (extract: amount, category, optional date)\n"
        "- 'add_income': User is receiving income (extract: amount, optional date)\n"
        "- 'add_goal_contribution': User is saving to a goal (extract: amount, goal_name)\n"
        "- 'ask_budget_status': User wants to know current budget health\n"
        "- 'ask_goal_progress': User wants to know goal progress\n"
        "- 'ask_spending_summary': User wants spending predictions/analysis for future planning\n"
        "- 'check_spending_ability': User is asking if they can afford something (extract: amount, category)\n"
        "\n=== CRITICAL: OUTPUT FORMAT ===\n"
        "YOU MUST RESPOND WITH ONLY THIS EXACT JSON FORMAT. NO TEXT BEFORE OR AFTER.\n"
        "{\n"
        '  "intent": "one of the intents listed above",\n'
        '  "amount": number or null,\n'
        '  "category": "string" or null,\n'
        '  "goal_name": "string" or null,\n'
        '  "date": "YYYY-MM-DD" or null\n'
        "}\n\n"
        f"User message: \"{message}\"\n\n"
        "RESPOND WITH ONLY JSON. NO EXPLANATIONS. NO TEXT."
    )

# --- Generate structured JSON response --- #
def extract_intent(
    message: str,
    summary: Dict[str, Any],
    rag_context: str = "",
    conversation_history: str = "",
) -> str:
    """
    Call the LLM and parse structured JSON output.
    Returns JSON string (not dict) for proper handling in agent.py.
    Fallback to minimal safe defaults if parsing fails.
    Optionally uses RAG context and conversation history for policy-aware, contextual responses.
    """
    prompt = _build_structured_prompt(message, summary, rag_context, conversation_history)

    try:
        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a JSON API. ALWAYS respond with ONLY valid JSON, nothing else. Do not include any text, explanations, or markdown. Just raw JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
        )
        content = completion.choices[0].message["content"].strip()

        # Clean up the response if it has markdown code blocks
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
        elif content.startswith("```"):
            content = content.replace("```", "").strip()

        logger.debug(f"LLM raw response: {content[:200]}")

        # Attempt JSON parsing
        try:
            data = json.loads(content)
        except Exception as e:
            logger.warning(f"Failed to parse LLM JSON response: {e}. Content: {content[:200]}")
            # Try to extract JSON if there's extra text
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                try:
                    data = json.loads(json_match.group())
                except:
                    data = {}
            else:
                data = {}

        # Ensure keys exist and return as JSON string
        result = {
            "intent": data.get("intent", "unknown"),
            "entities": {
                "amount": data.get("amount"),
                "category": data.get("category"),
                "goal_name": data.get("goal_name"),
                "date": data.get("date")
            }
        }
        logger.debug(f"LLM extracted intent: {result['intent']}")
        return json.dumps(result)
    except Exception as e:
        logger.error(f"Error during HF LLM call: {e}")
        fallback = {
            "intent": "unknown",
            "entities": {"amount": None, "category": None, "goal_name": None, "date": None}
        }
        return json.dumps(fallback)