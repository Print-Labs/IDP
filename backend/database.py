from sqlmodel import SQLModel, create_engine, Session
import os
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load .env from the backend directory
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback for safety/testing if not set, though it should be.
if not DATABASE_URL:
    raise ValueError(f"DATABASE_URL not found. Checked {env_path}")

engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session

def init_db():
    SQLModel.metadata.create_all(engine)
