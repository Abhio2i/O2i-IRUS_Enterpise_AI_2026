import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addWorkflowImprovement,
  updateWorkflowStage,
  deployWorkflowImprovement,
  applyAiRecommendation,
  deleteWorkflowImprovement,
} from '../../store/operationsSlice';
import {
  Workflow, Zap, TrendingUp, DollarSign, Clock, ShieldCheck,
  CheckCircle2, AlertCircle, ArrowRight, Plus, Search, Filter,
  Play, Sparkles, ChevronRight, Sliders, Check, X, Eye, Trash2,
  Cpu, Activity, Layers, Gauge, RefreshCw, BarChart2, ArrowUpRight,
  GitBranch, Terminal, ShieldAlert
} from 'lucide-react';

const STAGE_CONFIG = {
  DEPLOYED_LIVE: {
    label: 'DEPLOYED LIVE',
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.3)',
    dot: '#4ade80',
  },
  IN_OPTIMIZATION: {
    label: 'IN OPTIMIZATION',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.3)',
    dot: '#22d3ee',
  },
  BENCHMARKING: {
    label: 'BENCHMARKING',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.3)',
    dot: '#a78bfa',
  },
  IDENTIFIED: {
    label: 'IDENTIFIED',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    dot: '#fbbf24',
  },
};

const DOMAIN_COLORS = {
  'Accounts Payable & Invoicing': { text: '#818cf8', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.25)' },
  'Freight Customs & Logistics': { text: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)', border: 'rgba(56, 189, 248, 0.25)' },
  'Procurement & PO': { text: '#f472b6', bg: 'rgba(244, 114, 182, 0.1)', border: 'rgba(244, 114, 182, 0.25)' },
  'Customer Settlement': { text: '#34d399', bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.25)' },
};

