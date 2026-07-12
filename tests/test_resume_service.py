import unittest
import uuid
from io import BytesIO
from unittest.mock import MagicMock

from fastapi import HTTPException, UploadFile

from app.models.interview_session import InterviewSession
from app.services.job_description_service import create_job_description
from app.services.resume_service import create_resume


class UploadServiceTests(unittest.TestCase):
    def test_create_resume_rejects_unknown_session(self):
        db = MagicMock()
        db.query.return_value.get.return_value = None

        file = UploadFile(filename="resume.pdf", file=BytesIO(b"test"))

        with self.assertRaises(HTTPException) as context:
            create_resume(
                db=db,
                interview_session_id=uuid.uuid4(),
                file=file,
            )

        self.assertEqual(context.exception.status_code, 404)
        db.query.assert_called_once_with(InterviewSession)

    def test_create_job_description_rejects_unknown_session(self):
        db = MagicMock()
        db.query.return_value.get.return_value = None

        file = UploadFile(filename="job_description.pdf", file=BytesIO(b"test"))

        with self.assertRaises(HTTPException) as context:
            create_job_description(
                db=db,
                interview_session_id=uuid.uuid4(),
                file=file,
            )

        self.assertEqual(context.exception.status_code, 404)
        db.query.assert_called_once_with(InterviewSession)


if __name__ == "__main__":
    unittest.main()
