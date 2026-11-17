import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProposalStatus } from '../../store/marketingSlice';
import { setActiveRoute } from '../../store/navigationSlice';
import {
  listProposals,
  createProposal,
  generateAiProposal,
  updateProposal as apiUpdateProposal,
  sendProposalEmail,
  getProposalPipeline,
  uploadProposalDocument,
  downloadProposalDocument
} from '../../services/apiClient';
import {
  FileText, Send, CheckCircle, Clock, AlertTriangle, TrendingUp, DollarSign,
  Edit3, XCircle, Sparkles, Plus, Loader2, Printer, Eye, Building2, User,
  Mail, Calendar, Briefcase, Layers, ArrowRight, ShieldCheck, Check,
  UploadCloud, Paperclip, Download
} from 'lucide-react';

const STATUS_CONFIG = {
  ACTIVE:       { label: 'Active',        color: '#06b6d4',             cls: 'info' },
  DRAFT:        { label: 'Draft',         color: 'var(--text-muted)',   cls: '' },
  SENT:         { label: 'Sent',          color: '#6366f1',             cls: '' },
  UNDER_REVIEW: { label: 'Under Review',  color: '#f59e0b',             cls: 'warning' },
  NEGOTIATION:  { label: 'Negotiation',   color: '#f97316',             cls: 'warning' },
  ACCEPTED:     { label: 'Accepted',      color: '#22c55e',             cls: 'success' },
  REJECTED:     { label: 'Rejected',      color: '#ef4444',             cls: 'danger' },
};

const AVAILABLE_SERVICES = [
  'Document Intake AI',
  'Exception Queue Manager',
  'Process Mining Engine',
  'Knowledge Assistant',
  'Sentry Defense',
  'Customer 360 Intelligence',
  'ERP Modernisation & Sync'
];

