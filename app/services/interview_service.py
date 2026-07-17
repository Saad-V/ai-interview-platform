import uuid
import time
from pathlib import Path
from fastapi import HTTPException
from sqlalchemy import extract
from sqlalchemy.orm import Session
from app.core.enums import InterviewDifficulty
from app.models.interview_session import InterviewSession
from app.repositories.candidate_profile_repository import CandidateProfileRepository
from app.repositories.interview_blueprint_repository import InterviewBlueprintRepository
from app.repositories.job_profile_repository import JobProfileRepository
from app.schemas import interview_session
from app.schemas.interview_blueprint import InterviewBlueprintCreate
from app.schemas.interview_session import InterviewSessionCreate
from app.repositories.interview_repository import InterviewRepository
from app.repositories.resume_repository import ResumeRepository
from app.repositories.job_description_repository import JobDescriptionRepository
from app.core.config import settings
from app.schemas.candidate_profile import CandidateProfileCreate, CandidateProfileResponse
from app.schemas.job_profile import JobProfileCreate, JobProfileResponse
from app.services.candidate_profile_service import generate_candidate_profile
from app.services.interview_blueprint_service import generate_interview_blueprint
from app.services.job_profile_service import generate_job_profile
from app.services.document_parser_service import extract_text
from app.core.enums import InterviewDifficulty, InterviewStatus
from app.repositories.conversation_turn import ConversationTurnRepository
from app.schemas.interview_runtime_schema import QuestionResponse
from app.services.answer_evaluation_service import evaluate_answer
from app.schemas.conversation_turn import ConversationTurnCreate
from app.repositories.report_repository import ReportRepository
from app.services.interview_report_service import generate_interview_report
from app.schemas.report import ReportCreate

interview_repository = InterviewRepository()
resume_repository = ResumeRepository()
job_description_repository = JobDescriptionRepository()

candidate_profile_repository = CandidateProfileRepository()
job_profile_repository = JobProfileRepository()
interview_blueprint_repository = InterviewBlueprintRepository()
conversation_turn_repository = ConversationTurnRepository()
report_repository = ReportRepository()

def create_interview(
        db: Session,
        interview: InterviewSessionCreate
) -> InterviewSession:
    return interview_repository.create(db, interview)

def start_interview(
    db: Session,
    interview_session_id: uuid.UUID,
):
    interview = interview_repository.get_by_id(
        db=db,
        interview_session_id=interview_session_id,
    )

    if interview is None:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found.",
        )

    if interview.status != InterviewStatus.CREATED:
        raise HTTPException(
            status_code=400,
            detail="Interview preparation already started.",
        )

    # Immediately lock the interview by updating status
    interview_repository.update_status(
        db=db,
        interview_session_id=interview_session_id,
        new_status=InterviewStatus.PARSING,
    )

    try:

        resume = resume_repository.get_by_session_id(
            db, interview_session_id
        )

        if resume is None:
            raise HTTPException(
                status_code=404,
                detail="Resume not found.",
            )

        job_description = job_description_repository.get_by_session_id(
            db, interview_session_id
        )

        if job_description is None:
            raise HTTPException(
                status_code=404,
                detail="Job description not found.",
            )

        # ---------------- Resume ----------------

        resume_text = extract_text(Path(resume.storage_path))

        candidate_profile = generate_candidate_profile(resume_text)

        candidate_profile_repository.create(
            db=db,
            candidate_profile=CandidateProfileCreate(
                interview_session_id=interview_session_id,
                profile_json=candidate_profile.model_dump(),
            ),
        )

        # Temporary due to Gemini free-tier RPM
        time.sleep(60)

        # ---------------- Job Description ----------------

        job_description_text = extract_text(
            Path(job_description.storage_path)
        )

        job_profile = generate_job_profile(job_description_text)

        job_profile_repository.create(
            db=db,
            job_profile=JobProfileCreate(
                interview_session_id=interview_session_id,
                profile_json=job_profile.model_dump(),
            ),
        )

        # Temporary due to Gemini free-tier RPM
        time.sleep(60)

        # ---------------- Blueprint ----------------

        blueprint = generate_interview_blueprint(
            candidate_profile=candidate_profile,
            job_profile=job_profile,
            duration_minutes=interview.planned_duration_minutes,
            difficulty=interview.difficulty,
        )

        interview_blueprint_repository.create(
            db=db,
            blueprint=InterviewBlueprintCreate(
                interview_session_id=interview_session_id,
                blueprint_json=blueprint.model_dump(),
                model_used=settings.gemini_model,
            ),
        )

        interview_repository.update_status(
            db=db,
            interview_session_id=interview_session_id,
            new_status=InterviewStatus.READY,
        )

        return {
            "Message": "Interview Session Started Successfully"
        }
    except Exception as e:
        # If any unexpected exception occurs during preparation,
        # set status back to CREATED and raise.
        interview_repository.update_status(
            db=db,
            interview_session_id=interview_session_id,
            new_status=InterviewStatus.CREATED,
        )
        raise e

