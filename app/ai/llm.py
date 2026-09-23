from typing import Type, TypeVar
import json
from google import genai
from google.genai import errors, types
from pydantic import BaseModel
import time
from app.core.config import settings

MAX_RETRIES = 3
INITIAL_DELAY = 5

T = TypeVar("T", bound=BaseModel)

primary_client = genai.Client(api_key=settings.gemini_api_key)
secondary_client = genai.Client(api_key=settings.gemini_api_key_2) if settings.gemini_api_key_2 else primary_client


def _build_model_sequence() -> list[str]:
    models = [settings.gemini_model]
    for fallback in settings.gemini_fallback_models:
        if fallback and fallback not in models:
            models.append(fallback)
    return models


def _client_for_attempt(attempt: int) -> genai.Client:
    if attempt == 0 or not settings.gemini_api_key_2:
        return primary_client
    return secondary_client


def _is_retryable_503(exc: Exception) -> bool:
    status_value = getattr(exc, "status", None)
    if isinstance(status_value, int):
        return status_value == 503
    if isinstance(status_value, str):
        normalized = status_value.strip().upper()
        if normalized in {"503", "UNAVAILABLE"}:
            return True
    error_text = str(exc).upper()
    return "503" in error_text and "UNAVAILABLE" in error_text


def _try_generate(
    *,
    client: genai.Client,
    model: str,
    system_prompt: str,
    user_prompt: str,
    response_schema: Type[T],
) -> T:
    response = client.models.generate_content(
        model=model,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            response_mime_type="application/json",
            response_schema=response_schema,
            temperature=0.2,
        ),
    )

    if response.parsed is not None:
        return response.parsed

    raw_text = getattr(response, "text", None)
    if raw_text:
        try:
            return response_schema.model_validate_json(raw_text)
        except Exception:
            try:
                return response_schema.model_validate(json.loads(raw_text))
            except Exception:
                pass

    raise ValueError("Gemini response did not contain a valid parsed model or JSON payload.")


def generate_structured_output(
    *,
    system_prompt: str,
    user_prompt: str,
    response_schema: Type[T],
) -> T:
    model_sequence = _build_model_sequence()
    last_exception: Exception | None = None

    for fallback_model in model_sequence:
        for attempt in range(MAX_RETRIES):
            client = _client_for_attempt(attempt)
            try:
                return _try_generate(
                    client=client,
                    model=fallback_model,
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    response_schema=response_schema,
                )
            except errors.ServerError as e:
                last_exception = e
                if _is_retryable_503(e):
                    if attempt < MAX_RETRIES - 1:
                        delay = INITIAL_DELAY * (2 ** attempt)
                        print(
                            f"Gemini model {fallback_model} unavailable (503) on attempt {attempt + 1}. Retrying same model in {delay}s..."
                        )
                        time.sleep(delay)
                        continue
                    print(
                        f"Gemini model {fallback_model} unavailable after {MAX_RETRIES} retries. Trying fallback model."
                    )
                    break
                raise
            except Exception as e:
                last_exception = e
                if attempt < MAX_RETRIES - 1:
                    delay = INITIAL_DELAY * (2 ** attempt)
                    print(
                        f"Gemini request failed for model {fallback_model} on attempt {attempt + 1}. Retrying in {delay}s..."
                    )
                    time.sleep(delay)
                    continue
                print(
                    f"Gemini request failed for model {fallback_model} after {MAX_RETRIES} retries."
                )
                break

    if last_exception is not None:
        raise last_exception

    raise RuntimeError("Gemini request failed for all configured models.")