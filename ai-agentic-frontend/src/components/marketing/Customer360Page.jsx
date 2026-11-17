import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search, ArrowUpRight, Plus, RefreshCw, Activity, Sparkles, Building,
  TrendingUp, AlertTriangle, ShieldCheck, Mail, X, Check, Globe
} from 'lucide-react';
import {
  listCustomer360Accounts,
  createCustomer360Account,
  updateCustomer360Account,
  listCustomer360Signals,
  addCustomer360Signal,
  listCustomer360Offers,
  addCustomer360Offer
} from '../../services/apiClient';

export const Customer360Page = () => {
  const dispatch = useDispatch();
  const reduxCustomers = useSelector((s) => s.marketing.customers || []);

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('ALL');
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('success');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [signals, setSignals] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // New Account Form State
  const [newAccount, setNewAccount] = useState({
    name: '',
    domain: '',
    industry: 'Logistics',
    tier: 'TIER_1',
    annualContractValue: 150000,
    currency: 'USD',
    healthScore: 85,
    churnProbability: 15,
    leadScore: 80,
    customerStatus: 'ACTIVE'
  });

  // New Signal Form State
  const [newSignal, setNewSignal] = useState({
    signalType: 'USAGE',
    description: '',
    source: 'Telemetry'
  });
  const [addingSignal, setAddingSignal] = useState(false);

  // New Offer Form State
  const [newOffer, setNewOffer] = useState({
    title: '',
    rationale: '',
    offerType: 'CROSS_SELL',
    status: 'RECOMMENDED'
  });
  const [addingOffer, setAddingOffer] = useState(false);

  const showFeedback = (msg, type = 'success') => {
    setNotice(msg);
    setNoticeType(type);
    setTimeout(() => setNotice(''), 4000);
  };

  // Fetch Accounts from Backend
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await listCustomer360Accounts({
        q: search,
        tier: tier !== 'ALL' ? tier : ''
      });
      if (Array.isArray(data) && data.length > 0) {
        setAccounts(data);
      } else {
        // Fallback to redux customers formatted
        setAccounts(reduxCustomers.map(rc => ({
          id: rc.id,
          name: rc.company,
          domain: rc.domain || `${rc.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          industry: rc.industry,
          tier: rc.tier.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
          annualContractValue: parseFloat((rc.contractValue || '100000').replace(/[^0-9.]/g, '')) || 100000,
          currency: 'USD',
          healthScore: rc.healthScore,
          healthBand: rc.healthScore > 80 ? 'HEALTHY' : rc.healthScore > 60 ? 'NEEDS_ATTENTION' : 'AT_RISK',
          churnProbability: parseFloat((rc.churnRisk || '20').replace(/[^0-9.]/g, '')) || 20,
          churnBand: rc.churnRisk?.includes('HIGH') ? 'HIGH' : rc.churnRisk?.includes('MEDIUM') ? 'MEDIUM' : 'LOW',
          leadScore: rc.leadScore,
          customerStatus: 'ACTIVE',
          fallbackSignals: rc.intentSignals,
          fallbackOffer: rc.nextBestOffer,
          lastContact: rc.lastContact
        })));
      }
    } catch (err) {
      console.warn('Customer 360 fetch warning:', err.message);
      // Fallback to initial customers
      setAccounts(reduxCustomers.map(rc => ({
        id: rc.id,
        name: rc.company,
        domain: rc.domain || `${rc.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        industry: rc.industry,
        tier: rc.tier.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
        annualContractValue: parseFloat((rc.contractValue || '100000').replace(/[^0-9.]/g, '')) || 100000,
        currency: 'USD',
        healthScore: rc.healthScore,
        healthBand: rc.healthScore > 80 ? 'HEALTHY' : rc.healthScore > 60 ? 'NEEDS_ATTENTION' : 'AT_RISK',
        churnProbability: parseFloat((rc.churnRisk || '20').replace(/[^0-9.]/g, '')) || 20,
        churnBand: rc.churnRisk?.includes('HIGH') ? 'HIGH' : rc.churnRisk?.includes('MEDIUM') ? 'MEDIUM' : 'LOW',
        leadScore: rc.leadScore,
        customerStatus: 'ACTIVE',
        fallbackSignals: rc.intentSignals,
        fallbackOffer: rc.nextBestOffer,
        lastContact: rc.lastContact
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [tier]);

  // Open Full 360 Detail View
  const handleOpenDetail = async (acc) => {
    setSelectedAccount(acc);
    setLoadingDetails(true);
    try {
      if (acc.id && !acc.id.startsWith('CUST-')) {
        const [sigData, offData] = await Promise.all([
          listCustomer360Signals(acc.id).catch(() => []),
          listCustomer360Offers(acc.id).catch(() => [])
        ]);
        setSignals(sigData);
        setOffers(offData);
      } else {
        setSignals(acc.fallbackSignals ? [{ id: 'sig-1', signalType: 'USAGE', description: acc.fallbackSignals, source: 'Telemetry', observedAt: new Date().toISOString() }] : []);
        setOffers(acc.fallbackOffer ? [{ id: 'off-1', title: acc.fallbackOffer, rationale: 'Grounded on telemetry', offerType: 'CROSS_SELL', status: 'RECOMMENDED' }] : []);
      }
    } catch (err) {
      console.warn('Detail load notice:', err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Create new account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await createCustomer360Account(newAccount);
      showFeedback(`Account "${newAccount.name}" created successfully!`);
      setShowAddModal(false);
      setNewAccount({
        name: '',
        domain: '',
        industry: 'Logistics',
        tier: 'TIER_1',
        annualContractValue: 150000,
        currency: 'USD',
        healthScore: 85,
        churnProbability: 15,
        leadScore: 80,
        customerStatus: 'ACTIVE'
      });
      fetchAccounts();
    } catch (err) {
      showFeedback(`Failed to create account: ${err.message}`, 'error');
    }
  };

  // Add Signal
  const handleAddSignal = async (e) => {
    e.preventDefault();
    if (!newSignal.description.trim()) return;
    try {
      if (selectedAccount.id && !selectedAccount.id.startsWith('CUST-')) {
        const res = await addCustomer360Signal(selectedAccount.id, newSignal);
        setSignals(prev => [res, ...prev]);
      } else {
        setSignals(prev => [{ id: `sig-${Date.now()}`, ...newSignal, observedAt: new Date().toISOString() }, ...prev]);
      }
      setNewSignal({ signalType: 'USAGE', description: '', source: 'Telemetry' });
      setAddingSignal(false);
      showFeedback('Telemetry signal recorded.');
    } catch (err) {
      showFeedback(`Failed to add signal: ${err.message}`, 'error');
    }
  };

  // Add Offer
  const handleAddOffer = async (e) => {
    e.preventDefault();
    if (!newOffer.title.trim()) return;
    try {
      if (selectedAccount.id && !selectedAccount.id.startsWith('CUST-')) {
        const res = await addCustomer360Offer(selectedAccount.id, newOffer);
        setOffers(prev => [res, ...prev]);
      } else {
        setOffers(prev => [{ id: `off-${Date.now()}`, ...newOffer, createdAt: new Date().toISOString() }, ...prev]);
      }
      setNewOffer({ title: '', rationale: '', offerType: 'CROSS_SELL', status: 'RECOMMENDED' });
      setAddingOffer(false);
      showFeedback('NBO recommendation recorded.');
    } catch (err) {
      showFeedback(`Failed to add offer: ${err.message}`, 'error');
    }
  };

  const filtered = accounts.filter((c) => {
    const q = search.toLowerCase();
    const ok = (c.name || '').toLowerCase().includes(q) || (c.domain || '').toLowerCase().includes(q) || (c.industry || '').toLowerCase().includes(q);
    return ok;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-tag">Marketing · Customer 360 Profiles</div>
          <h2>Customer 360 & Account Intelligence</h2>
          <p>Unified enterprise account profiles enriched with health scores, predictive churn risk, telemetry signals, and AI next-best-offer recommendations.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={fetchAccounts}
            disabled={loading}
            title="Refresh accounts from backend"
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button
            className="btn btn-solid btn-sm"
            style={{ background: 'var(--brand-primary, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={14} /> Add Enterprise Account
          </button>
        </div>
      </div>

      {notice && (
        <div style={{
          padding: '10px 14px',
          borderRadius: 6,
          marginBottom: 16,
          fontSize: 12.5,
          fontWeight: 600,
          background: noticeType === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
          border: `1px solid ${noticeType === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
          color: noticeType === 'error' ? '#dc2626' : '#16a34a'
        }}>
          {notice}
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260, maxWidth: 460 }}>
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            className="input"
            placeholder="Search accounts by company, domain, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ margin: 0 }}
          />
        </div>
        <div className="sub-tab-strip" style={{ marginBottom: 0 }}>
          {[
            { id: 'ALL', label: 'ALL' },
            { id: 'TIER_1', label: 'Tier-1' },
            { id: 'MID_MARKET', label: 'Mid-Market' },
            { id: 'GROWTH', label: 'Growth' }
          ].map((t) => (
            <button
              key={t.id}
              className={`sub-tab-item ${tier === t.id ? 'active' : ''}`}
              onClick={() => setTier(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Accounts */}
      <div className="grid-2">
        {filtered.map((c) => (
          <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="card-header" style={{ marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {typeof c.id === 'string' && c.id.length > 12 ? c.id.substring(0, 8) + '...' : c.id}
                    </span>
                    <span className="badge" style={{ fontSize: 10.5 }}>{c.tier}</span>
                    <span className={`badge ${c.customerStatus === 'ACTIVE' ? 'success' : c.customerStatus === 'AT_RISK' ? 'warning' : ''}`} style={{ fontSize: 10 }}>
                      {c.customerStatus}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{c.name}</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {c.industry} {c.domain ? `· @${c.domain}` : ''} · <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      ${Number(c.annualContractValue || 0).toLocaleString()} {c.currency || 'USD'}/yr
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Health</div>
                  <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: (c.healthScore || 0) > 80 ? 'var(--success)' : (c.healthScore || 0) > 60 ? 'var(--warning)' : 'var(--danger)' }}>
                    {c.healthScore || 0}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div style={{ padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: 7, border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Lead Score</div>
                  <div className="mono" style={{ fontSize: 15, fontWeight: 700 }}>{c.leadScore || 0}/100</div>
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: 7, border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Churn Risk</div>
                  <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: (c.churnProbability || 0) > 50 ? 'var(--danger)' : 'inherit' }}>
                    {c.churnProbability || 0}% ({c.churnBand || 'LOW'})
                  </div>
                </div>
              </div>

              {c.fallbackOffer && (
                <div style={{ padding: '10px 12px', background: 'var(--bg-hover)', border: '1px solid var(--border-default)', borderRadius: 7, marginBottom: 12, fontSize: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>
                    <Sparkles size={11} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 4 }} />
                    Next-Best-Offer (NBO Engine)
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.fallbackOffer}</div>
                </div>
              )}

              {c.fallbackSignals && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 12 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Telemetry Signals: </strong>{c.fallbackSignals}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border-subtle)', fontSize: 11.5, color: 'var(--text-muted)' }}>
              <span>{c.lastContact ? `Last Contact: ${c.lastContact}` : (c.domain ? `@${c.domain}` : 'Enterprise Account')}</span>
              <button
                className="btn btn-ghost btn-xs"
                style={{ fontWeight: 600, color: 'var(--brand-primary, #2563eb)' }}
                onClick={() => handleOpenDetail(c)}
              >
                View Full 360 <ArrowUpRight size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── MODAL: FULL 360 DETAIL VIEW ─── */}
      {selectedAccount && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedAccount(null)}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 780,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span className="badge">{selectedAccount.tier}</span>
                  <span className={`badge ${selectedAccount.customerStatus === 'ACTIVE' ? 'success' : 'warning'}`}>
                    {selectedAccount.customerStatus}
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedAccount.name}</h2>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {selectedAccount.industry} · @{selectedAccount.domain || 'domain.com'} · ${Number(selectedAccount.annualContractValue || 0).toLocaleString()} {selectedAccount.currency}/yr
                </div>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSelectedAccount(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Metrics Ribbon */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
              <div style={{ padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Health Score</div>
                <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: selectedAccount.healthScore > 80 ? 'var(--success)' : 'var(--warning)' }}>
                  {selectedAccount.healthScore}/100
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{selectedAccount.healthBand}</div>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Churn Probability</div>
                <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: selectedAccount.churnProbability > 50 ? 'var(--danger)' : 'var(--text-primary)' }}>
                  {selectedAccount.churnProbability}%
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{selectedAccount.churnBand} RISK</div>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lead Score</div>
                <div className="mono" style={{ fontSize: 20, fontWeight: 800 }}>
                  {selectedAccount.leadScore}/100
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>MQL Qualified</div>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contract Value</div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 800 }}>
                  ${Number(selectedAccount.annualContractValue || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{selectedAccount.currency} Annual</div>
              </div>
            </div>

            {/* Telemetry Signals Section */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Activity size={14} style={{ color: 'var(--brand-primary, #2563eb)' }} /> Telemetry Signals ({signals.length})
                </h4>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setAddingSignal(!addingSignal)}
                  style={{ color: 'var(--brand-primary, #2563eb)', fontWeight: 600 }}
                >
                  <Plus size={12} /> Add Signal
                </button>
              </div>

              {addingSignal && (
                <form onSubmit={handleAddSignal} style={{ padding: 12, background: 'var(--bg-hover)', borderRadius: 8, marginBottom: 10, border: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 140px 1fr auto', gap: 8, alignItems: 'center' }}>
                    <select
                      className="input"
                      value={newSignal.signalType}
                      onChange={e => setNewSignal({ ...newSignal, signalType: e.target.value })}
                      style={{ margin: 0, fontSize: 12 }}
                    >
                      <option value="USAGE">USAGE</option>
                      <option value="ENGAGEMENT">ENGAGEMENT</option>
                      <option value="SUPPORT">SUPPORT</option>
                      <option value="DOCUMENT">DOCUMENT</option>
                    </select>
                    <input
                      className="input"
                      placeholder="Source (e.g. API)"
                      value={newSignal.source}
                      onChange={e => setNewSignal({ ...newSignal, source: e.target.value })}
                      style={{ margin: 0, fontSize: 12 }}
                    />
                    <input
                      className="input"
                      placeholder="Signal description..."
                      value={newSignal.description}
                      onChange={e => setNewSignal({ ...newSignal, description: e.target.value })}
                      style={{ margin: 0, fontSize: 12 }}
                      required
                    />
                    <button type="submit" className="btn btn-solid btn-xs" style={{ background: '#2563eb', color: '#fff' }}>Save</button>
                  </div>
                </form>
              )}

              {signals.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {signals.map((sig, i) => (
                    <div key={sig.id || i} style={{ padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: 6, fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="badge" style={{ fontSize: 9.5, marginRight: 6 }}>{sig.signalType}</span>
                        <span>{sig.description}</span>
                        {sig.source && <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>({sig.source})</span>}
                      </div>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {sig.observedAt ? new Date(sig.observedAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No telemetry signals recorded yet.</div>
              )}
            </div>

            {/* Next-Best-Offer Recommendations Section */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} style={{ color: '#8b5cf6' }} /> Next-Best-Offer Recommendations ({offers.length})
                </h4>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setAddingOffer(!addingOffer)}
                  style={{ color: '#8b5cf6', fontWeight: 600 }}
                >
                  <Plus size={12} /> Add NBO Offer
                </button>
              </div>

              {addingOffer && (
                <form onSubmit={handleAddOffer} style={{ padding: 12, background: 'var(--bg-hover)', borderRadius: 8, marginBottom: 10, border: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px auto', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <input
                      className="input"
                      placeholder="Offer Title (e.g. Process Mining Kafka Connector)"
                      value={newOffer.title}
                      onChange={e => setNewOffer({ ...newOffer, title: e.target.value })}
                      style={{ margin: 0, fontSize: 12 }}
                      required
                    />
                    <select
                      className="input"
                      value={newOffer.offerType}
                      onChange={e => setNewOffer({ ...newOffer, offerType: e.target.value })}
                      style={{ margin: 0, fontSize: 12 }}
                    >
                      <option value="CROSS_SELL">CROSS_SELL</option>
                      <option value="UPSELL">UPSELL</option>
                      <option value="RETENTION">RETENTION</option>
                    </select>
                    <select
                      className="input"
                      value={newOffer.status}
                      onChange={e => setNewOffer({ ...newOffer, status: e.target.value })}
                      style={{ margin: 0, fontSize: 12 }}
                    >
                      <option value="RECOMMENDED">RECOMMENDED</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="DECLINED">DECLINED</option>
                    </select>
                    <button type="submit" className="btn btn-solid btn-xs" style={{ background: '#8b5cf6', color: '#fff' }}>Save</button>
                  </div>
                  <input
                    className="input"
                    placeholder="Rationale / justification for this offer..."
                    value={newOffer.rationale}
                    onChange={e => setNewOffer({ ...newOffer, rationale: e.target.value })}
                    style={{ margin: 0, fontSize: 12 }}
                  />
                </form>
              )}

              {offers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {offers.map((off, i) => (
                    <div key={off.id || i} style={{ padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: 6, fontSize: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{off.title}</strong>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span className="badge" style={{ fontSize: 9.5 }}>{off.offerType}</span>
                          <span className="badge success" style={{ fontSize: 9.5 }}>{off.status}</span>
                        </div>
                      </div>
                      {off.rationale && <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{off.rationale}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No recommendations recorded yet.</div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedAccount(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE ENTERPRISE ACCOUNT ─── */}
      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 580,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Add Customer 360 Enterprise Account</h3>
              <button type="button" className="icon-btn" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Scania Logistics Nordic"
                  value={newAccount.name}
                  onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Domain (@domain.com)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. scania.com"
                    value={newAccount.domain}
                    onChange={e => setNewAccount({ ...newAccount, domain: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Industry</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Logistics & Transport"
                    value={newAccount.industry}
                    onChange={e => setNewAccount({ ...newAccount, industry: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Tier</label>
                  <select
                    className="input"
                    value={newAccount.tier}
                    onChange={e => setNewAccount({ ...newAccount, tier: e.target.value })}
                  >
                    <option value="TIER_1">Tier-1 Enterprise</option>
                    <option value="MID_MARKET">Mid-Market Enterprise</option>
                    <option value="GROWTH">Growth Account</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Annual Contract Value (USD)</label>
                  <input
                    type="number"
                    className="input"
                    value={newAccount.annualContractValue}
                    onChange={e => setNewAccount({ ...newAccount, annualContractValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Health Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="input"
                    value={newAccount.healthScore}
                    onChange={e => setNewAccount({ ...newAccount, healthScore: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="form-label">Churn Risk (0-100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="input"
                    value={newAccount.churnProbability}
                    onChange={e => setNewAccount({ ...newAccount, churnProbability: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="form-label">Lead Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="input"
                    value={newAccount.leadScore}
                    onChange={e => setNewAccount({ ...newAccount, leadScore: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-solid btn-sm" style={{ background: 'var(--brand-primary, #2563eb)', color: '#fff' }}>Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
