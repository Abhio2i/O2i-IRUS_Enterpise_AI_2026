import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SecurityNav } from './SecurityNav';
import { setActiveRoute } from '../../store/navigationSlice';
import { rotateQuantumKeys, triggerDlpScan } from '../../store/securitySlice';
import {
  Shield, Database, FileCode2, Users, HardDrive, Building2,
  CheckCircle2, AlertTriangle, Key, Zap, Lock, RefreshCw, ArrowRight, Activity, Globe
} from 'lucide-react';

export const SecurityOverviewPage = () => {
  const dispatch = useDispatch();
  const security = useSelector((s) => s.security);
  const { overview, dataSecurity, ipSecurity, personnelSafety, equipmentSecurity, infrastructureSecurity } = security;

  const [auditNotice, setAuditNotice] = useState(null);

  const handleRotateKeys = () => {
    dispatch(rotateQuantumKeys());
    setAuditNotice('Quantum session master keys rotated across all sovereign nodes using Kyber-1024 lattice cryptography.');
    setTimeout(() => setAuditNotice(null), 5000);
  };

  const handleDlpScan = () => {
    dispatch(triggerDlpScan());
    setAuditNotice('Zero-knowledge deep tensor DLP scan completed. Zero unencrypted model weights or secrets detected.');
    setTimeout(() => setAuditNotice(null), 5000);
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      <SecurityNav />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
              <Shield size={20} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Sovereign Defense & Security Command Center
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Unified command dashboard safeguarding sovereign AI data, proprietary model IP, personnel physical safety, supercomputer equipment, and underground bunker infrastructure.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleRotateKeys}
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
            <span>Rotate Quantum Keys</span>
          </button>

          <button
            onClick={handleDlpScan}
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
            <span>Run Zero-Knowledge DLP Audit</span>
          </button>
        </div>
      </div>

      {/* Alert banner if triggered */}
      {auditNotice && (
        <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: 13, fontWeight: 600 }}>
          <CheckCircle2 size={16} />
          <span>{auditNotice}</span>
        </div>
      )}

      {/* Top 5 Defense Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Threat Posture</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e', marginTop: 4 }}>{overview.threatLevel}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Anomaly Score: {overview.threatScore}</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Quantum Lattice Shield</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444', marginTop: 4 }}>Kyber-1024</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>FIPS 140-3 Level 4 HSM Cluster</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>DLP Neutralized (24h)</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>{overview.dlpBlocksToday} Blocked</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>0.8ms Token Redaction Latency</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Supercluster Hardware</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>128 / 128 Valid</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>TPM 2.0 PCR Attestation Passed</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Facilities & Bunkers</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#a78bfa', marginTop: 4 }}>3 Sovereign Sites</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Kiruna · Stockholm · Munich</div>
        </div>
      </div>

      {/* 5 Pillars Quick Navigation Matrix */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shield size={14} color="#ef4444" />
          <span>5 Pillars of Sovereign Defense Matrix</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* Pillar 1: Data Security */}
          <div
            onClick={() => dispatch(setActiveRoute('security.data'))}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 10,
              padding: '18px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 700, fontSize: 14 }}>
                <Database size={16} />
                <span>1. Data Security</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 7px', borderRadius: 4 }}>
                ENCRYPTED
              </span>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Kyber-1024 quantum session keys, 0.8ms PII token redaction, and NVMe-oF LUKS3 at-rest volume security.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: '#ef4444', fontWeight: 600 }}>
              <span>Inspect DLP & Cryptographic Traffic</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Pillar 2: IP Security */}
          <div
            onClick={() => dispatch(setActiveRoute('security.ip'))}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 10,
              padding: '18px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', fontWeight: 700, fontSize: 14 }}>
                <FileCode2 size={16} />
                <span>2. IP Security</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 7px', borderRadius: 4 }}>
                WATERMARKED
              </span>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Steganographic tensor watermarks on 8 foundational models, 4.2M public repositories scanned with zero leaks.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: '#38bdf8', fontWeight: 600 }}>
              <span>View Weights Sovereignty Ledger</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Pillar 3: Personnel Safety */}
          <div
            onClick={() => dispatch(setActiveRoute('security.personnel'))}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 10,
              padding: '18px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 700, fontSize: 14 }}>
                <Users size={16} />
                <span>3. Personnel Safety</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 7px', borderRadius: 4 }}>
                BIOMETRIC SECURE
              </span>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              71 verified biometric credentials, executive safe corridors, geofencing radars, and instant duress protocols.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: '#10b981', fontWeight: 600 }}>
              <span>Monitor Facility Badging & Travel</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Pillar 4: Equipment Security */}
          <div
            onClick={() => dispatch(setActiveRoute('security.equipment'))}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 10,
              padding: '18px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', fontWeight: 700, fontSize: 14 }}>
                <HardDrive size={16} />
                <span>4. Equipment Security</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 7px', borderRadius: 4 }}>
                TPM 2.0 VALID
              </span>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              128x NVIDIA H100 GPU clusters, chassis intrusion tripwires, InfiniBand 800Gbps MACSec port locking.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: '#f59e0b', fontWeight: 600 }}>
              <span>Review Supercluster Attestations</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Pillar 5: Infrastructure Security */}
          <div
            onClick={() => dispatch(setActiveRoute('security.infrastructure'))}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 10,
              padding: '18px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a78bfa', fontWeight: 700, fontSize: 14 }}>
                <Building2 size={16} />
                <span>5. Infrastructure</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', background: 'rgba(167, 139, 250, 0.1)', padding: '2px 7px', borderRadius: 4 }}>
                BUNKER SHIELDED
              </span>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Kiruna 120m underground bedrock vault, Faraday EMP shielding, 2.4 Tbps anti-DDoS scrubbing capacity.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: '#a78bfa', fontWeight: 600 }}>
              <span>Inspect Sovereign Data Centers</span>
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Security Incident & Telemetry Stream */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} color="#ef4444" />
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Real-Time Sovereign Defense & Cryptographic Audit Stream
            </h3>
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Continuous Telemetry Sync</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dataSecurity.recentEvents.map((evt) => {
            const isHigh = evt.severity === 'HIGH';
            const isSuccess = evt.status.includes('SUCCESS') || evt.status.includes('VERIFIED') || evt.status.includes('CLEARED');

            return (
              <div
                key={evt.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', fontFamily: 'monospace' }}>{evt.id}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{evt.timestamp} · {evt.category}</span>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: isHigh ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.12)',
                        color: isHigh ? '#ef4444' : '#38bdf8',
                      }}
                    >
                      {evt.severity}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13.5, marginTop: 4 }}>
                    {evt.title}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                    {evt.details}
                  </div>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    background: isSuccess ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: isSuccess ? '#22c55e' : '#ef4444',
                    border: `1px solid ${isSuccess ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}
                >
                  {isSuccess ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                  <span>{evt.status.replace('_', ' ')}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SecurityOverviewPage;
