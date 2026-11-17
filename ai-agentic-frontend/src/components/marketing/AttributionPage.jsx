import React from 'react';
import { useSelector } from 'react-redux';
import { DollarSign, TrendingUp, Layers, PieChart } from 'lucide-react';

export const AttributionPage = () => {
  const { attribution } = useSelector((s) => s.marketing);

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-tag">Marketing · Attribution & ROI Analytics</div>
          <h2>Multi-Touch Attribution & Marketing Mix</h2>
          <p>Data-driven algorithmic attribution across all acquisition channels, providing pipeline ROI multiples, CAC/LTV ratios, and budget efficiency analysis.</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid cols-4" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">Blended CAC <DollarSign size={13} /></div>
          <div className="stat-value">{attribution.blendedCAC}</div>
          <div className="stat-desc">Customer Acquisition Cost (blended)</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg. LTV <TrendingUp size={13} /></div>
          <div className="stat-value">{attribution.averageLTV}</div>
          <div className="stat-desc">Based on 3-year enterprise contracts</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">LTV : CAC Multiple <Layers size={13} /></div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{attribution.ltvToCacRatio}</div>
          <div className="stat-desc">Industry benchmark &gt; 3.0x</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Budget <PieChart size={13} /></div>
          <div className="stat-value">{attribution.totalBudget}</div>
          <div className="stat-desc">Allocated across {attribution.channels.length} channels</div>
        </div>
      </div>

      {/* Attribution Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Channel Attribution Breakdown (MMM)</div>
          <span className="badge">Data-Driven Algorithmic Attribution</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Channel</th>
                <th>Quarterly Spend</th>
                <th>Pipeline Generated</th>
                <th>ROI Multiple</th>
                <th>Attribution Weight</th>
              </tr>
            </thead>
            <tbody>
              {attribution.channels.map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td className="mono">{c.spend}</td>
                  <td className="mono" style={{ fontWeight: 700 }}>{c.pipelineGenerated}</td>
                  <td className="mono" style={{ color: 'var(--success)', fontWeight: 700 }}>{c.roi}</td>
                  <td>
                    <div className="conf-bar-wrap">
                      <div className="conf-bar" style={{ width: 72 }}>
                        <div className="conf-bar-fill" style={{ width: c.share }} />
                      </div>
                      <span className="mono">{c.share}</span>
                    </div>
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
