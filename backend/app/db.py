from contextlib import contextmanager
import sqlite3
from pathlib import Path

DB_PATH = Path("finance.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    # Enforce foreign keys
    conn.execute("PRAGMA foreign_keys = ON;")

    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Enable WAL mode (better concurrency)
    cursor.execute("PRAGMA journal_mode=WAL;")

    # -----------------------
    # Transactions Table
    # -----------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL CHECK(amount >= 0),
        category TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('INCOME', 'EXPENSE')),
        date TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Index for faster queries
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);")

    # -----------------------
    # Budgets Table
    # -----------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL UNIQUE,
        monthly_limit REAL NOT NULL CHECK(monthly_limit > 0),
        spent_this_month REAL NOT NULL DEFAULT 0 CHECK(spent_this_month >= 0),
        alert_threshold REAL NOT NULL CHECK(alert_threshold > 0 AND alert_threshold <= 1),       
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);")

    cursor.executescript("""
    CREATE TRIGGER IF NOT EXISTS update_budget_on_transaction_insert
    AFTER INSERT ON transactions
    FOR EACH ROW
    WHEN NEW.type = 'EXPENSE'
    BEGIN
        UPDATE budgets
        SET spent_this_month = spent_this_month + NEW.amount
        WHERE LOWER(budgets.category) = LOWER(NEW.category);
    END;               
    """)



    # -----------------------
    # Goals Table
    # -----------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        target_amount REAL NOT NULL CHECK(target_amount > 0),
        saved_amount REAL NOT NULL DEFAULT 0 CHECK(saved_amount >= 0),
        target_date TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);")

    # -----------------------
    # Notifications Table
    # -----------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        notification_type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        read INTEGER NOT NULL DEFAULT 0 CHECK(read IN (0, 1)),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);")

    conn.commit()
    conn.close()

# ----------------------------------------------------
# Transaction Manager Wrapper
# ----------------------------------------------------

@contextmanager
def db_transaction():
    """
    Usage:

    with db_transaction() as cursor:
        cursor.execute(...)
        cursor.execute(...)
    """

    conn = get_connection()
    try:
        yield conn.cursor()
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()