from typing import Optional
from app.db import db_transaction
from app.models import BudgetBase, Budget


def add_budget(b: BudgetBase) -> Budget :
    with db_transaction() as cursor:
        cursor.execute(
            """
            INSERT INTO budgets (name, category, monthly_limit, alert_threshold, spent_this_month) VALUES (?, ?, ?, ?, ?)
            """,
            (b.name, b.category, b.monthly_limit, b.alert_threshold, 0.0),
        )
        budget_id = cursor.lastrowid
        return Budget(
            id=budget_id,
            name=b.name,
            category=b.category,
            monthly_limit=b.monthly_limit,
            alert_threshold=b.alert_threshold,
            spent_this_month=0.0
        )


def list_budgets() -> list[Budget]:
    with db_transaction() as cursor:
        cursor.execute("SELECT * FROM budgets ORDER BY name ASC")
        rows = cursor.fetchall()
        return [Budget(**dict(r)) for r in rows]


def get_budget_by_category(category: str) -> Optional[Budget]:
    with db_transaction() as cursor:
        cursor.execute("SELECT * FROM budgets WHERE category = ?", (category,))
        row = cursor.fetchone()
        return Budget(**dict(row)) if row else None


def update_budget_limit(budget_id: int, new_limit: float) -> bool:
    with db_transaction() as cursor:
        cursor.execute(
            """
            UPDATE budgets SET monthly_limit = ? WHERE id = ?
            """,
            (new_limit, budget_id),
        )
        updated = cursor.rowcount > 0
        return updated


def delete_budget(budget_id: int) -> bool:
    with db_transaction() as cursor:
        cursor.execute("DELETE FROM budgets WHERE id = ?", (budget_id,))
        return cursor.rowcount > 0


def total_spent_for_category(category: str, month: str) -> float:
    """
    month format: 'YYYY-MM'
    Example: '2026-02'
    """
    with db_transaction() as cursor:
        cursor.execute(
            """
            SELECT SUM(amount)
            FROM transactions
            WHERE category = ?
            AND type = 'EXPENSE'
            AND substr(date, 1, 7) = ?
            """,
            (category, month),
        )
        result = cursor.fetchone()[0]
        return result or 0.0


# def get_budget_spending(category: str):
#     """
#     Returns (spent, limit, alert_threshold) for a given category.
#     If no budget exists, returns (0, 0, 0).
#     """
#     for b in budgets:
#         if b.category.lower() == category.lower():
#             return (
#                 b.spent_this_month,
#                 b.monthly_limit,
#                 b.alert_threshold
#             )
#     return (0.0, 0.0, 0.0)