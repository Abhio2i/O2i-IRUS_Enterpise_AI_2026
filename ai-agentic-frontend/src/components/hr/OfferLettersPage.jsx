import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HrNav } from './HrNav';
import { createOfferLetter, updateOfferStatus } from '../../store/hrSlice';
import {
  FileSignature, CheckCircle2, Clock, Plus, Eye, Send,
  Download, Award, DollarSign, Building2, Calendar, X, Sparkles
} from 'lucide-react';

export const OfferLettersPage = () => {
  const dispatch = useDispatch();
  const offerLetters = useSelector((s) => s.hr.offerLetters);

  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    candidateName: '',
    role: '',
    department: 'Core AI Research',
    level: 'L6 - Staff Lead',
    location: 'Stockholm HQ / Hybrid Sovereign',
    baseSalary: '$260,000',
    annualBonus: '$45,000 (Target 18%)',
    equityGrant: '0.25% ESOP (4-year vest, 1-year cliff)',
    joiningDate: '2026-12-01',
    benefits: 'Dedicated 2x H100 Cloud Compute, Executive Healthcare, Sabbatical Plan',
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.candidateName || !form.role) return;

    const newOffer = {
      id: `OFF-2026-0${Math.floor(84 + Math.random() * 20)}`,
      candidateName: form.candidateName,
      role: form.role,
      department: form.department,
      level: form.level,
      location: form.location,
      baseSalary: form.baseSalary,
      annualBonus: form.annualBonus,
      equityGrant: form.equityGrant,
      joiningDate: form.joiningDate,
      validUntil: '2026-11-30',
      status: 'SENT_FOR_SIGNATURE',
      signedAt: null,
      docuSignEnvelopeId: `DS-ENV-${Math.floor(10000 + Math.random() * 90000)}-O2I`,
      benefits: form.benefits,
    };

    dispatch(createOfferLetter(newOffer));
    setShowCreateModal(false);
    setSelectedOffer(newOffer);
  };

  const handleSign = (id) => {
    dispatch(updateOfferStatus({ id, status: 'SIGNED_ACCEPTED' }));
    if (selectedOffer && selectedOffer.id === id) {
      setSelectedOffer((prev) => ({
        ...prev,
        status: 'SIGNED_ACCEPTED',
        signedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      }));
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      <HrNav />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <FileSignature size={20} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Offer Letters & Executive Compensation
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Digital offer generation, multi-component executive packages (Base + Target Bonus + ESOPs), DocuSign envelope status, and automated counter-signing.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
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
          <span>Generate Digital Offer Letter</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Offers Issued</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>{offerLetters.length} Generated</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>100% On-Track Acceptance</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Signed & Accepted</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
            {offerLetters.filter((o) => o.status === 'SIGNED_ACCEPTED').length} Signed
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Digital Sovereign eID Countersigned</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>ESOPs Pool Committed</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>0.92%</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>From 12.0% Reserved Option Pool</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Average Base Package</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#a78bfa', marginTop: 4 }}>$271,600</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Top 2% European AI Lab Compensation</div>
        </div>
      </div>

      {/* Offer Letters Table */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Candidate & Offer ID</th>
                <th style={{ padding: '14px 18px' }}>Designation & Level</th>
                <th style={{ padding: '14px 18px' }}>Compensation Package</th>
                <th style={{ padding: '14px 18px' }}>Equity / ESOPs</th>
                <th style={{ padding: '14px 18px' }}>Start Date</th>
                <th style={{ padding: '14px 18px' }}>DocuSign Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offerLetters.map((offer) => {
                const isSigned = offer.status === 'SIGNED_ACCEPTED';
                const isSent = offer.status === 'SENT_FOR_SIGNATURE';

                return (
                  <tr key={offer.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{offer.candidateName}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        {offer.id} · {offer.department}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{offer.role}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>{offer.level}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#10b981', fontSize: 13.5 }}>{offer.baseSalary}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>+ {offer.annualBonus}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#38bdf8' }}>{offer.equityGrant}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Standard 4-Yr Schedule</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} color="var(--text-muted)" />
                        <span>{offer.joiningDate}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Valid until: {offer.validUntil}</div>
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
                          background: isSigned
                            ? 'rgba(16, 185, 129, 0.12)'
                            : isSent
                            ? 'rgba(56, 189, 248, 0.15)'
                            : 'rgba(245, 158, 11, 0.12)',
                          color: isSigned ? '#10b981' : isSent ? '#38bdf8' : '#f59e0b',
                          border: `1px solid ${isSigned ? 'rgba(16, 185, 129, 0.3)' : isSent ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        }}
                      >
                        {isSigned ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        {offer.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {!isSigned && (
                          <button
                            onClick={() => handleSign(offer.id)}
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
                            Mark Accepted
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOffer(offer)}
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
                          <span>Letter</span>
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

      {/* Official Offer Letter Preview Modal */}
      {selectedOffer && (
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
              border: '1px solid var(--border-default)',
              borderRadius: 12,
              width: '100%',
              maxWidth: 680,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
              position: 'relative',
            }}
          >
            {/* Modal Close */}
            <button
              onClick={() => setSelectedOffer(null)}
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

            {/* Letterhead */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid rgba(16, 185, 129, 0.3)', paddingBottom: 20, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, color: '#10b981' }}>
                  O2i · IRUS ENTERPRISE AI
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                  Sovereign Autonomous Systems & Frontier Cognitive Research Lab
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Kungsgatan 44, 111 35 Stockholm, Sweden · Reg: SE-559281-9012
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: 11.5, color: 'var(--text-muted)' }}>
                <div>Document: <strong>{selectedOffer.id}</strong></div>
                <div>Envelope: {selectedOffer.docuSignEnvelopeId}</div>
                <div>Status: <span style={{ color: '#10b981', fontWeight: 700 }}>{selectedOffer.status}</span></div>
              </div>
            </div>

            {/* Candidate Address & Date */}
            <div style={{ marginBottom: 20, fontSize: 13, lineHeight: 1.6, color: 'var(--text-primary)' }}>
              <div><strong>Date:</strong> 26 October 2026</div>
              <div><strong>To:</strong> {selectedOffer.candidateName}</div>
              <div><strong>Position:</strong> {selectedOffer.role} ({selectedOffer.level})</div>
              <div><strong>Department:</strong> {selectedOffer.department}</div>
              <div><strong>Location:</strong> {selectedOffer.location}</div>
            </div>

            {/* Formal Body Text */}
            <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 20 }}>
              <p style={{ margin: '0 0 12px' }}>
                Dear {selectedOffer.candidateName.split(' ')[0]},
              </p>
              <p style={{ margin: '0 0 12px' }}>
                On behalf of <strong>O2i - IRUS Enterprise AI</strong>, we are delighted to formally extend this offer of appointment. Following your exceptional performance throughout our autonomous evaluation and architectural review, we believe your systems mastery will be transformative in advancing our sovereign cognitive agent ecosystem.
              </p>
            </div>

            {/* Compensation Table */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '16px', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: 10 }}>
                Annexure A: Executive Compensation & Equity Allocation
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>Annual Base Salary:</span>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{selectedOffer.baseSalary}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>Target Performance Bonus:</span>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>{selectedOffer.annualBonus}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>Equity / ESOPs Grant:</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginTop: 2 }}>{selectedOffer.equityGrant}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>Effective Commencement Date:</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{selectedOffer.joiningDate}</div>
                </div>
              </div>

              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-muted)' }}>
                <strong>Dedicated Benefits:</strong> {selectedOffer.benefits}
              </div>
            </div>

            {/* Signatures & Seal */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, paddingTop: 16, borderTop: '1px solid var(--border-default)', fontSize: 12 }}>
              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Authorized Signatory for O2i - IRUS AI:</div>
                <div style={{ fontFamily: 'serif', fontSize: 16, color: '#10b981', fontStyle: 'italic' }}>
                  Elsa Nordin
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>Elsa Nordin</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Chief People & Talent Officer</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 4 }}>
                  Digitally Encrypted via Thales Sovereign HSM
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Candidate Acceptance & Digital Sign:</div>
                {selectedOffer.status === 'SIGNED_ACCEPTED' ? (
                  <div>
                    <div style={{ fontFamily: 'serif', fontSize: 16, color: '#38bdf8', fontStyle: 'italic' }}>
                      {selectedOffer.candidateName}
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{selectedOffer.candidateName}</div>
                    <div style={{ color: '#10b981', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <CheckCircle2 size={12} />
                      <span>Countersigned: {selectedOffer.signedAt || '2026-10-25 18:45 UTC'}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSign(selectedOffer.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 6,
                      background: '#10b981',
                      color: '#052e16',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Countersign & Accept Digitally
                  </button>
                )}
              </div>
            </div>

            {/* Modal Action Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setSelectedOffer(null)}
                style={{ padding: '8px 16px', borderRadius: 6, background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontSize: 12.5 }}
              >
                Close Preview
              </button>
              <button
                onClick={() => alert(`Official Appointment Letter ${selectedOffer.id} downloaded.`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, background: '#10b981', color: '#052e16', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 12.5 }}
              >
                <Download size={14} />
                <span>Export Official Signed PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Offer Letter Modal */}
      {showCreateModal && (
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
              maxWidth: 540,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileSignature size={18} color="#10b981" />
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Generate Digital Offer Letter
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Candidate Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Aris Thorne"
                    value={form.candidateName}
                    onChange={(e) => setForm({ ...form, candidateName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Position Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Staff AI Architect"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  >
                    <option value="Core AI Research">Core AI Research</option>
                    <option value="Infrastructure & Compute">Infrastructure & Compute</option>
                    <option value="Autonomous Operations">Autonomous Operations</option>
                    <option value="Safety & Alignment">Safety & Alignment</option>
                    <option value="Enterprise Solutions">Enterprise Solutions</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Level Grade</label>
                  <input
                    type="text"
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Annual Base Salary</label>
                  <input
                    type="text"
                    value={form.baseSalary}
                    onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Annual Bonus Target</label>
                  <input
                    type="text"
                    value={form.annualBonus}
                    onChange={(e) => setForm({ ...form, annualBonus: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Equity Grant (ESOP)</label>
                  <input
                    type="text"
                    value={form.equityGrant}
                    onChange={(e) => setForm({ ...form, equityGrant: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Commencement Date</label>
                  <input
                    type="date"
                    value={form.joiningDate}
                    onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontSize: 12.5 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: 6, background: '#10b981', color: '#052e16', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 12.5 }}
                >
                  Generate & Send via DocuSign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferLettersPage;
