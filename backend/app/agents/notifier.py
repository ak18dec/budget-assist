from typing import List, Dict, Any
import threading
import requests
from threading import Lock

_lock = Lock()
_webhooks: List[Dict[str, Any]] = []
_next_id = 1


def register_webhook(url: str) -> Dict[str, Any]:
    global _next_id
    with _lock:
        entry = {"id": _next_id, "url": url}
        _webhooks.append(entry)
        _next_id += 1
    return entry


def list_webhooks() -> List[Dict[str, Any]]:
    with _lock:
        return list(_webhooks)


def remove_webhook(hook_id: int) -> bool:
    with _lock:
        for i, h in enumerate(_webhooks):
            if h["id"] == hook_id:
                _webhooks.pop(i)
                return True
    return False


def _post_payload(url: str, payload: Dict[str, Any]):
    try:
        requests.post(url, json=payload, timeout=5)
    except Exception:
        # swallow errors; in production log or retry
        pass


def send_alerts(alerts: List[Dict[str, Any]]):
    """Send alerts to all registered webhooks asynchronously."""
    hooks = list_webhooks()
    if not hooks or not alerts:
        return

    payload = {"alerts": alerts}

    def _worker():
        for h in hooks:
            _post_payload(h["url"], payload)

    t = threading.Thread(target=_worker, daemon=True)
    t.start()
