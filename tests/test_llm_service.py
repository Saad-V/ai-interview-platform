import unittest
from unittest.mock import patch

from app.ai.llm import generate_structured_output
from app.ai.schemas import CandidateProfileSchema


class FakeResponse:
    def __init__(self, parsed=None, text=None):
        self.parsed = parsed
        self.text = text


class GenerateStructuredOutputTests(unittest.TestCase):
    def test_falls_back_to_json_text_when_parsed_output_missing(self):
        fake_response = FakeResponse(parsed=None, text='{"summary": "Recovered from text"}')

        with patch("app.ai.llm.client.models.generate_content", return_value=fake_response):
            result = generate_structured_output(
                system_prompt="system",
                user_prompt="user",
                response_schema=CandidateProfileSchema,
            )

        self.assertEqual(result.summary, "Recovered from text")


if __name__ == "__main__":
    unittest.main()
