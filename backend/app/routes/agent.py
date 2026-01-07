from fastapi import APIRouter
from app.models import ChatRequest
from app.agents.agent import run_agent

router = APIRouter()


@router.post("/", tags=["agent"])
def agent_chat(req: ChatRequest):
    result = run_agent(req.message)
    return {"response": result.get("response"), "metadata": {"intent": result.get("intent"), "tool": result.get("tool"), "tool_result": result.get("tool_result")}}