def begin_interview(
    db: Session,
    interview_session_id: uuid.UUID,
):
    interview = interview_repository.get_by_id(
        db=db,
        interview_session_id=interview_session_id,
    )

    if interview is None:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found.",
        )

    if interview.status not in [InterviewStatus.READY, InterviewStatus.IN_PROGRESS]:
        raise HTTPException(
            status_code=400,
            detail="Interview is not ready to begin.",
        )

    blueprint = interview_blueprint_repository.get_by_session_id(
        db=db,
        interview_session_id=interview_session_id,
    )

    if blueprint is None:
        raise HTTPException(
            status_code=404,
            detail="Interview blueprint not found.",
        )

    last_turn = conversation_turn_repository.get_last_turn(
        db=db,
        interview_session_id=interview_session_id,
    )

    if last_turn is not None:
        raise HTTPException(
            status_code=400,
            detail="Interview is already in progress.",
        )

    if interview.status == InterviewStatus.READY:
        interview_repository.update_status(
            db=db,
            interview_session_id=interview_session_id,
            new_status=InterviewStatus.IN_PROGRESS,
        )

    sections = blueprint.blueprint_json["sections"]

    first_section = sections[0]
    first_question = first_section["questions"][0]

    return QuestionResponse(
    turn_number=1,
    section_title=first_section["title"],
    question=first_question["question"],
)


def submit_answer(
    db: Session,
    interview_session_id: uuid.UUID,
    answer: str,
):
    interview = interview_repository.get_by_id(db = db, interview_session_id = interview_session_id)

    if interview is None:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found.",
        )

    if interview.status != InterviewStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=400,
            detail="Interview is not in progress.",
        )
    
    blueprint = interview_blueprint_repository.get_by_session_id(
        db = db,
        interview_session_id = interview_session_id
    )
    if blueprint is None:
        raise HTTPException(
            status_code = 404,
            detail = 'Interview Blueprint details not found'
        )
    
    sections = blueprint.blueprint_json["sections"]

    questions = []

    for section in sections:
        for question in section["questions"]:
            questions.append(
                {
                    "section_title": section["title"],
                    "question": question,
                }
            )
    
    last_turn = conversation_turn_repository.get_last_turn(db = db, interview_session_id = interview_session_id)
    if last_turn is None:
        question_index = 0
        turn_number = 1
    else:
        question_index = last_turn.turn_number
        turn_number = last_turn.turn_number + 1
    
    current = questions[question_index]

    section_title = current["section_title"]
    current_question = current["question"]

    evaluation = evaluate_answer(
        question=current_question,
        candidate_answer=answer,
    )

    conversation_turn_repository.create(
    db=db,
    conversation_turn=ConversationTurnCreate(
        interview_session_id=interview_session_id,
        turn_number=turn_number,
        exchange_json={
            "section_title": section_title,
            "question": current_question["question"],
            "candidate_answer": answer,
        },
        evaluation_json=evaluation.model_dump(),
    ),
)
    next_question_index = question_index + 1
    if next_question_index >= len(questions):

        candidate_profile_entry = candidate_profile_repository.get_by_session_id(
            db=db,
            interview_session_id=interview_session_id,
        )

        job_profile_entry = job_profile_repository.get_by_session_id(
            db=db,
            interview_session_id=interview_session_id,
        )

        conversation_turns = conversation_turn_repository.get_by_session_id(
            db=db,
            interview_session_id=interview_session_id,
        )

        if candidate_profile_entry is None or job_profile_entry is None:
            raise HTTPException(
                status_code=500,
                detail="Interview preparation data is missing for report generation.",
            )

        report = generate_interview_report(
            candidate_profile=candidate_profile_entry.profile_json,
            job_profile=job_profile_entry.profile_json,
            blueprint=blueprint.blueprint_json,
            conversation_turns=[
                {
                    "exchange": turn.exchange_json,
                    "evaluation": turn.evaluation_json,
                }
                for turn in conversation_turns
            ],
        )

        report_repository.create(
            db=db,
            report=ReportCreate(
                interview_session_id=interview_session_id,
                overall_score=report.overall_score,
                report_json=report.model_dump(),
                pdf_storage_path=None,
            ),
        )

        interview_repository.update_status(
            db=db,
            interview_session_id=interview_session_id,
            new_status=InterviewStatus.COMPLETED,
        )

        return {
            "interview_completed": True,
            "report": report.model_dump(),
        }

    next_question = questions[next_question_index]
    return {
        "interview_completed": False,
        "current_question": QuestionResponse(
            turn_number=turn_number + 1,
            section_title=next_question["section_title"],
            question=next_question["question"]["question"],
        ),
    }


    
