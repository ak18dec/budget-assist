"""
Event-driven agent prototype.

This module contains simple trigger registration and a runner that can be called
by the application when events occur. Handlers receive event payloads and may
call agent tools or produce alerts. For safety this prototype only returns
alerts and does not perform funds movement.
"""
from typing import Callable, Dict, Any, List
from threading import Lock
from app.agents import notifier
from app.agents.tools import predict_cashflow_tool
from app import storage

_handlers: Dict[str, List[Callable[[Dict[str, Any]], Any]]] = {}
_lock = Lock()


def register(event_name: str, handler: Callable[[Dict[str, Any]], Any]):
    with _lock:
        _handlers.setdefault(event_name, []).append(handler)


def emit(event_name: str, payload: Dict[str, Any]):
    print(f"📣 Event emitted: {event_name}", payload)
    handlers = _handlers.get(event_name, [])
    print(f"👂 Handlers found: {len(handlers)}")
    results = []
    all_alerts = []
    for h in handlers:
        try:
            results.append(h(payload))
        except Exception as e:
            results.append({"error": str(e)})
    # collect alerts from handlers and deliver via notifier
    for r in results:
        if isinstance(r, dict) and r.get("alerts"):
            all_alerts.extend(r.get("alerts"))
    if all_alerts:
        notifier.send_alerts(all_alerts)
    return results


# Example handlers
def new_transaction_handler(payload: Dict[str, Any]):
    # payload: { transaction }
    tx = payload.get("transaction")
    # simple rule: if transaction causes budget threshold breach, emit alert
    # NOTE: this handler just returns an alert dict; actual alerting system would send notifications.
    from app import storage
    alerts = []
    # check budgets
    for b in storage.budgets:
        if b.name and b.name.lower() in (tx.get("category", "")).lower():
            spent = sum(t.amount for t in storage.transactions if b.name.lower() in (t.category or "").lower())
            if spent > 0.9 * b.amount:
                alerts.append({"type": "budget_threshold", "budget_id": b.id, "message": f"Budget '{b.name}' at {spent}/{b.amount} (>{0.9*100:.0f}%)"})
    return {"alerts": alerts}


def daily_check_handler(_: Dict[str, Any]):
    # Example daily check: predict cashflow and warn if next week estimate exceeds 75% of combined budgets
    pred = predict_cashflow_tool()
    total_budgets = sum(b.amount for b in storage.budgets) or 1
    est_week = pred.get("next_week_estimate", 0)
    alerts = []
    if est_week > 0.75 * total_budgets:
        alerts.append({"type": "cashflow_risk", "message": f"Estimated next week spend ${est_week:.2f} exceeds 75% of total budgets (${total_budgets:.2f})"})
    return {"alerts": alerts}


# register example handlers
register("transaction.created", new_transaction_handler)
register("daily.check", daily_check_handler)
