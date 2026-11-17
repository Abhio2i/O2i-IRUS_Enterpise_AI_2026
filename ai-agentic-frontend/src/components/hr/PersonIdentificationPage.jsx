import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HrNav } from './HrNav';
import {
  verifyIdentity, addIdentificationRecord
} from '../../store/hrSlice';
import {
  UserCheck, ShieldCheck, AlertTriangle, Fingerprint, Search,
  Plus, CheckCircle2, Clock, Globe, FileText, X, Eye, ShieldAlert
} from 'lucide-react';

export const PersonIdentificationPage = () => {
  const dispatch = useDispatch();
  const identifications = useSelector((s) => s.hr.identifications);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    role: '',
    country: 'Sweden / EU',
    docType: 'EU Sovereign Bio-Passport',
    docNumber: '',
  });

  const filtered = identifications.filter((item) => {
    const matchQuery =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.docType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStatus === 'ALL' || item.status === filterStatus;
    return matchQuery && matchFilter;
  });

  const verifiedCount = identifications.filter((i) => i.status === 'VERIFIED').length;
  const underReviewCount = identifications.filter((i) => i.status === 'UNDER_REVIEW').length;
  const pendingCount = identifications.filter((i) => i.status === 'PENDING_DOCS').length;

  const handleVerify = (id) => {
    dispatch(verifyIdentity(id));
    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord((prev) => ({
        ...prev,
        status: 'VERIFIED',
        biometricScore: 99.2,
        amlSanctionCheck: 'CLEARED (Manual Compliance Override)',
        riskRating: 'LOW (0.01%)',
      }));
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newForm.name || !newForm.role) return;

    const newRecord = {
      id: `IDV-${Math.floor(900 + Math.random() * 99)}`,
      empId: `CAN-${Math.floor(830 + Math.random() * 50)}`,
      name: newForm.name,
      role: newForm.role,
      country: newForm.country,
      docType: newForm.docType,
      docNumber: newForm.docNumber ? `•••-${newForm.docNumber.slice(-4)}` : 'SE-•••-1192',
      biometricScore: 98.4,
      livenessPassed: true,
      amlSanctionCheck: 'CLEARED (OFAC/EU/UN zero hit)',
      bgVerification: 'VERIFIED (Automated Global Registry)',
      status: 'VERIFIED',
      verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      riskRating: 'LOW (0.02%)',
      notes: 'Real-time biometric depth verification completed. Identity document digital watermark confirmed authentic.',
    };

    dispatch(addIdentificationRecord(newRecord));
    setShowAddModal(false);
    setNewForm({ name: '', role: '', country: 'Sweden / EU', docType: 'EU Sovereign Bio-Passport', docNumber: '' });
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      <HrNav />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <UserCheck size={20} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Person Identification & Biometric KYC
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Frontier AI candidate identity proofing, facial liveness verification, automated AML sanction screening, and cryptographic background checks.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
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
          <span>Verify New Candidate ID</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Verified Identity Roster</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>{verifiedCount} Verified</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>98.9% Average Biometric Confidence</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Under Review / Secondary Check</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>{underReviewCount} Pending Review</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>AML name similarity or manual sign-off</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Action Required / Docs Awaiting</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ec4899', marginTop: 4 }}>{pendingCount} Awaiting Docs</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>SMS re-intake triggered for glare/blur</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>AML & Sanction Zero-Hit Rate</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>99.98%</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Real-time OFAC, EU, UN & Interpol sync</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '8px 14px', width: '340px' }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search candidate, role, or document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {['ALL', 'VERIFIED', 'UNDER_REVIEW', 'PENDING_DOCS'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: filterStatus === status ? '#10b981' : 'var(--bg-elevated)',
                color: filterStatus === status ? '#052e16' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Person Identifications */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Candidate & ID Ref</th>
                <th style={{ padding: '14px 18px' }}>Role & Jurisdiction</th>
                <th style={{ padding: '14px 18px' }}>Government Document</th>
                <th style={{ padding: '14px 18px' }}>Biometrics & Liveness</th>
                <th style={{ padding: '14px 18px' }}>AML & Background</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isVerified = item.status === 'VERIFIED';
                const isReview = item.status === 'UNDER_REVIEW';

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Fingerprint size={14} color="#10b981" />
                        <span>{item.name}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        {item.id} · Ref {item.empId}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.role}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Globe size={11} />
                        <span>{item.country}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.docType}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>{item.docNumber}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 64, height: 6, borderRadius: 3, background: 'var(--bg-surface)', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${item.biometricScore}%`,
                              height: '100%',
                              background: item.biometricScore >= 95 ? '#10b981' : '#f59e0b',
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 700, color: item.biometricScore >= 95 ? '#10b981' : '#f59e0b', fontSize: 12 }}>
                          {item.biometricScore}%
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: item.livenessPassed ? '#10b981' : '#ec4899', marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                        {item.livenessPassed ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                        <span>{item.livenessPassed ? '3D Liveness Confirmed' : 'Liveness Check Incomplete'}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontSize: 11.5, color: item.amlSanctionCheck.includes('CLEARED') ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                        {item.amlSanctionCheck}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {item.bgVerification}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          background: isVerified
                            ? 'rgba(16, 185, 129, 0.12)'
                            : isReview
                            ? 'rgba(245, 158, 11, 0.12)'
                            : 'rgba(236, 72, 153, 0.12)',
                          color: isVerified ? '#10b981' : isReview ? '#f59e0b' : '#ec4899',
                          border: `1px solid ${isVerified ? 'rgba(16, 185, 129, 0.3)' : isReview ? 'rgba(245, 158, 11, 0.3)' : 'rgba(236, 72, 153, 0.3)'}`,
                        }}
                      >
                        {isVerified && <CheckCircle2 size={11} />}
                        {isReview && <Clock size={11} />}
                        {!isVerified && !isReview && <AlertTriangle size={11} />}
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {!isVerified && (
                          <button
                            onClick={() => handleVerify(item.id)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              background: '#10b981',
                              color: '#052e16',
                              fontSize: 11.5,
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            Approve ID
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedRecord(item)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '5px 9px',
                            borderRadius: 6,
                            background: 'var(--bg-surface)',
                            color: 'var(--text-secondary)',
                            fontSize: 11.5,
                            border: '1px solid var(--border-default)',
                            cursor: 'pointer',
                          }}
                        >
                          <Eye size={12} />
                          <span>Dossier</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Identity Dossier Modal */}
      {selectedRecord && (
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
              maxWidth: 580,
              padding: 24,
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Cryptographic Verification Dossier
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: '4px 0 0', color: 'var(--text-primary)' }}>
                  {selectedRecord.name}
                </h2>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {selectedRecord.role} · ID Ref {selectedRecord.id}
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, fontSize: 12.5 }}>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Document Type:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{selectedRecord.docType}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Document Masked Number:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2, fontFamily: 'monospace' }}>{selectedRecord.docNumber}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Biometric Liveness Match:</span>
                <div style={{ fontWeight: 700, color: '#10b981', marginTop: 2 }}>{selectedRecord.biometricScore}% (Passed 3D Depth Test)</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Fraud & AML Risk Rating:</span>
                <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: 2 }}>{selectedRecord.riskRating}</div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Sovereign Verification Audit Notes:
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {selectedRecord.notes}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                Timestamp: {selectedRecord.verifiedAt}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              {selectedRecord.status !== 'VERIFIED' && (
                <button
                  onClick={() => handleVerify(selectedRecord.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: '#10b981',
                    color: '#052e16',
                    fontWeight: 700,
                    fontSize: 12.5,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Confirm Verification & Approve
                </button>
              )}
              <button
                onClick={() => setSelectedRecord(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: 12.5,
                  border: '1px solid var(--border-default)',
                  cursor: 'pointer',
                }}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Identification Modal */}
      {showAddModal && (
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
              maxWidth: 480,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Verify New Candidate Identity
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Candidate Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jennifer Vance"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Target Position / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staff Research Scientist - Formal Methods"
                  value={newForm.role}
                  onChange={(e) => setNewForm({ ...newForm, role: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Jurisdiction</label>
                  <select
                    value={newForm.country}
                    onChange={(e) => setNewForm({ ...newForm, country: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  >
                    <option value="Sweden / EU">Sweden / EU</option>
                    <option value="Germany / EU">Germany / EU</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="India / Asia">India / Asia</option>
                    <option value="Global Sovereign">Global Sovereign</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Document Class</label>
                  <select
                    value={newForm.docType}
                    onChange={(e) => setNewForm({ ...newForm, docType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  >
                    <option value="EU Sovereign Bio-Passport">EU Sovereign Bio-Passport</option>
                    <option value="National Citizen ID">National Citizen ID</option>
                    <option value="Aadhaar / Digital ID">Aadhaar / Digital ID</option>
                    <option value="US Passport Card">US Passport Card</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Document Identification Number</label>
                <input
                  type="text"
                  placeholder="e.g. SE-992-8812"
                  value={newForm.docNumber}
                  onChange={(e) => setNewForm({ ...newForm, docNumber: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontSize: 12.5 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: 6, background: '#10b981', color: '#052e16', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 12.5 }}
                >
                  Run Biometric & AML Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonIdentificationPage;
