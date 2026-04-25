/**
 * About HedgeIQ — origin story, mission, philosophy.
 * @component
 */
import LegalLayout from './LegalLayout';

export default function About() {
  return (
    <LegalLayout title="About HedgeIQ">
      <h2>Built from a real loss</h2>
      <p>
        HedgeIQ was born on a Sunday night, watching <strong>AAL</strong> tick down on weekend news and realizing — too late — that the position was unhedged. By Monday's open, the loss totaled <strong>$2,355</strong>. Not catastrophic. Not life-changing. But entirely preventable, if a protective put had been in place 12 hours earlier.
      </p>
      <p>
        That night made one thing clear: retail traders don't lack capital, and they don't lack discipline. What they lack is <em>time</em>. Time to scan an entire options chain. Time to compare 40 contracts on liquidity, premium, breakeven, and time-to-expiry. Time to translate Greeks into a number that means something at midnight when markets are closed and decisions still need to be made.
      </p>

      <h2>Our mission</h2>
      <p>
        <strong>Make institutional-grade hedging accessible to retail traders.</strong> Hedge funds have entire risk desks. We built the smallest, sharpest version of that desk and put it in your browser, free.
      </p>

      <h2>How HedgeIQ is different</h2>
      <ul>
        <li><strong>Designed for time pressure.</strong> Every screen assumes you have 30 seconds, not 30 minutes. The recommendation appears <em>before</em> the explanation.</li>
        <li><strong>Plain-English everything.</strong> If you can't read a Greek letter and act on it in 5 seconds, the Greek letter has failed you. We translate.</li>
        <li><strong>Built from a real loss.</strong> Not a market study. Not a thought experiment. The features exist because the absence of them cost real money.</li>
      </ul>

      <h2>Stack philosophy</h2>
      <p>
        HedgeIQ is built on best-in-class third parties so we can focus on UX and insight:
      </p>
      <ul>
        <li><strong>SnapTrade</strong> — broker connectivity (the same layer trusted by Wealthsimple, Public, Stake)</li>
        <li><strong>Polygon.io</strong> — market data (used by Robinhood, Webull, Interactive Brokers)</li>
        <li><strong>Anthropic Claude</strong> — AI explanations (used by Notion, Slack, DuckDuckGo)</li>
      </ul>
      <p>
        We don't reinvent broker auth or market data feeds. We reinvent the moment between "I see my position" and "I know what to do about it."
      </p>

      <h2>Open source</h2>
      <p>
        HedgeIQ is open source. Read the code, file an issue, or send a PR:{' '}
        <a href="https://github.com/JiNiomIndia/HedgeIQ" target="_blank" rel="noreferrer">github.com/JiNiomIndia/HedgeIQ</a>.
      </p>

      <h2>Status</h2>
      <p>
        HedgeIQ is currently <strong>v0.1</strong>. The free tier is permanent — 5 AI calls per day, full hedge analytics, no credit card. A Pro tier with unlimited AI calls and advanced features is on the roadmap.
      </p>

      <h2>Built by</h2>
      <p>
        Built by traders for traders. A small team — no Series A press release, no growth-hacked landing page testimonials. Just a tool that we wished existed the night AAL dropped, and that we hope helps you avoid the same loss.
      </p>
    </LegalLayout>
  );
}
