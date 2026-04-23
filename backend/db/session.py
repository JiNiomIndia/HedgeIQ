"""SQLAlchemy session factory."""
import os

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from backend.config import settings
from backend.db.models import Base

# Ensure the data directory exists for SQLite databases
if settings.database_url.startswith("sqlite:///"):
    db_path = settings.database_url.replace("sqlite:///", "", 1)
    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def check_db() -> dict:
    """Return DB health info — used by the status endpoint."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"ok": True, "url": settings.database_url}
    except Exception as exc:
        return {"ok": False, "url": settings.database_url, "error": str(exc)}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
