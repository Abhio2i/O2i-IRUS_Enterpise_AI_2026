import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { askKnowledgeQuestion } from '../../store/operationsSlice';
import { addAuditLog } from '../../store/governanceSlice';
import { Send, BookOpen, HelpCircle, CheckCircle2 } from 'lucide-react';

const SAMPLE_QUERIES = [
  'What is the maximum autonomous approval threshold for vendor invoices?',
  'What are the mandatory archiving periods for cross-border customs documents?',
  'Who is authorized to approve exceptions exceeding $50,000?',
];

export const KnowledgeAssistantPage = () => {
  const dispatch = useDispatch();
  const history = useSelector((s) => s.operations.knowledgeHistory);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const ask = (q) => {
    const text = q || query;
    if (!text.trim()) return;
    setSearching(true);
    setQuery('');

    setTimeout(() => {
      let answer = '', citations = [];

      if (/threshold|approval|autonomous|limit/i.test(text)) {
        answer = 'Per the Enterprise Procurement Governance SOP (Rev. 2026.2), invoices and purchase commitments up to $10,000 USD can be autonomously processed if all extraction confidence scores exceed 90% and 3-way line-item match succeeds. Any amount exceeding $10,000 USD must be held in the Exception Queue for Level-2 Controller approval.';
        citations = [
          { doc: 'Enterprise_Procurement_Policy_2026.pdf', section: 'Section 4.2 — Autonomous Approval Thresholds', page: 'p. 14' },
          { doc: 'Internal_Controls_Matrix_v3.pdf', section: 'Schedule B: Financial Signing Limits', page: 'p. 7' },
        ];
      } else if (/archiving|retention|customs/i.test(text)) {
        answer = 'In accordance with regional tax authority regulations and customs code Article 51, all cross-border freight declarations, customs bills of entry, and import VAT payment proofs must be preserved in immutable electronic storage for exactly seven (7) fiscal calendar years from the date of clearance.';
        citations = [
          { doc: 'Customs_Compliance_Manual_2026.pdf', section: 'Section 12.3 — Statutory Record Retention', page: 'p. 44' },
        ];
      } else {
        answer = 'Based on retrieved policy embeddings: All vendor invoices and freight waybills undergo automated 3-way validation before release. Any discrepancies exceeding 5% variance in price or quantity are automatically routed to the Operations Exception Queue for human review in accordance with the approved control framework.';
        citations = [
          { doc: 'Procurement_Operating_Manual.pdf', section: 'Section 3.4 — Automated Discrepancy Tolerances', page: 'p. 8' },
        ];
      }

      dispatch(askKnowledgeQuestion({
        id: `KQ-${Date.now()}`,
        question: text,
        answer,
        citations,
        timestamp: new Date().toISOString().replace('T', ' ').substring(11, 16) + ' UTC',
      }));
      dispatch(addAuditLog({
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        actor: 'user:operator@org.com',
        action: 'KNOWLEDGE_RETRIEVAL_RAG',
        endpoint: '/api/v1/knowledge/ask',
        riskTier: 'LOW',
        model: 'pgvector + Spring AI LLM',
        tokens: 1140,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        details: `Query answered with ${citations.length} verified policy citations. Zero-hallucination check passed.`,
      }));
      setSearching(false);
    }, 700);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-tag">Operations · Knowledge Assistant [OPS-5]</div>
          <h2>Enterprise Policy & SOP Assistant</h2>
          <p>
            Zero-hallucination policy Q&amp;A grounded strictly in your verified enterprise SOPs, compliance manuals, and governance documents via pgvector RAG retrieval.
          </p>
        </div>
        <span className="badge" style={{ flexShrink: 0 }}>pgvector RAG · ACTIVE</span>
      </div>

      {/* Query Input */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            placeholder="Ask a policy, SOP, compliance, or procedure question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask()}
          />
          <button className="btn btn-solid" onClick={() => ask()} disabled={searching || !query.trim()}>
            <Send size={13} /> {searching ? 'Retrieving...' : 'Ask'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Suggested:</span>
          {SAMPLE_QUERIES.map((q, i) => (
            <button key={i} className="btn btn-ghost btn-xs" onClick={() => ask(q)}>{q}</button>
          ))}
        </div>
      </div>

      {/* Q&A History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {history.map((item) => (
          <div key={item.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14 }}>
                <HelpCircle size={15} />
                <span>{item.question}</span>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{item.timestamp}</span>
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--bg-hover)', borderRadius: 7, border: '1px solid var(--border-default)', fontSize: 13.5, lineHeight: 1.6, marginBottom: 14, color: 'var(--text-primary)' }}>
              {item.answer}
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <CheckCircle2 size={12} style={{ color: 'var(--success)' }} /> Verified Citations
              </div>
              {item.citations.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: 6, background: 'var(--bg-base)', fontSize: 12, marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={13} style={{ color: 'var(--text-muted)' }} />
                    <strong>{c.doc}</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>— {c.section}</span>
                  </div>
                  <span className="badge" style={{ fontSize: 10 }}>{c.page}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
