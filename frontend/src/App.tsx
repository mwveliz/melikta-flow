import { useEffect, useState } from 'react';
import * as fcl from '@onflow/fcl';

// Configure FCL: Local emulator REST endpoint or Testnet
fcl.config({
  'accessNode.api': 'http://localhost:8888',
});

interface DispatchItem {
  service: String;
  latencyMs: number;
  processedAt: string;
}

export default function App() {
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

    try {
      const response = await fcl.query({ cadence: cadenceScript });
      setDispatches(response || {});
    } catch (err) {
      console.error('Failed to query Cadence script:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    const interval = setInterval(fetchRecords, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ maxWidth: 860, margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: 20 }}>
        <h1 style={{ color: '#38bdf8', marginBottom: 4 }}>⚡ Melikta </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Asynchronous Transaction Queue & On-Chain Infrastructure Beacon on Flow
        </p>
      </header>

      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
        <span style={{ fontSize: 14, color: '#64748b' }}>
          Status: Polling Emulator / Testnet via Gasless FCL Scripts
        </span>
        <button
          onClick={fetchRecords}
          disabled={loading}
          style={{
            background: '#0284c7',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? 'Refreshing...' : 'Query State'}
        </button>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3 style={{ color: '#e2e8f0' }}>Attested Block Dispatches</h3>
        {Object.keys(dispatches).length === 0 ? (
          <div style={{ background: '#1e293b', padding: 24, borderRadius: 8, color: '#94a3b8' }}>
            No dispatches indexed on-chain yet. Ensure worker and emulator are running.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {Object.entries(dispatches).map(([id, item]) => (
              <div
                key={id}
                style={{
                  background: '#1e293b',
                  padding: '14px 18px',
                  borderRadius: 8,
                  borderLeft: '4px solid #10b981',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', color: '#f1f5f9' }}>{id}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>Service: {item.service}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#38bdf8', fontWeight: 600 }}>{item.latencyMs} ms</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Block Epoch: {parseFloat(item.processedAt).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}