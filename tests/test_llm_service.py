import unittest
from unittest.mock import patch

from google.genai import errors

from app.ai.llm import generate_structured_output
from app.ai.schemas import CandidateProfileSchema


class FakeResponse:
    def __init__(self, parsed=None, text=None):
        self.parsed = parsed
        self.text = text


class GenerateStructuredOutputTests(unittest.TestCase):
    def test_falls_back_to_json_text_when_parsed_output_missing(self):
        fake_response = FakeResponse(parsed=None, text='{"summary": "Recovered from text"}')

        with patch("app.ai.llm.primary_client.models.generate_content", return_value=fake_response):
            result = generate_structured_output(
                system_prompt="system",
                user_prompt="user",
                response_schema=CandidateProfileSchema,
            )

        self.assertEqual(result.summary, "Recovered from text")

    def test_retries_on_google_server_unavailable_without_status_code(self):
        unavailable_error = errors.ServerError(
            503,
            {"error": {"code": 503, "message": "high demand", "status": "UNAVAILABLE"}},
            None,
        )

        with patch("app.ai.llm._try_generate", side_effect=unavailable_error), patch("app.ai.llm.time.sleep") as sleep_mock:
            with self.assertRaises(errors.ServerError):
                generate_structured_output(
                    system_prompt="system",
                    user_prompt="user",
                    response_schema=CandidateProfileSchema,
                )

        self.assertGreaterEqual(sleep_mock.call_count, 1)


if __name__ == "__main__":
    unittest.main()
