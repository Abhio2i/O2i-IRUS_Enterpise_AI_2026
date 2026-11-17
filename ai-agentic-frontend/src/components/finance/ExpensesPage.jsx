import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addExpense, updateExpense, deleteExpense, setFilterExpenseCategory } from '../../store/financeSlice';
import { FinanceNav } from './FinanceNav';
import {
  Receipt, DollarSign, Building2, Users, Cpu, Search, Plus,
  Trash2, SlidersHorizontal, CheckCircle2, AlertCircle, X, Check,
  Sparkles, Filter, ChevronRight, BarChart2, Calendar, ShieldCheck
} from 'lucide-react';

const CATEGORY_CONFIG = {
  FIXED_COSTS: {
    label: 'Fixed Costs',
    icon: Building2,
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.1)',
    border: 'rgba(6, 182, 212, 0.25)',
    description: 'Data centers, cloud infrastructure, facilities, cyber insurance & enterprise tooling.',
  },
  HUMAN_CAPITAL: {
    label: 'Human Capital Costs',
    icon: Users,
    color: '#818cf8',
    bg: 'rgba(99, 102, 241, 0.1)',
    border: 'rgba(99, 102, 241, 0.25)',
    description: 'Engineering payroll, AI research talent, executive leadership, operations & compliance.',
  },
  EQUIPMENT_HARDWARE: {
    label: 'Equipment Hardware',
    icon: Cpu,
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.1)',
    border: 'rgba(34, 197, 94, 0.25)',
    description: 'NVIDIA H100 supercomputing clusters, InfiniBand switches, HSM security vaults & edge rigs.',
  },
};

