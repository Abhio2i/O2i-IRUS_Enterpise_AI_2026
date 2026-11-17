import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addProject, updateProjectStatus, toggleMilestone } from '../../store/operationsSlice';
import {
  FolderKanban, Plus, Search, Filter, CheckCircle2, Circle, AlertCircle,
  Clock, TrendingUp, DollarSign, Calendar, Tag, User, Layers, ArrowUpRight,
  Shield, Check, X
} from 'lucide-react';

const HEALTH_CONFIG = {
  ON_TRACK: { label: 'ON TRACK', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)' },
  AT_RISK: { label: 'AT RISK', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' },
  DELAYED: { label: 'DELAYED', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' },
  COMPLETED: { label: 'COMPLETED', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.3)' },
};

const PRIORITY_BADGES = {
  CRITICAL: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
  HIGH: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)' },
  MEDIUM: { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' },
  LOW: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
};

export const ProjectsPage = () => {
  const dispatch = useDispatch();
  const projects = useSelector((s) => s.operations.projects || []);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // New Project Form State
  const [newProject, setNewProject] = useState({
    code: '',
    name: '',
    dept: 'Enterprise Operations',
    owner: '',
    priority: 'HIGH',
    budget: '$150,000',
    spent: '$20,000',
    targetDate: '2026-12-31',
    description: '',
    tags: 'Kafka, Automation, AI',
  });

  const departments = ['ALL', ...new Set(projects.map((p) => p.dept))];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || p.dept === deptFilter;
    const matchesHealth = healthFilter === 'ALL' || p.health === healthFilter;
    return matchesSearch && matchesDept && matchesHealth;
  });

  const totalBudgetNum = projects.reduce((acc, p) => acc + parseInt(p.budget.replace(/[^0-9]/g, '') || 0), 0);
  const totalSpentNum = projects.reduce((acc, p) => acc + parseInt(p.spent.replace(/[^0-9]/g, '') || 0), 0);
  const avgProgress = Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / (projects.length || 1));
  const onTrackCount = projects.filter((p) => p.health === 'ON_TRACK').length;

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProject.name || !newProject.code) return;

    const created = {
      id: `PRJ-${Math.floor(400 + Math.random() * 500)}`,
      code: newProject.code.toUpperCase(),
      name: newProject.name,
      description: newProject.description || 'Enterprise operations initiative.',
      dept: newProject.dept,
      owner: newProject.owner || 'Operations Lead',
      pmEmail: `${newProject.owner.toLowerCase().replace(/\s+/g, '.')}@bjorn.com`,
      priority: newProject.priority,
      status: 'IN_PROGRESS',
      health: 'ON_TRACK',
      budget: newProject.budget,
      spent: newProject.spent,
      progress: 15,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: newProject.targetDate,
      tags: newProject.tags.split(',').map((t) => t.trim()).filter(Boolean),
      milestones: [
        { id: 'M1', name: 'Architecture Review & Kickoff', dueDate: '2026-11-15', completed: true },
        { id: 'M2', name: 'Core Pipeline Execution & MVP', dueDate: '2026-12-05', completed: false },
        { id: 'M3', name: 'Enterprise UAT & Sign-Off', dueDate: newProject.targetDate, completed: false },
      ],
      kpis: { throughputTarget: '99% Uptime', autonomousTarget: '90%', slaBreachLimit: '<0.1%' }
    };

    dispatch(addProject(created));
    setIsModalOpen(false);
    setNewProject({
      code: '',
      name: '',
      dept: 'Enterprise Operations',
      owner: '',
      priority: 'HIGH',
      budget: '$150,000',
      spent: '$20,000',
      targetDate: '2026-12-31',
      description: '',
      tags: 'Kafka, Automation, AI',
    });
  };

  return (
    <div className="projects-page">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-title-block">
          <div className="page-tag">Operations · Portfolio & Delivery [OPS-PRJ]</div>
          <h2>Projects Management</h2>
          <p>Strategic portfolio tracking, delivery timelines, milestone velocity, and budget utilization across operations initiatives.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', fontWeight: 600 }}
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid cols-4" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">Active Portfolio <FolderKanban size={13} /></div>
          <div className="stat-value">{projects.length}</div>
          <div className="stat-sub" style={{ color: 'var(--success)' }}>{onTrackCount} On-Track Initiatives</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Average Progress <TrendingUp size={13} /></div>
          <div className="stat-value">{avgProgress}%</div>
          <div className="stat-sub">Across all active phases</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Allocated Budget <DollarSign size={13} /></div>
          <div className="stat-value">${(totalBudgetNum / 1000).toFixed(0)}k</div>
          <div className="stat-sub">${(totalSpentNum / 1000).toFixed(0)}k spent ({Math.round((totalSpentNum / totalBudgetNum) * 100)}%)</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Critical Delivery <Clock size={13} /></div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {projects.filter((p) => p.priority === 'CRITICAL').length}
          </div>
          <div className="stat-sub">High-impact milestones</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search input */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by project name, code, or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ width: '100%', paddingLeft: 34, height: 38 }}
            />
          </div>

          {/* Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="input"
              style={{ height: 38, padding: '4px 10px', fontSize: 13 }}
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Health Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Health:</span>
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="input"
              style={{ height: 38, padding: '4px 10px', fontSize: 13 }}
            >
              <option value="ALL">All Health</option>
              <option value="ON_TRACK">On Track</option>
              <option value="AT_RISK">At Risk</option>
              <option value="DELAYED">Delayed</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
        {filteredProjects.map((project) => {
          const healthCfg = HEALTH_CONFIG[project.health] || HEALTH_CONFIG.ON_TRACK;
          const prioCfg = PRIORITY_BADGES[project.priority] || PRIORITY_BADGES.MEDIUM;
          const completedMilestones = project.milestones.filter((m) => m.completed).length;

          return (
            <div
              key={project.id}
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.15s ease, transform 0.15s ease',
              }}
            >
              <div>
                {/* Header row: Code, Priority, Health badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
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
                      {project.code}
                    </span>
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 4,
                        color: prioCfg.color,
                        background: prioCfg.bg,
                      }}
                    >
                      {project.priority}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: 12,
                      color: healthCfg.color,
                      background: healthCfg.bg,
                      border: `1px solid ${healthCfg.border}`,
                      letterSpacing: '0.02em',
                    }}
                  >
                    ● {healthCfg.label}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, lineHeight: 1.35 }}>
                  {project.name}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5, minHeight: 40 }}>
                  {project.description}
                </p>

                {/* Progress bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Milestone Completion</span>
                    <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{project.progress}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${project.progress}%`,
                        background: project.health === 'DELAYED' ? 'var(--danger)' : project.health === 'AT_RISK' ? 'var(--warning)' : 'var(--success)',
                        borderRadius: 3,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Interactive Milestones Checklist */}
                <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                      Key Milestones ({completedMilestones}/{project.milestones.length})
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click to toggle</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {project.milestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => dispatch(toggleMilestone({ projectId: project.id, milestoneId: m.id }))}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: 'pointer',
                          fontSize: 12.5,
                          color: m.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: m.completed ? 'line-through' : 'none',
                        }}
                      >
                        {m.completed ? (
                          <CheckCircle2 size={14} color="#22c55e" style={{ flexShrink: 0 }} />
                        ) : (
                          <Circle size={14} color="var(--border-strong)" style={{ flexShrink: 0 }} />
                        )}
                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.name}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                          {m.dueDate.slice(5)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meta Specs: Owner, Dates, Budget */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={13} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{project.owner}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                    <span>Target: {project.targetDate}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <DollarSign size={13} style={{ color: 'var(--text-muted)' }} />
                    <span>Budget: {project.budget}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TrendingUp size={13} style={{ color: 'var(--text-muted)' }} />
                    <span>Spent: {project.spent}</span>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {project.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 11,
                        padding: '2px 7px',
                        borderRadius: 4,
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status Update Quick Buttons */}
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Dept: {project.dept}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {project.health !== 'ON_TRACK' && (
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 11, padding: '3px 8px', color: 'var(--success)' }}
                      onClick={() => dispatch(updateProjectStatus({ id: project.id, health: 'ON_TRACK', status: 'IN_PROGRESS' }))}
                    >
                      Set On Track
                    </button>
                  )}
                  {project.health !== 'COMPLETED' && (
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 11, padding: '3px 8px', color: 'var(--accent)' }}
                      onClick={() => dispatch(updateProjectStatus({ id: project.id, health: 'COMPLETED', status: 'COMPLETED' }))}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Project */}
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
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 540,
              padding: '24px',
              boxShadow: 'var(--shadow-modal)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Initiate New Operations Project</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Define project scope, department lead, budget and key milestones.</p>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setIsModalOpen(false)}
                style={{ padding: 6 }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Project Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INFRA-MESH"
                    value={newProject.code}
                    onChange={(e) => setNewProject({ ...newProject, code: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Ingestion Hub"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Operational objective and enterprise impact..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="input"
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Department
                  </label>
                  <select
                    value={newProject.dept}
                    onChange={(e) => setNewProject({ ...newProject, dept: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="Enterprise Operations">Enterprise Operations</option>
                    <option value="Core FinOps">Core FinOps</option>
                    <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                    <option value="AI Security Ops">AI Security Ops</option>
                    <option value="Supply Chain Operations">Supply Chain Operations</option>
                    <option value="Regulatory Tech">Regulatory Tech</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Project Owner / PM
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Henrik Lindqvist"
                    value={newProject.owner}
                    onChange={(e) => setNewProject({ ...newProject, owner: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Priority
                  </label>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Allocated Budget
                  </label>
                  <input
                    type="text"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newProject.targetDate}
                    onChange={(e) => setNewProject({ ...newProject, targetDate: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Technology Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kafka, Kubernetes, Spring Cloud"
                  value={newProject.tags}
                  onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Check size={16} /> Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProjectsPage;
