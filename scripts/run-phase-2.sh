#!/usr/bin/env bash
# HedgeIQ Phase 2 — Autonomous Run Wrapper (Bash/WSL/macOS/Linux)
#
# Usage:
#   ./scripts/run-phase-2.sh                 # Opus (best quality)
#   ./scripts/run-phase-2.sh --sonnet        # Sonnet (1/5th the cost)
#   ./scripts/run-phase-2.sh --dry-run       # Preview the prompt only

set -euo pipefail

MODEL="claude-opus-4-7"
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --sonnet)  MODEL="claude-sonnet-4-5" ;;
    --dry-run) DRY_RUN=1 ;;
    *) echo "Unknown arg: $arg"; exit 2 ;;
  esac
done

cd "$(dirname "$0")/.."

# ─── Prerequisites ────────────────────────────────────────────────────────
echo "→ Checking prerequisites..."
for bin in claude git npm gh; do
  command -v "$bin" >/dev/null 2>&1 || { echo "Missing: $bin" >&2; exit 1; }
done

# ─── Clean working tree ───────────────────────────────────────────────────
if [[ -n "$(git status --porcelain)" ]]; then
  echo "✗ Uncommitted changes. Commit or stash first." >&2
  git status --short
  exit 1
fi

# ─── Extract prompt body ──────────────────────────────────────────────────
PROMPT_FILE="docs/PHASE_2_AUTONOMOUS_PROMPT.md"
[[ -f "$PROMPT_FILE" ]] || { echo "Missing: $PROMPT_FILE" >&2; exit 1; }

PROMPT=$(awk '
  /^## Prompt body \(paste verbatim to Claude\)/ { in_section=1; next }
  in_section && /^```$/ { if (!started) { started=1; next } else { exit } }
  started
' "$PROMPT_FILE")

if [[ -z "$PROMPT" ]]; then
  echo "✗ Could not extract prompt body" >&2
  exit 1
fi

echo "  Prompt length: ${#PROMPT} chars"

# ─── Dry run preview ──────────────────────────────────────────────────────
if [[ "$DRY_RUN" -eq 1 ]]; then
  echo
  echo "=== DRY RUN: first 1500 chars ==="
  echo "${PROMPT:0:1500}"
  echo
  echo "=== would invoke claude with model=$MODEL ==="
  exit 0
fi

# ─── Confirm ──────────────────────────────────────────────────────────────
echo
echo "⚠  This runs autonomously 2-4 hours and spends Anthropic credits."
echo "   Model:  $MODEL"
echo "   Branch: phase-2 (will be created/reset)"
echo -n "Proceed? (type YES) "
read -r confirm
[[ "$confirm" == "YES" ]] || { echo "Aborted."; exit 0; }

LOG_FILE="phase-2-run-$(date +%Y%m%d-%H%M%S).log"
echo
echo "→ Logging to $LOG_FILE"
echo "→ Tail with: tail -f $LOG_FILE"
echo

# ─── Invoke Claude autonomously ───────────────────────────────────────────
set +e
echo "$PROMPT" | claude \
  --dangerously-skip-permissions \
  --model "$MODEL" \
  --output-format stream-json \
  2>&1 | tee "$LOG_FILE"
EXIT=$?
set -e

echo
echo "→ Claude exited with code $EXIT"

# ─── Find the PR ──────────────────────────────────────────────────────────
echo "→ Looking for the Phase 2 PR..."
PR_URL=$(gh pr list --head phase-2 --json url --jq '.[0].url' 2>/dev/null || echo "")
if [[ -n "$PR_URL" ]]; then
  echo "✓ PR: $PR_URL"
  # Open in default browser
  if   command -v xdg-open >/dev/null 2>&1; then xdg-open "$PR_URL"
  elif command -v open     >/dev/null 2>&1; then open     "$PR_URL"
  fi
else
  echo "  No PR for phase-2 yet — inspect $LOG_FILE for failure cause."
fi

# ─── macOS notification on completion ─────────────────────────────────────
if command -v osascript >/dev/null 2>&1; then
  osascript -e "display notification \"Exit $EXIT. See PR.\" with title \"HedgeIQ Phase 2 run finished\""
fi

exit "$EXIT"
