from fastapi import APIRouter
from app.models import ChatRequest
from app.agents.agent import run_agent
from app import conversation_storage
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("", tags=["agent"])
def agent_chat(req: ChatRequest):
    try:
        conv_context = conversation_storage.get_conversation_context(limit=None)
        conversation_storage.add_turn("user", req.message)

        result = run_agent(req.message, True, conversation_history=conv_context)

        conversation_storage.add_turn("assistant", result.get("response", ""))
        return {
            "response": result.get("response"),
            "metadata": {
                "intent": result.get("intent"),
                "tool": result.get("tool"),
                "tool_result": result.get("tool_result"),
                "context_used": result.get("context_used"),
            },
        }
    except Exception as e:
        logger.error(f"Error in agent route: {str(e)}", exc_info=True)
        return {
            "response": "I ran into an internal error while processing that request.",
            "metadata": {"intent": "unknown", "tool": "none", "tool_result": {"ok": False}},
        }
