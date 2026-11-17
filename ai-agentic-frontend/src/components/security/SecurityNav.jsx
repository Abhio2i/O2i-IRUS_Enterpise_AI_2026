import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveRoute } from '../../store/navigationSlice';
import {
  Shield, Database, FileCode2, Users, HardDrive, Building2, ShieldAlert
} from 'lucide-react';

export const SecurityNav = () => {
  const dispatch = useDispatch();
  const activeRoute = useSelector((s) => s.navigation.activeRoute);

  const TABS = [
    { id: 'security.overview', label: 'Command Center', icon: Shield, badge: 'DEFCON 5' },
    { id: 'security.data', label: 'Data Security', icon: Database, badge: 'DLP & HSM' },
    { id: 'security.ip', label: 'IP Security', icon: FileCode2, badge: 'Weights & Leaks' },
    { id: 'security.personnel', label: 'Personnel Safety', icon: Users, badge: 'Biometrics' },
    { id: 'security.equipment', label: 'Equipment Security', icon: HardDrive, badge: 'H100 & TPM' },
    { id: 'security.infrastructure', label: 'Infrastructure', icon: Building2, badge: 'Bunkers' },
    { id: 'security.sentry', label: 'Sentry Console', icon: ShieldAlert, badge: 'Port 9090' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--bg-elevated)',
        padding: '6px 10px',
        borderRadius: 10,
        border: '1px solid var(--border-default)',
        marginBottom: 24,
        overflowX: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px 6px 4px',
          color: '#ef4444',
          fontSize: 12.5,
          fontWeight: 700,
          borderRight: '1px solid var(--border-subtle)',
          marginRight: 4,
          flexShrink: 0,
        }}
      >
        <Shield size={15} />
        <span>Sovereign Security Suite:</span>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeRoute === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => dispatch(setActiveRoute(tab.id))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 14px',
                borderRadius: 7,
                fontSize: 12.5,
                fontWeight: isActive ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? '#ef4444' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: 10,
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: isActive ? 'rgba(0, 0, 0, 0.25)' : 'var(--bg-surface)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SecurityNav;
