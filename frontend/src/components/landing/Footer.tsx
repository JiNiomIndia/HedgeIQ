/**
 * 4-column footer with wordmark and GitHub link.
 * Internal routes use react-router Link; external uses anchor.
 * @component
 */
import { Link } from 'react-router-dom';

type Item = readonly [label: string, href: string, external?: boolean];

const COLS: { title: string; items: readonly Item[] }[] = [
  { title: 'Product',   items: [['Home', '/'], ['Features', '/#features'], ['How it works', '/#how'], ['FAQ', '/#faq']] },
  { title: 'Company',   items: [['About', '/about'], ['Contact', '/contact']] },
  { title: 'Resources', items: [['Documentation', '/wiki', true], ['Security', '/security'], ['Status', '/status']] },
  { title: 'Legal',     items: [['Privacy', '/privacy'], ['Terms', '/terms']] },
];

function FooterLink({ item }: { item: Item }) {
  const [label, href, external] = item;
  const style = { fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' } as const;
  const isHash = href.startsWith('/#') || href.startsWith('#');
  const isInternal = !external && href.startsWith('/') && !isHash;
  if (isInternal) {
    return <Link to={href} style={style}>{label}</Link>;
  }
  return <a href={href} style={style}>{label}</a>;
}

export default function Footer() {
  return (
    <footer style={{ padding: '64px 24px 40px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="landing-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(4, 1fr)', gap: 32, marginBottom: 56 }}>
          <div>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', textDecoration: 'none' }}>
              <span style={{ display: 'inline-block', width: 22, height: 22, borderRadius: 5, background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, #000))' }} />
              HedgeIQ
            </Link>
            <p style={{ marginTop: 14, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 280 }}>
              AI-powered portfolio hedging. Built from a real $2,355 loss.
            </p>
          </div>
          {COLS.map(c => (
            <div key={c.title}>
              <h4 style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text)', margin: '0 0 14px' }}>{c.title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {c.items.map(item => (
                  <li key={item[0]}><FooterLink item={item} /></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0 }}>© {new Date().getFullYear()} HedgeIQ. Built by traders, for traders.</p>
          <a href="https://github.com/JiNiomIndia/HedgeIQ" target="_blank" rel="noreferrer" aria-label="GitHub repository" style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.6 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.9 1.2 3.1 0 4.5-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
