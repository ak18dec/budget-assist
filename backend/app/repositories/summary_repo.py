from app.db import db_transaction

def get_financial_summary():
    with db_transaction() as cursor:
        # Get total income
        cursor.execute("SELECT SUM(amount) FROM transactions WHERE type = 'INCOME'")
        total_income = cursor.fetchone()[0] or 0.0

        # Get total expenses
        cursor.execute("SELECT SUM(ABS(amount)) FROM transactions WHERE type = 'EXPENSE'")
        total_expense = cursor.fetchone()[0] or 0.0

        # Get total balance
        total_balance = total_income - total_expense

        # Get transaction count
        cursor.execute("SELECT COUNT(*) FROM transactions")
        transactions_count = cursor.fetchone()[0]

        # Get budgets
        cursor.execute("SELECT * FROM budgets ORDER BY name ASC")
        budgets = [dict(r) for r in cursor.fetchall()]

        # Get goals
        cursor.execute("SELECT * FROM goals ORDER BY target_date ASC")
        goals = [dict(r) for r in cursor.fetchall()]

    return {
        "total_balance": total_balance,
        "total_income": total_income,
        "total_expense": total_expense,
        "transactions_count": transactions_count,
        "budgets": budgets,
        "goals": goals,
    }

def get_monthly_income_expense(start_date, end_date):
    with db_transaction() as cursor:
        cursor.execute("""
            SELECT 
                strftime('%Y-%m', date) AS month,
                SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) AS income,
                SUM(CASE WHEN type = 'EXPENSE' THEN ABS(amount) ELSE 0 END) AS expense
            FROM transactions
            WHERE date BETWEEN ? AND ?
            GROUP BY month
            ORDER BY month ASC
        """, (start_date, end_date))
        results = [dict(r) for r in cursor.fetchall()]
    return results


# def get_monthly_income_expense(start: date, end: date):
#     """
#     Returns:
#     [
#       { "month": "Jan 2026", "income": 0, "expense": 0 },
#       ...
#     ]
#     """
#     if start > end:
#         return []

#     monthly = defaultdict(lambda: {"income": 0.0, "expense": 0.0})

#     for tx in transactions:
#         if start <= tx.date <= end:
#             month = (tx.date.year, tx.date.month)
#             if tx.type == TransactionType.INCOME:
#                 monthly[month]["income"] += tx.amount
#             else:
#                 monthly[month]["expense"] += abs(tx.amount)

#     result = []
#     current = date(start.year, start.month, 1)
#     end_month = date(end.year, end.month, 1)

#     while current <= end_month:
#         month_key = (current.year, current.month)
#         result.append({
#             "month": current.strftime("%b %Y"),
#             "income": monthly[month_key]["income"],
#             "expense": monthly[month_key]["expense"],
#         })
#         if current.month == 12:
#             current = date(current.year + 1, 1, 1)
#         else:
#             current = date(current.year, current.month + 1, 1)

#     return result