import React from 'react';
import { useSelector } from 'react-redux';
import { Activity, Zap, TrendingDown, AlertCircle, BarChart3, Gauge, Clock } from 'lucide-react';

export const ProcessMiningTab = () => {
  const { processMetrics, forecastData } = useSelector((state) => state.operations);

  return (
    <div>
      {/* High-level Process KPI Cards */}
      <div className="stats-pill-row">
        <div className="stat-pill-item">
          <div className="stat-pill-label">
            <span>Cycle Time (Avg)</span>
            <Clock size={15} />
          </div>
          <div className="stat-pill-value mono">{processMetrics.avgCycleTimeMinutes}</div>
          <div className="stat-pill-footnote" style={{ color: '#22c55e' }}>
            ↓ {processMetrics.reductionRate} from {processMetrics.cycleTimeBaseline} manual baseline
          </div>
        </div>

        <div className="stat-pill-item">
          <div className="stat-pill-label">
            <span>Straight-Through Rate</span>
            <Zap size={15} />
          </div>
          <div className="stat-pill-value mono">{processMetrics.autonomousPassRate}</div>
          <div className="stat-pill-footnote">Autonomous workflow settlement</div>
        </div>

        <div className="stat-pill-item">
          <div className="stat-pill-label">
            <span>Human Rework Loop Rate</span>
            <TrendingDown size={15} />
          </div>
          <div className="stat-pill-value mono">{processMetrics.humanReworkRate}</div>
          <div className="stat-pill-footnote">Target baseline &lt; 5.0%</div>
        </div>

        <div className="stat-pill-item">
          <div className="stat-pill-label">
            <span>Capacity Forecast (OPS-4)</span>
            <Gauge size={15} />
          </div>
          <div className="stat-pill-value mono">{forecastData.currentLoad}</div>
          <div className="stat-pill-footnote" style={{ color: '#eab308' }}>
            Alert: {forecastData.predictedTomorrow}
          </div>
        </div>
      </div>

      {/* Early Warning Forecast Alert Box */}
      <div
        style={{
          padding: '14px 18px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--accent-dot)',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} style={{ color: 'var(--text-primary)' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{forecastData.statusAlert}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Action recommended: {forecastData.suggestedAction}
            </div>
          </div>
        </div>
        <span className="pill-badge mono">AUTOSCALE POLICY: ACTIVE</span>
      </div>

      {/* Bottlenecks Detected via Workflow Event Logs (bip-analytics / Section 6.6) */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <BarChart3 size={16} />
            <span>Process Mining: Bottlenecks & Rework Loops (OPS-3)</span>
          </div>
          <span className="pill-badge mono">SOURCE: KAFKA WORKFLOW EVENT LOGS</span>
        </div>

        <div className="table-wrap">
          <table className="bip-table">
            <thead>
              <tr>
                <th>Workflow Stage</th>
                <th>Avg Duration</th>
                <th>Rework Loop Frequency</th>
                <th>Severity Tier</th>
                <th>AI Optimization Suggestion</th>
              </tr>
            </thead>
            <tbody>
              {processMetrics.bottlenecks.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{item.step}</td>
                  <td className="mono">{item.avgDuration}</td>
                  <td className="mono">{item.reworkFrequency}</td>
                  <td>
                    <span
                      className={`pill-badge ${
                        item.severity === 'HIGH' ? 'high' : item.severity === 'MEDIUM' ? 'medium' : 'low'
                      }`}
                      style={{ fontSize: '10px' }}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {item.suggestion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
