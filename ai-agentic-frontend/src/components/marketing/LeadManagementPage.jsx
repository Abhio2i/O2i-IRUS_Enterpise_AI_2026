import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateLeadStatus, addLeadInteraction, markNotificationRead,
  markAllNotificationsRead, addNotification,
} from '../../store/marketingSlice';
import {
  Users, Bell, TrendingUp, Phone, Mail, Share2, Globe, Calendar,
  MessageSquare, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronRight,
  Flame, Thermometer, Snowflake, Plus,
} from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'INITIAL_CONTACT', label: 'Initial Contact', color: '#6366f1' },
  { id: 'QUALIFICATION', label: 'Qualification', color: '#8b5cf6' },
  { id: 'DEMO_SCHEDULED', label: 'Demo Scheduled', color: '#f59e0b' },
  { id: 'PROPOSAL_SENT', label: 'Proposal Sent', color: '#06b6d4' },
  { id: 'NEGOTIATION', label: 'Negotiation', color: '#f97316' },
  { id: 'WON', label: 'Won', color: '#22c55e' },
];

const STATUS_CONFIG = {
  HOT: { icon: Flame, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', label: 'HOT' },
  WARM: { icon: Thermometer, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: 'WARM' },
  COLD: { icon: Snowflake, color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)', label: 'COLD' },
};

const INTERACTION_ICONS = { Email: Mail, Call: Phone, LinkedIn: Share2, Meeting: Users, Web: Globe };

const NotifBadge = ({ count }) => count > 0 ? (
  <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 10, marginLeft: 6, fontFamily: 'JetBrains Mono, monospace' }}>{count}</span>
) : null;

