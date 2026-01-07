from app.agents.intent_classifier import classify_intent
from app.agents import tools, agent
from app import storage, models
from datetime import date


def setup_module(module):
    # clear storage between tests
    storage.transactions.clear()
    storage.budgets.clear()
    storage.goals.clear()
    # reset ids (best-effort)
    try:
        storage._tx_auto_id = 1
        storage._budget_auto_id = 1
        storage._goal_auto_id = 1
    except Exception:
        pass


def test_classify_intent_amount_category_date():
    msg = "I spent $12.50 on groceries on 2025-12-01"
    res = classify_intent(msg)
    assert res["intent"] == "add_transaction"
    assert res["entities"]["amount"] == 12.5
    assert "groceries" in res["entities"]["category"]
    assert res["entities"]["date"] == "2025-12-01"


def test_tools_budget_matching_and_prediction():
    # create a budget named groceries
    b = models.Budget(id=1, name="groceries", amount=200.0)
    storage.budgets.append(b)
    # add transactions
    t1 = models.Transaction(id=1, amount=30.0, category="groceries", date=date(2025,12,1))
    t2 = models.Transaction(id=2, amount=20.0, category="coffee", date=date(2025,12,2))
    storage.transactions.extend([t1, t2])

    bs = tools.get_budget_status_tool()
    assert bs["ok"]
    assert len(bs["budgets"]) == 1
    g = bs["budgets"][0]
    assert abs(g["spent"] - 30.0) < 0.001
    assert abs(g["remaining"] - 170.0) < 0.001

    pred = tools.predict_cashflow_tool()
    assert pred["ok"]
    assert "next_week_estimate" in pred


def test_agent_add_transaction_flow():
    # ensure clean
    storage.transactions.clear()
    # run agent to add
    res = agent.run_agent("I spent $45 on groceries today")
    assert "Added transaction" in res["response"]
    assert len(storage.transactions) >= 1
