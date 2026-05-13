from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables from the root .env
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# Assemble DATABASE_URL from individual variables
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "lumina")

SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?client_encoding=utf8"

# Fix psycopg2 / libpq UnicodeDecodeError on Windows when username contains non-ASCII (Cyrillic) chars.
# By default, libpq searches for config files in %APPDATA% which contains the Cyrillic username.
# Overriding these environment variables to safe ASCII paths prevents the decoding crash.
import sys
if sys.platform.startswith("win"):
    os.environ["PGPASSFILE"] = "C:\\Users\\Public\\pgpass_dummy.conf"
    os.environ["PGSERVICEFILE"] = "C:\\Users\\Public\\pgservice_dummy.conf"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
