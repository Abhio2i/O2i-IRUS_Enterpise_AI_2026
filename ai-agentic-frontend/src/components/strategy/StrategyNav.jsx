import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveRoute } from '../../store/navigationSlice';
import { Target, CalendarRange, Briefcase, Scale, Compass } from 'lucide-react';

export const StrategyNav = () => {
  const dispatch = useDispatch();
  const activeRoute = useSelector((s) => s.navigation.activeRoute);

  const TABS = [
    { id: 'strategy.goals', label: 'Goals & Sub-Goals', icon: Target, badge: 'OKRs' },
    { id: 'strategy.timelines', label: 'Strategic Timelines', icon: CalendarRange, badge: 'Roadmap' },
    { id: 'strategy.actionPlan', label: 'Plan of Action', icon: Briefcase, badge: 'RACI' },
    { id: 'strategy.policies', label: 'Policies & Governance', icon: Scale, badge: 'Charters' },
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
          color: '#818cf8',
          fontSize: 12.5,
          fontWeight: 700,
          borderRight: '1px solid var(--border-subtle)',
          marginRight: 4,
          flexShrink: 0,
        }}
      >
        <Compass size={15} />
        <span>Leadership & Strategy Suite:</span>
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
                background: isActive ? '#6366f1' : 'transparent',
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
                  background: isActive ? 'rgba(0,0,0,0.25)' : 'var(--bg-surface)',
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

export default StrategyNav;
