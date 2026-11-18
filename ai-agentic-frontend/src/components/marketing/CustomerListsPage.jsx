import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setCustomerLists,
  addCustomerList,
  removeCustomerList,
  updateListStatus
} from '../../store/marketingSlice';
import { setActiveRoute } from '../../store/navigationSlice';
import {
  List, Users, Target, Zap, CheckCircle, Cpu, Plus,
  Trash2, RefreshCw, X, Check, AlertCircle, Upload, Sparkles,
  Folder, FolderPlus, Eye, ExternalLink, Phone, Mail, MapPin, Globe, Building2
} from 'lucide-react';
import {
  listCustomerLists,
  createCustomerList,
  updateCustomerList,
  deleteCustomerList,
  importContacts,
  deleteAllContacts,
  deleteContact,
  listContacts,
  aiGenerateCustomerList,
  getCustomerListContacts,
} from '../../services/apiClient';

const STATUS_COLORS = {
  ACTIVE:   { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)',  text: '#22c55e', label: 'ACTIVE' },
  BUILDING: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', text: '#f59e0b', label: 'BUILDING' },
  PAUSED:   { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  text: '#ef4444', label: 'PAUSED' },
};

const SEG_COLORS = {
  Enterprise:   '#6366f1',
  Retention:    '#ef4444',
  'Mid-Market': '#f59e0b',
  Inbound:      '#22c55e',
};

// ─── Sub-tab constants ───────────────────────────────────────────────────────
const TABS = [
  { id: 'lists',    label: 'Customer Lists',     icon: List   },
  { id: 'contacts', label: 'Imported Contacts',  icon: Users  },
];

