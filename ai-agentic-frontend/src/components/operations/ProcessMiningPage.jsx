import React from 'react';
import { useSelector } from 'react-redux';
import { Clock, Zap, TrendingDown, Gauge, AlertCircle } from 'lucide-react';

export const ProcessMiningPage = () => {
  const { processMetrics, forecastData } = useSelector((s) => s.operations);

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-tag">Operations · Process Mining [OPS-3 / OPS-4]</div>
          <h2>Process Intelligence & Capacity Forecasting</h2>
          <p>
            Continuous analysis of Kafka workflow event logs to detect bottlenecks, measure cycle times, identify rework loops, 
            and predict capacity requirements using machine learning demand forecasting.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid cols-4" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">Avg Cycle Time <Clock size={13} /></div>
          <div className="stat-value">{processMetrics.avgCycleTimeMinutes}</div>
          <div className="stat-desc" style={{ color: 'var(--success)' }}>↓ {processMetrics.reductionRate} from {processMetrics.cycleTimeBaseline} baseline</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Straight-Through Rate <Zap size={13} /></div>
          <div className="stat-value">{processMetrics.autonomousPassRate}</div>
          <div className="stat-desc">Autonomous settlement success</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Human Rework Rate <TrendingDown size={13} /></div>
          <div className="stat-value">{processMetrics.humanReworkRate}</div>
          <div className="stat-desc">Target threshold &lt; 5.0%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current Capacity Load <Gauge size={13} /></div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{forecastData.currentLoad}</div>
          <div className="stat-desc" style={{ color: 'var(--warning)' }}>Tomorrow: {forecastData.predictedTomorrow}</div>
        </div>
      </div>

      {/* Forecast Alert */}
      <div style={{ padding: '14px 18px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderLeft: '4px solid var(--accent)', borderRadius: 8, marginBottom: 22, display: 'flex', alignItems: 'center', gap: 14 }}>
        <AlertCircle size={18} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 2 }}>{forecastData.statusAlert}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Recommended action: {forecastData.suggestedAction}</div>
        </div>
        <span className="badge">AUTOSCALE POLICY ACTIVE</span>
      </div>

      {/* Bottlenecks Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Detected Bottlenecks & Rework Loops</div>
          <span className="badge">Source: Kafka Event Logs + BPMN Traces</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Workflow Stage</th>
                <th>Avg Duration</th>
                <th>Rework Frequency</th>
                <th>Severity</th>
                <th>AI Optimization Suggestion</th>
              </tr>
            </thead>
            <tbody>
              {processMetrics.bottlenecks.map((b, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{b.step}</td>
                  <td className="mono">{b.avgDuration}</td>
                  <td className="mono">{b.reworkFrequency}</td>
                  <td><span className={`badge ${b.severity === 'HIGH' ? 'danger' : b.severity === 'MEDIUM' ? 'warning' : 'success'}`}>{b.severity}</span></td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{b.suggestion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
