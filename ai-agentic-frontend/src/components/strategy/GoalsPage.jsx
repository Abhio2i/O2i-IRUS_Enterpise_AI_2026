import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addGoal, updateGoalProgress, toggleSubGoalStatus } from '../../store/strategySlice';
import {
  Target, TrendingUp, CheckCircle2, Circle, AlertTriangle, Plus, ChevronDown,
  ChevronUp, User, DollarSign, Calendar, Layers, ShieldCheck, Zap, X, Check
} from 'lucide-react';
import { StrategyNav } from './StrategyNav';

const STATUS_CONFIG = {
  ON_TRACK: { label: 'ON TRACK', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)' },
  AHEAD: { label: 'AHEAD OF SCHEDULE', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.3)' },
  AT_RISK: { label: 'AT RISK', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' },
  DELAYED: { label: 'DELAYED', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' },
};

export const GoalsPage = () => {
  const dispatch = useDispatch();
  const goals = useSelector((s) => s.strategy.goals || []);

  const [expandedGoalId, setExpandedGoalId] = useState(goals[0]?.id || null);
  const [selectedPillar, setSelectedPillar] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Goal Form
  const [newGoal, setNewGoal] = useState({
    title: '',
    pillar: 'Revenue & Market Leadership',
    owner: '',
    targetYear: '2028',
    budget: '$15.0M',
    description: '',
    subGoal1: '',
    subGoal2: '',
  });

  const pillars = ['ALL', ...new Set(goals.map((g) => g.pillar))];

  const filteredGoals = selectedPillar === 'ALL'
    ? goals
    : goals.filter((g) => g.pillar === selectedPillar);

  const avgProgress = Math.round(goals.reduce((acc, g) => acc + g.overallProgress, 0) / (goals.length || 1));
  const onTrackCount = goals.filter((g) => g.status === 'ON_TRACK' || g.status === 'AHEAD').length;
  const totalSubGoals = goals.reduce((acc, g) => acc + g.subGoals.length, 0);

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!newGoal.title) return;

    const created = {
      id: `GOAL-0${goals.length + 1}`,
      pillar: newGoal.pillar,
      title: newGoal.title,
      description: newGoal.description || 'Strategic leadership corporate imperative.',
      owner: newGoal.owner || 'Executive Leadership',
      sponsorRole: 'Executive Sponsor',
      targetYear: newGoal.targetYear,
      overallProgress: 15,
      status: 'ON_TRACK',
      budget: newGoal.budget,
      subGoals: [
        { id: `SG-${Date.now()}-1`, title: newGoal.subGoal1 || 'Establish governance and milestone benchmark baseline', target: 'Phase 1', current: '10% Done', progress: 20, status: 'ON_TRACK', quarter: `Q1 ${newGoal.targetYear}` },
        { id: `SG-${Date.now()}-2`, title: newGoal.subGoal2 || 'Rollout pilot execution to regional operations', target: 'Phase 2', current: 'Pending', progress: 10, status: 'ON_TRACK', quarter: `Q3 ${newGoal.targetYear}` },
      ]
    };

    dispatch(addGoal(created));
    setIsModalOpen(false);
    setNewGoal({
      title: '',
      pillar: 'Revenue & Market Leadership',
      owner: '',
      targetYear: '2028',
      budget: '$15.0M',
      description: '',
      subGoal1: '',
      subGoal2: '',
    });
  };

  return (
    <div className="strategy-goals-page">
      {/* Leadership & Strategy Suite Sub-Nav */}
      <StrategyNav />

      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-title-block">
          <div className="page-tag">Leadership & Strategy · Corporate OKRs [STRAT-GOALS]</div>
          <h2>Strategic Goals & Sub-Goals</h2>
          <p>Multi-year corporate objectives, executive pillar ownership, nested key results, and live milestone progress.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', fontWeight: 600 }}
        >
          <Plus size={16} /> Define Strategic Goal
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid cols-4" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">Core Pillars <Target size={13} /></div>
          <div className="stat-value">{goals.length} Strategic Goals</div>
          <div className="stat-sub" style={{ color: 'var(--success)' }}>{onTrackCount} Goals On-Track / Ahead</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Overall Completion <TrendingUp size={13} /></div>
          <div className="stat-value">{avgProgress}%</div>
          <div className="stat-sub">Weighted across all corporate OKRs</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Nested Sub-Goals <Layers size={13} /></div>
          <div className="stat-value">{totalSubGoals} Key Results</div>
          <div className="stat-sub">Across active strategic horizons</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Allocated Capital <DollarSign size={13} /></div>
          <div className="stat-value">$91.0M</div>
          <div className="stat-sub">Strategic Multi-Horizon CapEx Pool</div>
        </div>
      </div>

      {/* Filter by Pillar */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Filter by Corporate Pillar:</span>
          {pillars.map((pil) => (
            <button
              key={pil}
              className={`btn btn-sm ${selectedPillar === pil ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedPillar(pil)}
              style={{ fontSize: 12 }}
            >
              {pil}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Accordion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {filteredGoals.map((goal) => {
          const isExpanded = expandedGoalId === goal.id;
          const statusCfg = STATUS_CONFIG[goal.status] || STATUS_CONFIG.ON_TRACK;

          return (
            <div
              key={goal.id}
              className="card"
              style={{
                padding: '22px',
                border: isExpanded ? '1px solid var(--accent)' : '1px solid var(--border-default)',
                transition: 'border-color 0.15s ease',
              }}
            >
              {/* Top Row: Pillar, Target Year, Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
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
                      letterSpacing: '0.04em',
                    }}
                  >
                    {goal.id}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {goal.pillar}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    • Target: {goal.targetYear}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: 12,
                      color: statusCfg.color,
                      background: statusCfg.bg,
                      border: `1px solid ${statusCfg.border}`,
                    }}
                  >
                    ● {statusCfg.label}
                  </span>

                  <button
                    className="btn btn-ghost"
                    onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                    style={{ padding: '4px 8px' }}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, lineHeight: 1.35 }}>
                {goal.title}
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.55 }}>
                {goal.description}
              </p>

              {/* Executive Sponsor, Budget, and Progress */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16, background: 'var(--bg-elevated)', padding: '12px 16px', borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Executive Sponsor</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{goal.owner}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{goal.sponsorRole}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Allocated CapEx Budget</div>
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{goal.budget}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Multi-year investment</div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>Objective Progress</span>
                    <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>{goal.overallProgress}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-base)', borderRadius: 3, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${goal.overallProgress}%`,
                        background: goal.overallProgress > 70 ? 'var(--success)' : goal.overallProgress > 40 ? '#06b6d4' : 'var(--warning)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Nested Sub-Goals / Key Results Section */}
              {isExpanded && (
                <div style={{ marginTop: 16, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Layers size={14} color="var(--accent)" /> Nested Key Results & Sub-Goals ({goal.subGoals.length})
                    </h4>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click checkbox to mark achieved</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {goal.subGoals.map((sg) => {
                      const isDone = sg.status === 'COMPLETED' || sg.progress >= 100;

                      return (
                        <div
                          key={sg.id}
                          style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 8,
                            padding: '12px 16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 12,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 320px' }}>
                            <div
                              onClick={() => dispatch(toggleSubGoalStatus({ goalId: goal.id, subGoalId: sg.id }))}
                              style={{ cursor: 'pointer', flexShrink: 0 }}
                            >
                              {isDone ? (
                                <CheckCircle2 size={18} color="#22c55e" />
                              ) : (
                                <Circle size={18} color="var(--border-strong)" />
                              )}
                            </div>

                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 600, color: isDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                                {sg.title}
                              </div>
                              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                                Target: <strong>{sg.target}</strong> · Current: <strong>{sg.current}</strong> · Milestone: <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{sg.quarter}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 90 }}>
                              <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${sg.progress}%`, background: isDone ? '#22c55e' : '#06b6d4' }} />
                              </div>
                            </div>

                            <span
                              style={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: 10,
                                color: isDone ? '#22c55e' : sg.status === 'AHEAD' ? '#06b6d4' : '#f59e0b',
                                background: isDone ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-elevated)',
                              }}
                            >
                              {isDone ? 'ACHIEVED' : `${sg.progress}%`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: New Strategic Goal */}
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
          <div className="card" style={{ width: '100%', maxWidth: 540, padding: 24, boxShadow: 'var(--shadow-modal)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Define Multi-Year Strategic Goal</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Formulate a strategic corporate OKR with sub-goals.</p>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)} style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Strategic Goal Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Expand into DACH Tier-1 Manufacturing with Autonomous EDI"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Strategic Pillar
                  </label>
                  <select
                    value={newGoal.pillar}
                    onChange={(e) => setNewGoal({ ...newGoal, pillar: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="Revenue & Market Leadership">Revenue & Market Leadership</option>
                    <option value="Autonomous Operations">Autonomous Operations</option>
                    <option value="ESG & Sustainable Operations">ESG & Sustainable Operations</option>
                    <option value="Sovereign AI Infrastructure">Sovereign AI Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Target Completion Year
                  </label>
                  <select
                    value={newGoal.targetYear}
                    onChange={(e) => setNewGoal({ ...newGoal, targetYear: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Executive Sponsor / Owner
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Magnus Lind, CEO"
                    value={newGoal.owner}
                    onChange={(e) => setNewGoal({ ...newGoal, owner: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Allocated CapEx
                  </label>
                  <input
                    type="text"
                    value={newGoal.budget}
                    onChange={(e) => setNewGoal({ ...newGoal, budget: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Description & Corporate Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline the enterprise transformation and expected ROI..."
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="input"
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Key Result / Sub-Goal 1
                </label>
                <input
                  type="text"
                  placeholder="e.g. Onboard 20 German automotive suppliers"
                  value={newGoal.subGoal1}
                  onChange={(e) => setNewGoal({ ...newGoal, subGoal1: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Key Result / Sub-Goal 2
                </label>
                <input
                  type="text"
                  placeholder="e.g. Attain 98% accuracy on German EDIFACT formats"
                  value={newGoal.subGoal2}
                  onChange={(e) => setNewGoal({ ...newGoal, subGoal2: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Commit Strategic Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default GoalsPage;
