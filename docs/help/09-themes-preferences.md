# Themes and preferences

HedgeIQ ships with four named themes, three density presets, two visual modes, and a colorblind-friendly mode. Everything is in the **preferences popover** (gear icon, top-right of the dashboard).

![All four HedgeIQ themes side by side](/help-screenshots/themes-comparison.svg)

## The four themes

### Midnight

The default. Deep blue background, violet accents, generous use of dark surfaces. Designed for low-light environments and long sessions. Easiest on the eyes after sundown.

### Meridian

Warm beige background, terracotta accent, navy secondary. The closest thing to "paper mode" — readable in daylight, less stark than pure white. Mirrors the design language of trading-floor newspapers.

### Lumen

Clean light theme. White background, indigo accent, neutral grays. The most "default-feeling" of the four — closest to what you'd expect from a generic SaaS dashboard. Best for screenshots and presentations.

### Terminal

Black background, neon green accent, monospace headings. Built for traders who want everything to look like a Bloomberg-adjacent power tool. The font for headings switches to JetBrains Mono.

## Density

A toggle for how compact the UI is. Three options:

- **Comfortable** — generous padding, larger text, more whitespace. Best for big screens and casual use.
- **Balanced** — the default. Tuned for laptop screens.
- **Dense** — tight padding, smaller text, more rows visible at once. Best for power users on big monitors.

Density only affects spacing and font size — it doesn't change colors or layout structure.

## Mode

A toggle between two visual styles:

- **Classic** — flat, minimal, focus on data. The default.
- **Futuristic** — glassmorphism, subtle gradients, animated transitions. Same data, more visual flourish. Some users love it; some find it distracting. Try both.

## Colorblind mode

A separate toggle that swaps the green/red P&L colors for a blue/orange pair that's distinguishable for the most common forms of color blindness (deuteranopia, protanopia). It also adjusts heatmap colors throughout the app.

We tested the swapped palette against the [Colorblindly](https://chrome.google.com/webstore/detail/colorblindly) browser extension. If you're tritan or have a less common vision difference and the default colors don't work for you, please [let us know](mailto:contact@hedgeiq.app) — we can add more presets.

## Reduced motion

Honored automatically from your OS-level setting (`prefers-reduced-motion`). When reduced motion is on, animations are shortened to ~10ms — effectively disabled. The product still works fine; you just don't get the streaming-text effect on the AI advisor or the smooth slide-in on the position drawer.

You can also force-disable motion in preferences regardless of OS setting.

## Where preferences are saved

Everything in the preferences popover is stored in your browser's `localStorage` under specific keys:

- `hedgeiq_theme` — the active theme name.
- `hedgeiq_density` — `comfortable`, `balanced`, or `dense`.
- `hedgeiq_mode` — `classic` or `futuristic`.
- `hedgeiq_colorblind` — `true` or `false`.
- `hedgeiq_reduced_motion` — `auto`, `on`, or `off`.
- `hedgeiq_layout` — your custom dashboard layout (if you've made one).

This means:

- **Preferences persist across sessions** — close the tab, come back tomorrow, your settings are still there.
- **Preferences are per-browser** — settings on your laptop don't sync to your phone yet. Cross-device sync is on the roadmap.
- **Clearing your browser data wipes preferences** — you'll get the defaults back. Not a big deal; takes 10 seconds to redo.

## Cross-surface theme

The theme key (`hedgeiq_theme`) is shared between the main app, the help center, and the technical wiki. Switch themes in any one of them and the others pick it up next time you visit. If you have multiple HedgeIQ tabs open, they sync within a second via the browser's `storage` event.
