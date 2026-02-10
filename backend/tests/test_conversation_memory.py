"""
Tests for conversation memory and markdown file storage
"""
import os
import tempfile
import shutil
from pathlib import Path
from datetime import datetime
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import conversation_storage
import uuid


def test_add_and_load_conversation():
    """Test adding turns to a conversation and loading them back"""
    session_id = str(uuid.uuid4())

    try:
        # Add some turns
        turn1 = conversation_storage.add_turn(session_id, "user", "Hello, can I spend $50 on groceries?")
        assert turn1.role == "user"
        assert turn1.content == "Hello, can I spend $50 on groceries?"

        turn2 = conversation_storage.add_turn(session_id, "assistant", "Yes, you can afford that within your budget.")
        assert turn2.role == "assistant"
        assert turn2.content == "Yes, you can afford that within your budget."

        # Load and verify
        turns = conversation_storage.get_full_conversation(session_id)
        assert len(turns) == 2
        assert turns[0].role == "user"
        assert turns[1].role == "assistant"

        print(f"✓ test_add_and_load_conversation passed (session: {session_id})")
        return True

    finally:
        # Cleanup
        conversation_storage.delete_session(session_id)


def test_conversation_context_formatting():
    """Test that conversation context is formatted correctly for LLM"""
    session_id = str(uuid.uuid4())

    try:
        # Add multiple turns
        conversation_storage.add_turn(session_id, "user", "I spent $100 on dining")
        conversation_storage.add_turn(session_id, "assistant", "Added to your dining expenses")
        conversation_storage.add_turn(session_id, "user", "How much have I spent on dining?")
        conversation_storage.add_turn(session_id, "assistant", "You've spent $100 on dining this month")

        # Get formatted context
        context = conversation_storage.get_conversation_context(session_id, limit=10)

        assert "User:" in context
        assert "Assistant:" in context
        assert "$100" in context
        assert "dining" in context

        print(f"✓ test_conversation_context_formatting passed")
        return True

    finally:
        conversation_storage.delete_session(session_id)


def test_conversation_file_creation():
    """Test that markdown files are created in the correct location"""
    session_id = str(uuid.uuid4())

    try:
        # Add a turn
        conversation_storage.add_turn(session_id, "user", "Test message")

        # Check file exists
        file_path = conversation_storage.get_session_file(session_id)
        assert file_path.exists(), f"Conversation file not created at {file_path}"

        # Check file path is in correct directory
        assert file_path.parent.name == "conversations"
        assert str(file_path).endswith(f"{session_id}.md")

        # Read file content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        assert "Conversation Session:" in content
        assert session_id in content
        assert "👤 User" in content or "User" in content
        assert "Test message" in content

        print(f"✓ test_conversation_file_creation passed (file: {file_path})")
        return True

    finally:
        conversation_storage.delete_session(session_id)


def test_list_sessions():
    """Test listing all conversation sessions"""
    session_ids = [str(uuid.uuid4()) for _ in range(3)]

    try:
        # Add turns to multiple sessions
        for sid in session_ids:
            conversation_storage.add_turn(sid, "user", f"Message in session {sid}")

        # List sessions
        sessions = conversation_storage.list_sessions()

        # Should have at least our 3 sessions
        assert len(sessions) >= 3, f"Expected at least 3 sessions, got {len(sessions)}"

        # Check format
        for sess_id, timestamp in sessions:
            assert isinstance(sess_id, str)
            assert isinstance(timestamp, datetime)

        print(f"✓ test_list_sessions passed ({len(sessions)} sessions found)")
        return True

    finally:
        for sid in session_ids:
            conversation_storage.delete_session(sid)


def test_export_formats():
    """Test exporting conversation in different formats"""
    session_id = str(uuid.uuid4())

    try:
        # Add turns
        conversation_storage.add_turn(session_id, "user", "What are my goals?")
        conversation_storage.add_turn(session_id, "assistant", "Your goal is to save $5000 by June 2026")

        # Test markdown export
        markdown_export = conversation_storage.export_conversation(session_id, format="markdown")
        assert markdown_export is not None
        assert "Conversation:" in markdown_export
        assert "$5000" in markdown_export

        # Test text export
        text_export = conversation_storage.export_conversation(session_id, format="text")
        assert text_export is not None
        assert "USER:" in text_export
        assert "ASSISTANT:" in text_export

        # Test JSON export
        json_export = conversation_storage.export_conversation(session_id, format="json")
        assert json_export is not None
        assert '"role"' in json_export
        assert '"content"' in json_export

        print(f"✓ test_export_formats passed (3 formats tested)")
        return True

    finally:
        conversation_storage.delete_session(session_id)


def test_delete_session():
    """Test deleting a conversation session"""
    session_id = str(uuid.uuid4())

    # Add a turn
    conversation_storage.add_turn(session_id, "user", "Test")

    # Verify file exists
    file_path = conversation_storage.get_session_file(session_id)
    assert file_path.exists()

    # Delete session
    result = conversation_storage.delete_session(session_id)
    assert result is True

    # Verify file is deleted
    assert not file_path.exists()

    # Verify loading returns empty list
    turns = conversation_storage.get_full_conversation(session_id)
    assert len(turns) == 0

    print(f"✓ test_delete_session passed")
    return True


def run_all_tests():
    """Run all conversation memory tests"""
    tests = [
        ("Add and Load Conversation", test_add_and_load_conversation),
        ("Conversation Context Formatting", test_conversation_context_formatting),
        ("Conversation File Creation", test_conversation_file_creation),
        ("List Sessions", test_list_sessions),
        ("Export Formats", test_export_formats),
        ("Delete Session", test_delete_session),
    ]

    print("\n" + "=" * 60)
    print("CONVERSATION MEMORY TESTS")
    print("=" * 60 + "\n")

    passed = 0
    failed = 0

    for test_name, test_func in tests:
        try:
            print(f"Running: {test_name}...")
            result = test_func()
            if result:
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"✗ {test_name} FAILED: {str(e)}")
            import traceback
            traceback.print_exc()
            failed += 1

    print("\n" + "=" * 60)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("=" * 60 + "\n")

    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
