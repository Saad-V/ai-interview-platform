import pytest

from app.ai.schemas import AnswerEvaluationSchema, CriterionEvaluationSchema
from app.core.interview_design import RubricCriterionId
from app.services import answer_evaluation_service


def _question() -> dict:
    return {
        "question": "Explain a database integrity decision.",
        "difficulty": "EASY",
        "expected_topics": ["Constraints", "validation"],
        "evaluation_points": [
            {
                "criterion_id": criterion_id.value,
                "criterion": criterion_id.value.title(),
                "description": f"Assess {criterion_id.value.lower()}.",
                "max_score": maximum_score,
            }
            for criterion_id, maximum_score in (
                (RubricCriterionId.ACCURACY, 4),
                (RubricCriterionId.COVERAGE, 2),
                (RubricCriterionId.REASONING, 2),
                (RubricCriterionId.COMMUNICATION, 2),
            )
        ],
    }


def _evaluation() -> AnswerEvaluationSchema:
    return AnswerEvaluationSchema(
        criteria=[
            CriterionEvaluationSchema(
                criterion_id=RubricCriterionId.ACCURACY,
                awarded_score=3,
                evidence="I used foreign keys",
            ),
            CriterionEvaluationSchema(
                criterion_id=RubricCriterionId.COVERAGE,
                awarded_score=1,
                evidence="I used foreign keys",
            ),
            CriterionEvaluationSchema(
                criterion_id=RubricCriterionId.REASONING,
                awarded_score=1,
                evidence="to enforce integrity",
            ),
            CriterionEvaluationSchema(
                criterion_id=RubricCriterionId.COMMUNICATION,
                awarded_score=2,
                evidence="I used foreign keys",
            ),
        ],
        feedback="A relevant example.",
        suggested_improvement="Add a concrete result.",
    )


def test_evaluate_answer_computes_and_persists_auditable_scores(monkeypatch):
    monkeypatch.setattr(
        answer_evaluation_service,
        "generate_structured_output",
        lambda **_kwargs: _evaluation(),
    )

    result = answer_evaluation_service.evaluate_answer(
        question=_question(),
        candidate_answer="I used foreign keys to enforce integrity.",
    )

    assert result.awarded_score == 7
    assert result.maximum_score == 10
    assert result.technical_score == 5
    assert result.communication_score == 2
    assert result.score_percentage == 70
    assert result.technical_percentage == 62.5
    assert result.communication_percentage == 100
    assert result.criteria[0].evidence == "I used foreign keys"


def test_evaluate_answer_rejects_unverifiable_evidence(monkeypatch):
    evaluation = _evaluation()
    evaluation.criteria[0].evidence = "I implemented robust transaction controls."
    monkeypatch.setattr(
        answer_evaluation_service,
        "generate_structured_output",
        lambda **_kwargs: evaluation,
    )

    with pytest.raises(ValueError, match="must quote the candidate answer"):
        answer_evaluation_service.evaluate_answer(
            question=_question(),
            candidate_answer="I used foreign keys to enforce integrity.",
        )


def test_evaluate_answer_rejects_points_without_evidence(monkeypatch):
    evaluation = _evaluation()
    evaluation.criteria[0].evidence = "Not present in the answer."
    monkeypatch.setattr(
        answer_evaluation_service,
        "generate_structured_output",
        lambda **_kwargs: evaluation,
    )

    with pytest.raises(ValueError, match="cannot receive points without answer evidence"):
        answer_evaluation_service.evaluate_answer(
            question=_question(),
            candidate_answer="No database detail.",
        )
