# Claude Design Brief — HedgeIQ v1

> Paste this document (or the "Prompt body" section at the end) into
> Claude Design. Everything it needs to produce designs that drop
> straight into the Phase 2 autonomous build is here.

---

## Prompt body (paste into Claude Design)

```
You are designing HedgeIQ, a professional options-trading assistant app
that must match or exceed the visual quality of Fidelity, Schwab, and
Robinhood. This brief tells you exactly what to produce and how to
deliver it.

═══════════════════════════════════════════════════════════════════════
PRODUCT CONTEXT
═══════════════════════════════════════════════════════════════════════

HedgeIQ lets retail investors:
- See their positions across multiple brokers (SnapTrade aggregation)
- Run a 60-second "emergency hedge" calculation (find the best protective
  put for any stock position)
- Chat with an AI trading advisor (Claude) that knows their portfolio
- Browse options chains, read market news, drill into any position

Target user: serious retail trader, $10k-$500k portfolio, uses Fidelity +
Robinhood, trades options monthly, wants Bloomberg-feel without Bloomberg
price. Tech comfort: high. Design tolerance: zero for amateur-looking UI.

═══════════════════════════════════════════════════════════════════════
BRAND + AESTHETIC DIRECTION
═══════════════════════════════════════════════════════════════════════

- Mood: serious, data-dense, confidence-inspiring. NOT playful, NOT
  crypto-casino, NOT fintech-startup-pastels.
- Reference apps:
   · Fidelity Active Trader Pro (data density, column packing)
   · TradingView (chart polish)
   · Linear (typography, information hierarchy)
   · Bloomberg Terminal (pro trader signaling — in spirit, not literally)
- AVOID: gradients, rounded-everything, hero illustrations, oversized
  padding, emoji as primary UI affordances, mobile-first sizing on
  desktop layouts.
- Primary accent: cyan (#00D4FF base — feel free to refine). The app has
  ONE accent color, used sparingly, never on body text.
- P&L colors: green for up (#00FF88 feel), red for down (#FF4466 feel) —
  professional not bright.
- Tabular numbers EVERYWHERE prices, quantities, or percentages appear.

═══════════════════════════════════════════════════════════════════════
DELIVERABLES (exhaustive — deliver all)
═══════════════════════════════════════════════════════════════════════

A. DESIGN TOKENS (single file)
   → tokens.json matching the schema at
     github.com/JiNiomIndia/HedgeIQ/blob/main/docs/design/tokens.json
   → Every key in that template must have a real value.
   → Both dark and light theme colors.
   → If you want to rename tokens, don't — code generation depends on
     these exact keys.

B. PAGES (1920×1080 + 1440×900 + 768×1024 + 375×812)
   For each viewport produce BOTH dark and light themes:
   1. Landing page (public, unauthenticated)
   2. Login page
   3. Dashboard (the main authenticated app shell with sidebar + content)
   4. Dashboard — Positions view (default)
   5. Dashboard — Options Chain view
   6. Dashboard — Emergency Hedge view
   7. Dashboard — AI Advisor (rail version, permanent right side)
   8. Dashboard — Full-page stock detail (when user clicks a symbol)

   File naming:  <page>-<theme>-<width>.png
   Examples:     dashboard-positions-dark-1920.png
                 stock-detail-light-1440.png
                 landing-dark-375.png

C. COMPONENTS (at 2x, on neutral background, with variants on one frame)
   1. Button (primary / secondary / ghost / destructive, all sizes, all
      states: default/hover/active/disabled/loading)
   2. Input (text / numeric / search, all states)
   3. Dropdown / Select
   4. Tab bar (pill style + underline style)
   5. Toggle / Switch
   6. Checkbox + Radio
   7. Badge (success/danger/warn/info/neutral + dot variants)
   8. Tooltip
   9. Modal / Dialog
   10. Drawer (slides in from right)
   11. Skeleton loader (row + card + chart shapes)
   12. Empty state
   13. Error state
   14. Toast / Snackbar
   15. Price cell (with flash animation frames — still frames for up/down)
   16. Range bar visual (the Fidelity-style mini low/current/high bar)
   17. Sparkline (30-day mini line chart)
   18. 4-card account summary (Total Value / Day's Change / P&L / Count)
   19. Account group card (header with account name + total)
   20. Positions table row (desktop + mobile compact)
   21. Options chain row (calls + strike + puts layout)
   22. Expiration-date pill tab strip
   23. Chart toolbar (timeframes + indicators + draw tools + save)
   24. Hedge recommendation card (with embedded payoff chart area)
   25. AI chat message bubbles (user + assistant, with suggestion chips)
   26. Conversation list item (title + timestamp + preview)
   27. Trade ticket modal (the Fidelity-parity order entry form)
   28. News card (image + title + publisher + timestamp)
   29. Connection status pill (live / reconnecting / offline)
   30. Widget wrapper (header with drag handle + title + close + settings)

D. STATES (per component — as separate frames)
   For Positions table: default, hover, selected, loading, empty, error,
     mixed-broker, single-broker, cash-heavy, option-position inline
   For Options chain: Calls-only, Puts-only, Both, ATM highlight, high-OI
     highlight, near-expiry warning, weekly options toggled on/off
   For AI Advisor: empty (new conversation), mid-conversation with chips,
     streaming (partial response), error, offline, multiple conversations
     in sidebar
   For Trade ticket: default, preview state (with fees breakdown), error
     (exceeds buying power), confirmed / submitted
   For Chart: 1D intraday, 1Y daily, with crosshair active, with indicator
     overlay, with drawing tool active, loading skeleton

E. MICRO-INTERACTIONS (short GIF / Lottie or frame sequences)
   1. Price cell flash on update (300ms green pulse, 300ms red pulse)
   2. Widget drag + snap-to-grid
   3. Drawer slide-in (250ms standard easing)
   4. AI response token streaming
   5. Chart crosshair follow

F. ANNOTATIONS (per major frame)
   In Figma: use the Comments feature. In exported deliverables: write
   a short <filename>.md beside each PNG with:
   - Exact spacing values (in px) that aren't obvious from the render
   - Responsive reflow rules
   - ARIA labels
   - Empty-state copy
   - Rejected alternatives ("Don'ts")

═══════════════════════════════════════════════════════════════════════
FIDELITY FEATURE PARITY (non-negotiable)
═══════════════════════════════════════════════════════════════════════

The Phase 2 build must visually match Fidelity on these specific pages:

- Positions: github.com/JiNiomIndia/HedgeIQ/blob/main/docs/design/_ref/
  fidelity-positions.png (request from user if not yet in repo)
- Options Chain: ..._ref/fidelity-chain.png
- Trade Ticket: ..._ref/fidelity-trade-ticket.png
- Position Detail: ..._ref/fidelity-position-detail.png
- Stock Chart: ..._ref/fidelity-stock-chart.png

Every feature enumerated in
docs/PHASE_2_FEATURES_FROM_FIDELITY.md in the repo must have a
corresponding visual in your deliverables. Read that file first — it's
the spec. If a feature is in that file but you think a better design
exists, produce BOTH (the Fidelity-parity version AND your proposed
upgrade) as separate frames so engineering can A/B.

═══════════════════════════════════════════════════════════════════════
NON-OBVIOUS CONSTRAINTS
═══════════════════════════════════════════════════════════════════════

1. Accessibility
   - WCAG AA contrast in BOTH themes (4.5:1 body, 3:1 large text)
   - Focus rings visible on ALL interactive elements
   - Never rely on color alone to convey meaning (use +/- icons on P&L,
     not just green/red)

2. Information density > Whitespace
   - A trader's screen is an instrument panel, not a magazine layout.
   - Target row heights: 28-36px for data tables (not 48-56px).
   - Target body font size: 13-14px base (not 16-18px).
   - Padding: meaningful not decorative.

3. Customization-ready
   - Every major surface must be implementable as a draggable, resizable
     widget. Design component frames with a title bar + body slot so they
     slot into a widget wrapper without rework.

4. Tabular everything
   - All numbers (prices, quantities, percents, dates, times) must render
     in a tabular-figures typeface. If your type choice doesn't support
     tabular-nums, pick another.

5. Responsive behavior
   - 1920+: full four-column dashboard with AI rail open
   - 1440: three-column with AI rail open, positions reflows to fewer
     columns
   - 1024: two-column, AI rail collapses to icon
   - 768: single-column, sidebar becomes bottom tab bar, drawers full-screen
   - 375: mobile — stack everything, simplify options chain to strike-only
     list with tap-to-expand

6. Theming
   - The light theme is NOT just "inverse of dark". Produce it natively:
     neutral off-white background (#F9FAFB or similar), slightly desaturated
     accents, preserve the professional feel. Inspiration: Schwab, Vanguard.

7. Microcopy
   - Write the real copy, not Lorem Ipsum. Button labels ("Preview order",
     "Ask Claude to explain"), empty states ("No positions yet — connect
     a broker to get started"), error messages ("Market closed — orders
     queue for next open"), suggestion chips ("What's my biggest risk?").

═══════════════════════════════════════════════════════════════════════
DELIVERY FORMAT
═══════════════════════════════════════════════════════════════════════

Option 1 (preferred) — Figma file
   Share the file with the user's Anthropic-connected account as Viewer.
   Provide file key + per-screen node IDs so the Phase 2 build can call
   the Figma MCP to fetch frames directly.
   Use Figma Variables for all design tokens — don't hardcode values.
   Use Auto-layout on every frame so responsive constraints are machine-
   readable.

Option 2 — PNG export bundle
   Zip the following:
     tokens.json
     pages/*.png  (dark + light + each viewport)
     components/*.png
     states/*.png
     micro-interactions/*.{gif,mp4,lottie.json}
     annotations/*.md
   Zip name: hedgeiq-design-v1.zip

Option 3 — Both (best)
   Figma file + exported PNG bundle as a snapshot.

═══════════════════════════════════════════════════════════════════════
WHAT THE USER WILL DO WITH YOUR DELIVERABLES
═══════════════════════════════════════════════════════════════════════

1. Drop tokens.json at docs/design/tokens.json in the HedgeIQ repo.
2. Extract PNGs into docs/design/{pages,components,states}/.
3. If you delivered a Figma file: paste the file key + node IDs into
   docs/design/figma-links.md.
4. Run ./scripts/run-phase-2.ps1 (or .sh on macOS/Linux).
5. An autonomous Claude Code session executes the entire Phase 2 build,
   reading your designs and producing matching code. It takes 2-4 hours
   unattended.
6. When done, a PR opens in GitHub with screenshots of the implemented
   app for side-by-side comparison against your Figma frames.

This means: anything that is NOT in your deliverables will be implemented
based on Fidelity reference screenshots. Your designs OVERRIDE those
references. Be thorough — the coverage of your design pack determines
how much of the app matches your vision vs. defaults.

═══════════════════════════════════════════════════════════════════════
ACCEPTANCE CHECKLIST (you're done when)
═══════════════════════════════════════════════════════════════════════

[ ] tokens.json filled with real values for every key
[ ] Both themes (dark + light) fully designed, not just recolored
[ ] All 4 viewports (1920, 1440, 768, 375) for each key page
[ ] All 30 components with all required variants
[ ] Every state listed under section D has a frame
[ ] Real microcopy (no Lorem Ipsum)
[ ] Annotations markdown for every major frame
[ ] Figma file shared OR PNG bundle delivered
[ ] Side-by-side visual comparison to Fidelity screenshots — your designs
    match on feature coverage and meet or exceed on visual quality

When every box is ticked, hand off to the user for Phase 2 kickoff.
Begin.
```

