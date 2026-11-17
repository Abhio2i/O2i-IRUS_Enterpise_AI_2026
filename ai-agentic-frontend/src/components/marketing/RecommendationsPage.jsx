import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Lightbulb, TrendingUp, Shield, Zap, ArrowRight, Target, CheckCircle, AlertTriangle } from 'lucide-react';

const TYPE_CONFIG = {
  ACQUISITION: { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', icon: TrendingUp },
  RETENTION:   { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  icon: Shield },
  EXPANSION:   { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)',  icon: Zap },
};

const PRIORITY_CONFIG = {
  CRITICAL: { color: '#ef4444', label: 'CRITICAL' },
  HIGH:     { color: '#f97316', label: 'HIGH' },
  MEDIUM:   { color: '#f59e0b', label: 'MEDIUM' },
  LOW:      { color: '#6366f1', label: 'LOW' },
};

export const RecommendationsPage = () => {
  const recs = useSelector(s => s.marketing.recommendations);
  const [filter, setFilter] = useState('ALL');
  const [expanded, setExpanded] = useState('REC-002');

  const filtered = filter === 'ALL' ? recs : recs.filter(r => r.type === filter);

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-tag">Marketing · AI Strategy Engine</div>
          <h2>Recommendation Strategies</h2>
          <p>AI-generated engagement strategies to acquire new customers, retain at-risk accounts, and expand existing relationships — ranked by confidence and revenue impact.</p>
        </div>
      </div>

      <div className="stats-grid cols-4" style={{ marginBottom: 22 }}>
        {[
          { label: 'Total Recommendations', value: recs.length, color: 'var(--text-primary)', desc: 'Active AI strategies' },
          { label: 'Acquisition Plays', value: recs.filter(r => r.type === 'ACQUISITION').length, color: '#6366f1', desc: 'New customer strategies' },
          { label: 'Retention Plays', value: recs.filter(r => r.type === 'RETENTION').length, color: '#ef4444', desc: 'At-risk account saves' },
          { label: 'Expansion Plays', value: recs.filter(r => r.type === 'EXPANSION').length, color: '#22c55e', desc: 'Upsell opportunities' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 22, color: s.color }}>{s.value}</div>
            <div className="stat-desc">{s.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {['ALL', 'ACQUISITION', 'RETENTION', 'EXPANSION'].map(f => (
          <button key={f} className={`btn btn-xs ${filter === f ? 'btn-solid' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map(rec => {
          const tc = TYPE_CONFIG[rec.type] || TYPE_CONFIG.ACQUISITION;
          const pc = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.MEDIUM;
          const Icon = tc.icon;
          const isOpen = expanded === rec.id;

          return (
            <div
              key={rec.id}
              className="card"
              style={{ borderLeft: `3px solid ${tc.color}`, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
              onClick={() => setExpanded(isOpen ? null : rec.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: tc.bg, border: `1px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={tc.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, borderRadius: 6, padding: '2px 8px' }}>{rec.type}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: pc.color, background: pc.color + '15', border: `1px solid ${pc.color}40`, borderRadius: 6, padding: '2px 8px' }}>{pc.label}</span>
                    {rec.status === 'URGENT' && (
                      <span className="badge danger" style={{ fontSize: 9 }}><AlertTriangle size={9} /> URGENT</span>
                    )}
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{rec.title}</h4>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Target: {rec.targetSegment}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>{rec.estimatedRevenue}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>AI Confidence</div>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: rec.confidence > 80 ? '#22c55e' : rec.confidence > 65 ? '#f59e0b' : '#6366f1' }}>
                    {rec.confidence}%
                  </div>
                </div>
              </div>

              {/* Confidence Bar */}
              <div style={{ marginTop: 12, marginBottom: isOpen ? 16 : 0 }}>
                <div style={{ height: 4, background: 'var(--bg-active)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${rec.confidence}%`, height: '100%', borderRadius: 2, background: rec.confidence > 80 ? '#22c55e' : rec.confidence > 65 ? '#f59e0b' : '#6366f1', transition: 'width 0.5s ease' }} />
                </div>
              </div>

              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{rec.description}</p>

                  {/* AI Insight */}
                  <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, marginBottom: 16, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    <span style={{ fontWeight: 700, color: '#6366f1', display: 'block', marginBottom: 4 }}>AI Insight</span>
                    {rec.aiInsight}
                  </div>

                  {/* Tactics */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 10 }}>Recommended Tactics</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {rec.tactics.map((t, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--bg-hover)', borderRadius: 7, border: '1px solid var(--border-subtle)' }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: tc.bg, border: `1px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 800, color: tc.color }}>{i + 1}</div>
                          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-solid" style={{ flex: 1 }}>
                      <CheckCircle size={13} /> Execute Strategy
                    </button>
                    <button className="btn btn-ghost">
                      <Target size={13} /> Assign to Team
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
