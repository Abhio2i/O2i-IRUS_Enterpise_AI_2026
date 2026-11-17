import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addOperationalRisk, resolveOperationalRisk, updateRiskMitigation } from '../../store/operationsSlice';
import {
  Activity, ShieldAlert, CheckCircle2, AlertTriangle, AlertOctagon, Clock,
  TrendingUp, TrendingDown, ArrowRight, Plus, RefreshCw, X, Check, Filter,
  Layers, MessageSquare, Zap
} from 'lucide-react';

const RAG_CONFIG = {
  GREEN: { label: 'GREEN / ON TRACK', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)' },
  AMBER: { label: 'AMBER / AT RISK', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' },
  RED: { label: 'RED / BLOCKED', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' },
};

export const StatusPage = () => {
  const dispatch = useDispatch();
  const projects = useSelector((s) => s.operations.projects || []);
  const risks = useSelector((s) => s.operations.operationalRisks || []);
  const forecast = useSelector((s) => s.operations.forecastData || {});

  const [activeTab, setActiveTab] = useState('ALL_RISKS'); // ALL_RISKS | ACTIVE | RESOLVED
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRiskId, setEditingRiskId] = useState(null);
  const [mitigationText, setMitigationText] = useState('');

  // New Risk Form
  const [newRisk, setNewRisk] = useState({
    title: '',
    projectId: projects[0]?.id || 'PRJ-301',
    severity: 'HIGH',
    category: 'Infrastructure',
    owner: 'Operations Lead',
    impact: '',
    mitigation: '',
    rag: 'AMBER'
  });

  const greenCount = projects.filter((p) => p.health === 'ON_TRACK').length;
  const amberCount = projects.filter((p) => p.health === 'AT_RISK').length;
  const redCount = projects.filter((p) => p.health === 'DELAYED').length;
  const total = projects.length || 1;

  const greenPct = Math.round((greenCount / total) * 100);
  const amberPct = Math.round((amberCount / total) * 100);
  const redPct = 100 - greenPct - amberPct;

  const activeRisks = risks.filter((r) => r.status !== 'RESOLVED');
  const filteredRisks = activeTab === 'ALL_RISKS'
    ? risks
    : activeTab === 'ACTIVE'
    ? risks.filter((r) => r.status !== 'RESOLVED')
    : risks.filter((r) => r.status === 'RESOLVED');

  const handleCreateRisk = (e) => {
    e.preventDefault();
    if (!newRisk.title) return;

    const matchedProject = projects.find((p) => p.id === newRisk.projectId);
    const created = {
      id: `RSK-${Math.floor(110 + Math.random() * 890)}`,
      projectId: newRisk.projectId,
      projectTitle: matchedProject ? matchedProject.name : 'Enterprise Operations',
      title: newRisk.title,
      severity: newRisk.severity,
      category: newRisk.category,
      owner: newRisk.owner,
      impact: newRisk.impact || 'Service disruption risk to core SLA.',
      mitigation: newRisk.mitigation || 'Active monitoring and engineering triage.',
      status: 'ACTIVE',
      rag: newRisk.rag,
      reportedDate: new Date().toISOString().split('T')[0],
    };

    dispatch(addOperationalRisk(created));
    setIsModalOpen(false);
    setNewRisk({
      title: '',
      projectId: projects[0]?.id || 'PRJ-301',
      severity: 'HIGH',
      category: 'Infrastructure',
      owner: 'Operations Lead',
      impact: '',
      mitigation: '',
      rag: 'AMBER'
    });
  };

  const handleSaveMitigation = (id) => {
    if (!mitigationText.trim()) return;
    dispatch(updateRiskMitigation({ id, mitigation: mitigationText }));
    setEditingRiskId(null);
    setMitigationText('');
  };

  return (
    <div className="status-page">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-title-block">
          <div className="page-tag">Operations · Delivery Health & Blocker Tracker [OPS-STAT]</div>
          <h2>Operational Status & Risk Register</h2>
          <p>Real-time delivery status, Red/Amber/Green workstream health, active operational blockers, and predictive mitigation workflows.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', fontWeight: 600 }}
        >
          <Plus size={16} /> Log Blocker / Risk
        </button>
      </div>

      {/* RAG Executive Overview Bar */}
      <div className="card" style={{ padding: '20px', marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} color="var(--accent)" /> Executive RAG Health Index
            </h3>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Overall portfolio delivery posture: {greenPct}% Green, {amberPct}% Amber, {redPct}% Red
            </span>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
              <span>{greenCount} Green</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <span>{amberCount} Amber</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <span>{redCount} Red</span>
            </div>
          </div>
        </div>

        {/* Multi-segment RAG progress bar */}
        <div style={{ height: 12, borderRadius: 6, overflow: 'hidden', display: 'flex', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ width: `${greenPct}%`, background: '#22c55e', transition: 'width 0.3s ease' }} title={`Green: ${greenPct}%`} />
          <div style={{ width: `${amberPct}%`, background: '#f59e0b', transition: 'width 0.3s ease' }} title={`Amber: ${amberPct}%`} />
          <div style={{ width: `${redPct}%`, background: '#ef4444', transition: 'width 0.3s ease' }} title={`Red: ${redPct}%`} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid cols-4" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">Delivery SLA Compliance <CheckCircle2 size={13} color="var(--success)" /></div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>98.6%</div>
          <div className="stat-sub">SLA threshold &gt; 98.0%</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active Blockers <AlertOctagon size={13} color="var(--danger)" /></div>
          <div className="stat-value" style={{ color: activeRisks.length > 0 ? 'var(--danger)' : 'inherit' }}>
            {activeRisks.length}
          </div>
          <div className="stat-sub">Requiring immediate mitigation</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Avg MTTR (Blockers) <Clock size={13} /></div>
          <div className="stat-value">4.2 hrs</div>
          <div className="stat-sub">Down 35% from last sprint</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">System Load Prediction <Zap size={13} color="var(--warning)" /></div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{forecast.currentLoad || '78%'}</div>
          <div className="stat-sub">{forecast.predictedTomorrow || '114% (Peak Spike)'}</div>
        </div>
      </div>

      {/* AI Health Alert Warning banner */}
      {forecast.statusAlert && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 8,
            padding: '14px 18px',
            marginBottom: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: '#f59e0b' }}>
                AI Predictive Health Warning
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {forecast.statusAlert}
              </div>
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            Action: {forecast.suggestedAction}
          </span>
        </div>
      )}

      {/* Blockers & Risk Register Section */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Operational Risk Register & Blockers</h3>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Tracks active impediments, failure modes, severity levels, and mitigation actions.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL_RISKS', 'ACTIVE', 'RESOLVED'].map((tab) => (
              <button
                key={tab}
                className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Risks Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>RAG</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Risk ID & Title</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Project Workstream</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Severity & Category</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Owner</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Mitigation Plan</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.map((risk) => {
                const rag = RAG_CONFIG[risk.rag] || RAG_CONFIG.AMBER;
                const isEditing = editingRiskId === risk.id;

                return (
                  <tr
                    key={risk.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.1s ease',
                      opacity: risk.status === 'RESOLVED' ? 0.65 : 1,
                    }}
                  >
                    {/* RAG status dot/pill */}
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 12,
                          color: rag.color,
                          background: rag.bg,
                          border: `1px solid ${rag.border}`,
                        }}
                      >
                        ● {risk.rag}
                      </span>
                    </td>

                    {/* ID & Title */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                        {risk.id}
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                        {risk.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        Impact: {risk.impact}
                      </div>
                    </td>

                    {/* Project */}
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{risk.projectId}</div>
                      <div style={{ fontSize: 11 }}>{risk.projectTitle}</div>
                    </td>

                    {/* Severity & Category */}
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 4,
                          color: risk.severity === 'CRITICAL' ? 'var(--danger)' : risk.severity === 'HIGH' ? 'var(--warning)' : 'var(--text-secondary)',
                          background: 'var(--bg-elevated)',
                        }}
                      >
                        {risk.severity}
                      </span>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        {risk.category}
                      </div>
                    </td>

                    {/* Owner */}
                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>
                      {risk.owner}
                    </td>

                    {/* Mitigation Plan */}
                    <td style={{ padding: '12px', maxWidth: 260 }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <input
                            type="text"
                            value={mitigationText}
                            onChange={(e) => setMitigationText(e.target.value)}
                            className="input"
                            style={{ fontSize: 12, padding: '4px 8px' }}
                          />
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleSaveMitigation(risk.id)}
                              style={{ fontSize: 11, padding: '2px 6px' }}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-sm btn-ghost"
                              onClick={() => setEditingRiskId(null)}
                              style={{ fontSize: 11, padding: '2px 6px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {risk.mitigation}
                          {risk.status !== 'RESOLVED' && (
                            <button
                              onClick={() => {
                                setEditingRiskId(risk.id);
                                setMitigationText(risk.mitigation);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent)',
                                cursor: 'pointer',
                                fontSize: 11,
                                textDecoration: 'underline',
                                marginLeft: 6,
                              }}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {risk.status !== 'RESOLVED' ? (
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => dispatch(resolveOperationalRisk({ id: risk.id, status: 'RESOLVED', rag: 'GREEN' }))}
                          style={{
                            color: 'var(--success)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            padding: '4px 8px',
                          }}
                        >
                          <Check size={13} /> Resolve
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Resolved</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Blocker Modal */}
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
          <div className="card" style={{ width: '100%', maxWidth: 520, padding: 24, boxShadow: 'var(--shadow-modal)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Log Operational Blocker or Risk</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Escalate a workstream impediment to the operations risk register.</p>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)} style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRisk} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Blocker / Risk Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rate-limit throttling on European VIES Registry"
                  value={newRisk.title}
                  onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Linked Project
                  </label>
                  <select
                    value={newRisk.projectId}
                    onChange={(e) => setNewRisk({ ...newRisk, projectId: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name.slice(0, 24)}...</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Severity
                  </label>
                  <select
                    value={newRisk.severity}
                    onChange={(e) => setNewRisk({ ...newRisk, severity: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    RAG Health
                  </label>
                  <select
                    value={newRisk.rag}
                    onChange={(e) => setNewRisk({ ...newRisk, rag: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="RED">Red (Blocked)</option>
                    <option value="AMBER">Amber (At Risk)</option>
                    <option value="GREEN">Green (Low Risk)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={newRisk.category}
                    onChange={(e) => setNewRisk({ ...newRisk, category: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Owner
                  </label>
                  <input
                    type="text"
                    value={newRisk.owner}
                    onChange={(e) => setNewRisk({ ...newRisk, owner: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Operational Impact
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delays clearing for 300+ Swedish freight invoices."
                  value={newRisk.impact}
                  onChange={(e) => setNewRisk({ ...newRisk, impact: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Mitigation Strategy
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Deploy Redis caching layer and asynchronous batch queuing..."
                  value={newRisk.mitigation}
                  onChange={(e) => setNewRisk({ ...newRisk, mitigation: e.target.value })}
                  className="input"
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Log to Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default StatusPage;
