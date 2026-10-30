import pytest

from app.ai.prompts import build_interview_blueprint_prompt
from app.ai.prompts import build_answer_evaluation_prompt
from app.ai.schemas import (
    CandidateProfileSchema,
    InterviewBlueprintSchema,
    JobProfileSchema,
)
from app.core.enums import InterviewDifficulty
from app.core.interview_design import (
    QUESTION_MAX_SCORE,
    RUBRIC_MAX_SCORES,
    RUBRIC_VERSION,
    calculate_report_scores,
    question_count_for_duration,
    recommendation_for_score,
    section_question_counts,
)
from app.schemas.interview_session import InterviewSessionCreate


def _blueprint_payload(duration_minutes: int = 10) -> dict:
    counts = section_question_counts(question_count_for_duration(duration_minutes))
    sections = []
    for category, count in counts.items():
        sections.append({
            "category": category,
            "title": category.title(),
            "objective": f"Assess {category.lower()} skills.",
            "weight": {
                "INTRODUCTION": 10,
                "PROJECTS": 35,
                "TECHNICAL": 35,
                "BEHAVIORAL": 20,
            }[category],
            "questions": [
                {
                    "question": f"Question {index + 1} for {category}.",
                    "difficulty": InterviewDifficulty.EASY,
                    "expected_topics": ["A relevant concept"],
                    "follow_up_questions": [],
                    "max_score": QUESTION_MAX_SCORE,
                    "evaluation_points": [
                        {
                            "criterion_id": criterion_id,
                            "criterion": criterion_id.title(),
                            "description": f"Assess {criterion_id.lower()}.",
                            "max_score": maximum_score,
                        }
                        for criterion_id, maximum_score in RUBRIC_MAX_SCORES.items()
                    ],
                }
                for index in range(count)
            ],
        })

    return {
        "design_version": "rubric-v1",
        "rubric_version": RUBRIC_VERSION,
        "duration_minutes": duration_minutes,
        "difficulty": InterviewDifficulty.EASY,
        "overall_focus": ["Relevant fundamentals"],
        "interview_instructions": "Answer with clear examples.",
        "sections": sections,
    }


@pytest.mark.parametrize(
    ("duration", "expected_count"),
    [(10, 4), (20, 6), (30, 8), (45, 11), (60, 14), (90, 18), (120, 22)],
)
def test_duration_maps_to_deterministic_question_count(duration, expected_count):
    assert question_count_for_duration(duration) == expected_count
    counts = section_question_counts(expected_count)
    assert sum(counts.values()) == expected_count
    assert all(count >= 1 for count in counts.values())


@pytest.mark.parametrize("duration", [9, 121])
def test_duration_outside_supported_range_is_rejected(duration):
    with pytest.raises(ValueError, match="between 10 and 120"):
        question_count_for_duration(duration)


@pytest.mark.parametrize("duration", [9, 121])
def test_session_create_rejects_duration_outside_supported_range(duration):
    with pytest.raises(ValueError):
        InterviewSessionCreate(planned_duration_minutes=duration, difficulty="EASY")


def test_blueprint_schema_enforces_exact_counts_difficulty_and_rubric():
    blueprint = InterviewBlueprintSchema.model_validate(_blueprint_payload())

    assert sum(len(section.questions) for section in blueprint.sections) == 4
    assert all(question.max_score == 10 for section in blueprint.sections for question in section.questions)

    invalid = _blueprint_payload()
    invalid["sections"][0]["questions"].pop()
    with pytest.raises(ValueError, match="exactly"):
        InterviewBlueprintSchema.model_validate(invalid)


def test_blueprint_prompt_has_selected_level_and_exact_question_schedule():
    prompt = build_interview_blueprint_prompt(
        candidate_profile=CandidateProfileSchema(),
        job_profile=JobProfileSchema(),
        duration_minutes=30,
        difficulty=InterviewDifficulty.MEDIUM,
    )

    assert "Independent early-to-mid-level practitioner" in prompt
    assert "Total question count: 8" in prompt
    assert "PROJECTS: exactly 3 questions" in prompt
    assert "TECHNICAL: exactly 3 questions" in prompt


def test_answer_evaluation_prompt_receives_selected_difficulty_definition():
    prompt = build_answer_evaluation_prompt(
        question={
            "question": "Explain a foreign key.",
            "difficulty": "EASY",
            "expected_topics": ["Referential integrity"],
            "evaluation_points": [],
        },
        candidate_answer="A foreign key links rows.",
    )

    assert "Fresher / entry-level" in prompt
    assert "0-1 years" in prompt
    assert "Selected Difficulty:" in prompt


def test_report_scores_are_calculated_from_criterion_points():
    evaluation = {
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
    }

    assert calculate_report_scores([evaluation]) == {
        "overall_score": 70.0,
        "technical_score": 75.0,
        "communication_score": 50.0,
        "total_awarded_score": 7,
        "total_maximum_score": 10,
        "question_count": 1,
    }


def test_report_score_calculation_rejects_legacy_or_invalid_evaluations():
    with pytest.raises(ValueError, match="current scoring rubric"):
        calculate_report_scores([{"score": 8}])

    incomplete = {
        "rubric_version": RUBRIC_VERSION,
        "awarded_score": 5,
        "maximum_score": 10,
        "score_percentage": 50.0,
        "technical_score": 5,
        "communication_score": 0,
        "technical_percentage": 62.5,
        "communication_percentage": 0.0,
        "criteria": [
            {"criterion_id": "ACCURACY", "maximum_score": 4, "awarded_score": 5},
        ],
    }
    with pytest.raises(ValueError, match="outside its allowed range"):
        calculate_report_scores([incomplete])


@pytest.mark.parametrize(
    ("score", "expected_recommendation"),
    [
        (85, "Strong Hire"),
        (84.99, "Hire"),
        (70, "Hire"),
        (69.99, "Borderline"),
        (55, "Borderline"),
        (54.99, "No Hire"),
    ],
)
def test_recommendation_thresholds_are_deterministic(score, expected_recommendation):
    assert recommendation_for_score(score) == expected_recommendation
