import os
from typing import Dict, Any
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()

HF_API_TOKEN = os.getenv("HF_API_TOKEN")
HF_MODEL = os.getenv("HF_MODEL", "meta-llama/Llama-3.1-8B-Instruct")

client = InferenceClient(
    api_key=HF_API_TOKEN,
    model=HF_MODEL,
)

def _build_prompt(message: str, summary: Dict[str, Any]) -> str:
    return (
        "You are a helpful financial assistant.\n\n"
        f"User financial summary:\n"
        f"- Total spent: ${summary['total_spent']:.2f}\n\n"
        f"User question:\n{message}\n\n"
        "Answer concisely and helpfully."
    )


async def generate_chat_response(
    message: str,
    summary: Dict[str, Any],
) -> str:
    prompt = _build_prompt(message, summary)

    try:
        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
        )
        return completion.choices[0].message["content"].strip()
    except Exception as e:
        print(f"Error during HF LLM call: {e}")
        return "Sorry, I couldn't generate a response."