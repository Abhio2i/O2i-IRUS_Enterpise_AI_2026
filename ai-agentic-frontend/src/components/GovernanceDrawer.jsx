import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleAuditDrawer } from '../store/navigationSlice';
import { X, ShieldCheck } from 'lucide-react';

export const GovernanceDrawer = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((s) => s.navigation.showAuditDrawer);
  const { auditLogs, monthlyBudget, monthlySpent, totalTokensUsed, activeRiskTierBreakdown } = useSelector((s) => s.governance);

  if (!isOpen) return null;

  const pct = ((monthlySpent / monthlyBudget) * 100).toFixed(1);

  return (
    <div className="drawer-overlay" onClick={() => dispatch(toggleAuditDrawer())}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={18} />
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Governance & Responsible AI</h2>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ISO/IEC 42001 · NIST AI RMF Compliant</div>
            </div>
          </div>
          <button className="icon-btn" onClick={() => dispatch(toggleAuditDrawer())}><X size={16} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
          {/* Budget Tracker GOV-5 */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>AI Model Budget (GOV-5)</span>
              <span className="badge">Cap: ${monthlyBudget.toLocaleString()}/mo</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: 24, fontWeight: 800 }}>${monthlySpent.toFixed(2)}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{pct}% consumed</span>
            </div>
            <div style={{ width: '100%', height: 5, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 3, transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11.5, color: 'var(--text-muted)' }}>
              <span>Total Tokens: <strong className="mono" style={{ color: 'var(--text-primary)' }}>{totalTokensUsed}</strong></span>
              <span>Routing: <strong style={{ color: 'var(--text-primary)' }}>Spring AI Abstraction</strong></span>
            </div>
          </div>

          {/* Risk Tier GOV-4 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'High Risk', count: activeRiskTierBreakdown.high, cls: 'danger', note: 'Human Review' },
              { label: 'Medium Risk', count: activeRiskTierBreakdown.medium, cls: 'warning', note: 'Rule Validated' },
              { label: 'Low Risk', count: activeRiskTierBreakdown.low, cls: 'success', note: 'Auto-Settled' },
            ].map((t) => (
              <div key={t.label} style={{ padding: '10px 12px', border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-elevated)', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{t.label}</div>
                <div className={`mono`} style={{ fontSize: 20, fontWeight: 800, color: `var(--${t.cls})` }}>{t.count}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{t.note}</div>
              </div>
            ))}
          </div>

          {/* Audit Stream GOV-2 */}
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 12 }}>
            Live Immutable Audit Stream (GOV-2)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {auditLogs.map((log) => (
              <div key={log.id} style={{ padding: '12px 14px', border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-elevated)', fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span className="mono" style={{ fontWeight: 700, fontSize: 11 }}>{log.id}</span>
                  <span className={`badge ${log.riskTier === 'HIGH' ? 'danger' : log.riskTier === 'MEDIUM' ? 'warning' : 'success'}`} style={{ fontSize: 9.5 }}>{log.riskTier} RISK</span>
                </div>
                <div style={{ fontWeight: 700, marginBottom: 3 }}>{log.action}</div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 8 }}>{log.details}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-muted)', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                  <span className="mono">{log.endpoint}</span>
                  <span className="mono">{log.tokens > 0 ? `${log.tokens} tkns` : 'Deterministic'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-default)', background: 'var(--bg-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Zero-Training Data Agreement: Active</span>
          <button className="btn btn-ghost btn-sm" onClick={() => dispatch(toggleAuditDrawer())}>Close</button>
        </div>
      </div>
    </div>
  );
};
