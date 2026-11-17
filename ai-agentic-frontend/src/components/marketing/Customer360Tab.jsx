import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Users, Filter, ArrowUpRight, ShieldCheck, Activity, Search, Building } from 'lucide-react';

export const Customer360Tab = () => {
  const customers = useSelector((state) => state.marketing.customers);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || c.tier.includes(tierFilter);
    return matchesSearch && matchesTier;
  });

  return (
    <div>
      {/* Top Filter and Search Bar */}
      <div
        className="card"
        style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, maxWidth: '500px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            className="input-control"
            placeholder="Search enterprise accounts by company or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Segment:</span>
          <div className="sub-tabs-list" style={{ padding: '2px' }}>
            {['ALL', 'Tier-1', 'Mid-Market', 'Growth'].map((tier) => (
              <button
                key={tier}
                className={`sub-tab-btn ${tierFilter === tier ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '11.5px' }}
                onClick={() => setTierFilter(tier)}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customer 360 Grid */}
      <div className="grid-2">
        {filtered.map((cust) => (
          <div key={cust.id} className="card">
            <div className="card-header" style={{ marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {cust.id}
                  </span>
                  <span className="pill-badge" style={{ fontSize: '10.5px' }}>
                    {cust.tier}
                  </span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>
                  {cust.company}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {cust.industry} · Contract: <strong className="mono" style={{ color: 'var(--text-primary)' }}>{cust.contractValue}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Account Health
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: cust.healthScore > 80 ? '#22c55e' : cust.healthScore > 60 ? '#eab308' : '#ef4444',
                  }}
                >
                  {cust.healthScore}/100
                </div>
              </div>
            </div>

            {/* Predictive Scores Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-muted)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lead Score</div>
                <div className="mono" style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px' }}>
                  {cust.leadScore}/100
                </div>
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-muted)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Churn Probability</div>
                <div
                  className="mono"
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    marginTop: '2px',
                    color: cust.churnRisk.includes('HIGH') ? '#ef4444' : 'inherit',
                  }}
                >
                  {cust.churnRisk}
                </div>
              </div>
            </div>

            {/* Next Best Offer Box */}
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                marginBottom: '12px',
                fontSize: '12px',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '10px', marginBottom: '2px' }}>
                Next-Best-Offer Recommendation (NBO Engine)
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cust.nextBestOffer}</div>
            </div>

            {/* Telemetry Intent Signals */}
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Telemetry Signals:</strong> {cust.intentSignals}
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '10px',
                borderTop: '1px solid var(--border)',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              <span>Last Interaction: {cust.lastContact}</span>
              <button className="btn btn-outline btn-sm" style={{ padding: '3px 8px', fontSize: '11px' }}>
                <span>View Full 360</span>
                <ArrowUpRight size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
