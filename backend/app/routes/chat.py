from fastapi import APIRouter, HTTPException
from app.models import ChatRequest, ChatResponse, IntentResponse
from app.agents.intent_classifier import classify_intent
from app.agents.agent import run_agent
from app import conversation_storage
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# ------------------------------------------------------------------
# MAIN CHAT ENDPOINT
# ------------------------------------------------------------------

@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Main AI Chat endpoint.

    Flow:
    1. Retrieve conversation memory (SQLite)
    2. Save user message
    3. Run agent with context
    4. Save assistant response
    5. Return structured response

    Supports:
    - Multi-turn conversations
    - Multi-user isolation
    - Tool execution
    - Future Insight Engine integration
    """

    try:
        if not req.user_id:
            raise HTTPException(status_code=400, detail="user_id is required")

        # ----------------------------------------
        # 1️⃣ Retrieve conversation context
        # ----------------------------------------
        context_string = conversation_storage.get_context_string(
            user_id=req.user_id,
            limit=20
        )

        logger.info(f"---------------------------------------------------------------")

        logger.debug(f"Loaded conversation context {context_string} for user {req.user_id}")

        # ----------------------------------------
        # 2️⃣ Store user message
        # ----------------------------------------
        conversation_storage.add_turn(
            user_id=req.user_id,
            role="user",
            content=req.message
        )

        logger.info(f"User message stored for user {req.user_id}")

        # ----------------------------------------
        # 3️⃣ Run AI Agent
        # ----------------------------------------
        logger.debug(f"Running agent for user {req.user_id} with input: {req.message} and context: {context_string}")
        result = run_agent(
            user_id=req.user_id,
            user_input=req.message,
            allow_tools=True,
            conversation_history=context_string
        )

        assistant_response = result.get("response", "")
        logger.debug(f"Agent result for user {req.user_id}: {result}")

        # ----------------------------------------
        # 4️⃣ Store assistant response
        # ----------------------------------------
        conversation_storage.add_turn(
            user_id=req.user_id,
            role="assistant",
            content=assistant_response
        )

        logger.info(f"Assistant response stored for user {req.user_id}")
        logger.info(f"---------------------------------------------------------------")

        # ----------------------------------------
        # 5️⃣ Return structured response
        # ----------------------------------------
        return ChatResponse(
            response=assistant_response,
            tool=result.get("tool"),
            tool_result=result.get("tool_result"),
            intent={"name": result.get("intent", "unknown")},
            context_used=result.get("context_used"),
            timestamp=datetime.now()
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error in chat route: {str(e)}", exc_info=True)

        return ChatResponse(
            response="I ran into an internal error while processing that request.",
            timestamp=datetime.now()
        )


# ------------------------------------------------------------------
# INTENT ONLY ENDPOINT (NO DATA MUTATION)
# ------------------------------------------------------------------

@router.post("/intent", response_model=IntentResponse)
def chat_intent(req: ChatRequest):
    """
    Intent extraction only.
    Does NOT execute tools.
    Safe mode endpoint.
    """

    if not req.user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    result = classify_intent(req.message)

    return IntentResponse(
        intent=result.get("intent", "unknown"),
        entities=result.get("entities", {})
    )