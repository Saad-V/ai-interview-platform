import time
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace

from fastapi import HTTPException
from google.genai import errors
import pytest

from app.api.v1 import interview_sessions
from app.core.enums import InterviewDifficulty, InterviewStatus
from app.core.interview_design import RUBRIC_VERSION
from app.schemas.interview_blueprint import InterviewBlueprintCreate
from app.schemas.interview_history import InterviewSessionHistoryPage
from app.schemas.interview_runtime_schema import (
    SubmitAnswerRequest,
    SubmitAnswerResponse,
)
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
                ],
                "rubric_version": RUBRIC_VERSION,
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
        lambda **kwargs: SimpleNamespace(model_dump=lambda **_dump_kwargs: {"score": 1}),
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
            difficulty=InterviewDifficulty.MEDIUM,
            status=InterviewStatus.CREATED,
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
    monkeypatch.setattr(time, "sleep", lambda _: None)

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


def test_start_interview_returns_503_when_ai_service_is_unavailable(monkeypatch):
    session_id = uuid.uuid4()

    monkeypatch.setattr(
        interview_service.interview_repository,
        "get_by_id",
        lambda db, interview_session_id: SimpleNamespace(
            planned_duration_minutes=30,
            difficulty=InterviewDifficulty.MEDIUM,
            status=InterviewStatus.CREATED,
        ),
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
        lambda text: (_ for _ in ()).throw(
            errors.ServerError(503, {"error": {"code": 503, "message": "high demand", "status": "UNAVAILABLE"}}, None)
        ),
    )
    monkeypatch.setattr(interview_service.interview_repository, "update_status", lambda **kwargs: None)

    try:
        interview_service.start_interview(db=object(), interview_session_id=session_id)
        assert False, "Expected HTTPException"
    except HTTPException as exc:
        assert exc.status_code == 503
        assert "temporarily unavailable" in exc.detail.lower()


def test_history_page_scopes_user_and_normalizes_report_fields(monkeypatch):
    user_id = uuid.uuid4()
    session_id = uuid.uuid4()
    session = SimpleNamespace(
        id=session_id,
        status=InterviewStatus.COMPLETED,
        difficulty=InterviewDifficulty.MEDIUM,
        planned_duration_minutes=30,
        created_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
    )
    report = SimpleNamespace(
        overall_score=84,
        report_json={
            "overall_percentage": 84,
            "technical_percentage": 82,
            "communication_percentage": 86,
            "strengths": ["Clear reasoning"],
            "areas_for_improvement": ["Add more detail"],
            "summary": "A strong interview.",
            "recommendation": "Hire",
        }
    )
    captured = {}

    def get_page(db, user_id, limit, cursor):
        captured.update(user_id=user_id, limit=limit, cursor=cursor)
        return [(session, report, 4), (SimpleNamespace(), None, 0)]

    monkeypatch.setattr(
        interview_service.interview_repository,
        "get_history_page_for_user",
        get_page,
    )

    result = interview_service.get_interview_history_page(
        db=object(),
        user_id=user_id,
        limit=1,
        cursor=None,
    )

    assert captured == {"user_id": user_id, "limit": 1, "cursor": None}
    assert isinstance(result, InterviewSessionHistoryPage)
    assert result.items[0].turn_count == 4
    assert result.items[0].report_preview is not None
    assert result.items[0].report_preview.overall_score == 84
    assert result.items[0].report_preview.summary == "A strong interview."
    assert result.items[0].report_preview.recommendation == "Hire"
    assert result.next_cursor == session_id


def test_history_page_rejects_cursor_not_owned_by_user(monkeypatch):
    monkeypatch.setattr(
        interview_service.interview_repository,
        "get_history_page_for_user",
        lambda **_kwargs: None,
    )

    with pytest.raises(HTTPException) as exc_info:
        interview_service.get_interview_history_page(
            db=object(),
            user_id=uuid.uuid4(),
            limit=20,
            cursor=uuid.uuid4(),
        )

    assert exc_info.value.status_code == 400


def test_history_detail_does_not_disclose_other_users_sessions(monkeypatch):
    monkeypatch.setattr(
        interview_service.interview_repository,
        "get_by_id_for_user",
        lambda **_kwargs: None,
    )

    with pytest.raises(HTTPException) as exc_info:
        interview_service.get_interview_history_detail(
            db=object(),
            interview_session_id=uuid.uuid4(),
            user_id=uuid.uuid4(),
        )

    assert exc_info.value.status_code == 404


