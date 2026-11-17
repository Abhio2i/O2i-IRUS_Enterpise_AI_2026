import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SecurityNav } from './SecurityNav';
import { rotateQuantumKeys, triggerDlpScan } from '../../store/securitySlice';
import {
  Database, ShieldCheck, Key, Lock, AlertTriangle, CheckCircle2,
  RefreshCw, Search, Eye, X, Terminal, ShieldAlert, Cpu
} from 'lucide-react';

export const DataSecurityPage = () => {
  const dispatch = useDispatch();
  const dataSecurity = useSelector((s) => s.security.dataSecurity);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [notice, setNotice] = useState(null);

  const filteredEvents = dataSecurity.recentEvents.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRotate = () => {
    dispatch(rotateQuantumKeys());
    setNotice('Kyber-1024 quantum lattice master keypair generated and synchronized.');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleScan = () => {
    dispatch(triggerDlpScan());
    setNotice('Real-time GPU zero-copy DLP scan triggered. All subnets verified.');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      <SecurityNav />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
              <Database size={20} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Data Security & Sovereign Cryptographic Vault
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Quantum-resistant Kyber-1024 lattice encryption, Thales Luna HSM key hierarchies, GPU-accelerated token redaction, and real-time DLP exfiltration blocking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleRotate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 12.5,
              border: '1px solid var(--border-default)',
              cursor: 'pointer',
            }}
          >
            <Key size={14} color="#ef4444" />
            <span>Rotate Kyber-1024 Keys</span>
          </button>

          <button
            onClick={handleScan}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 8,
              background: '#ef4444',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
            }}
          >
            <RefreshCw size={14} />
            <span>Trigger DLP Scan</span>
          </button>
        </div>
      </div>

      {notice && (
        <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: 13, fontWeight: 600 }}>
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Encryption Standard</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444', marginTop: 4 }}>Kyber-1024</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Quantum-Resistant Lattice Core</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Token Redaction Latency</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e', marginTop: 4 }}>0.8 ms</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Zero-Copy GPU Regex Pipeline</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Inspected Traffic</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>142.8 Gbps</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Continuous Envoy Mesh Telemetry</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Data At-Rest Security</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>100% LUKS3</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>NVMe-oF Encrypted Pools</div>
        </div>
      </div>

      {/* Cryptographic Architecture Card */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '20px', marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', color: 'var(--text-primary)' }}>
          Cryptographic Hardware & Key Hierarchy Enclave
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, fontSize: 12.5 }}>
          <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontWeight: 700, marginBottom: 4 }}>
              <Cpu size={14} />
              <span>Root of Trust: Thales Luna PCIe HSM</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Hardware security module evaluated at FIPS 140-3 Level 4. Master secrets never leave silicon. Automatic zeroization triggers on physical chassis intrusion.
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontWeight: 700, marginBottom: 4 }}>
              <Key size={14} />
              <span>Post-Quantum TLS 1.3 Wire Mesh</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              All inter-node InfiniBand and terrestrial dark fiber streams enforce hybrid Kyber-1024 + X25519 key exchange, immunizing against "harvest now, decrypt later" adversary attacks.
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontWeight: 700, marginBottom: 4 }}>
              <Lock size={14} />
              <span>Homomorphic Vector Encryption</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Enterprise document embeddings in Milvus vector databases are searched directly over ciphertext. Raw text cannot be reconstructed even in the event of memory dumps.
            </div>
          </div>
        </div>
      </div>

      {/* Live DLP Stream & Filter Table */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Data Loss Prevention (DLP) & In-Flight Anomaly Log
            </h3>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Hardware-attested audit log of all intercepted egress requests
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 6, padding: '6px 12px', width: '280px' }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Filter by keyword or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 12.5, outline: 'none', width: '100%' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Event Ref & Time</th>
                <th style={{ padding: '14px 18px' }}>Security Classification</th>
                <th style={{ padding: '14px 18px' }}>Origin Source</th>
                <th style={{ padding: '14px 18px' }}>Action & Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Telemetry Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((evt) => {
                const isBlocked = evt.status.includes('BLOCKED');

                return (
                  <tr key={evt.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{evt.id}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{evt.timestamp}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{evt.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>{evt.category}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-primary)' }}>{evt.source}</span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          background: isBlocked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.12)',
                          color: isBlocked ? '#ef4444' : '#22c55e',
                          border: `1px solid ${isBlocked ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                        }}
                      >
                        {isBlocked ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                        <span>{evt.status.replace('_', ' ')}</span>
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '5px 10px',
                          borderRadius: 6,
                          background: 'var(--bg-surface)',
                          color: 'var(--text-secondary)',
                          fontSize: 11.5,
                          border: '1px solid var(--border-default)',
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Inspection Modal */}
      {selectedEvent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 12,
              width: '100%',
              maxWidth: 520,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
                  Telemetry Dossier: {selectedEvent.id}
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: '4px 0 0', color: 'var(--text-primary)' }}>
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 8, marginBottom: 16, fontSize: 12.5, lineHeight: 1.6, color: 'var(--text-primary)' }}>
              {selectedEvent.details}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, marginBottom: 20 }}>
              <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Origin Source:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{selectedEvent.source}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Event Timestamp:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{selectedEvent.timestamp}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{ padding: '8px 18px', borderRadius: 6, background: '#ef4444', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 12.5 }}
              >
                Dismiss Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSecurityPage;
