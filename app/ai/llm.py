from typing import Type, TypeVar
import json
from google import genai
from google.genai import types
from pydantic import BaseModel
import time
from app.core.config import settings

MAX_RETRIES = 3
INITIAL_DELAY = 5

T = TypeVar("T", bound=BaseModel)

client = genai.Client(
    api_key=settings.gemini_api_key,
)


def generate_structured_output(
    *,
    system_prompt: str,
    user_prompt: str,
    response_schema: Type[T],
) -> T:
    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            response_mime_type="application/json",
            response_schema=response_schema,
            temperature=0.2,
        ),
    )

    for attempt in range(MAX_RETRIES):
        try:
            return response.parsed

        except Exception as e:
            if attempt == MAX_RETRIES - 1:
                raise

            delay = INITIAL_DELAY * (2 ** attempt)

            print(
                f"Gemini unavailable (503). "
                f"Retrying in {delay} seconds..."
            )

            time.sleep(delay)