export const CustomerListsPage = () => {
  const dispatch = useDispatch();
  const reduxLists = useSelector(s => s.marketing.customerLists);

  // ── Tab ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('lists');

  // ── Lists state ──────────────────────────────────────────────────────────
  const [selected, setSelected]         = useState(null);
  const [loading, setLoading]           = useState(false);
  const [listContacts_, setListContacts_] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // ── Contacts state ────────────────────────────────────────────────────────
  const [contacts, setContacts]         = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  // ── Action notices ────────────────────────────────────────────────────────
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('success'); // 'success' | 'error'

  // ── Create List modal ─────────────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', contacts: 100,
    conversionRate: 15.0, segment: 'Enterprise',
    status: 'ACTIVE', aiGenerated: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── AI Generate modal ─────────────────────────────────────────────────────
  const [isAiOpen, setIsAiOpen]         = useState(false);
  const [aiPrompt, setAiPrompt]         = useState('');
  const [aiListName, setAiListName]     = useState('');
  const [aiSourceListId, setAiSourceListId] = useState('');
  const [aiLoading, setAiLoading]       = useState(false);

  // ── Import Contacts modal ─────────────────────────────────────────────────
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [csvFile, setCsvFile]           = useState(null);
  const [importing, setImporting]       = useState(false);
  const [importMode, setImportMode]     = useState('new'); // 'new' | 'existing' | 'none'
  const [importFolderName, setImportFolderName] = useState('');
  const [importTargetListId, setImportTargetListId] = useState('');
  const [deletingAll, setDeletingAll]   = useState(false);
  const [selectedContactModal, setSelectedContactModal] = useState(null);
  const csvInputRef = useRef(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showNotice = (msg, type = 'success') => {
    setNotice(msg);
    setNoticeType(type);
    setTimeout(() => setNotice(''), 5000);
  };

  // ── Lists: fetch from backend ─────────────────────────────────────────────
  const handleFetchLists = async () => {
    setLoading(true);
    try {
      const backendLists = await listCustomerLists();
      if (Array.isArray(backendLists) && backendLists.length > 0) {
        const formatted = backendLists.map(l => ({
          id: l.id,
          name: l.name,
          description: l.description,
          count: l.contacts,
          conversionRate: `${parseFloat(l.conversionRate || 0).toFixed(1)}%`,
          segment: l.segment,
          status: l.status,
          aiRecommended: l.aiGenerated,
          lastUpdated: l.updatedAt
            ? new Date(l.updatedAt).toISOString().split('T')[0]
            : 'Just now',
          industries: [l.segment, 'Technology', 'Operations'],
          criteria: `Target ICP for ${l.segment} segment.`,
        }));
        dispatch(setCustomerLists(formatted));
      }
    } catch (err) {
      console.warn('Customer lists sync notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Contacts: fetch all imported contacts ────────────────────────────────
  const handleFetchContacts = async () => {
    setContactsLoading(true);
    try {
      const data = await listContacts();
      setContacts(data);
    } catch (err) {
      showNotice(`Could not load contacts: ${err.message}`, 'error');
    } finally {
      setContactsLoading(false);
    }
  };

  useEffect(() => {
    handleFetchLists();
    handleFetchContacts();
  }, []);
  useEffect(() => {
    if (activeTab === 'contacts' && contacts.length === 0) {
      handleFetchContacts();
    }
  }, [activeTab]);

  // ── Load members when a list is selected ─────────────────────────────────
  useEffect(() => {
    if (!selected) { setListContacts_([]); return; }
    setLoadingContacts(true);
    getCustomerListContacts(selected)
      .then(c => setListContacts_(c))
      .catch(() => setListContacts_([]))
      .finally(() => setLoadingContacts(false));
  }, [selected]);

  const lists = reduxLists || [];
  const selectedList = lists.find(l => l.id === selected);
  const totalContacts = lists.reduce((s, l) => s + (parseInt(l.count, 10) || 0), 0);
  const activeLists = lists.filter(l => l.status === 'ACTIVE').length;

  // ── Create List ───────────────────────────────────────────────────────────
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      showNotice('Name and description are required.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createCustomerList({
        name: formData.name.trim(),
        description: formData.description.trim(),
        contacts: parseInt(formData.contacts, 10) || 0,
        conversionRate: parseFloat(formData.conversionRate) || 0,
        segment: formData.segment,
        status: formData.status,
        aiGenerated: formData.aiGenerated,
      });
      dispatch(addCustomerList({
        id: created.id,
        name: created.name,
        description: created.description,
        count: created.contacts,
        conversionRate: `${parseFloat(created.conversionRate || 0).toFixed(1)}%`,
        segment: created.segment,
        status: created.status,
        aiRecommended: created.aiGenerated,
        lastUpdated: 'Just now',
        industries: [created.segment, 'Enterprise AI'],
        criteria: `Directly created list for ${created.segment}.`,
      }));
      setIsCreateOpen(false);
      setFormData({ name: '', description: '', contacts: 100, conversionRate: 15.0, segment: 'Enterprise', status: 'ACTIVE', aiGenerated: true });
      showNotice(`Customer list "${created.name}" created.`);
    } catch (err) {
      showNotice(err.message || 'Failed to create customer list.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Activate List ─────────────────────────────────────────────────────────
  const handleActivateList = async (list) => {
    try {
      await updateCustomerList(list.id, {
        name: list.name,
        description: list.description,
        contacts: parseInt(list.count, 10) || 0,
        conversionRate: parseFloat(String(list.conversionRate).replace('%', '')) || 0,
        segment: list.segment,
        status: 'ACTIVE',
        aiGenerated: !!list.aiRecommended,
      });
    } catch {}
    dispatch(updateListStatus({ id: list.id, status: 'ACTIVE' }));
    showNotice(`"${list.name}" activated.`);
  };

  // ── Delete List ───────────────────────────────────────────────────────────
  const handleDeleteList = async (list) => {
    if (!window.confirm(`Delete customer list "${list.name}"? This cannot be undone.`)) return;
    try {
      await deleteCustomerList(list.id);
    } catch {}
    dispatch(removeCustomerList(list.id));
    if (selected === list.id) setSelected(null);
    showNotice(`"${list.name}" deleted.`);
  };

  const handleLaunchCampaign = (list) => {
    if (!list) return;
    localStorage.setItem('selectedCampaignListId', list.id);
    localStorage.setItem('selectedCampaignListName', list.name);
    dispatch(setActiveRoute('marketing.studio'));
  };

  // ── AI Generate ───────────────────────────────────────────────────────────
  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim() || !aiListName.trim()) {
      showNotice('Prompt and list name are required.', 'error');
      return;
    }
    setAiLoading(true);
    try {
      const created = await aiGenerateCustomerList({
        prompt: aiPrompt,
        name: aiListName,
        sourceListId: aiSourceListId || null,
      });
      dispatch(addCustomerList({
        id: created.id,
        name: created.name,
        description: created.description || `AI-curated: ${aiPrompt.substring(0, 80)}`,
        count: created.contacts || 0,
        conversionRate: `${parseFloat(created.conversionRate || 0).toFixed(1)}%`,
        segment: created.segment || 'Enterprise',
        status: created.status || 'ACTIVE',
        aiRecommended: true,
        lastUpdated: 'Just now',
        industries: [created.segment || 'Enterprise', 'AI Curated'],
        criteria: aiPrompt,
      }));
      setIsAiOpen(false);
      setAiPrompt('');
      setAiListName('');
      setAiSourceListId('');
      showNotice(`AI generated list "${created.name}" created with ${created.contacts || 0} matched contacts.`);
    } catch (err) {
      showNotice(`AI generation failed: ${err.message}`, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    setCsvFile(file);
    if (file && (!importFolderName || importFolderName.trim() === '')) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();
      setImportFolderName(cleanName || 'Imported Contacts Folder');
    }
  };

  // ── Import Contacts CSV ───────────────────────────────────────────────────
  const handleImport = async (e) => {
    e.preventDefault();
    if (!csvFile) { showNotice('Please select a CSV or TSV file.', 'error'); return; }
    if (importMode === 'new' && !importFolderName.trim()) {
      showNotice('Please enter a folder name or choose another option.', 'error');
      return;
    }
    if (importMode === 'existing' && !importTargetListId) {
      showNotice('Please select an existing folder/list to import into.', 'error');
      return;
    }

    setImporting(true);
    try {
      const folderParam = importMode === 'new' ? importFolderName.trim() : '';
      const targetParam = importMode === 'existing' ? importTargetListId : '';
      const res = await importContacts(csvFile, folderParam, targetParam);
      await Promise.all([handleFetchContacts(), handleFetchLists()]);
      setIsImportOpen(false);
      setCsvFile(null);
      setImportFolderName('');
      setImportTargetListId('');
      setImportMode('new');
      if (csvInputRef.current) csvInputRef.current.value = '';
      setActiveTab('contacts');

      const count = typeof res?.imported === 'number' ? res.imported : (Array.isArray(res) ? res.length : 0);
      const dup = res?.duplicates || 0;
      const inv = res?.invalid || 0;
      let msg = `${count} contact${count !== 1 ? 's' : ''} imported successfully`;
      if (res?.folderName) {
        msg += ` into folder "${res.folderName}"`;
      }
      msg += '.';
      if (dup > 0) msg += ` (${dup} duplicate${dup > 1 ? 's' : ''} skipped)`;
      if (inv > 0) msg += ` (${inv} invalid row${inv > 1 ? 's' : ''})`;
      if (res?.errors?.length > 0) {
        msg += ` Error on row ${res.errors[0].row}: ${res.errors[0].message}`;
      }
      showNotice(msg, inv > 0 && count === 0 ? 'error' : 'success');
    } catch (err) {
      showNotice(`Import failed: ${err.message}`, 'error');
    } finally {
      setImporting(false);
    }
  };

  // ── Delete All Imported Contacts ──────────────────────────────────────────
  const handleDeleteAllContacts = async () => {
    if (!window.confirm('Are you sure you want to delete ALL imported contacts? This will permanently delete all contacts and remove them from all customer lists.')) {
      return;
    }
    setDeletingAll(true);
    try {
      await deleteAllContacts();
      await Promise.all([handleFetchContacts(), handleFetchLists()]);
      showNotice('All imported contacts have been cleared.', 'success');
    } catch (err) {
      showNotice(`Failed to clear contacts: ${err.message}`, 'error');
    } finally {
      setDeletingAll(false);
    }
  };

  // ── Delete Single Contact ─────────────────────────────────────────────────
  const handleDeleteContact = async (contact) => {
    if (!contact?.id) return;
    if (!window.confirm(`Delete contact "${contact.email || contact.company || 'selected'}"?`)) return;
    try {
      await deleteContact(contact.id);
      setContacts(prev => prev.filter(c => c.id !== contact.id));
      showNotice(`Contact ${contact.email || ''} deleted.`);
    } catch (err) {
      showNotice(`Failed to delete contact: ${err.message}`, 'error');
    }
  };

  // ── Compose Email to Single Contact ──────────────────────────────────────
  const handleSendEmailToContact = (contact) => {
    if (!contact?.email) return;
    localStorage.setItem('selectedDirectContact', JSON.stringify({
      email: contact.email,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      company: contact.company || '',
    }));
    dispatch(setActiveRoute('marketing.studio'));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-tag">Marketing · Audience Intelligence</div>
          <h2>Target Customer Lists</h2>
          <p>
            AI-curated and enterprise customer segments — synchronized with the Spring Boot
            marketing engine at <code>/api/marketing/customer-lists</code>.
            Import CSV contacts, then generate lists using AI or create them manually.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={handleFetchLists} disabled={loading} title="Sync from backend">
            <RefreshCw size={13} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setIsImportOpen(true)} title="Import CSV contacts">
            <Upload size={13} /> Import Contacts
          </button>
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={() => setIsAiOpen(true)}
            title="Generate list from imported contacts using AI"
          >
            <Sparkles size={13} /> AI Generate
          </button>
          <button
            className="btn btn-solid btn-sm"
            style={{ background: 'var(--brand-primary, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={13} /> New List
          </button>
        </div>
      </div>

      {/* ── Notice Banner ───────────────────────────────────────────────── */}
      {notice && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, fontSize: 12.5, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8,
          background: noticeType === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${noticeType === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: noticeType === 'success' ? '#16a34a' : '#dc2626',
        }}>
          {noticeType === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
          {notice}
          <button onClick={() => setNotice('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="stats-grid cols-4" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">Total Lists</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{lists.length}</div>
          <div className="stat-desc">Segmented prospect pools</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Contacts</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{totalContacts.toLocaleString()}</div>
          <div className="stat-desc">Across all lists</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Lists</div>
          <div className="stat-value" style={{ fontSize: 22, color: '#22c55e' }}>{activeLists}</div>
          <div className="stat-desc">Currently in use</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Imported Contacts</div>
          <div className="stat-value" style={{ fontSize: 22, color: '#6366f1' }}>{contacts.length}</div>
          <div className="stat-desc">AI-selectable records</div>
        </div>
      </div>

      {/* ── Sub-Tabs ─────────────────────────────────────────────────────── */}
      <div className="sub-tab-strip" style={{ marginBottom: 20 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`sub-tab-item${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <tab.icon size={13} /> {tab.label}
            {tab.id === 'contacts' && contacts.length > 0 && (
              <span className="badge" style={{ fontSize: 10, marginLeft: 2, padding: '1px 6px' }}>{contacts.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB: CUSTOMER LISTS                                               */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'lists' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedList ? '1fr 420px' : '1fr', gap: 20 }}>
          {/* Cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, alignContent: 'start' }}>
            {lists.length === 0 && !loading && (
              <div style={{ gridColumn: '1/-1', padding: '36px 20px', textAlign: 'center', borderRadius: 10, border: '1px dashed var(--border-default)', background: 'var(--bg-hover)' }}>
                <List size={28} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>No Customer Lists Yet</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Import contacts, then use <strong>AI Generate</strong> or <strong>New List</strong> to create your first segment.
                </div>
              </div>
            )}
            {lists.map(list => {
              const sc = STATUS_COLORS[list.status] || STATUS_COLORS.BUILDING;
              const segColor = SEG_COLORS[list.segment] || '#6366f1';
              return (
                <div
                  key={list.id}
                  className="card"
                  onClick={() => setSelected(list.id === selected ? null : list.id)}
                  style={{ cursor: 'pointer', borderColor: selected === list.id ? segColor : 'var(--border-default)', transition: 'border-color 0.15s' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, borderRadius: 5, padding: '2px 7px' }}>
                          {sc.label}
                        </span>
                        {list.aiRecommended && (
                          <span className="badge" style={{ fontSize: 9, background: 'rgba(99,102,241,0.08)', color: '#6366f1', borderColor: 'rgba(99,102,241,0.25)' }}>
                            <Cpu size={8} /> AI Curated
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{list.name}</h4>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{list.description}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: segColor }}>{list.count}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Contacts</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#22c55e' }}>{list.conversionRate}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Conv. Rate</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, background: segColor + '15', color: segColor, borderRadius: 6, padding: '3px 8px' }}>{list.segment}</span>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Segment</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Updated {list.lastUpdated}</span>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      {list.status !== 'ACTIVE' && (
                        <button className="btn btn-xs btn-ghost" onClick={e => { e.stopPropagation(); handleActivateList(list); }}>
                          <CheckCircle size={10} /> Activate
                        </button>
                      )}
                      <button
                        className="btn btn-xs btn-ghost"
                        style={{ color: '#dc2626' }}
                        title="Delete list"
                        onClick={e => { e.stopPropagation(); handleDeleteList(list); }}
                      >
                        <Trash2 size={11} />
                      </button>
                      <button
                        className="btn btn-xs btn-solid"
                        style={{ background: 'var(--brand-primary, #2563eb)', color: '#fff' }}
                        title="Launch campaign with this list"
                        onClick={e => {
                          e.stopPropagation();
                          handleLaunchCampaign(list);
                        }}
                      >
                        <Target size={10} /> Campaign
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selectedList && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignSelf: 'start', position: 'sticky', top: 0 }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div className="card-title"><Users size={14} /> List Details</div>
                  <button className="btn btn-ghost btn-xs" onClick={() => setSelected(null)}>✕</button>
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{selectedList.name}</h4>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 14 }}>{selectedList.description}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {[
                    ['Contacts', selectedList.count],
                    ['Conv. Rate', selectedList.conversionRate],
                    ['Segment', selectedList.segment],
                    ['Status', selectedList.status],
                    ['Updated', selectedList.lastUpdated],
                    ['AI Curated', selectedList.aiRecommended ? 'Yes' : 'No'],
                  ].map(([label, val]) => (
                    <div key={label} style={{ padding: '8px 10px', background: 'var(--bg-hover)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* List Members */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Assigned Contacts</span>
                    <span className="badge" style={{ fontSize: 10 }}>{loadingContacts ? '…' : listContacts_.length}</span>
                  </div>
                  {loadingContacts ? (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>Loading members…</div>
                  ) : listContacts_.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '12px 0', textAlign: 'center', borderRadius: 7, border: '1px dashed var(--border-default)', background: 'var(--bg-hover)' }}>
                      No contacts assigned yet.<br />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Import CSV contacts, then use AI Generate to populate this list.</span>
                    </div>
                  ) : (
                    <div style={{ maxHeight: 180, overflowY: 'auto', borderRadius: 7, border: '1px solid var(--border-default)' }}>
                      {listContacts_.slice(0, 20).map((c, i) => (
                        <div key={c.id || i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderBottom: '1px solid var(--border-subtle)', fontSize: 12 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#6366f1', flexShrink: 0 }}>
                            {(c.firstName || c.email || '?')[0].toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.firstName || ''} {c.lastName || ''}
                              {!c.firstName && !c.lastName && (c.email || 'Unknown')}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.email} {c.company ? `· ${c.company}` : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                      {listContacts_.length > 20 && (
                        <div style={{ padding: '6px 10px', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                          +{listContacts_.length - 20} more contacts
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    className="btn btn-solid"
                    style={{ width: '100%', background: 'var(--brand-primary, #2563eb)', color: '#fff' }}
                    onClick={() => handleLaunchCampaign(selectedList)}
                  >
                    <Zap size={13} /> Launch Campaign to this List
                  </button>
                  <button className="btn btn-ghost" style={{ width: '100%', color: '#dc2626' }} onClick={() => handleDeleteList(selectedList)}>
                    <Trash2 size={13} /> Delete Customer List
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB: IMPORTED CONTACTS                                            */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'contacts' && (
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div className="card-title"><Users size={14} /> Imported Contacts</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                All tenant contacts available to AI list generation across folders.
                <span className="mono" style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-muted)' }}>GET /api/marketing/contacts</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" onClick={handleFetchContacts} disabled={contactsLoading}>
                <RefreshCw size={13} style={contactsLoading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
              </button>
              {contacts.length > 0 && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: 5 }}
                  onClick={handleDeleteAllContacts}
                  disabled={deletingAll}
                  title="Delete all imported contacts"
                >
                  <Trash2 size={13} /> {deletingAll ? 'Deleting...' : 'Delete All Contacts'}
                </button>
              )}
              <button className="btn btn-solid btn-sm" style={{ background: 'var(--brand-primary, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => setIsImportOpen(true)}>
                <Upload size={13} /> Import CSV
              </button>
            </div>
          </div>

          {contactsLoading ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading contacts…</div>
          ) : contacts.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <Upload size={30} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>No Contacts Imported Yet</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 16px', lineHeight: 1.6 }}>
                Upload a CSV/TSV directory. Full directory entities supported:<br />
                <code>Email</code> · <code>Organization / Site</code> · <code>Category</code> · <code>Type</code> · <code>Parent Organization</code> · <code>Site Role</code> · <code>Phone</code> · <code>Address</code> · <code>City</code> · <code>Postal Code</code> · <code>Region</code> · <code>Website</code> · <code>Contact Check</code> · <code>Source</code> · <code>Notes</code>.
              </div>
              <button className="btn btn-solid btn-sm" style={{ background: 'var(--brand-primary, #2563eb)', color: '#fff' }} onClick={() => setIsImportOpen(true)}>
                <Upload size={13} /> Import Contacts CSV
              </button>
            </div>
          ) : (
            <div className="table-wrap" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ whiteSpace: 'nowrap' }}>
                <thead>
                  <tr>
                    <th>Organization / Site</th>
                    <th>Email</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Parent Organization</th>
                    <th>Site Role</th>
                    <th>Phone</th>
                    <th>City / Region</th>
                    <th>Address & Postal</th>
                    <th>Website</th>
                    <th>Contact Check</th>
                    <th>Source</th>
                    <th style={{ textAlign: 'center', width: 70 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c, i) => (
                    <tr key={c.id || i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 700, color: '#6366f1', flexShrink: 0 }}>
                            {(c.company || c.firstName || c.email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: 12.5 }}>
                              {c.company || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email}
                            </span>
                            {c.parentOrganization && c.parentOrganization !== c.company && (
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                                Parent: {c.parentOrganization}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        <a href={`mailto:${c.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{c.email || '—'}</a>
                      </td>
                      <td>
                        {c.category ? (
                          <span className="badge" style={{ fontSize: 10, background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}>{c.category}</span>
                        ) : c.industry ? (
                          <span className="badge" style={{ fontSize: 10 }}>{c.industry}</span>
                        ) : '—'}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {c.type ? <span className="badge" style={{ fontSize: 10 }}>{c.type}</span> : '—'}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {c.parentOrganization || '—'}
                      </td>
                      <td style={{ fontSize: 12, fontWeight: 500 }}>
                        {c.siteRole || c.title || '—'}
                      </td>
                      <td style={{ fontSize: 12, fontFamily: 'monospace' }}>
                        {c.phone ? (
                          <a href={`tel:${c.phone}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{c.phone}</a>
                        ) : '—'}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {[c.city, c.region].filter(Boolean).join(', ') || c.country || '—'}
                      </td>
                      <td style={{ fontSize: 11.5, color: 'var(--text-secondary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }} title={`${c.address || ''} ${c.postalCode || ''}`}>
                        {[c.address, c.postalCode].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {c.website ? (
                          <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            {c.website.replace(/^https?:\/\//, '').replace(/\/$/, '')} <ExternalLink size={10} />
                          </a>
                        ) : '—'}
                      </td>
                      <td>
                        {c.contactCheck ? (
                          <span className="badge success" style={{ fontSize: 10 }}>{c.contactCheck}</span>
                        ) : '—'}
                      </td>
                      <td style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        {c.source || 'CSV Import'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                          <button
                            className="btn btn-ghost btn-xs"
                            style={{ color: '#2563eb', padding: '3px 6px' }}
                            title="Compose email to this contact"
                            onClick={() => handleSendEmailToContact(c)}
                          >
                            <Mail size={12} />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            style={{ padding: '3px 6px', color: '#6366f1' }}
                            title="View all entity details"
                            onClick={() => setSelectedContactModal(c)}
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            style={{ color: '#ef4444', padding: '3px 6px', opacity: 0.8 }}
                            title="Delete contact"
                            onClick={() => handleDeleteContact(c)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: VIEW ALL CONTACT ENTITY DETAILS                             */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {selectedContactModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16, backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedContactModal(null)}
        >
          <div
            style={{ background: 'var(--bg-elevated)', borderRadius: 14, border: '1px solid var(--border-default)', maxWidth: 600, width: '100%', padding: 24, boxShadow: '0 24px 48px rgba(0,0,0,0.22)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#6366f1' }}>
                  {(selectedContactModal.company || selectedContactModal.firstName || selectedContactModal.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                    {selectedContactModal.company || `${selectedContactModal.firstName || ''} ${selectedContactModal.lastName || ''}`.trim() || selectedContactModal.email}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {selectedContactModal.email}
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedContactModal(null)}><X size={16} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                ['Email', selectedContactModal.email],
                ['Organization / Site', selectedContactModal.company],
                ['Category', selectedContactModal.category || selectedContactModal.industry],
                ['Type', selectedContactModal.type],
                ['Parent Organization', selectedContactModal.parentOrganization],
                ['Site Role', selectedContactModal.siteRole || selectedContactModal.title],
                ['Phone', selectedContactModal.phone],
                ['City', selectedContactModal.city],
                ['Postal Code', selectedContactModal.postalCode],
                ['Region', selectedContactModal.region],
                ['Country', selectedContactModal.country],
                ['Contact Check', selectedContactModal.contactCheck],
                ['Source', selectedContactModal.source],
                ['Website', selectedContactModal.website],
                ['Revenue', selectedContactModal.annualRevenue != null ? `$${Number(selectedContactModal.annualRevenue).toLocaleString()}` : null],
                ['Status', selectedContactModal.customerStatus || 'ACTIVE'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: 7, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, wordBreak: 'break-word' }}>
                    {v ? (
                      k === 'Website' ? (
                        <a href={v.startsWith('http') ? v : `https://${v}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
                          {v}
                        </a>
                      ) : (
                        v
                      )
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedContactModal.notes && (
              <div style={{ padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: 7, border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Notes</div>
                <div style={{ fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{selectedContactModal.notes}</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedContactModal(null)}>Close</button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: '#ef4444' }}
                onClick={() => {
                  const toDel = selectedContactModal;
                  setSelectedContactModal(null);
                  handleDeleteContact(toDel);
                }}
              >
                <Trash2 size={13} /> Delete Contact
              </button>
              <button
                className="btn btn-solid btn-sm"
                style={{ background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}
                onClick={() => {
                  const target = selectedContactModal;
                  setSelectedContactModal(null);
                  handleSendEmailToContact(target);
                }}
              >
                <Mail size={13} /> Compose Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: CREATE LIST                                                */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {isCreateOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16, backdropFilter: 'blur(4px)' }}
          onClick={() => setIsCreateOpen(false)}
        >
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 14, border: '1px solid var(--border-default)', maxWidth: 500, width: '100%', padding: 24, boxShadow: '0 24px 48px rgba(0,0,0,0.22)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Create Customer List</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsCreateOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">List Name</label>
                <input className="input" type="text" placeholder="e.g. Enterprise High-Intent Buyers" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} maxLength={160} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="input" rows={3} placeholder="Describe target ICP criteria and outreach scope…" value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })} maxLength={1000} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Contacts Count</label>
                  <input className="input" type="number" min="0" value={formData.contacts}
                    onChange={e => setFormData({ ...formData, contacts: e.target.value })} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Conversion Rate (%)</label>
                  <input className="input" type="number" step="0.1" min="0" max="100" value={formData.conversionRate}
                    onChange={e => setFormData({ ...formData, conversionRate: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Segment</label>
                  <select className="input" value={formData.segment} onChange={e => setFormData({ ...formData, segment: e.target.value })}>
                    <option>Enterprise</option>
                    <option>Mid-Market</option>
                    <option>Retention</option>
                    <option>Inbound</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Status</label>
                  <select className="input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="BUILDING">BUILDING</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <input type="checkbox" id="aiGenCheck" checked={formData.aiGenerated} onChange={e => setFormData({ ...formData, aiGenerated: e.target.checked })} />
                <label htmlFor="aiGenCheck" style={{ fontSize: 12.5, cursor: 'pointer' }}>AI-Curated (from telemetry & CRM signals)</label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-solid btn-sm" style={{ background: 'var(--brand-primary, #2563eb)', color: '#fff' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating…' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: AI GENERATE                                                */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {isAiOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16, backdropFilter: 'blur(4px)' }}
          onClick={() => !aiLoading && setIsAiOpen(false)}
        >
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 14, border: '1px solid var(--border-default)', maxWidth: 540, width: '100%', padding: 24, boxShadow: '0 24px 48px rgba(0,0,0,0.22)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={16} color="#6366f1" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>AI Customer List Generator</h3>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
                  Groq selects matching records from your imported contacts — it never invents data.
                  Requires <code>GROQ_API_KEY</code> on the backend.
                </p>
              </div>
              {!aiLoading && <button className="btn btn-ghost btn-sm" onClick={() => setIsAiOpen(false)}><X size={16} /></button>}
            </div>
            <form onSubmit={handleAiGenerate}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Folder size={14} color="#6366f1" /> Source Audience / Folder
                </label>
                <select
                  className="input"
                  value={aiSourceListId}
                  onChange={e => setAiSourceListId(e.target.value)}
                  disabled={aiLoading}
                >
                  <option value="">🌐 All Imported Contacts ({contacts.length} total)</option>
                  {lists.map(l => (
                    <option key={l.id} value={l.id}>
                      📁 Folder: {l.name} ({l.count || 0} contacts)
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {aiSourceListId ? (
                    <span style={{ color: '#6366f1', fontWeight: 500 }}>
                      🎯 AI will filter and select records ONLY from folder: "<strong>{lists.find(l => l.id === aiSourceListId)?.name}</strong>"
                    </span>
                  ) : (
                    'Filter across all contacts in the database or select a specific imported folder above.'
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">List Name</label>
                <input className="input" type="text" placeholder="e.g. Canadian Technology Customers" value={aiListName}
                  onChange={e => setAiListName(e.target.value)} maxLength={160} required disabled={aiLoading} />
              </div>
              <div className="form-group">
                <label className="form-label">Selection Prompt</label>
                <textarea className="input" rows={4}
                  placeholder={'Describe your target criteria. Example:\n"Select active technology customers in Canada with annual revenue over 1,000,000"'}
                  value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} maxLength={500} required disabled={aiLoading}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Attributes used: industry, country, annualRevenue, customerStatus, churnProbability — never email or names.
                </div>
              </div>

              {contacts.length === 0 && !aiSourceListId && (
                <div style={{ padding: '10px 12px', borderRadius: 7, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 12, color: '#d97706', marginBottom: 14 }}>
                  <strong>⚠ No contacts imported.</strong> Import a CSV first so the AI has records to select from.
                </div>
              )}

              {aiLoading && (
                <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', fontSize: 12, color: '#6366f1', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={14} /> Groq AI is selecting matching contacts… this may take a few seconds.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsAiOpen(false)} disabled={aiLoading}>Cancel</button>
                <button type="submit" className="btn btn-solid btn-sm"
                  style={{ background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
                  disabled={aiLoading || (!aiSourceListId && contacts.length === 0)}
                >
                  <Sparkles size={13} /> {aiLoading ? 'Generating…' : 'Generate List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: IMPORT CONTACTS CSV                                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {isImportOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16, backdropFilter: 'blur(4px)' }}
          onClick={() => !importing && setIsImportOpen(false)}
        >
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 14, border: '1px solid var(--border-default)', maxWidth: 500, width: '100%', padding: 24, boxShadow: '0 24px 48px rgba(0,0,0,0.22)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Import Contacts CSV</h3>
              {!importing && <button className="btn btn-ghost btn-sm" onClick={() => setIsImportOpen(false)}><X size={16} /></button>}
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', marginBottom: 18, fontSize: 12, lineHeight: 1.6 }}>
              <strong>Required column:</strong> <code>Email</code><br />
              <strong>Supported directory columns:</strong> <code>Organization / Site</code>, <code>Category</code>, <code>Type</code>, <code>Parent Organization</code>, <code>Site Role</code>, <code>Phone</code>, <code>Address</code>, <code>City</code>, <code>Postal Code</code>, <code>Region</code>, <code>Website</code>, <code>Contact Check</code>, <code>Source</code>, <code>Notes</code>.
            </div>

            <form onSubmit={handleImport}>
              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Select CSV File</label>
                <div
                  style={{ padding: '20px 16px', borderRadius: 8, border: '2px dashed var(--border-default)', background: 'var(--bg-hover)', textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => csvInputRef.current?.click()}
                >
                  <Upload size={24} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                  {csvFile ? (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{csvFile.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(csvFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      Click to select a <strong>.csv</strong> or <strong>.tsv</strong> file (Excel / Directory Export)
                    </div>
                  )}
                  <input ref={csvInputRef} type="file" accept=".csv,text/csv,.tsv,text/tab-separated-values,.txt" style={{ display: 'none' }}
                    onChange={e => handleFileSelect(e.target.files?.[0] || null)} />
                </div>
              </div>

              {/* Folder / List Organization */}
              <div style={{ marginBottom: 18, padding: '12px 14px', borderRadius: 8, background: 'var(--bg-card, rgba(255,255,255,0.03))', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Folder size={14} color="#6366f1" /> Organize into Folder / Customer List
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="importMode"
                      value="new"
                      checked={importMode === 'new'}
                      onChange={() => setImportMode('new')}
                    />
                    <span style={{ fontWeight: 500 }}>Create a new Folder / Customer List</span>
                  </label>
                  {importMode === 'new' && (
                    <div style={{ marginLeft: 22, marginTop: -2, marginBottom: 4 }}>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Ontario Healthcare Directory, Canada Clinics 2026"
                        value={importFolderName}
                        onChange={e => setImportFolderName(e.target.value)}
                        required={importMode === 'new'}
                        style={{ fontSize: 12 }}
                      />
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        A new customer list folder will be created so you can later target/filter it directly in AI Generate.
                      </div>
                    </div>
                  )}

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="importMode"
                      value="existing"
                      checked={importMode === 'existing'}
                      onChange={() => setImportMode('existing')}
                      disabled={lists.length === 0}
                    />
                    <span style={{ fontWeight: 500 }}>Add to an existing Folder / List {lists.length === 0 ? '(No existing lists)' : ''}</span>
                  </label>
                  {importMode === 'existing' && (
                    <div style={{ marginLeft: 22, marginTop: -2, marginBottom: 4 }}>
                      <select
                        className="input"
                        value={importTargetListId}
                        onChange={e => setImportTargetListId(e.target.value)}
                        required={importMode === 'existing'}
                        style={{ fontSize: 12 }}
                      >
                        <option value="">-- Choose Existing Folder / List --</option>
                        {lists.map(l => (
                          <option key={l.id} value={l.id}>
                            📁 {l.name} ({l.count || 0} contacts)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="importMode"
                      value="none"
                      checked={importMode === 'none'}
                      onChange={() => setImportMode('none')}
                    />
                    <span style={{ fontWeight: 500 }}>Import to Global Pool only (no folder)</span>
                  </label>
                </div>
              </div>

              {importing && (
                <div style={{ padding: '10px 12px', borderRadius: 7, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.25)', fontSize: 12, color: '#2563eb', marginBottom: 14 }}>
                  Importing contacts… please wait.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsImportOpen(false)} disabled={importing}>Cancel</button>
                <button type="submit" className="btn btn-solid btn-sm"
                  style={{ background: 'var(--brand-primary, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
                  disabled={importing || !csvFile}
                >
                  <Upload size={13} /> {importing ? 'Importing…' : 'Import Contacts'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
