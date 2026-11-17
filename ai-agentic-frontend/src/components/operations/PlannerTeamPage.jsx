import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addPlannerTask, updateTaskStatus, reassignTask, updateMemberCapacity } from '../../store/operationsSlice';
import {
  Users, Calendar, Clock, CheckCircle2, AlertCircle, Plus, Filter,
  ArrowRight, Shield, Zap, Sparkles, UserCheck, X, Check, BarChart2
} from 'lucide-react';

const STATUS_COLUMNS = [
  { id: 'BACKLOG', label: 'Backlog', color: '#8b5cf6' },
  { id: 'TODO', label: 'To Do', color: '#6366f1' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#06b6d4' },
  { id: 'REVIEW', label: 'Review / QA', color: '#f59e0b' },
  { id: 'DONE', label: 'Completed', color: '#22c55e' },
];

const MEMBER_STATUS = {
  OPTIMAL: { label: 'Optimal Workload', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  OVERLOADED: { label: 'Overloaded', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  AVAILABLE: { label: 'Bandwidth Available', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
};

export const PlannerTeamPage = () => {
  const dispatch = useDispatch();
  const teamMembers = useSelector((s) => s.operations.teamMembers || []);
  const tasks = useSelector((s) => s.operations.plannerTasks || []);
  const projects = useSelector((s) => s.operations.projects || []);

  const [selectedMember, setSelectedMember] = useState('ALL');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [reassignModalTask, setReassignModalTask] = useState(null);

  // New Task Form
  const [newTask, setNewTask] = useState({
    title: '',
    assigneeId: teamMembers[0]?.id || 'TM-01',
    projectId: projects[0]?.id || 'PRJ-301',
    priority: 'HIGH',
    estimateHours: 8,
    status: 'TODO',
    sprint: 'Sprint 24',
    dueDate: '2026-10-31',
  });

  const filteredTasks = selectedMember === 'ALL'
    ? tasks
    : tasks.filter((t) => t.assigneeId === selectedMember);

  const totalCapacity = teamMembers.reduce((acc, m) => acc + m.capacityHours, 0);
  const totalAllocated = teamMembers.reduce((acc, m) => acc + m.allocatedHours, 0);
  const avgUtilization = Math.round((totalAllocated / totalCapacity) * 100);
  const overloadedCount = teamMembers.filter((m) => m.utilization > 100).length;

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;

    const assignedMember = teamMembers.find((m) => m.id === newTask.assigneeId);
    const created = {
      id: `TSK-${Math.floor(2500 + Math.random() * 500)}`,
      title: newTask.title,
      assigneeId: newTask.assigneeId,
      assigneeName: assignedMember ? assignedMember.name : 'Unassigned',
      projectId: newTask.projectId,
      priority: newTask.priority,
      estimateHours: parseInt(newTask.estimateHours) || 8,
      status: newTask.status,
      sprint: newTask.sprint,
      dueDate: newTask.dueDate,
    };

    dispatch(addPlannerTask(created));
    setIsTaskModalOpen(false);
    setNewTask({
      title: '',
      assigneeId: teamMembers[0]?.id || 'TM-01',
      projectId: projects[0]?.id || 'PRJ-301',
      priority: 'HIGH',
      estimateHours: 8,
      status: 'TODO',
      sprint: 'Sprint 24',
      dueDate: '2026-10-31',
    });
  };

  const handleReassign = (taskId, newAssigneeId) => {
    dispatch(reassignTask({ taskId, newAssigneeId }));
    setReassignModalTask(null);
  };

  return (
    <div className="planner-page">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-title-block">
          <div className="page-tag">Operations · Planner & Team Management [OPS-PLAN]</div>
          <h2>Planner & Team Capacity</h2>
          <p>Sprint capacity allocation, team member workload balancing, task assignment, and deliverable scheduling.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsTaskModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', fontWeight: 600 }}
        >
          <Plus size={16} /> Plan New Task
        </button>
      </div>

      {/* Sprint Overview Metrics */}
      <div className="stats-grid cols-4" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">Active Sprint <Calendar size={13} /></div>
          <div className="stat-value">Sprint 24</div>
          <div className="stat-sub">Oct 20 – Nov 03, 2026</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Team Capacity <Clock size={13} /></div>
          <div className="stat-value">{totalAllocated}h / {totalCapacity}h</div>
          <div className="stat-sub">{avgUtilization}% Total Workload Utilization</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Staffing Posture <Users size={13} /></div>
          <div className="stat-value">{teamMembers.length} Engineers</div>
          <div className="stat-sub" style={{ color: overloadedCount > 0 ? 'var(--warning)' : 'var(--success)' }}>
            {overloadedCount > 0 ? `${overloadedCount} Member Over capacity` : 'All Members Balanced'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Sprint Velocity <CheckCircle2 size={13} color="var(--success)" /></div>
          <div className="stat-value">{tasks.filter((t) => t.status === 'DONE').length} / {tasks.length}</div>
          <div className="stat-sub">Tasks Completed in Sprint</div>
        </div>
      </div>

      {/* Team Roster & Capacity Grid */}
      <div className="card" style={{ padding: '20px', marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Engineering & Operations Team Roster</h3>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Workload balance and weekly hour allocation per member. Click member to filter board.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              className={`btn btn-sm ${selectedMember === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedMember('ALL')}
            >
              All Team ({tasks.length})
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {teamMembers.map((member) => {
            const statusCfg = MEMBER_STATUS[member.status] || MEMBER_STATUS.OPTIMAL;
            const isSelected = selectedMember === member.id;

            return (
              <div
                key={member.id}
                onClick={() => setSelectedMember(isSelected ? 'ALL' : member.id)}
                style={{
                  background: isSelected ? 'var(--bg-active)' : 'var(--bg-elevated)',
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  borderRadius: 8,
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: member.color,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {member.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{member.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{member.role}</div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: 10,
                      color: statusCfg.color,
                      background: statusCfg.bg,
                    }}
                  >
                    {member.utilization}%
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>Allocation</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{member.allocatedHours}h / {member.capacityHours}h</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--bg-base)', borderRadius: 3, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, member.utilization)}%`,
                        background: member.utilization > 100 ? 'var(--danger)' : member.utilization >= 75 ? 'var(--success)' : '#06b6d4',
                      }}
                    />
                  </div>
                </div>

                {/* Skills tags */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {member.skills.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: 10,
                        padding: '1px 5px',
                        borderRadius: 3,
                        background: 'var(--bg-base)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                  {member.skills.length > 3 && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{member.skills.length - 3}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sprint Task Board / Kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {STATUS_COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 420,
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{col.label}</span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: 8,
                    background: 'var(--bg-elevated)',
                  }}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {colTasks.map((task) => {
                  const assignedMember = teamMembers.find((m) => m.id === task.assigneeId);

                  return (
                    <div
                      key={task.id}
                      className="card"
                      style={{
                        padding: '12px',
                        background: 'var(--bg-elevated)',
                        boxShadow: 'var(--shadow-card)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <span style={{ fontSize: 10.5, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                          {task.projectId}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: 3,
                            color: task.priority === 'CRITICAL' ? 'var(--danger)' : task.priority === 'HIGH' ? 'var(--warning)' : 'var(--text-secondary)',
                            background: 'var(--bg-base)',
                          }}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <div style={{ fontWeight: 600, fontSize: 12.5, lineHeight: 1.35, marginBottom: 8 }}>
                        {task.title}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> {task.estimateHours}h
                        </span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          Due {task.dueDate.slice(5)}
                        </span>
                      </div>

                      {/* Assignee & Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                        <div
                          onClick={() => setReassignModalTask(task)}
                          title="Click to reassign"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            cursor: 'pointer',
                            fontSize: 11,
                          }}
                        >
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              background: assignedMember?.color || '#888',
                              color: '#fff',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 9,
                              fontWeight: 700,
                            }}
                          >
                            {assignedMember?.avatar || 'UN'}
                          </span>
                          <span style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>
                            {task.assigneeName.split(' ')[0]}
                          </span>
                        </div>

                        {/* Status Change Selector */}
                        <select
                          value={task.status}
                          onChange={(e) => dispatch(updateTaskStatus({ id: task.id, status: e.target.value }))}
                          style={{
                            fontSize: 10,
                            background: 'var(--bg-base)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 4,
                            padding: '1px 4px',
                            cursor: 'pointer',
                          }}
                        >
                          {STATUS_COLUMNS.map((sc) => (
                            <option key={sc.id} value={sc.id}>{sc.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Task */}
      {isTaskModalOpen && (
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
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: 24, boxShadow: 'var(--shadow-modal)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Plan Sprint Task</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Assign a task to a team member and estimate hours.</p>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsTaskModalOpen(false)} style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Upgrade Kafka Cruise Control partition rebalance agent"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Assignee
                  </label>
                  <select
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role.split(' ')[0]})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Linked Project
                  </label>
                  <select
                    value={newTask.projectId}
                    onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
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
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={newTask.estimateHours}
                    onChange={(e) => setNewTask({ ...newTask, estimateHours: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Initial Status
                  </label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="BACKLOG">Backlog</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsTaskModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add to Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reassign Task */}
      {reassignModalTask && (
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
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: 22, boxShadow: 'var(--shadow-modal)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Reassign Task</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Select a new team member to take over: <strong>"{reassignModalTask.title}"</strong> ({reassignModalTask.estimateHours}h).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {teamMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleReassign(reassignModalTask.id, m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 6,
                    background: m.id === reassignModalTask.assigneeId ? 'var(--bg-active)' : 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: m.color,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {m.avatar}
                    </span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{m.role}</div>
                    </div>
                  </div>

                  <span style={{ fontSize: 11, color: m.utilization > 100 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {m.allocatedHours}h / {m.capacityHours}h ({m.utilization}%)
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setReassignModalTask(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PlannerTeamPage;
