// Chart primitives — sparklines, area charts, candles, bar micros
// Built with pure SVG. Deterministic.

const Sparkline = ({ data, w = 80, h = 22, color, positive, strokeW = 1.25, fill = true, showDot = false }) => {
  if (!data || data.length < 2) return <svg width={w} height={h}/>;
  const min = Math.min(...data), max = Math.max(...data), span = (max - min) || 1;
  const stepX = w / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, h - ((v - min) / span) * (h - 2) - 1]);
  const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const areaPath = path + ` L ${w} ${h} L 0 ${h} Z`;
  const col = color || (positive === true ? 'var(--pos)' : positive === false ? 'var(--neg)' : 'var(--accent)');
  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      {fill && <path d={areaPath} fill={col} opacity="0.12"/>}
      <path d={path} fill="none" stroke={col} strokeWidth={strokeW} strokeLinejoin="round" strokeLinecap="round"/>
      {showDot && (
        <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.5" fill={col}/>
      )}
    </svg>
  );
};

// Area line chart with axes + grid
const AreaChart = ({ data, w, h, color, positive, showAxes = true, showGrid = true, yTicks = 4, xLabels = [], highlight = null, compareData = null, compareColor = 'var(--text-subtle)' }) => {
  if (!data || data.length < 2) return <svg width={w} height={h}/>;
  const padT = 10, padB = showAxes ? 20 : 4, padL = showAxes ? 42 : 4, padR = 4;
  const innerW = w - padL - padR, innerH = h - padT - padB;
  const allVals = compareData ? [...data, ...compareData] : data;
  const rawMin = Math.min(...allVals), rawMax = Math.max(...allVals);
  const pad = (rawMax - rawMin) * 0.08 || 1;
  const min = rawMin - pad, max = rawMax + pad, span = max - min;
  const x = (i, arr = data) => padL + (i / (arr.length - 1)) * innerW;
  const y = (v) => padT + innerH - ((v - min) / span) * innerH;
  const col = color || (positive ? 'var(--pos)' : positive === false ? 'var(--neg)' : 'var(--accent)');

  const mkPath = (d) => d.map((v, i) => (i === 0 ? 'M' : 'L') + x(i, d) + ' ' + y(v)).join(' ');
  const path = mkPath(data);
  const areaPath = path + ` L ${padL + innerW} ${padT + innerH} L ${padL} ${padT + innerH} Z`;

  const gridY = [];
  for (let i = 0; i <= yTicks; i++) {
    const gv = min + (span * i) / yTicks;
    gridY.push({ v: gv, y: y(gv) });
  }

  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      {showGrid && gridY.map((g, i) => (
        <line key={i} x1={padL} x2={padL + innerW} y1={g.y} y2={g.y} stroke="var(--grid)" strokeWidth="0.5"/>
      ))}
      {showAxes && gridY.map((g, i) => (
        <text key={'lbl'+i} x={padL - 6} y={g.y + 3} textAnchor="end" fontSize="9" fill="var(--text-subtle)" fontFamily="var(--font-mono)">
          {g.v >= 1000 ? fmtCompact(g.v) : g.v.toFixed(0)}
        </text>
      ))}
      {compareData && <path d={mkPath(compareData)} fill="none" stroke={compareColor} strokeWidth="1" strokeDasharray="2 2"/>}
      <path d={areaPath} fill={col} opacity="0.12"/>
      <path d={path} fill="none" stroke={col} strokeWidth="1.5" strokeLinejoin="round"/>
      {showAxes && xLabels.map((lbl, i) => {
        const idx = Math.floor(((data.length - 1) * i) / Math.max(1, xLabels.length - 1));
        return (
          <text key={'xl'+i} x={x(idx)} y={h - 4} textAnchor="middle" fontSize="9" fill="var(--text-subtle)" fontFamily="var(--font-mono)">{lbl}</text>
        );
      })}
      {highlight !== null && highlight >= 0 && (
        <>
          <line x1={x(highlight)} x2={x(highlight)} y1={padT} y2={padT + innerH} stroke="var(--text-muted)" strokeDasharray="2 2" strokeWidth="0.75"/>
          <circle cx={x(highlight)} cy={y(data[highlight])} r="3" fill={col} stroke="var(--surface)" strokeWidth="1.5"/>
        </>
      )}
    </svg>
  );
};

