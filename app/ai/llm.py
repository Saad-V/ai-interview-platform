from typing import Type, TypeVar
import json
from google import genai
from google.genai import types
from pydantic import BaseModel

from app.core.config import settings

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

    if getattr(response, "parsed", None) is not None:
        return response.parsed

    raw_text = getattr(response, "text", None)
    if raw_text:
        try:
            payload = json.loads(raw_text)
            return response_schema.model_validate(payload)
        except (json.JSONDecodeError, TypeError, ValueError) as exc:
            raise ValueError("Gemini returned an invalid structured response.") from exc

    raise ValueError("Gemini returned an invalid structured response.")