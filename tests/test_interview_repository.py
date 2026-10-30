import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock

from sqlalchemy.dialects import postgresql
from sqlalchemy.engine import create_mock_engine
from sqlalchemy.orm import Query, Session

from app.core.enums import InterviewStatus
from app.repositories.interview_repository import InterviewRepository


def test_completing_session_sets_completion_timestamp():
    db = MagicMock()
    session = SimpleNamespace(status=InterviewStatus.IN_PROGRESS, completed_at=None)
    db.query.return_value.filter.return_value.first.return_value = session

    updated = InterviewRepository().update_status(
        db=db,
        interview_session_id="session-id",
        new_status=InterviewStatus.COMPLETED,
    )

    assert updated is session
    assert session.status == InterviewStatus.COMPLETED
    assert session.completed_at.tzinfo == timezone.utc
    db.commit.assert_called_once()


def test_history_query_scopes_owner_and_uses_stable_cursor(monkeypatch):
    user_id = uuid.uuid4()
    cursor_id = uuid.uuid4()
    cursor_session = SimpleNamespace(
        id=cursor_id,
        created_at=datetime.now(timezone.utc),
    )
    repository = InterviewRepository()
    monkeypatch.setattr(
        repository,
        "get_by_id_for_user",
        lambda _db, _session_id, _user_id: cursor_session,
    )
    captured = {}

    def capture_query(query):
        captured["sql"] = str(query.statement.compile(dialect=postgresql.dialect()))
        return []

    monkeypatch.setattr(Query, "all", capture_query)
    db = Session(bind=create_mock_engine("postgresql://", lambda *_args, **_kwargs: None))

    result = repository.get_history_page_for_user(
        db=db,
        user_id=user_id,
        limit=10,
        cursor=cursor_id,
    )

    assert result == []
    assert "interview_sessions.user_id" in captured["sql"]
    assert "reports.interview_session_id" in captured["sql"]
    assert "conversation_turns.interview_session_id" in captured["sql"]
    assert "interview_sessions.created_at" in captured["sql"]
    assert "interview_sessions.id" in captured["sql"]
