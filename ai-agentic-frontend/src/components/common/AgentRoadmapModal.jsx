import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setRoadmapModalAgent, toggleAuditDrawer } from '../../store/navigationSlice';
import { X, Calendar, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import { addAuditLog } from '../../store/governanceSlice';

const CONTENT = {
  strategy: {
    title: 'Strategy Agent — Pillar 4: Strategic Excellence',
    timeline: 'Deferred to Post-Pilot Phase (After Month 4 Delivery)',
    summary: 'The Strategy Agent reuses the unified Lakehouse, Graph, and AI foundations to power live strategy scorecards, scenario simulation, and executive decision copilots.',
    capabilities: [
      'Live Executive Strategy Scorecard (OKRs, Financials, Pillar KPIs)',
      'Scenario & What-If Modelling with Monte Carlo projections',
      'Market & Competitor Intelligence via automated web scrapers',
      'Initiative Portfolio Tracking linked to real operational throughput',
      'Leadership Copilot for complex cross-enterprise queries',
    ],
    modules: 'bip-strategy, bip-graph, bip-reporting, Neo4j Graph DB',
  },
  hr: {
    title: 'HR & People Agent — Pillar 2: Team Value Addition',
    timeline: 'Pilot Scope: Month 3 Delivery (Weeks 9–12)',
    summary: 'Links individual work signals to company OKRs through the Value Contribution Graph. Governed by strict ethical design principles enforced at the code level.',
    capabilities: [
      'OKR Cascade: Auto-links team goals to high-level company objectives',
      'Unlinked Goal Detection: Flags disconnected employee targets',
      'Value Contribution Graph: Traces Jira, git, and process gains to outcomes',
      'Monthly Contribution Summaries: AI drafts reviews for human approval',
      '⚠ CRITICAL: No automated employee scoring or pay decisions (code-enforced)',
    ],
    modules: 'bip-graph, bip-knowledge, Spring AI, PostgreSQL / Neo4j',
  },
  finance: {
    title: 'Finance Agent — Pillar 5: Enterprise Settlement',
    timeline: 'Integrated with Operations Hub / ERP Connector',
    summary: 'Provides autonomous general ledger reconciliation, vendor payment schedule verification, and enterprise AI token cost allocation per business unit.',
    capabilities: [
      'Automated 3-Way Match: PO, Receiving Receipt, Invoice line comparison',
      'Dynamic Multi-Currency Forex Clearing with live rate sync',
      'AI Model Token Usage & Cost Allocation per Business Unit (GOV-5)',
      'High-Risk Payment Gateway: > threshold requires human sign-off',
    ],
    modules: 'bip-workflow, bip-governance, Camunda 8 BPMN, PostgreSQL',
  },
};

export const AgentRoadmapModal = () => {
  const dispatch = useDispatch();
  const agentId = useSelector((s) => s.navigation.roadmapModalAgent);
  if (!agentId) return null;

  const d = CONTENT[agentId];
  if (!d) return null;

  return (
    <div className="modal-overlay" onClick={() => dispatch(setRoadmapModalAgent(null))}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '18px 20px', borderBottom: '1px solid var(--border-default)' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 4 }}>ROADMAP SPECIFICATION</div>
            <h2 style={{ fontSize: 16, fontWeight: 800 }}>{d.title}</h2>
          </div>
          <button className="icon-btn" onClick={() => dispatch(setRoadmapModalAgent(null))}><X size={16} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {/* Timeline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-hover)', border: '1px solid var(--border-default)', borderRadius: 8, marginBottom: 16 }}>
            <Calendar size={16} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Implementation Timeline</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>{d.timeline}</div>
            </div>
          </div>

          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 18 }}>{d.summary}</p>

          {/* Capabilities */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 10 }}>Planned Capabilities</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {d.capabilities.map((cap, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
                  <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 3 }} />
                  <span>{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Modules */}
          <div style={{ padding: '10px 14px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 7, fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>Target Modules: </strong><span className="mono">{d.modules}</span></span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', background: 'var(--bg-hover)', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-solid btn-sm" onClick={() => dispatch(setRoadmapModalAgent(null))}>Acknowledge & Close</button>
        </div>
      </div>
    </div>
  );
};
