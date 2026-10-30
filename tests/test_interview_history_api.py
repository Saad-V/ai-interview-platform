import uuid
from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.dependencies import get_current_user
from app.api.v1 import interview_sessions
from app.db.dependencies import get_db
from app.schemas.interview_history import InterviewSessionHistoryPage


def _create_test_app(user_id: uuid.UUID | None = None) -> FastAPI:
    app = FastAPI()
    app.include_router(interview_sessions.router, prefix="/api/v1")
    app.dependency_overrides[get_db] = lambda: iter([object()])
    if user_id is not None:
        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=user_id)
    return app


def test_history_endpoints_require_authentication():
    client = TestClient(_create_test_app())

    for path in (
        "/api/v1/interview-sessions/",
        f"/api/v1/interview-sessions/{uuid.uuid4()}",
        f"/api/v1/interview-sessions/{uuid.uuid4()}/turns",
    ):
        response = client.get(path)
        assert response.status_code == 401


def test_list_history_uses_authenticated_user_and_validates_page_size(monkeypatch):
    user_id = uuid.uuid4()
    captured = {}

    def get_page(db, user_id, limit, cursor):
        captured.update(user_id=user_id, limit=limit, cursor=cursor)
        return InterviewSessionHistoryPage(items=[], next_cursor=None)

    monkeypatch.setattr(interview_sessions, "get_interview_history_page", get_page)
    client = TestClient(_create_test_app(user_id))

    response = client.get("/api/v1/interview-sessions/?limit=25")

    assert response.status_code == 200
    assert response.json() == {"items": [], "next_cursor": None}
    assert captured == {"user_id": user_id, "limit": 25, "cursor": None}

    invalid_response = client.get("/api/v1/interview-sessions/?limit=101")
    assert invalid_response.status_code == 422
