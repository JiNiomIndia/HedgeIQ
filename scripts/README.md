# Phase 2 Autonomous Run Scripts

## Files in this directory

| File | Purpose |
|---|---|
| `run-phase-2.ps1` | Windows PowerShell wrapper |
| `run-phase-2.sh` | macOS/Linux/WSL bash wrapper |

## How to execute the Phase 2 build autonomously

### Step 1 — Install prerequisites

You need:
- **Claude Code CLI** — `npm install -g @anthropic-ai/claude-code`
  (confirm with `claude --version`)
- **git**, **npm**, **gh** (GitHub CLI) on PATH
- `ANTHROPIC_API_KEY` env var set (for Claude CLI auth)
- `gh auth status` must show you logged in (for PR creation)

### Step 2 — Enable pre-authorized permissions (recommended)

Copy the Phase 2 permissions file into place:

```powershell
# Windows
Copy-Item .claude\settings.phase-2.json .claude\settings.local.json
```

```bash
# macOS/Linux
cp .claude/settings.phase-2.json .claude/settings.local.json
```

This whitelists every tool the autonomous prompt needs (git/npm/gh/edit/
browser automation/etc.) so there are zero approval dialogs during the
2-4 hour run.

### Step 3 — Run it

**Windows (PowerShell):**

```powershell
# Opus (best quality, ~$30-$40):
.\scripts\run-phase-2.ps1

# Or Sonnet (1/5th the cost, slightly less capable):
.\scripts\run-phase-2.ps1 -UseSonnet

# Dry-run to see the prompt first:
.\scripts\run-phase-2.ps1 -DryRun
```

**macOS/Linux/WSL:**

```bash
./scripts/run-phase-2.sh              # Opus
./scripts/run-phase-2.sh --sonnet     # Sonnet
./scripts/run-phase-2.sh --dry-run    # Preview only
```

The script will:

1. Verify prerequisites.
2. Ensure your working tree is clean.
3. Extract the prompt body from `docs/PHASE_2_AUTONOMOUS_PROMPT.md`.
4. Ask you to confirm with `YES` (the only manual interaction).
5. Pipe the prompt to `claude --dangerously-skip-permissions`.
6. Tee all output to `phase-2-run-<timestamp>.log`.
7. On completion, print and open the Phase 2 PR URL.

### Step 4 — Monitor progress (optional)

In a second terminal:

```powershell
# Windows
Get-Content phase-2-run-*.log -Wait -Tail 50
```

```bash
# macOS/Linux
tail -f phase-2-run-*.log
```

Or watch commits land in real time:

```bash
watch -n 30 'git log origin/phase-2 --oneline -15'
```

Or check Vercel preview deploys at https://vercel.com/<your-team>/hedge-iq.

### Step 5 — Review the PR

When the run finishes, the PR URL opens automatically. Review the diff,
check the Vercel preview URL listed in the PR description, and merge when
you're happy.

## What if it fails mid-run?

The prompt is designed to be **resumable**:
- Claude maintains progress in TodoWrite.
- Every completed session is committed and pushed, so re-running picks up
  from the current branch state.
- Just re-execute the same command; Claude reads the existing phase-2
  branch and continues from the first incomplete session.

If you want to start fresh:

```bash
git push origin --delete phase-2
./scripts/run-phase-2.sh  # will recreate the branch
```

## Cost estimate

| Model | Approx. cost | Approx. duration |
|---|---|---|
| claude-opus-4-7 | $25-$45 | 2-3 hours |
| claude-sonnet-4-5 | $5-$10 | 3-5 hours (more iterations) |

The in-app APIs (Polygon, Anthropic via the app itself, SnapTrade) will
also incur cost, but Session 7's tiered cache drops this dramatically — the
cache-first design means most repeated calls during later sessions hit the
ChromaCache instead of going live. Dev mode forces 10% live sampling for
API health monitoring.

## Safety rails

The `.claude/settings.phase-2.json` file explicitly **denies** these
destructive operations even in auto-approve mode:

- `rm -rf *` recursive deletion
- `git push --force` on any branch
- `git reset --hard`
- Any command with `--no-verify` (bypasses git hooks)

You can edit the deny list before running if you want even tighter rails.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `claude: command not found` | `npm install -g @anthropic-ai/claude-code` |
| `gh: command not found` | Install GitHub CLI from cli.github.com |
| "Uncommitted changes detected" | `git stash` or commit before running |
| Script hangs at "Looking for the Phase 2 PR" | Check `gh auth status` |
| Log shows "context window exceeded" | Use `--sonnet` or split into multiple runs; TodoWrite preserves state |
| Vercel preview URLs 404 | Branch push may have rate-limited Vercel — check dashboard |
| Claude asks for approval anyway | Ensure `.claude/settings.local.json` exists and has the allow list |
