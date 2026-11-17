import React from 'react';
import { useSelector } from 'react-redux';
import { Target, TrendingUp, AlertTriangle, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export const PredictiveScoringTab = () => {
  const customers = useSelector((state) => state.marketing.customers);

  const modelSpecs = [
    {
      name: 'BIP-LEAD-CONV-V2',
      target: 'Enterprise Opportunity Win Probability',
      runtime: 'FastAPI Python Scorer / ONNX Runtime (Section 5.0)',
      features: ['Firmographic scale', 'API documentation reads', 'Inbound RFP triggers', 'Whitepaper downloads'],
      accuracy: '94.2% ROC-AUC',
    },
    {
      name: 'BIP-CHURN-RADAR-V1',
      target: '90-Day Account Contraction or Cancellation Risk',
      runtime: 'Spring AI + ONNX Runtime Embedded',
      features: ['Drop in document volume', 'Exception queue resolution lag', 'Support escalation spikes', 'License seat utilization'],
      accuracy: '91.8% F1-Score',
    },
    {
      name: 'BIP-NBO-RECOMMENDER',
      target: 'Next-Best-Offer Upsell / Cross-Pillar Expansion',
      runtime: 'Graph Collaborative Filter (Neo4j / PostgreSQL)',
      features: ['Pillar 1 adoption maturity', 'HR Value Contribution Graph nodes', 'Process Mining bottleneck type'],
      accuracy: '88.5% Acceptance Rate',
    },
  ];

  return (
    <div>
      {/* Model Architectures Row */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">
            <Target size={16} />
            <span>Deployed Predictive ML Models (Section 3.3 & 5.0)</span>
          </div>
          <span className="pill-badge mono">PYTHON FASTAPI / ONNX RUNTIME FOR JAVA</span>
        </div>

        <div className="grid-3">
          {modelSpecs.map((m, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: '6px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="mono" style={{ fontSize: '11px', fontWeight: 700 }}>
                  {m.name}
                </span>
                <span className="pill-badge low" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                  {m.accuracy}
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{m.target}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Runtime: <strong style={{ color: 'var(--text-primary)' }}>{m.runtime}</strong>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                <strong>Signals:</strong> {m.features.join(' · ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Predictive Scoring Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Zap size={16} />
            <span>Account Risk & Opportunity Radar</span>
          </div>
          <span className="pill-badge mono">LIVE INFERENCE TABLE</span>
        </div>

        <div className="table-wrap">
          <table className="bip-table">
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Contract Tier</th>
                <th>Lead Score</th>
                <th>Churn Risk</th>
                <th>Recommended Next-Best-Offer (NBO)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.company}</td>
                  <td>
                    <span className="pill-badge" style={{ fontSize: '11px' }}>
                      {c.tier}
                    </span>
                  </td>
                  <td className="mono" style={{ fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '5px',
                          backgroundColor: 'var(--bg-muted)',
                          borderRadius: '2px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${c.leadScore}%`,
                            height: '100%',
                            backgroundColor: c.leadScore > 80 ? 'var(--text-primary)' : 'var(--text-muted)',
                          }}
                        />
                      </div>
                      <span>{c.leadScore}/100</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`pill-badge ${
                        c.churnRisk.includes('HIGH') ? 'high' : c.churnRisk.includes('MEDIUM') ? 'medium' : 'low'
                      }`}
                      style={{ fontSize: '10.5px' }}
                    >
                      {c.churnRisk}
                    </span>
                  </td>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {c.nextBestOffer}
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" style={{ padding: '3px 8px', fontSize: '11px' }}>
                      <span>Trigger NBO</span>
                      <ArrowRight size={11} />
                    </button>
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
