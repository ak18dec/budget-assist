import os
from typing import Dict, Any
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import json

load_dotenv()

HF_API_TOKEN = os.getenv("HF_API_TOKEN")
HF_MODEL = os.getenv("HF_MODEL", "meta-llama/Llama-3.1-8B-Instruct")

client = InferenceClient(
    api_key=HF_API_TOKEN,
    model=HF_MODEL,
)

# --- Prompt builder for structured JSON output --- #
def _build_structured_prompt(message: str, summary: Dict[str, Any]) -> str:
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
    """
    prompt = (
        "You are a helpful financial assistant.\n"
        "User's financial summary:\n"
        f"- Total spent: ${summary.get('total_expense', 0):.2f}\n"
        f"- Total saved: ${summary.get('total_balance', 0):.2f}\n\n"
        "Instruction:\n"
        "1. Identify the user's intent (expense, income, goal contribution, budget query, goal query, cashflow prediction).\n"
        "2. Extract relevant entities: amount, category, goal_name, date.\n"
        "3. Output ONLY JSON, no text, no explanations.\n"
        "4. Use null for missing fields.\n\n"
        f"User message: \"{message}\"\n\n"
        "Example JSON format:\n"
        "{\n"
        '  "intent": "add_goal_contribution",\n'
        '  "amount": 100,\n'
        '  "category": null,\n'
        '  "goal_name": "vacation",\n'
        '  "date": "2026-01-27"\n'
        "}"
    )
    return prompt

# --- Generate structured JSON response --- #
async def extract_intent(
    message: str,
    summary: Dict[str, Any],
) -> str:
    """
    Call the LLM and parse structured JSON output.
    Fallback to minimal safe defaults if parsing fails.
    """
    prompt = _build_structured_prompt(message, summary)

    try:
        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
        )
        content = completion.choices[0].message["content"].strip()

        # Attempt JSON parsing
        try:
            data = json.loads(content)
        except Exception:
            data = {}
        
        # Ensure keys exist
        return {
            "intent": data.get("intent", "unknown"),
            "entities": {
                "amount": data.get("amount"),
                "category": data.get("category"),
                "goal_name": data.get("goal_name"),
                "date": data.get("date")
            }
        }
    except Exception as e:
        print(f"Error during HF LLM call: {e}")
        return {
            "intent": "unknown",
            "entities": {"amount": None, "category": None, "goal_name": None, "date": None}
        }