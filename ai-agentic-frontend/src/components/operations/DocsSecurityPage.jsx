import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addDocumentation, updateDocAuditDate, resolveDlpAlert, toggleComplianceControl } from '../../store/operationsSlice';
import {
  FileText, Shield, Lock, Key, CheckCircle2, AlertTriangle, ShieldCheck,
  Search, Filter, Plus, Download, Eye, Clock, User, Tag, HardDrive, RefreshCw,
  X, Check, ExternalLink, AlertOctagon, UploadCloud
} from 'lucide-react';

const CLASSIFICATION_BADGES = {
  RESTRICTED: { label: 'RESTRICTED', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
  CONFIDENTIAL: { label: 'CONFIDENTIAL', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  INTERNAL: { label: 'INTERNAL', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.3)' },
  PUBLIC: { label: 'PUBLIC', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.3)' },
};

export const DocsSecurityPage = () => {
  const dispatch = useDispatch();
  const docs = useSelector((s) => s.operations.documentation || []);
  const sec = useSelector((s) => s.operations.securityState || {});

  const [activeTab, setActiveTab] = useState('DOCS'); // 'DOCS' | 'SECURITY'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewingDoc, setViewingDoc] = useState(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  // New Doc Form
  const [newDoc, setNewDoc] = useState({
    title: '',
    category: 'Operational Runbooks',
    version: 'v1.0',
    author: 'Operations Lead',
    classification: 'INTERNAL',
    pages: 10,
    tags: 'SOP, Operations',
    summary: '',
  });

  const categories = ['ALL', 'Operational Runbooks', 'Architecture & ADRs', 'Data Security & Policy'];

  const filteredDocs = docs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.author.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateDoc = (e) => {
    e.preventDefault();
    if (!newDoc.title) return;

    const created = {
      id: `DOC-SOP-0${docs.length + 1}`,
      title: newDoc.title,
      category: newDoc.category,
      version: newDoc.version,
      author: newDoc.author,
      lastAudit: new Date().toISOString().split('T')[0],
      classification: newDoc.classification,
      status: 'VERIFIED',
      size: uploadedFile ? `${(uploadedFile.size / (1024 * 1024) > 0.1 ? (uploadedFile.size / (1024 * 1024)).toFixed(1) + ' MB' : (uploadedFile.size / 1024).toFixed(0) + ' KB')}` : '2.1 MB',
      pages: parseInt(newDoc.pages) || 12,
      tags: newDoc.tags.split(',').map((t) => t.trim()).filter(Boolean),
      summary: newDoc.summary || 'Enterprise operational procedure documentation.',
    };

    dispatch(addDocumentation(created));
    setIsDocModalOpen(false);
    setUploadedFile(null);
    setNewDoc({
      title: '',
      category: 'Operational Runbooks',
      version: 'v1.0',
      author: 'Operations Lead',
      classification: 'INTERNAL',
      pages: 10,
      tags: 'SOP, Operations',
      summary: '',
    });
  };

  return (
    <div className="docs-security-page">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-title-block">
          <div className="page-tag">Operations · Knowledge, SOPs & Security Posture [OPS-SEC]</div>
          <h2>Documentation & Data Security Hub</h2>
          <p>Centralized operational runbooks, architecture decision records (ADRs), cryptographic key security, and compliance posture.</p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: 8, background: 'var(--bg-elevated)', padding: 4, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
          <button
            className={`btn btn-sm ${activeTab === 'DOCS' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('DOCS')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <FileText size={14} /> Operational SOPs & Runbooks ({docs.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'SECURITY' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('SECURITY')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ShieldCheck size={14} /> Data Security & Compliance ({sec.securityScore || 98}%)
          </button>
        </div>
      </div>

      {/* ─── TAB 1: DOCUMENTATION ──────────────────────────── */}
      {activeTab === 'DOCS' && (
        <div>
          {/* Action and Filter Bar */}
          <div className="card" style={{ padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, flex: '1 1 300px', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
                  <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search documents by title, author, or tag..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input"
                    style={{ width: '100%', paddingLeft: 34, height: 38 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
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

              <button
                className="btn btn-primary"
                onClick={() => setIsDocModalOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '7px 14px' }}
              >
                <Plus size={15} /> Add Documentation
              </button>
            </div>
          </div>

          {/* Documents Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
            {filteredDocs.map((doc) => {
              const classCfg = CLASSIFICATION_BADGES[doc.classification] || CLASSIFICATION_BADGES.INTERNAL;

              return (
                <div
                  key={doc.id}
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
                    {/* Header: ID, Version, Classification badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                          {doc.id}
                        </span>
                        <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', fontWeight: 600 }}>
                          {doc.version}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          color: classCfg.color,
                          background: classCfg.bg,
                          border: `1px solid ${classCfg.border}`,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {classCfg.label}
                      </span>
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                      {doc.category}
                    </div>

                    <h3 style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 8, lineHeight: 1.35 }}>
                      {doc.title}
                    </h3>

                    <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                      {doc.summary}
                    </p>

                    {/* Meta specs */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <User size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>{doc.author}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>Audited: {doc.lastAudit}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <FileText size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>{doc.pages} pages ({doc.size})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <CheckCircle2 size={12} color="#22c55e" />
                        <span style={{ color: 'var(--success)' }}>{doc.status}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {doc.tags.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 10.5,
                            padding: '1px 6px',
                            borderRadius: 3,
                            background: 'var(--bg-base)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => dispatch(updateDocAuditDate({ id: doc.id }))}
                      style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent)' }}
                    >
                      <RefreshCw size={11} /> Re-verify Audit
                    </button>

                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => setViewingDoc(doc)}
                      style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <Eye size={12} /> View Content
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 2: DATA SECURITY & COMPLIANCE ─────────────── */}
      {activeTab === 'SECURITY' && (
        <div>
          {/* Executive Security Score Banner */}
          <div
            className="card"
            style={{
              padding: '22px',
              marginBottom: 22,
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck size={32} color="#22c55e" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700 }}>Enterprise Data Security Posture: {sec.securityScore || 98}/100</h3>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
                      GRADE A+
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    End-to-end cryptographic envelope encryption, zero-trust mTLS service mesh, and automated PII data masking active across all ingestion pipelines.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, textAlign: 'right' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Masked PII Fields</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                    {sec.dataRedaction?.maskedFieldCount?.toLocaleString() || '42,910'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>HSM Key Rotation</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>
                    {sec.encryptionAtRest?.lastRotation}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Encryption & Redaction Posture 3-Card Grid */}
          <div className="stats-grid cols-3" style={{ marginBottom: 22 }}>
            {/* Card 1: Encryption at Rest */}
            <div className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14 }}>
                  <HardDrive size={16} color="var(--accent)" /> Encryption At Rest
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
                  ENFORCED
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>
                Algorithm: <strong>{sec.encryptionAtRest?.algorithm}</strong>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Key Storage: {sec.encryptionAtRest?.keyManagement}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Master Key Last Rotated: {sec.encryptionAtRest?.lastRotation}
              </div>
            </div>

            {/* Card 2: Encryption in Transit */}
            <div className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14 }}>
                  <Lock size={16} color="var(--accent)" /> Encryption In Transit
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
                  ENFORCED
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>
                Protocol: <strong>{sec.encryptionInTransit?.protocol}</strong>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Cipher: {sec.encryptionInTransit?.cipherSuites}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Cert Validity: {sec.encryptionInTransit?.certExpiryDays} Days remaining
              </div>
            </div>

            {/* Card 3: Automated PII Masking */}
            <div className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14 }}>
                  <Shield size={16} color="var(--accent)" /> Automated PII Redaction
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
                  ACTIVE
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>
                Engine: <strong>{sec.dataRedaction?.engine}</strong>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Masked Entities: IBAN, Tax IDs, PAN, Swedish Personnummer
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                False Positive Rate: {sec.dataRedaction?.falsePositiveRate}
              </div>
            </div>
          </div>

          {/* Compliance Standards Checklist */}
          <div className="card" style={{ padding: '20px', marginBottom: 22 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Regulatory & Compliance Audit Posture</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Real-time audit control verification across international security and privacy mandates.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              {sec.complianceStandards?.map((std) => (
                <div
                  key={std.id}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{std.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{std.authority}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 6px', borderRadius: 4 }}>
                      {std.score}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Controls Passing</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{std.controlsPassed} / {std.totalControls}</span>
                  </div>

                  <div style={{ height: 6, background: 'var(--bg-base)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(std.controlsPassed / std.totalControls) * 100}%`,
                        background: '#22c55e',
                      }}
                    />
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Last Audit: {std.auditDate} · Status: {std.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time DLP Alerts & Security Event Feed */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertOctagon size={18} color="var(--warning)" /> Real-Time DLP & Security Event Stream
                </h3>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Automated policy intercepts, unauthorized access mitigations, and compliance audit events.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sec.dlpAlerts?.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 4,
                        color: alert.severity === 'HIGH' ? 'var(--danger)' : alert.severity === 'MEDIUM' ? 'var(--warning)' : '#06b6d4',
                        background: 'var(--bg-base)',
                      }}
                    >
                      {alert.severity}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{alert.rule}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {alert.details} · <span style={{ color: 'var(--text-muted)' }}>Source: {alert.source}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {alert.timestamp}
                    </span>
                    {alert.status !== 'RESOLVED' ? (
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => dispatch(resolveDlpAlert({ id: alert.id }))}
                        style={{ color: 'var(--success)', fontSize: 11 }}
                      >
                        <Check size={12} /> Acknowledge
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={12} /> {alert.actionTaken}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Document Content */}
      {viewingDoc && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>{viewingDoc.id} · {viewingDoc.version}</span>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>{viewingDoc.title}</h3>
              </div>
              <button className="btn btn-ghost" onClick={() => setViewingDoc(null)} style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 8, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Executive Summary:</div>
              {viewingDoc.summary}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 18 }}>
              <div>Author: <strong>{viewingDoc.author}</strong></div>
              <div>Classification: <strong>{viewingDoc.classification}</strong></div>
              <div>Audit Date: <strong>{viewingDoc.lastAudit}</strong></div>
              <div>File Size: <strong>{viewingDoc.size} ({viewingDoc.pages} pages)</strong></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setViewingDoc(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  alert(`Downloading ${viewingDoc.title} (${viewingDoc.size})`);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Documentation */}
      {isDocModalOpen && (
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
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Publish Operational Document</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Add an SOP, runbook, or architectural specification.</p>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsDocModalOpen(false)} style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDoc} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* File Upload Dropzone */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Attach Document File (PDF, DOCX, Markdown, Policy Spec)
                </label>
                <div
                  style={{
                    border: '2px dashed var(--border-default)',
                    borderRadius: 8,
                    padding: '16px',
                    textAlign: 'center',
                    background: 'var(--bg-elevated)',
                    cursor: 'pointer',
                  }}
                  onClick={() => document.getElementById('doc-file-input')?.click()}
                >
                  <input
                    id="doc-file-input"
                    type="file"
                    accept=".pdf,.docx,.doc,.md,.txt,.json"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadedFile(file);
                        if (!newDoc.title) {
                          setNewDoc((prev) => ({
                            ...prev,
                            title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
                          }));
                        }
                      }
                    }}
                  />
                  {uploadedFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--success)' }}>
                      <CheckCircle2 size={16} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{uploadedFile.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({(uploadedFile.size / 1024).toFixed(0)} KB)</span>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud size={24} style={{ color: 'var(--text-muted)', marginBottom: 4 }} />
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>
                        Click to select or drag & drop runbook file
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Supports PDF, Word (.docx), Markdown, or Security specs (up to 50MB)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Disaster Recovery Failover SOP for Kafka Clusters"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Category
                  </label>
                  <select
                    value={newDoc.category}
                    onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="Operational Runbooks">Operational Runbooks</option>
                    <option value="Architecture & ADRs">Architecture & ADRs</option>
                    <option value="Data Security & Policy">Data Security & Policy</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Classification
                  </label>
                  <select
                    value={newDoc.classification}
                    onChange={(e) => setNewDoc({ ...newDoc, classification: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="INTERNAL">Internal</option>
                    <option value="CONFIDENTIAL">Confidential</option>
                    <option value="RESTRICTED">Restricted</option>
                    <option value="PUBLIC">Public</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Author / Lead
                  </label>
                  <input
                    type="text"
                    value={newDoc.author}
                    onChange={(e) => setNewDoc({ ...newDoc, author: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Version
                  </label>
                  <input
                    type="text"
                    value={newDoc.version}
                    onChange={(e) => setNewDoc({ ...newDoc, version: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Summary / Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline the operational purpose and mandatory protocols..."
                  value={newDoc.summary}
                  onChange={(e) => setNewDoc({ ...newDoc, summary: e.target.value })}
                  className="input"
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kafka, DR, Runbook, Architecture"
                  value={newDoc.tags}
                  onChange={(e) => setNewDoc({ ...newDoc, tags: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsDocModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default DocsSecurityPage;
