from fastapi import FastAPI
from app.routes import transactions, budgets, goals, summary, chat, agent, rag_routes, notifications

app = FastAPI(title="budget-assist - backend")

app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["transactions"])
app.include_router(budgets.router, prefix="/api/v1/budgets", tags=["budgets"])
app.include_router(goals.router, prefix="/api/v1/goals", tags=["goals"])
app.include_router(summary.router, prefix="/api/v1/summary", tags=["summary"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(agent.router, prefix="/api/v1/agent", tags=["agent"])
app.include_router(rag_routes.router, prefix="/api/v1/rag", tags=["rag"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])

@app.get("/health")
def health():
    return {"status": "ok"}
