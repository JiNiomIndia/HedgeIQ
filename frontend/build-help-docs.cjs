/**
 * Build script: render docs/help/*.md → dist/help/*.html as a friendly help center.
 *
 * Generates:
 *  - dist/help/<slug>.html for each markdown source (README → index.html)
 *  - dist/help/help.css   shared styles
 *  - dist/help/help.js    runtime: theme switcher, drawer, lunr search
 *  - dist/help/search-index.json  lunr-friendly source documents
 *
 * Self-contained — does not share state with build-wiki.cjs but reuses the same
 * marked + prismjs + lunr dependencies.
 */
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const Prism = require('prismjs');
require('prismjs/components/prism-bash');
require('prismjs/components/prism-python');
require('prismjs/components/prism-typescript');
require('prismjs/components/prism-json');
require('prismjs/components/prism-javascript');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'docs/help');
const outDir = path.resolve(__dirname, 'dist/help');

// ---------- Section catalog ----------
const SECTIONS = [
  { slug: 'index',                 file: 'README.md',                group: 'Home',                       nav: false, title: 'HedgeIQ Help Center' },
  { slug: '01-getting-started',    file: '01-getting-started.md',    group: 'Getting started' },
  { slug: '02-create-account',     file: '02-create-account.md',     group: 'Getting started' },
  { slug: '03-connect-broker',     file: '03-connect-broker.md',     group: 'Connecting your broker' },
  { slug: '10-supported-brokers',  file: '10-supported-brokers.md',  group: 'Connecting your broker' },
  { slug: '04-dashboard-tour',     file: '04-dashboard-tour.md',     group: 'Using HedgeIQ' },
  { slug: '05-hedge-calculator',   file: '05-hedge-calculator.md',   group: 'Using HedgeIQ' },
  { slug: '06-ai-advisor',         file: '06-ai-advisor.md',         group: 'Using HedgeIQ' },
  { slug: '07-options-chain',      file: '07-options-chain.md',      group: 'Using HedgeIQ' },
  { slug: '08-positions-table',    file: '08-positions-table.md',    group: 'Using HedgeIQ' },
  { slug: '09-themes-preferences', file: '09-themes-preferences.md', group: 'Using HedgeIQ' },
  { slug: '11-daily-limits',       file: '11-daily-limits.md',       group: 'Reference' },
  { slug: '12-troubleshooting',    file: '12-troubleshooting.md',    group: 'Reference' },
  { slug: '13-faq',                file: '13-faq.md',                group: 'Reference' },
  { slug: '14-glossary',           file: '14-glossary.md',           group: 'Reference' },
];

const NAV_GROUPS = [
  { label: 'Getting started',         collapsible: false },
  { label: 'Connecting your broker',  collapsible: false },
  { label: 'Using HedgeIQ',           collapsible: true  },
  { label: 'Reference',               collapsible: true  },
];

