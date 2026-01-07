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


def retrieve_context(query: str, k: int = 3) -> str:
    hits = _DOC_STORE.retrieve(query, k=k)
    pieces = []
    for h in hits:
        text = h.get("text") if isinstance(h.get("text"), str) else (h.get("documents") if h.get("documents") else "")
        pieces.append(f"- {h.get('id')}: {text[:200]}")
    return "\n".join(pieces)

