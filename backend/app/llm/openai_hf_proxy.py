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
# def _build_structured_prompt(
#     message: str,
#     summary: Dict[str, Any],
#     rag_context: str = "",
#     conversation_history: str = ""
# ) -> str:
#     """
#     Instruct the LLM to always output JSON with:
#     {
#         "intent": "...",
#         "amount": ...,
#         "category": "...",
#         "goal_name": "...",
#         "date": "YYYY-MM-DD"
#     }
#     Fill missing fields with null if not applicable.
#     Optionally includes RAG context and conversation history for policy-aware, contextual responses.
#     """
#     prompt = (
#         "You are a helpful financial assistant with knowledge of the user's financial policies and goals.\n"
#         "User's financial summary:\n"
#         f"- Total spent: ${summary.get('total_expense', 0):.2f}\n"
#         f"- Total saved: ${summary.get('total_balance', 0):.2f}\n"
#     )

#     # Add conversation history if available - EMPHASIZE IT
#     if conversation_history:
#         prompt += (
#             "\n=== CONVERSATION HISTORY (CRITICAL FOR CONTEXT!) ===\n"
#             f"{conversation_history}\n"
#             "====================================================\n"
#             "\n⚠️  IMPORTANT INSTRUCTIONS FOR CONTEXT-DEPENDENT QUESTIONS:\n"
#             "- If the user's current message references something from the conversation history,\n"
#             "  RECOGNIZE IT AS A FOLLOW-UP QUESTION, NOT a generic query.\n"
#             "- Examples of follow-up questions:\n"
#             "  * 'How much did I spend?' → User is asking about the amount from previous message\n"
#             "  * 'What category was that?' → User is asking about the category mentioned before\n"
#             "  * 'Can I afford more?' → User is continuing a spending discussion\n"
#             "- EXTRACT the specific amounts/categories from conversation history, don't return generic summaries.\n"
#             "- Use conversation history to INFER what amounts/categories/dates the user is referring to.\n"
#         )

#     # Include RAG context if available
#     if rag_context:
#         prompt += (
#             "\nRelevant financial context from policies:\n"
#             f"{rag_context}\n"
#         )

#     prompt += (
#         "\n=== INTENT CLASSIFICATION GUIDE ===\n"
#         "Choose the intent that BEST MATCHES the user's current message, considering conversation history:\n"
#         "- 'add_transaction': User is spending/buying something new (extract: amount, category, optional date)\n"
#         "- 'add_income': User is receiving income (extract: amount, optional date)\n"
#         "- 'add_goal_contribution': User is saving to a goal (extract: amount, goal_name)\n"
#         "- 'ask_budget_status': User wants to know current budget health\n"
#         "- 'ask_goal_progress': User wants to know goal progress\n"
#         "- 'ask_total_spent': User asks how much they have already spent in total so far\n"
#         "- 'ask_spending_summary': User wants spending predictions/analysis for future planning\n"
#         "- 'check_spending_ability': User is asking if they can afford something (extract: amount, category)\n"
#         "\n=== CRITICAL: OUTPUT FORMAT ===\n"
#         "YOU MUST RESPOND WITH ONLY THIS EXACT JSON FORMAT. NO TEXT BEFORE OR AFTER.\n"
#         "{\n"
#         '  "intent": "one of the intents listed above",\n'
#         '  "amount": number or null,\n'
#         '  "category": "string" or null,\n'
#         '  "goal_name": "string" or null,\n'
#         '  "date": "YYYY-MM-DD" or null\n'
#         "}\n\n"
#         f"User message: \"{message}\"\n\n"
#         "RESPOND WITH ONLY JSON. NO EXPLANATIONS. NO TEXT."
#     )
#     return prompt

