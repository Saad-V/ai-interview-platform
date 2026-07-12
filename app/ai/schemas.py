import uuid

from pydantic import BaseModel, Field

from app.core.enums import InterviewDifficulty


# ----------------------------
# Candidate Profile
# ----------------------------

class Education(BaseModel):
    degree: str | None = None
    specialization: str | None = None
    institution: str | None = None
    cgpa: float | None = None


class Project(BaseModel):
    name: str
    description: str
    technologies: list[str] = Field(default_factory=list)


class CandidateProfileSchema(BaseModel):
    summary: str = ""
    education: Education = Field(default_factory=Education)
    skills: list[str] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    experience: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)


# ----------------------------
# Job Profile
# ----------------------------

class JobProfileSchema(BaseModel):
    role: str = ""
    summary: str = ""
    required_skills: list[str] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)
    education_requirement: str | None = None
    experience_requirement: str | None = None


# ----------------------------
# Interview Blueprint
# ----------------------------

class EvaluationPointSchema(BaseModel):
    criterion: str
    description: str
    max_score: int


class InterviewQuestionSchema(BaseModel):
    question: str
    difficulty: InterviewDifficulty
    expected_topics: list[str] = Field(default_factory=list)
    follow_up_questions: list[str] = Field(default_factory=list)
    max_score: int
    evaluation_points: list[EvaluationPointSchema] = Field(default_factory=list)


class InterviewSectionSchema(BaseModel):
    title: str
    objective: str
    weight: int
    questions: list[InterviewQuestionSchema] = Field(default_factory=list)


class InterviewBlueprintSchema(BaseModel):
    duration_minutes: int
    difficulty: InterviewDifficulty
    overall_focus: list[str] = Field(default_factory=list)
    interview_instructions: str
    sections: list[InterviewSectionSchema] = Field(default_factory=list)


class InterviewReportSchema(BaseModel):
    overall_score: float
    technical_score: float
    communication_score: float

    strengths: list[str]
    areas_for_improvement: list[str]

    summary: str
    recommendation: str