// ---------- Helpers ----------
function slugifyHeading(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------- marked renderer ----------
const renderer = new marked.Renderer();
const headings = [];

renderer.heading = function ({ tokens, depth }) {
  const text = this.parser.parseInline(tokens);
  const raw = tokens.map((t) => ('text' in t ? t.text : '')).join('');
  const id = slugifyHeading(raw);
  headings.push({ depth, text: raw, id });
  return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-label="Link to this section">#</a>${text}</h${depth}>\n`;
};

renderer.code = function ({ text, lang }) {
  const language = (lang || '').trim().toLowerCase();
  if (language === 'mermaid') {
    return `<pre class="mermaid">${escapeHtml(text)}</pre>\n`;
  }
  const grammar = Prism.languages[language];
  let highlighted;
  if (grammar) {
    highlighted = Prism.highlight(text, grammar, language);
  } else {
    highlighted = escapeHtml(text);
  }
  const label = language || 'text';
  return `<div class="code-block" data-lang="${label}">
  <div class="code-head"><span class="code-lang">${label}</span><button class="code-copy" type="button" aria-label="Copy code">Copy</button></div>
  <pre class="language-${label}"><code class="language-${label}">${highlighted}</code></pre>
</div>\n`;
};

// Hostnames that count as "internal" — same-origin nav, no new tab.
const INTERNAL_HOSTS = new Set([
  'hedge-iq-five.vercel.app',
  'hedgeiq.app',
  'www.hedgeiq.app',
  'localhost',
  '127.0.0.1',
]);

function isExternalUrl(target) {
  if (!target) return false;
  if (target.startsWith('mailto:')) return false; // mailto opens mail client, not a tab
  if (!/^https?:/i.test(target)) return false;
  try {
    const u = new URL(target);
    return !INTERNAL_HOSTS.has(u.hostname.toLowerCase());
  } catch (e) {
    return false;
  }
}

renderer.link = function ({ href, title, tokens }) {
  const text = this.parser.parseInline(tokens);
  let target = href || '';
  // Rewrite intra-help .md links → /help/<slug>
  if (target && /\.md(#.*)?$/i.test(target) && !/^https?:/i.test(target)) {
    const m = target.match(/^([^#]+)(#.*)?$/);
    const file = m[1];
    const hash = m[2] || '';
    const base = path.basename(file, '.md');
    const slug = base.toLowerCase() === 'readme' ? '' : base;
    target = `/help${slug ? '/' + slug : ''}${hash}`;
  }
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
  // External http(s) links open in a new tab; mailto: stays in same window.
  let ext = '';
  if (isExternalUrl(target)) {
    ext = ' target="_blank" rel="noopener noreferrer"';
  } else if (target.startsWith('mailto:')) {
    ext = ' rel="noopener"';
  }
  return `<a href="${target}"${titleAttr}${ext}>${text}</a>`;
};

renderer.image = function ({ href, title, text }) {
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
  return `<figure><img src="${href}" alt="${escapeHtml(text || '')}"${titleAttr} loading="lazy">${text ? `<figcaption>${escapeHtml(text)}</figcaption>` : ''}</figure>`;
};

marked.use({ renderer, gfm: true });

// ---------- Page rendering ----------
function loadPage(section) {
  const md = fs.readFileSync(path.join(srcDir, section.file), 'utf8');
  headings.length = 0;
  const html = marked.parse(md);
  const h1 = headings.find((h) => h.depth === 1);
  const title = h1 ? h1.text : (section.title || section.slug);
  const h2s = headings.filter((h) => h.depth === 2);
  const plain = md.replace(/```[\s\S]*?```/g, ' ').replace(/[#>*_`-]/g, ' ').replace(/\s+/g, ' ').trim();
  return { md, html, title, h1, h2s, headings: [...headings], plainExcerpt: plain.slice(0, 600) };
}

function navHtml(activeSlug, pageH2s) {
  const parts = [];
  for (const grp of NAV_GROUPS) {
    const items = SECTIONS.filter((s) => s.group === grp.label && s.nav !== false);
    if (!items.length) continue;
    const isActiveGroup = items.some((it) => it.slug === activeSlug);
    const openAttr = !grp.collapsible || isActiveGroup ? ' open' : '';
    parts.push(`<details class="nav-group"${openAttr}><summary>${escapeHtml(grp.label)}</summary><ul class="nav-list">`);
    for (const it of items) {
      const isActive = it.slug === activeSlug;
      const href = `/help/${it.slug}`;
      parts.push(`<li class="nav-item${isActive ? ' is-active' : ''}"><a href="${href}">${escapeHtml(it._title || it.slug)}</a>`);
      if (isActive && pageH2s && pageH2s.length) {
        parts.push('<ul class="nav-sub">');
        for (const h2 of pageH2s) {
          parts.push(`<li><a href="#${h2.id}">${escapeHtml(h2.text)}</a></li>`);
        }
        parts.push('</ul>');
      }
      parts.push('</li>');
    }
    parts.push('</ul></details>');
  }
  return parts.join('\n');
}

function pageTemplate({ section, body, pageTitle, h2s, prev, next }) {
  const nav = navHtml(section.slug, h2s);
  const prevLink = prev ? `<a class="page-nav-prev" href="/help/${prev.slug === 'index' ? '' : prev.slug}"><span class="page-nav-label">Previous</span><span class="page-nav-title">${escapeHtml(prev._title || prev.slug)}</span></a>` : '<span></span>';
  const nextLink = next ? `<a class="page-nav-next" href="/help/${next.slug === 'index' ? '' : next.slug}"><span class="page-nav-label">Next</span><span class="page-nav-title">${escapeHtml(next._title || next.slug)}</span></a>` : '<span></span>';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0A0E1A">
<title>${escapeHtml(pageTitle)} — HedgeIQ Help</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/help/help.css">
<script>
  (function(){
    try {
      var t = localStorage.getItem('hedgeiq_theme');
      if (!t) t = 'midnight';
      document.documentElement.setAttribute('data-theme', t);
    } catch(e) { document.documentElement.setAttribute('data-theme', 'midnight'); }
  })();
</script>
</head>
<body>
<header class="topbar">
  <button class="hamburger" aria-label="Open navigation" type="button">
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>
  </button>
  <a class="back-app" href="/" aria-label="Back to HedgeIQ">
    <span class="back-arrow">←</span> Back to HedgeIQ
  </a>
  <div class="brand">Help Center</div>
  <div class="search-wrap">
    <input class="search-input" type="search" placeholder="Search help articles..." aria-label="Search help" autocomplete="off">
    <div class="search-results" role="listbox" hidden></div>
  </div>
  <div class="theme-switcher" role="group" aria-label="Theme">
    <button data-theme-btn="midnight" type="button" title="Midnight theme">Midnight</button>
    <button data-theme-btn="meridian" type="button" title="Meridian theme">Meridian</button>
    <button data-theme-btn="lumen" type="button" title="Lumen theme">Lumen</button>
    <button data-theme-btn="terminal" type="button" title="Terminal theme">Terminal</button>
  </div>
  <a class="cta-app" href="/login">Open the app</a>
</header>
<div class="help-shell">
  <div class="layout">
    <aside class="sidebar" aria-label="Help sections">
      <nav class="nav">${nav}</nav>
    </aside>
    <div class="sidebar-overlay" hidden></div>
    <main class="content">
      <article class="prose">${body}</article>
      <footer class="page-footer">
        <div class="page-nav">${prevLink}${nextLink}</div>
        <div class="help-footer-row">
          <p>Need more help? <a href="mailto:contact@hedgeiq.app">Email contact@hedgeiq.app</a></p>
          <p>
            <a href="/">Home</a>
            &middot; <a href="https://github.com/JiNiomIndia/HedgeIQ/issues" target="_blank" rel="noopener">Found a bug?</a>
          </p>
        </div>
      </footer>
    </main>
  </div>
</div>
<script src="https://unpkg.com/lunr@2.3.9/lunr.min.js" defer></script>
<script src="/help/help.js" defer></script>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
  function mermaidThemeFor(t) {
    if (t === 'terminal' || t === 'midnight') return 'dark';
    return 'default';
  }
  const initial = document.documentElement.getAttribute('data-theme') || 'midnight';
  mermaid.initialize({ startOnLoad: true, theme: mermaidThemeFor(initial), securityLevel: 'loose' });
  const obs = new MutationObserver(async (muts) => {
    for (const m of muts) {
      if (m.attributeName === 'data-theme') {
        const t = document.documentElement.getAttribute('data-theme') || 'midnight';
        document.querySelectorAll('pre.mermaid').forEach((el) => {
          if (el.dataset.source) el.innerHTML = el.dataset.source;
          el.removeAttribute('data-processed');
        });
        mermaid.initialize({ startOnLoad: false, theme: mermaidThemeFor(t), securityLevel: 'loose' });
        try { await mermaid.run({ querySelector: 'pre.mermaid' }); } catch (e) {}
      }
    }
  });
  document.querySelectorAll('pre.mermaid').forEach((el) => { el.dataset.source = el.textContent; });
  obs.observe(document.documentElement, { attributes: true });
</script>
</body>
</html>
`;
}

// ---------- Main ----------
function build() {
  fs.mkdirSync(outDir, { recursive: true });

  const loaded = SECTIONS.map((s) => {
    const page = loadPage(s);
    s._title = page.title;
    return { section: s, page };
  });

  const navOrder = loaded.filter((p) => p.section.nav !== false);

  const searchDocs = [];
  for (let i = 0; i < loaded.length; i++) {
    const { section, page } = loaded[i];
    const navIdx = navOrder.findIndex((n) => n.section.slug === section.slug);
    const prev = navIdx > 0 ? navOrder[navIdx - 1].section : null;
    const next = navIdx >= 0 && navIdx < navOrder.length - 1 ? navOrder[navIdx + 1].section : null;
    const html = pageTemplate({
      section,
      body: page.html,
      pageTitle: page.title,
      h2s: page.h2s,
      prev,
      next,
    });
    const outName = section.slug === 'index' ? 'index.html' : `${section.slug}.html`;
    fs.writeFileSync(path.join(outDir, outName), html, 'utf8');

    searchDocs.push({
      id: `${section.slug}#`,
      slug: section.slug,
      url: section.slug === 'index' ? '/help' : `/help/${section.slug}`,
      section: page.title,
      heading: page.title,
      body: page.plainExcerpt,
    });
    for (const h of page.headings) {
      if (h.depth < 2 || h.depth > 3) continue;
      searchDocs.push({
        id: `${section.slug}#${h.id}`,
        slug: section.slug,
        url: `${section.slug === 'index' ? '/help' : '/help/' + section.slug}#${h.id}`,
        section: page.title,
        heading: h.text,
        body: '',
      });
    }
  }

  fs.writeFileSync(path.join(outDir, 'search-index.json'), JSON.stringify({ docs: searchDocs }), 'utf8');
  fs.writeFileSync(path.join(outDir, 'help.css'), helpCss(), 'utf8');
  fs.writeFileSync(path.join(outDir, 'help.js'), helpJs(), 'utf8');

  console.log(`[build-help-docs] rendered ${loaded.length} pages, ${searchDocs.length} search docs → ${outDir}`);
}

// ---------- CSS ----------
function helpCss() {
  return `/* HedgeIQ Help Center — friendly user-facing docs */
:root, [data-theme="midnight"] {
  --bg: #0A0E1A; --surface: #11172A; --surface-2: #161D33; --surface-sunken: #0D1322;
  --border: #1E2742; --border-strong: #2C3658;
  --text: #F8FAFC; --text-muted: #94A3B8; --text-subtle: #64748B;
  --accent: #8B5CF6; --accent-2: #A78BFA; --accent-contrast: #FFFFFF;
  --pos: #34E893; --neg: #FF6B6F;
  --code-bg: #0D1322; --code-text: #E7ECF3;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 6px 24px rgba(0,0,0,0.35);
  --font-sans: 'Inter Tight','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  --font-display: 'Fraunces',Georgia,serif;
  --font-mono: 'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
}
[data-theme="meridian"] {
  --bg: #F4F1EC; --surface: #FFFFFF; --surface-2: #FAF7F2; --surface-sunken: #EBE6DE;
  --border: #E2DCD0; --border-strong: #CFC7B8;
  --text: #141B2D; --text-muted: #5A6075; --text-subtle: #6E7384;
  --accent: #B8542A; --accent-2: #1E2A4A; --accent-contrast: #FFFFFF;
  --pos: #1F9A5E; --neg: #C0392B;
  --code-bg: #1E2A4A; --code-text: #F4F1EC;
}
[data-theme="lumen"] {
  --bg: #F7F8FB; --surface: #FFFFFF; --surface-2: #FAFBFE; --surface-sunken: #EEF1F7;
  --border: #E5E8F0; --border-strong: #CDD3E0;
  --text: #0E1323; --text-muted: #5A6278; --text-subtle: #6F7588;
  --accent: #4F46E5; --accent-2: #6366F1; --accent-contrast: #FFFFFF;
  --pos: #16A34A; --neg: #DC2626;
  --code-bg: #0E1323; --code-text: #F7F8FB;
  --font-display: var(--font-sans);
}
[data-theme="terminal"] {
  --bg: #0A0D12; --surface: #11151C; --surface-2: #151A22; --surface-sunken: #0D1117;
  --border: #1E2530; --border-strong: #2C3545;
  --text: #E7ECF3; --text-muted: #8A94A6; --text-subtle: #99A0B0;
  --accent: #C6F24E; --accent-2: #22D3EE; --accent-contrast: #0A0D12;
  --pos: #C6F24E; --neg: #FF6B6F;
  --code-bg: #0D1117; --code-text: #E7ECF3;
  --font-display: var(--font-mono);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.6;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

/* ---------- Topbar ---------- */
.topbar {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; gap: 14px;
  height: 60px;
  padding: 0 24px;
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  backdrop-filter: saturate(140%) blur(8px);
  border-bottom: 1px solid var(--border);
}
.hamburger {
  display: none;
  background: transparent; border: 0; padding: 6px;
  color: var(--text); cursor: pointer; border-radius: 6px;
}
.hamburger:hover { background: var(--surface-sunken); }
.back-app {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
}
.back-app:hover { color: var(--accent); text-decoration: none; }
.back-arrow { font-size: 15px; }
.brand {
  font-family: var(--font-display);
  font-weight: 600; font-size: 17px;
  color: var(--text);
  letter-spacing: -0.01em;
  padding-left: 16px;
  border-left: 1px solid var(--border);
  white-space: nowrap;
}

.search-wrap {
  flex: 1; max-width: 420px; position: relative;
  margin: 0 8px;
}
.search-input {
  width: 100%; height: 36px;
  padding: 0 12px;
  font-size: 14px; font-family: inherit;
  background: var(--surface-sunken);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 6px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.search-input:focus {
  outline: none; border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
}
.search-input::placeholder { color: var(--text-subtle); }
.search-results {
  position: absolute; top: calc(100% + 6px); left: 0; right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  max-height: 60vh; overflow-y: auto;
  padding: 6px;
  z-index: 60;
}
.search-results[hidden] { display: none; }
.search-result {
  display: block; padding: 10px 12px; border-radius: 6px;
  color: var(--text); cursor: pointer;
}
.search-result:hover, .search-result.is-focused { background: var(--surface-sunken); text-decoration: none; }
.search-result .sr-section { font-size: 12px; color: var(--text-subtle); text-transform: uppercase; letter-spacing: 0.04em; }
.search-result .sr-heading { font-weight: 500; font-size: 14px; margin-top: 2px; }
.search-empty { padding: 14px; color: var(--text-subtle); font-size: 14px; text-align: center; }

.theme-switcher {
  display: inline-flex; padding: 2px;
  background: var(--surface-sunken);
  border: 1px solid var(--border);
  border-radius: 8px;
}
.theme-switcher button {
  padding: 5px 10px; font-size: 12px; font-family: inherit;
  background: transparent; color: var(--text-muted);
  border: 0; border-radius: 6px; cursor: pointer;
}
.theme-switcher button.is-active { background: var(--surface); color: var(--text); box-shadow: var(--shadow-sm); font-weight: 500; }

.cta-app {
  display: inline-flex; align-items: center;
  height: 36px; padding: 0 16px;
  background: var(--accent); color: var(--accent-contrast);
  border-radius: 6px;
  font-weight: 600; font-size: 14px;
  white-space: nowrap;
}
.cta-app:hover { filter: brightness(1.06); text-decoration: none; }

/* ---------- Layout ---------- */
.help-shell {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}
.layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: calc(100vh - 60px);
}
.sidebar {
  position: sticky; top: 60px;
  align-self: start;
  height: calc(100vh - 60px);
  overflow-y: auto;
  padding: 24px 16px;
  border-right: 1px solid var(--border);
  background: var(--surface-2);
}
.sidebar-overlay {
  position: fixed; inset: 60px 0 0 0; z-index: 40;
  background: rgba(0,0,0,0.4);
  display: none;
}
.sidebar-overlay.is-visible { display: block; }

.nav-group { margin-bottom: 12px; }
.nav-group > summary {
  list-style: none;
  padding: 6px 8px;
  font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-subtle);
  cursor: pointer;
}
.nav-group > summary::-webkit-details-marker { display: none; }
.nav-list { list-style: none; padding: 0; margin: 0; }
.nav-item > a {
  display: block;
  padding: 6px 10px;
  font-size: 14px;
  color: var(--text-muted);
  border-radius: 5px;
  border-left: 2px solid transparent;
}
.nav-item > a:hover { background: var(--surface-sunken); color: var(--text); text-decoration: none; }
.nav-item.is-active > a {
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  border-left-color: var(--accent);
  font-weight: 500;
}
.nav-sub { list-style: none; padding: 4px 0 4px 14px; margin: 0; border-left: 1px solid var(--border); margin-left: 12px; }
.nav-sub a {
  display: block; padding: 4px 10px;
  font-size: 13px; color: var(--text-subtle);
  border-radius: 4px;
}
.nav-sub a:hover { color: var(--text); background: var(--surface-sunken); text-decoration: none; }

/* ---------- Content ---------- */
.content {
  padding: 48px 56px 96px;
  width: 100%;
  max-width: 920px;
  margin: 0 auto;
}
.prose {
  max-width: 100%;
  font-size: 16px;
  line-height: 1.75;
  color: var(--text);
}
.prose > *:first-child { margin-top: 0; }
.prose h1 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 40px;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 0 0 24px;
  color: var(--text);
}
.prose h2 {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 26px;
  line-height: 1.25;
  letter-spacing: -0.01em;
  margin: 56px 0 16px;
  color: var(--text);
  padding-top: 8px;
  border-top: 1px solid var(--border);
}
.prose h3 { font-size: 19px; font-weight: 600; margin: 36px 0 12px; }
.prose h4 { font-size: 16px; font-weight: 600; margin: 28px 0 8px; }
.prose p { margin: 0 0 18px; }
.prose ul, .prose ol { margin: 0 0 18px; padding-left: 24px; }
.prose li { margin-bottom: 6px; }
.prose blockquote {
  margin: 0 0 18px; padding: 12px 18px;
  border-left: 3px solid var(--accent);
  background: var(--surface-sunken);
  color: var(--text-muted);
  border-radius: 0 6px 6px 0;
}
.prose blockquote p:last-child { margin-bottom: 0; }
.prose hr { border: 0; border-top: 1px solid var(--border); margin: 40px 0; }

.prose img { max-width: 100%; border-radius: 8px; }
.prose figure { margin: 24px 0; text-align: center; }
.prose figure img {
  display: block; margin: 0 auto 8px;
  border: 1px solid var(--border);
  background: var(--surface);
}
.prose figure figcaption {
  font-size: 13px; color: var(--text-subtle); font-style: italic;
}

/* Mermaid */
.prose pre.mermaid {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 18px;
  margin: 0 0 22px;
  text-align: center;
  overflow-x: auto;
  font-family: var(--font-sans);
  color: var(--text);
}
.prose pre.mermaid svg { max-width: 100%; height: auto; }

.prose .anchor {
  display: inline-block; opacity: 0;
  margin-left: -22px; padding-right: 6px;
  color: var(--text-subtle); text-decoration: none;
  font-weight: 400;
  transition: opacity 0.15s;
}
.prose h1:hover .anchor,
.prose h2:hover .anchor,
.prose h3:hover .anchor,
.prose h4:hover .anchor { opacity: 1; }

/* Inline code */
.prose code {
  font-family: var(--font-mono);
  font-size: 0.88em;
  padding: 2px 5px;
  background: var(--surface-sunken);
  color: var(--text);
  border-radius: 4px;
  border: 1px solid var(--border);
}

/* Code blocks */
.code-block {
  position: relative;
  margin: 0 0 22px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--code-bg);
  border: 1px solid var(--border);
}
.code-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 12px;
  background: color-mix(in srgb, var(--code-bg) 80%, black);
  border-bottom: 1px solid color-mix(in srgb, var(--code-bg) 80%, black);
}
.code-lang {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.55);
}
.code-copy {
  font-family: var(--font-sans);
  font-size: 11px;
  color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.code-copy:hover { background: rgba(255,255,255,0.16); color: #fff; }
.code-copy.is-copied { color: #C6F24E; }
.code-block pre {
  margin: 0;
  padding: 14px 16px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--code-text);
  background: transparent;
}
.code-block pre code { padding: 0; background: transparent; border: 0; color: inherit; font-size: inherit; }

/* Prism token colors */
.token.comment, .token.prolog, .token.doctype, .token.cdata { color: #7a8b99; }
.token.punctuation { color: #c0c4cc; }
.token.property, .token.tag, .token.constant, .token.symbol, .token.deleted { color: #ff8b8b; }
.token.boolean, .token.number { color: #ffb86c; }
.token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #a3e635; }
.token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string { color: #82e9de; }
.token.atrule, .token.attr-value, .token.keyword { color: #c084fc; }
.token.function, .token.class-name { color: #38bdf8; }
.token.regex, .token.important, .token.variable { color: #facc15; }

/* Tables */
.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 22px;
  font-size: 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}
.prose th, .prose td {
  text-align: left;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
}
.prose th {
  background: var(--surface-sunken);
  font-weight: 600;
  color: var(--text);
  font-size: 13px;
}
.prose tr:nth-child(even) td { background: var(--surface-2); }
.prose tr:last-child td { border-bottom: 0; }

/* Tile grid (used on the index) */
.tile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin: 24px 0 32px;
}
.tile-grid a {
  display: block;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text);
  transition: border-color 0.15s, transform 0.05s;
}
.tile-grid a:hover { border-color: var(--accent); text-decoration: none; transform: translateY(-1px); }
.tile-grid a strong {
  display: block;
  font-size: 15px;
  margin-bottom: 6px;
  color: var(--accent);
}
.tile-grid a span {
  display: block;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Footer */
.page-footer {
  max-width: 100%;
  margin-top: 64px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}
.page-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}
.page-nav-prev, .page-nav-next {
  display: flex; flex-direction: column;
  padding: 16px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
}
.page-nav-prev:hover, .page-nav-next:hover { border-color: var(--accent); text-decoration: none; }
.page-nav-next { text-align: right; align-items: flex-end; }
.page-nav-label { font-size: 12px; color: var(--text-subtle); text-transform: uppercase; letter-spacing: 0.06em; }
.page-nav-title { font-weight: 600; font-size: 15px; margin-top: 4px; color: var(--accent); }

.help-footer-row {
  display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  font-size: 13px; color: var(--text-muted);
}
.help-footer-row p { margin: 0; }

/* Mobile */
@media (max-width: 900px) {
  .content { padding: 32px 24px 80px; }
}
@media (max-width: 768px) {
  .topbar { padding: 0 12px; gap: 8px; }
  .hamburger { display: inline-flex; }
  .theme-switcher, .brand { display: none; }
  .cta-app { padding: 0 12px; font-size: 13px; }
  .search-wrap { margin: 0; }
  .layout { grid-template-columns: 1fr; }
  .sidebar {
    position: fixed; top: 60px; left: 0; bottom: 0;
    width: 280px; max-width: 86vw;
    z-index: 45;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }
  .sidebar.is-open { transform: translateX(0); box-shadow: var(--shadow-md); }
  .content { padding: 24px 16px 64px; }
  .prose h1 { font-size: 30px; }
  .prose h2 { font-size: 22px; margin: 40px 0 14px; }
  .page-nav { grid-template-columns: 1fr; }
  .page-nav-next { text-align: left; align-items: flex-start; }
}
`;
}

// ---------- JS ----------
function helpJs() {
  return `/* HedgeIQ help center runtime: theme switcher, drawer, lunr search */
(function () {
  'use strict';

  // ---------- Theme switcher (unified key) ----------
  var THEME_KEY = 'hedgeiq_theme';
  var THEMES = ['midnight', 'meridian', 'lumen', 'terminal'];
  function getTheme() {
    try {
      var t = localStorage.getItem(THEME_KEY);
      return THEMES.indexOf(t) >= 0 ? t : 'midnight';
    } catch (e) { return 'midnight'; }
  }
  function setTheme(t) {
    if (THEMES.indexOf(t) < 0) t = 'midnight';
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    document.querySelectorAll('[data-theme-btn]').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-theme-btn') === t);
    });
  }
  document.querySelectorAll('[data-theme-btn]').forEach(function (b) {
    b.addEventListener('click', function () { setTheme(b.getAttribute('data-theme-btn')); });
  });
  setTheme(getTheme());

  // Cross-tab sync: respond to other surfaces changing the theme
  window.addEventListener('storage', function (e) {
    if (e.key === THEME_KEY && e.newValue) setTheme(e.newValue);
  });

  // ---------- Drawer ----------
  var sidebar = document.querySelector('.sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  var hamburger = document.querySelector('.hamburger');
  function openDrawer() {
    if (!sidebar) return;
    sidebar.classList.add('is-open');
    if (overlay) { overlay.hidden = false; overlay.classList.add('is-visible'); }
  }
  function closeDrawer() {
    if (!sidebar) return;
    sidebar.classList.remove('is-open');
    if (overlay) { overlay.classList.remove('is-visible'); overlay.hidden = true; }
  }
  if (hamburger) hamburger.addEventListener('click', function (e) {
    e.stopPropagation();
    if (sidebar.classList.contains('is-open')) closeDrawer(); else openDrawer();
  });
  if (overlay) overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
  document.querySelectorAll('.sidebar a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.matchMedia('(max-width: 768px)').matches) closeDrawer();
    });
  });

  // ---------- Code copy ----------
  document.querySelectorAll('.code-copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pre = btn.closest('.code-block').querySelector('pre');
      if (!pre) return;
      var text = pre.innerText;
      var done = function () {
        var prev = btn.textContent;
        btn.textContent = 'Copied';
        btn.classList.add('is-copied');
        setTimeout(function () { btn.textContent = prev; btn.classList.remove('is-copied'); }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });

  // ---------- Search ----------
  var input = document.querySelector('.search-input');
  var resultsEl = document.querySelector('.search-results');
  if (!input || !resultsEl) return;

  var lunrIndex = null;
  var docsById = {};
  var loaded = false;
  var loading = null;

  function loadIndex() {
    if (loaded || loading) return loading;
    loading = fetch('/help/search-index.json').then(function (r) { return r.json(); }).then(function (data) {
      if (typeof window.lunr !== 'function') return null;
      lunrIndex = window.lunr(function () {
        this.ref('id');
        this.field('heading', { boost: 5 });
        this.field('section', { boost: 2 });
        this.field('body');
        var self = this;
        data.docs.forEach(function (d) { docsById[d.id] = d; self.add(d); });
      });
      loaded = true;
    }).catch(function () {});
    return loading;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderResults(query) {
    if (!lunrIndex) { resultsEl.hidden = true; return; }
    if (query.length < 2) { resultsEl.hidden = true; return; }
    var hits = [];
    try { hits = lunrIndex.search(query + '*').slice(0, 8); }
    catch (e) { try { hits = lunrIndex.search(query).slice(0, 8); } catch (e2) { hits = []; } }
    if (!hits.length) {
      resultsEl.innerHTML = '<div class="search-empty">No matches for "' + escapeHtml(query) + '"</div>';
      resultsEl.hidden = false;
      return;
    }
    var html = hits.map(function (h, i) {
      var d = docsById[h.ref];
      if (!d) return '';
      return '<a class="search-result' + (i === 0 ? ' is-focused' : '') + '" href="' + d.url + '">'
        + '<div class="sr-section">' + escapeHtml(d.section) + '</div>'
        + '<div class="sr-heading">' + escapeHtml(d.heading) + '</div>'
        + '</a>';
    }).join('');
    resultsEl.innerHTML = html;
    resultsEl.hidden = false;
  }

  var debounceTimer;
  input.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    var q = input.value.trim();
    if (q.length < 2) { resultsEl.hidden = true; return; }
    debounceTimer = setTimeout(function () {
      loadIndex().then(function () { renderResults(q); });
    }, 100);
  });
  input.addEventListener('focus', function () { loadIndex(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { input.blur(); resultsEl.hidden = true; return; }
    if (e.key === 'Enter') {
      var first = resultsEl.querySelector('.search-result');
      if (first) { e.preventDefault(); window.location.href = first.getAttribute('href'); }
    }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.search-wrap')) resultsEl.hidden = true;
  });
})();
`;
}

build();
