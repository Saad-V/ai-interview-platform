from app.ai.llm import generate_structured_output
from app.ai.prompts import (
    INTERVIEW_REPORT_SYSTEM_PROMPT,
    build_interview_report_prompt,
)
from app.ai.schemas import InterviewReportNarrativeSchema


def generate_interview_report(
    *,
    blueprint: dict,
    conversation_turns: list[dict],
) -> InterviewReportNarrativeSchema:

    prompt = build_interview_report_prompt(
        blueprint=blueprint,
        conversation_turns=conversation_turns,
    )

    return generate_structured_output(
        system_prompt=INTERVIEW_REPORT_SYSTEM_PROMPT,
        user_prompt=prompt,
        response_schema=InterviewReportNarrativeSchema,
        temperature=0.0,
    )