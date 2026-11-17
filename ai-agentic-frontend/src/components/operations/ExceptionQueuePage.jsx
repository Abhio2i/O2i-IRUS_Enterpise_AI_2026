import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { resolveException, updateExtractedField } from '../../store/operationsSlice';
import { addAuditLog } from '../../store/governanceSlice';
import {
  AlertTriangle, CheckCircle, XCircle, Edit3,
  FileText, UserCheck, Info, CheckCircle2,
} from 'lucide-react';

export const ExceptionQueuePage = () => {
  const dispatch = useDispatch();
  const exceptions = useSelector((s) => s.operations.exceptions);
  const resolvedCount = useSelector((s) => s.operations.resolvedCount);
  const autoApprovedCount = useSelector((s) => s.operations.autoApprovedCount);

  const [selectedId, setSelectedId] = useState(exceptions[0]?.id || null);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState('');

  const active = exceptions.find((e) => e.id === selectedId) || exceptions[0];

  const doResolve = (exc, resolution) => {
    dispatch(resolveException({ id: exc.id, resolution }));
    dispatch(addAuditLog({
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      actor: 'user:controller@org.com',
      action: resolution === 'APPROVED' ? 'HUMAN_APPROVAL' : 'HUMAN_REJECTION',
      endpoint: `/api/v1/exceptions/${exc.id}/resolve`,
      riskTier: exc.riskTier,
      model: 'Human-in-the-Loop',
      tokens: 0,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      details: `${resolution} exception ${exc.id} for ${exc.vendor} (${exc.amount})`,
    }));
    const remaining = exceptions.filter((e) => e.id !== exc.id);
    if (remaining.length) setSelectedId(remaining[0].id);
    setEditingIdx(null);
  };

  const saveEdit = (excId, idx) => {
    dispatch(updateExtractedField({ exceptionId: excId, fieldIndex: idx, newValue: editValue }));
    setEditingIdx(null);
  };

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-tag">Operations · Exception Queue [OPS-2]</div>
          <h2>Human-in-the-Loop Review Queue</h2>
          <p>Documents that failed autonomous validation rules are routed here for human operator review, field correction, and approval or rejection.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid cols-3" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">Pending Review <AlertTriangle size={13} /></div>
          <div className="stat-value" style={{ color: exceptions.length > 0 ? 'var(--danger)' : 'inherit' }}>
            {exceptions.length}
          </div>
          <div className="stat-desc">Awaiting human decision</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Resolved Today <UserCheck size={13} /></div>
          <div className="stat-value">{resolvedCount}</div>
          <div className="stat-desc">Avg. turnaround 2.1 min</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Auto-Approved <CheckCircle size={13} /></div>
          <div className="stat-value">{autoApprovedCount}</div>
          <div className="stat-desc">91.4% straight-through rate</div>
        </div>
      </div>

      {exceptions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <CheckCircle2 size={48} style={{ margin: '0 auto 16px', color: 'var(--success)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 8 }}>Queue is Clear</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', fontSize: 13 }}>
            All documents have been autonomously validated or reviewed. Pipeline running at peak throughput.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 18 }}>
          {/* Left: Exception List */}
          <div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
                  Exception Queue
                </span>
                <span className="badge danger">{exceptions.length} Pending</span>
              </div>
              {exceptions.map((exc) => (
                <div
                  key={exc.id}
                  onClick={() => setSelectedId(exc.id)}
                  style={{
                    padding: '14px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: selectedId === exc.id ? 'var(--bg-active)' : 'transparent',
                    borderLeft: `3px solid ${selectedId === exc.id ? 'var(--accent)' : 'transparent'}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{exc.id}</span>
                    <span className={`badge ${exc.riskTier === 'HIGH' ? 'danger' : exc.riskTier === 'MEDIUM' ? 'warning' : 'success'}`} style={{ fontSize: 10 }}>
                      {exc.riskTier}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{exc.vendor}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span className="mono" style={{ fontWeight: 600 }}>{exc.amount}</span>
                    <span>Conf. {Math.round(exc.confidenceScore * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Detail panel */}
          {active && (
            <div className="card">
              <div className="card-header">
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 2 }}>
                    {active.instanceId} · {active.documentId}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{active.processName}</h3>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-danger btn-sm" onClick={() => doResolve(active, 'REJECTED')}>
                    <XCircle size={13} /> Reject
                  </button>
                  <button className="btn btn-solid btn-sm" onClick={() => doResolve(active, 'APPROVED')}>
                    <CheckCircle size={13} /> Approve & Settle
                  </button>
                </div>
              </div>

              {/* Reason box */}
              <div style={{ padding: '12px 14px', background: 'var(--bg-hover)', border: '1px solid var(--border-default)', borderLeft: '3px solid var(--accent)', borderRadius: 7, marginBottom: 18, fontSize: 12.5, lineHeight: 1.5 }}>
                <div style={{ fontWeight: 600, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Info size={13} /> Rule Engine Trigger Reason
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{active.reason}</div>
              </div>

              {/* Field table */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span>Extracted Fields — Spring AI / Apache Tika</span>
                <span className="mono">Confidence Threshold: 90%</span>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Extracted Value</th>
                      <th>Confidence</th>
                      <th>Validation</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.extractedFields.map((f, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{f.name}</td>
                        <td className="mono">
                          {editingIdx === idx
                            ? <input className="input" style={{ padding: '4px 8px', fontSize: 12, width: 180 }} value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                            : f.value
                          }
                        </td>
                        <td>
                          <div className="conf-bar-wrap">
                            <div className="conf-bar">
                              <div className={`conf-bar-fill ${f.confidence < 0.9 ? 'low' : ''}`} style={{ width: `${f.confidence * 100}%` }} />
                            </div>
                            <span style={{ color: f.confidence < 0.9 ? 'var(--danger)' : 'inherit' }}>{Math.round(f.confidence * 100)}%</span>
                          </div>
                        </td>
                        <td>
                          {f.valid
                            ? <span className="badge success">Validated</span>
                            : <span className="badge danger" style={{ fontSize: 10 }}>{f.flag || 'Failed'}</span>
                          }
                        </td>
                        <td>
                          {editingIdx === idx
                            ? <button className="btn btn-solid btn-xs" onClick={() => saveEdit(active.id, idx)}>Save</button>
                            : <button className="btn btn-ghost btn-xs" onClick={() => { setEditingIdx(idx); setEditValue(f.value); }}>
                                <Edit3 size={11} /> Correct
                              </button>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-muted)', paddingTop: 12, marginTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                <span>Vendor: <strong style={{ color: 'var(--text-secondary)' }}>{active.vendor}</strong></span>
                <span className="mono">Ingested: {active.createdAt}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
