import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HrNav } from './HrNav';
import { acknowledgePolicy, addPolicyAmendment } from '../../store/hrSlice';
import {
  BookOpen, CheckCircle2, ShieldCheck, Scale, FileText,
  AlertCircle, Download, Plus, X, Search, Check, FileCheck
} from 'lucide-react';

export const HrPoliciesPage = () => {
  const dispatch = useDispatch();
  const policies = useSelector((s) => s.hr.policies);

  const [filterCat, setFilterCat] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAmendModal, setShowAmendModal] = useState(false);
  const [amendForm, setAmendForm] = useState({
    title: '',
    category: 'AI Ethics & Operations',
    summary: '',
  });

  const categories = ['ALL', 'Intellectual Property', 'AI Ethics & Operations', 'Conduct & Governance', 'Benefits & Culture', 'Compliance & Safety'];

  const filtered = policies.filter((p) => {
    const matchCat = filterCat === 'ALL' || p.category === filterCat;
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAcknowledge = (id) => {
    dispatch(acknowledgePolicy(id));
  };

  const handleCreateAmendment = (e) => {
    e.preventDefault();
    if (!amendForm.title || !amendForm.summary) return;

    const newPol = {
      id: `POL-HR-00${policies.length + 1}`,
      code: `HR-AMEND-${Math.floor(100 + Math.random() * 900)}`,
      title: amendForm.title,
      category: amendForm.category,
      version: 'v1.0-DRAFT',
      effectiveDate: '2026-11-01',
      mandatory: true,
      acknowledgmentRate: '1.4% (1 / 71 Employees)',
      userAcknowledged: true,
      summary: amendForm.summary,
      clauses: [
        'Immediate supervisory review required upon trigger',
        'Model behavior telemetry logged to immutable ledger',
      ],
    };

    dispatch(addPolicyAmendment(newPol));
    setShowAmendModal(false);
    setAmendForm({ title: '', category: 'AI Ethics & Operations', summary: '' });
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      <HrNav />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <BookOpen size={20} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Company HR Policies & Ethical Governance
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Foundational employee policies for autonomous AI collaboration, model weight IP assignment, moonlighting restrictions, and high-trust sabbatical rules.
          </p>
        </div>

        <button
          onClick={() => setShowAmendModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 8,
            background: '#10b981',
            color: '#052e16',
            fontWeight: 700,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
          }}
        >
          <Plus size={16} />
          <span>Propose Policy Amendment</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Governance Policies Active</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>{policies.length} Policies</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>100% Statutory Compliance</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Company-Wide Acknowledgment</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>98.3%</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>70 of 71 full-time team signed</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>IP Sovereignty Status</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>100% Signed</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Zero unassigned model weights</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Safe AI Whistleblower Status</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#a78bfa', marginTop: 4 }}>Encrypted & Active</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Independent Board Committee Link</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '8px 14px', width: '340px' }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search HR policies and clauses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: filterCat === cat ? '#10b981' : 'var(--bg-elevated)',
                color: filterCat === cat ? '#052e16' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Policies List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map((policy) => {
          return (
            <div
              key={policy.id}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 10,
                padding: '22px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontFamily: 'monospace' }}>
                      {policy.code}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Version {policy.version} · Effective {policy.effectiveDate}
                    </span>
                    {policy.mandatory && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899' }}>
                        MANDATORY
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: '6px 0 0', color: 'var(--text-primary)' }}>
                    {policy.title}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Category: <strong>{policy.category}</strong> · Company Acknowledgment: <strong>{policy.acknowledgmentRate}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {policy.userAcknowledged ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#10b981',
                        fontSize: 12,
                        fontWeight: 700,
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Acknowledged & Signed</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(policy.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 14px',
                        borderRadius: 6,
                        background: '#10b981',
                        color: '#052e16',
                        fontSize: 12,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Check size={13} />
                      <span>Acknowledge Policy</span>
                    </button>
                  )}

                  <button
                    onClick={() => alert(`Policy ${policy.code} PDF downloaded.`)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '6px 11px',
                      borderRadius: 6,
                      background: 'var(--bg-surface)',
                      color: 'var(--text-secondary)',
                      fontSize: 12,
                      border: '1px solid var(--border-default)',
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={13} />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {policy.summary}
              </p>

              {/* Key Clauses */}
              {policy.clauses && (
                <div style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Key Enforceable Clauses:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 6 }}>
                    {policy.clauses.map((clause, cIdx) => (
                      <div key={cIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <ShieldCheck size={13} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{clause}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Propose Amendment Modal */}
      {showAmendModal && (
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
              maxWidth: 500,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} color="#10b981" />
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Propose Policy Amendment
                </h2>
              </div>
              <button
                onClick={() => setShowAmendModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAmendment}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Policy Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Algorithmic Red-Teaming & Responsible Disclosure Policy"
                  value={amendForm.title}
                  onChange={(e) => setAmendForm({ ...amendForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Governance Category</label>
                <select
                  value={amendForm.category}
                  onChange={(e) => setAmendForm({ ...amendForm, category: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                >
                  <option value="AI Ethics & Operations">AI Ethics & Operations</option>
                  <option value="Intellectual Property">Intellectual Property</option>
                  <option value="Conduct & Governance">Conduct & Governance</option>
                  <option value="Benefits & Culture">Benefits & Culture</option>
                  <option value="Compliance & Safety">Compliance & Safety</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Summary of Proposed Covenants</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the operational mandate, exception thresholds, and compliance sign-off requirements..."
                  value={amendForm.summary}
                  onChange={(e) => setAmendForm({ ...amendForm, summary: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAmendModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontSize: 12.5 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: 6, background: '#10b981', color: '#052e16', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 12.5 }}
                >
                  Submit for Board Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrPoliciesPage;