def _build_structured_prompt(
    message: str,
    summary: Dict[str, Any],
    rag_context: str = "",
    conversation_history: str = ""
) -> str:

    prompt = (
        "You are an expert financial intent classification and entity extraction engine.\n"
        "Your job is to convert user messages into STRICT JSON.\n"
        "You MUST be accurate, consistent, and deterministic.\n\n"
    )

    # ----------------------------------------
    # USER CONTEXT
    # ----------------------------------------
    prompt += (
        "User financial summary:\n"
        f"- Total spent: ₹{summary.get('total_expense', 0)}\n"
        f"- Total balance: ₹{summary.get('total_balance', 0)}\n\n"
    )

    # ----------------------------------------
    # CONVERSATION CONTEXT (IMPORTANT)
    # ----------------------------------------
    if conversation_history:
        prompt += (
            "=== CONVERSATION HISTORY (VERY IMPORTANT) ===\n"
            f"{conversation_history}\n"
            "===========================================\n"
            "If the user refers to something like 'that', 'it', 'this',\n"
            "you MUST resolve it using the conversation history.\n\n"
        )

    # ----------------------------------------
    # RAG CONTEXT (optional)
    # ----------------------------------------
    if rag_context:
        prompt += (
            "Relevant financial policies:\n"
            f"{rag_context}\n\n"
        )

    # ----------------------------------------
    # INTENT DEFINITIONS (CLEAR RULES)
    # ----------------------------------------
    prompt += (
        "=== INTENT DEFINITIONS ===\n"
        "- add_transaction → User spends money (keywords: spent, bought, paid)\n"
        "- add_income → User receives money (keywords: salary, earned, credited, income)\n"
        "- add_goal_contribution → User saves towards a goal\n"
        "- ask_budget_status → Ask about current spending vs budget\n"
        "- ask_goal_progress → Ask about goal progress\n"
        "- ask_total_spent → Ask total expenses\n"
        "- ask_spending_summary → Ask for analysis or prediction\n"
        "- check_spending_ability → Ask if they can afford something\n\n"
    )

    # ----------------------------------------
    # 🔥 CRITICAL DISAMBIGUATION RULES
    # ----------------------------------------
    prompt += (
        "=== CRITICAL RULES ===\n"
        "1. If user is SPENDING money → intent = add_transaction\n"
        "2. If user is RECEIVING money → intent = add_income\n"
        "3. Never confuse income and expense\n"
        "4. 'salary credited', 'got money', 'earned' → add_income\n"
        "5. 'spent', 'paid', 'bought' → add_transaction\n"
        "6. Extract numeric amount ALWAYS\n"
        "7. Extract category for expenses (food, rent, travel, etc.)\n"
        "8. If category missing, set null (do NOT guess randomly)\n"
        "9. If not sure → intent = unknown\n\n"
    )

    # ----------------------------------------
    # 🔥 FEW-SHOT EXAMPLES (MOST IMPORTANT)
    # ----------------------------------------
    prompt += (
        "=== EXAMPLES ===\n\n"

        "User: \"add 1000 to income\"\n"
        "{\n"
        '  "intent": "add_income",\n'
        '  "amount": 1000,\n'
        '  "category": null,\n'
        '  "goal_name": null,\n'
        '  "date": null\n'
        "}\n\n"

        "User: \"salary credited 50000\"\n"
        "{\n"
        '  "intent": "add_income",\n'
        '  "amount": 50000,\n'
        '  "category": null,\n'
        '  "goal_name": null,\n'
        '  "date": null\n'
        "}\n\n"

        "User: \"I spent 3000 on food\"\n"
        "{\n"
        '  "intent": "add_transaction",\n'
        '  "amount": 3000,\n'
        '  "category": "food",\n'
        '  "goal_name": null,\n'
        '  "date": null\n'
        "}\n\n"

        "User: \"paid 2000 rent\"\n"
        "{\n"
        '  "intent": "add_transaction",\n'
        '  "amount": 2000,\n'
        '  "category": "rent",\n'
        '  "goal_name": null,\n'
        '  "date": null\n'
        "}\n\n"

        "User: \"can I spend 5000 on travel?\"\n"
        "{\n"
        '  "intent": "check_spending_ability",\n'
        '  "amount": 5000,\n'
        '  "category": "travel",\n'
        '  "goal_name": null,\n'
        '  "date": null\n'
        "}\n\n"
    )

    # ----------------------------------------
    # OUTPUT FORMAT (STRICT)
    # ----------------------------------------
    prompt += (
        "=== OUTPUT FORMAT (STRICT JSON ONLY) ===\n"
        "Return ONLY valid JSON. No text.\n"
        "{\n"
        '  "intent": "string",\n'
        '  "amount": number or null,\n'
        '  "category": string or null,\n'
        '  "goal_name": string or null,\n'
        '  "date": "YYYY-MM-DD" or null\n',
        '   "confidence": number between 0 and 1\n'
        "}\n\n"
        """Rules:
        - Confidence must reflect how sure you are
        - Use lower confidence (<0.6) if ambiguous
        - Use higher confidence (>0.8) if clear
        - Do NOT return any explanation
        """
    )

    # ----------------------------------------
    # FINAL USER MESSAGE
    # ----------------------------------------
    prompt += f'User: "{message}"\n'

    return prompt

