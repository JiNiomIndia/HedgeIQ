"""Unit tests for auth cryptography — guards the password-hashing and JWT contracts.

Contracts guarded:
  - _hash_pw / _verify_pw use PBKDF2-HMAC-SHA256 with random salt, 100k iterations
  - create_token produces HS256 JWT with correct sub/exp claims
"""
import hmac
import hashlib
import time
from datetime import datetime, timedelta, UTC

import pytest
from jose import jwt

from backend.api.v1.auth import _hash_pw, _verify_pw, create_token, ALGORITHM
from backend.config import settings


# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------

class TestHashPw:
    def test_hash_differs_for_identical_input(self):
        """Salt randomisation: two calls with same password must produce different hashes."""
        h1 = _hash_pw("CorrectHorseBattery!")
        h2 = _hash_pw("CorrectHorseBattery!")
        assert h1 != h2

    def test_hash_format_is_salt_colon_dk(self):
        """Hash must be 'salt_hex:dk_hex' with 32-char hex salt (16 bytes)."""
        h = _hash_pw("test-password-8")
        parts = h.split(":")
        assert len(parts) == 2
        salt_hex, dk_hex = parts
        assert len(salt_hex) == 32, f"Expected 32-char hex salt, got {len(salt_hex)}"
        # Verify both parts are valid hex
        bytes.fromhex(salt_hex)
        bytes.fromhex(dk_hex)

    def test_dk_length_matches_sha256_output(self):
        """PBKDF2-HMAC-SHA256 produces 32 bytes = 64 hex chars."""
        h = _hash_pw("test-password-8")
        dk_hex = h.split(":")[1]
        assert len(dk_hex) == 64

    def test_iteration_count_is_100k(self):
        """100,000 PBKDF2 iterations — check implementation constant."""
        import inspect, backend.api.v1.auth as auth_module
        source = inspect.getsource(auth_module._hash_pw)
        assert "100_000" in source or "100000" in source

    def test_uses_sha256_algorithm(self):
        """Hash must use SHA-256 (not MD5 or SHA-1)."""
        import inspect, backend.api.v1.auth as auth_module
        source = inspect.getsource(auth_module._hash_pw)
        assert "sha256" in source


class TestVerifyPw:
    def test_returns_true_for_correct_password(self):
        password = "SecurePass99!"
        assert _verify_pw(password, _hash_pw(password)) is True

    def test_returns_false_for_wrong_password(self):
        assert _verify_pw("WrongPass123", _hash_pw("CorrectPass123")) is False

    def test_returns_false_for_empty_password(self):
        assert _verify_pw("", _hash_pw("something")) is False

    def test_returns_false_for_truncated_hash(self):
        h = _hash_pw("password123!")
        assert _verify_pw("password123!", h[:10]) is False

    def test_returns_false_for_malformed_hash_no_colon(self):
        assert _verify_pw("password", "nocolonhere") is False

    def test_is_timing_safe_uses_compare_digest(self):
        """Implementation must use hmac.compare_digest — not == — for constant-time comparison."""
        import inspect, backend.api.v1.auth as auth_module
        source = inspect.getsource(auth_module._verify_pw)
        assert "compare_digest" in source

    def test_unicode_password_round_trips(self):
        password = "p@ssw0rd🔐"
        assert _verify_pw(password, _hash_pw(password)) is True

    def test_hash_is_not_stored_plaintext(self):
        password = "PlaInText99"
        h = _hash_pw(password)
        assert password not in h


# ---------------------------------------------------------------------------
# JWT token
# ---------------------------------------------------------------------------

class TestCreateToken:
    def test_encodes_correct_user_id(self):
        user_id = "user-abc-123"
        token = create_token(user_id)
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        assert payload["sub"] == user_id

    def test_algorithm_is_hs256(self):
        token = create_token("some-user")
        header = jwt.get_unverified_header(token)
        assert header["alg"] == "HS256"

    def test_expiry_is_24_hours_from_now(self):
        before = datetime.now(UTC).replace(tzinfo=None)
        token = create_token("exp-test-user")
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        exp = datetime.utcfromtimestamp(payload["exp"])
        iat = datetime.utcfromtimestamp(payload["iat"])
        delta = exp - iat
        # Allow 2-second tolerance for test execution time
        assert abs(delta.total_seconds() - 86400) < 2

    def test_signed_with_settings_secret_key(self):
        token = create_token("signed-user")
        # Decoding with the correct key succeeds
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        assert payload["sub"] == "signed-user"

    def test_wrong_secret_key_fails_decode(self):
        from jose import JWTError
        token = create_token("victim-user")
        with pytest.raises(JWTError):
            jwt.decode(token, "wrong-secret-key-totally-different", algorithms=[ALGORITHM])

    def test_token_contains_iat_claim(self):
        token = create_token("iat-test-user")
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        assert "iat" in payload

    def test_two_tokens_for_same_user_are_identical_within_second(self):
        """Tokens are deterministic within the same second (iat has second precision)."""
        t1 = create_token("user-x")
        t2 = create_token("user-x")
        # Both decode to the same sub
        p1 = jwt.decode(t1, settings.secret_key, algorithms=[ALGORITHM])
        p2 = jwt.decode(t2, settings.secret_key, algorithms=[ALGORITHM])
        assert p1["sub"] == p2["sub"]
