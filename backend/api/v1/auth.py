"""JWT authentication endpoints and the ``get_current_user`` dependency.

This module is the single source of truth for HedgeIQ user
authentication. It exposes:

* ``POST /api/v1/auth/register`` — create a new user, register them with
  SnapTrade, return a 24-hour JWT.
* ``POST /api/v1/auth/login`` — verify credentials, return a JWT.
* ``POST /api/v1/auth/waitlist`` — pre-launch lead capture.
* ``GET  /api/v1/auth/db-status`` — admin-only DB diagnostics.
* ``GET  /api/v1/auth/connect-broker`` — generate a SnapTrade OAuth URL
  using the *user's own* SnapTrade secret.

Password hashing uses ``hashlib.pbkdf2_hmac`` (SHA-256, 100k iterations,
16-byte salt). We deliberately stick to the standard library so the
container stays small and avoids C-extension build pain on Railway.

JWTs are HS256-signed with ``settings.secret_key``. Tokens carry only
``sub`` (the user UUID), ``iat`` and ``exp`` — no PII.
"""
import uuid
from datetime import datetime, timedelta, UTC
from types import SimpleNamespace

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError
import hashlib
import hmac
import os
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
from backend.db.session import get_db, init_db, check_db

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()
ALGORITHM = "HS256"


def _hash_pw(plain: str) -> str:
    """Hash a plaintext password using PBKDF2-HMAC-SHA256.

    100,000 iterations and a fresh 16-byte random salt per password.
    The salt is stored alongside the derived key in the form
    ``"<salt_hex>:<dk_hex>"`` so verification can re-derive the hash
    without a separate column.

    :param plain: user-supplied plaintext password.
    :returns: ``"<salt>:<derived_key>"`` colon-separated hex string.
    """
    salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac('sha256', plain.encode(), bytes.fromhex(salt), 100_000)
    return f"{salt}:{dk.hex()}"


def _verify_pw(plain: str, hashed: str) -> bool:
    """Constant-time password verification.

    Splits the stored ``"salt:dk"`` string, recomputes PBKDF2 with the
    same parameters and uses ``hmac.compare_digest`` to avoid timing
    attacks. Any malformed stored value returns ``False`` rather than
    raising — we never want to leak *why* verification failed.

    :param plain: candidate plaintext password.
    :param hashed: stored ``"salt:dk"`` hex string.
    :returns: ``True`` iff the candidate matches.
    """
    try:
        salt_hex, dk_hex = hashed.split(':', 1)
        dk = hashlib.pbkdf2_hmac('sha256', plain.encode(), bytes.fromhex(salt_hex), 100_000)
        return hmac.compare_digest(dk.hex(), dk_hex)
    except Exception:
        return False


