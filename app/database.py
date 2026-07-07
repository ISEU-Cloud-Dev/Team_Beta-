import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./inventory.db")


def _build_engine(database_url: str):
    if database_url.startswith("sqlite"):
        return create_engine(
            database_url,
            connect_args={"check_same_thread": False},
            echo=True
        )

    try:
        engine = create_engine(database_url, echo=True)
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return engine
    except OperationalError:
        return create_engine(
            "sqlite:///./inventory.db",
            connect_args={"check_same_thread": False},
            echo=True
        )


engine = _build_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()