// Candlestick chart — for research
const CandleChart = ({ candles, w, h, volume = true }) => {
  if (!candles || !candles.length) return <svg width={w} height={h}/>;
  const padT = 8, padB = volume ? 40 : 20, padL = 44, padR = 8;
  const volH = volume ? 24 : 0;
  const innerW = w - padL - padR, innerH = h - padT - padB;
  const prices = candles.flatMap(c => [c.h, c.l]);
  const rawMin = Math.min(...prices), rawMax = Math.max(...prices);
  const pad = (rawMax - rawMin) * 0.06;
  const min = rawMin - pad, max = rawMax + pad, span = max - min || 1;
  const maxVol = Math.max(...candles.map(c => c.v));
  const bw = Math.max(2, (innerW / candles.length) - 2);
  const xC = (i) => padL + (innerW / candles.length) * i + (innerW / candles.length) / 2;
  const yP = (v) => padT + innerH - ((v - min) / span) * innerH;

  const ticks = 5;
  const gridY = Array.from({ length: ticks + 1 }, (_, i) => {
    const gv = min + (span * i) / ticks;
    return { v: gv, y: yP(gv) };
  });

  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {gridY.map((g, i) => (
        <g key={i}>
          <line x1={padL} x2={padL + innerW} y1={g.y} y2={g.y} stroke="var(--grid)" strokeWidth="0.5"/>
          <text x={padL - 6} y={g.y + 3} textAnchor="end" fontSize="9" fill="var(--text-subtle)" fontFamily="var(--font-mono)">
            {g.v.toFixed(g.v < 100 ? 2 : 0)}
          </text>
        </g>
      ))}
      {candles.map((c, i) => {
        const up = c.c >= c.o;
        const col = up ? 'var(--pos)' : 'var(--neg)';
        return (
          <g key={i}>
            <line x1={xC(i)} x2={xC(i)} y1={yP(c.h)} y2={yP(c.l)} stroke={col} strokeWidth="0.75"/>
            <rect x={xC(i) - bw/2} y={yP(Math.max(c.o, c.c))} width={bw} height={Math.max(1, Math.abs(yP(c.o) - yP(c.c)))} fill={col}/>
            {volume && (
              <rect x={xC(i) - bw/2} y={h - padB + 10 + (volH - (c.v / maxVol) * volH)} width={bw} height={(c.v / maxVol) * volH} fill={col} opacity="0.3"/>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// Donut chart for asset allocation
const Donut = ({ segments, size = 120, thickness = 18, center }) => {
  const r = size / 2 - thickness / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.v, 0);
  let offset = 0;
  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      <g transform={`translate(${size/2} ${size/2}) rotate(-90)`}>
        <circle r={r} fill="none" stroke="var(--surface-sunken)" strokeWidth={thickness}/>
        {segments.map((s, i) => {
          const len = (s.v / total) * circ;
          const el = (
            <circle key={i} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
              strokeDasharray={`${len} ${circ}`}
              strokeDashoffset={-offset}/>
          );
          offset += len;
          return el;
        })}
      </g>
      {center && (
        <g>
          <text x={size/2} y={size/2 - 2} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{center.label}</text>
          <text x={size/2} y={size/2 + 14} textAnchor="middle" fontSize="16" fill="var(--text)" fontWeight="600" fontFamily="var(--font-mono)">{center.value}</text>
        </g>
      )}
    </svg>
  );
};

// Horizontal bar — micro for 52-week range
const RangeBar = ({ low, high, current, w = 90, h = 14, compact = false }) => {
  const pct = ((current - low) / (high - low)) * 100;
  return (
    <div style={{ width: w, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ position: 'relative', height: 6, background: 'var(--surface-sunken)', borderRadius: 3 }}>
        <div style={{ position: 'absolute', left: `${Math.max(0, Math.min(100, pct))}%`, top: -2, width: 2, height: 10, background: 'var(--accent)', borderRadius: 1, transform: 'translateX(-1px)' }}/>
      </div>
      {!compact && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
          <span>{fmtNum(low)}</span><span>{fmtNum(high)}</span>
        </div>
      )}
    </div>
  );
};

// Stacked bar — for performance vs benchmark
const MiniBars = ({ data, w = 80, h = 22, positive }) => {
  if (!data || !data.length) return null;
  const max = Math.max(...data.map(Math.abs));
  const bw = Math.max(1, w / data.length - 1);
  return (
    <svg width={w} height={h}>
      {data.map((v, i) => {
        const bh = (Math.abs(v) / max) * (h - 2);
        const y = v >= 0 ? h/2 - bh : h/2;
        return (
          <rect key={i} x={i * (bw + 1)} y={y} width={bw} height={bh}
            fill={v >= 0 ? 'var(--pos)' : 'var(--neg)'} opacity="0.85"/>
        );
      })}
    </svg>
  );
};

// Generate OHLC candles
function genCandles(n, start, end, vol, seed = 7) {
  const r = seedRand(seed);
  const closes = genSeries(n, start, end, vol, seed);
  return closes.map((c, i) => {
    const prev = i === 0 ? start : closes[i - 1];
    const o = prev + (r() - 0.5) * vol * prev * 0.3;
    const hi = Math.max(o, c) + r() * vol * prev * 0.5;
    const lo = Math.min(o, c) - r() * vol * prev * 0.5;
    return { o, h: hi, l: lo, c, v: 0.3 + r() * 0.7 };
  });
}

Object.assign(window, { Sparkline, AreaChart, CandleChart, Donut, RangeBar, MiniBars, genCandles });
