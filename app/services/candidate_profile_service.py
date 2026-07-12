from app.ai.llm import generate_structured_output
from app.ai.prompts import (
    CANDIDATE_PROFILE_SYSTEM_PROMPT,
    build_candidate_profile_prompt,
)
from app.ai.schemas import CandidateProfileSchema

def generate_candidate_profile(
    resume_text: str,
) -> CandidateProfileSchema:
    user_prompt = build_candidate_profile_prompt(resume_text)
    candidate_profile = generate_structured_output(
        system_prompt=CANDIDATE_PROFILE_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema=CandidateProfileSchema,
    )
    return candidate_profile