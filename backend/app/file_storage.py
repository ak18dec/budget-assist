"""
File-based storage for persistent data.
Stores all transactions, budgets, goals, and notifications in JSON files.
Automatically loads data from files on startup.
"""
import json
import logging
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Dict, Any, List
from app.models import Transaction, Budget, Goal, Notification, TransactionType

logger = logging.getLogger(__name__)

# Create user_data/user-storage directory if it doesn't exist
USER_DATA_DIR = Path(__file__).parent.parent / "user_data"
USER_DATA_DIR.mkdir(exist_ok=True)
USER_STORAGE_DIR = USER_DATA_DIR / "user-storage"
USER_STORAGE_DIR.mkdir(exist_ok=True)

# File paths
TRANSACTIONS_FILE = USER_STORAGE_DIR / "transactions.json"
BUDGETS_FILE = USER_STORAGE_DIR / "budgets.json"
GOALS_FILE = USER_STORAGE_DIR / "goals.json"
NOTIFICATIONS_FILE = USER_STORAGE_DIR / "notifications.json"

logger.info(f"File-based storage initialized at: {USER_STORAGE_DIR}")


# --- JSON Serialization Helpers --- #
class DateTimeEncoder(json.JSONEncoder):
    """Custom JSON encoder for date and datetime objects."""
    def default(self, obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        return super().default(obj)


def serialize_data(data: Any) -> str:
    """Serialize data to JSON string."""
    return json.dumps(data, cls=DateTimeEncoder, indent=2)


def deserialize_json(filepath: Path) -> Dict[str, Any]:
    """Load JSON file and return as dict."""
    if not filepath.exists():
        return {}

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading {filepath}: {e}")
        return {}


# --- Transaction Storage --- #
def save_transactions(transactions: List[Transaction]) -> None:
    """Save transactions to transactions.json"""
    try:
        data = {
            "transactions": [
                {
                    "id": tx.id,
                    "amount": tx.amount,
                    "category": tx.category,
                    "date": tx.date.isoformat(),
                    "description": tx.description,
                    "type": tx.type.value
                }
                for tx in transactions
            ]
        }
        with open(TRANSACTIONS_FILE, 'w', encoding='utf-8') as f:
            f.write(serialize_data(data))
        logger.debug(f"Saved {len(transactions)} transactions to file")
    except Exception as e:
        logger.error(f"Error saving transactions: {e}")


def load_transactions() -> List[Transaction]:
    """Load transactions from transactions.json"""
    try:
        data = deserialize_json(TRANSACTIONS_FILE)
        transactions = []

        for tx_data in data.get("transactions", []):
            tx = Transaction(
                id=tx_data["id"],
                amount=tx_data["amount"],
                category=tx_data["category"],
                date=datetime.fromisoformat(tx_data["date"]).date(),
                description=tx_data.get("description"),
                type=TransactionType(tx_data["type"])
            )
            transactions.append(tx)

        logger.debug(f"Loaded {len(transactions)} transactions from file")
        return transactions
    except Exception as e:
        logger.error(f"Error loading transactions: {e}")
        return []


# --- Budget Storage --- #
def save_budgets(budgets: List[Budget]) -> None:
    """Save budgets to budgets.json"""
    try:
        data = {
            "budgets": [
                {
                    "id": b.id,
                    "name": b.name,
                    "category": b.category,
                    "monthly_limit": b.monthly_limit,
                    "alert_threshold": b.alert_threshold,
                    "spent_this_month": b.spent_this_month
                }
                for b in budgets
            ]
        }
        with open(BUDGETS_FILE, 'w', encoding='utf-8') as f:
            f.write(serialize_data(data))
        logger.debug(f"Saved {len(budgets)} budgets to file")
    except Exception as e:
        logger.error(f"Error saving budgets: {e}")


def load_budgets() -> List[Budget]:
    """Load budgets from budgets.json"""
    try:
        data = deserialize_json(BUDGETS_FILE)
        budgets = []

        for b_data in data.get("budgets", []):
            b = Budget(
                id=b_data["id"],
                name=b_data["name"],
                category=b_data["category"],
                monthly_limit=b_data["monthly_limit"],
                alert_threshold=b_data["alert_threshold"],
                spent_this_month=b_data.get("spent_this_month", 0.0)
            )
            budgets.append(b)

        logger.debug(f"Loaded {len(budgets)} budgets from file")
        return budgets
    except Exception as e:
        logger.error(f"Error loading budgets: {e}")
        return []


# --- Goal Storage --- #
def save_goals(goals: List[Goal]) -> None:
    """Save goals to goals.json"""
    try:
        data = {
            "goals": [
                {
                    "id": g.id,
                    "name": g.name,
                    "target_amount": g.target_amount,
                    "saved_amount": g.saved_amount,
                    "target_date": g.target_date.isoformat() if g.target_date else None,
                    "description": g.description
                }
                for g in goals
            ]
        }
        with open(GOALS_FILE, 'w', encoding='utf-8') as f:
            f.write(serialize_data(data))
        logger.debug(f"Saved {len(goals)} goals to file")
    except Exception as e:
        logger.error(f"Error saving goals: {e}")


def load_goals() -> List[Goal]:
    """Load goals from goals.json"""
    try:
        data = deserialize_json(GOALS_FILE)
        goals = []

        for g_data in data.get("goals", []):
            g = Goal(
                id=g_data["id"],
                name=g_data["name"],
                target_amount=g_data["target_amount"],
                saved_amount=g_data.get("saved_amount", 0.0),
                target_date=datetime.fromisoformat(g_data["target_date"]).date() if g_data.get("target_date") else None,
                description=g_data.get("description")
            )
            goals.append(g)

        logger.debug(f"Loaded {len(goals)} goals from file")
        return goals
    except Exception as e:
        logger.error(f"Error loading goals: {e}")
        return []


# --- Notification Storage --- #
def save_notifications(notifications: List[Notification]) -> None:
    """Save notifications to notifications.json"""
    try:
        data = {
            "notifications": [
                {
                    "id": n.id,
                    "notification_type": n.notification_type,
                    "title": n.title,
                    "message": n.message,
                    "created_at": n.created_at.isoformat(),
                    "read": n.read
                }
                for n in notifications
            ]
        }
        with open(NOTIFICATIONS_FILE, 'w', encoding='utf-8') as f:
            f.write(serialize_data(data))
        logger.debug(f"Saved {len(notifications)} notifications to file")
    except Exception as e:
        logger.error(f"Error saving notifications: {e}")


def load_notifications() -> List[Notification]:
    """Load notifications from notifications.json"""
    try:
        data = deserialize_json(NOTIFICATIONS_FILE)
        notifications = []

        for n_data in data.get("notifications", []):
            n = Notification(
                id=n_data["id"],
                notification_type=n_data["notification_type"],
                title=n_data["title"],
                message=n_data["message"],
                created_at=datetime.fromisoformat(n_data["created_at"]),
                read=n_data.get("read", False)
            )
            notifications.append(n)

        logger.debug(f"Loaded {len(notifications)} notifications from file")
        return notifications
    except Exception as e:
        logger.error(f"Error loading notifications: {e}")
        return []


# --- All Data Export (for RAG) --- #
def export_all_data() -> Dict[str, Any]:
    """Export all data in memory as dictionary for RAG ingestion."""
    return {
        "transactions": [
            {
                "id": tx.id,
                "amount": tx.amount,
                "category": tx.category,
                "date": tx.date.isoformat(),
                "description": tx.description,
                "type": tx.type.value
            }
            for tx in load_transactions()
        ],
        "budgets": [
            {
                "id": b.id,
                "name": b.name,
                "category": b.category,
                "monthly_limit": b.monthly_limit,
                "alert_threshold": b.alert_threshold,
                "spent_this_month": b.spent_this_month
            }
            for b in load_budgets()
        ],
        "goals": [
            {
                "id": g.id,
                "name": g.name,
                "target_amount": g.target_amount,
                "saved_amount": g.saved_amount,
                "target_date": g.target_date.isoformat() if g.target_date else None,
                "description": g.description
            }
            for g in load_goals()
        ],
        "notifications": [
            {
                "id": n.id,
                "notification_type": n.notification_type,
                "title": n.title,
                "message": n.message,
                "created_at": n.created_at.isoformat(),
                "read": n.read
            }
            for n in load_notifications()
        ]
    }
