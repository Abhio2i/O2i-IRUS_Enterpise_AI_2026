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
  downloadProposalDocument,
  extractProposalDocument,
  deleteProposal
} from '../../services/apiClient';
import {
  FileText, Send, CheckCircle, Clock, AlertTriangle, TrendingUp, DollarSign,
  Edit3, XCircle, Sparkles, Plus, Loader2, Printer, Eye, Building2, User,
  Mail, Calendar, Briefcase, Layers, ArrowRight, ShieldCheck, Check,
  UploadCloud, Paperclip, Download, Hash, Play, Tag, Zap, CheckCircle2, Trash2
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
  const authUser = useSelector(s => s.auth.user);

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
  const [extracting, setExtracting] = useState(false);
  const [extractedMeta, setExtractedMeta] = useState(null);
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    clientCompany: '',
    tenderId: '',
    startDate: '',
    endDate: '',
    projectStartDate: '',
    demonstrationDate: '',
    price: '50000',
    duration: '3 Months',
    requirements: '',
    uploadedBy: authUser?.displayName || authUser?.name || authUser?.email || '',
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
          validUntil: p.content?.endDate || p.followUpDate || '2026-12-31',
          status: p.status || 'DRAFT',
          sentDate: p.sentAt ? p.sentAt.split('T')[0] : null,
          products: p.services || [],
          nextAction: p.nextAction || 'Review with stakeholders',
          probability: p.winProbability || 50,
          tenderId: p.content?.tenderId || '',
          startDate: p.content?.startDate || '',
          endDate: p.content?.endDate || '',
          projectStartDate: p.content?.projectStartDate || '',
          demonstrationDate: p.content?.demonstrationDate || '',
          duration: p.content?.duration || p.timeline || '',
          requirements: p.content?.requirements || p.useCase || '',
          uploadedBy: p.content?.uploadedBy || '',
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

  const handleDeleteProposal = async (prop) => {
    if (!window.confirm(`Are you sure you want to delete "${prop.title}"?`)) return;
    try {
      await deleteProposal(prop.id);
      setProposals(prev => prev.filter(p => p.id !== prop.id));
      if (selected === prop.id) setSelected(null);
      setSuccessToast(`Deleted proposal "${prop.title}"`);
      setTimeout(() => setSuccessToast(''), 3500);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
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

  const handleUploadFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setUploadError('');
    setExtracting(true);
    setExtractedMeta(null);

    try {
      const extracted = await extractProposalDocument(file);
      setExtractedMeta(extracted);

      const cleanPrice = extracted.price != null
        ? String(extracted.price).replace(/[^0-9.]/g, '')
        : '';

      setUploadFormData(prev => ({
        ...prev,
        name: extracted.name || file.name.replace(/\.[^/.]+$/, ''),
        clientCompany: extracted.clientCompany || file.name.replace(/\.[^/.]+$/, ''),
        tenderId: extracted.tenderId || '',
        startDate: extracted.startDate || '',
        endDate: extracted.endDate || '',
        projectStartDate: extracted.projectStartDate || '',
        demonstrationDate: extracted.demonstrationDate || '',
        price: cleanPrice || '50000',
        budget: cleanPrice || '50000',
        duration: extracted.duration || '3 Months',
        timeline: extracted.duration || '3 Months',
        requirements: extracted.requirements || '',
        useCase: extracted.requirements || 'Enterprise solution delivery',
        industry: extracted.industry || 'Technology & Enterprise Solutions',
        contactName: extracted.contactName || 'Executive Decision Maker',
        contactEmail: extracted.contactEmail || '',
        services: Array.isArray(extracted.services) && extracted.services.length > 0
          ? extracted.services
          : prev.services,
      }));
    } catch (err) {
      console.warn('AI Extraction failed, falling back to manual entry:', err.message);
      setUploadError('AI Extraction note: ' + (err.message || 'Could not auto-read file. You can enter or edit details below.'));
    } finally {
      setExtracting(false);
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
      data.append('name', uploadFormData.name.trim() || `${uploadFormData.clientCompany.trim()} Proposal`);
      data.append('clientCompany', uploadFormData.clientCompany.trim());
      data.append('tenderId', uploadFormData.tenderId.trim());
      data.append('startDate', uploadFormData.startDate.trim());
      data.append('endDate', uploadFormData.endDate.trim());
      data.append('projectStartDate', uploadFormData.projectStartDate.trim());
      data.append('demonstrationDate', uploadFormData.demonstrationDate.trim());
      data.append('duration', uploadFormData.duration.trim() || uploadFormData.timeline.trim());
      data.append('requirements', uploadFormData.requirements.trim() || uploadFormData.useCase.trim());
      data.append('uploadedBy', uploadFormData.uploadedBy.trim() || authUser?.displayName || authUser?.email || 'Team Member');
      data.append('contactName', uploadFormData.contactName.trim() || 'Executive Decision Maker');
      data.append('contactEmail', uploadFormData.contactEmail.trim().toLowerCase());
      data.append('industry', uploadFormData.industry.trim());
      data.append('useCase', uploadFormData.requirements.trim() || uploadFormData.useCase.trim());
      data.append('budget', uploadFormData.price || uploadFormData.budget || '50000');
      data.append('timeline', uploadFormData.duration.trim() || uploadFormData.timeline.trim());
      data.append('status', uploadFormData.status || 'ACTIVE');
      uploadFormData.services.forEach(s => data.append('services', s));

      const created = await uploadProposalDocument(data);
      setSuccessToast(`Proposal document "${uploadFile.name}" with Tender ID "${uploadFormData.tenderId || 'N/A'}" created successfully for ${uploadFormData.clientCompany}!`);
      setTimeout(() => setSuccessToast(''), 4500);

      setUploadModalOpen(false);
      setUploadFile(null);
      setExtractedMeta(null);
      fetchLiveProposals();
    } catch (err) {
      setUploadError(err.message || 'Failed to upload proposal document');
    } finally {
      setUploadLoading(false);
    }
  };

  const buildProposalDraftData = (prop) => {
    if (!prop) return null;
    const company = prop.company || prop.clientCompany || 'Client Partner';
    const contactName = prop.contactName || '';
    const contactEmail = prop.contactEmail || '';
    const domain = contactEmail && contactEmail.includes('@')
      ? contactEmail.split('@')[1]
      : (company ? company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com' : 'example.com');

    const title = prop.title || `${company} AI Transformation & Enterprise Proposal`;
    const val = prop.value || (prop.budget ? `$${Number(prop.budget).toLocaleString()}` : '$75,000');
    const validUntil = prop.validUntil || prop.followUpDate || '2026-12-31';
    const status = prop.status || 'ACTIVE';

    const execSummary = prop.content?.executiveSummary || `Comprehensive enterprise artificial intelligence and automation strategy engineered specifically for ${company}. Designed to optimize workflows, eliminate process exceptions, and drive measurable ROI across operational units.`;
    const solution = prop.content?.solutionArchitecture || 'Modular Agentic AI Architecture with Autonomous Workflow Executors, Real-Time Decision Engines, and Enterprise Security Boundaries.';
    
    const rawScope = prop.content?.scopeOfWork || prop.products || prop.services || [];
    const deliverables = Array.isArray(rawScope) && rawScope.length > 0
      ? rawScope
      : ['Autonomous Multi-Agent Workflow Engine', 'Predictive Anomaly Detection & Exception Management', 'Enterprise Knowledge Graph & LLM Orchestration', '24/7 SLA & Dedicated Solutions Architecture Support'];

    const deliverablesHtml = `<ul style="margin: 8px 0; padding-left: 20px; color: #334155; line-height: 1.6;">${deliverables.map(d => `<li style="margin-bottom: 4px;"><strong>${d}</strong></li>`).join('')}</ul>`;
    const terms = prop.content?.commercialTerms || `Valid through ${validUntil} · Standard Enterprise Net-30 Payment Terms`;

    const attachmentNotice = prop.content?.originalFilename
      ? `<div style="padding: 12px 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; color: #065f46; font-size: 13px; margin: 16px 0; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">📎</span>
          <div>
            <strong>Attached Official Proposal Document:</strong> ${prop.content.originalFilename} 
            <span style="opacity: 0.85;">(${Math.round((prop.content.fileSize || 0) / 1024)} KB)</span>
            <div style="font-size: 11.5px; opacity: 0.9; margin-top: 2px;">The complete verified technical &amp; commercial specification is attached to this transmission.</div>
          </div>
        </div>`
      : '';

    const emailHtml = `<p>Dear ${contactName ? contactName.split(' ')[0] : 'Team'},</p>

<p>Thank you for discussing your strategic technology and operational objectives for <strong>${company}</strong>. We are pleased to present our customized commercial and technical proposal for your review.</p>

${attachmentNotice}

<div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 14px 18px; margin: 18px 0; border-radius: 0 8px 8px 0;">
  <h4 style="margin: 0 0 6px 0; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Executive Overview</h4>
  <p style="margin: 0; color: #475569; font-size: 13.5px; line-height: 1.6;">${execSummary}</p>
</div>

<h4 style="color: #1e293b; font-size: 14px; margin-top: 18px; margin-bottom: 6px;">Proposed Solution Architecture:</h4>
<p style="color: #475569; font-size: 13.5px; margin-top: 0; margin-bottom: 12px; line-height: 1.5;">${solution}</p>

<div style="margin-bottom: 16px;">
  <strong style="color: #1e293b; font-size: 13px;">Key Modules &amp; Deliverables Included:</strong>
  ${deliverablesHtml}
</div>

<div style="background: #f1f5f9; padding: 14px 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
    <tr>
      <td style="padding: 6px 0; color: #64748b;"><strong>Total Investment:</strong></td>
      <td style="padding: 6px 0; font-weight: 800; color: #0f172a; text-align: right; font-family: monospace; font-size: 16px;">${val}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; color: #64748b;"><strong>Proposal Status:</strong></td>
      <td style="padding: 6px 0; font-weight: 700; color: #16a34a; text-align: right;">${status}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; color: #64748b;"><strong>Validity &amp; Terms:</strong></td>
      <td style="padding: 6px 0; color: #334155; text-align: right;">${terms}</td>
    </tr>
  </table>
</div>

<p>Please review the proposal details above. You can reply directly to this email or <a href="https://example.com/schedule" style="color: #2563eb; font-weight: 600; text-decoration: underline;"><strong>schedule a 15-minute alignment call</strong></a> with our solutions engineering team to confirm next steps and implementation dates.</p>

<p style="margin-top: 24px;">Warm regards,<br/><strong>{{senderName}}</strong><br/><span style="color: #64748b; font-size: 12px;">Agentic AI Platform · Solutions Architecture</span></p>`;

    return {
      proposalId: prop.id,
      company,
      contactEmail,
      contactName,
      domain,
      value: val,
      status,
      title,
      subject: `Enterprise Proposal: ${title} | ${company}`,
      campaignName: `${company} Proposal Outreach`,
      bodyHtml: emailHtml,
      originalFilename: prop.content?.originalFilename || null,
      fileSize: prop.content?.fileSize || null,
      timestamp: Date.now()
    };
  };

  const handleSelectProposal = (prop) => {
    if (selected === prop.id) {
      setSelected(null);
      localStorage.removeItem('activeSelectedProposal');
    } else {
      setSelected(prop.id);
      const draft = buildProposalDraftData(prop);
      localStorage.setItem('activeSelectedProposal', JSON.stringify(draft));
    }
  };

  const handleOpenInEmailSender = (prop) => {
    const draft = buildProposalDraftData(prop);
    localStorage.setItem('selectedProposalCampaign', JSON.stringify(draft));
    localStorage.setItem('activeSelectedProposal', JSON.stringify(draft));
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
                    onClick={() => handleSelectProposal(prop)}
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
                          {prop.tenderId && (
                            <span className="badge info" style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <Hash size={10} /> {prop.tenderId}
                            </span>
                          )}
                          {prop.duration && (
                            <span className="badge" style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <Clock size={10} /> {prop.duration}
                            </span>
                          )}
                          {prop.demonstrationDate && (
                            <span className="badge warning" style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <Play size={10} /> Demo: {prop.demonstrationDate}
                            </span>
                          )}
                          {prop.uploadedBy && (
                            <span className="badge" style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <User size={10} /> By: {prop.uploadedBy}
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{prop.title}</h4>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {prop.company} · {prop.contactName} {prop.contactEmail && `(${prop.contactEmail})`}
                        </div>
                        {prop.projectStartDate && (
                          <div style={{ fontSize: 11, color: '#22c55e', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={11} /> Project Start: {prop.projectStartDate} {prop.endDate && `· Submission Deadline: ${prop.endDate}`}
                          </div>
                        )}
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
                        <button
                          className="btn btn-xs btn-ghost"
                          title="Delete Proposal"
                          onClick={e => { e.stopPropagation(); handleDeleteProposal(prop); }}
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={11} /> Delete
                        </button>
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
                <button className="btn btn-ghost btn-xs" onClick={() => handleDeleteProposal(selectedProp)} title="Delete Proposal" style={{ color: '#ef4444' }}>
                  <Trash2 size={13} />
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

              {/* Procurement & Tender Specifications (Extracted by AI) */}
              {(selectedProp.tenderId || selectedProp.demonstrationDate || selectedProp.projectStartDate || selectedProp.duration) && (
                <div style={{ padding: '12px 14px', background: 'rgba(99, 102, 241, 0.06)', borderRadius: 7, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Hash size={13} /> Tender & Procurement Specifications
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11.5 }}>
                    {selectedProp.tenderId && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Tender ID: </span>
                        <strong style={{ color: 'var(--text-primary)' }}>{selectedProp.tenderId}</strong>
                      </div>
                    )}
                    {selectedProp.duration && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Duration: </span>
                        <strong style={{ color: 'var(--text-primary)' }}>{selectedProp.duration}</strong>
                      </div>
                    )}
                    {selectedProp.demonstrationDate && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Demo Date: </span>
                        <strong style={{ color: '#f59e0b' }}>{selectedProp.demonstrationDate}</strong>
                      </div>
                    )}
                    {selectedProp.projectStartDate && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Project Start: </span>
                        <strong style={{ color: '#22c55e' }}>{selectedProp.projectStartDate}</strong>
                      </div>
                    )}
                    {selectedProp.startDate && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Submission Start: </span>
                        <span>{selectedProp.startDate}</span>
                      </div>
                    )}
                    {selectedProp.endDate && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Submission Deadline: </span>
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>{selectedProp.endDate}</span>
                      </div>
                    )}
                    {selectedProp.uploadedBy && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Uploaded By: </span>
                        <strong style={{ color: '#06b6d4' }}>{selectedProp.uploadedBy}</strong>
                      </div>
                    )}
                  </div>
                  {selectedProp.requirements && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(99, 102, 241, 0.15)', fontSize: 11.5, color: 'var(--text-secondary)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Scope & Requirements: </span>
                      {selectedProp.requirements}
                    </div>
                  )}
                </div>
              )}

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
                  <Mail size={14} /> Open in Email Sender (Auto-Draft Email)
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={20} color="#06b6d4" />
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>AI Proposal & Tender Auto-Extraction Studio</h3>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Upload RFP / tender document — AI reads and auto-fills dates, tender ID, price, duration & requirements
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost btn-xs" onClick={() => setUploadModalOpen(false)}>✕</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 20, overflowY: 'auto' }}>
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

              {/* File Upload Box */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <UploadCloud size={14} color="#06b6d4" />
                  Select Proposal Document (PDF, Word DOCX, TXT) *
                </label>
                <div style={{
                  padding: '20px 16px', border: '2px dashed rgba(6, 182, 212, 0.4)',
                  borderRadius: 8, textAlign: 'center', background: 'var(--bg-hover)',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}>
                  <input
                    type="file"
                    id="proposalFileInput"
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xlsx,.csv"
                    onChange={handleUploadFileSelect}
                  />
                  <label htmlFor="proposalFileInput" style={{ cursor: 'pointer', display: 'block' }}>
                    <UploadCloud size={32} color="#06b6d4" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>
                      {uploadFile ? uploadFile.name : 'Click to select or drag & drop proposal / tender document'}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                      {uploadFile
                        ? `${Math.round(uploadFile.size / 1024)} KB · Auto-extraction initialized`
                        : 'Supports PDF, Word (.docx), Plain Text, Excel — AI will auto-read and pre-fill all fields'}
                    </div>
                  </label>
                </div>
              </div>

              {/* AI Scanning Status Indicator */}
              {extracting && (
                <div style={{
                  padding: '14px 18px',
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(99, 102, 241, 0.15))',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  borderRadius: 8,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <Loader2 size={22} className="spin" color="#06b6d4" />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>
                      ✨ AI Reading & Extracting Proposal Parameters...
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                      Analyzing document text with Apache Tika & Groq Neural NLP to auto-fill tender ID, start & deadline dates, demo date, budget, duration and scope.
                    </div>
                  </div>
                </div>
              )}

              {/* AI Extraction Success Notification Banner */}
              {extractedMeta && !extracting && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  borderRadius: 8,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={18} color="#22c55e" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#22c55e', fontSize: 12.5 }}>
                        ✨ AI Auto-Filled All Proposal Requirements ({extractedMeta.confidenceScore || 95}% Extraction Match)
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                        Tender ID: <strong>{uploadFormData.tenderId || 'Extracted'}</strong> · Deadline: <strong>{uploadFormData.endDate || 'Extracted'}</strong> · Budget: <strong>${Number(uploadFormData.price || uploadFormData.budget || 0).toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                  <span className="badge success" style={{ fontSize: 10 }}>Auto-Populated</span>
                </div>
              )}

              <form onSubmit={handleUploadProposalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Row 1: Project Name & Tender ID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <FileText size={12} color="#06b6d4" /> Project / Tender Name *
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Enterprise Cloud AI & Automation System"
                      value={uploadFormData.name}
                      onChange={e => setUploadFormData({ ...uploadFormData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <Hash size={12} color="#6366f1" /> Tender ID / RFP Ref No.
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. GEM/2026/B/9012 or RFP-2026-01"
                      value={uploadFormData.tenderId}
                      onChange={e => setUploadFormData({ ...uploadFormData, tenderId: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row 2: Client Company & Deal Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <Building2 size={12} color="#06b6d4" /> Client Organization / Department *
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
                      Proposal / Deal Status
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

                {/* Row 3: Submission Start Date & Submission End Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <Calendar size={12} color="#06b6d4" /> Proposal / Tender Start Date
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 2026-11-20 or Release Date"
                      value={uploadFormData.startDate}
                      onChange={e => setUploadFormData({ ...uploadFormData, startDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <Clock size={12} color="#ef4444" /> Submission End Date (Deadline)
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 2026-12-15 or Due Date"
                      value={uploadFormData.endDate}
                      onChange={e => setUploadFormData({ ...uploadFormData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row 4: Demonstration Date & Project Start Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <Play size={12} color="#f59e0b" /> Demonstration / Presentation Date
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 2026-12-05 or Technical Pitch Date"
                      value={uploadFormData.demonstrationDate}
                      onChange={e => setUploadFormData({ ...uploadFormData, demonstrationDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <CheckCircle size={12} color="#22c55e" /> Expected Project Start Date
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 2027-01-01 or Commencement Date"
                      value={uploadFormData.projectStartDate}
                      onChange={e => setUploadFormData({ ...uploadFormData, projectStartDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row 5: Price & Duration */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <DollarSign size={12} color="#22c55e" /> Estimated Price / Contract Budget ($ USD)
                    </label>
                    <input
                      type="number"
                      className="input"
                      placeholder="e.g. 50000"
                      value={uploadFormData.price}
                      onChange={e => setUploadFormData({ ...uploadFormData, price: e.target.value, budget: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <Clock size={12} color="#6366f1" /> Duration of Project
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 6 Months, 1 Year, 180 Days"
                      value={uploadFormData.duration}
                      onChange={e => setUploadFormData({ ...uploadFormData, duration: e.target.value, timeline: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row 6: Contact Name & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <User size={12} color="#06b6d4" /> Nodal Officer / Contact Name
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
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <Mail size={12} color="#06b6d4" /> Recipient Contact Email (For Send) *
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

                {/* Row 7: Extracted Requirements & Deliverables */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <Briefcase size={12} color="#06b6d4" /> Extracted Requirements & Scope of Work
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="AI will summarize technical specifications, deliverables, and requirements from the document here..."
                    value={uploadFormData.requirements}
                    onChange={e => setUploadFormData({ ...uploadFormData, requirements: e.target.value, useCase: e.target.value })}
                    style={{ resize: 'vertical', fontSize: 12 }}
                  />
                </div>

                {/* Row 8: Uploaded By & Industry */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <User size={12} color="#22c55e" /> Uploaded By (Your Name) *
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Hemant Kumar"
                      value={uploadFormData.uploadedBy}
                      onChange={e => setUploadFormData({ ...uploadFormData, uploadedBy: e.target.value })}
                      required
                    />
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
                </div>

                {/* Row 9: Services / Products Covered */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                    Identified Services / Technology Modules
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

                {/* Submit Actions */}
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploadLoading || !uploadFile}
                    style={{ flex: 1, padding: '11px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                  >
                    {uploadLoading ? <Loader2 size={16} className="spin" /> : <UploadCloud size={16} />}
                    {uploadLoading ? 'Uploading & Saving Proposal...' : 'Upload & Add to Active Proposals'}
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
 