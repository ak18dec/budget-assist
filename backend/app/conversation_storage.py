"""
SQLite-backed conversation history storage.

Supports:
- Multi-user conversation memory
- Efficient retrieval of recent turns
- Context formatting for LLM usage
- SaaS-ready architecture

Each user has isolated conversation history stored in the `conversations` table.
"""

import logging
from typing import List, Optional
from datetime import datetime
from app.db import get_connection

logger = logging.getLogger(__name__)


class ConversationTurn:
    """Represents a single conversation turn."""

    def __init__(self, user_id: int, role: str, content: str, created_at: Optional[datetime] = None):
        self.user_id = user_id
        self.role = role  # "user" or "assistant"
        self.content = content
        self.created_at = created_at or datetime.now()

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "role": self.role,
            "content": self.content,
            "created_at": self.created_at.isoformat()
        }

    def __repr__(self):
        return f"ConversationTurn(user_id={self.user_id}, role={self.role}, content={self.content[:40]}...)"



# -------------------------------------------------------------------
# Core Storage Functions
# -------------------------------------------------------------------

def add_turn(user_id: int, role: str, content: str) -> ConversationTurn:
    """
    Save a conversation turn for a user.
    """

    if role not in ("user", "assistant"):
        raise ValueError("Role must be 'user' or 'assistant'")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO conversations (user_id, role, content)
        VALUES (?, ?, ?)
        """,
        (user_id, role, content)
    )

    conn.commit()
    conn.close()

    logger.debug(f"Saved turn for user {user_id} as {role}")

    return ConversationTurn(user_id=user_id, role=role, content=content)



def get_recent_turns(user_id: int, limit: int = 20) -> List[ConversationTurn]:
    """
    Retrieve recent conversation turns for a user.
    Ordered chronologically (oldest → newest).
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT user_id, role, content, created_at
        FROM conversations
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
        """,
        (user_id, limit)
    )

    rows = cursor.fetchall()
    conn.close()

    # Reverse to chronological order
    rows = list(reversed(rows))

    turns = [
        ConversationTurn(
            user_id=row["user_id"],
            role=row["role"],
            content=row["content"],
            created_at=datetime.fromisoformat(row["created_at"])
            if isinstance(row["created_at"], str)
            else row["created_at"]
        )
        for row in rows
    ]

    logger.debug(f"Loaded {len(turns)} recent turns for user {user_id}")
    return turns



def get_context_string(user_id: int, limit: int = 20) -> str:
    """
    Format recent conversation turns into LLM-friendly context string.
    """

    turns = get_recent_turns(user_id, limit=limit)

    formatted = []
    for turn in turns:
        role_label = "User" if turn.role == "user" else "Assistant"
        formatted.append(f"{role_label}: {turn.content}")

    return "\n".join(formatted)



def get_full_conversation(user_id: int) -> List[ConversationTurn]:
    """
    Retrieve entire conversation history for a user.
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT user_id, role, content, created_at
        FROM conversations
        WHERE user_id = ?
        ORDER BY created_at ASC
        """,
        (user_id,)
    )

    rows = cursor.fetchall()
    conn.close()

    turns = [
        ConversationTurn(
            user_id=row["user_id"],
            role=row["role"],
            content=row["content"],
            created_at=datetime.fromisoformat(row["created_at"])
            if isinstance(row["created_at"], str)
            else row["created_at"]
        )
        for row in rows
    ]

    return turns



def clear_conversation(user_id: int) -> None:
    """
    Delete all conversation history for a user.
    Useful for testing or reset functionality.
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM conversations
        WHERE user_id = ?
        """,
        (user_id,)
    )

    conn.commit()
    conn.close()

    logger.info(f"Cleared conversation history for user {user_id}")