# --- Generate structured JSON response --- #
def extract_intent(
    message: str,
    summary: Dict[str, Any],
    rag_context: str = "",
    conversation_history: str = "",
) -> str:
    """
    Calls HF LLM and guarantees strict structured JSON.
    Returns JSON string.
    """

    prompt = _build_structured_prompt(
        message,
        summary,
        rag_context,
        conversation_history,
    )

    try:
        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a JSON API. "
                        "ALWAYS respond with ONLY valid JSON. "
                        "NO markdown. NO explanations. NO extra text."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0,  # 🔒 deterministic intent classification
        )

        content = completion.choices[0].message["content"].strip()

        # Remove markdown if present
        if content.startswith("```"):
            content = content.replace("```json", "").replace("```", "").strip()

        logger.debug(f"LLM raw response: {content[:200]}")

        # Parse JSON safely
        try:
            data = json.loads(content)
        except Exception:
            import re
            match = re.search(r"\{.*\}", content, re.DOTALL)
            if match:
                data = json.loads(match.group())
            else:
                data = {}

        # --- Normalize and enforce structure ---
        print("Parsed JSON data:", {data})
        intent = data.get("intent", "unknown")

        allowed_intents = {
            "add_transaction",
            "add_income",
            "add_goal_contribution",
            "ask_budget_status",
            "ask_goal_progress",
            "ask_total_spent",
            "ask_spending_summary",
            "check_spending_ability",
            "financial_health_analysis",
            "move_money",
            "unknown"
        }

        if intent not in allowed_intents:
            intent = "unknown"

        entities = {
            "amount": _safe_float(data.get("amount")),
            "category": _safe_str(data.get("category")),
            "goal_name": _safe_str(data.get("goal_name")),
            "date": _safe_str(data.get("date")),
        }

        result = {
            "intent": intent,
            "entities": entities,
            "confidence": data.get("confidence", 0.0)
        }

        print("Final result:", {result})
        logger.debug(f"Normalized intent: {result['intent']}")

        return json.dumps(result)

    except Exception as e:
        logger.error(f"Error during HF LLM call: {e}")

        fallback = {
            "intent": "unknown",
            "entities": {
                "amount": None,
                "category": None,
                "goal_name": None,
                "date": None
            },
            "confidence": 0.0
        }
        return json.dumps(fallback)


def _safe_float(value):
    try:
        return float(value) if value is not None else None
    except:
        return None


def _safe_str(value):
    if value is None:
        return None
    return str(value).strip()


def call_llm(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.7,
) -> str:
    """
    Generic LLM call for conversational responses,
    insights explanations, and financial advice generation.
    Returns plain text response.
    """

    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
        )

        content = completion.choices[0].message["content"].strip()

        # Clean markdown blocks if model wraps response
        if content.startswith("```"):
            content = content.replace("```", "").strip()

        logger.debug(f"LLM response: {content[:300]}")

        return content

    except Exception as e:
        logger.error(f"Error during HF LLM call: {e}")
        return "I'm currently unable to process that request. Please try again."