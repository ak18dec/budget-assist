import pytest
from app import rag


def test_rag_retrieve_smoke():
    rag.add_financial_docs([{"id":"t1","text":"Pay rent on the 1st of every month."}])
    ctx = rag.retrieve_context("rent")
    assert isinstance(ctx, str)
    assert "rent" in ctx.lower()
