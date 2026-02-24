from datetime import date
from typing import Dict, Any, Optional
from app.db import db_transaction
from app.models import GoalBase, Goal

def add_goal(g: GoalBase) -> Goal:
    with db_transaction() as cursor:
        cursor.execute(
            "INSERT INTO goals (name, target_amount, saved_amount, target_date, description) VALUES (?, ?, ?, ?, ?)",
            (g.name, g.target_amount, g.saved_amount, g.target_date.isoformat() if g.target_date else None, g.description),
        )
        goal_id = cursor.lastrowid
        return Goal(
            id=goal_id,
            name=g.name,
            target_amount=g.target_amount,
            saved_amount=g.saved_amount,
            target_date=g.target_date,
            description=g.description
        )

def list_goals() -> list[Goal]:
    with db_transaction() as cursor:
        cursor.execute("SELECT * FROM goals ORDER BY target_date ASC")
        rows = cursor.fetchall()
        return [Goal(**dict(r)) for r in rows]

def get_goal_by_name(name: str) -> Optional[Goal]:
    with db_transaction() as cursor:
        cursor.execute("SELECT * FROM goals WHERE LOWER(name) = LOWER(?)", (name,))
        row = cursor.fetchone()
        return Goal(**dict(row)) if row else None

def add_savings(goal_id: int, amount: float) -> bool:
    with db_transaction() as cursor:
        cursor.execute(
            """
            UPDATE goals
            SET saved_amount = saved_amount + ?
            WHERE id = ?
            """,
            (amount, goal_id),
        )
        updated = cursor.rowcount > 0
        return updated

def update_goal(goal_id: int, goal_data: GoalBase) -> Goal:
    with db_transaction() as cursor:
        cursor.execute(
            """
            UPDATE goals
            SET name = ?, target_amount = ?, saved_amount = ?, target_date = ?, description = ?
            WHERE id = ?
            """,
            (
                goal_data.name,
                goal_data.target_amount,
                goal_data.saved_amount,
                goal_data.target_date.isoformat() if goal_data.target_date else None,
                goal_data.description,
                goal_id,
            ),
        )
        if cursor.rowcount == 0:
            return None  # Goal not found

        # Fetch the updated goal
        cursor.execute("SELECT * FROM goals WHERE id = ?", (goal_id,))
        row = cursor.fetchone()
        return Goal(**dict(row)) if row else None


def update_goal_target(goal_id: int, new_target: float) -> bool:
    with db_transaction() as cursor:
        cursor.execute(
            """
            UPDATE goals SET target_amount = ? WHERE id = ?
            """,
            (new_target, goal_id),
        )
        updated = cursor.rowcount > 0
        return updated

def delete_goal(goal_id: int) -> bool:
    with db_transaction() as cursor:
        cursor.execute("DELETE FROM goals WHERE id = ?", (goal_id,))
        deleted = cursor.rowcount > 0
        return deleted

def goal_progress(goal_id: int) -> Optional[Dict[str, Any]]:
    with db_transaction() as cursor:
        cursor.execute(
            """
            SELECT target_amount, saved_amount FROM goals WHERE id = ?
            """,
            (goal_id,),
        )
        row = cursor.fetchone()
        if not row:
            return None

        target = row["target_amount"]
        saved = row["saved_amount"]

        percentage = (saved / target * 100) if target > 0 else 0

        return {
            "target_amount": target,
            "saved_amount": saved,
            "progress_percent": round(percentage, 2),
            "remaining": max(target - saved, 0),
        }
    
def get_goals_due_between(start_date: date, end_date: date) -> list[Goal]:
    with db_transaction() as cursor:
        cursor.execute(
            "SELECT * FROM goals WHERE target_date BETWEEN ? AND ? ORDER BY target_date ASC",
            (start_date.isoformat(), end_date.isoformat()),
        )
        return [Goal(**dict(r)) for r in cursor.fetchall()]