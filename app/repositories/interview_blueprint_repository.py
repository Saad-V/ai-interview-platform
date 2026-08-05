from sqlalchemy.orm import Session

from app.models.interview_blueprint import InterviewBlueprint
from app.schemas.interview_blueprint import InterviewBlueprintCreate


class InterviewBlueprintRepository:

    def create(
        self,
        db: Session,
        blueprint: InterviewBlueprintCreate,
    ) -> InterviewBlueprint:

        blueprint_model = InterviewBlueprint(
            interview_session_id=blueprint.interview_session_id,
            blueprint_json=blueprint.blueprint_json,
            model_used=blueprint.model_used,
        )

        db.add(blueprint_model)

        try:
            db.commit()
            db.refresh(blueprint_model)
        except Exception:
            db.rollback()
            raise

        return blueprint_model

    def create_or_update(
        self,
        db: Session,
        blueprint: InterviewBlueprintCreate,
    ) -> InterviewBlueprint:
        existing = self.get_by_session_id(
            db=db,
            interview_session_id=blueprint.interview_session_id,
        )
        if existing:
            existing.blueprint_json = blueprint.blueprint_json
            existing.model_used = blueprint.model_used
            try:
                db.commit()
                db.refresh(existing)
            except Exception:
                db.rollback()
                raise
            return existing
        return self.create(db=db, blueprint=blueprint)

    def get_by_session_id(
        self,
        db: Session,
        interview_session_id,
    ) -> InterviewBlueprint | None:

        return (
            db.query(InterviewBlueprint)
            .filter(
                InterviewBlueprint.interview_session_id
                == interview_session_id
            )
            .first()
        )