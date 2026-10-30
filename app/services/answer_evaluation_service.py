from app.ai.schemas import AnswerEvaluationSchema
from app.ai.llm import generate_structured_output
from app.ai.prompts import (
    INTERVIEW_EVALUATION_SYSTEM_PROMPT,
    build_answer_evaluation_prompt,
)
from app.core.interview_design import RUBRIC_VERSION, RUBRIC_MAX_SCORES
from app.schemas.interview_history import AuditedAnswerEvaluation


def evaluate_answer(
    *,
    question: dict,
    candidate_answer: str,
) -> AuditedAnswerEvaluation:

    user_prompt = build_answer_evaluation_prompt(
        question=question,
        candidate_answer=candidate_answer,
    )

    evaluation: AnswerEvaluationSchema = generate_structured_output(
        system_prompt=INTERVIEW_EVALUATION_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema=AnswerEvaluationSchema,
        temperature=0.0,
    )

    expected_criteria = {
        point["criterion_id"]: point
        for point in question["evaluation_points"]
    }
    evaluated_criteria = {}
    for criterion in evaluation.criteria:
        criterion_id = criterion.criterion_id.value
        if criterion_id in evaluated_criteria:
            raise ValueError(f"Duplicate rubric evaluation for {criterion_id}.")
        if criterion_id not in expected_criteria:
            raise ValueError(f"Unexpected rubric evaluation for {criterion_id}.")

        rubric_point = expected_criteria[criterion_id]
        maximum_score = RUBRIC_MAX_SCORES[criterion_id]
        if criterion.awarded_score > maximum_score:
            raise ValueError(f"{criterion_id} score exceeds its {maximum_score}-point limit.")

        evidence = criterion.evidence.strip()
        if evidence != "Not present in the answer.":
            normalized_answer = " ".join(candidate_answer.casefold().split())
            normalized_evidence = " ".join(evidence.casefold().split()).strip("\"'")
            if not normalized_evidence or normalized_evidence not in normalized_answer:
                raise ValueError(
                    f"{criterion_id} evidence must quote the candidate answer."
                )
        elif criterion.awarded_score:
            raise ValueError(
                f"{criterion_id} cannot receive points without answer evidence."
            )

        evaluated_criteria[criterion_id] = {
            "criterion_id": criterion_id,
            "criterion": rubric_point["criterion"],
            "description": rubric_point["description"],
            "maximum_score": maximum_score,
            "awarded_score": criterion.awarded_score,
            "evidence": evidence,
        }

    if set(evaluated_criteria) != set(RUBRIC_MAX_SCORES):
        raise ValueError("The evaluation must score every rubric criterion exactly once.")

    ordered_criteria = [
        evaluated_criteria[criterion_id]
        for criterion_id in RUBRIC_MAX_SCORES
    ]
    awarded_score = sum(item["awarded_score"] for item in ordered_criteria)
    technical_score = sum(
        item["awarded_score"]
        for item in ordered_criteria
        if item["criterion_id"] != "COMMUNICATION"
    )
    communication_score = evaluated_criteria["COMMUNICATION"]["awarded_score"]

    return AuditedAnswerEvaluation(
        rubric_version=RUBRIC_VERSION,
        awarded_score=awarded_score,
        maximum_score=sum(RUBRIC_MAX_SCORES.values()),
        technical_score=technical_score,
        communication_score=communication_score,
        score_percentage=round(awarded_score * 100 / sum(RUBRIC_MAX_SCORES.values()), 2),
        technical_percentage=round(
            technical_score * 100 / sum(
                RUBRIC_MAX_SCORES[criterion_id]
                for criterion_id in RUBRIC_MAX_SCORES
                if criterion_id != "COMMUNICATION"
            ),
            2,
        ),
        communication_percentage=round(
            communication_score * 100 / RUBRIC_MAX_SCORES["COMMUNICATION"],
            2,
        ),
        criteria=ordered_criteria,
        feedback=evaluation.feedback,
        strengths=evaluation.strengths,
        weaknesses=evaluation.weaknesses,
        missing_topics=evaluation.missing_topics,
        suggested_improvement=evaluation.suggested_improvement,
    )