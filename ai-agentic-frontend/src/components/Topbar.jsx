import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../store/navigationSlice';
import { openAuthModal, logoutUser } from '../store/authSlice';
import { addAuditLog } from '../store/governanceSlice';
import { logout as apiLogout, refreshAuth } from '../services/apiClient';
import {
  PanelLeftOpen, Bell, Lock, LogOut, ChevronDown,
  User, ShieldCheck, KeyRound, Building, RefreshCw
} from 'lucide-react';

const BREADCRUMBS = {
  'operations.projects': ['Operations', 'Projects & Portfolio'],
  'operations.status': ['Operations', 'Delivery Status & Risks'],
  'operations.planner': ['Operations', 'Planner & Team'],
  'operations.docsSecurity': ['Operations', 'Docs & Security'],
  'operations.workflowImprovements': ['Operations', 'Workflow Improvements'],
  'operations.exceptions': ['Operations', 'Exception Queue'],
  'operations.intake': ['Operations', 'Document Intake & Extraction'],
  'operations.mining': ['Operations', 'Process Mining & Bottlenecks'],
  'operations.knowledge': ['Operations', 'Knowledge Assistant (SOPs)'],
  'operations.reports': ['Operations', 'Automated Reports'],
  'marketing.leads': ['Marketing', 'Lead Management'],
  'marketing.proposals': ['Marketing', 'Proposals'],
  'marketing.lists': ['Marketing', 'Customer Lists'],
  'marketing.recs': ['Marketing', 'Recommendations'],
  'marketing.collateral': ['Marketing', 'Brochures & Catalogs'],
  'marketing.seo': ['Marketing', 'SEO Keywords'],
  'marketing.studio': ['Marketing', 'Content Generation Studio'],
  'marketing.customer360': ['Marketing', 'Customer 360 Profiles'],
  'marketing.scoring': ['Marketing', 'Predictive Scoring Radar'],
  'marketing.attribution': ['Marketing', 'Attribution & ROI Analytics'],
  'strategy': ['Strategy', 'Leadership & Strategy'],
  'strategy.goals': ['Strategy', 'Goals & Sub-Goals'],
  'strategy.timelines': ['Strategy', 'Strategic Timelines'],
  'strategy.actionPlan': ['Strategy', 'Plan of Action'],
  'strategy.policies': ['Strategy', 'Policies & Governance'],
  'finance': ['Finance', 'Single Dashboard'],
  'finance.dashboard': ['Finance', 'Single Dashboard'],
  'finance.revenues': ['Finance', 'Revenues (Projects)'],
  'finance.expenses': ['Finance', 'Expenses (Fixed + Talent + Hardware)'],
  'finance.taxes': ['Finance', 'Taxes & Compliance'],
  'finance.planning': ['Finance', 'Financial Projection & Planning'],
  'hr': ['HR & People', 'Person Identification'],
  'hr.identification': ['HR & People', 'Person Identification (KYC & Biometrics)'],
  'hr.interviews': ['HR & People', 'AI On-Call Interviewing'],
  'hr.offers': ['HR & People', 'Offer Letters & Compensation'],
  'hr.policies': ['HR & People', 'Policies & Governance'],
  'hr.payroll': ['HR & People', 'Salary Disbursement (Pay Slip)'],
  'hr.experience': ['HR & People', 'Experience & Relieving Letters'],
  'hr.documentation': ['HR & People', 'Employee Documentation Vault'],
  'security': ['Security & Defense', 'Command Center'],
  'security.overview': ['Security & Defense', 'Command Center (Single Dashboard)'],
  'security.data': ['Security & Defense', 'Data Security (DLP & Quantum HSM)'],
  'security.ip': ['Security & Defense', 'IP Security (Weights Sovereignty)'],
  'security.personnel': ['Security & Defense', 'Personnel Safety (Biometrics)'],
  'security.equipment': ['Security & Defense', 'Equipment Security (TPM & H100)'],
  'security.infrastructure': ['Security & Defense', 'Infrastructure (Bunkers & EMP)'],
  'security.sentry': ['Security & Defense', 'Sentry Console (Live 9090)'],
};