export const ProposalsPage = () => {
  const dispatch = useDispatch();
  const reduxProposals = useSelector(s => s.marketing.proposals);

  const [proposals, setProposals] = useState([]);
  const [pipelineStats, setPipelineStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('ALL');

  // Generator Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [genError, setGenError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Upload Document Modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadFormData, setUploadFormData] = useState({
    clientCompany: '',
    contactName: '',
    contactEmail: '',
    industry: 'Logistics & Supply Chain',
    useCase: 'Existing enterprise proposal document intake & delivery',
    services: ['Document Intake AI', 'Exception Queue Manager'],
    budget: '50000',
    timeline: '3 months',
    status: 'ACTIVE'
  });

  // Sending email state
  const [sendingId, setSendingId] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    clientCompany: '',
    contactName: '',
    contactEmail: '',
    industry: 'Logistics & Supply Chain',
    useCase: 'Automate high-volume invoice and shipping exception handling with audit trails',
    services: ['Document Intake AI', 'Exception Queue Manager'],
    budget: '50000',
    timeline: '3 months'
  });

  // AI Generated Draft
  const [generatedDraft, setGeneratedDraft] = useState(null);

  // Initial fetch from backend
  useEffect(() => {
    fetchLiveProposals();
  }, []);

  const fetchLiveProposals = async () => {
    setLoading(true);
    try {
      const data = await listProposals();
      if (Array.isArray(data) && data.length > 0) {
        // Map backend proposals to UI structure
        const mapped = data.map(p => ({
          id: p.id,
          company: p.clientCompany,
          contactName: p.contactName,
          contactEmail: p.contactEmail,
          title: (p.content?.title) || `${p.clientCompany} AI Transformation Proposal`,
          version: 'v1.0',
          value: `$${Number(p.budget || 0).toLocaleString()}`,
          validUntil: p.followUpDate || '2026-12-31',
          status: p.status || 'DRAFT',
          sentDate: p.sentAt ? p.sentAt.split('T')[0] : null,
          products: p.services || [],
          nextAction: p.nextAction || 'Review with stakeholders',
          probability: p.winProbability || 50,
          content: p.content || {},
          raw: p
        }));
        setProposals(mapped);
      } else {
        // Fallback to redux initial items
        setProposals(reduxProposals);
      }

      // Fetch pipeline totals
      try {
        const stats = await getProposalPipeline();
        setPipelineStats(stats);
      } catch {}
    } catch (err) {
      console.warn('Backend proposals offline, using local state:', err.message);
      setProposals(reduxProposals);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (srv) => {
    setFormData(prev => {
      const exists = prev.services.includes(srv);
      return {
        ...prev,
        services: exists ? prev.services.filter(s => s !== srv) : [...prev.services, srv]
      };
    });
  };

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    setGenError('');
    setGenLoading(true);

    try {
      const payload = {
        clientCompany: formData.clientCompany.trim(),
        contactName: formData.contactName.trim(),
        contactEmail: formData.contactEmail.trim(),
        industry: formData.industry,
        useCase: formData.useCase,
        services: formData.services,
        budget: parseFloat(formData.budget) || 50000,
        timeline: formData.timeline
      };

      const result = await generateAiProposal(payload);
      setGeneratedDraft(result);
    } catch (err) {
      setGenError(err.message || 'AI proposal generation failed. Please verify Groq API key.');
    } finally {
      setGenLoading(false);
    }
  };

  const handleSaveProposal = async () => {
    setSaveLoading(true);
    setGenError('');

    try {
      const payload = {
        clientCompany: formData.clientCompany.trim(),
        contactName: formData.contactName.trim(),
        contactEmail: formData.contactEmail.trim(),
        industry: formData.industry,
        useCase: formData.useCase,
        services: formData.services,
        budget: parseFloat(formData.budget) || 50000,
        timeline: formData.timeline,
        content: generatedDraft || {}
      };

      const created = await createProposal(payload);

      setSuccessToast(`Proposal for ${formData.clientCompany} created successfully!`);
      setTimeout(() => setSuccessToast(''), 4000);

      setModalOpen(false);
      setGeneratedDraft(null);
      fetchLiveProposals();
    } catch (err) {
      setGenError(err.message || 'Failed to save proposal');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleStatusChange = async (propId, newStatus) => {
    dispatch(updateProposalStatus({ id: propId, status: newStatus }));
    setProposals(prev => prev.map(p => p.id === propId ? { ...p, status: newStatus } : p));

    try {
      await apiUpdateProposal(propId, { status: newStatus });
    } catch (err) {
      console.warn('Backend update failed:', err.message);
    }
  };

  const handleSendEmail = async (prop) => {
    setSendingId(prop.id);
    try {
      await sendProposalEmail(prop.id);
      setSuccessToast(`Proposal email sent to ${prop.contactEmail || prop.company}!`);
      setTimeout(() => setSuccessToast(''), 4000);

      handleStatusChange(prop.id, 'SENT');
      fetchLiveProposals();
    } catch (err) {
      alert(`Send failed: ${err.message}`);
    } finally {
      setSendingId(null);
    }
  };

  const handleDownloadDocument = async (prop) => {
    try {
      const filename = prop.content?.originalFilename || `${prop.company}-Proposal.pdf`;
      await downloadProposalDocument(prop.id, filename);
      setSuccessToast(`Downloaded proposal document: ${filename}`);
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  const handleUploadServiceToggle = (srv) => {
    setUploadFormData(prev => {
      const exists = prev.services.includes(srv);
      return {
        ...prev,
        services: exists ? prev.services.filter(s => s !== srv) : [...prev.services, srv]
      };
    });
  };

  const handleUploadFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadFormData.clientCompany) {
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const clean = baseName.replace(/[_-]/g, ' ').replace(/(?i)(proposal|contract|draft|final|v\d+)/g, '').trim();
        if (clean) {
          setUploadFormData(prev => ({
            ...prev,
            clientCompany: clean.charAt(0).toUpperCase() + clean.slice(1)
          }));
        }
      }
    }
  };

  const handleUploadProposalSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a proposal document (PDF, DOCX, etc.)');
      return;
    }
    if (!uploadFormData.clientCompany.trim()) {
      setUploadError('Client company name is required');
      return;
    }
    if (!uploadFormData.contactEmail.trim()) {
      setUploadError('Contact email is required for direct email dispatch');
      return;
    }

    setUploadLoading(true);
    setUploadError('');

    try {
      const data = new FormData();
      data.append('file', uploadFile);
      data.append('clientCompany', uploadFormData.clientCompany.trim());
      data.append('contactName', uploadFormData.contactName.trim() || 'Executive Decision Maker');
      data.append('contactEmail', uploadFormData.contactEmail.trim().toLowerCase());
      data.append('industry', uploadFormData.industry.trim());
      data.append('useCase', uploadFormData.useCase.trim());
      data.append('budget', uploadFormData.budget);
      data.append('timeline', uploadFormData.timeline.trim());
      data.append('status', uploadFormData.status || 'ACTIVE');
      uploadFormData.services.forEach(s => data.append('services', s));

      const created = await uploadProposalDocument(data);
      setSuccessToast(`Proposal document "${uploadFile.name}" uploaded successfully for ${uploadFormData.clientCompany} with status ${uploadFormData.status || 'ACTIVE'}!`);
      setTimeout(() => setSuccessToast(''), 4500);

      setUploadModalOpen(false);
      setUploadFile(null);
      fetchLiveProposals();
    } catch (err) {
      setUploadError(err.message || 'Failed to upload proposal document');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleOpenInEmailSender = (prop) => {
    const domain = prop.contactEmail && prop.contactEmail.includes('@')
      ? prop.contactEmail.split('@')[1]
      : (prop.company ? prop.company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com' : 'example.com');

    const execSummary = prop.content?.executiveSummary || `${prop.company} Enterprise Proposal`;
    const solution = prop.content?.solutionArchitecture || 'Modular Agentic AI Platform Integration';
    const deliverables = Array.isArray(prop.content?.scopeOfWork) && prop.content.scopeOfWork.length > 0
      ? `<ul>${prop.content.scopeOfWork.map(s => `<li>${s}</li>`).join('')}</ul>`
      : `<ul>${(prop.products || []).map(p => `<li>${p}</li>`).join('')}</ul>`;

    const terms = prop.content?.commercialTerms || `Valid until ${prop.validUntil}`;

    const attachmentNotice = prop.content?.originalFilename
      ? `<div style="padding: 10px 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; color: #166534; font-size: 13px; margin-bottom: 16px;">
          📎 <strong>Attached Official Proposal Document:</strong> ${prop.content.originalFilename} (${Math.round((prop.content.fileSize || 0) / 1024)} KB)
        </div>`
      : '';

    const emailHtml = `<p>Dear ${prop.contactName || 'Team'},</p>
<p>Thank you for discussing your operational objectives for <strong>${prop.company}</strong>. We are pleased to present our comprehensive commercial and technical proposal for your review.</p>

${attachmentNotice}

<h3>Executive Summary</h3>
<p>${execSummary}</p>

<h3>Solution Architecture & Scope</h3>
<p>${solution}</p>
<p><strong>Deliverables Included:</strong></p>
${deliverables}

<h3>Commercial Terms & Investment</h3>
<p><strong>Total Contract Value:</strong> ${prop.value}</p>
<p><strong>Proposal Validity:</strong> ${terms}</p>

<p>Please review the proposal details above. You can reply directly to this email or <a href="https://example.com/schedule"><strong>schedule a 15-minute alignment call</strong></a> with our solutions team to finalize next steps.</p>

<p>Best regards,<br/><strong>{{senderName}}</strong><br/>Agentic AI Platform</p>`;

    localStorage.setItem('selectedProposalCampaign', JSON.stringify({
      proposalId: prop.id,
      company: prop.company,
      contactEmail: prop.contactEmail,
      contactName: prop.contactName,
      domain: domain,
      subject: `Enterprise Business Proposal: ${prop.title || prop.company}`,
      campaignName: `${prop.company} Proposal Outreach`,
      bodyHtml: emailHtml,
      originalFilename: prop.content?.originalFilename
    }));

    dispatch(setActiveRoute('marketing.studio'));
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedProp = proposals.find(p => p.id === selected);
  const filtered = filter === 'ALL' ? proposals : proposals.filter(p => p.status === filter);

  const totalValue = proposals.reduce((s, p) => s + parseFloat(String(p.value).replace(/[$,]/g, '') || 0), 0);
  const weightedValue = proposals.reduce((s, p) => s + (parseFloat(String(p.value).replace(/[$,]/g, '') || 0) * ((p.probability || 50) / 100)), 0);

  return (
    <div>
      {/* Toast Notification */}
      {successToast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: '#22c55e', color: '#fff', padding: '12px 20px',
          borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600
        }}>
          <CheckCircle size={18} /> {successToast}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-title-block">
          <div className="page-tag">Marketing · Deal Intelligence</div>
          <h2>Enterprise Proposals & Deals</h2>
          <p>AI-powered proposal drafting, milestone scoping, contract value modeling, and client transmission.</p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => { setUploadModalOpen(true); setUploadError(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontSize: 13 }}
          >
            <UploadCloud size={16} color="#06b6d4" /> Upload Proposal Document
          </button>

          <button
            className="btn btn-primary"
            onClick={() => { setModalOpen(true); setGeneratedDraft(null); setGenError(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13 }}
          >
            <Sparkles size={16} /> Create AI Proposal
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid cols-4" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">Total Proposals</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{proposals.length}</div>
          <div className="stat-desc">Across all pipeline stages</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Gross Pipeline Value</div>
          <div className="stat-value" style={{ fontSize: 18 }}>
            ${(totalValue / 1000).toFixed(0)}K
          </div>
          <div className="stat-desc">Total stated contract value</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Weighted Pipeline</div>
          <div className="stat-value" style={{ fontSize: 18, color: '#22c55e' }}>
            ${(weightedValue / 1000).toFixed(0)}K
          </div>
          <div className="stat-desc">Win-probability adjusted</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Negotiations</div>
          <div className="stat-value" style={{ fontSize: 22, color: '#f97316' }}>
            {proposals.filter(p => p.status === 'NEGOTIATION').length}
          </div>
          <div className="stat-desc">Requiring prompt attention</div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedProp ? '1fr 480px' : '1fr', gap: 20 }}>
        <div>
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {['ALL', 'ACTIVE', 'DRAFT', 'SENT', 'UNDER_REVIEW', 'NEGOTIATION', 'ACCEPTED', 'REJECTED'].map(s => (
              <button
                key={s}
                className={`btn btn-xs ${filter === s ? 'btn-solid' : 'btn-ghost'}`}
                onClick={() => setFilter(s)}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Proposals List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <h4>No proposals found for this filter</h4>
                <p style={{ fontSize: 13, marginTop: 4 }}>Click <strong>"Upload Proposal Document"</strong> or <strong>"Create AI Proposal"</strong> above.</p>
              </div>
            ) : (
              filtered.map(prop => {
                const sc = STATUS_CONFIG[prop.status] || STATUS_CONFIG.DRAFT;
                return (
                  <div
                    key={prop.id}
                    className="card"
                    onClick={() => setSelected(prop.id === selected ? null : prop.id)}
                    style={{
                      cursor: 'pointer',
                      borderColor: selected === prop.id ? '#6366f1' : 'var(--border-default)',
                      transition: 'border-color 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5, flexWrap: 'wrap' }}>
                          <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                            {String(prop.id).substring(0, 13)}...
                          </span>
                          <span className={`badge ${sc.cls}`} style={{ fontSize: 10 }}>{sc.label}</span>
                          <span className="badge" style={{ fontSize: 10 }}>{prop.version}</span>
                          {prop.content?.originalFilename && (
                            <button
                              type="button"
                              className="badge"
                              onClick={(e) => { e.stopPropagation(); handleDownloadDocument(prop); }}
                              title="Download uploaded proposal document"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '2px 8px', borderRadius: 4 }}
                            >
                              <Paperclip size={10} /> {prop.content.originalFilename}
                              <Download size={10} />
                            </button>
                          )}
                          {prop.sentDate ? (
                            <span className="badge success" style={{ fontSize: 10 }}>Sent {prop.sentDate}</span>
                          ) : (
                            <span className="badge warning" style={{ fontSize: 10 }}>Not Sent Yet</span>
                          )}
                        </div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{prop.title}</h4>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {prop.company} · {prop.contactName} {prop.contactEmail && `(${prop.contactEmail})`}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
                          {prop.value}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          Valid until {prop.validUntil}
                        </div>
                      </div>
                    </div>

                    {/* Probability Bar */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Win Probability</span>
                        <span style={{ fontWeight: 700, color: prop.probability > 75 ? '#22c55e' : prop.probability > 50 ? '#f59e0b' : '#6366f1' }}>
                          {prop.probability}%
                        </span>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg-active)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${prop.probability}%`,
                          height: '100%',
                          borderRadius: 3,
                          background: prop.probability > 75 ? '#22c55e' : prop.probability > 50 ? '#f59e0b' : '#6366f1',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>

                    {/* Next Action & Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        padding: '8px 10px',
                        background: 'var(--bg-hover)',
                        borderRadius: 6,
                        fontSize: 11.5,
                        color: 'var(--text-secondary)',
                        flex: 1,
                        lineHeight: 1.4,
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Next: </span>
                        {prop.nextAction}
                      </div>

                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button
                          className="btn btn-xs btn-primary"
                          title="Open in Email Sender"
                          onClick={e => { e.stopPropagation(); handleOpenInEmailSender(prop); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Mail size={11} /> Email Sender
                        </button>

                        {prop.status !== 'ACCEPTED' && prop.status !== 'REJECTED' && (
                          <>
                            <button
                              className="btn btn-xs btn-ghost"
                              onClick={e => { e.stopPropagation(); handleStatusChange(prop.id, 'ACCEPTED'); }}
                            >
                              <CheckCircle size={11} /> Accept
                            </button>
                            <button
                              className="btn btn-xs btn-danger"
                              onClick={e => { e.stopPropagation(); handleStatusChange(prop.id, 'REJECTED'); }}
                            >
                              <XCircle size={11} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Proposal Detail Panel */}
        {selectedProp && (
          <div className="card" style={{ alignSelf: 'start', position: 'sticky', top: 20, maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} /> Proposal Dossier
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-xs" onClick={handlePrint} title="Print / Download PDF">
                  <Printer size={13} />
                </button>
                <button className="btn btn-ghost btn-xs" onClick={() => setSelected(null)}>✕</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
              {/* Header Box */}
              <div style={{ padding: '12px 14px', background: 'var(--bg-hover)', borderRadius: 7, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{selectedProp.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                  {selectedProp.company} · {selectedProp.contactName}
                </div>
                {selectedProp.contactEmail && (
                  <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>
                    ✉ {selectedProp.contactEmail}
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Contract Value', selectedProp.value],
                  ['Version', selectedProp.version],
                  ['Sent Date', selectedProp.sentDate || 'Not Sent Yet'],
                  ['Valid Until', selectedProp.validUntil],
                  ['Win Probability', `${selectedProp.probability}%`],
                  ['Current Status', selectedProp.status.replace('_', ' ')],
                ].map(([label, val]) => (
                  <div key={label} style={{ padding: '8px 10px', background: 'var(--bg-hover)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Attached Official Proposal File (if uploaded) */}
              {selectedProp.content?.originalFilename && (
                <div style={{
                  padding: '10px 12px',
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: 7,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, overflow: 'hidden' }}>
                    <Paperclip size={14} color="#06b6d4" style={{ flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {selectedProp.content.originalFilename}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                        {selectedProp.content.fileSize ? `${Math.round(selectedProp.content.fileSize / 1024)} KB · ` : ''}Original Proposal Document
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-xs btn-secondary"
                    onClick={() => handleDownloadDocument(selectedProp)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
                  >
                    <Download size={11} /> Download
                  </button>
                </div>
              )}

              {/* Email Delivery Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                  onClick={() => handleOpenInEmailSender(selectedProp)}
                >
                  <Mail size={14} /> Open in Email Sender (Direct Dispatch)
                </button>

                <button
                  className="btn btn-ghost btn-xs"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}
                  disabled={sendingId === selectedProp.id}
                  onClick={() => handleSendEmail(selectedProp)}
                >
                  {sendingId === selectedProp.id ? <Loader2 size={12} className="spin" /> : <Send size={12} />}
                  Direct Quick Send to {selectedProp.contactEmail || 'Client'}
                  {selectedProp.content?.originalFilename && <span style={{ opacity: 0.7 }}>(+ Attached Doc)</span>}
                </button>
              </div>

              {/* Products Included */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                  Services & Modules
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {(selectedProp.products || []).map(p => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '5px 8px', background: 'var(--bg-hover)', borderRadius: 5 }}>
                      <CheckCircle size={12} color="#22c55e" /> {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Structured Content Sections (if available) */}
              {selectedProp.content?.executiveSummary && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                    Executive Summary
                  </div>
                  <div style={{ padding: 10, background: 'var(--bg-hover)', borderRadius: 6, fontSize: 12, lineHeight: 1.5, border: '1px solid var(--border-subtle)' }}>
                    {selectedProp.content.executiveSummary}
                  </div>
                </div>
              )}

              {selectedProp.content?.solutionArchitecture && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                    Solution Architecture
                  </div>
                  <div style={{ padding: 10, background: 'var(--bg-hover)', borderRadius: 6, fontSize: 12, lineHeight: 1.5, border: '1px solid var(--border-subtle)' }}>
                    {selectedProp.content.solutionArchitecture}
                  </div>
                </div>
              )}

              {/* Milestones list */}
              {Array.isArray(selectedProp.content?.milestones) && selectedProp.content.milestones.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    Implementation Milestones
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedProp.content.milestones.map((m, idx) => (
                      <div key={idx} style={{ padding: '8px 10px', background: 'var(--bg-hover)', borderRadius: 6, border: '1px solid var(--border-subtle)', fontSize: 12 }}>
                        <div style={{ fontWeight: 700, color: '#6366f1' }}>{m.phase} ({m.duration})</div>
                        {Array.isArray(m.deliverables) && (
                          <ul style={{ margin: '4px 0 0 16px', padding: 0, color: 'var(--text-secondary)' }}>
                            {m.deliverables.map((d, dIdx) => <li key={dIdx}>{d}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Selector */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                  Update Deal Status
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['ACTIVE', 'DRAFT', 'SENT', 'UNDER_REVIEW', 'NEGOTIATION', 'ACCEPTED', 'REJECTED'].map(s => (
                    <button
                      key={s}
                      className={`btn btn-xs ${selectedProp.status === s ? 'btn-solid' : 'btn-ghost'}`}
                      onClick={() => handleStatusChange(selectedProp.id, s)}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Proposal Generator Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', zIndex: 10000,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: 20
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: 760, maxHeight: '90vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            overflow: 'hidden', padding: 0
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border-default)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="#6366f1" />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>AI Enterprise Proposal Generator</h3>
              </div>
              <button className="btn btn-ghost btn-xs" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
              {genError && (
                <div style={{
                  padding: '10px 14px', background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid #ef4444', borderRadius: 6, color: '#ef4444',
                  fontSize: 12, marginBottom: 16
                }}>
                  {genError}
                </div>
              )}

              {/* Step 1: Input Form */}
              <form onSubmit={handleGenerateAI}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Client Company Name *
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Northwind Logistics"
                      required
                      value={formData.clientCompany}
                      onChange={e => setFormData({ ...formData, clientCompany: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Contact Person Name *
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Alex Kim"
                      required
                      value={formData.contactName}
                      onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      className="input"
                      placeholder="e.g. alex@example.com"
                      required
                      value={formData.contactEmail}
                      onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Industry *
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Logistics, Healthcare, Automotive"
                      required
                      value={formData.industry}
                      onChange={e => setFormData({ ...formData, industry: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Client Business Problem / Use Case *
                  </label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Describe their operational pain points and goals..."
                    required
                    value={formData.useCase}
                    onChange={e => setFormData({ ...formData, useCase: e.target.value })}
                  />
                </div>

                {/* Service Selection */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    Included Enterprise Solutions
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {AVAILABLE_SERVICES.map(srv => {
                      const selected = formData.services.includes(srv);
                      return (
                        <div
                          key={srv}
                          onClick={() => handleServiceToggle(srv)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: selected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-hover)',
                            border: `1px solid ${selected ? '#6366f1' : 'var(--border-subtle)'}`,
                            color: selected ? '#6366f1' : 'var(--text-secondary)',
                            fontWeight: selected ? 600 : 400
                          }}
                        >
                          {selected ? <Check size={12} /> : null} {srv}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Budget & Timeline */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Contract Value ($ USD) *
                    </label>
                    <input
                      type="number"
                      className="input"
                      placeholder="50000"
                      min="1"
                      required
                      value={formData.budget}
                      onChange={e => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Project Timeline *
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 3 months, 6 months"
                      required
                      value={formData.timeline}
                      onChange={e => setFormData({ ...formData, timeline: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={genLoading}
                  style={{ width: '100%', padding: '10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                >
                  {genLoading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                  {genLoading ? 'Groq AI is Generating Proposal...' : 'Generate Proposal with AI'}
                </button>
              </form>

              {/* Step 2: AI Generated Preview */}
              {generatedDraft && (
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <CheckCircle size={16} color="#22c55e" />
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>AI Generated Proposal Draft</h4>
                  </div>

                  {/* Executive Summary */}
                  {generatedDraft.executiveSummary && (
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        Executive Summary
                      </label>
                      <textarea
                        className="input"
                        rows={3}
                        value={generatedDraft.executiveSummary}
                        onChange={e => setGeneratedDraft({ ...generatedDraft, executiveSummary: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Solution Architecture */}
                  {generatedDraft.solutionArchitecture && (
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        Solution Architecture
                      </label>
                      <textarea
                        className="input"
                        rows={2}
                        value={generatedDraft.solutionArchitecture}
                        onChange={e => setGeneratedDraft({ ...generatedDraft, solutionArchitecture: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Commercial Terms */}
                  {generatedDraft.commercialTerms && (
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        Commercial Terms & Validity
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={generatedDraft.commercialTerms}
                        onChange={e => setGeneratedDraft({ ...generatedDraft, commercialTerms: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Save Draft Action */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={saveLoading}
                      onClick={handleSaveProposal}
                      style={{ flex: 1, padding: '10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                    >
                      {saveLoading ? <Loader2 size={16} className="spin" /> : <CheckCircle size={16} />}
                      Save Proposal to Pipeline
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setGeneratedDraft(null)}
                    >
                      Clear Draft
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Existing Proposal Document Modal */}
      {uploadModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', zIndex: 10000,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: 20
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: 700, maxHeight: '92vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            overflow: 'hidden', padding: 0
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border-default)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UploadCloud size={18} color="#06b6d4" />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Upload Existing Proposal Document</h3>
              </div>
              <button className="btn btn-ghost btn-xs" onClick={() => setUploadModalOpen(false)}>✕</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 20, overflowY: 'auto' }}>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 16, marginTop: 0 }}>
                Upload an existing formal RFP or client proposal document (PDF, Word, Text). The platform extracts its text using Apache Tika, registers it with an <strong>ACTIVE</strong> deal status, attaches the file, and enables instant direct email dispatch.
              </p>

              {uploadError && (
                <div style={{
                  padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 6,
                  color: '#ef4444', fontSize: 12.5, marginBottom: 14,
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <AlertTriangle size={14} /> {uploadError}
                </div>
              )}

              <form onSubmit={handleUploadProposalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* File Upload Box */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                    Proposal Document File (PDF, DOCX, TXT) *
                  </label>
                  <div style={{
                    padding: 16, border: '2px dashed var(--border-default)',
                    borderRadius: 8, textAlign: 'center', background: 'var(--bg-hover)',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="file"
                      id="proposalFileInput"
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xlsx,.csv"
                      onChange={handleUploadFileSelect}
                    />
                    <label htmlFor="proposalFileInput" style={{ cursor: 'pointer', display: 'block' }}>
                      <UploadCloud size={28} color="#06b6d4" style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {uploadFile ? uploadFile.name : 'Click to select or drop proposal document'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        {uploadFile ? `${Math.round(uploadFile.size / 1024)} KB · Ready to ingest` : 'Supports PDF, Word (.docx), Plain Text (up to 20 MB)'}
                      </div>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                      Client Company Name *
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Maersk Global Logistics"
                      value={uploadFormData.clientCompany}
                      onChange={e => setUploadFormData({ ...uploadFormData, clientCompany: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                      Initial Deal Status (Industry Standard) *
                    </label>
                    <select
                      className="input"
                      value={uploadFormData.status}
                      onChange={e => setUploadFormData({ ...uploadFormData, status: e.target.value })}
                    >
                      <option value="ACTIVE">ACTIVE (Active in Pipeline / Ready)</option>
                      <option value="DRAFT">DRAFT (Drafting & Internal Review)</option>
                      <option value="UNDER_REVIEW">UNDER REVIEW (Client Evaluation)</option>
                      <option value="NEGOTIATION">NEGOTIATION (Terms & Pricing)</option>
                      <option value="SENT">SENT (Transmitted to Client)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                      Recipient Contact Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Sarah Jenkins (VP Operations)"
                      value={uploadFormData.contactName}
                      onChange={e => setUploadFormData({ ...uploadFormData, contactName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                      Recipient Contact Email (For Direct Email Send) *
                    </label>
                    <input
                      type="email"
                      className="input"
                      placeholder="e.g. s.jenkins@maersk.com"
                      value={uploadFormData.contactEmail}
                      onChange={e => setUploadFormData({ ...uploadFormData, contactEmail: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                      Stated Contract Value ($ USD)
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={uploadFormData.budget}
                      onChange={e => setUploadFormData({ ...uploadFormData, budget: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                      Proposed Delivery Timeline
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={uploadFormData.timeline}
                      onChange={e => setUploadFormData({ ...uploadFormData, timeline: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                    Industry / Vertical
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={uploadFormData.industry}
                    onChange={e => setUploadFormData({ ...uploadFormData, industry: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                    Services / Products Covered
                  </label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {AVAILABLE_SERVICES.map(srv => {
                      const sel = uploadFormData.services.includes(srv);
                      return (
                        <button
                          key={srv}
                          type="button"
                          className={`btn btn-xs ${sel ? 'btn-solid' : 'btn-ghost'}`}
                          onClick={() => handleUploadServiceToggle(srv)}
                        >
                          {sel ? '✓ ' : '+ '}{srv}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploadLoading || !uploadFile}
                    style={{ flex: 1, padding: '10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                  >
                    {uploadLoading ? <Loader2 size={16} className="spin" /> : <UploadCloud size={16} />}
                    {uploadLoading ? 'Uploading & Extracting Document...' : 'Upload & Add to Active Proposals'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setUploadModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
