
from datetime import datetime
from app.agents.intent_classifier import classify_intent
from fastapi import APIRouter, HTTPException
from app.models import ChatRequest, ChatResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("", response_model=ChatResponse)
async def tester(req: ChatRequest):
    print(f"Received test chat request: {req}")
    try:
        if not req.user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        
        intent_result = classify_intent(
                            message=req.message,
                            conversation_history=None,
                            user_id=req.user_id
                        )
        
        print(f"Intent classification result: {intent_result}")
        print(f"Intent detected: {intent_result.get('intent')}")

        # Simulate a response for testing
        return ChatResponse(
            response="Test Response",
            tool=None,
            tool_result=None,
            intent={"name": intent_result.get("intent")},
            context_used=None,
            timestamp=datetime.now()
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error occurred while processing test chat request: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")



@router.get("/health")
async def health_check():
    return {"status": "tester ok"}