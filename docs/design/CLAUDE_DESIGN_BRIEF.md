# Claude Design Export Spec — HedgeIQ v1

> You (the user) are producing Fidelity-inspired trading UI designs in
> Claude Design. This file tells you **how to export** them so they drop
> into this repo and get consumed by the Phase 2 autonomous build with
> zero manual rework. It does NOT dictate what to design — that's your
> creative call informed by your Fidelity screenshots.

---

## TL;DR — the one thing that matters

Name the files the way I describe below and put them in the right
folders. That's it. The Phase 2 autonomous build reads `docs/design/`
at the start of every session and maps whatever you put there to
HedgeIQ's features automatically.

---

## Folder structure (already scaffolded in the repo)

```
docs/design/
├── tokens.json          ← Your color/spacing/type tokens
├── pages/               ← Full-page compositions
├── components/          ← Individual component PNGs
├── states/              ← Interaction states (hover, loading, etc.)
└── figma-links.md       ← File key + node IDs if using Figma
```

---

## 1. Design tokens (the ONE structured file)

When you finalize your palette, export token values into
`docs/design/tokens.json`. The file is already in the repo with the
exact schema — open it and replace the placeholder values with yours.

**Critical**: keep the key names unchanged. `color.theme.dark.bg`,
`space.4`, `radius.md`, etc. are literal strings the theme generator
reads. If you rename a key, HedgeIQ won't find it.

Cover both themes (dark + light) even if your designs are primarily
one of them — HedgeIQ needs both.

---

## 2. Exports — naming convention

Whatever you design, save PNGs with these filenames. Phase 2 uses the
filename alone to figure out where in HedgeIQ to apply the design.

### Pages (full-screen compositions)

`docs/design/pages/<page-slug>-<theme>-<width>.png`

| Filename | Maps to in HedgeIQ |
|---|---|
| `dashboard-dark-1920.png` | Main app shell, default view |
| `dashboard-light-1920.png` | Same in light mode |
| `dashboard-dark-1440.png` | Desktop responsive |
| `dashboard-dark-768.png` | Tablet responsive |
| `dashboard-dark-375.png` | Mobile responsive |
| `landing-dark-1920.png` | Public marketing page |
| `login-dark-1920.png` | Sign-in page |
| `stock-detail-dark-1920.png` | Drill-in page from a position |

(If your design file groups these differently, export them with these
names anyway — it's purely a lookup key.)

### Components (pieces of the UI)

`docs/design/components/<component-slug>.png`

Recommended slugs (export whichever you design; missing ones fall back
to Fidelity reference):

```
button              input               dropdown           tab-bar
toggle              checkbox            badge              tooltip
modal               drawer              skeleton           empty-state
error-state         toast               price-cell         range-bar
sparkline           account-summary     positions-table    options-chain
expiry-tabs         chart-toolbar       hedge-card         chat-bubble
conversation-item   trade-ticket        news-card          status-pill
widget-wrapper
```

### States (variants of a component)

`docs/design/states/<component-slug>-<state>.png`

Examples:
- `positions-table-hover.png`
- `positions-table-empty.png`
- `options-chain-both.png` (Calls+Puts view)
- `options-chain-atm-highlight.png`
- `trade-ticket-preview.png` (with fees breakdown visible)
- `chat-streaming.png` (mid-response)
- `chat-with-suggestions.png` (after response, chips visible)
- `chart-crosshair.png` (tooltip showing OHLC)

---

## 3. If you're using Figma

Fill in `docs/design/figma-links.md` with:
- File share URL (Viewer access granted to your Anthropic-connected email)
- Per-screen node IDs (right-click frame → Copy link, grab the `?node-id=`)

The Figma MCP is installed on the Phase 2 build — it'll read frames,
variables, auto-layout, and variants directly from Figma. No PNG export
needed if you go this route, though PNG snapshots are a nice backup.

---

## 4. Annotations (optional but helpful)

Alongside any `<component>.png`, you can drop a `<component>.md` with
notes that aren't inferable from the image alone:

- Spacing values in px that aren't obvious
- Responsive breakpoint behavior
- Empty/error state copy
- ARIA labels
- "Don't do this" callouts

Skip this if you're short on time — Phase 2 will infer what it can.

---

## 5. What Phase 2 does with your designs

When the autonomous build runs:

1. **Session 1** (theme) reads `tokens.json` → generates `theme.css` with
   all your colors/spacing/typography as CSS variables. Every subsequent
   session consumes these variables — never hardcodes values.
2. **Every other session** checks `docs/design/{pages,components,states}/`
   for a matching PNG before implementing a component. If found, it uses
   that as the visual spec. If not, falls back to Fidelity screenshots.
3. **Figma node references** (if provided) take priority over PNGs.
4. **After rendering** a component in the real browser, Claude takes a
   screenshot and compares against your design PNG. Iterates up to 3
   times to match.

---

## 6. What you don't need to do

- ❌ Don't design every possible screen. Design the ones that matter
  visually — the rest fall back to Fidelity references automatically.
- ❌ Don't match HedgeIQ's exact data. Your designs can use Lorem Ipsum
  numbers; HedgeIQ swaps in real data at build time.
- ❌ Don't label frames with HedgeIQ feature names. Use generic names
  (`positions-table`, `options-chain`) — the mapping from generic name
  to specific feature is in Phase 2's prompt.
- ❌ Don't worry about interaction logic (what clicking does, which API
  it calls, etc.). That's code, not design.
- ❌ Don't hand-write CSS. Tokens + PNGs are enough.

---

## 7. Minimum viable deliverable

If you're short on time, the minimum useful delivery is:

1. `tokens.json` filled in ← this alone makes the app visually coherent
2. Two full-page PNGs: `pages/dashboard-dark-1920.png` +
   `pages/dashboard-light-1920.png`
3. One PNG per data-heavy component: `positions-table.png`,
   `options-chain.png`, `chart-toolbar.png`

That unlocks ~80% of the visual transformation. Everything else can be
added later and re-applied by re-running the Phase 2 script.

---

## 8. Re-running after adding more designs

The Phase 2 branch is idempotent: re-running `./scripts/run-phase-2.ps1`
picks up new design files and re-applies them without redoing already-
completed work (TodoWrite tracks progress; git history tracks state).

So your workflow is:

```
Claude Design → export PNG → drop in docs/design/<folder>/ → push
                                        ↓
                            re-run run-phase-2.ps1 on demand
                                        ↓
                      Phase 2 branch updated with new visuals
```

---

## 9. Delivery checklist (copy-paste back to Claude Design when asking it
to finalize)

```
Before I import, produce:
- [ ] tokens.json with all placeholder values replaced (schema already in
      repo at docs/design/tokens.json — keep keys intact)
- [ ] At least pages/dashboard-dark-1920.png + dashboard-light-1920.png
- [ ] As many components/*.png as you've completed — name each with the
      slug from the list in CLAUDE_DESIGN_BRIEF.md §2
- [ ] Any interaction-state variants in states/<component>-<state>.png
- [ ] If Figma: file key + node IDs via a share URL I can paste into
      figma-links.md

Export format: PNG at 1x minimum (2x preferred), transparent or on the
design's native background.
```

That's the only structured ask. Everything else about the designs is
your creative direction.
