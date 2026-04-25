/**
 * Build script: render docs/wiki/*.md → dist/wiki/*.html as a GitBook-style site.
 *
 * Generates:
 *  - dist/wiki/<slug>.html for each markdown source (README → index.html)
 *  - dist/wiki/wiki.css   shared styles
 *  - dist/wiki/wiki.js    runtime: theme switcher, drawer, lunr search
 *  - dist/wiki/search-index.json  lunr-friendly source documents
 */
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const Prism = require('prismjs');
require('prismjs/components/prism-bash');
require('prismjs/components/prism-python');
require('prismjs/components/prism-typescript');
require('prismjs/components/prism-json');
require('prismjs/components/prism-sql');
require('prismjs/components/prism-javascript');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'docs/wiki');
const outDir = path.resolve(__dirname, 'dist/wiki');

// ---------- Section catalog ----------
// slug, file, group. README is the index.
const SECTIONS = [
  { slug: 'index',                    file: 'README.md',                   group: 'Home',                    nav: false, title: 'HedgeIQ Documentation' },
  { slug: '01-overview',              file: '01-overview.md',              group: 'Overview' },
  { slug: '02-architecture',          file: '02-architecture.md',          group: 'Overview' },
  { slug: '03-getting-started',       file: '03-getting-started.md',       group: 'Overview' },
  { slug: '04-backend-api',           file: '04-backend-api.md',           group: 'Implementation' },
  { slug: '05-frontend-components',   file: '05-frontend-components.md',   group: 'Implementation' },
  { slug: '06-domain-model',          file: '06-domain-model.md',          group: 'Implementation' },
  { slug: '07-hedge-algorithm',       file: '07-hedge-algorithm.md',       group: 'Implementation' },
  { slug: '08-ai-integration',        file: '08-ai-integration.md',        group: 'Implementation' },
  { slug: '09-broker-integration',    file: '09-broker-integration.md',    group: 'Implementation' },
  { slug: '10-data-sources',          file: '10-data-sources.md',          group: 'Implementation' },
  { slug: '11-security',              file: '11-security.md',              group: 'Quality & Operations' },
  { slug: '12-accessibility',         file: '12-accessibility.md',         group: 'Quality & Operations' },
  { slug: '13-testing',               file: '13-testing.md',               group: 'Quality & Operations' },
  { slug: '14-deployment',            file: '14-deployment.md',            group: 'Quality & Operations' },
  { slug: '15-contributing',          file: '15-contributing.md',          group: 'Project' },
  { slug: '16-roadmap',               file: '16-roadmap.md',               group: 'Project' },
  { slug: '17-faq-troubleshooting',   file: '17-faq-troubleshooting.md',   group: 'Project' },
];

