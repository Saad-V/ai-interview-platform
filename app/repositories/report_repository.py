import uuid

from sqlalchemy.orm import Session

from app.models.report import Report
from app.schemas.report import ReportCreate


class ReportRepository:

    def create(
        self,
        db: Session,
        report: ReportCreate,
    ) -> Report:

        report_model = Report(
            interview_session_id=report.interview_session_id,
            overall_score=report.overall_score,
            report_json=report.report_json,
            pdf_storage_path=report.pdf_storage_path,
        )

        db.add(report_model)

        try:
            db.commit()
            db.refresh(report_model)
        except Exception:
            db.rollback()
            raise

        return report_model

    def get_by_session_id(
        self,
        db: Session,
        interview_session_id: uuid.UUID,
    ) -> Report | None:

        return (
            db.query(Report)
            .filter(
                Report.interview_session_id == interview_session_id
            )
            .first()
        )