# Figma / Claude Design Source Files

> If your designs live in Figma or Claude Design, paste the shareable URLs
> here. Claude will read frames directly via the Figma MCP during Phase 2.
> If you're exporting PNGs instead, ignore this file.

## Setup (one-time)

1. Share the Figma file with your Anthropic-connected account (Editor or
   Viewer access — Viewer is sufficient for read-only design consumption).
2. Ensure Figma MCP is enabled in your Claude Code session (it's listed in
   available-tools as `mcp__81f7cd01-375e-4943-8b23-82fb55adff92__*`).
3. Paste the file key or full share URL in the appropriate section below.

## File references

### Primary design file
```
<!-- Example:
URL: https://www.figma.com/file/ABCdefGhi12345/HedgeIQ-V1
File key: ABCdefGhi12345
Last updated: 2026-04-19
-->
URL:
File key:
Last updated:
```

### Component library (if separate)
```
URL:
File key:
```

## Per-screen / per-component node IDs

When you want Claude to target a specific frame rather than the whole
file, list node IDs here:

| Screen / component | Node ID | Frame name |
|---|---|---|
| Dashboard — dark | `123:456` | Desktop/Dashboard/Dark |
| Dashboard — light | `123:457` | Desktop/Dashboard/Light |
| Positions table | `123:500` | Components/PositionsTable |
| Options chain | `123:600` | Components/OptionsChain |
| Trade ticket modal | `123:700` | Components/TradeTicket |
| Position detail drawer | `123:800` | Components/PositionDrawer |
| AI advisor rail | `123:900` | Components/AIAdvisor |
| Chart widget | `123:950` | Components/Chart |

(Node IDs are visible in Figma via right-click → Copy link, or the URL
query param `?node-id=`.)

## How Claude uses these

During Phase 2 execution, before implementing a component, Claude will:

1. Check if a Figma node ID exists for the component in the table above.
2. If yes, call the Figma MCP to fetch:
   - The frame's rendered image
   - Design tokens used (colors, text styles, effects)
   - Component variants
   - Auto-layout settings
3. Compare the implementation output against the fetched frame and
   iterate until pixel-parity is achieved (within tolerance).
4. If no Figma node is listed, fall back to PNGs in `components/`.

## Tips for Figma files that integrate well

- **Use Figma Variables** for colors/spacing so Claude can extract them
  programmatically rather than inferring from rendered pixels.
- **Name frames semantically**: `Components/PositionsTable/Row-Default`
  instead of `Frame 1234`. Claude matches by name when possible.
- **Separate dark/light** into variant modes on the same component, not
  duplicated frames — Claude reads Figma modes natively.
- **Auto-layout everywhere**: Claude infers responsive behavior from
  Figma auto-layout constraints (fill, hug, fixed).
