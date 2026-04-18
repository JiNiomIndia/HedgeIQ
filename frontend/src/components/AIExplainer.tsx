/**
 * AIExplainer — plain English explanation of an option contract.
 * Calls POST /api/v1/ai/explain.
 * @component
 * @param contract - Option to explain
 * @param onClose - Callback to close panel
 */
import { useEffect, useState } from 'react';

interface Props {
  contract: { symbol: string; option_type: string; strike: number; expiry_date: string; ask: number; open_interest: number; };
  onClose: () => void;
}

import { API } from '../lib/api';
import { Markdown } from '../lib/markdown';

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
    <div className="rounded p-4 border border-gray-700" style={{backgroundColor:'#131929'}}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-sm" style={{color:'#00D4FF'}}>{contract.expiry_date} ${contract.strike} {contract.option_type}</p>
          <p className="text-gray-500 text-xs">{contract.symbol}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-red-400 text-lg leading-none">×</button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <span className="text-gray-500">Ask: <span style={{color:'#E8EAF0'}}>${contract.ask?.toFixed(2)}</span></span>
        <span className="text-gray-500">OI: <span style={{color:'#E8EAF0'}}>{contract.open_interest?.toLocaleString()}</span></span>
      </div>
      <div className="border-t border-gray-800 pt-3">
        <p className="text-gray-500 text-xs mb-2">🤖 AI Explanation</p>
        {loading ? <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="h-3 bg-gray-800 rounded animate-pulse" />)}</div>
          : <div className="text-gray-300 text-xs"><Markdown text={explanation} /></div>}
      </div>
      <p className="text-gray-600 text-xs mt-3 border-t border-gray-900 pt-2">AI only — not investment advice.</p>
    </div>
  );
}