export const Topbar = () => {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((s) => s.navigation.sidebarOpen);
  const activeRoute = useSelector((s) => s.navigation.activeRoute);
  const orgConfig = useSelector((s) => s.navigation.orgConfig);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const authUser = useSelector((s) => s.auth.user);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState('');
  const menuRef = useRef(null);

  const crumbs = BREADCRUMBS[activeRoute] || [activeRoute];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const handleRefreshSession = async () => {
    setRefreshing(true);
    setRefreshStatus('');
    try {
      const data = await refreshAuth();
      setRefreshStatus('Session refreshed successfully');
      dispatch(
        addAuditLog({
          id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          actor: authUser?.email || 'tenant-user',
          action: 'AUTH_SESSION_REFRESH',
          endpoint: '/api/auth/refresh',
          riskTier: 'LOW',
          model: 'Auth Gateway / Bearer Token Rotation',
          tokens: 0,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          details: `Token rotated for ${data?.email || authUser?.email}. New access token valid.`,
        })
      );
      setTimeout(() => {
        setRefreshStatus('');
        setUserMenuOpen(false);
      }, 1200);
    } catch (err) {
      console.warn('Refresh error:', err.message);
      setRefreshStatus('Session expired — please sign in again');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setUserMenuOpen(false);
    await apiLogout(); // clears localStorage tokens; best-effort server call
    dispatch(
      addAuditLog({
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        actor: authUser?.email || 'tenant-user',
        action: 'AUTH_LOGOUT',
        endpoint: '/api/auth/logout',
        riskTier: 'LOW',
        model: 'Auth Gateway / Session Termination',
        tokens: 0,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        details: `Session terminated for ${authUser?.email}. Bearer token cleared.`,
      })
    );
    dispatch(logoutUser());
    setLoggingOut(false);
  };

  const initials = authUser
    ? (authUser.displayName || authUser.email || 'A')
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join('')
    : 'A';

  return (
    <header className="topbar">
      <div className="topbar-left">
        {!sidebarOpen && (
          <button
            className="icon-btn"
            onClick={() => dispatch(toggleSidebar())}
            title="Open Sidebar"
          >
            <PanelLeftOpen size={16} />
          </button>
        )}

        {/* Breadcrumb */}
        <nav className="topbar-breadcrumb">
          <span className="segment">{orgConfig.name}</span>
          {crumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              <span className="separator">/</span>
              {i === crumbs.length - 1 ? (
                <span className="active-segment">{crumb}</span>
              ) : (
                <span className="segment">{crumb}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="topbar-right">
        {/* System Status Pill */}
        <div className="topbar-status-pill">
          <span className="pulse-dot green" />
          <span>2 Agents Online</span>
        </div>

        {/* Notifications Bell */}
        <button className="icon-btn" title="Notifications" style={{ position: 'relative' }}>
          <Bell size={16} />
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#ef4444',
              border: '1.5px solid var(--bg-elevated, #fff)',
            }}
          />
        </button>

        {/* Auth Zone */}
        {isAuthenticated && authUser ? (
          /* Logged-in: Avatar + Dropdown */
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '5px 10px 5px 6px',
                borderRadius: 8,
                border: '1px solid var(--border-default)',
                background: userMenuOpen ? 'var(--bg-hover)' : 'transparent',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {/* Avatar Circle */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11.5,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {authUser.displayName || authUser.email}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <ShieldCheck size={9} color="var(--success, #16a34a)" />
                  <span>{authUser.role || 'TENANT_ADMIN'}</span>
                </div>
              </div>
              <ChevronDown size={13} style={{ color: 'var(--text-muted)', transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  minWidth: 220,
                  background: 'var(--bg-elevated, #ffffff)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  zIndex: 10000,
                  overflow: 'hidden',
                }}
              >
                {/* User Info Header */}
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-hover)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {authUser.displayName || authUser.email}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <Building size={11} />
                    <span className="mono" style={{ fontSize: 10.5 }}>
                      {(authUser.tenantId || '').substring(0, 20)}...
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={11} color="var(--success, #16a34a)" />
                    <span style={{ color: 'var(--success, #16a34a)', fontWeight: 600 }}>Active Enterprise Session</span>
                  </div>
                </div>

                {/* Menu Options */}
                <div style={{ padding: '6px 0' }}>
                  {refreshStatus && (
                    <div style={{ padding: '6px 14px', fontSize: 11.5, color: refreshStatus.includes('expired') ? '#dc2626' : '#16a34a', background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-default)' }}>
                      {refreshStatus}
                    </div>
                  )}

                  <button
                    onClick={handleRefreshSession}
                    disabled={refreshing}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 14px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      cursor: refreshing ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => { if (!refreshing) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <RefreshCw size={15} style={{ color: 'var(--brand-primary, #2563eb)', animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                    {refreshing ? 'Refreshing Token...' : 'Refresh Session'}
                  </button>

                  <button
                    onClick={() => { dispatch(openAuthModal('login')); setUserMenuOpen(false); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 14px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={15} style={{ color: 'var(--text-secondary)' }} />
                    Switch Account
                  </button>

                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 14px',
                      background: 'transparent',
                      border: 'none',
                      color: '#dc2626',
                      fontSize: 13,
                      cursor: loggingOut ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      opacity: loggingOut ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => { if (!loggingOut) e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={15} />
                    {loggingOut ? 'Signing Out...' : 'Sign Out'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Not logged in: Login + Register buttons */
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => dispatch(openAuthModal('register'))}
              style={{
                padding: '6px 12px',
                borderRadius: 7,
                border: '1px solid var(--border-default)',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: 12.5,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <KeyRound size={13} />
              Register
            </button>
            <button
              onClick={() => dispatch(openAuthModal('login'))}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                border: 'none',
                background: 'var(--brand-primary, #2563eb)',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Lock size={13} />
              Sign In
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
