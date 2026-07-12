from app.ai.llm import generate_structured_output
from app.ai.prompts import (
    INTERVIEW_REPORT_SYSTEM_PROMPT,
    build_interview_report_prompt,
)
from app.ai.schemas import InterviewReportSchema


def generate_interview_report(
    *,
    candidate_profile: dict,
    job_profile: dict,
    blueprint: dict,
    conversation_turns: list[dict],
) -> InterviewReportSchema:

    prompt = build_interview_report_prompt(
        candidate_profile=candidate_profile,
        job_profile=job_profile,
        blueprint=blueprint,
        conversation_turns=conversation_turns,
    )

    return generate_structured_output(
        system_prompt=INTERVIEW_REPORT_SYSTEM_PROMPT,
        user_prompt=prompt,
        response_schema=InterviewReportSchema,
    )