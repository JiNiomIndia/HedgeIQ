"""Performance test conftest — ensures DB schema exists before login latency tests.

The performance suite runs in isolation from unit/integration tests. The login p95 test
hits the real `POST /api/v1/auth/login` endpoint which queries the `users` table
(to look up DB-backed users before falling back to the admin env-var path).
Without explicit schema creation, CI fails with `no such table: users`.

This autouse, session-scoped fixture calls `init_db()` once before any perf test runs.
"""
import pytest

from backend.db.session import init_db


@pytest.fixture(autouse=True, scope="session")
def _create_perf_test_schema():
    """Create all tables in the test SQLite DB before performance tests run.

    Scope=session: schema creation is idempotent and only needed once per run.
    Autouse: every test in this directory benefits without needing to opt in.
    """
    init_db()
    yield
