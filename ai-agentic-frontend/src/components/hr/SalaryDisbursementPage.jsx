import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HrNav } from './HrNav';
import { disburseMonthlyBatch } from '../../store/hrSlice';
import {
  CreditCard, CheckCircle2, Clock, DollarSign, Download,
  Printer, Eye, Send, Building2, ShieldCheck, FileText, X, ArrowUpRight
} from 'lucide-react';

export const SalaryDisbursementPage = () => {
  const dispatch = useDispatch();
  const payroll = useSelector((s) => s.hr.payroll);

  const [selectedEmp, setSelectedEmp] = useState(null);
  const [disbursedNotice, setDisbursedNotice] = useState(false);

  const handleDisburseBatch = () => {
    dispatch(disburseMonthlyBatch());
    setDisbursedNotice(true);
    setTimeout(() => setDisbursedNotice(false), 5000);
  };

  // Helper to convert number to words for Payslip
  const numberToWordsUSD = (amount) => {
    return `${amount.toLocaleString()} US Dollars Only`;
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      <HrNav />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <CreditCard size={20} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Salary Disbursement & Digital Pay Slips
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Automated monthly payroll settlement via SEPA Instant & SWIFT wire networks, statutory tax withholding (TDS), provident fund escrow, and verifiable payslips.
          </p>
        </div>

        <button
          onClick={handleDisburseBatch}
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
          <Send size={15} />
          <span>Execute Monthly Disbursement Batch</span>
        </button>
      </div>

      {/* Notice alert */}
      {disbursedNotice && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 13, fontWeight: 600 }}>
          <CheckCircle2 size={16} />
          <span>Batch cleared! Total {payroll.totalNetDisbursed} disbursed to {payroll.headcountPaid} team accounts across Handelsbanken & Deutsche Bank corporate rails.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Monthly Gross Payroll</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>{payroll.totalGrossDisbursed}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Cycle: {payroll.currentCycle}</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Net Disbursed to Bank</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>{payroll.totalNetDisbursed}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{payroll.headcountPaid} Full-Time Personnel Paid</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Income Tax Withheld (TDS)</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>{payroll.totalTaxesDeducted}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Statutory Escrow Ready</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Disbursement Rail</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>SEPA Instant</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Sub-10s Zero-Fee Settlement</div>
        </div>
      </div>

      {/* Roster of Employees Paid */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              October 2026 Salary Settlement Ledger
            </h3>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Batch Ref: {payroll.batchReference} · Clearing: {payroll.clearingBank}
            </div>
          </div>

          <span
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 700,
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <CheckCircle2 size={13} />
            <span>DISBURSED</span>
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Employee & ID</th>
                <th style={{ padding: '14px 18px' }}>Designation & Dept</th>
                <th style={{ padding: '14px 18px' }}>Bank Account</th>
                <th style={{ padding: '14px 18px' }}>Gross Salary</th>
                <th style={{ padding: '14px 18px' }}>Deductions (TDS/PF)</th>
                <th style={{ padding: '14px 18px' }}>Net Pay Disbursed</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Official Pay Slip</th>
              </tr>
            </thead>
            <tbody>
              {payroll.employees.map((emp) => {
                return (
                  <tr key={emp.empId} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{emp.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        {emp.empId} · Tax: {emp.panTaxId}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{emp.designation}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>{emp.department}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{emp.bank}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>{emp.accountMasked}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        ${emp.earnings.grossTotal.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        Basic: ${emp.earnings.basic.toLocaleString()}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#f59e0b' }}>
                        -${emp.deductions.totalDeductions.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        TDS: ${emp.deductions.incomeTaxTds.toLocaleString()}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 800, color: '#10b981', fontSize: 14 }}>
                        ${emp.netPay.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>
                        {emp.utrRef}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedEmp(emp)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
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
                        <span>View Pay Slip</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Pay Slip Modal */}
      {selectedEmp && (
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
              maxWidth: 720,
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
              position: 'relative',
            }}
          >
            {/* Modal Close */}
            <button
              onClick={() => setSelectedEmp(null)}
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

            {/* Pay Slip Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid rgba(16, 185, 129, 0.3)', paddingBottom: 20, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#10b981', letterSpacing: -0.5 }}>
                  O2i · IRUS ENTERPRISE AI
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                  Corporate Headquarters: Kungsgatan 44, Stockholm, Sweden
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                  Corporate Tax ID: SE-559281-9012 · SEPA Creditor ID: SE18ZZZ00000918
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 12, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: '#10b981', color: '#052e16' }}>
                  SALARY SLIP
                </span>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 6 }}>
                  {payroll.currentCycle}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Pay Period: {payroll.cyclePeriod}
                </div>
              </div>
            </div>

            {/* Employee Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '14px', marginBottom: 20, fontSize: 12.5 }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Employee Name:</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14, marginTop: 2 }}>{selectedEmp.name}</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                  Emp ID: <strong>{selectedEmp.empId}</strong> · Dept: <strong>{selectedEmp.department}</strong>
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
                  Role: <strong>{selectedEmp.designation}</strong>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Bank & Settlement Info:</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{selectedEmp.bank}</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                  Account: <strong style={{ fontFamily: 'monospace' }}>{selectedEmp.accountMasked}</strong>
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
                  UTR Ref: <strong style={{ fontFamily: 'monospace' }}>{selectedEmp.utrRef}</strong>
                </div>
              </div>
            </div>

            {/* Two-Column Earnings & Deductions Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {/* Earnings */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-default)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px 14px', fontWeight: 700, fontSize: 12.5, color: '#10b981' }}>
                  EARNINGS BREAKDOWN (USD)
                </div>
                <div style={{ padding: '12px 14px', fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Basic Salary</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${selectedEmp.earnings.basic.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>House Rent Allowance (HRA)</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${selectedEmp.earnings.hra.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Special Technical Allowance</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${selectedEmp.earnings.specialAllowance.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Performance Bonus / Grant</span>
                    <span style={{ fontWeight: 600, color: '#38bdf8' }}>${selectedEmp.earnings.performanceBonus.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', marginTop: 8, borderTop: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-primary)' }}>Gross Earnings</span>
                    <span style={{ color: 'var(--text-primary)' }}>${selectedEmp.earnings.grossTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-default)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px 14px', fontWeight: 700, fontSize: 12.5, color: '#f59e0b' }}>
                  STATUTORY DEDUCTIONS (USD)
                </div>
                <div style={{ padding: '12px 14px', fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Income Tax (TDS / PAYE)</span>
                    <span style={{ fontWeight: 600, color: '#f59e0b' }}>${selectedEmp.deductions.incomeTaxTds.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Provident Fund (PF)</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${selectedEmp.deductions.providentFund.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Professional Tax</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${selectedEmp.deductions.professionalTax.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Comprehensive Health Escrow</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${selectedEmp.deductions.healthInsurance.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', marginTop: 8, borderTop: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-primary)' }}>Total Deductions</span>
                    <span style={{ color: '#f59e0b' }}>-${selectedEmp.deductions.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Highlight Box */}
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                  Net Salary Payable to Employee:
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Amount in Words: <em>{numberToWordsUSD(selectedEmp.netPay)}</em>
                </div>
              </div>

              <div style={{ fontSize: 28, fontWeight: 900, color: '#10b981' }}>
                ${selectedEmp.netPay.toLocaleString()}
              </div>
            </div>

            {/* Signatures & Seal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border-default)', fontSize: 11.5, color: 'var(--text-muted)' }}>
              <div>
                <div>Disbursed via SEPA Instant Direct Bank Settlement.</div>
                <div>This is a system-generated cryptographic payslip and does not require physical stamp.</div>
                <div style={{ color: '#10b981', marginTop: 2 }}>Hash: 0x9a8f11...b7201c</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'serif', fontSize: 14, fontStyle: 'italic', color: '#10b981' }}>
                  O2i Enterprise AI - Finance Desk
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>Authorized Payroll Officer</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setSelectedEmp(null)}
                style={{ padding: '8px 16px', borderRadius: 6, background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontSize: 12.5 }}
              >
                Close Pay Slip
              </button>
              <button
                onClick={() => window.print()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontSize: 12.5 }}
              >
                <Printer size={14} />
                <span>Print</span>
              </button>
              <button
                onClick={() => alert(`Official Pay Slip ${selectedEmp.empId} downloaded in PDF format.`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, background: '#10b981', color: '#052e16', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 12.5 }}
              >
                <Download size={14} />
                <span>Download Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryDisbursementPage;
