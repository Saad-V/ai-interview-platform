from app.ai.llm import client
from app.ai.schemas import CandidateProfileSchema
from google.genai import types

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='Return a short JSON object with name and title.',
    config=types.GenerateContentConfig(
        response_mime_type='application/json',
        response_schema=CandidateProfileSchema,
        temperature=0.2,
    ),
)
print(type(response))
print('parsed:', getattr(response, 'parsed', None))
print('text:', getattr(response, 'text', None))
print('candidates:', getattr(response, 'candidates', None))
