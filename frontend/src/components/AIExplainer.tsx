import { useEffect, useState } from 'react';
import { Markdown } from '../lib/markdown';
import { API } from '../lib/api';

interface Props {
  contract: { symbol: string; option_type: string; strike: number; expiry_date: string; ask: number; open_interest: number; };
  onClose: () => void;
}

export default function AIExplainer({ contract, onClose }: Props) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/v1/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
      body: JSON.stringify({ contract })
    }).then(r => r.json()).then(data => { setExplanation(data.explanation || ''); setLoading(false); })
      .catch(() => { setExplanation('AI explanation unavailable.'); setLoading(false); });
  }, [contract.symbol]);

  return (
    <div style={{ borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--accent)' }}>
            {contract.expiry_date} ${contract.strike} {contract.option_type}
          </p>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{contract.symbol}</p>
        </div>
        <button onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: 18, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 'var(--fs-xs)', marginBottom: 12 }}>
        <span style={{ color: 'var(--text-muted)' }}>Ask: <span style={{ color: 'var(--text)' }}>${contract.ask?.toFixed(2)}</span></span>
        <span style={{ color: 'var(--text-muted)' }}>OI: <span style={{ color: 'var(--text)' }}>{contract.open_interest?.toLocaleString()}</span></span>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <p style={{ color: 'var(--text-subtle)', fontSize: 'var(--fs-xs)', marginBottom: 8 }}>🤖 AI Explanation</p>
        {loading
          ? <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[0,1,2].map(i => <div key={i} style={{ height: 12, background: 'var(--surface-2)', borderRadius: 4, opacity: 0.6 }} />)}
            </div>
          : <div style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}><Markdown text={explanation} /></div>
        }
      </div>
      <p style={{ color: 'var(--text-subtle)', fontSize: 'var(--fs-xs)', marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        AI only — not investment advice.
      </p>
    </div>
  );
}
