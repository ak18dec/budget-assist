"""
Conversation history storage using markdown files organized by date.
Stores all user conversations locally in user_data folder for privacy.
Each day gets its own .md file containing all conversations for that day.
All conversations within a day share context - the agent has access to the entire day's history.
"""
import os
import logging
from datetime import datetime, date
from typing import List, Tuple, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

# Create user_data directory if it doesn't exist
USER_DATA_DIR = Path(__file__).parent.parent / "user_data"
USER_DATA_DIR.mkdir(exist_ok=True)
CONVERSATIONS_DIR = USER_DATA_DIR / "conversations"
CONVERSATIONS_DIR.mkdir(exist_ok=True)

logger.info(f"Conversation storage initialized at: {CONVERSATIONS_DIR}")


class ConversationTurn:
    """Represents a single turn in a conversation."""

    def __init__(self, role: str, content: str, timestamp: Optional[datetime] = None):
        self.role = role  # "user" or "assistant"
        self.content = content
        self.timestamp = timestamp or datetime.now()

    def to_markdown(self) -> str:
        """Convert turn to markdown format."""
        time_str = self.timestamp.strftime("%H:%M:%S")
        role_label = "👤 User" if self.role == "user" else "🤖 Assistant"
        return f"**{role_label}** _{time_str}_\n\n{self.content}\n"

    def __repr__(self):
        return f"ConversationTurn({self.role}, {self.content[:50]}...)"


def get_daily_file() -> Path:
    """Get the markdown file path for today's date."""
    today = date.today().isoformat()  # Format: YYYY-MM-DD
    return CONVERSATIONS_DIR / f"{today}.md"


def _load_conversation() -> List[ConversationTurn]:
    """Load conversation history from today's markdown file."""
    file_path = get_daily_file()

    if not file_path.exists():
        return []

    turns = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Parse markdown format: look for USER/ASSISTANT markers
        lines = content.split('\n')
        current_role = None
        current_content = []
        current_time = None

        for line in lines:
            if '**👤 User**' in line or '**🤖 Assistant**' in line:
                # Save previous turn if exists
                if current_role and current_content:
                    turn_content = '\n'.join(current_content).strip()
                    turns.append(ConversationTurn(current_role, turn_content, current_time))

                # Start new turn
                current_role = "user" if "👤 User" in line else "assistant"
                current_content = []

                # Extract timestamp
                try:
                    time_str = line.split('_')[1]
                    current_time = datetime.strptime(time_str, "%H:%M:%S")
                    current_time = current_time.replace(
                        year=datetime.now().year,
                        month=datetime.now().month,
                        day=datetime.now().day
                    )
                except:
                    current_time = None
            elif line.strip() and current_role is not None:
                # Skip empty lines at turn boundaries
                if line.strip() not in ['', '---']:
                    current_content.append(line)

        # Add last turn
        if current_role and current_content:
            turn_content = '\n'.join(current_content).strip()
            turns.append(ConversationTurn(current_role, turn_content, current_time))

        logger.debug(f"Loaded {len(turns)} turns from today's conversation")
        return turns

    except Exception as e:
        logger.error(f"Error loading conversation: {e}")
        return []


def _save_conversation(turns: List[ConversationTurn]) -> None:
    """Save conversation history to today's markdown file."""
    file_path = get_daily_file()

    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            today = date.today().isoformat()
            f.write(f"# Conversation Log: {today}\n")
            f.write(f"Started: {turns[0].timestamp.isoformat() if turns else datetime.now().isoformat()}\n")
            f.write(f"Last updated: {datetime.now().isoformat()}\n\n")
            f.write("---\n\n")

            for turn in turns:
                f.write(turn.to_markdown())
                f.write("\n---\n\n")

        logger.debug(f"Saved {len(turns)} turns to today's conversation file")

    except Exception as e:
        logger.error(f"Error saving conversation: {e}")


def add_turn(role: str, content: str) -> ConversationTurn:
    """Add a turn to today's conversation history and save to file."""
    turns = _load_conversation()
    turn = ConversationTurn(role, content)
    turns.append(turn)
    _save_conversation(turns)
    return turn


