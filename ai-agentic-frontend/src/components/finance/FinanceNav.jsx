import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveRoute } from '../../store/navigationSlice';
import {
  LayoutDashboard, TrendingUp, Receipt, Scale, LineChart, Coins, DollarSign
} from 'lucide-react';

export const FinanceNav = () => {
  const dispatch = useDispatch();
  const activeRoute = useSelector((s) => s.navigation.activeRoute);

  const TABS = [
    { id: 'finance.dashboard', label: 'Single Dashboard', icon: LayoutDashboard, badge: 'Overview' },
    { id: 'finance.revenues', label: 'Revenues (Projects)', icon: TrendingUp, badge: 'ARR' },
    { id: 'finance.expenses', label: 'Expenses & Costs', icon: Receipt, badge: 'OPEX/CAPEX' },
    { id: 'finance.taxes', label: 'Taxes & Compliance', icon: Scale, badge: 'VAT / R&D' },
    { id: 'finance.planning', label: 'Financial Projection & Planning', icon: LineChart, badge: 'Forecast' },
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
          color: '#f59e0b',
          fontSize: 12.5,
          fontWeight: 700,
          borderRight: '1px solid var(--border-subtle)',
          marginRight: 4,
          flexShrink: 0,
        }}
      >
        <Coins size={15} />
        <span>Enterprise Finance Suite:</span>
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
                background: isActive ? '#f59e0b' : 'transparent',
                color: isActive ? '#000' : 'var(--text-secondary)',
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
                  background: isActive ? 'rgba(0,0,0,0.2)' : 'var(--bg-surface)',
                  color: isActive ? '#000' : 'var(--text-muted)',
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

export default FinanceNav;
