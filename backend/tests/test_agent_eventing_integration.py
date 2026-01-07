from app import storage
from app.agents import eventing, agent, consent
from app import models
from datetime import date


def test_integration_flow():
    storage.transactions.clear()
    storage.budgets.clear()
    storage.goals.clear()
    storage._tx_auto_id = 1

    # create budget
    storage.add_budget(models.Budget(id=1, name="groceries", amount=200.0))

    # run agent to add transaction
    res = agent.run_agent("I spent $150 on groceries today")
    assert "Added transaction" in res["response"]

    # eventing should detect threshold if any
    out = eventing.emit("transaction.created", {"transaction": storage.transactions[-1].model_dump()})
    assert isinstance(out, list)

    # consent config test
    consent.CONSENT.add_pot(1, "Emergency", allowed=True, priority=1, max_percent=0.5)
    alloc = consent.suggest_auto_allocation(100.0)
    assert len(alloc) >= 1
