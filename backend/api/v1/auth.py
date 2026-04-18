"""JWT authentication endpoints and dependency."""
import uuid
from datetime import datetime, timedelta, UTC
from types import SimpleNamespace

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError

from backend.api.v1.schemas import (
    LoginRequest,
    TokenResponse,
    WaitlistRequest,
    WaitlistResponse,
)
from backend.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()
ALGORITHM = "HS256"


def create_token(user_id: str) -> str:
    """Create signed JWT access token.

    Args:
        user_id: User database ID

    Returns:
        Signed JWT string
    """
    now = datetime.now(UTC).replace(tzinfo=None)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + timedelta(hours=24),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """JWT dependency — validates token and returns user object.

    Raises:
        HTTPException 401: If token invalid or expired
    """
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.secret_key,
            algorithms=[ALGORITHM],
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        return SimpleNamespace(
            id=user_id,
            email=settings.admin_email,
            is_pro=True,
            is_admin=True,
            daily_ai_calls_used=0,
            snaptrade_user_id=settings.snaptrade_personal_user_id or user_id,
        )
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and get JWT token",
)
async def login(request: LoginRequest):
    """Authenticate with email/password, receive JWT access token."""
    if (
        request.email == settings.admin_email
        and request.password == settings.admin_password
    ):
        return TokenResponse(access_token=create_token(str(uuid.uuid4())))
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
    )


@router.post(
    "/waitlist",
    response_model=WaitlistResponse,
    summary="Join waitlist",
)
async def join_waitlist(request: WaitlistRequest):
    """Add email to pre-launch waitlist."""
    return WaitlistResponse(
        message="You're on the list! We'll notify you at launch.",
        position=47,
    )


@router.get(
    "/connect-broker",
    summary="Get SnapTrade broker connection URL",
)
async def connect_broker(
    broker: str,
    current_user=Depends(get_current_user),
):
    """Generate SnapTrade OAuth URL for user to connect their broker."""
    from backend.infrastructure.snaptrade.facade import SnapTradeFacade

    facade = SnapTradeFacade(
        settings.snaptrade_client_id,
        settings.snaptrade_consumer_key,
    )
    url = await facade.get_connection_url(current_user.snaptrade_user_id, broker.upper())
    return {"connection_url": url, "broker": broker.upper()}
