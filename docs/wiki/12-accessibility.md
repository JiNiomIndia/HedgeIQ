# 12 — Accessibility

HedgeIQ targets **WCAG 2.1 AA**. The product is for retail investors at midnight — they may be tired, may have a screen reader, may be on a phone, may be partially colour-blind.

## Conformance summary

| WCAG criterion | Status |
|----------------|--------|
| 1.1.1 Non-text content | All icons have `aria-label`; charts have a textual summary nearby. |
| 1.3.1 Info & relationships | Semantic HTML; tables use `<th scope>`. |
| 1.4.3 Contrast (minimum) | All text ≥ 4.5:1; large text ≥ 3:1 in all three themes. |
| 1.4.11 Non-text contrast | UI components ≥ 3:1 against background. |
| 2.1.1 Keyboard | Every interactive element reachable via `Tab`. |
| 2.1.2 No keyboard trap | Modals and drawers escape via `Esc` and `Tab` cycling. |
| 2.4.3 Focus order | Visual order matches DOM order; verified by automated test. |
| 2.4.7 Focus visible | All focus rings use `--accent` outline (≥ 2px). |
| 3.2.4 Consistent identification | Same icon = same meaning across components. |
| 4.1.2 Name, role, value | All custom controls have ARIA roles. |

## Theme system

Three themes shipped (`frontend/src/lib/theme.ts`):

| Theme | Spirit | Use case |
|-------|--------|----------|
| **Meridian** | Calm, professional, light | Default; daylight monitoring. |
| **Terminal** | Dense, dark, green-on-black | Heavy traders; midnight sessions. |
| **Lumen** | High-contrast, large text | Low-vision users; presentation mode. |

Each theme additionally supports:
- **Light/dark mode** toggle (`mode`).
- **Density** — Balanced or Dense (touch targets shrink).
- **Colour-blind palette** — replaces red/green with blue/orange for P/L indicators.

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Move focus. |
| `Enter` / `Space` | Activate focused control. |
| `Esc` | Close modal / drawer / popover. |
| `?` | Open keyboard shortcut overlay. |
| `g h` | Go home (dashboard). |
| `g a` | Open AI chat. |
| `/` | Focus universal search. |

## Screen reader notes

- The dashboard layout grid is announced as "Dashboard, X widgets". Each widget is a labelled `<section>`.
- The hedge calculator dialog is `role="dialog"` `aria-modal="true"` with `aria-labelledby` pointing to its title.
- Live regions (`aria-live="polite"`) announce data refreshes ("Positions updated 3 seconds ago").
- Numeric values use SR-friendly formats: `<span aria-label="negative one thousand two hundred dollars">-$1,200</span>`.

## Testing

- `frontend/src/test/a11y.test.tsx` runs `vitest-axe` on every top-level component.
- Manual NVDA + VoiceOver passes documented in `TEST_REPORT.md`.
- Lighthouse a11y score in CI: > 95 required to merge.

## Known gaps

- The price chart's tooltip is mouse-driven; keyboard navigation through bars is on the Phase 3 roadmap.
- The drag-to-reorder dashboard widgets is currently mouse/touch only; keyboard alternative ("move widget up/down" buttons in the widget menu) added but not yet announced.
