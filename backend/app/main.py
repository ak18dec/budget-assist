import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import transactions, budgets, goals, summary, chat, agent, rag_routes, notifications
from app.agents import notification_engine
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ✅ Startup
    notification_engine.setup_event_handlers()
    print("🚀 Notification engine handlers registered")
    print("🚀 Lifespan startup complete")
    yield

    # ✅ Shutdown (optional cleanup)
    print("🛑 Application shutting down")


app = FastAPI(
    title="budget-assist - backend",
    lifespan=lifespan
)


# Configure CORS (Cross-Origin Resource Sharing)
_cors_origins_env = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:5173,http://127.0.0.1:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins_env.split(",") if _cors_origins_env else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["transactions"])
app.include_router(budgets.router, prefix="/api/v1/budgets", tags=["budgets"])
app.include_router(goals.router, prefix="/api/v1/goals", tags=["goals"])
app.include_router(summary.router, prefix="/api/v1/summary", tags=["summary"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(agent.router, prefix="/api/v1/agent", tags=["agent"])
app.include_router(rag_routes.router, prefix="/api/v1/rag", tags=["rag"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])

@app.get("/")
def root():
    return {
        "message": "Welcome to the budget-assist backend API!",
        "version": "1.0.0",
        "features": [
            "Transaction Management",
            "Budgeting Tools",
            "Goal Setting",
            "Financial Summary",
            "Chat Interface",
            "AI Agent Assistance",
            "Retrieval-Augmented Generation (RAG)",
            "Notifications"
        ]
    }

@app.get("/health")
def health():
    return {"status": "ok"}
