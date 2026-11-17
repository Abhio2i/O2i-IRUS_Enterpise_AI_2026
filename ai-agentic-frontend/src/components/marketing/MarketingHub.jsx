import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setMarketingTab } from '../../store/navigationSlice';
import { GenerativeStudioTab } from './GenerativeStudioTab';
import { Customer360Tab } from './Customer360Tab';
import { PredictiveScoringTab } from './PredictiveScoringTab';
import { AttributionRadarTab } from './AttributionRadarTab';
import {
  Sparkles,
  Users,
  Target,
  PieChart,
  Megaphone,
} from 'lucide-react';

export const MarketingHub = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.navigation.marketingTab);

  const tabs = [
    {
      id: 'studio',
      label: 'Generative Content Studio',
      code: 'Brand Check',
      icon: Sparkles,
    },
    {
      id: 'customer360',
      label: 'Customer 360 & Segments',
      code: 'Profiles',
      icon: Users,
    },
    {
      id: 'scoring',
      label: 'Predictive Scoring Radar',
      code: 'Lead / Churn / NBO',
      icon: Target,
    },
    {
      id: 'attribution',
      label: 'Marketing Mix & Attribution',
      code: 'MMM',
      icon: PieChart,
    },
  ];

  return (
    <div>
      {/* Pillar Overview Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pill-badge mono">PILLAR 3 · MARKETING EXCELLENCE</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Spring AI / Python ML Scorer / Brand Rulebook Gateway
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', letterSpacing: '-0.3px' }}>
            Marketing Agent (Marketing Excellence Hub)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '2px' }}>
            Customer 360 segmentation, predictive lead/churn scoring, generative content studio with brand rulebook validation, and multi-touch attribution.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div className="system-status-indicator">
            <span className="pulse-dot"></span>
            <span>BRAND RULEBOOK GATEWAY: ACTIVE</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Brand Compliance avg: <strong style={{ color: 'var(--text-primary)' }}>96.3%</strong>
          </div>
        </div>
      </div>

      {/* Sub Tabs Bar */}
      <div className="sub-tabs-container" style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        <div className="sub-tabs-list">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`sub-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => dispatch(setMarketingTab(tab.id))}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                <span className="mono" style={{ fontSize: '10px', opacity: 0.7 }}>
                  [{tab.code}]
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub Tab Viewport */}
      <div>
        {activeTab === 'studio' && <GenerativeStudioTab />}
        {activeTab === 'customer360' && <Customer360Tab />}
        {activeTab === 'scoring' && <PredictiveScoringTab />}
        {activeTab === 'attribution' && <AttributionRadarTab />}
      </div>
    </div>
  );
};