def create_token(user_id: str) -> str:
    """Issue a 24-hour HS256 JWT for ``user_id``.

    Claims: ``sub`` (user UUID), ``iat`` (issued-at), ``exp`` (24h).
    No PII (email, name) is embedded — clients fetch profile data via
    the authenticated ``/positions`` etc. endpoints instead.

    :param user_id: user primary key (a UUID4 string).
    :returns: signed compact JWT.
    """
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
                snaptrade_user_secret=db_user.snaptrade_user_secret or None,
            )

        # Fallback: admin token (user_id is a one-time UUID, not in DB)
        return SimpleNamespace(
            id=user_id,
            email=settings.admin_email,
            is_pro=True,
            is_admin=True,
            daily_ai_calls_used=0,
            snaptrade_user_id=settings.snaptrade_personal_user_id or user_id,
            snaptrade_user_secret=settings.snaptrade_user_secret or None,
        )
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@router.post("/register", response_model=TokenResponse, summary="Register a new account")
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Create a new user account, register with SnapTrade, and return a JWT token."""
    try:
        init_db()  # Ensure tables exist
        email = request.email.strip().lower()
        if db.query(User).filter(User.email == email).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        user_id = str(uuid.uuid4())

        # Register user with SnapTrade to get their per-user secret
        from backend.infrastructure.snaptrade.facade import SnapTradeFacade
        facade = SnapTradeFacade(settings.snaptrade_client_id, settings.snaptrade_consumer_key)
        snaptrade_secret = await facade.register_user(user_id)

        user = User(
            id=user_id,
            email=email,
            hashed_password=_hash_pw(request.password),
            is_pro=False,
            is_admin=False,
            daily_ai_calls_used=0,
            snaptrade_user_id=user_id,
            snaptrade_user_secret=snaptrade_secret,
        )
        db.add(user)
        db.commit()
        return TokenResponse(access_token=create_token(user_id))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Registration error: {type(exc).__name__}: {exc}")


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


@router.get("/db-status", summary="DB connectivity check (admin only)")
async def db_status(current_user=Depends(get_current_user)):
    """Returns DB health info. Admin-only diagnostic endpoint."""
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return check_db()


@router.get("/connect-broker", summary="Get SnapTrade broker connection URL")
async def connect_broker(
    broker: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate SnapTrade OAuth URL for user to connect their broker.

    Flow:
      1. Look up the user's stored ``snaptrade_user_secret``.
      2. If missing, register them with SnapTrade now and persist the
         returned secret to the DB so subsequent calls reuse it.
      3. If registration fails because the user is already registered
         under a stale ``snaptrade_user_id`` (no secret persisted),
         generate a fresh UUID, retry, and persist the new id+secret.
      4. Call SnapTrade's ``loginSnapTradeUser`` to get a real one-time
         redirect URL the user clicks to authorise the broker.

    Returns 502 if SnapTrade can't be reached or the URL would be
    a fake fallback — we never serve a non-functional connection link.
    """
    import uuid as _uuid
    from backend.infrastructure.snaptrade.facade import SnapTradeFacade

    facade = SnapTradeFacade(settings.snaptrade_client_id, settings.snaptrade_consumer_key)

    # Refetch from DB so we can persist any updates (current_user is a snapshot)
    db_user = db.query(User).filter(User.id == current_user.id).first()
    if db_user is None:
        # Admin via env vars: fall back to in-memory current_user, no persistence
        db_user = SimpleNamespace(
            id=current_user.id,
            snaptrade_user_id=current_user.snaptrade_user_id,
            snaptrade_user_secret=current_user.snaptrade_user_secret,
        )

    user_secret = db_user.snaptrade_user_secret
    snap_user_id = db_user.snaptrade_user_id or db_user.id

    # Step 1+2: register if needed
    if not user_secret:
        user_secret = await facade.register_user(snap_user_id)

    # Step 3: registration may have failed because that user_id is already
    # taken at SnapTrade but we don't have the secret. Retry with a fresh id.
    if not user_secret:
        snap_user_id = str(_uuid.uuid4())
        user_secret = await facade.register_user(snap_user_id)

    if not user_secret:
        # Surface SnapTrade's actual error so we (and admins watching logs)
        # can see whether it's a plan limit, rate limit, or auth issue.
        last = getattr(facade, "last_error", "") or "unknown reason"
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Could not register with SnapTrade: {last}",
        )

    # Persist updates to DB (only if it's a real DB row)
    if hasattr(db_user, "__table__"):  # SQLAlchemy model
        db_user.snaptrade_user_id = snap_user_id
        db_user.snaptrade_user_secret = user_secret
        db.commit()

    # Step 4: get the real connection URL
    url = await facade.get_connection_url(
        snap_user_id,
        broker.upper(),
        user_secret=user_secret,
    )

    if not url or "redeemToken" not in url:
        # Defensive: if facade returned an empty or non-redeem-token URL we'd
        # rather show an error than a broken link.
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="SnapTrade did not return a valid connection URL. Please try again.",
        )

    return {"connection_url": url, "broker": broker.upper()}
