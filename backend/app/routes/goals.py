from fastapi import APIRouter
from typing import List
from app import storage, models

router = APIRouter()


@router.post("/", response_model=models.Goal)
def create_goal(goal: models.GoalBase):
    created = storage.add_goal(goal)
    return created

@router.get("/", response_model=List[models.Goal])
def get_goals():
    return storage.list_goals()

@router.put("/{goal_id}", response_model=models.Goal)
def update_goal(goal_id: int, goal: models.GoalBase):
    updated = storage.update_goal(goal_id, goal)
    return updated