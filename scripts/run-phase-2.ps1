# HedgeIQ Phase 2 — Autonomous Run Wrapper (PowerShell)
#
# Usage:
#   .\scripts\run-phase-2.ps1
#
# What it does:
#   1. Validates prerequisites (claude CLI, git, npm, gh)
#   2. Ensures working tree is clean
#   3. Extracts the prompt from docs/PHASE_2_AUTONOMOUS_PROMPT.md
#   4. Pipes it to claude with --dangerously-skip-permissions so NO approval
#      dialogs appear during the multi-hour run
#   5. Tees output to a timestamped log file
#   6. On completion, prints the PR URL and opens it in your browser
#
# Runtime: 2-4 hours depending on model speed and external API responsiveness.
# Cost estimate: ~$15-$40 of Anthropic credit (Opus). Use Sonnet for ~1/5th
# the cost by changing -Model below.

param(
    [string]$Model = "claude-opus-4-7",
    [switch]$UseSonnet,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

if ($UseSonnet) { $Model = "claude-sonnet-4-5" }

# ─── Prerequisites ────────────────────────────────────────────────────────
Write-Host "→ Checking prerequisites..." -ForegroundColor Cyan
@('claude','git','npm','gh') | ForEach-Object {
    if (-not (Get-Command $_ -ErrorAction SilentlyContinue)) {
        Write-Error "Required CLI '$_' not found on PATH."
        exit 1
    }
}

# ─── Working tree must be clean ───────────────────────────────────────────
Write-Host "→ Checking git status..." -ForegroundColor Cyan
$dirty = git status --porcelain
if ($dirty) {
    Write-Error "Uncommitted changes detected. Commit or stash first:`n$dirty"
    exit 1
}

# ─── Extract the prompt body ──────────────────────────────────────────────
Write-Host "→ Extracting prompt from docs/PHASE_2_AUTONOMOUS_PROMPT.md..." -ForegroundColor Cyan
$promptFile = "docs/PHASE_2_AUTONOMOUS_PROMPT.md"
if (-not (Test-Path $promptFile)) {
    Write-Error "Prompt file not found: $promptFile"
    exit 1
}

$raw = Get-Content $promptFile -Raw
# Match the first fenced block after the "## Prompt body" heading
$match = [regex]::Match(
    $raw,
    '##\s+Prompt body \(paste verbatim to Claude\)\s*```\s*([\s\S]*?)\s*```',
    'Singleline'
)
if (-not $match.Success) {
    Write-Error "Could not extract prompt body from $promptFile"
    exit 1
}
$prompt = $match.Groups[1].Value.Trim()

Write-Host "  Prompt length: $($prompt.Length) chars" -ForegroundColor DarkGray

# ─── Dry-run preview ──────────────────────────────────────────────────────
if ($DryRun) {
    Write-Host "`n=== DRY RUN: showing first 1500 chars of prompt ===" -ForegroundColor Yellow
    Write-Host $prompt.Substring(0, [Math]::Min(1500, $prompt.Length))
    Write-Host "`n=== would invoke claude with model=$Model ==="
    exit 0
}

# ─── Confirm user actually wants to run the multi-hour autonomous build ──
Write-Host "`n⚠  This will run autonomously for 2-4 hours and spend Anthropic credits." -ForegroundColor Yellow
Write-Host "   Model: $Model"
Write-Host "   Branch: phase-2 (will be created/reset)"
Write-Host "   Log:    phase-2-run-<timestamp>.log"
$confirm = Read-Host "Proceed? (type YES to continue)"
if ($confirm -ne "YES") {
    Write-Host "Aborted." -ForegroundColor Red
    exit 0
}

# ─── Log file ─────────────────────────────────────────────────────────────
$logFile = "phase-2-run-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
Write-Host "`n→ Logging to $logFile" -ForegroundColor Cyan
Write-Host "→ Starting autonomous build... (this terminal is now dedicated to the run)" -ForegroundColor Green
Write-Host "→ Open another terminal to monitor: Get-Content $logFile -Wait -Tail 50`n" -ForegroundColor DarkGray

# ─── Invoke Claude with full auto-approval ────────────────────────────────
# --dangerously-skip-permissions: no tool-use prompts at all
# --output-format stream-json:    structured events, easier to tail/parse
# --model:                        opus-4-7 for best quality, sonnet-4-5 for cost
try {
    $prompt | claude `
        --dangerously-skip-permissions `
        --model $Model `
        --output-format stream-json `
        2>&1 | Tee-Object -FilePath $logFile
    $exitCode = $LASTEXITCODE
} catch {
    Write-Error "Claude invocation failed: $_"
    exit 1
}

Write-Host "`n→ Claude exited with code $exitCode" -ForegroundColor Cyan

# ─── Discover the PR URL (if created) ─────────────────────────────────────
Write-Host "→ Looking for the Phase 2 PR..." -ForegroundColor Cyan
try {
    $prJson = gh pr list --head phase-2 --json url,title,state --limit 1 | ConvertFrom-Json
    if ($prJson -and $prJson.Count -gt 0) {
        $pr = $prJson[0]
        Write-Host "`n✓ PR: $($pr.title) [$($pr.state)]" -ForegroundColor Green
        Write-Host "  $($pr.url)`n" -ForegroundColor Green
        Start-Process $pr.url
    } else {
        Write-Host "  No PR found for phase-2 yet — check the log for errors." -ForegroundColor Yellow
    }
} catch {
    Write-Host "  gh pr list failed: $_" -ForegroundColor Yellow
}

# ─── Toast notification on completion (Windows 10+) ───────────────────────
try {
    $null = [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType=WindowsRuntime]
    $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
    $xml = $template.GetXml()
    $xml = $xml.Replace('<text id="1"></text>', '<text id="1">HedgeIQ Phase 2</text>')
    $xml = $xml.Replace('<text id="2"></text>', "<text id=`"2`">Autonomous run finished (exit $exitCode). See PR.</text>")
    $doc = New-Object Windows.Data.Xml.Dom.XmlDocument
    $doc.LoadXml($xml)
    $toast = New-Object Windows.UI.Notifications.ToastNotification $doc
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('HedgeIQ').Show($toast)
} catch { }

exit $exitCode
