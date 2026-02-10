from fastapi import APIRouter
from typing import List
from app import storage, models, rag
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=models.Goal)
def create_goal(goal: models.GoalBase):
    created = storage.add_goal(goal)
    # Sync RAG with updated goal data
    try:
        rag.sync_financial_data()
        logger.info(f"RAG synced after goal creation: {created.name}")
    except Exception as e:
        logger.warning(f"Failed to sync RAG after goal creation: {e}")
    return created

@router.get("/", response_model=List[models.Goal])
def get_goals():
    return storage.list_goals()

@router.put("/{goal_id}", response_model=models.Goal)
def update_goal(goal_id: int, goal: models.GoalBase):
    updated = storage.update_goal(goal_id, goal)
    # Sync RAG with updated goal data
    try:
        rag.sync_financial_data()
        logger.info(f"RAG synced after goal update: {updated.name}")
    except Exception as e:
        logger.warning(f"Failed to sync RAG after goal update: {e}")
    return updated