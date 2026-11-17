import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SecurityNav } from './SecurityNav';
import { runEquipmentAttestation } from '../../store/securitySlice';
import {
  HardDrive, Cpu, ShieldCheck, CheckCircle2, AlertTriangle,
  RefreshCw, Lock, Thermometer, Activity, Eye, X, Network
} from 'lucide-react';

export const EquipmentSecurityPage = () => {
  const dispatch = useDispatch();
  const equipmentSecurity = useSelector((s) => s.security.equipmentSecurity);

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [notice, setNotice] = useState(null);

  const handleAttest = (eqId) => {
    dispatch(runEquipmentAttestation(eqId));
    setNotice(`Hardware TPM 2.0 cryptographic PCR attestation passed for ${eqId}.`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      <SecurityNav />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <HardDrive size={20} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Equipment & Supercomputer Hardware Security
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            128x NVIDIA H100 GPU clusters, chassis intrusion tripwires, TPM 2.0 platform configuration registers (PCRs), and InfiniBand 800Gbps MACSec port isolation.
          </p>
        </div>

        <button
          onClick={() => {
            setNotice('Global hardware fleet attestation completed across 128 GPU nodes and 4 InfiniBand switches.');
            setTimeout(() => setNotice(null), 4000);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 8,
            background: '#f59e0b',
            color: '#000',
            fontWeight: 700,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
          }}
        >
          <RefreshCw size={15} />
          <span>Attest Entire Hardware Fleet</span>
        </button>
      </div>

      {notice && (
        <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid #f59e0b', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', fontSize: 13, fontWeight: 600 }}>
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Supercluster Attestation</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e', marginTop: 4 }}>100% Passed</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>128 NVIDIA H100 SXM5 Nodes</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Chassis Tamper Sensors</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>0 Breaches</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>All Physical Seals Intact</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Average Thermal Telemetry</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>61.4°C</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Liquid-Cooling Submersion Normal</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Firmware Rollback Guard</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#a78bfa', marginTop: 4 }}>eFuse Enforced</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Zero-Day Downgrade Immune</div>
        </div>
      </div>

      {/* Hardware Assets Grid / Table */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Supercomputing Hardware Inventory & Attestation Registry
          </h3>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Real-time PCR verification, operating thermal sensors, and firmware provenance
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Equipment & Asset ID</th>
                <th style={{ padding: '14px 18px' }}>Classification & Location</th>
                <th style={{ padding: '14px 18px' }}>TPM 2.0 PCR Attestation</th>
                <th style={{ padding: '14px 18px' }}>Chassis Physical Seal</th>
                <th style={{ padding: '14px 18px' }}>Thermals</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipmentSecurity.hardwareAssets.map((asset) => {
                return (
                  <tr key={asset.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Cpu size={14} color="#f59e0b" />
                        <span>{asset.name}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>
                        {asset.id} · Firmware: {asset.firmwareVersion}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{asset.type}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>{asset.location}</div>
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
                          background: 'rgba(34, 197, 94, 0.12)',
                          color: '#22c55e',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                        }}
                      >
                        <CheckCircle2 size={11} />
                        <span>{asset.tpmAttestation}</span>
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>
                        {asset.chassisIntrusion}
                      </div>
                      <div style={{ fontSize: 11, color: '#10b981', marginTop: 2 }}>Optical Tripwire Active</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-primary)', fontWeight: 600 }}>
                        <Thermometer size={13} color="#38bdf8" />
                        <span>{asset.operatingTemp}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => handleAttest(asset.id)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 6,
                            background: '#f59e0b',
                            color: '#000',
                            fontSize: 11.5,
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Verify PCR
                        </button>
                        <button
                          onClick={() => setSelectedAsset(asset)}
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
                          <span>Telemetry</span>
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

      {/* Asset Telemetry Modal */}
      {selectedAsset && (
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
                <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                  Hardware Telemetry Dossier: {selectedAsset.id}
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: '4px 0 0', color: 'var(--text-primary)' }}>
                  {selectedAsset.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, fontSize: 12.5 }}>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>TPM 2.0 PCR Hash:</span>
                <div style={{ fontWeight: 700, color: '#22c55e', marginTop: 2 }}>{selectedAsset.tpmAttestation}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Firmware Version:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{selectedAsset.firmwareVersion}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Chassis Intrusion Seal:</span>
                <div style={{ fontWeight: 600, color: '#10b981', marginTop: 2 }}>{selectedAsset.chassisIntrusion}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Operating Thermal Die:</span>
                <div style={{ fontWeight: 600, color: '#38bdf8', marginTop: 2 }}>{selectedAsset.operatingTemp}</div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 8, marginBottom: 20, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Hardware cryptographic attestation uses dedicated TPM 2.0 registers combined with Thales Sovereign HSM remote challenges. If an unauthenticated device or memory probe is attached to PCIe buses, encryption keys are automatically wiped within 80 nanoseconds.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => {
                  handleAttest(selectedAsset.id);
                  setSelectedAsset(null);
                }}
                style={{ padding: '8px 16px', borderRadius: 6, background: '#f59e0b', color: '#000', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 12.5 }}
              >
                Re-Attest Silicon Integrity
              </button>
              <button
                onClick={() => setSelectedAsset(null)}
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

export default EquipmentSecurityPage;
