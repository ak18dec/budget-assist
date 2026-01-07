from fastapi import APIRouter
from typing import List, Dict
from app import rag

router = APIRouter()


@router.post("/docs/add")
def add_docs(docs: List[Dict]):
    rag.add_financial_docs(docs)
    return {"ok": True, "added": len(docs)}


@router.get("/docs/retrieve")
def retrieve(q: str):
    ctx = rag.retrieve_context(q)
    return {"context": ctx}
