import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SecurityNav } from './SecurityNav';
import {
  Building2, ShieldCheck, Zap, Radio, Globe, CheckCircle2,
  AlertTriangle, RefreshCw, Layers, Lock, Flame, ShieldAlert
} from 'lucide-react';

export const InfrastructureSecurityPage = () => {
  const infrastructureSecurity = useSelector((s) => s.security.infrastructureSecurity);

  const [notice, setNotice] = useState(null);

  const handleTestFaraday = () => {
    setNotice('EMP Faraday isolation test simulation executed: Zero electromagnetic leakage detected across all 3 sovereign facilities.');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      <SecurityNav />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa' }}>
              <Building2 size={20} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Infrastructure Security & Sovereign Bunker Defense
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Underground granitic bedrock data vaults, dedicated hydroelectric power autonomy, Faraday EMP shielding, and 2.4 Tbps anti-DDoS scrubbing network.
          </p>
        </div>

        <button
          onClick={handleTestFaraday}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 8,
            background: '#a78bfa',
            color: '#1e113a',
            fontWeight: 700,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(167, 139, 250, 0.3)',
          }}
        >
          <Zap size={15} />
          <span>Test Faraday EMP Shielding</span>
        </button>
      </div>

      {notice && (
        <div style={{ background: 'rgba(167, 139, 250, 0.12)', border: '1px solid #a78bfa', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#a78bfa', fontSize: 13, fontWeight: 600 }}>
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Anti-DDoS Scrubbing Capacity</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#a78bfa', marginTop: 4 }}>{infrastructureSecurity.ddosScrubbingCapacity}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Global Anycast Edge Shield</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>BGP Route Hijack Defense</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e', marginTop: 4 }}>100% RPKI</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Cryptographically Validated Routes</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>EMP Hardening Standard</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>MIL-STD-188-125</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Faraday Copper Cage Protection</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Autonomous Power Autonomy</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>21 Days</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Hydroelectric Feeds + On-Site Fuel</div>
        </div>
      </div>

      {/* Sovereign Facilities Deep-Dive */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {infrastructureSecurity.facilities.map((fac) => {
          return (
            <div
              key={fac.id}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 10,
                padding: '22px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa', fontFamily: 'monospace' }}>
                      {fac.id}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Depth / Fortification: {fac.depth}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: '6px 0 0', color: 'var(--text-primary)' }}>
                    {fac.name}
                  </h3>
                  <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, marginTop: 2 }}>
                    Environmental Telemetry: {fac.airQualityTemp}
                  </div>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: 'rgba(34, 197, 94, 0.12)',
                    color: '#22c55e',
                    fontSize: 12,
                    fontWeight: 700,
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <CheckCircle2 size={13} />
                  <span>{fac.status}</span>
                </span>
              </div>

              {/* Specs Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, fontSize: 12.5 }}>
                <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontWeight: 700, marginBottom: 4 }}>
                    <Zap size={14} />
                    <span>Power Grid & Autonomy:</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>{fac.powerGrid}</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontWeight: 700, marginBottom: 4 }}>
                    <Globe size={14} />
                    <span>Network & Terrestrial Mesh:</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>{fac.connectivity}</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a78bfa', fontWeight: 700, marginBottom: 4 }}>
                    <Layers size={14} />
                    <span>EMP Shielding:</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>{fac.empProtection}</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontWeight: 700, marginBottom: 4 }}>
                    <Flame size={14} />
                    <span>Clean Fire Suppression:</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>{fac.fireSuppression}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InfrastructureSecurityPage;
