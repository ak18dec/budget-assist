from app.agents import notifier


def test_register_and_list_and_remove():
    # ensure clean state
    hooks = notifier.list_webhooks()
    # register
    e = notifier.register_webhook("http://example.invalid/webhook")
    assert "id" in e and e["url"].startswith("http")
    all_hooks = notifier.list_webhooks()
    assert any(h["id"] == e["id"] for h in all_hooks)
    # remove
    ok = notifier.remove_webhook(e["id"])
    assert ok


def test_send_alerts_no_hooks_graceful():
    # no exception should be raised
    notifier.send_alerts([{"type": "test", "message": "hello"}])