export const LeadManagementPage = () => {
  const dispatch = useDispatch();
  const leads = useSelector(s => s.marketing.leads);
  const notifications = useSelector(s => s.marketing.notifications);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [logNote, setLogNote] = useState('');
  const [logType, setLogType] = useState('Email');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredLeads = filterStatus === 'ALL' ? leads : leads.filter(l => l.status === filterStatus);

  const selectedLeadData = leads.find(l => l.id === selectedLead);

  const handleLog = () => {
    if (!logNote.trim() || !selectedLead) return;
    dispatch(addLeadInteraction({
      leadId: selectedLead,
      interaction: { date: new Date().toISOString().split('T')[0], type: logType, note: logNote, by: 'You' },
    }));
    dispatch(addNotification({
      id: `NOTIF-${Date.now()}`, type: 'INTERACTION', leadId: selectedLead,
      message: `Interaction logged for ${selectedLeadData?.name}: ${logNote.substring(0, 60)}...`,
      priority: 'LOW', read: false, createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    }));
    setLogNote('');
  };

  const pipelineLeads = PIPELINE_STAGES.map(stage => ({
    ...stage,
    leads: leads.filter(l => l.pipeline === stage.id),
  }));

  const totalValue = leads.reduce((sum, l) => sum + parseFloat(l.value.replace(/[$,]/g, '') || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-tag">Marketing · Lead Intelligence</div>
          <h2>Lead Status & Management</h2>
          <p>Full lead lifecycle management — track status, pipeline stages, log interactions, schedule follow-ups, and receive AI-powered notifications.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            id="notif-panel-btn"
            className="btn btn-ghost"
            onClick={() => setShowNotifPanel(v => !v)}
            style={{ position: 'relative' }}
          >
            <Bell size={14} />
            Notifications
            <NotifBadge count={unreadCount} />
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="stats-grid cols-4" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">Total Leads <span className="badge" style={{ fontSize: 10 }}>{leads.length}</span></div>
          <div className="stat-value" style={{ fontSize: 22 }}>{leads.length}</div>
          <div className="stat-desc">Active pipeline contacts</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ color: '#ef4444' }}>HOT Leads</div>
          <div className="stat-value" style={{ fontSize: 22, color: '#ef4444' }}>{leads.filter(l => l.status === 'HOT').length}</div>
          <div className="stat-desc">Require immediate action</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Follow-Ups Due</div>
          <div className="stat-value" style={{ fontSize: 22, color: '#f59e0b' }}>{leads.filter(l => l.notificationDue).length}</div>
          <div className="stat-desc">AI-flagged for attention</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pipeline Value</div>
          <div className="stat-value" style={{ fontSize: 18 }}>${(totalValue / 1000).toFixed(0)}K</div>
          <div className="stat-desc">Total qualified opportunity</div>
        </div>
      </div>

      {/* Pipeline Kanban */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="card-header">
          <div className="card-title"><TrendingUp size={14} /> Pipeline Kanban View</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['ALL', 'HOT', 'WARM', 'COLD'].map(s => (
              <button key={s} className={`btn btn-xs ${filterStatus === s ? 'btn-solid' : 'btn-ghost'}`} onClick={() => setFilterStatus(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
          {pipelineLeads.map(stage => (
            <div key={stage.id} style={{ minWidth: 170, flex: '0 0 170px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: stage.color, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {stage.label}
                <span style={{ background: stage.color + '20', color: stage.color, borderRadius: 10, padding: '1px 6px', fontSize: 10 }}>{stage.leads.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stage.leads.map(lead => {
                  const sc = STATUS_CONFIG[lead.status];
                  return (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead.id)}
                      style={{
                        background: 'var(--bg-hover)', border: `1px solid ${selectedLead === lead.id ? stage.color : 'var(--border-default)'}`,
                        borderRadius: 8, padding: '10px 12px', cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: selectedLead === lead.id ? `0 0 0 2px ${stage.color}30` : 'none',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>{lead.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{lead.company}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 6, padding: '1px 5px' }}>{sc.label}</span>
                        <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>{lead.value}</span>
                      </div>
                      {lead.notificationDue && (
                        <div style={{ marginTop: 6, fontSize: 10, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <AlertCircle size={10} /> Follow-up due
                        </div>
                      )}
                    </div>
                  );
                })}
                {stage.leads.length === 0 && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 8px', border: '1px dashed var(--border-default)', borderRadius: 8 }}>Empty</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedLeadData ? '1fr 420px' : '1fr', gap: 20 }}>
        {/* Lead Table */}
        <div>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title"><Users size={14} /> All Leads</div>
              <span className="badge">{filteredLeads.length} leads</span>
            </div>
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Status</th>
                    <th>Pipeline Stage</th>
                    <th>Score</th>
                    <th>Value</th>
                    <th>Follow-Up</th>
                    <th>Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => {
                    const sc = STATUS_CONFIG[lead.status];
                    const stage = PIPELINE_STAGES.find(s => s.id === lead.pipeline);
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead.id === selectedLead ? null : lead.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.company} · {lead.designation}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: 10, fontWeight: 700, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 6, padding: '2px 7px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <sc.icon size={9} /> {sc.label}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 11, color: stage?.color || 'var(--text-secondary)', fontWeight: 600 }}>
                            {stage?.label || lead.pipeline}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 36, height: 6, background: 'var(--bg-active)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${lead.score}%`, height: '100%', background: lead.score > 80 ? '#22c55e' : lead.score > 60 ? '#f59e0b' : '#6366f1', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{lead.score}</span>
                          </div>
                        </td>
                        <td><span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{lead.value}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                            {lead.notificationDue && <AlertCircle size={11} color="#f59e0b" />}
                            <span style={{ color: lead.notificationDue ? '#f59e0b' : 'var(--text-secondary)' }}>{lead.nextFollowUp}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{lead.assignedTo}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lead Detail Panel */}
        {selectedLeadData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>{selectedLeadData.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedLeadData.designation} · {selectedLeadData.company}</div>
                </div>
                <button className="btn btn-ghost btn-xs" onClick={() => setSelectedLead(null)}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}><Mail size={11} />{selectedLeadData.email}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}><Phone size={11} />{selectedLeadData.phone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}><Globe size={11} />Source: {selectedLeadData.source}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}><Calendar size={11} />Follow-up: {selectedLeadData.nextFollowUp}</div>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: 7, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5, border: '1px solid var(--border-subtle)' }}>
                {selectedLeadData.notes}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {selectedLeadData.tags.map(t => (
                  <span key={t} className="badge" style={{ fontSize: 10 }}>{t}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['HOT', 'WARM', 'COLD'].map(s => {
                  const sc = STATUS_CONFIG[s];
                  return (
                    <button
                      key={s}
                      className="btn btn-xs"
                      style={{ background: selectedLeadData.status === s ? sc.bg : 'transparent', color: sc.color, border: `1px solid ${sc.border}` }}
                      onClick={() => dispatch(updateLeadStatus({ id: selectedLeadData.id, status: s }))}
                    >
                      <sc.icon size={9} /> {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Log Interaction */}
            <div className="card">
              <div className="card-header"><div className="card-title"><MessageSquare size={14} /> Log Interaction</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Email', 'Call', 'Meeting', 'LinkedIn'].map(t => (
                    <button key={t} className={`btn btn-xs ${logType === t ? 'btn-solid' : 'btn-ghost'}`} onClick={() => setLogType(t)}>{t}</button>
                  ))}
                </div>
                <textarea
                  className="input"
                  style={{ minHeight: 70, resize: 'vertical', fontSize: 12, lineHeight: 1.5 }}
                  placeholder={`Note about this ${logType.toLowerCase()} interaction...`}
                  value={logNote}
                  onChange={e => setLogNote(e.target.value)}
                />
                <button className="btn btn-solid btn-sm" onClick={handleLog} disabled={!logNote.trim()}>
                  <Plus size={12} /> Log Interaction
                </button>
              </div>
            </div>

            {/* Interaction History */}
            <div className="card">
              <div className="card-header"><div className="card-title"><Clock size={14} /> Interaction History</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedLeadData.interactions.map((int, i) => {
                  const Icon = INTERACTION_ICONS[int.type] || MessageSquare;
                  return (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-active)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={12} color="var(--text-secondary)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                          {int.type} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>by {int.by}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{int.note}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{int.date}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Panel */}
      {showNotifPanel && (
        <div style={{
          position: 'fixed', top: 60, right: 20, width: 380, background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)', borderRadius: 12, boxShadow: 'var(--shadow-modal)',
          zIndex: 200, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={14} /> Notifications <NotifBadge count={unreadCount} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-xs" onClick={() => dispatch(markAllNotificationsRead())}>Mark all read</button>
              <button className="btn btn-ghost btn-xs" onClick={() => setShowNotifPanel(false)}>✕</button>
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => dispatch(markNotificationRead(n.id))}
                style={{
                  padding: '12px 18px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer',
                  background: n.read ? 'transparent' : 'var(--bg-hover)',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                    background: n.read ? 'var(--text-muted)' : (n.priority === 'HIGH' ? '#ef4444' : n.priority === 'MEDIUM' ? '#f59e0b' : '#6366f1'),
                  }} />
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: 4 }}>{n.message}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`badge ${n.priority === 'HIGH' ? 'danger' : n.priority === 'MEDIUM' ? 'warning' : ''}`} style={{ fontSize: 9 }}>{n.priority}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{n.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
