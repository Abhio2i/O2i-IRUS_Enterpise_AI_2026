import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { resolveException, updateExtractedField } from '../../store/operationsSlice';
import { addAuditLog } from '../../store/governanceSlice';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit3,
  FileText,
  UserCheck,
  ShieldAlert,
  ChevronRight,
  Info,
} from 'lucide-react';

export const ExceptionQueueTab = () => {
  const dispatch = useDispatch();
  const exceptions = useSelector((state) => state.operations.exceptions);
  const resolvedCount = useSelector((state) => state.operations.resolvedCount);
  const autoApprovedCount = useSelector((state) => state.operations.autoApprovedCount);

  const [selectedExceptionId, setSelectedExceptionId] = useState(
    exceptions.length > 0 ? exceptions[0].id : null
  );
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  const activeException = exceptions.find((e) => e.id === selectedExceptionId) || exceptions[0];

  const handleApprove = (exception) => {
    dispatch(
      resolveException({
        id: exception.id,
        resolution: 'APPROVED',
      })
    );
    dispatch(
      addAuditLog({
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        actor: 'user:controller.ops@bjorn.com',
        action: 'HUMAN_APPROVAL_OVERRIDE',
        endpoint: `/api/v1/exceptions/${exception.id}/resolve`,
        riskTier: exception.riskTier,
        model: 'Human-in-the-Loop',
        tokens: 0,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        details: `Approved exception ${exception.id} for ${exception.vendor} ($${exception.amount}) with human confirmation.`,
      })
    );
    if (exceptions.length > 1) {
      const remaining = exceptions.filter((e) => e.id !== exception.id);
      setSelectedExceptionId(remaining[0].id);
    }
  };

  const handleReject = (exception) => {
    dispatch(
      resolveException({
        id: exception.id,
        resolution: 'REJECTED',
      })
    );
    dispatch(
      addAuditLog({
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        actor: 'user:controller.ops@bjorn.com',
        action: 'HUMAN_REJECTION_ESCALATION',
        endpoint: `/api/v1/exceptions/${exception.id}/resolve`,
        riskTier: exception.riskTier,
        model: 'Human-in-the-Loop',
        tokens: 0,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        details: `Rejected exception ${exception.id} - flagged for vendor investigation.`,
      })
    );
    if (exceptions.length > 1) {
      const remaining = exceptions.filter((e) => e.id !== exception.id);
      setSelectedExceptionId(remaining[0].id);
    }
  };

  const startFieldEdit = (index, currentValue) => {
    setEditingFieldIndex(index);
    setEditValue(currentValue);
  };

  const saveFieldEdit = (exceptionId, index) => {
    dispatch(
      updateExtractedField({
        exceptionId,
        fieldIndex: index,
        newValue: editValue,
      })
    );
    setEditingFieldIndex(null);
  };

  return (
    <div>
      {/* Metric Cards Row */}
      <div className="stats-pill-row">
        <div className="stat-pill-item">
          <div className="stat-pill-label">
            <span>Pending Human Review (OPS-2)</span>
            <AlertTriangle size={15} style={{ color: exceptions.length > 0 ? '#ef4444' : 'var(--text-muted)' }} />
          </div>
          <div className="stat-pill-value mono">{exceptions.length}</div>
          <div className="stat-pill-footnote">Low confidence or rule-failing transactions</div>
        </div>

        <div className="stat-pill-item">
          <div className="stat-pill-label">
            <span>Human Resolved Today</span>
            <UserCheck size={15} style={{ color: 'var(--text-primary)' }} />
          </div>
          <div className="stat-pill-value mono">{resolvedCount}</div>
          <div className="stat-pill-footnote">Avg review turnaround: 2.1 minutes</div>
        </div>

        <div className="stat-pill-item">
          <div className="stat-pill-label">
            <span>Autonomous Passthrough</span>
            <CheckCircle size={15} style={{ color: '#22c55e' }} />
          </div>
          <div className="stat-pill-value mono">{autoApprovedCount}</div>
          <div className="stat-pill-footnote">91.4% straight-through processing rate</div>
        </div>
      </div>

      {exceptions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <CheckCircle size={44} style={{ color: '#22c55e', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Exception Queue Cleared</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 20px', fontSize: '13.5px' }}>
            All incoming documents have met the autonomous threshold or were reviewed by operators. The pipeline is running at optimal throughput.
          </p>
          <span className="pill-badge mono">AUTONOMOUS PIPELINE HEALTH: 100%</span>
        </div>
      ) : (
        <div className="grid-2" style={{ gridTemplateColumns: '400px 1fr' }}>
          {/* List of Exceptions */}
          <div className="card" style={{ padding: '16px' }}>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <div className="card-title">
                <FileText size={16} />
                <span>Exception Queue</span>
              </div>
              <span className="pill-badge mono">{exceptions.length} PENDING</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {exceptions.map((exc) => {
                const isSelected = activeException && activeException.id === exc.id;
                return (
                  <div
                    key={exc.id}
                    onClick={() => setSelectedExceptionId(exc.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '6px',
                      border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--bg-muted)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="mono" style={{ fontWeight: 700, fontSize: '12px' }}>
                        {exc.id}
                      </span>
                      <span
                        className={`pill-badge ${
                          exc.riskTier === 'HIGH' ? 'high' : exc.riskTier === 'MEDIUM' ? 'medium' : 'low'
                        }`}
                        style={{ fontSize: '10px' }}
                      >
                        {exc.riskTier} RISK
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>
                      {exc.vendor}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span className="mono" style={{ fontWeight: 600 }}>{exc.amount}</span>
                      <span className="mono" style={{ fontSize: '11px' }}>
                        Confidence: {Math.round(exc.confidenceScore * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Exception Review & HITL Resolution Details */}
          {activeException && (
            <div className="card">
              <div className="card-header">
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="mono">
                    WORKFLOW INSTANCE: {activeException.instanceId}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>
                    {activeException.processName}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline btn-sm btn-danger" onClick={() => handleReject(activeException)}>
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => handleApprove(activeException)}>
                    <CheckCircle size={14} />
                    <span>Approve & Settle</span>
                  </button>
                </div>
              </div>

              {/* Reason Alert Box */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-muted)',
                  border: '1px solid var(--border)',
                  borderLeft: '3px solid var(--accent-dot)',
                  borderRadius: '6px',
                  marginBottom: '18px',
                  fontSize: '12.5px',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Info size={14} />
                  <span>Rule Engine Trigger Reason (OPS-2)</span>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{activeException.reason}</div>
              </div>

              {/* Extracted Fields Table with Confidence and Inline Correction */}
              <div style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    color: 'var(--text-muted)',
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Extracted Schema Fields (Spring AI / Tika)</span>
                  <span className="mono">CONFIDENCE THRESHOLD: 90%</span>
                </div>

                <div className="table-wrap">
                  <table className="bip-table">
                    <thead>
                      <tr>
                        <th>Field Name</th>
                        <th>Extracted Value</th>
                        <th>Confidence</th>
                        <th>Status / Validation</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeException.extractedFields.map((field, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{field.name}</td>
                          <td className="mono">
                            {editingFieldIndex === idx ? (
                              <input
                                className="input-control"
                                style={{ padding: '4px 8px', fontSize: '12px', width: '180px' }}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                autoFocus
                              />
                            ) : (
                              <span>{field.value}</span>
                            )}
                          </td>
                          <td className="mono">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div
                                style={{
                                  width: '40px',
                                  height: '4px',
                                  backgroundColor: 'var(--bg-muted)',
                                  borderRadius: '2px',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: `${field.confidence * 100}%`,
                                    height: '100%',
                                    backgroundColor: field.confidence >= 0.9 ? 'var(--text-primary)' : '#ef4444',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '11px', color: field.confidence >= 0.9 ? 'inherit' : '#ef4444' }}>
                                {Math.round(field.confidence * 100)}%
                              </span>
                            </div>
                          </td>
                          <td>
                            {field.valid ? (
                              <span className="pill-badge low" style={{ fontSize: '10px' }}>
                                Validated
                              </span>
                            ) : (
                              <span className="pill-badge high" style={{ fontSize: '10px' }}>
                                {field.flag || 'Failed Rule'}
                              </span>
                            )}
                          </td>
                          <td>
                            {editingFieldIndex === idx ? (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ padding: '3px 8px', fontSize: '11px' }}
                                onClick={() => saveFieldEdit(activeException.id, idx)}
                              >
                                Save
                              </button>
                            ) : (
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ padding: '3px 8px', fontSize: '11px' }}
                                onClick={() => startFieldEdit(idx, field.value)}
                              >
                                <Edit3 size={11} />
                                <span>Correct</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Metadata Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11.5px',
                  color: 'var(--text-muted)',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <span>
                  Source: <strong style={{ color: 'var(--text-secondary)' }}>{activeException.documentId}</strong>
                </span>
                <span className="mono">Ingested: {activeException.createdAt}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
