import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StrategyNav } from './StrategyNav';
import {
  addTimelineMilestone,
  updateTimelineStatus,
  adjustMilestoneTimeline,
  shiftMilestoneQuarter,
  deleteMilestone,
  setTimelineFilterYear,
  setTimelineRange,
} from '../../store/strategySlice';
import {
  CalendarRange, Clock, TrendingUp, DollarSign, Milestone, Shield,
  ArrowRight, Plus, CheckCircle2, AlertCircle, Filter, X, Check, Layers,
  ChevronLeft, ChevronRight, Edit2, Trash2, SlidersHorizontal, Settings2,
  Calendar, Sparkles, Compass, Target, ArrowUpRight, Search, Zap,
  Briefcase, CheckCircle, BarChart3, UserCheck, Flag
} from 'lucide-react';

const STATUS_CONFIG = {
  SCHEDULED: {
    label: 'SCHEDULED',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.3)',
    dot: '#818cf8',
  },
  IN_PROGRESS: {
    label: 'IN PROGRESS',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.3)',
    dot: '#22d3ee',
  },
  PLANNED: {
    label: 'PLANNED',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    dot: '#fbbf24',
  },
  ACHIEVED: {
    label: 'ACHIEVED',
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.3)',
    dot: '#4ade80',
  },
};

const HORIZON_PALETTE = [
  { primary: '#6366f1', glow: 'rgba(99, 102, 241, 0.25)', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.3)' },
  { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.25)', bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.3)' },
  { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.25)', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' },
  { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' },
  { primary: '#ec4899', glow: 'rgba(236, 72, 153, 0.25)', bg: 'rgba(236, 72, 153, 0.1)', border: 'rgba(236, 72, 153, 0.3)' },
];

