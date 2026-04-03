# budget-assist

Budget Assist is a small prototype for a goals-based budgeting assistant. It includes a Python FastAPI backend and a minimal React frontend (Vite). The project demonstrates CRUD APIs, a tool-based agent, event-driven alerts.

Repository layout

- `backend/` — FastAPI backend
  - `app/main.py` — application entry and routers
  - `app/models.py` — Pydantic models
  - `app/db.py` — simple sqlite storage
  - `app/routes/` — API routes (transactions, budgets, goals, summary, chat, agent)
  - `app/agents/` — agent tools, intent classifier, eventing, notifier
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
- Event-driven alerts: events emitted (e.g., `transaction.created`) run handlers in `app/agents/eventing.py` and alerts are sent to registered webhooks via `app/agents/notifier.py`.

Next steps (suggestions)

- Replace rule-based intent classification with a production NLU or gated LLM service.
- Improve frontend with alert inbox.
