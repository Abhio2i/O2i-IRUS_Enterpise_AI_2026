import React from 'react';
import { useSelector } from 'react-redux';
import { PieChart, TrendingUp, DollarSign, Layers, CheckCircle2 } from 'lucide-react';

export const AttributionRadarTab = () => {
  const attribution = useSelector((state) => state.marketing.attribution);

  return (
    <div>
      {/* Metrics Row */}
      <div className="stats-pill-row">
        <div className="stat-pill-item">
          <div className="stat-pill-label">
            <span>Blended Enterprise CAC</span>
            <DollarSign size={15} />
          </div>
          <div className="stat-pill-value mono">{attribution.blendedCAC}</div>
          <div className="stat-pill-footnote">Customer Acquisition Cost across channels</div>
        </div>

        <div className="stat-pill-item">
          <div className="stat-pill-label">
            <span>Average ACV / LTV</span>
            <TrendingUp size={15} />
          </div>
          <div className="stat-pill-value mono">{attribution.averageLTV}</div>
          <div className="stat-pill-footnote">Based on 3-year enterprise contracts</div>
        </div>

        <div className="stat-pill-item">
          <div className="stat-pill-label">
            <span>LTV-to-CAC Multiple</span>
            <Layers size={15} />
          </div>
          <div className="stat-pill-value mono" style={{ color: '#22c55e' }}>
            {attribution.ltvToCacRatio}
          </div>
          <div className="stat-pill-footnote">Industry benchmark &gt; 3.0x</div>
        </div>

        <div className="stat-pill-item">
          <div className="stat-pill-label">
            <span>Total Campaign Spend</span>
            <PieChart size={15} />
          </div>
          <div className="stat-pill-value mono">{attribution.totalBudget}</div>
          <div className="stat-pill-footnote">Allocated across 5 acquisition channels</div>
        </div>
      </div>

      {/* Attribution Breakdown Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <PieChart size={16} />
            <span>Multi-Touch Attribution & Marketing Mix (MMM / Section 3.3)</span>
          </div>
          <span className="pill-badge mono">DATA-DRIVEN ALGORITHMIC ATTRIBUTION</span>
        </div>

        <div className="table-wrap">
          <table className="bip-table">
            <thead>
              <tr>
                <th>Channel Name</th>
                <th>Quarterly Spend</th>
                <th>Pipeline Generated</th>
                <th>Pipeline ROI Multiple</th>
                <th>Attribution Weight</th>
              </tr>
            </thead>
            <tbody>
              {attribution.channels.map((chan, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{chan.name}</td>
                  <td className="mono">{chan.spend}</td>
                  <td className="mono" style={{ fontWeight: 700 }}>
                    {chan.pipelineGenerated}
                  </td>
                  <td className="mono" style={{ color: '#22c55e', fontWeight: 600 }}>
                    {chan.roi}
                  </td>
                  <td className="mono">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '60px',
                          height: '5px',
                          backgroundColor: 'var(--bg-muted)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: chan.share,
                            height: '100%',
                            backgroundColor: 'var(--text-primary)',
                          }}
                        />
                      </div>
                      <span>{chan.share}</span>
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
