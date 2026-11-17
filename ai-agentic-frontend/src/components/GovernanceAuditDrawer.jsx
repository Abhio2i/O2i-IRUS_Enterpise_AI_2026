import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleAuditDrawer } from '../store/navigationSlice';
import { X, ShieldCheck, DollarSign, Activity, FileCode, CheckCircle, AlertTriangle } from 'lucide-react';

export const GovernanceAuditDrawer = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.navigation.showAuditDrawer);
  const auditLogs = useSelector((state) => state.governance.auditLogs);
  const { monthlyBudget, monthlySpent, totalTokensUsed, activeRiskTierBreakdown } = useSelector(
    (state) => state.governance
  );

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={() => dispatch(toggleAuditDrawer())}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="card-header" style={{ padding: '20px 24px', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={20} />
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                Governance & Responsible AI
              </h2>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                ISO/IEC 42001 & NIST AI RMF Compliant
              </div>
            </div>
          </div>
          <button
            className="btn btn-outline btn-sm"
            style={{ border: 'none', padding: '6px' }}
            onClick={() => dispatch(toggleAuditDrawer())}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Cost & Budget Card (GOV-5) */}
          <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Model Budget & Token Tracker (GOV-5)
              </span>
              <span className="pill-badge mono" style={{ fontSize: '10px' }}>MONTHLY CAP: ${monthlyBudget}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                ${monthlySpent.toFixed(2)}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {((monthlySpent / monthlyBudget) * 100).toFixed(1)}% consumed
              </span>
            </div>

            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-muted)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div
                style={{
                  width: `${(monthlySpent / monthlyBudget) * 100}%`,
                  height: '100%',
                  backgroundColor: 'var(--accent-dot)',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              <span>Total Tokens: <strong style={{ color: 'var(--text-primary)' }} className="mono">{totalTokensUsed}</strong></span>
              <span>Model Routing: <strong style={{ color: 'var(--text-primary)' }}>Spring AI Abstraction</strong></span>
            </div>
          </div>

          {/* Risk Tiers Overview (GOV-4) */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <div style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--bg-card)', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>High Risk</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#ef4444' }} className="mono">{activeRiskTierBreakdown.high}</div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Human Review Req.</div>
            </div>
            <div style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--bg-card)', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Medium Risk</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#eab308' }} className="mono">{activeRiskTierBreakdown.medium}</div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Rule Validated</div>
            </div>
            <div style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--bg-card)', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Low Risk</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#22c55e' }} className="mono">{activeRiskTierBreakdown.low}</div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Auto-Settled</div>
            </div>
          </div>

          {/* Audit Logs Stream (GOV-2) */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Live Immutable Audit Stream (GOV-2)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-card)',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="mono" style={{ fontWeight: 600, fontSize: '11px' }}>
                      {log.id}
                    </span>
                    <span
                      className={`pill-badge ${
                        log.riskTier === 'HIGH' ? 'high' : log.riskTier === 'MEDIUM' ? 'medium' : 'low'
                      }`}
                      style={{ fontSize: '9.5px', padding: '1px 6px' }}
                    >
                      {log.riskTier} RISK
                    </span>
                  </div>

                  <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>
                    {log.action}
                  </div>

                  <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                    {log.details}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '10.5px',
                      color: 'var(--text-muted)',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '6px',
                    }}
                  >
                    <span className="mono">{log.endpoint}</span>
                    <span className="mono">{log.tokens > 0 ? `${log.tokens} tkns` : 'Deterministic'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Enterprise Zero-Training Agreement Active
          </span>
          <button className="btn btn-outline btn-sm" onClick={() => dispatch(toggleAuditDrawer())}>
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
