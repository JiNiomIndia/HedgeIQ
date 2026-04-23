# Phase 2 Kickoff Prompt

> Paste the entire block below (from "You are continuing…" to "…begin.")
> into a fresh Claude Desktop thread. Start the thread on **Sonnet 4.6**.
> Switch models only when the prompt tells you to.
>
> This prompt is resume-safe: if it stops mid-run, open a new thread and
> paste the same prompt — it reads git log and picks up from the next
> session automatically.

---

```
You are continuing HedgeIQ Phase 2 in a fresh Claude Desktop thread.
Everything you need is on disk + pushed to GitHub. Execute autonomously —
do not ask clarifying questions unless you hit a hard blocker defined
below.

Working directory: C:\AgenticAI\Claude Apps\HedgeIQ
Repo: https://github.com/JiNiomIndia/HedgeIQ
Deployed: backend on Railway, frontend on Vercel
User plan: Claude Max — quota is finite. Prefer Sonnet where allowed.

================================================================
PART A — GUARDRAILS (READ AND INTERNALIZE BEFORE ANY ACTION)
================================================================

These rules override convenience. Violating any of them means the
session is NOT done regardless of what you believe about the code.

A1. NO FABRICATION
   - Never claim a command ran without showing its actual output.
   - Never claim a test passed without pasting the assertion line.
   - Never claim a deploy succeeded without a real HTTP 200 from the
     Vercel URL (fetch it and log the status).
   - Never write "I believe this works" / "should be fine" / "this
     likely renders correctly". Either verify or mark as blocked.
   - If you did not read a file this session, you do not know what it
     contains. Read it before referring to its symbols.

A2. READ-BEFORE-WRITE
   - Before editing any file, Read it in full (or the relevant range).
   - Before creating a new file, check if it already exists — if yes,
     Read it and Edit, do not overwrite.
   - Before calling a function from another module, Read that module
     to confirm the signature. Do NOT guess signatures from memory.
   - Before importing a package, verify it is listed in package.json
     OR is named in the session's Prompt block install list.

A3. NO PHANTOM DEPENDENCIES
   - The only npm / pip packages you may install are those explicitly
     named in the current session's Prompt block in PHASE_2_ROADMAP.md.
   - If you feel you need an additional package, STOP and report:
     "Session N blocked: needs package X for reason Y. Approve?"
     Wait for the user to approve before installing.

A4. NO INVENTED APIs
   - Backend endpoints you call from the frontend must either (a) already
     exist in backend/ OR (b) be created in this same session with a
     matching route file, request/response schema, and a manual curl
     test that returns 200.
   - If you design a new endpoint, write it before the frontend code
     that calls it. Never write frontend code against an endpoint you
     haven't built and tested.

A5. LOOP BREAKER (3-strike rule)
   - If the same error or test failure recurs 3 times in a row after
     attempted fixes, STOP editing.
   - Re-read the failing file from scratch, re-read the error message
     literally, write a 3-sentence root-cause hypothesis, then try once
     more. If it fails a 4th time: commit what works, log to
     docs/PHASE_2_BLOCKERS.md with full context, and move to the next
     session. Do NOT flail.

A6. NO REPEATED WORK
   - Before starting each session, scan the last 20 commits (git log
     --oneline origin/phase-2 -20) to confirm the session hasn't
     already been completed or partially implemented.
   - Within a session: keep a mental note of files you've already
     modified this session. Do not re-modify the same file more than
     3 times — that signals churn. If you need a 4th edit, Read the
     file first and plan the full change before editing.

A7. SCREENSHOT AUTHENTICITY
   - Verification screenshots must come from the LIVE deployed Vercel
     URL, not localhost, not a static mock, not an error page.
   - Before claiming a screenshot proves a feature works, confirm the
     screenshot shows: (a) the expected URL in the address area when
     possible, (b) at least one text string specific to the new feature,
     (c) no "Application error" / "404" / "500" overlays.
   - If the browser rendered an error page, that is a failure — fix,
     redeploy, re-screenshot.

A8. PUSH VERIFICATION
   - After every git push, immediately run:
     git rev-parse HEAD
     git rev-parse origin/phase-2
     They must match. If they don't, push failed silently — investigate.
   - Never use --force, --force-with-lease, --no-verify, or any flag
     that bypasses hooks or history protection.
   - If push is rejected due to remote changes, run git pull --rebase,
     resolve any conflicts, re-verify build, then push. Never discard
     remote commits.

A9. HARD BLOCKERS — WHEN TO STOP AND ASK
   Stop execution and report to the user only when:
   (1) A secret/env var is missing from Railway (e.g. ANTHROPIC_API_KEY
       returns 401).
   (2) The repo is in a state you did not create (unexpected uncommitted
       files, different branch).
   (3) You need a new npm/pip package not listed in the session prompt.
   (4) After 3 loop-breaker resets on the same issue.
   (5) Vercel deploy fails 3 times in a row with the same error.
   For anything else: apply A5 loop breaker → A10 fail-forward.

A10. FAIL-FORWARD POLICY
   - A broken Acceptance Criterion does NOT block the rest of Phase 2.
   - If a criterion cannot be met after loop-breaker, log the exact
     criterion + failing behavior + your hypothesis in
     docs/PHASE_2_BLOCKERS.md under a session heading, commit it as
     part of the session's commit, and proceed to the next session.
   - Never delete partial work. Mark it WIP and move on.

A11. DONE-CLAIM CONTRACT
   "Session N complete" is only valid when ALL of these exist:
   - Commit SHA pushed to origin/phase-2 (verified via A8)
   - `npm run build` passed (paste the final line showing success)
   - Vercel deployment for that SHA returned HTTP 200 (paste curl
     output)
   - A screenshot file exists at docs/screenshots/sN-*.png
   - Every Acceptance Criterion from the session Prompt block is either
     ✅ verified OR ⚠️ logged in PHASE_2_BLOCKERS.md with justification
   If any of these are missing, the session is NOT done.

================================================================
PART B — MODEL STRATEGY
================================================================

Sessions 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 16, 17, 18 → Sonnet 4.6
Sessions 8, 12                                          → Opus 4.7
Sessions 14, 15                                         → Opus 4.7 1M

Before starting each session, check the current thread's model against
this table. If a switch is needed, STOP and respond with exactly:

  "Session N requires model X. Current thread is model Y. Please switch
  the thread model via the picker and send 'continue' so I resume."

Wait for the user to switch and reply 'continue' before proceeding.

================================================================
PART C — EXECUTION PROTOCOL
================================================================

## Step 0 — Load context (read in order, completely)

1. docs/PHASE_2_AUTONOMOUS_PROMPT.md
2. docs/PHASE_2_ROADMAP.md (section 4 holds all 18 session Prompt blocks)
3. docs/design/COMPONENT_MAP.md (every ❌ row is mandatory)
4. docs/design/README.md
5. docs/design/styles/theme.css
6. .claude/settings.phase-2.json

## Step 1 — Find the resume point

- git fetch origin
- git checkout phase-2 (if exists) OR
  git checkout -b phase-2 && git push -u origin phase-2
- git log --oneline origin/phase-2 -50
- Identify last completed session by commit prefix:
    feat(theme)   →S1    feat(widgets)→S2    feat(chart)   →S3
    feat(chain)   →S4    feat(position)→S5   feat(advisor) →S6
    feat(cache)   →S7    feat(orders)→S8     feat(realtime)→S9
    feat(polish)  →S10   feat(shell)→S11     feat(fm)      →S12
    feat(trade)   →S13   feat(commander)→S14
    feat(options-studio)→S15
    feat(research)→S16   feat(screens)→S17   feat(onboarding)→S18
- Report: "Last completed: Session N. Starting Session N+1. That
  session requires model X; current thread is model Y."
- Apply Part B (model switch) if needed.
- If no phase-2 commits exist, start at Session 1.

## Step 2 — Build the todo list

Create a TodoWrite list with all REMAINING sessions in order. Mark the
next one in_progress.

## Step 3 — Execution loop (per session)

  a. Part B model check. Stop and request switch if needed.
  b. Read the full Prompt block for this session from section 4 of
     PHASE_2_ROADMAP.md (Read tool, not from memory).
  c. Read every file path the Prompt block references in
     docs/design/src/ (A2 Read-before-write).
  d. Cross-check COMPONENT_MAP.md — any ❌ feature mapped to this
     session not explicitly in the Prompt block: implement anyway and
     note it in the commit body.
  e. Write a one-paragraph plan listing the files you will create or
     modify. This is your anti-churn reference (A6).
  f. Implement the Scope items in order. Respect A1–A4 on every edit.
  g. Run: cd frontend && npm run build
     Paste the success line (or the error if it fails). Fix and repeat
     under A5 loop breaker.
  h. If backend changed: run whatever pytest exists for that area.
     Paste the summary line.
  i. Commit with the EXACT conventional-commit prefix from the Prompt
     block's "When done: commit ..." line. Body includes: list of
     Acceptance Criteria with ✅ or ⚠️, any COMPONENT_MAP items added,
     any blockers logged.
  j. Push to origin/phase-2. Run A8 push verification. Paste both SHAs.
  k. Wait for Vercel deployment. Poll https://<your-vercel-url>/ every
     30s up to 5 min. Paste the HTTP status on success.
  l. Real-browser verification (Claude-in-Chrome MCP):
       - Navigate to the Vercel URL.
       - Exercise each Acceptance Criterion in the Prompt block.
       - Apply A7 screenshot authenticity check.
       - Save screenshot to docs/screenshots/sN-<slug>.png.
  m. If any criterion fails:
       - Apply A5 loop breaker.
       - On success: commit "fix(sN): <what>", push, re-verify from (j).
       - On 4th failure: A10 fail-forward.
  n. Apply A11 Done-Claim Contract. If all pass: mark todo complete
     and proceed to Step 4.

## Step 4 — Context check (after every session)

Estimate your remaining context. If above ~65% used (leaving margin
for the next session's file reads), STOP and respond with:

  "Context at ~X%. Last completed: Session N (SHA: <sha>). Verified
  at <vercel-url>. Screenshot: docs/screenshots/sN-<slug>.png.
  To continue, start a fresh thread on model [per Part B for Session
  N+1] and paste the same kickoff prompt — it will resume from
  Session N+1 via git log."

No work is lost: every session is a pushed commit + pushed screenshot.

## Step 5 — Final PR (after Session 18)

- gh pr create --base main --head phase-2 --title
  "Phase 2: pro-grade trading platform"
  --body with per-session summaries + screenshot paths + any
  blockers from PHASE_2_BLOCKERS.md
- Return the PR URL.

================================================================
PART D — NON-NEGOTIABLES (QUICK REFERENCE)
================================================================

- Never commit to main. Only to phase-2.
- Never commit secrets. Never use --force, --no-verify.
- Every color references a CSS variable — no hex outside theme.css /
  tokens.json.
- Every component supports all 3 themes (Meridian / Lumen / Terminal).
- Use conventional-commit prefixes EXACTLY — resume-detection in Step
  1 depends on them.
- Respect Part B — don't upgrade to Opus without explicit cause.
- A1–A11 apply on every edit and every claim. No exceptions.

================================================================

Start with Step 0 now. Acknowledge Parts A, B, C, D in 3 sentences
total — no more — then begin reading docs.
```
