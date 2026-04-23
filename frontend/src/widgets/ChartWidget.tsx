import { useState, useEffect } from 'react';
import PriceChart from '../components/PriceChart';
import { bus, EVENTS } from '../lib/event-bus';

export default function ChartWidget() {
  const [symbol, setSymbol] = useState('AAL');

  useEffect(() => bus.on<string>(EVENTS.SYMBOL_SELECTED, s => setSymbol(s)), []);

  return (
    <div style={{ padding: 12, height: '100%', overflow: 'auto' }}>
      <PriceChart symbol={symbol} days={90} />
    </div>
  );
}
