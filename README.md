# budget-assist

Budget Assist is a small prototype for a goals-based budgeting assistant. It includes a Python FastAPI backend and a minimal React frontend (Vite). The project demonstrates CRUD APIs, a tool-based agent, a RAG prototype (Chroma optional), event-driven alerts and webhook delivery, and consent/auto-allocation rules.

Repository layout

- `backend/` — FastAPI backend
  - `app/main.py` — application entry and routers
  - `app/models.py` — Pydantic models
  - `app/storage.py` — in-memory storage (seeded with sample data)
  - `app/routes/` — API routes (transactions, budgets, goals, summary, chat, agent, rag, notifications)
  - `app/agents/` — agent tools, intent classifier, eventing, notifier, consent logic
  - `app/rag.py` — RAG: Chroma + sentence-transformers integration with in-memory fallback
  - `requirements.txt` — Python dependencies
  - `tests/` — pytest test suite

- `frontend/` — Vite + React 19 frontend
  - `src/` — React components (TransactionForm, TransactionList, Dashboard, ChatPanel)
  - `package.json` — npm scripts and deps

Quick start — backend

1. Create a virtual environment and install dependencies:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

2. Run the API server:

```bash
uvicorn app.main:app --reload --port 8000
```

3. Open health check: http://localhost:8000/health

Quick start — frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend APIs under the same origin (`/api/v1/...`). In development you may need to configure a proxy or run the frontend with a base path.

Testing

Run backend tests with pytest:

```bash
cd backend
pytest -q
```

Notes & features

- Intent extraction: simple local classifier in `app/agents/intent_classifier.py`. Can be replaced with an LLM or a trained model.
- Tool-based agent: tools live in `app/agents/tools.py` and are orchestrated by `app/agents/agent.py`.
- RAG: `app/rag.py` supports Chroma + `sentence-transformers` when installed; otherwise falls back to a token-based in-memory retriever.
- Event-driven alerts: events emitted (e.g., `transaction.created`) run handlers in `app/agents/eventing.py` and alerts are sent to registered webhooks via `app/agents/notifier.py`.
- Consent & auto-allocation: prototypes in `app/agents/consent.py` to suggest transfers without performing them.

Next steps (suggestions)

- Add persistent storage (Postgres) and persist Chroma vectors.
- Harden webhook delivery (HMAC signing, retries, delivery logs).
- Replace rule-based intent classification with a production NLU or gated LLM service.
- Improve frontend with alert inbox and RAG document manager.

If you'd like, I can implement any of the next steps (pick one) or adjust sample data and UI elements.
