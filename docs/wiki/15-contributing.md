# 15 — Contributing

## Branching

- `main` is always shippable.
- Feature branches: `feat/<short-name>`.
- Bug-fix branches: `fix/<short-name>`.
- Doc-only: `docs/<short-name>`.

## Commit conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[body]
```

Types we use: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`.

Examples:
- `feat(hedge): add collar strategy`
- `fix(auth): don't fall back to admin SnapTrade secret for new DB users`
- `docs(wiki): add complete HedgeIQ documentation wiki`

## Pull requests

- Title: same format as the squashed commit.
- Body: must include a "Test plan" checklist.
- One reviewer required for code changes; doc-only PRs may self-merge.
- CI must be green before merge.
- Squash-merge to keep `main` history linear.

## Code review checklist

- [ ] Tests added/updated (unit + integration where applicable).
- [ ] Public APIs have docstrings.
- [ ] No new lint/tsc warnings.
- [ ] No secrets, no `console.log`, no `print(...)`.
- [ ] Migrations included if schema changed.
- [ ] User-facing strings localisation-ready (no concatenation).
- [ ] Accessibility: keyboard reachable, has aria-label where needed, axe clean.

## Style

- **Python**: `ruff` + `black` (line length 100). `mypy --strict` on `backend/domain/`.
- **TypeScript**: `eslint` + Prettier. `tsc --noEmit` must pass.
- **Imports**: stdlib → third-party → local; absolute imports preferred.
- **Comments**: explain *why*, not *what*. The code already says what.

## Issue triage

- Bugs: `bug`, plus a severity label (`sev:1`–`sev:4`).
- Features: `enhancement` + a phase label (`phase-2`, `phase-3`).
- Anything user-blocking → `priority:high` and assigned same day.
