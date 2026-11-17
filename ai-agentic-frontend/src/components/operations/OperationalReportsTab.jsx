import React from 'react';
import { FileText, Download, Mail, CheckCircle2, TrendingUp, Sparkles, Layers } from 'lucide-react';

export const OperationalReportsTab = () => {
  const reports = [
    {
      id: 'REP-D-2026-10-23',
      title: 'Daily Operations & Exception Synthesis',
      period: 'Today (Oct 23, 2026)',
      type: 'DAILY_SYNTHESIS',
      stats: {
        totalIngested: '1,431 documents',
        autoSettled: '1,289 (90.1%)',
        exceptionsHandled: '142',
        avgCycleTime: '4.8 mins',
      },
      llmNarrative:
        'Operational throughput remained within upper quartile thresholds throughout the European session. Straight-through processing achieved 90.1%, driven by zero OCR dropouts in Scandinavian supplier billing. One bottleneck persisted in Swedish Tax ID (VIES) gateway verification, causing a temporary 18-minute lag in batch #4. Human operators successfully resolved 142 exception flags with zero reported compliance breaches.',
      generatedAt: '16:00 UTC',
    },
    {
      id: 'REP-W-2026-W42',
      title: 'Weekly Executive Operational Review (W42)',
      period: 'Oct 16 – Oct 22, 2026',
      type: 'WEEKLY_EXECUTIVE',
      stats: {
        totalIngested: '8,920 documents',
        autoSettled: '8,154 (91.4%)',
        exceptionsHandled: '766',
        avgCycleTime: '4.7 mins',
      },
      llmNarrative:
        'Week 42 concluded with a 90.0% reduction in document handling cycle times compared to the pre-BIP manual baseline of 48.0 minutes. Estimated enterprise labor savings for the period reached 124 human-hours across Nordic logistics hubs. Drools rule validation caught 3 duplicate invoices totaling $64,300, eliminating duplicate cash leakages.',
      generatedAt: 'Oct 22, 18:00 UTC',
    },
  ];

  return (
    <div>
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <div className="card-title">
            <FileText size={16} />
            <span>Automated Operational Reporting (OPS-6 & bip-reporting)</span>
          </div>
          <span className="pill-badge mono">SPRING BATCH + QUARTZ + LLM NARRATIVE</span>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
          <strong>Design Principle (Section 6.5):</strong> "The numbers are always computed in code; the LLM only writes the commentary from those numbers." All metrics below are verified by deterministic batch jobs.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reports.map((rep) => (
            <div
              key={rep.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'var(--bg-card)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{rep.title}</h4>
                    <span className="pill-badge mono" style={{ fontSize: '10px' }}>
                      {rep.id}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Reporting Period: {rep.period} · Generated at {rep.generatedAt}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline btn-sm">
                    <Mail size={13} />
                    <span>Email Digest</span>
                  </button>
                  <button className="btn btn-primary btn-sm">
                    <Download size={13} />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>

              {/* Verified Metrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-muted)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ingested Volume</div>
                  <div className="mono" style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>
                    {rep.stats.totalIngested}
                  </div>
                </div>
                <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-muted)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Autonomous Settlement</div>
                  <div className="mono" style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px', color: '#22c55e' }}>
                    {rep.stats.autoSettled}
                  </div>
                </div>
                <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-muted)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Exceptions Resolved</div>
                  <div className="mono" style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>
                    {rep.stats.exceptionsHandled}
                  </div>
                </div>
                <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-muted)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Cycle Time</div>
                  <div className="mono" style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>
                    {rep.stats.avgCycleTime}
                  </div>
                </div>
              </div>

              {/* LLM Commentary Box */}
              <div
                style={{
                  padding: '14px 16px',
                  backgroundColor: 'var(--bg-muted)',
                  border: '1px solid var(--border)',
                  borderLeft: '3px solid var(--accent-dot)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                  <Sparkles size={14} />
                  <span>AI Commentary Synthesis (Generated from Deterministic Numbers)</span>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{rep.llmNarrative}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
