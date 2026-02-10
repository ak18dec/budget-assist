"""
RAG implementation with optional Chroma + sentence-transformers integration.

If Chroma and sentence-transformers are installed, this module will use them
to create and query a vector collection. Otherwise it falls back to the simple
token-set (Jaccard) in-memory store implemented below.

Note: This prototype uses an in-process Chroma client (no external server).
"""
from typing import List, Dict, Any
import re
import logging

logger = logging.getLogger(__name__)

try:
    import chromadb
    from chromadb.utils import embedding_functions
    from sentence_transformers import SentenceTransformer
    _CHROMA_AVAILABLE = True
except Exception:
    _CHROMA_AVAILABLE = False


def _tokenize(text: str) -> List[str]:
    text = text.lower()
    tokens = re.findall(r"\w+", text)
    return tokens


class InMemoryDocStore:
    def __init__(self):
        self.docs: List[Dict[str, Any]] = []

    def add_document(self, doc_id: str, text: str, metadata: Dict[str, Any] = None):
        if metadata is None:
            metadata = {}
        tokens = set(_tokenize(text))
        self.docs.append({"id": doc_id, "text": text, "tokens": tokens, "metadata": metadata})

    def retrieve(self, query: str, k: int = 3) -> List[Dict[str, Any]]:
        qtokens = set(_tokenize(query))
        scores = []
        for d in self.docs:
            inter = len(qtokens & d["tokens"])
            union = len(qtokens | d["tokens"]) or 1
            score = inter / union
            scores.append((score, d))
        scores.sort(key=lambda x: x[0], reverse=True)
        return [d for s, d in scores[:k] if s > 0]


# Fallback global store
_MEMORY_STORE = InMemoryDocStore()


class ChromaDocStore:
    def __init__(self, collection_name: str = "budget_assist_docs"):
        # initialize Chroma client and sentence-transformers model
        self.client = chromadb.Client()
        self.collection_name = collection_name
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        try:
            self.collection = self.client.get_collection(collection_name)
        except Exception:
            self.collection = self.client.create_collection(collection_name)

    def add_document(self, doc_id: str, text: str, metadata: Dict[str, Any] = None):
        if metadata is None:
            metadata = {}
        emb = self.model.encode(text).tolist()
        # Chroma expects list inputs
        self.collection.add(ids=[doc_id], documents=[text], metadatas=[metadata], embeddings=[emb])

    def retrieve(self, query: str, k: int = 3) -> List[Dict[str, Any]]:
        qemb = self.model.encode(query).tolist()
        results = self.collection.query(query_embeddings=[qemb], n_results=k)
        out = []
        # results: dict with ids, distances, metadatas, documents
        docs = results.get("documents", [[]])[0]
        ids = results.get("ids", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        for i, d in enumerate(docs):
            out.append({"id": ids[i], "text": d, "metadata": metadatas[i]})
        return out


# Choose store implementation
_DOC_STORE = None
if _CHROMA_AVAILABLE:
    try:
        _DOC_STORE = ChromaDocStore()
    except Exception as e:
        logging.warning("Chroma initialization failed, falling back to in-memory store: %s", e)
        _DOC_STORE = _MEMORY_STORE
else:
    _DOC_STORE = _MEMORY_STORE


def add_financial_docs(docs: List[Dict[str, Any]]):
    """Add docs where each doc is {id, text, metadata?}. Uses Chroma if available."""
    for d in docs:
        _DOC_STORE.add_document(d.get("id"), d.get("text"), d.get("metadata"))


def retrieve_context(query: str, k: int = 3) -> List[Dict[str, Any]]:
    """
    Retrieve relevant documents matching the query.
    Returns list of dicts with 'id', 'text', and 'metadata' keys.
    """
    hits = _DOC_STORE.retrieve(query, k=k)
    return hits


def initialize_with_financial_data():
    """
    Populate RAG with current financial data from storage.
    Called at app startup to seed the vector DB.
    """
    from app import storage

    docs_to_add = []

    logger.info("Initializing RAG with financial data...")

    # Add budgets as documents
    for budget in storage.budgets:
        doc_id = f"budget_{budget.id}"
        text = (
            f"Budget: {budget.name}. "
            f"Monthly limit: ${budget.monthly_limit}. "
            f"Alert threshold: {budget.alert_threshold * 100:.0f}%. "
            f"Category: {getattr(budget, 'category', budget.name)}"
        )
        docs_to_add.append({
            "id": doc_id,
            "text": text,
            "metadata": {
                "type": "budget",
                "budget_id": budget.id,
                "name": budget.name,
                "category": getattr(budget, 'category', budget.name)
            }
        })

    # Add goals as documents
    for goal in storage.goals:
        doc_id = f"goal_{goal.id}"
        text = (
            f"Goal: {goal.name}. "
            f"Target amount: ${goal.target_amount}. "
            f"Currently saved: ${goal.saved_amount}. "
            f"Progress: {goal.saved_amount/goal.target_amount*100:.0f}%"
        )
        if goal.target_date:
            text += f". Target date: {goal.target_date}"

        docs_to_add.append({
            "id": doc_id,
            "text": text,
            "metadata": {
                "type": "goal",
                "goal_id": goal.id,
                "name": goal.name,
                "target_date": str(goal.target_date) if goal.target_date else None
            }
        })

    # Add financial summary as a document
    summary = storage.get_financial_summary()
    text = (
        f"Financial summary: "
        f"Total income: ${summary.total_income}. "
        f"Total expenses: ${summary.total_expense}. "
        f"Balance: ${summary.total_balance}. "
        f"Number of transactions: {summary.transactions_count}"
    )
    docs_to_add.append({
        "id": "summary_current",
        "text": text,
        "metadata": {
            "type": "summary",
            "total_income": summary.total_income,
            "total_expense": summary.total_expense,
            "total_balance": summary.total_balance
        }
    })

    # Add default financial rules/policies
    docs_to_add.append({
        "id": "rule_budget_threshold",
        "text": "Budget alerts are triggered when spending reaches the alert threshold (typically 80% of limit). "
                "Critical alerts when spending exceeds the budget limit.",
        "metadata": {"type": "rule", "name": "budget_threshold"}
    })

    docs_to_add.append({
        "id": "rule_transaction_alerts",
        "text": "Large transactions over $500 trigger notifications. "
                "You are also alerted if your balance goes negative.",
        "metadata": {"type": "rule", "name": "transaction_alerts"}
    })

    if docs_to_add:
        add_financial_docs(docs_to_add)
        logger.info(f"Initialized RAG with {len(docs_to_add)} documents")

def sync_financial_data():
    """
    Refresh RAG with latest financial data.
    Call after budget/goal updates to keep context fresh.
    """
    # For now, we reinitialize. In production, could do partial updates.
    logger.info("Syncing financial data to RAG...")
    initialize_with_financial_data()


def format_context_for_prompt(documents: List[Dict[str, Any]]) -> str:
    """
    Format retrieved documents into a readable context string for LLM prompt.
    """
    if not documents:
        return ""

    pieces = []
    for doc in documents:
        text = doc.get("text", "")
        pieces.append(f"- {text}")

    return "\n".join(pieces)


def retrieve_and_format_context(query: str, k: int = 3) -> tuple[str, List[str]]:
    """
    Retrieve documents and format them for LLM prompt.
    Returns (formatted_context_string, list_of_doc_ids)
    """
    docs = retrieve_context(query, k=k)
    context_str = format_context_for_prompt(docs)
    doc_ids = [d.get("id") for d in docs]
    return context_str, doc_ids

