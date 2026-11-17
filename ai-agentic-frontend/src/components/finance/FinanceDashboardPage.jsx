import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveRoute } from '../../store/navigationSlice';
import { FinanceNav } from './FinanceNav';
import {
  Coins, TrendingUp, DollarSign, Wallet, ArrowUpRight, ArrowDownRight,
  ShieldCheck, AlertCircle, Calendar, Users, Cpu, Building2, Receipt,
  Scale, LineChart, Plus, Download, Sparkles, CheckCircle2, ChevronRight,
  BarChart3, PieChart, Activity
} from 'lucide-react';

export const FinanceDashboardPage = () => {
  const dispatch = useDispatch();
  const summary = useSelector((s) => s.finance.summary);
  const revenues = useSelector((s) => s.finance.revenues || []);
  const expenses = useSelector((s) => s.finance.expenses || []);
  const taxes = useSelector((s) => s.finance.taxes || {});
  const projections = useSelector((s) => s.finance.projections || {});

  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Group expenses into the 3 user-specified buckets
  const fixedExpenses = expenses.filter(e => e.category === 'FIXED_COSTS');
  const humanExpenses = expenses.filter(e => e.category === 'HUMAN_CAPITAL');
  const hardwareExpenses = expenses.filter(e => e.category === 'EQUIPMENT_HARDWARE');

  const calcAnnualSum = (list) =>
    list.reduce((acc, item) => acc + parseFloat(item.annualCost?.replace(/[^0-9.]/g, '') || 0), 0);

  const fixedSum = calcAnnualSum(fixedExpenses);
  const humanSum = calcAnnualSum(humanExpenses);
  const hardwareSum = calcAnnualSum(hardwareExpenses);
  const totalExpenseSum = fixedSum + humanSum + hardwareSum;

  const totalContractVal = revenues.reduce((acc, r) => acc + parseFloat(r.contractValue?.replace(/[^0-9.]/g, '') || 0), 0);
  const totalBilled = revenues.reduce((acc, r) => acc + parseFloat(r.billedToDate?.replace(/[^0-9.]/g, '') || 0), 0);
  const totalReceivables = revenues.reduce((acc, r) => acc + parseFloat(r.receivablesDue?.replace(/[^0-9.]/g, '') || 0), 0);

  return (
    <div className="finance-dashboard-page" style={{ paddingBottom: 48, maxWidth: 1400, margin: '0 auto' }}>
      
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
            <Coins size={13} /> Finance · Pillar 5 · Enterprise Capital & Settlement Command
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', margin: '4px 0 6px 0', color: 'var(--text-primary)' }}>
            Financial Overview & Single Dashboard
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 740, lineHeight: 1.5, margin: 0 }}>
            Real-time financial telemetry covering enterprise project revenues, categorized expenditures (Fixed + Human Capital + Equipment), tax liabilities, and runway projections.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => showNotification('Generating cryptographic audit statement and general ledger export...')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600 }}
          >
            <Download size={14} /> Export Financial Ledger
          </button>

          <button
            className="btn btn-primary"
            onClick={() => dispatch(setActiveRoute('finance.revenues'))}
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
            <TrendingUp size={16} /> Manage Revenues
          </button>
        </div>
      </div>

      {/* ─── 5 EXECUTIVE METRIC CARDS ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 26,
        }}
      >
        {/* Card 1: ARR */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 12,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Annual Recurring Revenue
            </span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            {summary.arr}
          </div>
          <div style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <ArrowUpRight size={13} /> {summary.mrr} Monthly Run Rate (+42% YoY)
          </div>
        </div>

        {/* Card 2: Cash Reserves & Runway */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            background: 'linear-gradient(145deg, rgba(34, 197, 94, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            borderRadius: 12,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Runway & Cash Reserves
            </span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
              <Wallet size={16} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            {summary.runwayMonths} Months
          </div>
          <div style={{ fontSize: 12, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckCircle2 size={13} /> {summary.cashBalance} in Tier-1 Nordic Banks
          </div>
        </div>

        {/* Card 3: Margins */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 12,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Gross & Operating Margin
            </span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <PieChart size={16} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            {summary.grossMargin}
          </div>
          <div style={{ fontSize: 12, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Activity size={13} /> {summary.ebitdaMargin} EBITDA Margin
          </div>
        </div>

        {/* Card 4: Net Monthly Burn */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            background: 'linear-gradient(145deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: 12,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Net Operating Burn
            </span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
              <Receipt size={16} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4, fontFamily: 'JetBrains Mono, monospace' }}>
            {summary.netBurnRate}
          </div>
          <div style={{ fontSize: 12, color: '#22d3ee', display: 'flex', alignItems: 'center', gap: 5 }}>
            <ArrowDownRight size={13} /> -18% YoY Burn Compression
          </div>
        </div>

        {/* Card 5: Tax Liabilities */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: 12,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Net Tax Payable
            </span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <Scale size={16} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4, fontFamily: 'JetBrains Mono, monospace' }}>
            {taxes.netTaxLiabilityPayable}
          </div>
          <div style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Sparkles size={13} /> {taxes.rdTaxCreditOffset} R&D Credit Applied
          </div>
        </div>
      </div>

      {/* ─── SECTION 1: REVENUES VS EXPENSES SPLIT VIEW ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20, marginBottom: 24 }}>
        
        {/* Left: Project Revenues Snapshot */}
        <div className="card" style={{ padding: 22, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Enterprise Portfolio
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '2px 0 0 0' }}>Revenues by Project</h3>
            </div>

            <button
              className="btn btn-sm btn-ghost"
              onClick={() => dispatch(setActiveRoute('finance.revenues'))}
              style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              View All ({revenues.length}) <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {revenues.slice(0, 4).map((rev) => (
              <div
                key={rev.id}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {rev.projectName}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Client: <strong>{rev.client}</strong> • {rev.domain}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>
                    {rev.arr}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--success)' }}>
                    {rev.grossMargin} Margin
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
            <span>Total Contract Backlog: <strong style={{ color: 'var(--text-primary)' }}>${(totalContractVal / 1000000).toFixed(1)}M</strong></span>
            <span>Billed: <strong style={{ color: 'var(--success)' }}>${(totalBilled / 1000000).toFixed(1)}M</strong></span>
            <span>Receivables Due: <strong style={{ color: 'var(--warning)' }}>${(totalReceivables / 1000000).toFixed(1)}M</strong></span>
          </div>
        </div>

        {/* Right: Categorized Expenses (Fixed + Talent + Hardware) */}
        <div className="card" style={{ padding: 22, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Cost Architecture
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '2px 0 0 0' }}>Expenses Breakdown (3 Core Buckets)</h3>
            </div>

            <button
              className="btn btn-sm btn-ghost"
              onClick={() => dispatch(setActiveRoute('finance.expenses'))}
              style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Full Breakdown <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
            {/* Fixed Costs */}
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: 8,
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <Building2 size={18} color="#06b6d4" style={{ margin: '0 auto 6px auto' }} />
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Fixed Costs</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#06b6d4', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                ${(fixedSum / 1000000).toFixed(1)}M / yr
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>
                {Math.round((fixedSum / totalExpenseSum) * 100)}% of OPEX
              </div>
            </div>

            {/* Human Capital */}
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 8,
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <Users size={18} color="#818cf8" style={{ margin: '0 auto 6px auto' }} />
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Human Capital</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#818cf8', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                ${(humanSum / 1000000).toFixed(1)}M / yr
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>
                {Math.round((humanSum / totalExpenseSum) * 100)}% of OPEX
              </div>
            </div>

            {/* Hardware & Equipment */}
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                borderRadius: 8,
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <Cpu size={18} color="#4ade80" style={{ margin: '0 auto 6px auto' }} />
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Hardware & Compute</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#4ade80', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                ${(hardwareSum / 1000000).toFixed(1)}M / yr
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>
                {Math.round((hardwareSum / totalExpenseSum) * 100)}% of OPEX
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-base)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
              Top Expenditure Line Items:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Core AI & Engineering Staff (38 Eng)</span>
                <strong style={{ color: 'var(--text-primary)' }}>$6.48M / yr</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>NVIDIA H100 Supercluster Rigs (128 GPUs)</span>
                <strong style={{ color: 'var(--text-primary)' }}>$3.12M / yr</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Stockholm Sovereign Tier-IV Colocation Facility</span>
                <strong style={{ color: 'var(--text-primary)' }}>$1.74M / yr</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: TAXES & FINANCIAL PROJECTION SIMULATION ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>
        
        {/* Left: Taxes & Compliance */}
        <div className="card" style={{ padding: 22, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Fiscal Compliance
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '2px 0 0 0' }}>Corporate Taxes & European VAT</h3>
            </div>

            <button
              className="btn btn-sm btn-ghost"
              onClick={() => dispatch(setActiveRoute('finance.taxes'))}
              style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Tax Center <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Nordic Statutory Tax Rate</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{taxes.corporateTaxRate}</div>
              <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 2 }}>Effective: {taxes.effectiveTaxRate} (w/ R&D Credits)</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>EU Cross-Border VAT (OSS)</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)' }}>100% Reconciled</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>VIES Automated Registry Sync</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              Upcoming Statutory Filing Obligations:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {taxes.statutoryCalendar && taxes.statutoryCalendar.slice(0, 2).map((taxItem) => (
                <div
                  key={taxItem.id}
                  style={{
                    background: 'var(--bg-base)',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{taxItem.obligation}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Due {taxItem.dueDate} • {taxItem.authority}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>{taxItem.amount}</div>
                    <span style={{ fontSize: 10, color: 'var(--warning)', fontWeight: 600 }}>{taxItem.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Multi-Year Projection Simulation Snapshot */}
        <div className="card" style={{ padding: 22, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Long-Term Horizon
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '2px 0 0 0' }}>Financial Projections & Scenarios</h3>
            </div>

            <button
              className="btn btn-sm btn-ghost"
              onClick={() => dispatch(setActiveRoute('finance.planning'))}
              style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Interactive Planner <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Active Financial Scenario:</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              {projections.scenarios && projections.scenarios[projections.activeScenario]?.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              {projections.scenarios && projections.scenarios[projections.activeScenario]?.description}
            </div>
          </div>

          {/* Forecast Data Snapshot Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '6px 8px' }}>Year</th>
                  <th style={{ padding: '6px 8px' }}>ARR Target</th>
                  <th style={{ padding: '6px 8px' }}>COGS</th>
                  <th style={{ padding: '6px 8px' }}>EBITDA</th>
                  <th style={{ padding: '6px 8px' }}>Cash Flow</th>
                </tr>
              </thead>
              <tbody>
                {projections.scenarios && projections.scenarios[projections.activeScenario]?.dataPoints.map((row) => (
                  <tr key={row.year} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.year}</td>
                    <td style={{ padding: '8px', fontWeight: 700, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>{row.arr}</td>
                    <td style={{ padding: '8px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>{row.cogs}</td>
                    <td style={{ padding: '8px', color: 'var(--success)', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{row.ebitda}</td>
                    <td style={{ padding: '8px', color: '#22d3ee', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{row.cashFlow}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboardPage;
