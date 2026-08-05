import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('.env')

conn = psycopg2.connect(os.environ['DATABASE_URL'])
conn.autocommit = True
with conn.cursor() as cur:
    cur.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
print("All tables and types dropped successfully!")
