import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import { toggleAuditDrawer } from '../store/navigationSlice';
import { Sun, Moon, ShieldAlert, Database, Cpu, Activity } from 'lucide-react';

export const Header = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);
  const auditLogs = useSelector((state) => state.governance.auditLogs);

  return (
    <header className="site-header">
      <div className="brand-section">
        <div className="brand-logo-mark">O2i</div>
        <div className="brand-title-wrap">
          <h1>O2i - IRUS Enterprise AI</h1>
          <div className="sub-tag">Enterprise Cognitive Autonomy & Operations Platform</div>
        </div>
      </div>

      <div className="header-center-info">
        <div className="system-status-indicator">
          <span className="pulse-dot"></span>
          <span>CLUSTER: SPRING-BOOT-PROD</span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)' }}>PGVECTOR READY</span>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="btn btn-outline btn-sm"
          onClick={() => dispatch(toggleAuditDrawer())}
          title="Open BIP Governance & Audit Log"
        >
          <ShieldAlert size={14} />
          <span>Governance & Audit</span>
          <span className="pill-badge mono" style={{ fontSize: '10px', padding: '1px 5px' }}>
            {auditLogs.length}
          </span>
        </button>

        <button
          className="btn btn-outline btn-sm"
          onClick={() => dispatch(toggleTheme())}
          title={`Switch to ${theme === 'black' ? 'Stark White' : 'Obsidian Black'} Mode`}
        >
          {theme === 'black' ? (
            <>
              <Sun size={14} />
              <span>White Theme</span>
            </>
          ) : (
            <>
              <Moon size={14} />
              <span>Black Theme</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
