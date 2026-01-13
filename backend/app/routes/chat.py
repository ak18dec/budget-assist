from fastapi import APIRouter
from app.models import ChatRequest, ChatResponse, IntentResponse
from app import storage
from typing import Any, Dict
from app.agents.intent_classifier import classify_intent
from app.llm.openai_hf_proxy import generate_chat_response

router = APIRouter()


def _mock_llm_natural_language(message: str, summary: Dict[str, Any]) -> str:
    # Placeholder: in production replace with a real LLM call
    return f"I see you've spent ${summary['total_spent']:.2f} so far. You asked: '{message}'. (mocked response)"


# Use local intent classifier



@router.post("/", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # Fetch internal financial summary
    summary = storage.get_financial_summary().dict()
    # Pass message + summary to (mocked) LLM to get a natural language response
    # resp_text = _mock_llm_natural_language(req.message, summary)
    resp_text = await generate_chat_response(req.message, summary)
    return ChatResponse(response=resp_text)


@router.post("/intent", response_model=IntentResponse)
def chat_intent(req: ChatRequest):
    # This endpoint uses an LLM (mocked here) to extract an intent + entities only.
    # Rules: must NOT modify any data.
    result = classify_intent(req.message)
    return IntentResponse(intent=result.get("intent", "unknown"), entities=result.get("entities", {}))
