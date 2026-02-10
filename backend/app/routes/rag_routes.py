from fastapi import APIRouter
from typing import List, Dict
from app import rag
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/docs/add")
def add_docs(docs: List[Dict]):
    rag.add_financial_docs(docs)
    logger.info(f"Added {len(docs)} documents to RAG")
    return {"ok": True, "added": len(docs)}


@router.get("/docs/retrieve")
def retrieve(q: str):
    docs = rag.retrieve_context(q)
    context_str = rag.format_context_for_prompt(docs)
    return {"context": context_str, "documents": docs, "count": len(docs)}


@router.post("/policy/add")
def add_policies(policies: List[Dict]):
    """
    Add financial policies or rules to RAG.
    Policies are documents that guide financial advice.

    Example:
    [
        {
            "id": "policy_savings",
            "text": "Always save 20% of monthly income"
        }
    ]
    """
    formatted_policies = []
    for i, policy in enumerate(policies):
        doc_id = policy.get("id", f"policy_{i}")
        text = policy.get("text", "")
        metadata = policy.get("metadata", {"type": "user_policy"})

        formatted_policies.append({
            "id": doc_id,
            "text": text,
            "metadata": metadata
        })

    rag.add_financial_docs(formatted_policies)
    logger.info(f"Added {len(formatted_policies)} policies to RAG")
    return {"ok": True, "added": len(formatted_policies)}
