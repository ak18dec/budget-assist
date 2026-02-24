from app.db import db_transaction
from app.models import Transaction, TransactionBase

def add_transaction(tx: TransactionBase) -> Transaction:
    with db_transaction() as cursor:
        cursor.execute(
            "INSERT INTO transactions (amount, category, date, description, type) VALUES (?, ?, ?, ?, ?)",
            (tx.amount, tx.category, tx.date.isoformat(), tx.description, tx.type)
        )
        tx_id = cursor.lastrowid
        return Transaction(
            id=tx_id,
            amount=tx.amount,
            category=tx.category,
            date=tx.date,
            description=tx.description,
            type=tx.type
        )


def list_transactions() -> list[Transaction]:
    with db_transaction() as cursor:
        cursor.execute("SELECT * FROM transactions")
        rows = cursor.fetchall()
        return [Transaction(**dict(r)) for r in rows]


def total_expense() -> float:
    with db_transaction() as cursor:
        cursor.execute("SELECT SUM(amount) FROM transactions WHERE type='EXPENSE'")
        val = cursor.fetchone()[0]
        return val or 0.0


def total_income() -> float:
    with db_transaction() as cursor:
        cursor.execute("SELECT SUM(amount) FROM transactions WHERE type='INCOME'")
        val = cursor.fetchone()[0]
        return val or 0.0

def get_balance() -> float:
    income = total_income()
    expense = total_expense()
    return income - expense