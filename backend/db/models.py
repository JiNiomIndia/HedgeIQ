"""SQLAlchemy ORM models."""
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class User(Base):
    """User account model.

    Attributes:
        id: UUID primary key
        email: Unique login email
        hashed_password: bcrypt hash
        snaptrade_user_id: For SnapTrade broker connections
        snaptrade_user_secret: SnapTrade per-user secret
        is_pro: Pro subscription flag
        is_admin: Admin access flag
        daily_ai_calls_used: Reset at midnight ET
        daily_ai_calls_reset_date: Date of last reset
        created_at: Account creation timestamp
    """

    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    snaptrade_user_id = Column(String, nullable=True)
    snaptrade_user_secret = Column(String, nullable=True)
    is_pro = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    daily_ai_calls_used = Column(Integer, default=0)
    daily_ai_calls_reset_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class WaitlistEntry(Base):
    """Email waitlist for pre-launch signups."""

    __tablename__ = "waitlist"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False)
    signed_up_at = Column(DateTime, default=datetime.utcnow)