const NAV_GROUPS = [
  { label: 'Overview', collapsible: false },
  { label: 'Implementation', collapsible: true },
  { label: 'Quality & Operations', collapsible: false },
  { label: 'Project', collapsible: false },
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
const headings = []; // collected per-page

renderer.heading = function ({ tokens, depth }) {
  const text = this.parser.parseInline(tokens);
  const raw = tokens.map((t) => ('text' in t ? t.text : '')).join('');
  const id = slugifyHeading(raw);
  headings.push({ depth, text: raw, id });
  return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-label="Link to this section">#</a>${text}</h${depth}>\n`;
};

renderer.code = function ({ text, lang }) {
  const language = (lang || '').trim().toLowerCase();
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

renderer.link = function ({ href, title, tokens }) {
  const text = this.parser.parseInline(tokens);
  let target = href || '';
  // Rewrite intra-wiki .md links → /wiki/<slug>
  if (target && /\.md(#.*)?$/i.test(target) && !/^https?:/i.test(target)) {
    const m = target.match(/^([^#]+)(#.*)?$/);
    const file = m[1];
    const hash = m[2] || '';
    const base = path.basename(file, '.md');
    const slug = base.toLowerCase() === 'readme' ? '' : base;
    target = `/wiki${slug ? '/' + slug : ''}${hash}`;
  }
  // Rewrite ../presentation/index.html → /presentation
  if (/^\.\.\/presentation(\/index\.html)?$/.test(target)) {
    target = '/presentation';
  }
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
  const ext = /^https?:/i.test(target) ? ' target="_blank" rel="noopener"' : '';
  return `<a href="${target}"${titleAttr}${ext}>${text}</a>`;
};

marked.use({ renderer, gfm: true });

// ---------- Page rendering ----------
function loadPage(section) {
  const md = fs.readFileSync(path.join(srcDir, section.file), 'utf8');
  headings.length = 0;
  const html = marked.parse(md);
  // first h1 from headings array
  const h1 = headings.find((h) => h.depth === 1);
  const title = h1 ? h1.text : (section.title || section.slug);
  // sub-anchors = h2s
  const h2s = headings.filter((h) => h.depth === 2);
  // first 300 chars of plain text per h2 section, for search
  const plain = md.replace(/```[\s\S]*?```/g, ' ').replace(/[#>*_`-]/g, ' ').replace(/\s+/g, ' ').trim();
  return { md, html, title, h1, h2s, headings: [...headings], plainExcerpt: plain.slice(0, 600) };
}

function navHtml(activeSlug, pageH2s) {
  const parts = [];
  for (const grp of NAV_GROUPS) {
    const items = SECTIONS.filter((s) => s.group === grp.label && s.nav !== false);
    if (!items.length) continue;
    const groupId = `grp-${slugifyHeading(grp.label)}`;
    const isActiveGroup = items.some((it) => it.slug === activeSlug);
    const openAttr = !grp.collapsible || isActiveGroup ? ' open' : '';
    parts.push(`<details class="nav-group"${openAttr}><summary>${escapeHtml(grp.label)}</summary><ul class="nav-list">`);
    for (const it of items) {
      const isActive = it.slug === activeSlug;
      const href = `/wiki/${it.slug}`;
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
  const editUrl = `https://github.com/JiNiomIndia/HedgeIQ/edit/main/docs/wiki/${section.file}`;
  const nav = navHtml(section.slug, h2s);
  const prevLink = prev ? `<a class="page-nav-prev" href="/wiki/${prev.slug === 'index' ? '' : prev.slug}"><span class="page-nav-label">Previous</span><span class="page-nav-title">${escapeHtml(prev._title || prev.slug)}</span></a>` : '<span></span>';
  const nextLink = next ? `<a class="page-nav-next" href="/wiki/${next.slug === 'index' ? '' : next.slug}"><span class="page-nav-label">Next</span><span class="page-nav-title">${escapeHtml(next._title || next.slug)}</span></a>` : '<span></span>';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#141B2D">
<title>${escapeHtml(pageTitle)} — HedgeIQ Docs</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/wiki/wiki.css">
<script>
  (function(){
    try {
      var t = localStorage.getItem('hedgeiq_wiki_theme') || 'meridian';
      document.documentElement.setAttribute('data-theme', t);
    } catch(e) { document.documentElement.setAttribute('data-theme', 'meridian'); }
  })();
</script>
</head>
<body>
<header class="topbar">
  <button class="hamburger" aria-label="Open navigation" type="button">
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>
  </button>
  <a class="wordmark" href="/" aria-label="HedgeIQ home"><span class="wordmark-arrow">←</span> <span class="wordmark-name">HedgeIQ</span></a>
  <div class="search-wrap">
    <input class="search-input" type="search" placeholder="Search docs..." aria-label="Search documentation" autocomplete="off">
    <div class="search-results" role="listbox" hidden></div>
  </div>
  <div class="theme-switcher" role="group" aria-label="Theme">
    <button data-theme-btn="meridian" type="button" title="Meridian theme">Meridian</button>
    <button data-theme-btn="lumen" type="button" title="Lumen theme">Lumen</button>
    <button data-theme-btn="terminal" type="button" title="Terminal theme">Terminal</button>
  </div>
  <a class="cta-app" href="/login">Get the app</a>
</header>
<div class="layout">
  <aside class="sidebar" aria-label="Documentation sections">
    <nav class="nav">${nav}</nav>
  </aside>
  <div class="sidebar-overlay" hidden></div>
  <main class="content">
    <article class="prose">${body}</article>
    <footer class="page-footer">
      <a class="edit-link" href="${editUrl}" target="_blank" rel="noopener">Edit this page on GitHub →</a>
      <div class="page-nav">${prevLink}${nextLink}</div>
    </footer>
  </main>
</div>
<script src="https://unpkg.com/lunr@2.3.9/lunr.min.js" defer></script>
<script src="/wiki/wiki.js" defer></script>
</body>
</html>
`;
}

// ---------- Main ----------
function build() {
  fs.mkdirSync(outDir, { recursive: true });

  // First pass: load and store titles on each section
  const loaded = SECTIONS.map((s) => {
    const page = loadPage(s);
    s._title = page.title;
    return { section: s, page };
  });

  // Build navigation order excluding index for prev/next traversal
  const navOrder = loaded.filter((p) => p.section.nav !== false);

  // Render pages
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

    // Search docs: one per heading section, plus a top-level page doc
    searchDocs.push({
      id: `${section.slug}#`,
      slug: section.slug,
      url: section.slug === 'index' ? '/wiki' : `/wiki/${section.slug}`,
      section: page.title,
      heading: page.title,
      body: page.plainExcerpt,
    });
    for (const h of page.headings) {
      if (h.depth < 2 || h.depth > 3) continue;
      searchDocs.push({
        id: `${section.slug}#${h.id}`,
        slug: section.slug,
        url: `${section.slug === 'index' ? '/wiki' : '/wiki/' + section.slug}#${h.id}`,
        section: page.title,
        heading: h.text,
        body: '',
      });
    }
  }

  // Search index file
  fs.writeFileSync(path.join(outDir, 'search-index.json'), JSON.stringify({ docs: searchDocs }), 'utf8');

  // CSS
  fs.writeFileSync(path.join(outDir, 'wiki.css'), wikiCss(), 'utf8');
  // JS
  fs.writeFileSync(path.join(outDir, 'wiki.js'), wikiJs(), 'utf8');

  console.log(`[build-wiki] rendered ${loaded.length} pages, ${searchDocs.length} search docs → ${outDir}`);
}

// ---------- CSS ----------
function wikiCss() {
  return `/* HedgeIQ wiki — GitBook-style docs */
:root, [data-theme="meridian"] {
  --bg: #F4F1EC; --surface: #FFFFFF; --surface-2: #FAF7F2; --surface-sunken: #EBE6DE;
  --border: #E2DCD0; --border-strong: #CFC7B8;
  --text: #141B2D; --text-muted: #5A6075; --text-subtle: #6E7384;
  --accent: #B8542A; --accent-2: #1E2A4A; --accent-contrast: #FFFFFF;
  --code-bg: #1E2A4A; --code-text: #F4F1EC;
  --shadow-sm: 0 1px 2px rgba(20,27,45,0.06);
  --shadow-md: 0 6px 24px rgba(20,27,45,0.08);
  --font-sans: 'Inter Tight','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  --font-display: 'Fraunces',Georgia,serif;
  --font-mono: 'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
}
[data-theme="lumen"] {
  --bg: #F7F8FB; --surface: #FFFFFF; --surface-2: #FAFBFE; --surface-sunken: #EEF1F7;
  --border: #E5E8F0; --border-strong: #CDD3E0;
  --text: #0E1323; --text-muted: #5A6278; --text-subtle: #6F7588;
  --accent: #4F46E5; --accent-2: #6366F1; --accent-contrast: #FFFFFF;
  --code-bg: #0E1323; --code-text: #F7F8FB;
  --font-display: var(--font-sans);
}
[data-theme="terminal"] {
  --bg: #0A0D12; --surface: #11151C; --surface-2: #151A22; --surface-sunken: #0D1117;
  --border: #1E2530; --border-strong: #2C3545;
  --text: #E7ECF3; --text-muted: #8A94A6; --text-subtle: #99A0B0;
  --accent: #C6F24E; --accent-2: #22D3EE; --accent-contrast: #0A0D12;
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
  text-rendering: optimizeLegibility;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

/* ---------- Topbar ---------- */
.topbar {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; gap: 16px;
  height: 60px;
  padding: 0 24px;
  background: color-mix(in oklch, var(--surface) 92%, transparent);
  backdrop-filter: saturate(140%) blur(8px);
  border-bottom: 1px solid var(--border);
}
.hamburger {
  display: none;
  background: transparent; border: 0; padding: 6px;
  color: var(--text); cursor: pointer; border-radius: 6px;
}
.hamburger:hover { background: var(--surface-sunken); }
.wordmark {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-display);
  font-weight: 600; font-size: 18px;
  color: var(--text);
  letter-spacing: -0.01em;
}
.wordmark:hover { text-decoration: none; color: var(--accent); }
.wordmark-arrow { color: var(--text-subtle); font-weight: 400; }

.search-wrap {
  flex: 1; max-width: 480px; position: relative;
  margin: 0 12px;
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
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--accent) 18%, transparent);
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
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
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
  background: color-mix(in oklch, var(--accent) 10%, transparent);
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
  max-width: calc(760px + 112px);
  width: 100%;
}
.prose {
  max-width: 760px;
  font-size: 16px;
  line-height: 1.7;
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
  font-style: italic;
}
.prose blockquote p:last-child { margin-bottom: 0; }
.prose hr { border: 0; border-top: 1px solid var(--border); margin: 40px 0; }

.prose img { max-width: 100%; border-radius: 6px; }

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
  background: color-mix(in oklch, var(--code-bg) 80%, black);
  border-bottom: 1px solid color-mix(in oklch, var(--code-bg) 80%, black);
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
  transition: background 0.15s;
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

/* Prism token colors (works on dark code-bg) */
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
  letter-spacing: 0.01em;
}
.prose tr:nth-child(even) td { background: var(--surface-2); }
.prose tr:last-child td { border-bottom: 0; }

/* Footer / page nav */
.page-footer {
  max-width: 760px;
  margin-top: 64px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}
.edit-link {
  display: inline-block;
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 24px;
}
.page-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.page-nav-prev, .page-nav-next {
  display: flex; flex-direction: column;
  padding: 16px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  transition: border-color 0.15s, transform 0.05s;
}
.page-nav-prev:hover, .page-nav-next:hover { border-color: var(--accent); text-decoration: none; }
.page-nav-next { text-align: right; align-items: flex-end; }
.page-nav-label { font-size: 12px; color: var(--text-subtle); text-transform: uppercase; letter-spacing: 0.06em; }
.page-nav-title { font-weight: 600; font-size: 15px; margin-top: 4px; color: var(--accent); }

/* ---------- Mobile ---------- */
@media (max-width: 900px) {
  .content { padding: 32px 24px 80px; }
}
@media (max-width: 768px) {
  .topbar { padding: 0 12px; gap: 8px; }
  .hamburger { display: inline-flex; }
  .theme-switcher { display: none; }
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
function wikiJs() {
  return `/* HedgeIQ wiki runtime: theme switcher, drawer, lunr search */
(function () {
  'use strict';

  // ---------- Theme switcher ----------
  var THEME_KEY = 'hedgeiq_wiki_theme';
  var THEMES = ['meridian', 'lumen', 'terminal'];
  function getTheme() {
    try { return localStorage.getItem(THEME_KEY) || 'meridian'; } catch (e) { return 'meridian'; }
  }
  function setTheme(t) {
    if (THEMES.indexOf(t) < 0) t = 'meridian';
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
  // Close drawer when navigating internally on mobile
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
    loading = fetch('/wiki/search-index.json').then(function (r) { return r.json(); }).then(function (data) {
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
    }).catch(function () { /* ignore */ });
    return loading;
  }

  function renderResults(query) {
    if (!lunrIndex) { resultsEl.hidden = true; return; }
    if (query.length < 2) { resultsEl.hidden = true; return; }
    var hits = [];
    try {
      hits = lunrIndex.search(query + '*').slice(0, 8);
    } catch (e) {
      try { hits = lunrIndex.search(query).slice(0, 8); } catch (e2) { hits = []; }
    }
    if (!hits.length) {
      resultsEl.innerHTML = '<div class="search-empty">No matches for "' + escapeHtml(query) + '"</div>';
      resultsEl.hidden = false;
      return;
    }
    var html = hits.map(function (h, i) {
      var d = docsById[h.ref];
      if (!d) return '';
      return '<a class="search-result' + (i === 0 ? ' is-focused' : '') + '" href="' + d.url + '" data-idx="' + i + '">'
        + '<div class="sr-section">' + escapeHtml(d.section) + '</div>'
        + '<div class="sr-heading">' + escapeHtml(d.heading) + '</div>'
        + '</a>';
    }).join('');
    resultsEl.innerHTML = html;
    resultsEl.hidden = false;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
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
