import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addActionPlan, updateActionPlanStatus, toggleActionStep } from '../../store/strategySlice';
import {
  Briefcase, CheckCircle2, Circle, AlertCircle, Clock, DollarSign,
  TrendingUp, Plus, Filter, User, Users, ArrowRight, ShieldCheck, X, Check
} from 'lucide-react';
import { StrategyNav } from './StrategyNav';

const STATUS_CONFIG = {
  DRAFT: { label: 'DRAFT', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)' },
  APPROVED: { label: 'EXECUTIVE APPROVED', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.3)' },
  IN_EXECUTION: { label: 'IN EXECUTION', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.3)' },
  COMPLETED: { label: 'COMPLETED', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)' },
};

export const ActionPlanPage = () => {
  const dispatch = useDispatch();
  const actionPlans = useSelector((s) => s.strategy.actionPlans || []);

  const [selectedStream, setSelectedStream] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Action Plan Form
  const [newPlan, setNewPlan] = useState({
    title: '',
    stream: 'Technology & AI',
    priority: 'HIGH',
    leadOwner: 'Magnus Lind',
    rResponsible: 'Staff Engineer',
    aAccountable: 'Lead Owner',
    budget: '$500,000',
    startDate: '2027-01-01',
    targetDate: '2027-06-30',
    kpi: 'Clear milestone metric',
    step1: 'Initiate technical specification review',
    step2: 'Execute deployment to canary cluster',
  });

  const streams = ['ALL', 'Technology & AI', 'Revenue & Growth', 'ESG & Governance', 'Corporate Finance & M&A'];

  const filteredPlans = selectedStream === 'ALL'
    ? actionPlans
    : actionPlans.filter((p) => p.stream === selectedStream);

  const totalActionBudget = actionPlans.reduce((acc, p) => acc + parseFloat(p.budget.replace(/[^0-9.]/g, '') || 0), 0);
  const activePlansCount = actionPlans.filter((p) => p.status === 'IN_EXECUTION').length;

  const handleCreatePlan = (e) => {
    e.preventDefault();
    if (!newPlan.title) return;

    const created = {
      id: `ACT-0${actionPlans.length + 1}`,
      title: newPlan.title,
      stream: newPlan.stream,
      priority: newPlan.priority,
      leadOwner: newPlan.leadOwner,
      raci: {
        r: newPlan.rResponsible || 'Lead Specialist',
        a: newPlan.leadOwner,
        c: 'Strategy Council',
        i: 'Executive Board',
      },
      status: 'APPROVED',
      startDate: newPlan.startDate,
      targetDate: newPlan.targetDate,
      budget: newPlan.budget,
      kpi: newPlan.kpi,
      actionSteps: [
        { step: newPlan.step1 || 'Architecture & RACI alignment', done: true },
        { step: newPlan.step2 || 'Execute initial phase rollout', done: false },
      ]
    };

    dispatch(addActionPlan(created));
    setIsModalOpen(false);
    setNewPlan({
      title: '',
      stream: 'Technology & AI',
      priority: 'HIGH',
      leadOwner: 'Magnus Lind',
      rResponsible: 'Staff Engineer',
      aAccountable: 'Lead Owner',
      budget: '$500,000',
      startDate: '2027-01-01',
      targetDate: '2027-06-30',
      kpi: 'Clear milestone metric',
      step1: 'Initiate technical specification review',
      step2: 'Execute deployment to canary cluster',
    });
  };

  return (
    <div className="strategy-action-plan-page">
      {/* Leadership & Strategy Suite Sub-Nav */}
      <StrategyNav />

      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-title-block">
          <div className="page-tag">Leadership & Strategy · Tactical Execution Engine [STRAT-ACTION]</div>
          <h2>Plan of Action</h2>
          <p>Strategic action plans, RACI accountability matrices, budget allocations, and tactical step-by-step execution.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', fontWeight: 600 }}
        >
          <Plus size={16} /> New Action Plan
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid cols-4" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">Active Action Plans <CheckCircle2 size={13} /></div>
          <div className="stat-value">{activePlansCount} / {actionPlans.length}</div>
          <div className="stat-sub">Tactical initiatives executing</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Allocated Capital <DollarSign size={13} /></div>
          <div className="stat-value">${(totalActionBudget).toFixed(1)}M</div>
          <div className="stat-sub">Direct strategic initiatives pool</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Execution Velocity <TrendingUp size={13} /></div>
          <div className="stat-value">94.2%</div>
          <div className="stat-sub">Milestones on schedule</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">RACI Governance <ShieldCheck size={13} color="var(--success)" /></div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>100% Signed</div>
          <div className="stat-sub">Clear executive accountability</div>
        </div>
      </div>

      {/* Filter by Stream */}
      <div className="card" style={{ padding: '12px 18px', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Filter Strategic Stream:</span>
          {streams.map((str) => (
            <button
              key={str}
              className={`btn btn-sm ${selectedStream === str ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedStream(str)}
              style={{ fontSize: 12 }}
            >
              {str}
            </button>
          ))}
        </div>
      </div>

      {/* Action Plans Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 18 }}>
        {filteredPlans.map((plan) => {
          const statusCfg = STATUS_CONFIG[plan.status] || STATUS_CONFIG.IN_EXECUTION;
          const completedSteps = plan.actionSteps.filter((s) => s.done).length;
          const stepPct = Math.round((completedSteps / plan.actionSteps.length) * 100);

          return (
            <div
              key={plan.id}
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div>
                {/* Header Row: ID, Priority, Stream, Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {plan.id}
                    </span>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 3,
                        color: plan.priority === 'HIGH' ? 'var(--warning)' : 'var(--text-secondary)',
                        background: 'var(--bg-base)',
                      }}
                    >
                      {plan.priority} PRIORITY
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 10,
                      color: statusCfg.color,
                      background: statusCfg.bg,
                      border: `1px solid ${statusCfg.border}`,
                    }}
                  >
                    ● {statusCfg.label}
                  </span>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                  {plan.stream}
                </div>

                {/* Title */}
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.35 }}>
                  {plan.title}
                </h3>

                {/* Key Result Target Metric */}
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 14 }}>
                  Target KPI: <strong style={{ color: 'var(--text-primary)' }}>{plan.kpi}</strong>
                </div>

                {/* Action Steps Checklist */}
                <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Execution Roadmap ({completedSteps}/{plan.actionSteps.length})
                    </span>
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                      {stepPct}%
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div style={{ height: 4, background: 'var(--bg-base)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{ height: '100%', width: `${stepPct}%`, background: stepPct === 100 ? 'var(--success)' : '#06b6d4' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {plan.actionSteps.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        onClick={() => dispatch(toggleActionStep({ planId: plan.id, stepIndex: sIdx }))}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: 'pointer',
                          fontSize: 12,
                          color: step.done ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: step.done ? 'line-through' : 'none',
                        }}
                      >
                        {step.done ? (
                          <CheckCircle2 size={14} color="#22c55e" style={{ flexShrink: 0 }} />
                        ) : (
                          <Circle size={14} color="var(--border-strong)" style={{ flexShrink: 0 }} />
                        )}
                        <span>{step.step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RACI Matrix Grid */}
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '10px 12px', marginBottom: 14 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                    RACI Governance Matrix
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', fontSize: 11.5 }}>
                    <div><span style={{ fontWeight: 700, color: 'var(--accent)' }}>[R]</span> {plan.raci.r}</div>
                    <div><span style={{ fontWeight: 700, color: 'var(--success)' }}>[A]</span> {plan.raci.a}</div>
                    <div><span style={{ fontWeight: 700, color: 'var(--warning)' }}>[C]</span> {plan.raci.c}</div>
                    <div><span style={{ fontWeight: 700, color: '#06b6d4' }}>[I]</span> {plan.raci.i}</div>
                  </div>
                </div>

                {/* Meta: Budget & Dates */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: 'var(--text-secondary)' }}>
                  <div>Budget: <strong style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{plan.budget}</strong></div>
                  <div>Period: <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{plan.startDate.slice(0, 7)} ➔ {plan.targetDate.slice(0, 7)}</span></div>
                </div>
              </div>

              {/* Status Update Quick Buttons */}
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lead: {plan.leadOwner}</span>
                <select
                  value={plan.status}
                  onChange={(e) => dispatch(updateActionPlanStatus({ id: plan.id, status: e.target.value }))}
                  style={{
                    fontSize: 10.5,
                    background: 'var(--bg-base)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 4,
                    padding: '2px 6px',
                  }}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="APPROVED">Approved</option>
                  <option value="IN_EXECUTION">In Execution</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Action Plan */}
      {isModalOpen && (
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
            padding: 16,
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 540, padding: 24, boxShadow: 'var(--shadow-modal)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Initiate Strategic Action Plan</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Assign RACI roles, budget, and tactical milestone steps.</p>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)} style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Action Plan Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cross-Border VAT Reverse-Charge Automated Clearing"
                  value={newPlan.title}
                  onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Strategic Stream
                  </label>
                  <select
                    value={newPlan.stream}
                    onChange={(e) => setNewPlan({ ...newPlan, stream: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="Technology & AI">Technology & AI</option>
                    <option value="Revenue & Growth">Revenue & Growth</option>
                    <option value="ESG & Governance">ESG & Governance</option>
                    <option value="Corporate Finance & M&A">Corporate Finance & M&A</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Accountable Lead [A]
                  </label>
                  <input
                    type="text"
                    value={newPlan.leadOwner}
                    onChange={(e) => setNewPlan({ ...newPlan, leadOwner: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Responsible Lead [R]
                  </label>
                  <input
                    type="text"
                    value={newPlan.rResponsible}
                    onChange={(e) => setNewPlan({ ...newPlan, rResponsible: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Allocated Budget
                  </label>
                  <input
                    type="text"
                    value={newPlan.budget}
                    onChange={(e) => setNewPlan({ ...newPlan, budget: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Target KPI Metric
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100% Tax accuracy across 4 Nordic jurisdictions"
                  value={newPlan.kpi}
                  onChange={(e) => setNewPlan({ ...newPlan, kpi: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Step 1
                  </label>
                  <input
                    type="text"
                    value={newPlan.step1}
                    onChange={(e) => setNewPlan({ ...newPlan, step1: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Step 2
                  </label>
                  <input
                    type="text"
                    value={newPlan.step2}
                    onChange={(e) => setNewPlan({ ...newPlan, step2: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Commit Action Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ActionPlanPage;
