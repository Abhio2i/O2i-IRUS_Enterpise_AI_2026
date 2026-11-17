import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addPolicy, updatePolicyApproval } from '../../store/strategySlice';
import {
  Scale, ShieldCheck, CheckCircle2, AlertCircle, Clock, FileText,
  User, Check, X, Download, Eye, Plus, Filter, Tag, BookOpen
} from 'lucide-react';
import { StrategyNav } from './StrategyNav';

const APPROVAL_CONFIG = {
  BOARD_APPROVED: { label: 'BOARD APPROVED', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)' },
  UNDER_REVIEW: { label: 'UNDER ANNUAL REVIEW', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' },
  DRAFT: { label: 'DRAFT PROPOSAL', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)' },
};

export const PoliciesPage = () => {
  const dispatch = useDispatch();
  const policies = useSelector((s) => s.strategy.policies || []);

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewingPolicy, setViewingPolicy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Policy Form
  const [newPolicy, setNewPolicy] = useState({
    code: 'GOV-2027',
    title: '',
    category: 'AI Ethics & Autonomy',
    version: 'v1.0',
    owner: 'Executive Committee',
    complianceStandard: 'ISO 42001 & EU AI Act',
    summary: '',
    clause1: 'Mandatory algorithmic transparency audit.',
    clause2: 'Strict cryptographic data residency within EEA.',
  });

  const categories = ['ALL', 'AI Ethics & Autonomy', 'Finance & Capital', 'Sustainability & ESG', 'Data Security & Sovereignty'];

  const filteredPolicies = selectedCategory === 'ALL'
    ? policies
    : policies.filter((p) => p.category === selectedCategory);

  const approvedCount = policies.filter((p) => p.approvalStatus === 'BOARD_APPROVED').length;

  const handleCreatePolicy = (e) => {
    e.preventDefault();
    if (!newPolicy.title) return;

    const created = {
      id: `POL-0${policies.length + 1}`,
      code: newPolicy.code.toUpperCase(),
      title: newPolicy.title,
      category: newPolicy.category,
      version: newPolicy.version,
      approvalStatus: 'BOARD_APPROVED',
      effectiveDate: new Date().toISOString().split('T')[0],
      lastReviewDate: new Date().toISOString().split('T')[0],
      owner: newPolicy.owner,
      complianceStandard: newPolicy.complianceStandard,
      summary: newPolicy.summary || 'Enterprise strategic policy governing operations.',
      enforcementRate: '100% Enforced',
      keyClauses: [
        `Clause 1.1: ${newPolicy.clause1}`,
        `Clause 2.1: ${newPolicy.clause2}`,
      ]
    };

    dispatch(addPolicy(created));
    setIsModalOpen(false);
    setNewPolicy({
      code: 'GOV-2027',
      title: '',
      category: 'AI Ethics & Autonomy',
      version: 'v1.0',
      owner: 'Executive Committee',
      complianceStandard: 'ISO 42001 & EU AI Act',
      summary: '',
      clause1: 'Mandatory algorithmic transparency audit.',
      clause2: 'Strict cryptographic data residency within EEA.',
    });
  };

  return (
    <div className="strategy-policies-page">
      {/* Leadership & Strategy Suite Sub-Nav */}
      <StrategyNav />

      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-title-block">
          <div className="page-tag">Leadership & Strategy · Governance & Charters [STRAT-POL]</div>
          <h2>Corporate Policies & Leadership Charters</h2>
          <p>Executive governance frameworks, AI autonomy limits, ESG mandates, capital allocation policies, and compliance standards.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', fontWeight: 600 }}
        >
          <Plus size={16} /> Draft New Policy
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid cols-4" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">Active Charters <Scale size={13} /></div>
          <div className="stat-value">{policies.length} Policies</div>
          <div className="stat-sub" style={{ color: 'var(--success)' }}>{approvedCount} Board Approved</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Enforcement Posture <ShieldCheck size={13} color="var(--success)" /></div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>100%</div>
          <div className="stat-sub">Cryptographically & legally audited</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Compliance Baseline <CheckCircle2 size={13} /></div>
          <div className="stat-value">EU AI Act & SOX</div>
          <div className="stat-sub">CSRD & ISO 42001 certified</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Audit Cycle <Clock size={13} /></div>
          <div className="stat-value">Annual</div>
          <div className="stat-sub">Next board review Q1 2027</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="card" style={{ padding: '12px 18px', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Filter Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedCategory(cat)}
              style={{ fontSize: 12 }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Policies Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 18 }}>
        {filteredPolicies.map((pol) => {
          const appCfg = APPROVAL_CONFIG[pol.approvalStatus] || APPROVAL_CONFIG.BOARD_APPROVED;

          return (
            <div
              key={pol.id}
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div>
                {/* Header: Code, Version, Approval Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {pol.code}
                    </span>
                    <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', fontWeight: 600 }}>
                      {pol.version}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 10,
                      color: appCfg.color,
                      background: appCfg.bg,
                      border: `1px solid ${appCfg.border}`,
                    }}
                  >
                    ● {appCfg.label}
                  </span>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                  {pol.category}
                </div>

                {/* Title */}
                <h3 style={{ fontSize: 16.5, fontWeight: 700, marginBottom: 8, lineHeight: 1.35 }}>
                  {pol.title}
                </h3>

                {/* Summary */}
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 14 }}>
                  {pol.summary}
                </p>

                {/* Key Clauses Snippet */}
                <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 8, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                    Enforced Clauses ({pol.keyClauses.length}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {pol.keyClauses.map((clause, idx) => (
                      <div key={idx} style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        • {clause}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meta details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 10 }}>
                  <div>Owner: <strong>{pol.owner}</strong></div>
                  <div>Standard: <strong>{pol.complianceStandard}</strong></div>
                  <div>Enforcement: <span style={{ color: 'var(--success)', fontWeight: 600 }}>{pol.enforcementRate}</span></div>
                  <div>Last Review: <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{pol.lastReviewDate}</span></div>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Effective: {pol.effectiveDate}</span>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setViewingPolicy(pol)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11 }}
                >
                  <Eye size={12} /> View Charter
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: View Full Charter */}
      {viewingPolicy && (
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
            padding: 16,
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 580, padding: 24, boxShadow: 'var(--shadow-modal)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                  {viewingPolicy.code} · {viewingPolicy.version} · {viewingPolicy.approvalStatus}
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{viewingPolicy.title}</h3>
              </div>
              <button className="btn btn-ghost" onClick={() => setViewingPolicy(null)} style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: 16, borderRadius: 8, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Executive Charter Statement:</div>
              {viewingPolicy.summary}
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                Mandatory Operational Clauses:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {viewingPolicy.keyClauses.map((clause, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '10px 12px', fontSize: 12.5, lineHeight: 1.45 }}>
                    {clause}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 18 }}>
              <div>Executive Sponsor: <strong>{viewingPolicy.owner}</strong></div>
              <div>Standard: <strong>{viewingPolicy.complianceStandard}</strong></div>
              <div>Effective Date: <strong>{viewingPolicy.effectiveDate}</strong></div>
              <div>Enforcement: <strong>{viewingPolicy.enforcementRate}</strong></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setViewingPolicy(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => alert(`Downloading formal charter PDF: ${viewingPolicy.title}`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Download size={14} /> Download Signed Charter PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Draft Policy */}
      {isModalOpen && (
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
            padding: 16,
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 540, padding: 24, boxShadow: 'var(--shadow-modal)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Draft Corporate Policy</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Publish a leadership charter or governance mandate.</p>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)} style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Policy Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPolicy.code}
                    onChange={(e) => setNewPolicy({ ...newPolicy, code: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Policy Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sovereign AI Data Integrity & Ethics Charter"
                    value={newPolicy.title}
                    onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Category
                  </label>
                  <select
                    value={newPolicy.category}
                    onChange={(e) => setNewPolicy({ ...newPolicy, category: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="AI Ethics & Autonomy">AI Ethics & Autonomy</option>
                    <option value="Finance & Capital">Finance & Capital</option>
                    <option value="Sustainability & ESG">Sustainability & ESG</option>
                    <option value="Data Security & Sovereignty">Data Security & Sovereignty</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Compliance Standard
                  </label>
                  <input
                    type="text"
                    value={newPolicy.complianceStandard}
                    onChange={(e) => setNewPolicy({ ...newPolicy, complianceStandard: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Executive Charter Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline the governance requirement and legal mandate..."
                  value={newPolicy.summary}
                  onChange={(e) => setNewPolicy({ ...newPolicy, summary: e.target.value })}
                  className="input"
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Mandatory Clause 1
                  </label>
                  <input
                    type="text"
                    value={newPolicy.clause1}
                    onChange={(e) => setNewPolicy({ ...newPolicy, clause1: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Mandatory Clause 2
                  </label>
                  <input
                    type="text"
                    value={newPolicy.clause2}
                    onChange={(e) => setNewPolicy({ ...newPolicy, clause2: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit for Board Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default PoliciesPage;