export const TimelinesPage = () => {
  const dispatch = useDispatch();
  const timelines = useSelector((s) => s.strategy.timelines || []);
  const filterYear = useSelector((s) => s.strategy.timelineFilterYear || 'ALL');
  const timelineRange = useSelector((s) => s.strategy.timelineRange || { startYear: 2027, endYear: 2029 });
  const horizons = useSelector((s) => s.strategy.horizons || []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

  // Range Form
  const [rangeForm, setRangeForm] = useState({
    startYear: timelineRange.startYear,
    endYear: timelineRange.endYear,
  });

  // Dynamic active years
  const activeYears = useMemo(() => {
    const yrs = [];
    for (let y = timelineRange.startYear; y <= timelineRange.endYear; y++) {
      yrs.push(String(y));
    }
    return yrs;
  }, [timelineRange.startYear, timelineRange.endYear]);

  // Dynamic all quarters
  const allQuarters = useMemo(() => {
    const qtrs = [];
    for (let y = timelineRange.startYear; y <= timelineRange.endYear; y++) {
      qtrs.push(`Q1 ${y}`, `Q2 ${y}`, `Q3 ${y}`, `Q4 ${y}`);
    }
    return qtrs;
  }, [timelineRange.startYear, timelineRange.endYear]);

  // Clean Quarter Extractor (e.g., "Q1 2027" -> "Q1")
  const getCleanQuarter = (rawQuarter) => {
    if (!rawQuarter) return 'Q1';
    const match = rawQuarter.match(/Q[1-4]/i);
    return match ? match[0].toUpperCase() : 'Q1';
  };

  // Get Horizon Label for Milestone (e.g., "Horizon 1", "Horizon 2", "Horizon 3")
  const getHorizonLabel = (milestoneYear) => {
    const idx = activeYears.indexOf(String(milestoneYear));
    if (idx !== -1) {
      return `Horizon ${idx + 1}`;
    }
    return 'Horizon';
  };

  // New Milestone Form State
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    horizonIndex: 0,
    quarterOnly: 'Q1',
    pillar: 'Autonomous Operations',
    capex: '$3.5M',
    leadExec: 'Elin Torsson (COO)',
    riskScore: 'Low',
    deliverables: 'Architecture validation, Pilot rollout',
    strategicImpact: '',
  });

  // Calculate Capex Total
  const totalCapexNum = useMemo(() => {
    return timelines.reduce((acc, t) => acc + (parseFloat(t.capex?.replace(/[^0-9.]/g, '') || 0)), 0);
  }, [timelines]);

  // Filtered Timelines
  const filteredTimelines = useMemo(() => {
    return timelines.filter((t) => {
      // Horizon filter (filterYear stores the year or 'ALL')
      const matchesHorizon = filterYear === 'ALL' || String(t.year) === String(filterYear);
      // Status filter
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      // Search query
      const matchesSearch = !searchQuery ||
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.leadExec?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.pillar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(t.deliverables) && t.deliverables.some(d => d.toLowerCase().includes(searchQuery.toLowerCase())));

      return matchesHorizon && matchesStatus && matchesSearch;
    });
  }, [timelines, filterYear, statusFilter, searchQuery]);

  // Quick Quarter Move Handler (Updates quarter while keeping horizon year)
  const handleQuickQuarterMove = (milestone, targetQ) => {
    const updatedQuarter = `${targetQ} ${milestone.year}`;
    dispatch(adjustMilestoneTimeline({
      id: milestone.id,
      quarter: updatedQuarter,
    }));
  };

  // Quick Horizon Shift Handler
  const handleQuickHorizonShift = (milestone, targetHorizonIdx) => {
    const targetYear = activeYears[targetHorizonIdx];
    if (!targetYear) return;
    const currentQ = getCleanQuarter(milestone.quarter);
    const updatedQuarter = `${currentQ} ${targetYear}`;
    const matchedHorizon = horizons[targetHorizonIdx];

    dispatch(adjustMilestoneTimeline({
      id: milestone.id,
      year: targetYear,
      quarter: updatedQuarter,
      horizon: matchedHorizon?.name || `Horizon ${targetHorizonIdx + 1}`,
    }));
  };

  // Create Milestone Submit
  const handleCreateMilestone = (e) => {
    e.preventDefault();
    if (!newMilestone.title) return;

    const targetYear = activeYears[newMilestone.horizonIndex] || String(timelineRange.startYear);
    const matchedHorizon = horizons[newMilestone.horizonIndex];
    const fullQuarter = `${newMilestone.quarterOnly} ${targetYear}`;

    const created = {
      id: `TL-H${newMilestone.horizonIndex + 1}-${Math.floor(100 + Math.random() * 900)}`,
      year: targetYear,
      quarter: fullQuarter,
      title: newMilestone.title,
      horizon: matchedHorizon ? matchedHorizon.name : `Horizon ${newMilestone.horizonIndex + 1}`,
      pillar: newMilestone.pillar,
      capex: newMilestone.capex,
      leadExec: newMilestone.leadExec,
      status: 'SCHEDULED',
      riskScore: newMilestone.riskScore,
      deliverables: newMilestone.deliverables.split(',').map((d) => d.trim()).filter(Boolean),
      strategicImpact: newMilestone.strategicImpact || 'Key enterprise capability deliverable.',
    };

    dispatch(addTimelineMilestone(created));
    setIsCreateModalOpen(false);
    setNewMilestone({
      title: '',
      horizonIndex: 0,
      quarterOnly: 'Q1',
      pillar: 'Autonomous Operations',
      capex: '$3.5M',
      leadExec: 'Elin Torsson (COO)',
      riskScore: 'Low',
      deliverables: 'Architecture validation, Pilot rollout',
      strategicImpact: '',
    });
  };

  // Save Adjustment Specs Submit
  const handleSaveAdjustment = (e) => {
    e.preventDefault();
    if (!editingMilestone) return;

    dispatch(adjustMilestoneTimeline({
      id: editingMilestone.id,
      title: editingMilestone.title,
      year: editingMilestone.year,
      quarter: editingMilestone.quarter,
      capex: editingMilestone.capex,
      riskScore: editingMilestone.riskScore,
      leadExec: editingMilestone.leadExec,
      horizon: editingMilestone.horizon,
    }));
    setEditingMilestone(null);
  };

  // Save Horizon Range Submit
  const handleSaveRange = (e) => {
    e.preventDefault();
    dispatch(setTimelineRange({
      startYear: rangeForm.startYear,
      endYear: rangeForm.endYear,
    }));
    setIsRangeModalOpen(false);
  };

  return (
    <div className="strategy-timelines-page" style={{ paddingBottom: 48, maxWidth: 1400, margin: '0 auto' }}>
      {/* ─── LEADERSHIP & STRATEGY SUITE SUB-NAV ─── */}
      <StrategyNav />
      
      {/* ─── PAGE HEADER (CLEAN ENTERPRISE TITLE, NO HARDCODED YEARS) ─── */}
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
        <div className="page-title-block">
          <div
            className="page-tag"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(99, 102, 241, 0.1)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: '0.03em',
              marginBottom: 8,
            }}
          >
            <Compass size={13} /> Leadership & Strategy · Multi-Horizon Transformation
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', margin: '4px 0 6px 0', color: 'var(--text-primary)' }}>
            Strategic Roadmap & Timelines
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 720, lineHeight: 1.5, margin: 0 }}>
            Orchestrate multi-horizon enterprise milestones, capital expenditure allocations, and executive accountability across continuous strategic phases.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Configure Horizons Trigger */}
          <button
            onClick={() => {
              setRangeForm({ startYear: timelineRange.startYear, endYear: timelineRange.endYear });
              setIsRangeModalOpen(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 15px',
              borderRadius: 8,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 12.5,
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              transition: 'all 0.15s ease',
            }}
            title="Configure planning horizons and timeframe bounds"
          >
            <Settings2 size={15} style={{ color: 'var(--accent)' }} />
            <span>Scope:</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
              {horizons.length} Strategic Horizons
            </span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Plus size={16} /> Add Milestone
          </button>
        </div>
      </div>

      {/* ─── EXECUTIVE METRICS RIBBON (4 ELEGANT STAT CARDS) ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 26,
        }}
      >
        {/* Card 1 */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 12,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Horizons
            </span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            {horizons.length} Horizons
          </div>
          <div style={{ fontSize: 12, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Sparkles size={12} /> Phased Transformation Path
          </div>
        </div>

        {/* Card 2 */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            background: 'linear-gradient(145deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: 12,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Strategic Milestones
            </span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
              <Milestone size={16} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            {timelines.length} Initiatives
          </div>
          <div style={{ fontSize: 12, color: '#22d3ee', display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckCircle2 size={12} /> 100% Assigned to Pillars
          </div>
        </div>

        {/* Card 3 */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            background: 'linear-gradient(145deg, rgba(34, 197, 94, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            borderRadius: 12,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CapEx Investment
            </span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4, fontFamily: 'JetBrains Mono, monospace' }}>
            ${totalCapexNum.toFixed(1)}M
          </div>
          <div style={{ fontSize: 12, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 5 }}>
            <TrendingUp size={12} /> Strategic Capital Allocation
          </div>
        </div>

        {/* Card 4 */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 12,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Execution Readiness
            </span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Shield size={16} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            94.8%
          </div>
          <div style={{ fontSize: 12, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Zap size={12} /> Low Systemic Execution Risk
          </div>
        </div>
      </div>

      {/* ─── INTERACTIVE HORIZON CARDS (CLICK TO FOCUS) ─── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Target size={14} /> Strategic Planning Horizons
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Select a horizon card below to filter initiatives
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(300px, 1fr))`, gap: 16 }}>
          {horizons.map((h, idx) => {
            const palette = HORIZON_PALETTE[idx % HORIZON_PALETTE.length];
            const isSelected = filterYear === String(h.year);
            const horizonInitiatives = timelines.filter((t) => String(t.year) === String(h.year));
            const count = horizonInitiatives.length;

            return (
              <div
                key={idx}
                onClick={() => dispatch(setTimelineFilterYear(isSelected ? 'ALL' : String(h.year)))}
                style={{
                  position: 'relative',
                  background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                  border: isSelected ? `2px solid ${palette.primary}` : '1px solid var(--border-default)',
                  borderRadius: 12,
                  padding: '20px 22px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isSelected ? `0 6px 24px ${palette.glow}` : 'var(--shadow-card)',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                }}
              >
                {/* Top Accent Gradient Line */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: isSelected
                      ? `linear-gradient(90deg, ${palette.primary}, #818cf8)`
                      : 'transparent',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 6,
                      background: palette.bg,
                      color: palette.primary,
                      border: `1px solid ${palette.border}`,
                      letterSpacing: '0.04em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Flag size={11} /> {h.phaseLabel || `Horizon ${idx + 1}`}
                  </div>

                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: isSelected ? palette.primary : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {isSelected ? '● Active Filter' : 'Filter Horizon →'}
                  </span>
                </div>

                <div style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>
                  {h.name}
                </div>

                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.4, minHeight: 34 }}>
                  {h.focus}
                </div>

                {/* Horizon Stats Footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {count} {count === 1 ? 'Initiative' : 'Initiatives'}
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: palette.primary, fontWeight: 700 }}>
                    CapEx Target: {h.capexTarget}
                  </span>
                </div>
              </div>
            );
          })}
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
          gap: 14,
        }}
      >
        {/* Horizon Tabs (NO HARDCODED YEARS) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${filterYear === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => dispatch(setTimelineFilterYear('ALL'))}
            style={{ fontSize: 12, borderRadius: 6, padding: '5px 12px' }}
          >
            All Horizons
          </button>

          {horizons.map((h, idx) => {
            const palette = HORIZON_PALETTE[idx % HORIZON_PALETTE.length];
            const isCurr = filterYear === String(h.year);

            return (
              <button
                key={idx}
                onClick={() => dispatch(setTimelineFilterYear(isCurr ? 'ALL' : String(h.year)))}
                style={{
                  fontSize: 12,
                  fontWeight: isCurr ? 700 : 500,
                  padding: '5px 12px',
                  borderRadius: 6,
                  background: isCurr ? palette.primary : 'var(--bg-elevated)',
                  color: isCurr ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${isCurr ? palette.primary : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{h.phaseLabel || `Horizon ${idx + 1}`}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Search Box */}
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
              placeholder="Search initiatives..."
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
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PLANNED">Planned</option>
            <option value="ACHIEVED">Achieved</option>
          </select>

          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            {filteredTimelines.length} {filteredTimelines.length === 1 ? 'Initiative' : 'Initiatives'}
          </span>
        </div>
      </div>

      {/* ─── TIMELINE STREAM (PREMIUM HIGH-FIDELITY CARDS) ─── */}
      <div style={{ position: 'relative', paddingLeft: 20 }}>
        {/* Continuous Left Vertical Track */}
        <div
          style={{
            position: 'absolute',
            left: 7,
            top: 20,
            bottom: 20,
            width: 2,
            background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.4) 0%, rgba(6, 182, 212, 0.4) 50%, rgba(34, 197, 94, 0.2) 100%)',
          }}
        />

        {filteredTimelines.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              borderRadius: 12,
            }}
          >
            <Milestone size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              No Initiatives Found in Current Scope
            </div>
            <p style={{ fontSize: 13, maxWidth: 420, margin: '0 auto 16px auto' }}>
              No strategic milestones match the selected horizon or search query. You can reset filters or add a new milestone.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                dispatch(setTimelineFilterYear('ALL'));
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              style={{ fontSize: 12.5 }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filteredTimelines.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.SCHEDULED;
              const horizonIdx = activeYears.indexOf(String(item.year));
              const currentHorizonIdx = horizonIdx !== -1 ? horizonIdx : 0;
              const palette = HORIZON_PALETTE[currentHorizonIdx % HORIZON_PALETTE.length];
              const cleanQ = getCleanQuarter(item.quarter);
              const horizonLabel = getHorizonLabel(item.year);

              return (
                <div key={item.id} style={{ position: 'relative' }}>
                  {/* Glowing Node on Timeline Track */}
                  <div
                    style={{
                      position: 'absolute',
                      left: -19,
                      top: 24,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: palette.primary,
                      border: '2px solid var(--bg-surface)',
                      boxShadow: `0 0 12px ${palette.primary}`,
                    }}
                  />

                  {/* Card Container */}
                  <div
                    className="card"
                    style={{
                      padding: '22px 24px',
                      borderRadius: 12,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      transition: 'all 0.2s ease',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    {/* ─── INTERACTIVE TIMELINE QUICK-POSITIONER STRIP ─── */}
                    <div
                      style={{
                        background: 'var(--bg-elevated)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        marginBottom: 16,
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                      }}
                    >
                      {/* Left: Horizon & Clean Quarter Badge + Prev/Next */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 6,
                            background: palette.bg,
                            color: palette.primary,
                            fontFamily: 'JetBrains Mono, monospace',
                            border: `1px solid ${palette.border}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <Flag size={12} /> {horizonLabel} · {cleanQ}
                        </span>

                        {/* Prev / Next Shift Arrows */}
                        <div
                          style={{
                            display: 'inline-flex',
                            background: 'var(--bg-base)',
                            borderRadius: 6,
                            border: '1px solid var(--border-subtle)',
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            title="Shift back one Quarter"
                            onClick={() => dispatch(shiftMilestoneQuarter({ id: item.id, delta: -1 }))}
                            style={{
                              padding: '4px 9px',
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              fontSize: 11.5,
                              fontWeight: 600,
                            }}
                          >
                            <ChevronLeft size={13} /> Prev Q
                          </button>
                          <div style={{ width: 1, background: 'var(--border-subtle)' }} />
                          <button
                            title="Shift forward one Quarter"
                            onClick={() => dispatch(shiftMilestoneQuarter({ id: item.id, delta: 1 }))}
                            style={{
                              padding: '4px 9px',
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              fontSize: 11.5,
                              fontWeight: 600,
                            }}
                          >
                            Next Q <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Center: Fast Quarter Segmented Selector [ Q1 | Q2 | Q3 | Q4 ] */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Quarter:</span>
                        <div
                          style={{
                            display: 'inline-flex',
                            background: 'var(--bg-base)',
                            borderRadius: 6,
                            padding: 2,
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
                            const isCurrentQ = cleanQ === q;
                            return (
                              <button
                                key={q}
                                onClick={() => handleQuickQuarterMove(item, q)}
                                style={{
                                  padding: '3px 10px',
                                  borderRadius: 4,
                                  border: 'none',
                                  fontSize: 11,
                                  fontWeight: isCurrentQ ? 700 : 500,
                                  cursor: 'pointer',
                                  background: isCurrentQ ? palette.primary : 'transparent',
                                  color: isCurrentQ ? '#fff' : 'var(--text-secondary)',
                                  transition: 'all 0.15s ease',
                                }}
                                title={`Set target quarter to ${q}`}
                              >
                                {q}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Horizon Switcher [ Horizon 1 | Horizon 2 | Horizon 3 ] */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Horizon:</span>
                        <div
                          style={{
                            display: 'inline-flex',
                            background: 'var(--bg-base)',
                            borderRadius: 6,
                            padding: 2,
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {horizons.map((h, idx) => {
                            const isCurrentH = currentHorizonIdx === idx;
                            return (
                              <button
                                key={idx}
                                onClick={() => handleQuickHorizonShift(item, idx)}
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: 4,
                                  border: 'none',
                                  fontSize: 11,
                                  fontWeight: isCurrentH ? 700 : 500,
                                  cursor: 'pointer',
                                  background: isCurrentH ? 'var(--accent)' : 'transparent',
                                  color: isCurrentH ? '#fff' : 'var(--text-secondary)',
                                  transition: 'all 0.15s ease',
                                }}
                                title={`Move initiative to Horizon ${idx + 1}`}
                              >
                                H{idx + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => setEditingMilestone({ ...item })}
                          style={{ fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--accent)' }}
                          title="Open detailed specifications modal"
                        >
                          <SlidersHorizontal size={13} /> Adjust Specs
                        </button>

                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => {
                            if (confirm(`Remove milestone "${item.title}" from strategic timeline?`)) {
                              dispatch(deleteMilestone({ id: item.id }));
                            }
                          }}
                          style={{ fontSize: 11.5, color: 'var(--danger)', padding: '5px 7px' }}
                          title="Delete Milestone"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* ─── CARD HEADER ROW: PILLAR, HORIZON, STATUS DROPDOWN ─── */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 10,
                        flexWrap: 'wrap',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {item.pillar}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          • {item.horizon}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 12,
                            color: statusCfg.color,
                            background: statusCfg.bg,
                            border: `1px solid ${statusCfg.border}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusCfg.dot }} />
                          {statusCfg.label}
                        </span>

                        <select
                          value={item.status}
                          onChange={(e) => dispatch(updateTimelineStatus({ id: item.id, status: e.target.value }))}
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
                          <option value="SCHEDULED">Scheduled</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="PLANNED">Planned</option>
                          <option value="ACHIEVED">Achieved</option>
                        </select>
                      </div>
                    </div>

                    {/* ─── TITLE & STRATEGIC VALUE IMPACT ─── */}
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.015em' }}>
                      {item.title}
                    </h3>
                    <div
                      style={{
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        marginBottom: 16,
                        background: 'rgba(99, 102, 241, 0.05)',
                        border: '1px solid rgba(99, 102, 241, 0.15)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}
                    >
                      <Sparkles size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Strategic Impact:</strong> {item.strategicImpact}
                      </div>
                    </div>

                    {/* ─── DELIVERABLES CHECKLIST ─── */}
                    <div
                      style={{
                        background: 'var(--bg-elevated)',
                        padding: '12px 16px',
                        borderRadius: 8,
                        marginBottom: 16,
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                        Key Milestone Deliverables
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8 }}>
                        {item.deliverables && item.deliverables.map((deliv, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--text-primary)' }}>
                            <CheckCircle2 size={14} color="var(--success)" style={{ flexShrink: 0 }} />
                            <span>{deliv}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ─── FOOTER METADATA SPECS ─── */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        paddingTop: 12,
                        borderTop: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <DollarSign size={14} color="var(--accent)" />
                        <span>CapEx Allocation:</span>
                        <strong style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                          {item.capex}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <UserCheck size={14} color="#818cf8" />
                        <span>Executive Lead:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{item.leadExec}</strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Shield size={14} color={item.riskScore === 'High' ? 'var(--danger)' : item.riskScore === 'Medium' ? 'var(--warning)' : 'var(--success)'} />
                        <span>Risk Level:</span>
                        <span
                          style={{
                            fontWeight: 700,
                            color: item.riskScore === 'High' ? 'var(--danger)' : item.riskScore === 'Medium' ? 'var(--warning)' : 'var(--success)',
                          }}
                        >
                          {item.riskScore}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── MODAL: CONFIGURE PLANNING HORIZONS & RANGE ─── */}
      {isRangeModalOpen && (
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
          <div className="card" style={{ width: '100%', maxWidth: 520, padding: 26, boxShadow: 'var(--shadow-modal)', borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Strategic Governance
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, margin: '2px 0 4px 0' }}>Configure Planning Horizons</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  Adjust the start and end span of your multi-horizon roadmap. Horizons and quarters adapt automatically.
                </p>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsRangeModalOpen(false)} style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Start Horizon Year
                  </label>
                  <select
                    value={rangeForm.startYear}
                    onChange={(e) => setRangeForm({ ...rangeForm, startYear: parseInt(e.target.value) })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    {[2024, 2025, 2026, 2027, 2028].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    End Horizon Year
                  </label>
                  <select
                    value={rangeForm.endYear}
                    onChange={(e) => setRangeForm({ ...rangeForm, endYear: parseInt(e.target.value) })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    {[2028, 2029, 2030, 2031, 2032, 2033].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-elevated)',
                  padding: 14,
                  borderRadius: 8,
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Configured scope yields <strong>{Math.max(1, rangeForm.endYear - rangeForm.startYear + 1)} Horizons</strong> ({rangeForm.startYear} through {rangeForm.endYear}). All quarters and milestone scheduling tracks will sync seamlessly without needing manual recalculation.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsRangeModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Check size={16} /> Save Horizon Scope
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADJUST MILESTONE SPECS ─── */}
      {editingMilestone && (
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
                <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                  {editingMilestone.id}
                </span>
                <h3 style={{ fontSize: 19, fontWeight: 700, margin: '2px 0 4px 0' }}>Adjust Milestone Specs</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  Modify horizon placement, target quarter, and executive parameters.
                </p>
              </div>
              <button className="btn btn-ghost" onClick={() => setEditingMilestone(null)} style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Milestone Initiative Title
                </label>
                <input
                  type="text"
                  required
                  value={editingMilestone.title}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Strategic Horizon
                  </label>
                  <select
                    value={editingMilestone.year}
                    onChange={(e) => {
                      const yr = e.target.value;
                      const qtrOnly = getCleanQuarter(editingMilestone.quarter);
                      const matchedH = horizons.find((h) => String(h.year) === String(yr));
                      setEditingMilestone({
                        ...editingMilestone,
                        year: yr,
                        quarter: `${qtrOnly} ${yr}`,
                        horizon: matchedH?.name || editingMilestone.horizon,
                      });
                    }}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    {activeYears.map((yr, idx) => (
                      <option key={yr} value={yr}>
                        Horizon {idx + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Scheduled Quarter
                  </label>
                  <select
                    value={getCleanQuarter(editingMilestone.quarter)}
                    onChange={(e) => {
                      const q = e.target.value;
                      setEditingMilestone({
                        ...editingMilestone,
                        quarter: `${q} ${editingMilestone.year}`,
                      });
                    }}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    CapEx Allocation
                  </label>
                  <input
                    type="text"
                    value={editingMilestone.capex}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, capex: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Risk Level
                  </label>
                  <select
                    value={editingMilestone.riskScore}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, riskScore: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Executive Lead
                </label>
                <input
                  type="text"
                  value={editingMilestone.leadExec}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, leadExec: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditingMilestone(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Check size={16} /> Save Adjustments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: NEW STRATEGIC MILESTONE ─── */}
      {isCreateModalOpen && (
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
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Roadmap Planning
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, margin: '2px 0 4px 0' }}>Add Strategic Milestone</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  Schedule a major initiative across your enterprise horizons.
                </p>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsCreateModalOpen(false)} style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Milestone Initiative Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pan-European Autonomous Supply Chain Brokerage Launch"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Strategic Horizon
                  </label>
                  <select
                    value={newMilestone.horizonIndex}
                    onChange={(e) => setNewMilestone({ ...newMilestone, horizonIndex: parseInt(e.target.value) })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    {horizons.map((h, idx) => (
                      <option key={idx} value={idx}>
                        {h.phaseLabel || `Horizon ${idx + 1}`}: {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Target Quarter
                  </label>
                  <select
                    value={newMilestone.quarterOnly}
                    onChange={(e) => setNewMilestone({ ...newMilestone, quarterOnly: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Corporate Pillar
                  </label>
                  <select
                    value={newMilestone.pillar}
                    onChange={(e) => setNewMilestone({ ...newMilestone, pillar: e.target.value })}
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
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    CapEx Allocation
                  </label>
                  <input
                    type="text"
                    value={newMilestone.capex}
                    onChange={(e) => setNewMilestone({ ...newMilestone, capex: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Executive Lead
                  </label>
                  <input
                    type="text"
                    value={newMilestone.leadExec}
                    onChange={(e) => setNewMilestone({ ...newMilestone, leadExec: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Risk Level
                  </label>
                  <select
                    value={newMilestone.riskScore}
                    onChange={(e) => setNewMilestone({ ...newMilestone, riskScore: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Key Deliverables (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Multi-currency clearing, AI negotiations model"
                  value={newMilestone.deliverables}
                  onChange={(e) => setNewMilestone({ ...newMilestone, deliverables: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Strategic Enterprise Impact
                </label>
                <input
                  type="text"
                  placeholder="e.g. Expands operational gross margin by 18%."
                  value={newMilestone.strategicImpact}
                  onChange={(e) => setNewMilestone({ ...newMilestone, strategicImpact: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Plus size={16} /> Schedule Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelinesPage;
