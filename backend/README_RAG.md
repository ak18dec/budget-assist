# RAG Prototype Notes

This prototype implements a minimal Retrieval-Augmented-Generation (RAG) stack.

`app/rag.py` now supports two backends:

- Chroma + `sentence-transformers` (preferred if installed) — vector embeddings + nearest-neighbor search.
- In-memory token-set fallback — Jaccard similarity on token sets when Chroma or embeddings are unavailable.

Usage:

```bash
# add docs
curl -X POST "http://localhost:8000/api/v1/rag/docs/add" -H "Content-Type: application/json" -d '[{"id":"doc1","text":"Your monthly rent is due on the 1st."}]'

# retrieve
curl "http://localhost:8000/api/v1/rag/docs/retrieve?q=rent"
```

Notes:
- To use the Chroma backend, install dependencies from `requirements.txt` and ensure `chromadb` and `sentence-transformers` are available.
- The included model is `all-MiniLM-L6-v2` from `sentence-transformers` (downloaded automatically).
- For production embedding providers and vector DBs, consider OpenAI embeddings + managed vector DB (Pinecone/Weaviate/Chroma with persistence).
