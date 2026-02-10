from fastapi import APIRouter
from app.models import ChatRequest, ChatResponse, IntentResponse
from app.agents.intent_classifier import classify_intent
from app.agents.agent import run_agent
from app import conversation_storage
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Main chat endpoint with date-based conversation memory:
    - Takes natural language message
    - Retrieves full conversation history for today
    - LLM returns structured intent + entities
    - Agent executes tool if applicable
    - Stores conversation turn to today's markdown file
    - Returns response with timestamp

    All conversations within a single day are stored in one markdown file.
    The agent has access to the complete conversation history for that day.
    """
    try:
        # Get conversation history for today (full context)
        conv_context = conversation_storage.get_conversation_context(limit=None)

        # Add user message to conversation history
        conversation_storage.add_turn("user", req.message)
        logger.info(f"User message added to today's conversation history")

        # Run agent with conversation context
        result = run_agent(req.message, True, conversation_history=conv_context)

        # Add assistant response to conversation history
        conversation_storage.add_turn("assistant", result.get("response", ""))
        logger.info(f"Assistant response saved to today's conversation history")

        # Return response with timestamp
        return ChatResponse(
            response=result.get("response", ""),
            tool=result.get("tool"),
            tool_result=result.get("tool_result"),
            intent=result.get("intent"),
            context_used=result.get("context_used"),
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"Error in chat route: {str(e)}", exc_info=True)
        return ChatResponse(
            response=f"An error occurred: {str(e)}",
            timestamp=datetime.now()
        )


@router.post("/intent", response_model=IntentResponse)
def chat_intent(req: ChatRequest):
    # This endpoint uses an LLM (mocked here) to extract an intent + entities only.
    # Rules: must NOT modify any data.
    result = classify_intent(req.message)
    return IntentResponse(intent=result.get("intent", "unknown"), entities=result.get("entities", {}))