def test_history_detail_accepts_legacy_report_fields(monkeypatch):
    session_id = uuid.uuid4()
    session = SimpleNamespace(
        id=session_id,
        status=InterviewStatus.COMPLETED,
        difficulty=InterviewDifficulty.MEDIUM,
        planned_duration_minutes=30,
        created_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
    )
    report = SimpleNamespace(
        overall_score=76,
        report_json={
            "overall_percentage": 76,
            "strengths": ["Clear explanation"],
            "improvements": ["Add more detail"],
            "summary": "A capable interview.",
            "hiring_recommendation": "Consider",
        },
    )
    monkeypatch.setattr(
        interview_service.interview_repository,
        "get_by_id_for_user",
        lambda **_kwargs: session,
    )
    monkeypatch.setattr(
        interview_service.report_repository,
        "get_by_session_id",
        lambda *_args: report,
    )
    monkeypatch.setattr(
        interview_service.interview_repository,
        "count_turns",
        lambda *_args: 2,
    )

    result = interview_service.get_interview_history_detail(
        db=object(),
        interview_session_id=session_id,
        user_id=uuid.uuid4(),
    )

    assert result.report is not None
    assert result.report.overall_score == 76
    assert result.report.technical_score is None
    assert result.report.areas_for_improvement == ["Add more detail"]
    assert result.report.recommendation == "Consider"


def test_turn_history_returns_answer_evaluation(monkeypatch):
    user_id = uuid.uuid4()
    session_id = uuid.uuid4()
    turn = SimpleNamespace(
        id=uuid.uuid4(),
        interview_session_id=session_id,
        turn_number=1,
        created_at=datetime.now(timezone.utc),
        completed_at=None,
        exchange_json={
            "section_title": "Experience",
            "question": "What did you improve?",
            "candidate_answer": "I simplified the deployment process.",
        },
        evaluation_json={
            "awarded_score": 8,
            "maximum_score": 10,
            "technical_percentage": 80,
            "communication_percentage": 90,
            "feedback": "A focused example.",
            "strengths": ["Clear outcome"],
            "weaknesses": [],
            "missing_topics": [],
            "suggested_improvement": "Quantify the time saved.",
        },
    )
    monkeypatch.setattr(
        interview_service.interview_repository,
        "get_by_id_for_user",
        lambda **_kwargs: SimpleNamespace(id=session_id),
    )
    monkeypatch.setattr(
        interview_service.conversation_turn_repository,
        "get_by_session_id",
        lambda **_kwargs: [turn],
    )

    result = interview_service.get_interview_turn_history(
        db=object(),
        interview_session_id=session_id,
        user_id=user_id,
    )

    assert len(result) == 1
    assert result[0].candidate_answer == "I simplified the deployment process."
    assert result[0].evaluation is not None
    assert result[0].evaluation.awarded_score == 8


def test_turn_history_accepts_legacy_answer_and_evaluation_fields(monkeypatch):
    session_id = uuid.uuid4()
    turn = SimpleNamespace(
        id=uuid.uuid4(),
        interview_session_id=session_id,
        turn_number=1,
        created_at=datetime.now(timezone.utc),
        completed_at=None,
        exchange_json={"question": "What did you improve?", "answer": "I simplified deployment."},
        evaluation_json={
            "score": 4,
            "strengths": ["Clear outcome"],
            "weaknesses": ["Needs a metric"],
            "feedback": "A useful example.",
        },
    )
    monkeypatch.setattr(
        interview_service.interview_repository,
        "get_by_id_for_user",
        lambda **_kwargs: SimpleNamespace(id=session_id),
    )
    monkeypatch.setattr(
        interview_service.conversation_turn_repository,
        "get_by_session_id",
        lambda **_kwargs: [turn],
    )

    result = interview_service.get_interview_turn_history(
        db=object(),
        interview_session_id=session_id,
        user_id=uuid.uuid4(),
    )

    assert result[0].candidate_answer == "I simplified deployment."
    assert result[0].evaluation is not None
    assert result[0].evaluation.score == 4
    assert result[0].evaluation.awarded_score is None


