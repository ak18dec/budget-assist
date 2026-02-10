from fastapi import APIRouter
from app.models import ChatRequest, ChatResponse, IntentResponse
from app.agents.intent_classifier import classify_intent
from app.agents.agent import run_agent

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Main chat endpoint:
    - Takes natural language message
    - LLM returns structured intent + entities
    - Agent executes tool if applicable
    - Returns user-friendly response
    """
    result = await run_agent(req.message, True)

    return ChatResponse(**result)


@router.post("/intent", response_model=IntentResponse)
def chat_intent(req: ChatRequest):
    # This endpoint uses an LLM (mocked here) to extract an intent + entities only.
    # Rules: must NOT modify any data.
    result = classify_intent(req.message)
    return IntentResponse(intent=result.get("intent", "unknown"), entities=result.get("entities", {}))
