import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addProjectRevenue, updateRevenueStatus } from '../../store/financeSlice';
import { FinanceNav } from './FinanceNav';
import {
  TrendingUp, DollarSign, Search, Filter, Plus, CheckCircle2,
  AlertCircle, Clock, Building2, Calendar, FileText, X, Check,
  ArrowUpRight, Sparkles, ChevronRight, ShieldCheck, PieChart
} from 'lucide-react';

const STATUS_CONFIG = {
  BILLED: { label: 'FULLY BILLED', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.3)' },
  PARTIALLY_BILLED: { label: 'PARTIALLY BILLED', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)' },
  PENDING_MILESTONE: { label: 'PENDING MILESTONE', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  OVERDUE: { label: 'RECEIVABLE OVERDUE', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
};

export const RevenuesPage = () => {
  const dispatch = useDispatch();
  const revenues = useSelector((s) => s.finance.revenues || []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // New Revenue Form State
  const [newRevenue, setNewRevenue] = useState({
    projectName: '',
    client: '',
    domain: 'Automotive & Manufacturing',
    contractValue: '$5,000,000',
    arr: '$5.0M',
    mrr: '$416,666',
    billedToDate: '$1,250,000',
    receivablesDue: '$3,750,000',
    billingStatus: 'PARTIALLY_BILLED',
    grossMargin: '85.0%',
    paymentTerms: 'Net 30 Days',
    tier: 'Enterprise Platinum',
  });

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const domains = ['ALL', ...new Set(revenues.map(r => r.domain))];

  const filteredRevenues = useMemo(() => {
    return revenues.filter((r) => {
      const matchDomain = selectedDomain === 'ALL' || r.domain === selectedDomain;
      const matchStatus = selectedStatus === 'ALL' || r.billingStatus === selectedStatus;
      const matchSearch = !searchQuery ||
        r.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchDomain && matchStatus && matchSearch;
    });
  }, [revenues, selectedDomain, selectedStatus, searchQuery]);

  const totalContractVal = revenues.reduce((acc, r) => acc + parseFloat(r.contractValue?.replace(/[^0-9.]/g, '') || 0), 0);
  const totalBilled = revenues.reduce((acc, r) => acc + parseFloat(r.billedToDate?.replace(/[^0-9.]/g, '') || 0), 0);
  const totalReceivables = revenues.reduce((acc, r) => acc + parseFloat(r.receivablesDue?.replace(/[^0-9.]/g, '') || 0), 0);
  const avgGrossMargin = (revenues.reduce((acc, r) => acc + parseFloat(r.grossMargin?.replace(/[^0-9.]/g, '') || 0), 0) / (revenues.length || 1)).toFixed(1);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newRevenue.projectName || !newRevenue.client) return;

    const created = {
      id: `REV-PRJ-0${revenues.length + 1}`,
      projectName: newRevenue.projectName,
      client: newRevenue.client,
      domain: newRevenue.domain,
      contractValue: newRevenue.contractValue,
      arr: newRevenue.arr,
      mrr: newRevenue.mrr,
      billedToDate: newRevenue.billedToDate,
      receivablesDue: newRevenue.receivablesDue,
      billingStatus: newRevenue.billingStatus,
      grossMargin: newRevenue.grossMargin,
      paymentTerms: newRevenue.paymentTerms,
      contractStart: new Date().toISOString().split('T')[0],
      contractEnd: '2028-12-31',
      tier: newRevenue.tier,
      health: 'HEALTHY'
    };

    dispatch(addProjectRevenue(created));
    setIsModalOpen(false);
    showNotification(`Added new enterprise project revenue: "${created.projectName}"`);
    setNewRevenue({
      projectName: '',
      client: '',
      domain: 'Automotive & Manufacturing',
      contractValue: '$5,000,000',
      arr: '$5.0M',
      mrr: '$416,666',
      billedToDate: '$1,250,000',
      receivablesDue: '$3,750,000',
      billingStatus: 'PARTIALLY_BILLED',
      grossMargin: '85.0%',
      paymentTerms: 'Net 30 Days',
      tier: 'Enterprise Platinum',
    });
  };

  return (
    <div className="finance-revenues-page" style={{ paddingBottom: 48, maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ─── TOAST NOTIFICATION ─── */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1100,
            background: 'var(--bg-elevated)',
            border: '1px solid #f59e0b',
            borderRadius: 8,
            padding: '12px 18px',
            color: 'var(--text-primary)',
            fontSize: 13,
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Sparkles size={16} color="#f59e0b" />
          <span>{notification}</span>
        </div>
      )}

      {/* ─── FINANCE SUITE SUB-NAV ─── */}
      <FinanceNav />

      {/* ─── PAGE HEADER ─── */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
          paddingBottom: 20,
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div
            className="page-tag"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#f59e0b',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: '0.03em',
              marginBottom: 8,
            }}
          >
            <TrendingUp size={13} /> Finance · Project-Based Revenue & Contract ARR [REV-PRJ]
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', margin: '4px 0 6px 0', color: 'var(--text-primary)' }}>
            Revenues (Enterprise Projects)
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 740, lineHeight: 1.5, margin: 0 }}>
            Track multi-year enterprise project contracts, recurring milestone billing, gross margins, and outstanding receivables across active deployment accounts.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            fontWeight: 600,
            fontSize: 13,
            borderRadius: 8,
            background: '#f59e0b',
            color: '#000',
            border: 'none',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
          }}
        >
          <Plus size={16} /> Add Project Revenue
        </button>
      </div>

      {/* ─── METRIC CARDS ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 26,
        }}
      >
        <div className="card" style={{ padding: '18px 20px', borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Contract Value
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0', fontFamily: 'JetBrains Mono, monospace' }}>
            ${(totalContractVal / 1000000).toFixed(1)}M
          </div>
          <div style={{ fontSize: 12, color: '#f59e0b' }}>{revenues.length} Enterprise Client Accounts</div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Billed & Recognized YTD
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--success)', margin: '4px 0', fontFamily: 'JetBrains Mono, monospace' }}>
            ${(totalBilled / 1000000).toFixed(1)}M
          </div>
          <div style={{ fontSize: 12, color: 'var(--success)' }}>68% of Total Backlog Collected</div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Receivables Outstanding
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#22d3ee', margin: '4px 0', fontFamily: 'JetBrains Mono, monospace' }}>
            ${(totalReceivables / 1000000).toFixed(1)}M
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Average DSI: 28 Days</div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Blended Gross Margin
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#818cf8', margin: '4px 0', fontFamily: 'JetBrains Mono, monospace' }}>
            {avgGrossMargin}%
          </div>
          <div style={{ fontSize: 12, color: '#818cf8' }}>High-Margin Autonomous Software Tier</div>
        </div>
      </div>

      {/* ─── SEARCH & FILTER TOOLBAR ─── */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          marginBottom: 24,
          borderRadius: 10,
          background: 'var(--bg-surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Domain:</span>
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`btn btn-sm ${selectedDomain === dom ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: 12, borderRadius: 6 }}
            >
              {dom}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              fontSize: 12,
              padding: '6px 10px',
              borderRadius: 6,
              background: 'var(--bg-base)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="BILLED">Fully Billed</option>
            <option value="PARTIALLY_BILLED">Partially Billed</option>
            <option value="PENDING_MILESTONE">Pending Milestone</option>
          </select>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-base)',
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid var(--border-subtle)',
              minWidth: 200,
            }}
          >
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search projects or clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: 12.5,
                width: '100%',
              }}
            />
          </div>
        </div>
      </div>

      {/* ─── PROJECT REVENUES CARDS ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredRevenues.map((rev) => {
          const statusCfg = STATUS_CONFIG[rev.billingStatus] || STATUS_CONFIG.PARTIALLY_BILLED;

          return (
            <div
              key={rev.id}
              className="card"
              style={{
                padding: '20px 24px',
                borderRadius: 12,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {rev.id}
                    </span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 600 }}>
                      {rev.domain}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      • Tier: <strong>{rev.tier}</strong>
                    </span>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {rev.projectName}
                  </h3>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Enterprise Client: <strong style={{ color: 'var(--text-primary)' }}>{rev.client}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 10,
                      color: statusCfg.color,
                      background: statusCfg.bg,
                      border: `1px solid ${statusCfg.border}`,
                    }}
                  >
                    {statusCfg.label}
                  </span>

                  <select
                    value={rev.billingStatus}
                    onChange={(e) => dispatch(updateRevenueStatus({ id: rev.id, billingStatus: e.target.value }))}
                    style={{
                      fontSize: 11,
                      background: 'var(--bg-base)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 6,
                      padding: '3px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="PARTIALLY_BILLED">Partially Billed</option>
                    <option value="BILLED">Fully Billed</option>
                    <option value="PENDING_MILESTONE">Pending Milestone</option>
                  </select>
                </div>
              </div>

              {/* Financial Specs Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 12,
                  background: 'var(--bg-elevated)',
                  padding: '12px 16px',
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Contract Value</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {rev.contractValue}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Annual Run-Rate (ARR)</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>
                    {rev.arr}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Billed To Date</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--success)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {rev.billedToDate}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Receivables Due</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#22d3ee', fontFamily: 'JetBrains Mono, monospace' }}>
                    {rev.receivablesDue}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gross Margin</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#818cf8', fontFamily: 'JetBrains Mono, monospace' }}>
                    {rev.grossMargin}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Payment Terms</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {rev.paymentTerms}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>Contract Span: <strong>{rev.contractStart} through {rev.contractEnd}</strong></span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>● Enterprise SLA Compliance: 99.98%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── MODAL: ADD PROJECT REVENUE ─── */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 560, padding: 26, boxShadow: 'var(--shadow-modal)', borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Contract Invoicing
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, margin: '2px 0 4px 0' }}>Add Enterprise Project Revenue</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  Record a major client contract and recurring revenue schedule.
                </p>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)} style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pan-European Autonomous Supply Chain Brokerage"
                  value={newRevenue.projectName}
                  onChange={(e) => setNewRevenue({ ...newRevenue, projectName: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Client Entity *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deutsche Logistik Group"
                    value={newRevenue.client}
                    onChange={(e) => setNewRevenue({ ...newRevenue, client: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Operational Domain
                  </label>
                  <select
                    value={newRevenue.domain}
                    onChange={(e) => setNewRevenue({ ...newRevenue, domain: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="Automotive & Manufacturing">Automotive & Manufacturing</option>
                    <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                    <option value="Financial Services & Banking">Financial Services & Banking</option>
                    <option value="Maritime Logistics">Maritime Logistics</option>
                    <option value="Government & Defense">Government & Defense</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Total Contract Value
                  </label>
                  <input
                    type="text"
                    value={newRevenue.contractValue}
                    onChange={(e) => setNewRevenue({ ...newRevenue, contractValue: e.target.value, arr: `${e.target.value.replace(/[^0-9.]/g, '')}M` })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Projected Gross Margin
                  </label>
                  <input
                    type="text"
                    value={newRevenue.grossMargin}
                    onChange={(e) => setNewRevenue({ ...newRevenue, grossMargin: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Billed To Date
                  </label>
                  <input
                    type="text"
                    value={newRevenue.billedToDate}
                    onChange={(e) => setNewRevenue({ ...newRevenue, billedToDate: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Payment Terms
                  </label>
                  <select
                    value={newRevenue.paymentTerms}
                    onChange={(e) => setNewRevenue({ ...newRevenue, paymentTerms: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 45 Days">Net 45 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: '#f59e0b', color: '#000', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={16} /> Save Project Revenue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenuesPage;
