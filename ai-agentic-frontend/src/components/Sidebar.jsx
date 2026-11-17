import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  toggleSidebar,
  setActiveRoute,
  setRoadmapModalAgent,
  toggleAuditDrawer,
} from '../store/navigationSlice';
import {
  Cog,
  Megaphone,
  Compass,
  Users,
  Coins,
  AlertTriangle,
  UploadCloud,
  Activity,
  BookOpen,
  FileSpreadsheet,
  UserSquare2,
  Target,
  PieChart,
  ChevronRight,
  ShieldAlert,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  UserCheck,
  FileSignature,
  List,
  Lightbulb,
  BookMarked,
  Search,
  FolderKanban,
  Gauge,
  CalendarRange,
  ShieldCheck,
  Scale,
  Briefcase,
  Workflow,
  LayoutDashboard,
  TrendingUp,
  Receipt,
  LineChart,
  PhoneCall,
  CreditCard,
  Award,
  FolderLock,
  Shield,
  Database,
  FileCode2,
  HardDrive,
  Building2,
  Mail,
} from 'lucide-react';
import { toggleTheme } from '../store/themeSlice';

const AGENTS = [
  {
    id: 'operations',
    label: 'Operations',
    sub: 'Pillar 1 · Process Automation',
    icon: Cog,
    status: 'live',
    route: 'operations',
    children: [
      { id: 'operations.projects',             label: 'Projects',              icon: FolderKanban },
      { id: 'operations.status',               label: 'Status',                icon: Gauge },
      { id: 'operations.planner',              label: 'Planner & Team',        icon: CalendarRange },
      { id: 'operations.docsSecurity',         label: 'Docs & Security',       icon: ShieldCheck },
      { id: 'operations.workflowImprovements', label: 'Workflow Improvements', icon: Workflow },
      { id: 'operations.exceptions',           label: 'Exception Queue',       icon: AlertTriangle, badge: null },
      { id: 'operations.intake',               label: 'Document Intake',       icon: UploadCloud },
      { id: 'operations.mining',               label: 'Process Mining',        icon: Activity },
      { id: 'operations.knowledge',            label: 'Knowledge Assistant',   icon: BookOpen },
      { id: 'operations.reports',              label: 'Automated Reports',     icon: FileSpreadsheet },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    sub: 'Pillar 3 · Revenue Intelligence',
    icon: Megaphone,
    status: 'live',
    route: 'marketing',
    children: [
      { id: 'marketing.leads',        label: 'Lead Management',     icon: UserCheck },
      { id: 'marketing.proposals',    label: 'Proposals',           icon: FileSignature },
      { id: 'marketing.lists',        label: 'Customer Lists',      icon: List },
      { id: 'marketing.recs',         label: 'Recommendations',     icon: Lightbulb },
      { id: 'marketing.collateral',   label: 'Brochures & Catalogs',icon: BookMarked },
      { id: 'marketing.seo',          label: 'SEO Keywords',        icon: Search },
      { id: 'marketing.studio',       label: 'Email Sender',        icon: Mail },
      { id: 'marketing.customer360',  label: 'Customer 360',        icon: UserSquare2 },
      { id: 'marketing.scoring',      label: 'Predictive Scoring',  icon: Target },
      { id: 'marketing.attribution',  label: 'Attribution & ROI',   icon: PieChart },
    ],
  },
  {
    id: 'strategy',
    label: 'Leadership & Strategy',
    sub: 'Pillar 4 · Strategic Excellence',
    icon: Compass,
    status: 'live',
    route: 'strategy',
    children: [
      { id: 'strategy.goals',      label: 'Goals & Sub-Goals',   icon: Target },
      { id: 'strategy.timelines',  label: 'Strategic Timelines', icon: CalendarRange },
      { id: 'strategy.actionPlan', label: 'Plan of Action',      icon: Briefcase },
      { id: 'strategy.policies',   label: 'Policies',            icon: Scale },
    ],
  },
  {
    id: 'hr',
    label: 'HR & People',
    sub: 'Pillar 2 · Team Value',
    icon: Users,
    status: 'live',
    route: 'hr',
    children: [
      { id: 'hr.identification', label: 'Person Identification', icon: UserCheck },
      { id: 'hr.interviews',     label: 'AI On-Call Interview',  icon: PhoneCall },
      { id: 'hr.offers',         label: 'Offer Letters',         icon: FileSignature },
      { id: 'hr.policies',       label: 'Policies',              icon: BookOpen },
      { id: 'hr.payroll',        label: 'Salary Disbursement',   icon: CreditCard },
      { id: 'hr.experience',     label: 'Experience Letters',    icon: Award },
      { id: 'hr.documentation',  label: 'Documentation',         icon: FolderLock },
    ],
  },
  {
    id: 'finance',
    label: 'Finance & Capital',
    sub: 'Pillar 5 · Enterprise Settlement',
    icon: Coins,
    status: 'live',
    route: 'finance',
    children: [
      { id: 'finance.dashboard', label: 'Single Dashboard',       icon: LayoutDashboard },
      { id: 'finance.revenues',  label: 'Revenues (Projects)',     icon: TrendingUp },
      { id: 'finance.expenses',  label: 'Expenses & Costs',        icon: Receipt },
      { id: 'finance.taxes',     label: 'Taxes & Compliance',      icon: Scale },
      { id: 'finance.planning',  label: 'Projections & Planning',  icon: LineChart },
    ],
  },
  {
    id: 'security',
    label: 'Security & Defense',
    sub: 'Pillar 6 · Sovereign Shield',
    icon: Shield,
    status: 'live',
    route: 'security',
    children: [
      { id: 'security.overview',       label: 'Command Center',        icon: Shield },
      { id: 'security.data',           label: 'Data Security',         icon: Database },
      { id: 'security.ip',             label: 'IP Security',           icon: FileCode2 },
      { id: 'security.personnel',      label: 'Personnel Safety',      icon: Users },
      { id: 'security.equipment',      label: 'Equipment Security',    icon: HardDrive },
      { id: 'security.infrastructure', label: 'Infrastructure',        icon: Building2 },
      { id: 'security.sentry',         label: 'Sentry Console (9090)', icon: ShieldAlert },
    ],
  },
];

export const Sidebar = () => {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((s) => s.navigation.sidebarOpen);
  const activeRoute = useSelector((s) => s.navigation.activeRoute);
  const orgConfig = useSelector((s) => s.navigation.orgConfig);
  const theme = useSelector((s) => s.theme.mode);
  const exceptions = useSelector((s) => s.operations.exceptions);

  // Track which agent groups are expanded
  const [expandedAgents, setExpandedAgents] = useState({ operations: false, marketing: false, strategy: false, finance: false, hr: false, security: true });

  const activeParentId = activeRoute.split('.')[0];

  // Keep active parent group expanded automatically
  React.useEffect(() => {
    if (activeParentId) {
      setExpandedAgents((prev) => ({ ...prev, [activeParentId]: true }));
    }
  }, [activeParentId]);

  const toggleExpanded = (agentId) => {
    setExpandedAgents((prev) => ({ ...prev, [agentId]: !prev[agentId] }));
  };

  const handleAgentClick = (agent) => {
    if (agent.status === 'roadmap') {
      dispatch(setRoadmapModalAgent(agent.roadmapId));
      return;
    }

    if (!sidebarOpen) {
      dispatch(toggleSidebar());
    }

    // If switching to an inactive group, navigate to its first sub-item and expand it
    if (activeParentId !== agent.id && agent.children && agent.children.length > 0) {
      setExpandedAgents((prev) => ({ ...prev, [agent.id]: true }));
      dispatch(setActiveRoute(agent.children[0].id));
    } else {
      // Toggle collapse/expand if already active
      toggleExpanded(agent.id);
    }
  };

  const handleSubItemClick = (routeId) => {
    dispatch(setActiveRoute(routeId));
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-mark">{orgConfig.shortName}</div>
        {sidebarOpen && (
          <div className="brand-text">
            <h1>{orgConfig.name}</h1>
            <p>{orgConfig.tagline}</p>
          </div>
        )}
      </div>

      {/* Nav scroll */}
      <div className="sidebar-scroll">
        {sidebarOpen && <div className="sidebar-section-label">AI Agents</div>}

        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          const isActiveParent = activeParentId === agent.id;
          const isExpanded = expandedAgents[agent.id] && sidebarOpen;
          const isStrategy = agent.id === 'strategy';
          const isFinance = agent.id === 'finance';
          const isHr = agent.id === 'hr';
          const isSecurity = agent.id === 'security';

          return (
            <div key={agent.id} className="sidebar-agent-group">
              <button
                className={`sidebar-agent-header ${isActiveParent ? 'active-parent' : ''} ${agent.status === 'roadmap' ? 'roadmap' : ''}`}
                onClick={() => handleAgentClick(agent)}
                title={sidebarOpen ? undefined : agent.label}
                style={{
                  borderLeftColor: isActiveParent
                    ? (isStrategy ? '#818cf8' : isFinance ? '#f59e0b' : isHr ? '#10b981' : isSecurity ? '#ef4444' : 'var(--sidebar-item-active-border)')
                    : 'transparent',
                  background: isActiveParent
                    ? (isStrategy ? 'rgba(99, 102, 241, 0.08)' : isFinance ? 'rgba(245, 158, 11, 0.08)' : isHr ? 'rgba(16, 185, 129, 0.08)' : isSecurity ? 'rgba(239, 68, 68, 0.08)' : undefined)
                    : undefined,
                }}
              >
                <div
                  className="sidebar-agent-icon"
                  style={{
                    background: isStrategy ? 'rgba(99, 102, 241, 0.12)' : isFinance ? 'rgba(245, 158, 11, 0.12)' : isHr ? 'rgba(16, 185, 129, 0.12)' : isSecurity ? 'rgba(239, 68, 68, 0.12)' : undefined,
                    color: isStrategy ? '#818cf8' : isFinance ? '#f59e0b' : isHr ? '#10b981' : isSecurity ? '#ef4444' : undefined,
                    borderColor: isStrategy ? 'rgba(99, 102, 241, 0.3)' : isFinance ? 'rgba(245, 158, 11, 0.3)' : isHr ? 'rgba(16, 185, 129, 0.3)' : isSecurity ? 'rgba(239, 68, 68, 0.3)' : undefined,
                  }}
                >
                  <Icon size={16} />
                </div>

                {sidebarOpen && (
                  <>
                    <div className="sidebar-agent-info">
                      <div
                        className="sidebar-agent-name"
                        style={{
                          color: isActiveParent ? (isStrategy ? '#a5b4fc' : isFinance ? '#fcd34d' : isHr ? '#6ee7b7' : isSecurity ? '#fca5a5' : undefined) : undefined,
                          fontWeight: 700,
                        }}
                      >
                        {agent.label}
                      </div>
                      <div className="sidebar-agent-sub">{agent.sub}</div>
                    </div>

                    <span
                      className={`sidebar-agent-badge ${agent.status === 'live' ? 'live' : ''}`}
                      style={{
                        background: isStrategy ? 'rgba(99, 102, 241, 0.15)' : isFinance ? 'rgba(245, 158, 11, 0.15)' : isHr ? 'rgba(16, 185, 129, 0.15)' : isSecurity ? 'rgba(239, 68, 68, 0.15)' : undefined,
                        color: isStrategy ? '#818cf8' : isFinance ? '#f59e0b' : isHr ? '#10b981' : isSecurity ? '#ef4444' : undefined,
                        borderColor: isStrategy ? 'rgba(99, 102, 241, 0.3)' : isFinance ? 'rgba(245, 158, 11, 0.3)' : isHr ? 'rgba(16, 185, 129, 0.3)' : isSecurity ? 'rgba(239, 68, 68, 0.3)' : undefined,
                      }}
                    >
                      {agent.status === 'live' ? 'LIVE' : 'PLAN'}
                    </span>

                    {agent.children.length > 0 && (
                      <ChevronRight
                        size={13}
                        className={`sidebar-chevron ${isExpanded ? 'open' : ''}`}
                      />
                    )}
                  </>
                )}
              </button>

              {/* Sub-items */}
              {agent.children.length > 0 && (
                <div className={`sidebar-subitems ${isExpanded ? 'open' : ''}`}>
                  {agent.children.map((child) => {
                    const _ChildIcon = child.icon;
                    const isActive = activeRoute === child.id;
                    const badgeCount =
                      child.id === 'operations.exceptions' ? exceptions.length : null;

                    return (
                      <button
                        key={child.id}
                        className={`sidebar-subitem ${isActive ? 'active' : ''}`}
                        onClick={() => handleSubItemClick(child.id)}
                      >
                        <span className="sidebar-subitem-dot" />
                        <span style={{ flex: 1 }}>{child.label}</span>
                        {badgeCount !== null && badgeCount > 0 && (
                          <span className="badge danger" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                            {badgeCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="sidebar-footer">
        <button
          className="sidebar-footer-btn"
          onClick={() => dispatch(toggleAuditDrawer())}
          title="Governance and Audit"
        >
          <ShieldAlert size={16} />
          {sidebarOpen && <span>Governance & Audit</span>}
        </button>

        <button
          className="sidebar-footer-btn"
          onClick={() => dispatch(toggleTheme())}
          title="Toggle Theme"
        >
          {theme === 'black' ? <Sun size={16} /> : <Moon size={16} />}
          {sidebarOpen && <span>{theme === 'black' ? 'Light Theme' : 'Dark Theme'}</span>}
        </button>

        <button
          className="sidebar-footer-btn"
          onClick={() => dispatch(toggleSidebar())}
          title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          {sidebarOpen && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  );
};
