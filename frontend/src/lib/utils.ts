export const fmtMoney = (n: number, opts: { cents?: number; sign?: boolean } = {}): string => {
  const { cents = 2, sign = false } = opts;
  const v = Math.abs(n);
  const prefix = n < 0 ? '-$' : sign && n > 0 ? '+$' : '$';
  return prefix + v.toLocaleString('en-US', { minimumFractionDigits: cents, maximumFractionDigits: cents });
};

export const fmtPct = (n: number, cents = 2): string =>
  (n > 0 ? '+' : '') + n.toFixed(cents) + '%';

export const fmtNum = (n: number, cents = 2): string =>
  n.toLocaleString('en-US', { minimumFractionDigits: cents, maximumFractionDigits: cents });

export const fmtCompact = (n: number): string => {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (a >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return n.toFixed(0);
};

export const cls = (...a: (string | false | null | undefined)[]): string =>
  a.filter(Boolean).join(' ');

export function seedRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function genSeries(n: number, start: number, end: number, vol: number, seed = 42): number[] {
  const r = seedRand(seed);
  const drift = (end - start) / (n - 1);
  const out = [start];
  for (let i = 1; i < n; i++) {
    const prev = out[i - 1];
    out.push(prev + drift + (r() - 0.5) * vol * start);
  }
  out[n - 1] = end;
  return out;
}
