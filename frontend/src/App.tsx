import { useEffect, useState } from 'react';
import * as fcl from '@onflow/fcl';
import './styles.css';

interface DispatchItem {
  service: String;
  latencyMs: number;
  processedAt: string;
}

type View = 'overview' | 'console';

fcl.config({
  'accessNode.api': 'http://localhost:8888',
});

function Navigation({ view, setView }: { view: View; setView: (view: View) => void }) {
  return (
    <nav className="topbar">
      <button className="brand" onClick={() => setView('overview')} aria-label="Open Melikta overview">
        <span className="brand-mark">M</span>
        <span>MELIKTA<span className="brand-dot">_</span></span>
      </button>
      <div className="nav-tabs" role="tablist" aria-label="Main navigation">
        <button className={view === 'overview' ? 'nav-tab active' : 'nav-tab'} onClick={() => setView('overview')} role="tab" aria-selected={view === 'overview'}>Overview</button>
        <button className={view === 'console' ? 'nav-tab active' : 'nav-tab'} onClick={() => setView('console')} role="tab" aria-selected={view === 'console'}>Live Console <span className="status-dot" /></button>
      </div>
      <span className="network-chip">FLOW / EMULATOR</span>
    </nav>
  );
}

function Overview({ openConsole }: { openConsole: () => void }) {
  return (
    <main className="landing">
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow"><span className="signal-bars">▮▮▮</span> INFRASTRUCTURE BEACON / 001</p>
          <h1>Signals in.<br /><em>Settlement out.</em></h1>
          <p className="hero-text">Melikta turns a rush of telemetry and user intents into one calm, serialized stream on Flow.</p>
          <div className="hero-actions"><button className="pixel-button primary" onClick={openConsole}>Open live console <span>↗</span></button><a className="text-link" href="https://developers.flow.com/" target="_blank" rel="noreferrer">Built on Flow <span>↗</span></a></div>
        </div>
        <div className="hero-art" aria-label="Animated visualization of queued signals" role="img">
          <div className="sun-disc" /><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="satellite">◆</div>
          <div className="signal-card card-one"><span>01</span> TELEMETRY</div><div className="signal-card card-two"><span>02</span> INTENT</div><div className="signal-card card-three"><span>03</span> SEALED</div>
          <div className="hero-art-label">QUEUE<br /><strong>01</strong> / 01</div>
        </div>
      </section>
      <section className="ticker" aria-label="System status"><span>QUEUE ONLINE</span><span>◆</span><span>NONCE COLLISIONS: 0</span><span>◆</span><span>FLOW SETTLEMENT LAYER</span><span>◆</span><span>QUEUE ONLINE</span></section>
      <section className="story-section">
        <div className="section-intro"><p className="eyebrow">WHY MELIKTA</p><h2>One lane.<br /><em>No collisions.</em></h2></div>
        <div className="feature-list">
          <article className="feature-row"><span className="feature-number">01</span><div><h3>Capture everything</h3><p>High-frequency events arrive fast. Melikta accepts the burst and keeps the edge of your system responsive.</p></div><span className="feature-icon">◈</span></article>
          <article className="feature-row"><span className="feature-number">02</span><div><h3>Serialize the signal</h3><p>A BullMQ worker processes one transaction at a time, protecting the signing account from sequence conflicts.</p></div><span className="feature-icon">≋</span></article>
          <article className="feature-row"><span className="feature-number">03</span><div><h3>Verify on-chain</h3><p>Every dispatch lands as an inspectable record on Flow. The console reflects the network state in real time.</p></div><span className="feature-icon">✦</span></article>
        </div>
      </section>
      <section className="pipeline-section"><div className="pipeline-heading"><p className="eyebrow">THE RELAY LOOP</p><h2>From noise<br />to <em>proof.</em></h2></div><div className="pipeline-visual"><div className="pipeline-node"><span className="node-glyph">⌁</span><small>INPUT</small><strong>Telemetry</strong></div><span className="pipeline-line"><i /></span><div className="pipeline-node hot"><span className="node-glyph">▦</span><small>QUEUE</small><strong>Redis / BullMQ</strong></div><span className="pipeline-line"><i /></span><div className="pipeline-node"><span className="node-glyph">◈</span><small>SETTLE</small><strong>Flow ledger</strong></div></div></section>
      <footer className="landing-footer"><span>MELIKTA / ASYNC BY DESIGN</span><span>LOCAL SIGNAL 2026</span></footer>
    </main>
  );
}

function ConsoleView() {
  const [dispatches, setDispatches] = useState<Record<string, DispatchItem>>({});
  const [loading, setLoading] = useState(false);
  const fetchRecords = async () => {
    setLoading(true);
    const cadenceScript = `
      import Melikta from 0xf8d6e0586b0a20c7
      access(all) fun main(): {String: Melikta.DispatchRecord} {
        return Melikta.getAllDispatches()
      }
    `;
    try { const response = await fcl.query<Record<string, DispatchItem>>({ cadence: cadenceScript }); setDispatches(response || {}); } catch (err) { console.error('Failed to query Cadence script:', err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchRecords(); const interval = setInterval(fetchRecords, 3000); return () => clearInterval(interval); }, []);
  return <main className="console-page"><header className="console-heading"><div><p className="eyebrow">LIVE NETWORK VIEW / 002</p><h1>Dispatch <em>console</em></h1></div><button className="pixel-button primary" onClick={fetchRecords} disabled={loading}>{loading ? 'Refreshing...' : '↻ Query state'}</button></header><div className="console-status"><span className="status-dot" /> Polling emulator / testnet via gasless FCL scripts <span className="status-meta">AUTO REFRESH 3S</span></div><section className="dispatch-section"><div className="dispatch-title"><h2>Attested block dispatches</h2><span>{Object.keys(dispatches).length.toString().padStart(2, '0')} RECORDS</span></div>{Object.keys(dispatches).length === 0 ? <div className="empty-state">No dispatches indexed on-chain yet.<br /><small>Ensure the worker and emulator are running.</small></div> : <div className="dispatch-list">{Object.entries(dispatches).map(([id, item]) => <article className="dispatch-card" key={id}><div><strong>{id}</strong><span>Service: {item.service}</span></div><div className="dispatch-metric"><strong>{item.latencyMs} ms</strong><span>Block epoch: {parseFloat(item.processedAt).toFixed(2)}</span></div></article>)}</div>}</section></main>;
}

export default function App() {
  const [view, setView] = useState<View>('overview');
  return <div className="app-shell"><Navigation view={view} setView={setView} />{view === 'overview' ? <Overview openConsole={() => setView('console')} /> : <ConsoleView />}</div>;
}
