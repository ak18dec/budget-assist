from app.repositories import summary_repo

def generate_insights(user_id: str):
    """
    Real-time financial insights.
    Purely data-driven.
    No LLM required.
    """

    insights = []

    summary = summary_repo.get_financial_summary()

    if summary["total_expense"] > summary["total_income"]:
        insights.append(
            "Your expenses are higher than your income this month."
        )

    if summary["total_balance"] < 100:
        insights.append(
            "Your balance is running low. Consider reducing discretionary spending."
        )

    return insights