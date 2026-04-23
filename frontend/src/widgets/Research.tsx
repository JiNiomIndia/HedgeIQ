import { useState, useEffect } from 'react';
import { API } from '../lib/api';
import { bus, EVENTS } from '../lib/event-bus';
import PriceChart from '../components/PriceChart';

type ResearchTab = 'overview' | 'chart' | 'news' | 'options' | 'financials';

const TABS: { key: ResearchTab; label: string }[] = [
  { key: 'overview',   label: 'Overview' },
  { key: 'chart',      label: 'Chart' },
  { key: 'news',       label: 'News' },
  { key: 'options',    label: 'Options' },
  { key: 'financials', label: 'Financials' },
];

interface Article { title: string; published_utc: string; article_url: string; publisher: string; description: string; }
interface Quote { last: number; change: number; changePct: number; }

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Research() {
  const [symbol, setSymbol]   = useState('AAPL');
  const [input, setInput]     = useState('AAPL');
  const [tab, setTab]         = useState<ResearchTab>('overview');
  const [quote, setQuote]     = useState<Quote | null>(null);
  const [news, setNews]       = useState<Article[]>([]);
  const [newsLoading, setNL]  = useState(false);

  useEffect(() => bus.on<string>(EVENTS.SYMBOL_SELECTED, s => { setSymbol(s); setInput(s); }), []);

  useEffect(() => {
    if (!symbol) return;
    fetch(`${API}/api/v1/quotes/${symbol}/chart?days=5`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
    }).then(r => r.json()).then(d => setQuote({ last: d.last_close || 0, change: d.day_change || 0, changePct: d.day_change_pct || 0 })).catch(() => {});
  }, [symbol]);

  useEffect(() => {
    if (tab !== 'news' || !symbol) return;
    setNL(true);
    setNews([]);
    fetch(`${API}/api/v1/quotes/${symbol}/news?limit=10`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
    }).then(r => r.json()).then(d => { setNews(d.articles || []); setNL(false); }).catch(() => setNL(false));
  }, [tab, symbol]);

  const load = () => { const s = input.trim().toUpperCase(); if (s) setSymbol(s); };
  const up = (quote?.change ?? 0) >= 0;
  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const BROKER_LINKS = [
    { name: 'Yahoo Finance', url: `https://finance.yahoo.com/quote/${symbol}` },
    { name: 'SEC EDGAR', url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${symbol}&type=10-K` },
    { name: 'Earnings Whispers', url: `https://www.earningswhispers.com/stocks/${symbol.toLowerCase()}` },
    { name: 'StockAnalysis', url: `https://stockanalysis.com/stocks/${symbol.toLowerCase()}` },
    { name: 'Macrotrends', url: `https://www.macrotrends.net/stocks/charts/${symbol}` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && load()}
          className="input" style={{ flex: 1, fontSize: 'var(--fs-xs)', fontWeight: 700 }} placeholder="Ticker" />
        <button onClick={load} className="btn btn-sm btn-primary" style={{ fontSize: 'var(--fs-xs)' }}>Research</button>
        {quote && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-xs)' }}>
            <span style={{ fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>${quote.last.toFixed(2)}</span>
            <span style={{ color: up ? 'var(--pos)' : 'var(--neg)', fontVariantNumeric: 'tabular-nums' }}>
              {up ? '+' : ''}{quote.changePct.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--surface)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '7px 12px', fontSize: 10, fontWeight: 600, border: 'none',
              borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
              background: 'none', color: tab === t.key ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'overview' && (
          <div style={{ padding: 14 }}>
            <h2 style={{ fontWeight: 800, fontSize: 'var(--fs-xl)', color: 'var(--text)', margin: '0 0 4px', fontFamily: 'var(--font-display)' }}>{symbol}</h2>
            {quote && (
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{fmt(quote.last)}</span>
                <span style={{ marginLeft: 10, color: up ? 'var(--pos)' : 'var(--neg)', fontSize: 'var(--fs-sm)', fontVariantNumeric: 'tabular-nums' }}>
                  {up ? '+' : ''}{fmt(quote.change)} ({up ? '+' : ''}{quote.changePct.toFixed(2)}%)
                </span>
              </div>
            )}
            <div>
              <p style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>External Research</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {BROKER_LINKS.map(l => (
                  <a key={l.name} href={l.url} target="_blank" rel="noreferrer"
                    className="btn btn-sm btn-ghost"
                    style={{ textDecoration: 'none', justifyContent: 'space-between', display: 'flex', fontSize: 'var(--fs-xs)' }}>
                    <span>{l.name}</span><span>↗</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'chart' && (
          <div style={{ height: '100%', minHeight: 300 }}>
            <PriceChart symbol={symbol} />
          </div>
        )}

        {tab === 'news' && (
          <div style={{ padding: 12 }}>
            {newsLoading && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>Loading news…</p>}
            {!newsLoading && news.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>No news found for {symbol}.</p>
            )}
            {news.map((a, i) => (
              <a key={i} href={a.article_url} target="_blank" rel="noreferrer"
                style={{ display: 'block', textDecoration: 'none', marginBottom: 10, padding: '10px 12px',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 'var(--fs-xs)', marginBottom: 4, lineHeight: 1.4 }}>{a.title}</p>
                <div style={{ display: 'flex', gap: 8, fontSize: 9, color: 'var(--text-subtle)' }}>
                  {a.publisher && <span style={{ color: 'var(--accent)' }}>{a.publisher}</span>}
                  <span>{timeAgo(a.published_utc)}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {tab === 'options' && (
          <div style={{ padding: 12 }}>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 10 }}>
              Load the Options Chain widget for {symbol} or visit external sources:
            </p>
            {[
              { name: `${symbol} Options on Barchart`, url: `https://www.barchart.com/stocks/quotes/${symbol}/options` },
              { name: `${symbol} Options on Market Chameleon`, url: `https://marketchameleon.com/Overview/${symbol}/Options/` },
              { name: `IV Rank on Market Chameleon`, url: `https://marketchameleon.com/Overview/${symbol}/IV/` },
            ].map(l => (
              <a key={l.name} href={l.url} target="_blank" rel="noreferrer"
                className="btn btn-sm btn-ghost" style={{ display: 'flex', justifyContent: 'space-between', textDecoration: 'none', marginBottom: 5, fontSize: 'var(--fs-xs)' }}>
                <span>{l.name}</span><span>↗</span>
              </a>
            ))}
          </div>
        )}

        {tab === 'financials' && (
          <div style={{ padding: 12 }}>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 10 }}>
              Financial statements and ratios via trusted external sources:
            </p>
            {[
              { name: `${symbol} Financials — Macrotrends`, url: `https://www.macrotrends.net/stocks/charts/${symbol}/${symbol.toLowerCase()}/revenue` },
              { name: `${symbol} Key Metrics — StockAnalysis`, url: `https://stockanalysis.com/stocks/${symbol.toLowerCase()}/financials/` },
              { name: `${symbol} Balance Sheet — WSJ`, url: `https://www.wsj.com/market-data/quotes/${symbol}/financials/annual/balance-sheet` },
              { name: `${symbol} DCF — Finviz`, url: `https://finviz.com/quote.ashx?t=${symbol}` },
            ].map(l => (
              <a key={l.name} href={l.url} target="_blank" rel="noreferrer"
                className="btn btn-sm btn-ghost" style={{ display: 'flex', justifyContent: 'space-between', textDecoration: 'none', marginBottom: 5, fontSize: 'var(--fs-xs)' }}>
                <span>{l.name}</span><span>↗</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
