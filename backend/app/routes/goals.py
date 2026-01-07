from fastapi import APIRouter
from app import storage, models

router = APIRouter()


@router.post("/", response_model=models.Goal)
def create_goal(goal: models.Goal):
    created = storage.add_goal(goal)
    return created
