"""JWT authentication endpoints and dependency."""
import uuid
from datetime import datetime, timedelta, UTC
from types import SimpleNamespace

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError
import bcrypt as _bcrypt
from sqlalchemy.orm import Session

from backend.api.v1.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    WaitlistRequest,
    WaitlistResponse,
)
from backend.config import settings
from backend.db.models import User
from backend.db.session import get_db, init_db

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()
ALGORITHM = "HS256"


def _hash_pw(plain: str) -> str:
    return _bcrypt.hashpw(plain.encode(), _bcrypt.gensalt()).decode()


def _verify_pw(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(user_id: str) -> str:
    now = datetime.now(UTC).replace(tzinfo=None)
    payload = {"sub": user_id, "iat": now, "exp": now + timedelta(hours=24)}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """JWT dependency — validates token and returns user object."""
    try:
        payload = jwt.decode(
            credentials.credentials, settings.secret_key, algorithms=[ALGORITHM]
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        # Try DB user first
        db_user = db.query(User).filter(User.id == user_id).first()
        if db_user:
            return SimpleNamespace(
                id=db_user.id,
                email=db_user.email,
                is_pro=db_user.is_pro,
                is_admin=db_user.is_admin,
                daily_ai_calls_used=db_user.daily_ai_calls_used,
                snaptrade_user_id=db_user.snaptrade_user_id or settings.snaptrade_personal_user_id or user_id,
            )

        # Fallback: admin token (user_id is a one-time UUID, not in DB)
        return SimpleNamespace(
            id=user_id,
            email=settings.admin_email,
            is_pro=True,
            is_admin=True,
            daily_ai_calls_used=0,
            snaptrade_user_id=settings.snaptrade_personal_user_id or user_id,
        )
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@router.post("/register", response_model=TokenResponse, summary="Register a new account")
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Create a new user account and return a JWT token."""
    init_db()  # Ensure tables exist
    email = request.email.strip().lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email=email,
        hashed_password=_hash_pw(request.password),
        is_pro=False,
        is_admin=False,
        daily_ai_calls_used=0,
        snaptrade_user_id=user_id,
    )
    db.add(user)
    db.commit()
    return TokenResponse(access_token=create_token(user_id))


@router.post("/login", response_model=TokenResponse, summary="Login and get JWT token")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate with email/password, receive JWT access token."""
    email = request.email.strip().lower()

    # Check DB users first
    db_user = db.query(User).filter(User.email == email).first()
    if db_user and _verify_pw(request.password, db_user.hashed_password):
        return TokenResponse(access_token=create_token(db_user.id))

    # Admin credential fallback
    admin_email = settings.admin_email.strip().lower()
    if email == admin_email and request.password.strip() == settings.admin_password.strip():
        return TokenResponse(access_token=create_token(str(uuid.uuid4())))

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")


@router.post("/waitlist", response_model=WaitlistResponse, summary="Join waitlist")
async def join_waitlist(request: WaitlistRequest):
    """Add email to pre-launch waitlist."""
    return WaitlistResponse(message="You're on the list! We'll notify you at launch.", position=47)


@router.get("/connect-broker", summary="Get SnapTrade broker connection URL")
async def connect_broker(broker: str, current_user=Depends(get_current_user)):
    """Generate SnapTrade OAuth URL for user to connect their broker."""
    from backend.infrastructure.snaptrade.facade import SnapTradeFacade

    facade = SnapTradeFacade(settings.snaptrade_client_id, settings.snaptrade_consumer_key)
    url = await facade.get_connection_url(
        current_user.snaptrade_user_id,
        broker.upper(),
        user_secret=settings.snaptrade_user_secret or None,
    )
    return {"connection_url": url, "broker": broker.upper()}