def test_final_report_uses_code_calculated_scores_not_narrative_model(monkeypatch):
    session_id = uuid.uuid4()
    evaluation_json = {
        "rubric_version": RUBRIC_VERSION,
        "awarded_score": 7,
        "maximum_score": 10,
        "score_percentage": 70.0,
        "technical_score": 6,
        "communication_score": 1,
        "technical_percentage": 75.0,
        "communication_percentage": 50.0,
        "criteria": [
            {"criterion_id": "ACCURACY", "maximum_score": 4, "awarded_score": 3},
            {"criterion_id": "COVERAGE", "maximum_score": 2, "awarded_score": 2},
            {"criterion_id": "REASONING", "maximum_score": 2, "awarded_score": 1},
            {"criterion_id": "COMMUNICATION", "maximum_score": 2, "awarded_score": 1},
        ],
        "feedback": "A relevant example.",
    }
    created_reports = []
    saved_turns = []
    monkeypatch.setattr(
        interview_service.interview_repository,
        "get_by_id",
        lambda **_kwargs: SimpleNamespace(status=InterviewStatus.IN_PROGRESS),
    )
    monkeypatch.setattr(
        interview_service.interview_blueprint_repository,
        "get_by_session_id",
        lambda **_kwargs: SimpleNamespace(
            blueprint_json={
                "rubric_version": RUBRIC_VERSION,
                "sections": [
                    {
                        "title": "Technical",
                        "questions": [{"question": "Explain database integrity."}],
                    }
                ],
            }
        ),
    )
    monkeypatch.setattr(
        interview_service.conversation_turn_repository,
        "get_last_turn",
        lambda **_kwargs: None,
    )
    monkeypatch.setattr(
        interview_service,
        "evaluate_answer",
        lambda **_kwargs: SimpleNamespace(model_dump=lambda **_dump_kwargs: evaluation_json),
    )
    monkeypatch.setattr(
        interview_service.conversation_turn_repository,
        "create",
        lambda **kwargs: saved_turns.append(kwargs["conversation_turn"]),
    )

    monkeypatch.setattr(
        interview_service.conversation_turn_repository,
        "get_by_session_id",
        lambda **_kwargs: [],
    )
    monkeypatch.setattr(
        interview_service.candidate_profile_repository,
        "get_by_session_id",
        lambda **_kwargs: object(),
    )
    monkeypatch.setattr(
        interview_service.job_profile_repository,
        "get_by_session_id",
        lambda **_kwargs: object(),
    )
    monkeypatch.setattr(
        interview_service,
        "generate_interview_report",
        lambda **_kwargs: SimpleNamespace(
            strengths=["Clear explanation"],
            areas_for_improvement=["Add detail"],
            summary="A capable answer.",
        ),
    )
    monkeypatch.setattr(
        interview_service.report_repository,
        "create",
        lambda **kwargs: created_reports.append(kwargs["report"]),
    )
    monkeypatch.setattr(
        interview_service.interview_repository,
        "update_status",
        lambda **_kwargs: None,
    )

    result = interview_service.submit_answer(
        db=object(),
        interview_session_id=session_id,
        answer="I used foreign keys.",
    )

    assert result["interview_completed"] is True
    assert result["report"]["overall_score"] == 70
    assert result["report"]["technical_score"] == 75
    assert result["report"]["communication_score"] == 50
    assert result["report"]["recommendation"] == "Hire"
    assert created_reports[0].overall_score == 70
    assert created_reports[0].report_json["total_awarded_score"] == 7
    assert created_reports[0].report_json["total_maximum_score"] == 10


def test_submit_answer_response_normalizes_final_report_scores():
    response = SubmitAnswerResponse.model_validate(
        {
            "interview_completed": True,
            "report": {
                "overall_percentage": 84,
                "technical_percentage": 82,
                "communication_percentage": 86,
                "strengths": ["Clear reasoning"],
                "areas_for_improvement": ["Add more detail"],
                "summary": "A strong interview.",
                "recommendation": "Hire",
            },
        }
    )

    assert response.report is not None
    assert response.report.model_dump() == {
        "overall_score": 84,
        "technical_score": 82,
        "communication_score": 86,
        "strengths": ["Clear reasoning"],
        "areas_for_improvement": ["Add more detail"],
        "summary": "A strong interview.",
        "recommendation": "Hire",
        "rubric_version": None,
        "total_awarded_score": None,
        "total_maximum_score": None,
        "question_count": None,
    }