def get_conversation_context(limit: Optional[int] = None) -> str:
    """
    Get formatted conversation history for LLM context.
    If limit is None, returns entire day's conversation.
    If limit is specified, returns last N turns.
    """
    turns = _load_conversation()

    if limit is not None:
        recent_turns = turns[-limit:] if len(turns) > limit else turns
    else:
        recent_turns = turns

    formatted = []
    for turn in recent_turns:
        role_label = "User" if turn.role == "user" else "Assistant"
        formatted.append(f"{role_label}: {turn.content[:100]}..." if len(turn.content) > 100 else f"{role_label}: {turn.content}")

    return "\n".join(formatted)


def get_full_conversation() -> List[ConversationTurn]:
    """Get complete conversation history for today."""
    return _load_conversation()


def list_conversations() -> List[Tuple[str, datetime]]:
    """List all conversation files with their timestamps."""
    conversations = []
    try:
        for file in CONVERSATIONS_DIR.glob("*.md"):
            date_str = file.stem  # YYYY-MM-DD format
            modified_time = datetime.fromtimestamp(file.stat().st_mtime)
            conversations.append((date_str, modified_time))

        # Sort by most recent first
        conversations.sort(key=lambda x: x[1], reverse=True)
        return conversations
    except Exception as e:
        logger.error(f"Error listing conversations: {e}")
        return []


def get_today_date() -> str:
    """Get today's date in YYYY-MM-DD format."""
    return date.today().isoformat()


def export_conversation(date_str: Optional[str] = None, format: str = "markdown") -> Optional[str]:
    """
    Export conversation for a specific date in different formats.
    If date_str is None, uses today's date.
    """
    if date_str is None:
        date_str = get_today_date()

    # Load the conversation (we need to read the file for a specific date)
    file_path = CONVERSATIONS_DIR / f"{date_str}.md"
    if not file_path.exists():
        logger.warning(f"No conversation file found for {date_str}")
        return None

    turns = _load_conversation_from_file(file_path)

    if format == "markdown":
        # Return markdown
        lines = [f"# Conversation Log: {date_str}\n"]
        for turn in turns:
            lines.append(turn.to_markdown())
        return "\n".join(lines)

    elif format == "text":
        # Return plain text
        lines = []
        for turn in turns:
            role = "USER" if turn.role == "user" else "ASSISTANT"
            lines.append(f"\n[{turn.timestamp.strftime('%H:%M:%S')}] {role}:")
            lines.append(turn.content)
        return "\n".join(lines)

    elif format == "json":
        # Return JSON
        import json
        data = {
            "date": date_str,
            "turns": [
                {
                    "role": turn.role,
                    "content": turn.content,
                    "timestamp": turn.timestamp.isoformat()
                }
                for turn in turns
            ]
        }
        return json.dumps(data, indent=2)

    return None


def _load_conversation_from_file(file_path: Path) -> List[ConversationTurn]:
    """Load conversation history from a specific file."""
    if not file_path.exists():
        return []

    turns = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.split('\n')
        current_role = None
        current_content = []
        current_time = None

        for line in lines:
            if '**👤 User**' in line or '**🤖 Assistant**' in line:
                if current_role and current_content:
                    turn_content = '\n'.join(current_content).strip()
                    turns.append(ConversationTurn(current_role, turn_content, current_time))

                current_role = "user" if "👤 User" in line else "assistant"
                current_content = []

                try:
                    time_str = line.split('_')[1]
                    current_time = datetime.strptime(time_str, "%H:%M:%S")
                    current_time = current_time.replace(
                        year=datetime.now().year,
                        month=datetime.now().month,
                        day=datetime.now().day
                    )
                except:
                    current_time = None
            elif line.strip() and current_role is not None:
                if line.strip() not in ['', '---']:
                    current_content.append(line)

        if current_role and current_content:
            turn_content = '\n'.join(current_content).strip()
            turns.append(ConversationTurn(current_role, turn_content, current_time))

        return turns

    except Exception as e:
        logger.error(f"Error loading conversation from file {file_path}: {e}")
        return []
