interface Props {
  shares: number;
  entryPrice: number;
  currentPrice: number;
  strike: number;
  premium: number;
  contracts: number;
}

export default function PayoffChart({ shares, entryPrice, currentPrice, strike, premium, contracts }: Props) {
  const minPrice = Math.max(0.01, currentPrice * 0.6);
  const maxPrice = currentPrice * 1.2;
  const steps = 60;
  const dx = (maxPrice - minPrice) / steps;

  const stockPnL    = (p: number) => (p - entryPrice) * shares;
  const putPnL      = (p: number) => Math.max(0, strike - p) * 100 * contracts - premium * 100 * contracts;
  const combinedPnL = (p: number) => stockPnL(p) + putPnL(p);

  const points: { x: number; stock: number; combined: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = minPrice + dx * i;
    points.push({ x, stock: stockPnL(x), combined: combinedPnL(x) });
  }

  const maxAbs = Math.max(...points.flatMap(p => [Math.abs(p.stock), Math.abs(p.combined)]));
  const W = 600, H = 240, padL = 50, padR = 15, padT = 15, padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xScale = (x: number) => padL + ((x - minPrice) / (maxPrice - minPrice)) * plotW;
  const yScale = (y: number) => padT + plotH / 2 - (y / maxAbs) * (plotH / 2);

  const toPath = (getter: (p: typeof points[0]) => number) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x).toFixed(1)} ${yScale(getter(p)).toFixed(1)}`).join(' ');

  const stockPath    = toPath(p => p.stock);
  const combinedPath = toPath(p => p.combined);
  const zeroY     = yScale(0);
  const currentX  = xScale(currentPrice);
  const strikeX   = xScale(strike);
  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
        <line x1={padL} y1={zeroY} x2={W - padR} y2={zeroY} stroke="var(--border)" strokeDasharray="2,2" />
        <line x1={currentX} y1={padT} x2={currentX} y2={H - padB} stroke="var(--border-strong)" strokeDasharray="3,3" />
        <text x={currentX + 3} y={padT + 10} fill="var(--text-muted)" fontSize="10">Now ${currentPrice.toFixed(2)}</text>
        <line x1={strikeX} y1={padT} x2={strikeX} y2={H - padB} stroke="var(--accent)" strokeDasharray="4,2" opacity="0.4" />
        <text x={strikeX + 3} y={H - padB - 5} fill="var(--accent)" fontSize="10">Strike ${strike}</text>
        <path d={stockPath} fill="none" stroke="var(--neg)" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6" />
        <path d={combinedPath} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        <text x={5} y={padT + 12} fill="var(--text-muted)" fontSize="10">{fmt(maxAbs)}</text>
        <text x={5} y={zeroY + 3} fill="var(--text-muted)" fontSize="10">$0</text>
        <text x={5} y={H - padB - 3} fill="var(--text-muted)" fontSize="10">{fmt(-maxAbs)}</text>
        <text x={padL} y={H - 10} fill="var(--text-muted)" fontSize="10">${minPrice.toFixed(2)}</text>
        <text x={W - padR - 35} y={H - 10} fill="var(--text-muted)" fontSize="10">${maxPrice.toFixed(2)}</text>
      </svg>
      <div style={{ display: 'flex', gap: 16, fontSize: 'var(--fs-xs)', marginTop: 4, paddingLeft: 48 }}>
        <span style={{ color: 'var(--accent)' }}>━ With hedge</span>
        <span style={{ color: 'var(--neg)' }}>┄ Unhedged</span>
      </div>
    </div>
  );
}
