from app.ai.llm import generate_structured_output
from app.ai.prompts import (
    INTERVIEW_EVALUATION_SYSTEM_PROMPT,
    build_answer_evaluation_prompt,
)
from app.schemas.interview_runtime_schema import AnswerEvaluationSchema


def evaluate_answer(
    *,
    question: dict,
    candidate_answer: str,
) -> AnswerEvaluationSchema:

    user_prompt = build_answer_evaluation_prompt(
        question=question,
        candidate_answer=candidate_answer,
    )

    evaluation = generate_structured_output(
        system_prompt=INTERVIEW_EVALUATION_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema=AnswerEvaluationSchema,
    )

    return evaluation