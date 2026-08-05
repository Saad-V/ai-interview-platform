from app.ai.llm import generate_structured_output
from app.ai.prompts import (
    INTERVIEW_REPORT_SYSTEM_PROMPT,
    build_interview_report_prompt,
)
from app.ai.schemas import InterviewReportSchema


def generate_interview_report(
    *,
    blueprint: dict,
    conversation_turns: list[dict],
    total_awarded_score: int,
    total_maximum_score: int,
) -> InterviewReportSchema:

    prompt = build_interview_report_prompt(
        blueprint=blueprint,
        conversation_turns=conversation_turns,
        total_awarded_score=total_awarded_score,
        total_maximum_score=total_maximum_score,
    )

    return generate_structured_output(
        system_prompt=INTERVIEW_REPORT_SYSTEM_PROMPT,
        user_prompt=prompt,
        response_schema=InterviewReportSchema,
    )