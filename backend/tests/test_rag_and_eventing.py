from app import rag
from app.agents import eventing, consent
from app import storage
from app import models
from datetime import date


def test_rag_add_and_retrieve():
    docs = [
        {"id": "budget-guide", "text": "To save for groceries, set a weekly budget and track purchases."},
        {"id": "savings-guide", "text": "Automate transfers to a saving pot every payday."},
    ]
    rag.add_financial_docs(docs)
    res = rag.retrieve_context("groceries budget")
    assert "budget-guide" in res


def test_eventing_transaction_alert():
    storage.budgets.clear()
    storage.transactions.clear()
    b = models.Budget(id=1, name="coffee", amount=50.0)
    storage.budgets.append(b)
    t = models.Transaction(id=1, amount=48.0, category="coffee", date=date.today())
    storage.transactions.append(t)
    out = eventing.emit("transaction.created", {"transaction": t.model_dump()})
    assert isinstance(out, list)


def test_consent_allocation():
    consent.CONSENT.add_pot(1, "Emergency", allowed=True, priority=1, max_percent=0.5)
    consent.CONSENT.add_pot(2, "Vacation", allowed=True, priority=2, max_percent=0.3)
    alloc = consent.suggest_auto_allocation(100.0)
    assert len(alloc) == 2
