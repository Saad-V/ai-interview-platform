# test_connection.py

from sqlalchemy import create_engine, text
from app.core.config import settings

print(settings.database_url)

engine = create_engine(settings.database_url)

with engine.connect() as conn:
    result = conn.execute(text("SELECT 1"))
    print(result.scalar())