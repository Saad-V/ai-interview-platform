from app.core.enums import InterviewDifficulty
from app.ai.schemas import CandidateProfileSchema, JobProfileSchema
import json


CANDIDATE_PROFILE_SYSTEM_PROMPT = """
You are an expert technical recruiter with extensive experience screening
software engineering resumes.

Your task is to analyze a candidate's resume and extract only factual
information.

Rules:

- Return ONLY valid JSON.
- Do not return markdown.
- Do not explain your reasoning.
- Do not hallucinate information.
- If information is missing, use empty strings, empty lists, or null values where appropriate.
- Do not infer skills, experience, or projects that are not explicitly mentioned.
- Preserve technology names exactly as written whenever possible.
-The summary must be factual and professional.

Do not use promotional language such as
"passionate",
"genuine",
"deep-rooted",
"highly motivated",
"enthusiastic",
or similar subjective adjectives.

Summarize only information explicitly present in the resume.
"""

def build_candidate_profile_prompt(
    resume_text: str,
) -> str:
    return f"""
    Analyze this resume.
    Resume:
    {resume_text}
    """


JOB_PROFILE_SYSTEM_PROMPT = """
You are an expert technical recruiter.

Your task is to analyze a job description and extract only factual
information.

Rules:

- Return ONLY valid JSON.
- Do not return markdown.
- Do not explain your reasoning.
- Do not hallucinate requirements.
- Extract only information explicitly mentioned.
- If information is missing, use empty strings, empty lists, or null values where appropriate.
- Limit the summary to 2–3 concise sentences describing the role and employer expectations.
"""

def build_job_profile_prompt(
    job_description_text: str,
) -> str:
    return f"""
Analyze the following Job Description and extract the requested information.

Job Description:

{job_description_text}
"""


INTERVIEW_BLUEPRINT_SYSTEM_PROMPT = """
You are an experienced technical interviewer and hiring manager.

Your task is to design a complete mock interview plan.

The generated blueprint must:

- Cover the most important topics from the candidate profile and job profile.
- Prioritize required job skills.
- Ask questions that fairly evaluate the candidate.
- Progress from easier questions to more challenging ones.
- Generate realistic follow-up questions.
- Generate evaluation criteria for every question.
- Return ONLY valid JSON.
- Do not return markdown.
- Do not explain your reasoning.
- Never hallucinate candidate information.
"""

def build_interview_blueprint_prompt(
    candidate_profile: CandidateProfileSchema,
    job_profile: JobProfileSchema,
    duration_minutes: int,
    difficulty: InterviewDifficulty,
) -> str:
    candidate_json = candidate_profile.model_dump_json(indent=2)
    job_json = job_profile.model_dump_json(indent=2)

    return f"""
Generate a complete interview blueprint.

Interview Duration:
{duration_minutes} minutes

Difficulty:
{difficulty.value}

The interview should approximately follow this structure:

- Introduction and resume overview: 10%
- Projects and practical experience: 35-40%
- Technical concepts and required job skills: 35-40%
- Behavioural and problem-solving questions: 15-20%

Guidelines:

- Prioritize skills that appear in both the candidate profile and the job profile.
- Generate realistic interview questions.
- Start with easier questions and gradually increase the difficulty.
- Every question must include:
  - Expected topics
  - Follow-up questions
  - Evaluation criteria
  - Maximum score
- Include enough questions to comfortably fill the interview duration.
- Focus more on projects if the candidate is a fresher with little or no work experience.
- Do not generate duplicate questions.
- The sum of all section weights must equal 100.

Candidate Profile:
{candidate_json}

Job Profile:
{job_json}
"""


INTERVIEW_EVALUATION_SYSTEM_PROMPT = """
You are an expert technical interviewer.

Your job is to evaluate ONLY the candidate's answer to ONE interview question.

You will receive:
- The interview question
- Expected topics that should ideally be covered
- Evaluation criteria
- Maximum score
- The candidate's answer

Rules:

1. Evaluate only what the candidate actually answered.
2. Do not assume knowledge that was not demonstrated.
3. Do not reward guessing.
4. Be objective and consistent.
5. Keep feedback constructive and concise.
6. Base the score on the supplied evaluation criteria.
7. The score must never exceed the provided maximum score.
8. Missing topics should only contain important concepts that were expected but not mentioned.
9. Strengths and weaknesses should be short bullet-style statements.
10. Return ONLY valid JSON matching the response schema.
"""

def build_answer_evaluation_prompt(
    *,
    question: dict,
    candidate_answer: str,
) -> str:
    return f"""
Question:
{question["question"]}

Maximum Score:
{question["max_score"]}

Expected Topics:
{question["expected_topics"]}

Evaluation Criteria:
{question["evaluation_points"]}

Candidate Answer:
{candidate_answer}
"""


INTERVIEW_REPORT_SYSTEM_PROMPT = """
You are an experienced technical interviewer.

You are provided with:
- Candidate Profile
- Job Profile
- Interview Blueprint
- All interview questions
- Candidate answers
- AI evaluations for every answer

Generate a final interview report.

Rules:

1. Base the report only on the provided interview data.
2. Do not invent strengths or weaknesses.
3. Scores should be realistic.
4. Communication score should reflect clarity and articulation.
5. Technical score should reflect technical knowledge demonstrated.
6. Overall score should reasonably combine both.
7. Recommendation must be one of:
   - Strong Hire
   - Hire
   - Borderline
   - No Hire
8. Return only valid JSON matching the schema.
"""



def build_interview_report_prompt(
    *,
    candidate_profile: dict,
    job_profile: dict,
    blueprint: dict,
    conversation_turns: list[dict],
) -> str:

    return f"""
Candidate Profile:
{json.dumps(candidate_profile, indent=2)}

Job Profile:
{json.dumps(job_profile, indent=2)}

Interview Blueprint:
{json.dumps(blueprint, indent=2)}

Conversation History:
{json.dumps(conversation_turns, indent=2)}
"""