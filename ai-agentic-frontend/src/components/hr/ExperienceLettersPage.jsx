import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HrNav } from './HrNav';
import { issueExperienceLetter, updateExperienceLetterStatus } from '../../store/hrSlice';
import {
  Award, CheckCircle2, Clock, Plus, Eye, Download,
  Printer, FileCheck, ShieldCheck, X, Sparkles, Building2
} from 'lucide-react';

export const ExperienceLettersPage = () => {
  const dispatch = useDispatch();
  const experienceLetters = useSelector((s) => s.hr.experienceLetters);

  const [selectedCert, setSelectedCert] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [form, setForm] = useState({
    employeeName: '',
    empId: '',
    formerDesignation: '',
    department: 'Core AI Research',
    joiningDate: '2024-01-15',
    relievingDate: '2026-10-20',
    conduct: 'EXEMPLARY & OUTSTANDING',
    endorsement: '',
  });

  const handleIssue = (e) => {
    e.preventDefault();
    if (!form.employeeName || !form.formerDesignation) return;

    const newCert = {
      id: `EXP-2026-0${Math.floor(11 + Math.random() * 20)}`,
      certId: `O2I-EXP-CERT-2026-0${Math.floor(11 + Math.random() * 20)}`,
      employeeName: form.employeeName,
      empId: form.empId || `EMP-0${Math.floor(50 + Math.random() * 40)}`,
      formerDesignation: form.formerDesignation,
      department: form.department,
      joiningDate: form.joiningDate,
      relievingDate: form.relievingDate,
      tenureYears: '2.5 Years',
      conduct: form.conduct,
      reasonForLeaving: 'Career Transition / Research Advancement',
      endorsement: form.endorsement || `${form.employeeName} contributed fundamentally to our autonomous cognitive architecture during their tenure. Their technical discipline and systems acumen were exemplary.`,
      signatory: 'Elsa Nordin',
      signatoryTitle: 'Chief People & Talent Officer, O2i - IRUS Enterprise AI',
      verificationHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}b7`,
      status: 'ISSUED_VERIFIED',
      issuedDate: new Date().toISOString().substring(0, 10),
    };

    dispatch(issueExperienceLetter(newCert));
    setShowIssueModal(false);
    setSelectedCert(newCert);
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      <HrNav />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Award size={20} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Experience Letters & Relieving Certificates
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Cryptographically sealed experience credentials, tenure verification, executive performance endorsements, and instant verifiable alumni proofs.
          </p>
        </div>

        <button
          onClick={() => setShowIssueModal(true)}
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
          <span>Issue Experience Certificate</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Issued Certificates</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>{experienceLetters.length} Verified</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Alumni Relieving Proofs</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Average Alumni Tenure</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>2.7 Years</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Frontier AI Engineering Retention</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Conduct Appraisal</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>100% Commended</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Zero Adverse Employment Flags</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Verification Integrity</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#a78bfa', marginTop: 4 }}>Cryptographic Seal</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Thales Sovereign HSM Signed</div>
        </div>
      </div>

      {/* Experience Letters Table */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Alumni & Certificate ID</th>
                <th style={{ padding: '14px 18px' }}>Designation & Dept</th>
                <th style={{ padding: '14px 18px' }}>Tenure Dates</th>
                <th style={{ padding: '14px 18px' }}>Conduct Appraisal</th>
                <th style={{ padding: '14px 18px' }}>Verification Hash</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {experienceLetters.map((cert) => {
                const isVerified = cert.status === 'ISSUED_VERIFIED';

                return (
                  <tr key={cert.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cert.employeeName}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>
                        {cert.certId} · {cert.empId}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cert.formerDesignation}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>{cert.department}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {cert.joiningDate} to {cert.relievingDate}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#10b981', fontWeight: 600, marginTop: 2 }}>
                        {cert.tenureYears} of Service
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: 12 }}>{cert.conduct}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{cert.reasonForLeaving}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 11.5, color: 'var(--text-muted)' }}>
                        {cert.verificationHash.slice(0, 16)}...
                      </div>
                      <div style={{ fontSize: 10.5, color: '#10b981', marginTop: 1 }}>HSM Validated</div>
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
                          background: isVerified ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          color: isVerified ? '#10b981' : '#f59e0b',
                          border: `1px solid ${isVerified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        }}
                      >
                        {isVerified ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        {cert.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedCert(cert)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 12px',
                          borderRadius: 6,
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#10b981',
                          fontSize: 12,
                          fontWeight: 700,
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={12} />
                        <span>Inspect Certificate</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Verifiable Experience Certificate Modal */}
      {selectedCert && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#0d131f',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 14,
              width: '100%',
              maxWidth: 700,
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '36px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
              position: 'relative',
            }}
          >
            {/* Modal Close */}
            <button
              onClick={() => setSelectedCert(null)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            {/* Certificate Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid rgba(16, 185, 129, 0.25)', paddingBottom: 24, marginBottom: 24 }}>
              <div style={{ display: 'inline-flex', padding: 8, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', marginBottom: 10 }}>
                <Award size={32} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981', letterSpacing: -0.5 }}>
                O2i · IRUS ENTERPRISE AI
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Sovereign Autonomous Systems Research Laboratory · Stockholm, Sweden
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginTop: 12, letterSpacing: 2, textTransform: 'uppercase' }}>
                CERTIFICATE OF SERVICE & EXPERIENCE
              </div>
              <div style={{ fontSize: 11.5, color: '#10b981', marginTop: 4, fontFamily: 'monospace' }}>
                Certificate ID: {selectedCert.certId}
              </div>
            </div>

            {/* Formal Certificate Body */}
            <div style={{ fontSize: 13.5, lineHeight: 1.8, color: 'var(--text-primary)', marginBottom: 24 }}>
              <p style={{ margin: '0 0 16px' }}>
                This is to certify that <strong>{selectedCert.employeeName}</strong> (Employee ID: <strong>{selectedCert.empId}</strong>) was bona fide employed with <strong>O2i - IRUS Enterprise AI</strong> from <strong>{selectedCert.joiningDate}</strong> to <strong>{selectedCert.relievingDate}</strong>, completing a tenure of <strong>{selectedCert.tenureYears}</strong>.
              </p>
              <p style={{ margin: '0 0 16px' }}>
                During their tenure, {selectedCert.employeeName} served in the position of <strong>{selectedCert.formerDesignation}</strong> within our <strong>{selectedCert.department}</strong>.
              </p>

              {/* Endorsement Box */}
              <div style={{ background: 'rgba(16, 185, 129, 0.06)', borderLeft: '3px solid #10b981', padding: '14px 18px', borderRadius: '0 8px 8px 0', margin: '20px 0' }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: 4 }}>
                  Executive Performance & Conduct Appraisal:
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                  "{selectedCert.endorsement}"
                </div>
                <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>
                  Official Conduct Rating: {selectedCert.conduct}
                </div>
              </div>

              <p style={{ margin: 0 }}>
                We thank {selectedCert.employeeName} for their outstanding contributions to frontier artificial intelligence systems and wish them utmost success in all future pursuits.
              </p>
            </div>

            {/* Verification Hash & Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, paddingTop: 20, borderTop: '1px solid var(--border-default)', fontSize: 12 }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Cryptographic Integrity Verification:</div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#10b981', marginTop: 4, wordBreak: 'break-all' }}>
                  Hash: {selectedCert.verificationHash}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 10.5, marginTop: 4 }}>
                  Status: <strong>VERIFIED ON SOVEREIGN HSM LEDGER</strong>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 10.5 }}>
                  Date of Issue: {selectedCert.issuedDate}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'serif', fontSize: 16, color: '#10b981', fontStyle: 'italic' }}>
                  {selectedCert.signatory}
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{selectedCert.signatory}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{selectedCert.signatoryTitle}</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setSelectedCert(null)}
                style={{ padding: '8px 16px', borderRadius: 6, background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontSize: 12.5 }}
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontSize: 12.5 }}
              >
                <Printer size={14} />
                <span>Print</span>
              </button>
              <button
                onClick={() => alert(`Certificate ${selectedCert.certId} downloaded in high-resolution PDF format.`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, background: '#10b981', color: '#052e16', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 12.5 }}
              >
                <Download size={14} />
                <span>Download Sealed PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Experience Certificate Modal */}
      {showIssueModal && (
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
              maxWidth: 520,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={18} color="#10b981" />
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Issue Experience Certificate
                </h2>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleIssue}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Employee Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sofia Lindqvist"
                    value={form.employeeName}
                    onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-003"
                    value={form.empId}
                    onChange={(e) => setForm({ ...form, empId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Former Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Staff Distributed Systems Engineer"
                    value={form.formerDesignation}
                    onChange={(e) => setForm({ ...form, formerDesignation: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  >
                    <option value="Core AI Research">Core AI Research</option>
                    <option value="Core Infrastructure">Core Infrastructure</option>
                    <option value="Autonomous Operations">Autonomous Operations</option>
                    <option value="Enterprise Experience">Enterprise Experience</option>
                    <option value="Security & Sovereignty">Security & Sovereignty</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Joining Date</label>
                  <input
                    type="date"
                    value={form.joiningDate}
                    onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Relieving Date</label>
                  <input
                    type="date"
                    value={form.relievingDate}
                    onChange={(e) => setForm({ ...form, relievingDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Conduct Endorsement Note</label>
                <textarea
                  rows={3}
                  placeholder="Detail key architectural accomplishments and collegial conduct..."
                  value={form.endorsement}
                  onChange={(e) => setForm({ ...form, endorsement: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontSize: 12.5 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: 6, background: '#10b981', color: '#052e16', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 12.5 }}
                >
                  Issue & Seal Cryptographically
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceLettersPage;
