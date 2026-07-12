import uuid
from types import SimpleNamespace

from app.api.v1 import interview_sessions
from app.core.enums import InterviewStatus
from app.schemas.interview_blueprint import InterviewBlueprintCreate
from app.schemas.interview_runtime_schema import SubmitAnswerRequest
from app.services import interview_service


def test_submit_answer_endpoint_uses_service_handler(monkeypatch):
    session_id = uuid.uuid4()
    request = SubmitAnswerRequest(answer="sample answer")
    captured = {}

    def fake_submit_answer_service(db, interview_session_id, answer):
        captured["db"] = db
        captured["session_id"] = interview_session_id
        captured["answer"] = answer
        return {"ok": True}

    monkeypatch.setattr(
        interview_sessions,
        "submit_answer_service",
        fake_submit_answer_service,
    )

    object_instance = object()
    result = interview_sessions.submit_answer(
        session_id,
        request,
        object_instance,
    )

    assert result == {"ok": True}
    assert captured["session_id"] == session_id
    assert captured["answer"] == "sample answer"
    assert captured["db"] is object_instance


def test_submit_answer_returns_next_question_when_interview_is_not_complete(monkeypatch):
    session_id = uuid.uuid4()

    monkeypatch.setattr(
        interview_service.interview_repository,
        "get_by_id",
        lambda db, interview_session_id: SimpleNamespace(status=InterviewStatus.IN_PROGRESS),
    )
    monkeypatch.setattr(
        interview_service.interview_blueprint_repository,
        "get_by_session_id",
        lambda db, interview_session_id: SimpleNamespace(
            blueprint_json={
                "sections": [
                    {
                        "title": "Section 1",
                        "questions": [
                            {"question": "Question 1"},
                            {"question": "Question 2"},
                        ],
                    }
                ]
            }
        ),
    )
    monkeypatch.setattr(
        interview_service.conversation_turn_repository,
        "get_last_turn",
        lambda db, interview_session_id: None,
    )
    monkeypatch.setattr(
        interview_service,
        "evaluate_answer",
        lambda **kwargs: SimpleNamespace(model_dump=lambda: {"score": 1}),
    )
    monkeypatch.setattr(
        interview_service.conversation_turn_repository,
        "create",
        lambda **kwargs: None,
    )
    monkeypatch.setattr(
        interview_service.interview_repository,
        "update_status",
        lambda **kwargs: None,
    )

    result = interview_service.submit_answer(
        db=object(),
        interview_session_id=session_id,
        answer="sample answer",
    )

    assert result["interview_completed"] is False
    assert result["current_question"].turn_number == 2
    assert result["current_question"].section_title == "Section 1"
    assert result["current_question"].question == "Question 2"


def test_start_interview_sets_model_used_for_blueprint(monkeypatch):
    session_id = uuid.uuid4()

    monkeypatch.setattr(
        interview_service.interview_repository,
        "get_by_id",
        lambda db, interview_session_id: SimpleNamespace(
            planned_duration_minutes=30,
            difficulty=interview_service.InterviewDifficulty.MEDIUM,
        ),
    )
    monkeypatch.setattr(
        interview_service.candidate_profile_repository,
        "get_by_session_id",
        lambda db, interview_session_id: None,
    )
    monkeypatch.setattr(
        interview_service.job_profile_repository,
        "get_by_session_id",
        lambda db, interview_session_id: None,
    )
    monkeypatch.setattr(
        interview_service.interview_blueprint_repository,
        "get_by_session_id",
        lambda db, interview_session_id: None,
    )
    monkeypatch.setattr(
        interview_service.resume_repository,
        "get_by_session_id",
        lambda db, interview_session_id: SimpleNamespace(storage_path="resume.pdf"),
    )
    monkeypatch.setattr(
        interview_service.job_description_repository,
        "get_by_session_id",
        lambda db, interview_session_id: SimpleNamespace(storage_path="job_description.pdf"),
    )
    monkeypatch.setattr(interview_service, "extract_text", lambda path: "sample text")
    monkeypatch.setattr(
        interview_service,
        "generate_candidate_profile",
        lambda text: SimpleNamespace(model_dump=lambda: {"candidate": "profile"}),
    )
    monkeypatch.setattr(
        interview_service,
        "generate_job_profile",
        lambda text: SimpleNamespace(model_dump=lambda: {"job": "profile"}),
    )
    monkeypatch.setattr(
        interview_service,
        "generate_interview_blueprint",
        lambda **kwargs: SimpleNamespace(model_dump=lambda: {"sections": []}),
    )
    monkeypatch.setattr(interview_service.time, "sleep", lambda _: None)

    captured = {}

    monkeypatch.setattr(
        interview_service.candidate_profile_repository,
        "create",
        lambda db, candidate_profile: object(),
    )
    monkeypatch.setattr(
        interview_service.job_profile_repository,
        "create",
        lambda db, job_profile: object(),
    )

    def fake_blueprint_create(db, blueprint):
        captured["blueprint"] = blueprint
        return object()

    monkeypatch.setattr(
        interview_service.interview_blueprint_repository,
        "create",
        fake_blueprint_create,
    )
    monkeypatch.setattr(
        interview_service.interview_repository,
        "update_status",
        lambda db, interview_session_id, new_status: None,
    )

    result = interview_service.start_interview(db=object(), interview_session_id=session_id)

    assert result == {"Message": "Interview Session Started Successfully"}
    assert isinstance(captured["blueprint"], InterviewBlueprintCreate)
    assert captured["blueprint"].model_used == interview_service.settings.gemini_model
