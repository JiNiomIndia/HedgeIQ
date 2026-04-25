# HedgeIQ Executive Deck

A single-file reveal.js presentation introducing HedgeIQ.

## View locally

```bash
# Any static server works:
cd docs/presentation
python -m http.server 8080
# then open http://localhost:8080
```

Or simply open `index.html` directly in a browser.

## View in production

After Phase 5 of the deploy pipeline, the deck is served at:

```
https://hedgeiq.vercel.app/presentation
```

It also picks up `?print-pdf` if you'd like to export to PDF via reveal.js's print mode.

## Contents

25 slides covering the AAL story, product pillars, architecture, hedge algorithm, AI layer, broker integration, security, accessibility, test coverage, performance SLAs, deployment, roadmap, KPIs.

## Tech

- reveal.js 5 (CDN)
- mermaid 10 (CDN, diagram on the architecture slide)
- Tailwind-style green accent (`#10b981`) on top of the `black` theme
