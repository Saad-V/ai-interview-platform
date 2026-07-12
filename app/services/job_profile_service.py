from app.ai.llm import generate_structured_output
from app.ai.prompts import (
    JOB_PROFILE_SYSTEM_PROMPT,
    build_job_profile_prompt,
)
from app.ai.schemas import JobProfileSchema

def generate_job_profile(
    job_description_text: str,
) -> JobProfileSchema:
    user_prompt = build_job_profile_prompt(
        job_description_text
    )
    job_profile = generate_structured_output(
        system_prompt=JOB_PROFILE_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema=JobProfileSchema,
    )

    return job_profile