export const ExpensesPage = () => {
  const dispatch = useDispatch();
  const expenses = useSelector((s) => s.finance.expenses || []);
  const activeCategory = useSelector((s) => s.finance.filterExpenseCategory || 'ALL');

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // New Expense Form
  const [newExpense, setNewExpense] = useState({
    name: '',
    category: 'FIXED_COSTS',
    vendor: '',
    monthlyCost: '$25,000',
    annualCost: '$300,000',
    billingCycle: 'Monthly',
    department: 'Infrastructure & Sovereign AI',
    notes: 'Operational capital expenditure line item.',
  });

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchCat = activeCategory === 'ALL' || e.category === activeCategory;
      const matchSearch = !searchQuery ||
        e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.department?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [expenses, activeCategory, searchQuery]);

  // Aggregate sums
  const fixedExpenses = expenses.filter(e => e.category === 'FIXED_COSTS');
  const humanExpenses = expenses.filter(e => e.category === 'HUMAN_CAPITAL');
  const hardwareExpenses = expenses.filter(e => e.category === 'EQUIPMENT_HARDWARE');

  const calcAnnualSum = (list) =>
    list.reduce((acc, item) => acc + parseFloat(item.annualCost?.replace(/[^0-9.]/g, '') || 0), 0);

  const fixedSum = calcAnnualSum(fixedExpenses);
  const humanSum = calcAnnualSum(humanExpenses);
  const hardwareSum = calcAnnualSum(hardwareExpenses);
  const totalSum = fixedSum + humanSum + hardwareSum;

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newExpense.name || !newExpense.vendor) return;

    const created = {
      id: `EXP-USER-${Math.floor(100 + Math.random() * 900)}`,
      category: newExpense.category,
      name: newExpense.name,
      vendor: newExpense.vendor,
      monthlyCost: newExpense.monthlyCost,
      annualCost: newExpense.annualCost,
      billingCycle: newExpense.billingCycle,
      department: newExpense.department,
      status: 'ACTIVE',
      notes: newExpense.notes,
    };

    dispatch(addExpense(created));
    setIsAddModalOpen(false);
    showNotification(`Logged new expense: "${created.name}"`);
    setNewExpense({
      name: '',
      category: 'FIXED_COSTS',
      vendor: '',
      monthlyCost: '$25,000',
      annualCost: '$300,000',
      billingCycle: 'Monthly',
      department: 'Infrastructure & Sovereign AI',
      notes: 'Operational capital expenditure line item.',
    });
  };

  return (
    <div className="finance-expenses-page" style={{ paddingBottom: 48, maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ─── TOAST NOTIFICATION ─── */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1100,
            background: 'var(--bg-elevated)',
            border: '1px solid #06b6d4',
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
          <Sparkles size={16} color="#06b6d4" />
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
              background: 'rgba(6, 182, 212, 0.1)',
              color: '#06b6d4',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: '0.03em',
              marginBottom: 8,
            }}
          >
            <Receipt size={13} /> Finance · OPEX & CAPEX Architecture [EXP-ARCH]
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', margin: '4px 0 6px 0', color: 'var(--text-primary)' }}>
            Expenses & Cost Structure
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 740, lineHeight: 1.5, margin: 0 }}>
            Structured breakdown across 3 core pillars: <strong>Fixed Costs</strong> (Leases & Facilities), <strong>Human Capital Costs</strong> (Staff Payroll & Talent), and <strong>Equipment Hardware</strong> (GPU Clusters & Quantum Vaults).
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            fontWeight: 600,
            fontSize: 13,
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(6, 182, 212, 0.3)',
          }}
        >
          <Plus size={16} /> Log Expense Item
        </button>
      </div>

      {/* ─── 3 CORE BUCKETS OVERVIEW CARDS ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Bucket 1: Fixed Costs */}
        <div
          className="card"
          onClick={() => dispatch(setFilterExpenseCategory(activeCategory === 'FIXED_COSTS' ? 'ALL' : 'FIXED_COSTS'))}
          style={{
            padding: '20px',
            borderRadius: 12,
            background: activeCategory === 'FIXED_COSTS' ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-surface)',
            border: activeCategory === 'FIXED_COSTS' ? '2px solid #06b6d4' : '1px solid var(--border-default)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#06b6d4' }}>
              <Building2 size={16} /> FIXED COSTS
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fixedExpenses.length} Items</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
            ${(fixedSum / 1000000).toFixed(2)}M / yr
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Data center colocation leases, SaaS platform subscriptions, and cyber liability policies.
          </div>
          <div style={{ fontSize: 11, color: '#06b6d4', fontWeight: 600, marginTop: 8 }}>
            {Math.round((fixedSum / totalSum) * 100)}% of Total Annual OPEX
          </div>
        </div>

        {/* Bucket 2: Human Capital */}
        <div
          className="card"
          onClick={() => dispatch(setFilterExpenseCategory(activeCategory === 'HUMAN_CAPITAL' ? 'ALL' : 'HUMAN_CAPITAL'))}
          style={{
            padding: '20px',
            borderRadius: 12,
            background: activeCategory === 'HUMAN_CAPITAL' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface)',
            border: activeCategory === 'HUMAN_CAPITAL' ? '2px solid #818cf8' : '1px solid var(--border-default)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#818cf8' }}>
              <Users size={16} /> HUMAN CAPITAL COSTS
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{humanExpenses.length} Teams</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
            ${(humanSum / 1000000).toFixed(2)}M / yr
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Core AI researchers (38 Eng), executive team (6), ops specialists (22), and legal.
          </div>
          <div style={{ fontSize: 11, color: '#818cf8', fontWeight: 600, marginTop: 8 }}>
            {Math.round((humanSum / totalSum) * 100)}% of Total Annual OPEX
          </div>
        </div>

        {/* Bucket 3: Hardware & Equipment */}
        <div
          className="card"
          onClick={() => dispatch(setFilterExpenseCategory(activeCategory === 'EQUIPMENT_HARDWARE' ? 'ALL' : 'EQUIPMENT_HARDWARE'))}
          style={{
            padding: '20px',
            borderRadius: 12,
            background: activeCategory === 'EQUIPMENT_HARDWARE' ? 'rgba(34, 197, 94, 0.12)' : 'var(--bg-surface)',
            border: activeCategory === 'EQUIPMENT_HARDWARE' ? '2px solid #22c55e' : '1px solid var(--border-default)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#22c55e' }}>
              <Cpu size={16} /> EQUIPMENT & HARDWARE
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hardwareExpenses.length} Clusters</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
            ${(hardwareSum / 1000000).toFixed(2)}M / yr
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            128 NVIDIA H100 GPUs, 800Gbps InfiniBand fabrics, Thales quantum HSMs & edge IoT.
          </div>
          <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 600, marginTop: 8 }}>
            {Math.round((hardwareSum / totalSum) * 100)}% of Total Annual OPEX
          </div>
        </div>
      </div>

      {/* ─── FILTER TABS & SEARCH ─── */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          marginBottom: 20,
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
          <button
            className={`btn btn-sm ${activeCategory === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => dispatch(setFilterExpenseCategory('ALL'))}
            style={{ fontSize: 12, borderRadius: 6 }}
          >
            All Cost Buckets ({expenses.length})
          </button>

          {Object.keys(CATEGORY_CONFIG).map((catKey) => {
            const cfg = CATEGORY_CONFIG[catKey];
            const isCurr = activeCategory === catKey;

            return (
              <button
                key={catKey}
                onClick={() => dispatch(setFilterExpenseCategory(catKey))}
                style={{
                  fontSize: 12,
                  fontWeight: isCurr ? 700 : 500,
                  padding: '5px 12px',
                  borderRadius: 6,
                  background: isCurr ? cfg.color : 'var(--bg-elevated)',
                  color: isCurr ? (catKey === 'FIXED_COSTS' ? '#000' : '#fff') : 'var(--text-secondary)',
                  border: `1px solid ${isCurr ? cfg.color : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg-base)',
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border-subtle)',
            minWidth: 220,
          }}
        >
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search expense line items..."
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

      {/* ─── EXPENSE ITEMS CARDS ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredExpenses.map((exp) => {
          const cfg = CATEGORY_CONFIG[exp.category] || CATEGORY_CONFIG.FIXED_COSTS;
          const Icon = cfg.icon;

          return (
            <div
              key={exp.id}
              className="card"
              style={{
                padding: '18px 22px',
                borderRadius: 10,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, minWidth: 280, flex: 2 }}>
                <div
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    background: cfg.bg,
                    color: cfg.color,
                    border: `1px solid ${cfg.border}`,
                    marginTop: 2,
                  }}
                >
                  <Icon size={18} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                      {exp.id}
                    </span>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '1px 7px',
                        borderRadius: 4,
                        background: cfg.bg,
                        color: cfg.color,
                      }}
                    >
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      • {exp.department}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {exp.name}
                  </h3>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Vendor: <strong style={{ color: 'var(--text-primary)' }}>{exp.vendor}</strong> • Cycle: {exp.billingCycle}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                    {exp.notes}
                  </div>
                </div>
              </div>

              {/* Cost & Delete Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, textAlign: 'right' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {exp.monthlyCost} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>/ mo</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                    {exp.annualCost} / yr
                  </div>
                </div>

                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    if (confirm(`Remove expense item "${exp.name}"?`)) {
                      dispatch(deleteExpense({ id: exp.id }));
                      showNotification(`Removed expense: "${exp.name}"`);
                    }
                  }}
                  style={{ color: 'var(--danger)', padding: 6 }}
                  title="Delete Expense Item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── MODAL: ADD EXPENSE ITEM ─── */}
      {isAddModalOpen && (
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
          <div className="card" style={{ width: '100%', maxWidth: 540, padding: 26, boxShadow: 'var(--shadow-modal)', borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  OPEX Allocation
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, margin: '2px 0 4px 0' }}>Log Expense Line Item</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  Allocate capital expenditure across Fixed, Talent, or Hardware categories.
                </p>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)} style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Expense Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zurich Financial Interconnect Colocation Node"
                  value={newExpense.name}
                  onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Cost Category Bucket *
                  </label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="FIXED_COSTS">Fixed Costs (Facilities / SaaS)</option>
                    <option value="HUMAN_CAPITAL">Human Capital (Payroll / Talent)</option>
                    <option value="EQUIPMENT_HARDWARE">Equipment Hardware (GPUs / Racks)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Vendor / Provider *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Equinix / Internal Payroll"
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Monthly Cost ($)
                  </label>
                  <input
                    type="text"
                    value={newExpense.monthlyCost}
                    onChange={(e) => {
                      const m = e.target.value;
                      const num = parseFloat(m.replace(/[^0-9.]/g, '') || 0);
                      setNewExpense({ ...newExpense, monthlyCost: m, annualCost: `$${(num * 12).toLocaleString()}` });
                    }}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Annual Cost ($)
                  </label>
                  <input
                    type="text"
                    value={newExpense.annualCost}
                    onChange={(e) => setNewExpense({ ...newExpense, annualCost: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Billing Cycle
                  </label>
                  <select
                    value={newExpense.billingCycle}
                    onChange={(e) => setNewExpense({ ...newExpense, billingCycle: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual Prepaid">Annual Prepaid</option>
                    <option value="Monthly Payroll">Monthly Payroll</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Department
                  </label>
                  <input
                    type="text"
                    value={newExpense.department}
                    onChange={(e) => setNewExpense({ ...newExpense, department: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Technical / Operational Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dedicated redundant fiber lines for cross-border telemetry."
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Plus size={16} /> Save Expense Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
