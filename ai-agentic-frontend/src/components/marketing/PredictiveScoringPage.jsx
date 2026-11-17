import React from 'react';
import { useSelector } from 'react-redux';
import { ArrowRight } from 'lucide-react';

const MODELS = [
  { name: 'LEAD-CONV-V2', target: 'Enterprise Opportunity Win Probability', accuracy: '94.2% ROC-AUC', runtime: 'FastAPI Python / ONNX Runtime', signals: ['Firmographic scale', 'API doc reads', 'Inbound RFP triggers', 'Whitepaper downloads'] },
  { name: 'CHURN-RADAR-V1', target: '90-Day Cancellation / Contraction Risk', accuracy: '91.8% F1-Score', runtime: 'Spring AI + ONNX Embedded', signals: ['Drop in doc volume', 'Exception lag', 'Support escalations', 'License utilization'] },
  { name: 'NBO-RECOMMENDER', target: 'Next-Best-Offer Upsell Recommendations', accuracy: '88.5% Acceptance Rate', runtime: 'Graph Collaborative Filter (Neo4j)', signals: ['Pillar adoption maturity', 'Value Contribution nodes', 'Process bottleneck type'] },
];

export const PredictiveScoringPage = () => {
  const customers = useSelector((s) => s.marketing.customers);

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-tag">Marketing · Predictive Scoring Radar</div>
          <h2>Predictive Lead, Churn & NBO Scoring</h2>
          <p>Machine learning models continuously score enterprise accounts for conversion likelihood, churn risk, and next-best-offer fit using ONNX inference engines embedded into the platform runtime.</p>
        </div>
      </div>

      {/* Model Cards */}
      <div className="grid-3" style={{ marginBottom: 22 }}>
        {MODELS.map((m, i) => (
          <div key={i} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{m.name}</span>
              <span className="badge success" style={{ fontSize: 10 }}>{m.accuracy}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>{m.target}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 10 }}>Runtime: <strong style={{ color: 'var(--text-primary)' }}>{m.runtime}</strong></div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              <strong>Input Signals: </strong>{m.signals.join(' · ')}
            </div>
          </div>
        ))}
      </div>

      {/* Live Scoring Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Account Risk & Opportunity Radar — Live Inference</div>
          <span className="badge">Real-time ONNX Inference</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Tier</th>
                <th>Lead Score</th>
                <th>Churn Risk</th>
                <th>Next-Best-Offer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.company}</td>
                  <td><span className="badge" style={{ fontSize: 11 }}>{c.tier}</span></td>
                  <td>
                    <div className="conf-bar-wrap">
                      <div className="conf-bar" style={{ width: 56 }}>
                        <div className="conf-bar-fill" style={{ width: `${c.leadScore}%` }} />
                      </div>
                      <span className="mono" style={{ fontWeight: 700 }}>{c.leadScore}/100</span>
                    </div>
                  </td>
                  <td><span className={`badge ${c.churnRisk.includes('HIGH') ? 'danger' : c.churnRisk.includes('MEDIUM') ? 'warning' : 'success'}`} style={{ fontSize: 10.5 }}>{c.churnRisk}</span></td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{c.nextBestOffer}</td>
                  <td>
                    <button className="btn btn-ghost btn-xs">Trigger NBO <ArrowRight size={11} /></button>
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