export const WorkflowImprovementsPage = () => {
  const dispatch = useDispatch();
  const workflows = useSelector((s) => s.operations.workflowImprovements || []);
  const recommendations = useSelector((s) => s.operations.workflowRecommendations || []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [inspectingWorkflow, setInspectingWorkflow] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // New Workflow Form
  const [newWorkflow, setNewWorkflow] = useState({
    title: '',
    domain: 'Accounts Payable & Invoicing',
    baselineTime: '45.0 min',
    optimizedTime: '2.0 min',
    speedup: '95.5%',
    hoursSavedMo: 380,
    annualSavings: '$52,000',
    stpRate: '94.0%',
    lead: 'Elin Torsson (COO)',
    steps: 'Document OCR Ingestion, Tolerance Rules Engine, REST ERP Posting',
    impactSummary: 'Eliminates manual human verification on regular recurring vouchers.',
  });

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtered workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter((w) => {
      const matchStage = selectedStage === 'ALL' || w.stage === selectedStage;
      const matchDomain = selectedDomain === 'ALL' || w.domain === selectedDomain;
      const matchSearch = !searchQuery ||
        w.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.lead?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.id?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStage && matchDomain && matchSearch;
    });
  }, [workflows, selectedStage, selectedDomain, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalHoursMo = workflows.reduce((acc, w) => acc + (w.hoursSavedMo || 0), 0);
    const totalSavingsNum = workflows.reduce((acc, w) => {
      const num = parseFloat(w.annualSavings?.replace(/[^0-9.]/g, '') || 0);
      return acc + num;
    }, 0);
    const deployedCount = workflows.filter(w => w.stage === 'DEPLOYED_LIVE').length;
    const avgStp = workflows.length
      ? (workflows.reduce((acc, w) => acc + parseFloat(w.stpRate || 90), 0) / workflows.length).toFixed(1)
      : '93.5';

    return {
      totalWorkflows: workflows.length,
      deployedCount,
      totalHoursMo,
      totalSavingsNum,
      avgStp,
    };
  }, [workflows]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newWorkflow.title) return;

    const stepsArray = newWorkflow.steps
      .split(',')
      .map((s, idx) => ({
        name: s.trim(),
        type: idx === 0 ? 'Document AI' : idx === 1 ? 'Logic Gateway' : 'API Dispatcher',
        latency: `${Math.floor(40 + Math.random() * 180)}ms`,
        auto: true,
      }))
      .filter(s => s.name);

    const created = {
      id: `WFI-MAN-${Math.floor(100 + Math.random() * 900)}`,
      title: newWorkflow.title,
      domain: newWorkflow.domain,
      stage: 'IN_OPTIMIZATION',
      baselineTime: newWorkflow.baselineTime,
      optimizedTime: newWorkflow.optimizedTime,
      speedup: newWorkflow.speedup,
      hoursSavedMo: parseInt(newWorkflow.hoursSavedMo) || 200,
      annualSavings: newWorkflow.annualSavings,
      stpRate: newWorkflow.stpRate,
      lead: newWorkflow.lead,
      steps: stepsArray,
      impactSummary: newWorkflow.impactSummary,
    };

    dispatch(addWorkflowImprovement(created));
    setIsAddModalOpen(false);
    showNotification(`Workflow initiative "${created.title}" added to optimization pipeline.`);
    setNewWorkflow({
      title: '',
      domain: 'Accounts Payable & Invoicing',
      baselineTime: '45.0 min',
      optimizedTime: '2.0 min',
      speedup: '95.5%',
      hoursSavedMo: 380,
      annualSavings: '$52,000',
      stpRate: '94.0%',
      lead: 'Elin Torsson (COO)',
      steps: 'Document OCR Ingestion, Tolerance Rules Engine, REST ERP Posting',
      impactSummary: 'Eliminates manual human verification on regular recurring vouchers.',
    });
  };

  const handleDeploy = (id, title) => {
    dispatch(deployWorkflowImprovement({ id }));
    showNotification(`Workflow "${title}" deployed live! Automated savings enabled.`);
  };

  const handleApplyRec = (rec) => {
    dispatch(applyAiRecommendation({ id: rec.id }));
    showNotification(`Applied AI recommendation: "${rec.title}" converted into active workflow!`);
  };

  return (
    <div className="operations-workflow-page" style={{ paddingBottom: 48, maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ─── TOAST NOTIFICATION ─── */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1100,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--accent)',
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
          <Sparkles size={16} color="var(--accent)" />
          <span>{notification}</span>
        </div>
      )}

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
              color: '#22d3ee',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: '0.03em',
              marginBottom: 8,
            }}
          >
            <Workflow size={13} /> Operations · Continuous Kaizen & Cognitive Optimization
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', margin: '4px 0 6px 0', color: 'var(--text-primary)' }}>
            Workflow Improvements
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 740, lineHeight: 1.5, margin: 0 }}>
            Identify latency bottlenecks, simulate automated agent handoffs, and deploy self-healing cognitive execution loops across core enterprise workflows.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => showNotification('Running real-time simulation on 38 connected workflow DAGs...')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600 }}
          >
            <Play size={14} /> Run Simulation
          </button>

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
            <Plus size={16} /> New Workflow Initiative
          </button>
        </div>
      </div>

      {/* ─── EXECUTIVE METRICS RIBBON (4 GLOWING KPI CARDS) ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Card 1: Active Workflows */}
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
              Optimized Workflows
            </span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
              <Workflow size={16} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            {metrics.totalWorkflows} Workflows
          </div>
          <div style={{ fontSize: 12, color: '#22d3ee', display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckCircle2 size={12} /> {metrics.deployedCount} Deployed Live in Production
          </div>
        </div>

        {/* Card 2: Cycle Time Drop */}
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
              Avg Latency Reduction
            </span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Zap size={16} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            -94.2%
          </div>
          <div style={{ fontSize: 12, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={12} /> Reduced from 44.5m to 2.5m avg
          </div>
        </div>

        {/* Card 3: Straight-Through Rate */}
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
              Autonomous STP Rate
            </span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
              <Gauge size={16} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            {metrics.avgStp}%
          </div>
          <div style={{ fontSize: 12, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 5 }}>
            <TrendingUp size={12} /> Zero-Touch Autonomous Execution
          </div>
        </div>

        {/* Card 4: Cost Savings */}
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
              Annual Savings Pool
            </span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4, fontFamily: 'JetBrains Mono, monospace' }}>
            ${metrics.totalSavingsNum.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Activity size={12} /> {metrics.totalHoursMo.toLocaleString()} Hours Reclaimed / mo
          </div>
        </div>
      </div>

      {/* ─── AI KAIZEN RECOMMENDATIONS PANEL ─── */}
      <div
        className="card"
        style={{
          padding: '18px 20px',
          marginBottom: 24,
          borderRadius: 12,
          background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.06) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent)' }}>
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                Agentic Kaizen Engine · Real-Time Improvement Suggestions
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Identified from active event telemetry and execution trace bottlenecks.
              </div>
            </div>
          </div>

          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            Updated 2m ago · 3 Discovered
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              style={{
                background: 'var(--bg-elevated)',
                border: rec.applied ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--border-default)',
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 4,
                      background: 'rgba(6, 182, 212, 0.1)',
                      color: '#06b6d4',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                    }}
                  >
                    {rec.domain}
                  </span>

                  <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--success)', fontWeight: 700 }}>
                    {rec.confidence} Match
                  </span>
                </div>

                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {rec.title}
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 12 }}>
                  {rec.description}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 10,
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Saves <strong style={{ color: 'var(--text-primary)' }}>{rec.estimatedHoursSaved}h/mo</strong> ({rec.cycleTimeCut})
                </div>

                {rec.applied ? (
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> Applied & Deployed
                  </span>
                ) : (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleApplyRec(rec)}
                    style={{ fontSize: 11.5, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <Zap size={12} /> Apply Optimization
                  </button>
                )}
              </div>
            </div>
          ))}
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
        {/* Stage Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${selectedStage === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedStage('ALL')}
            style={{ fontSize: 12, borderRadius: 6, padding: '5px 12px' }}
          >
            All Workflows ({workflows.length})
          </button>

          {Object.keys(STAGE_CONFIG).map((stageKey) => {
            const cfg = STAGE_CONFIG[stageKey];
            const isCurr = selectedStage === stageKey;
            const count = workflows.filter(w => w.stage === stageKey).length;

            return (
              <button
                key={stageKey}
                onClick={() => setSelectedStage(stageKey)}
                style={{
                  fontSize: 12,
                  fontWeight: isCurr ? 700 : 500,
                  padding: '5px 12px',
                  borderRadius: 6,
                  background: isCurr ? cfg.color : 'var(--bg-elevated)',
                  color: isCurr ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${isCurr ? cfg.color : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{cfg.label}</span>
                <span
                  style={{
                    fontSize: 10.5,
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: isCurr ? 'rgba(0,0,0,0.2)' : 'var(--bg-surface)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Domain & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Domain Dropdown */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
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
            <option value="ALL">All Domains</option>
            <option value="Accounts Payable & Invoicing">Accounts Payable</option>
            <option value="Freight Customs & Logistics">Logistics & Customs</option>
            <option value="Procurement & PO">Procurement & PO</option>
            <option value="Customer Settlement">Settlement & Treasury</option>
          </select>

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
              placeholder="Search workflows..."
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
        </div>
      </div>

      {/* ─── WORKFLOW IMPROVEMENTS LIST / CARDS ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {filteredWorkflows.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              borderRadius: 12,
            }}
          >
            <Workflow size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              No Workflows Found
            </div>
            <p style={{ fontSize: 13, maxWidth: 420, margin: '0 auto 16px auto' }}>
              No workflow improvement initiatives match your selected criteria. Reset filters or create a new initiative.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedStage('ALL');
                setSelectedDomain('ALL');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredWorkflows.map((item) => {
            const stageCfg = STAGE_CONFIG[item.stage] || STAGE_CONFIG.IDENTIFIED;
            const domColor = DOMAIN_COLORS[item.domain] || { text: '#818cf8', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.25)' };

            return (
              <div
                key={item.id}
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
                {/* ─── CARD TOP BAR: ID, DOMAIN, STAGE & ACTIONS ─── */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {item.id}
                    </span>

                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: domColor.bg,
                        color: domColor.text,
                        border: `1px solid ${domColor.border}`,
                      }}
                    >
                      {item.domain}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Stage Badge */}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 12,
                        color: stageCfg.color,
                        background: stageCfg.bg,
                        border: `1px solid ${stageCfg.border}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: stageCfg.dot }} />
                      {stageCfg.label}
                    </span>

                    {/* Stage Selector Dropdown */}
                    <select
                      value={item.stage}
                      onChange={(e) => dispatch(updateWorkflowStage({ id: item.id, stage: e.target.value }))}
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
                      <option value="DEPLOYED_LIVE">Deployed Live</option>
                      <option value="IN_OPTIMIZATION">In Optimization</option>
                      <option value="BENCHMARKING">Benchmarking</option>
                      <option value="IDENTIFIED">Identified</option>
                    </select>

                    {item.stage !== 'DEPLOYED_LIVE' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleDeploy(item.id, item.title)}
                        style={{ fontSize: 11, padding: '3px 9px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        title="Deploy to live automated execution"
                      >
                        <Zap size={12} /> Deploy Live
                      </button>
                    )}

                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => setInspectingWorkflow(item)}
                      style={{ fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent)' }}
                      title="Inspect workflow DAG and architecture"
                    >
                      <Eye size={13} /> Inspect
                    </button>

                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => {
                        if (confirm(`Remove workflow initiative "${item.title}"?`)) {
                          dispatch(deleteWorkflowImprovement({ id: item.id }));
                        }
                      }}
                      style={{ fontSize: 11.5, color: 'var(--danger)', padding: '4px 6px' }}
                      title="Delete initiative"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Title & Impact Summary */}
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.015em' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                  {item.impactSummary}
                </p>

                {/* ─── BEFORE VS AFTER VISUAL PERFORMANCE BOX ─── */}
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 10,
                    padding: '14px 18px',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Latency & Throughput Optimization Delta
                    </div>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: 'var(--success)',
                        background: 'rgba(34, 197, 94, 0.1)',
                        padding: '2px 8px',
                        borderRadius: 4,
                        border: '1px solid rgba(34, 197, 94, 0.25)',
                      }}
                    >
                      {item.speedup} Execution Velocity Gain
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                    {/* Baseline */}
                    <div style={{ background: 'var(--bg-base)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Manual Baseline Latency</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--danger)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {item.baselineTime}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Manual human touchpoint required</div>
                    </div>

                    {/* Optimized */}
                    <div style={{ background: 'var(--bg-base)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Autonomous Pipeline Latency</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {item.optimizedTime}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 2 }}>Sub-second agentic handoff</div>
                    </div>

                    {/* STP Rate */}
                    <div style={{ background: 'var(--bg-base)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Straight-Through Rate</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {item.stpRate}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Zero human intervention</div>
                    </div>
                  </div>
                </div>

                {/* ─── AUTOMATED PIPELINE STEP FLOW ─── */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                    Autonomous Execution Chain:
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {item.steps && item.steps.map((st, sIdx) => (
                      <React.Fragment key={sIdx}>
                        <div
                          style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 6,
                            padding: '6px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 12,
                          }}
                        >
                          <CheckCircle2 size={13} color="var(--success)" />
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{st.name}</span>
                          <span style={{ fontSize: 10.5, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                            ({st.latency})
                          </span>
                        </div>

                        {sIdx < item.steps.length - 1 && (
                          <ArrowRight size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* ─── FOOTER SPECS & SAVINGS ─── */}
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
                    <Clock size={13} color="var(--accent)" />
                    <span>Monthly Hours Reclaimed:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{item.hoursSavedMo} hrs / mo</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <DollarSign size={13} color="var(--success)" />
                    <span>Annualized Cost Savings:</span>
                    <strong style={{ color: 'var(--success)', fontFamily: 'JetBrains Mono, monospace' }}>{item.annualSavings}</strong>
                  </div>

                  <div>
                    <span>Owner / Eng Sponsor:</span>{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>{item.lead}</strong>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── MODAL: INSPECT WORKFLOW DAG & ARCHITECTURE ─── */}
      {inspectingWorkflow && (
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
          <div className="card" style={{ width: '100%', maxWidth: 640, padding: 26, boxShadow: 'var(--shadow-modal)', borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                  {inspectingWorkflow.id} · {inspectingWorkflow.domain}
                </span>
                <h3 style={{ fontSize: 19, fontWeight: 700, margin: '2px 0 4px 0' }}>
                  {inspectingWorkflow.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  Architectural DAG breakdown and cognitive step parameters.
                </p>
              </div>
              <button className="btn btn-ghost" onClick={() => setInspectingWorkflow(null)} style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 8, fontSize: 13, lineHeight: 1.5 }}>
                <strong>Strategic Impact:</strong> {inspectingWorkflow.impactSummary}
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                  Detailed Step Specifications & Latency Profile
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {inspectingWorkflow.steps?.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: 'var(--bg-elevated)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 700,
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {sIdx + 1}
                        </span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{step.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Type: {step.type}</div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)', fontWeight: 600 }}>
                          {step.latency}
                        </span>
                        <div style={{ fontSize: 10.5, color: 'var(--success)' }}>Autonomous loop</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
                <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lead Engineer / Sponsor</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{inspectingWorkflow.lead}</div>
                </div>
                <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Straight-Through Rate</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)', marginTop: 2 }}>{inspectingWorkflow.stpRate}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button className="btn btn-primary" onClick={() => setInspectingWorkflow(null)}>
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE WORKFLOW INITIATIVE ─── */}
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
          <div className="card" style={{ width: '100%', maxWidth: 560, padding: 26, boxShadow: 'var(--shadow-modal)', borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Kaizen Initiative
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, margin: '2px 0 4px 0' }}>Add Workflow Improvement</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  Define a new process optimization initiative to benchmark and deploy.
                </p>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)} style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Workflow Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Automated Customs Tax Harmonization & Tariff Clearing"
                  value={newWorkflow.title}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, title: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Operational Domain
                  </label>
                  <select
                    value={newWorkflow.domain}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, domain: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="Accounts Payable & Invoicing">Accounts Payable & Invoicing</option>
                    <option value="Freight Customs & Logistics">Freight Customs & Logistics</option>
                    <option value="Procurement & PO">Procurement & PO</option>
                    <option value="Customer Settlement">Customer Settlement</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Lead Engineer / Sponsor
                  </label>
                  <input
                    type="text"
                    value={newWorkflow.lead}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, lead: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Baseline Latency
                  </label>
                  <input
                    type="text"
                    value={newWorkflow.baselineTime}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, baselineTime: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Optimized Target Latency
                  </label>
                  <input
                    type="text"
                    value={newWorkflow.optimizedTime}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, optimizedTime: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Expected Monthly Hours Saved
                  </label>
                  <input
                    type="number"
                    value={newWorkflow.hoursSavedMo}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, hoursSavedMo: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Annual Cost Savings ($)
                  </label>
                  <input
                    type="text"
                    value={newWorkflow.annualSavings}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, annualSavings: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Execution Pipeline Steps (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Document Extraction, Tolerance Check, SAP Posting"
                  value={newWorkflow.steps}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, steps: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Impact Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cuts customs dwell times by 95%."
                  value={newWorkflow.impactSummary}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, impactSummary: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Plus size={16} /> Add to Optimization Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowImprovementsPage;
