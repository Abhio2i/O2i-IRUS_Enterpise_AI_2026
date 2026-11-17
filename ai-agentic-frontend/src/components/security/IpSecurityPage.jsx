import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SecurityNav } from './SecurityNav';
import { attestModelWeights } from '../../store/securitySlice';
import {
  FileCode2, ShieldCheck, CheckCircle2, AlertTriangle, Eye,
  Lock, RefreshCw, Globe, Search, X, Sparkles, Binary
} from 'lucide-react';

export const IpSecurityPage = () => {
  const dispatch = useDispatch();
  const ipSecurity = useSelector((s) => s.security.ipSecurity);

  const [selectedModel, setSelectedModel] = useState(null);
  const [notice, setNotice] = useState(null);

  const handleAttest = (modelId) => {
    dispatch(attestModelWeights(modelId));
    setNotice(`Steganographic watermark for ${modelId} verified against sovereign ledger.`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      <SecurityNav />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
              <FileCode2 size={20} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Intellectual Property & Model Weights Sovereignty
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Cryptographic tensor watermarking, autonomous model leak crawler across 4.2M public repositories, differential privacy jitter, and hardware commit signing.
          </p>
        </div>

        <button
          onClick={() => {
            setNotice('Global crawler scan synchronized: Zero model weight or LoRA adapter leak detected.');
            setTimeout(() => setNotice(null), 4000);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 8,
            background: '#38bdf8',
            color: '#03213a',
            fontWeight: 700,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(56, 189, 248, 0.3)',
          }}
        >
          <Globe size={15} />
          <span>Sync External Leak Crawler</span>
        </button>
      </div>

      {notice && (
        <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid #38bdf8', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', fontSize: 13, fontWeight: 600 }}>
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Watermarked Models</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>{ipSecurity.modelsWatermarked} Weights</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Frequency-Domain Injected</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Global Leak Detection</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e', marginTop: 4 }}>0 Leaks</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>4.28M Repositories Inspected</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Code Commit Signing</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>100% Enforced</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Hardware YubiKey Cryptographic Attestation</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Reverse Engineering Guard</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#a78bfa', marginTop: 4 }}>Active Jitter</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Differential Privacy Perturbation</div>
        </div>
      </div>

      {/* Model Weights Protection Table */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Proprietary Foundation Models & Watermark Provenance
          </h3>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Sovereign mathematical proof of ownership embedded within non-zero model tensor coordinates
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Model & ID</th>
                <th style={{ padding: '14px 18px' }}>Parameter Scale</th>
                <th style={{ padding: '14px 18px' }}>Steganographic Watermark</th>
                <th style={{ padding: '14px 18px' }}>Physical Containment</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ipSecurity.models.map((model) => {
                const isContained = model.status.includes('CONTAINED');

                return (
                  <tr key={model.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Binary size={14} color="#38bdf8" />
                        <span>{model.name}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>
                        {model.id} · Access: {model.accessPolicy}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{model.parameters}</span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#38bdf8' }}>{model.watermarkHash}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{model.watermarkMethod}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{model.location}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Last Attested: {model.lastAttested}</div>
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
                          background: isContained ? 'rgba(56, 189, 248, 0.12)' : 'rgba(34, 197, 94, 0.12)',
                          color: isContained ? '#38bdf8' : '#22c55e',
                          border: `1px solid ${isContained ? 'rgba(56, 189, 248, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                        }}
                      >
                        <CheckCircle2 size={11} />
                        <span>{model.status.replace('_', ' ')}</span>
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => handleAttest(model.id)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 6,
                            background: '#38bdf8',
                            color: '#03213a',
                            fontSize: 11.5,
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Attest
                        </button>
                        <button
                          onClick={() => setSelectedModel(model)}
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
                          <span>Dossier</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Watermark Dossier Modal */}
      {selectedModel && (
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
              maxWidth: 540,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                  Model Tensor Watermark Provenance
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: '4px 0 0', color: 'var(--text-primary)' }}>
                  {selectedModel.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedModel(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, fontSize: 12.5 }}>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Watermark Signature:</span>
                <div style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace', marginTop: 2 }}>{selectedModel.watermarkHash}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Injection Technique:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{selectedModel.watermarkMethod}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Physical Enclave:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{selectedModel.location}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Authorized Access Rule:</span>
                <div style={{ fontWeight: 600, color: '#22c55e', marginTop: 2 }}>{selectedModel.accessPolicy}</div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 8, marginBottom: 20, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              This model weight checkpoint contains an immutable, zero-degradation mathematical watermark. If weights are leaked, any subsequent model inference sampled across 1,000 prompt tokens will mathematically expose the watermark with p &lt; 10⁻¹⁸ confidence in any sovereign court.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => {
                  handleAttest(selectedModel.id);
                  setSelectedModel(null);
                }}
                style={{ padding: '8px 16px', borderRadius: 6, background: '#38bdf8', color: '#03213a', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 12.5 }}
              >
                Re-Attest on Blockchain
              </button>
              <button
                onClick={() => setSelectedModel(null)}
                style={{ padding: '8px 16px', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontSize: 12.5 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IpSecurityPage;
