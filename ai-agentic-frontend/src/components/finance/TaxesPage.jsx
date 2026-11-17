import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fileTaxReturn, applyRdTaxCreditBonus } from '../../store/financeSlice';
import { FinanceNav } from './FinanceNav';
import {
  Scale, ShieldCheck, CheckCircle2, AlertCircle, Clock, DollarSign,
  Calendar, FileText, Check, ArrowRight, Sparkles, Building2,
  TrendingDown, Percent, Info, Sliders, ExternalLink
} from 'lucide-react';

export const TaxesPage = () => {
  const dispatch = useDispatch();
  const taxes = useSelector((s) => s.finance.taxes || {});

  const [notification, setNotification] = useState(null);
  const [rdSimulatorValue, setRdSimulatorValue] = useState(603200);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleFile = (obligation) => {
    dispatch(fileTaxReturn({ obligationId: obligation.id }));
    showNotification(`Recorded payment and filed statutory obligation: "${obligation.obligation}"`);
  };

  const handleApplySimulatedCredit = () => {
    dispatch(applyRdTaxCreditBonus({ bonusAmount: rdSimulatorValue.toLocaleString() }));
    showNotification(`Updated sovereign R&D tax credit offset to -$${rdSimulatorValue.toLocaleString()}`);
  };

  return (
    <div className="finance-taxes-page" style={{ paddingBottom: 48, maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ─── TOAST NOTIFICATION ─── */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1100,
            background: 'var(--bg-elevated)',
            border: '1px solid #c084fc',
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
          <Sparkles size={16} color="#c084fc" />
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
              background: 'rgba(168, 85, 247, 0.1)',
              color: '#c084fc',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: '0.03em',
              marginBottom: 8,
            }}
          >
            <Scale size={13} /> Finance · Fiscal & Statutory Tax Compliance [FIN-TAX]
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', margin: '4px 0 6px 0', color: 'var(--text-primary)' }}>
            Corporate Taxes & Fiscal Compliance
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 740, lineHeight: 1.5, margin: 0 }}>
            Automated statutory tax provisions, European Cross-Border VAT reconciliation (OSS), Sovereign R&D tax credit optimization, and audit-ready fiscal reporting.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => showNotification('Synchronizing with European Commission VIES VAT Validation API...')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600 }}
        >
          <ShieldCheck size={14} color="var(--success)" /> Sync VIES Registry
        </button>
      </div>

      {/* ─── TAX METRIC CARDS ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 16,
          marginBottom: 26,
        }}
      >
        {/* Statutory Rate */}
        <div className="card" style={{ padding: '18px 20px', borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Statutory Corporate Rate
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0', fontFamily: 'JetBrains Mono, monospace' }}>
            {taxes.corporateTaxRate}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nordic Tax Jurisdiction Base</div>
        </div>

        {/* Effective Rate */}
        <div className="card" style={{ padding: '18px 20px', borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Effective Tax Rate
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--success)', margin: '4px 0', fontFamily: 'JetBrains Mono, monospace' }}>
            {taxes.effectiveTaxRate}
          </div>
          <div style={{ fontSize: 12, color: 'var(--success)' }}>-5.8% Reduced via Tech Credits</div>
        </div>

        {/* Gross Tax Provision */}
        <div className="card" style={{ padding: '18px 20px', borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Gross Tax Provision YTD
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0', fontFamily: 'JetBrains Mono, monospace' }}>
            {taxes.totalTaxProvisionYtd}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Taxable Income: {taxes.grossTaxableIncomeYtd}</div>
        </div>

        {/* R&D Credit Offset */}
        <div className="card" style={{ padding: '18px 20px', borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Sovereign R&D Tax Credit
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#c084fc', margin: '4px 0', fontFamily: 'JetBrains Mono, monospace' }}>
            {taxes.rdTaxCreditOffset}
          </div>
          <div style={{ fontSize: 12, color: '#c084fc' }}>Vinnova & EU Horizon Innovation Offset</div>
        </div>

        {/* Net Tax Payable */}
        <div className="card" style={{ padding: '18px 20px', borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Net Tax Liability Payable
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#f59e0b', margin: '4px 0', fontFamily: 'JetBrains Mono, monospace' }}>
            {taxes.netTaxLiabilityPayable}
          </div>
          <div style={{ fontSize: 12, color: 'var(--success)' }}>100% Funded & Provisioned</div>
        </div>
      </div>

      {/* ─── SECTION 1: EUROPEAN VAT & STATUTORY CALENDAR ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20, marginBottom: 24 }}>
        
        {/* VAT & VIES Box */}
        <div className="card" style={{ padding: 22, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ padding: 6, borderRadius: 6, background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
                <CheckCircle2 size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: 16.5, fontWeight: 700, margin: 0 }}>EU Cross-Border VAT (OSS) Reconciliation</h3>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Automated One-Stop-Shop reverse charge VAT ledger</div>
              </div>
            </div>

            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', background: 'rgba(34, 197, 94, 0.12)', padding: '3px 8px', borderRadius: 4 }}>
              RECONCILED
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gross Output VAT Collected</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                {taxes.vatReconciliation?.grossVatCollected}
              </div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Input VAT Recoverable</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#22d3ee', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                {taxes.vatReconciliation?.inputVatRecoverable}
              </div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Net Remittance Payable</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                {taxes.vatReconciliation?.netVatRemitted}
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-base)', padding: '12px 14px', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={16} color="var(--success)" style={{ flexShrink: 0 }} />
            <span>
              <strong>VIES Verification Status:</strong> {taxes.vatReconciliation?.viesReportingStatus}. Zero discrepancies across bilateral German, Swedish, and UK tax filings.
            </span>
          </div>
        </div>

        {/* Sovereign R&D Tax Credit Simulator */}
        <div className="card" style={{ padding: 22, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ padding: 6, borderRadius: 6, background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc' }}>
                <Sparkles size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: 16.5, fontWeight: 700, margin: 0 }}>Sovereign R&D Tax Incentive Optimizer</h3>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Simulate Vinnova & EU Horizon tech credit deductions</div>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
            Under European Sovereign AI statutes, qualifying personnel and GPU cluster operations expenses qualify for up to 35% statutory corporate tax deduction credits.
          </p>

          <div style={{ background: 'var(--bg-elevated)', padding: '14px 16px', borderRadius: 8, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Qualifying R&D Credit Pool:</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#c084fc', fontFamily: 'JetBrains Mono, monospace' }}>
                ${rdSimulatorValue.toLocaleString()}
              </span>
            </div>

            <input
              type="range"
              min="400000"
              max="1200000"
              step="20000"
              value={rdSimulatorValue}
              onChange={(e) => setRdSimulatorValue(parseInt(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#c084fc' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-muted)', marginTop: 4 }}>
              <span>Conservative ($400k)</span>
              <span>Baseline ($603k)</span>
              <span>Maximized ($1.2M)</span>
            </div>
          </div>

          <button
            className="btn btn-sm btn-primary"
            onClick={handleApplySimulatedCredit}
            style={{ width: '100%', fontSize: 12, background: '#c084fc', color: '#000', border: 'none', display: 'flex', justifyContent: 'center', gap: 6 }}
          >
            <Check size={14} /> Update Tax Offset to -${rdSimulatorValue.toLocaleString()}
          </button>
        </div>
      </div>

      {/* ─── SECTION 2: STATUTORY FILING CALENDAR ─── */}
      <div className="card" style={{ padding: 22, borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Statutory Fiscal Calendar
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: '2px 0 0 0' }}>Statutory Tax Deadlines & Advance Payments</h3>
          </div>

          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            {taxes.statutoryCalendar?.length} Statutory Milestones
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {taxes.statutoryCalendar?.map((item) => {
            const isPaid = item.status === 'PAID_AND_FILED';

            return (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-elevated)',
                  border: isPaid ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--border-default)',
                  borderRadius: 8,
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                      {item.id}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      • Authority: <strong>{item.authority}</strong>
                    </span>
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.obligation}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Statutory Due Date: <strong>{item.dueDate}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>
                      {item.amount}
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: isPaid ? 'var(--success)' : 'var(--warning)',
                      }}
                    >
                      {item.status}
                    </span>
                  </div>

                  {!isPaid && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleFile(item)}
                      style={{ fontSize: 11.5, padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    >
                      <Check size={13} /> Record Filing & Pay
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaxesPage;
