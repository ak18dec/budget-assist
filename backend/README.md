# budget-assist backend

This folder contains a beginner-friendly FastAPI backend scaffold with:

- `app/main.py` - FastAPI application and router wiring
- `app/models.py` - Pydantic models
- `app/storage.py` - simple in-memory storage (lists, helpers)
- `app/routes/*` - API routes for transactions, budgets, goals, summary, and chat
- `app/agents/` - empty agents package (for future tooling)

To run locally:

```bash
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