---

## How to use this brief

1. **Open Claude Design** (or paste into your design tool's AI input).
2. **Attach the 5 Fidelity screenshots** you shared earlier — they're
   referenced throughout the brief as parity targets. If they're not in
   the repo yet, add them to `docs/design/_ref/`.
3. **Paste the prompt body** (everything between the triple backticks
   above) as your initial instruction.
4. **Iterate naturally** — ask Claude Design to refine specific screens,
   generate variants, explore alternative directions. The brief gives it
   a clear floor; your direction pushes it higher.
5. **When finished**, drop the deliverables into the repo folders per the
   "Delivery format" section, then run `./scripts/run-phase-2.ps1`.

## Tips for getting better output from Claude Design

- **Design one screen at a time**, not the whole app at once. You'll get
  more cohesive output by doing dashboard → positions → chain → hedge →
  AI sequentially, referencing the previous as context.
- **Ask for options**, not just one answer ("Show me three directions for
  the account summary header — one dense, one spacious, one mobile-first").
- **Critique its first pass**. Claude Design's first outputs are usually
  generic. Call out specifically what you want: "too much padding, tighten
  to 12px", "the green is too saturated, match Fidelity's muted tone",
  "AI bubble needs a subtle border, currently blends with background".
- **Lock the token palette early**. Once `tokens.json` has agreed values,
  every subsequent design consumes them — don't re-invent colors per page.
- **Ask for annotations** as you go: "for this screen, write the
  annotation markdown covering spacing, states, and empty state copy".
