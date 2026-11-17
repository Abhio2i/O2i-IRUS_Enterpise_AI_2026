import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { askKnowledgeQuestion } from '../../store/operationsSlice';
import { addAuditLog } from '../../store/governanceSlice';
import { HelpCircle, Search, BookOpen, Send, CheckCircle2, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';

export const KnowledgeAssistantTab = () => {
  const dispatch = useDispatch();
  const history = useSelector((state) => state.operations.knowledgeHistory);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const sampleQueries = [
    'What is the signing authority threshold for capital equipment purchase orders?',
    'What are the mandatory archiving retention periods for Scandinavian customs bills?',
    'Who is authorized to approve invoice exceptions exceeding $50,000?',
  ];

  const handleAsk = (userQuestion) => {
    const q = userQuestion || query;
    if (!q.trim()) return;

    setIsSearching(true);
    setQuery('');

    setTimeout(() => {
      let answer = '';
      let citations = [];

      if (q.toLowerCase().includes('authority') || q.toLowerCase().includes('capital') || q.toLowerCase().includes('equipment') || q.toLowerCase().includes('threshold')) {
        answer = 'Per Section 5.1 of the Bjorn Enterprise Capital Expenditure SOP, capital equipment commitments up to $25,000 USD require Department Head authorization. Amounts between $25,000 and $100,000 USD require the VP of Operations and Plant Director approval. Any single order over $100,000 USD necessitates Bjorn Executive Committee ratification.';
        citations = [
          { doc: 'Bjorn_Capital_Expenditure_SOP_Rev4.pdf', section: 'Section 5.1 - Authority Matrix for Machinery & Asset Procurement', page: 'p. 19' },
          { doc: 'Internal_Controls_Matrix_v3.pdf', section: 'Schedule D: CapEx Authorization Levels', page: 'p. 11' }
        ];
      } else if (q.toLowerCase().includes('customs') || q.toLowerCase().includes('retention') || q.toLowerCase().includes('archiving')) {
        answer = 'In compliance with Swedish Tax Authority (Skatteverket) regulations and EU customs code Article 51, all cross-border freight declarations, customs bills of entry, and import VAT payment proofs must be preserved in immutable electronic storage for exactly seven (7) fiscal calendar years.';
        citations = [
          { doc: 'Nordic_Customs_Compliance_Manual_2026.pdf', section: 'Section 12.3 - Statutory Record Retention Requirements', page: 'p. 44' }
        ];
      } else {
        answer = `Based on retrieved pgvector embeddings from Bjorn operational documents: All vendor invoices and freight waybills undergo automated 3-way validation before release. Any discrepancies exceeding 5% variance in price or quantity are automatically routed to the Operations Exception Queue.`;
        citations = [
          { doc: 'Bjorn_Procurement_Operating_Manual.pdf', section: 'Section 3.4 - Automated Discrepancy Tolerances', page: 'p. 8' }
        ];
      }

      const newEntry = {
        id: `KQ-${Date.now()}`,
        question: q,
        answer,
        citations,
        timestamp: new Date().toISOString().replace('T', ' ').substring(11, 16) + ' UTC',
      };

      dispatch(askKnowledgeQuestion(newEntry));
      dispatch(
        addAuditLog({
          id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          actor: 'user:operator@bjorn.com',
          action: 'KNOWLEDGE_RETRIEVAL_RAG',
          endpoint: '/api/v1/knowledge/ask',
          riskTier: 'LOW',
          model: 'pgvector + Spring AI / Claude-3.5-Sonnet',
          tokens: 1140,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          details: `Query answered from pgvector index with ${citations.length} verified citations.`,
        })
      );

      setIsSearching(false);
    }, 700);
  };

  return (
    <div>
      {/* Policy Assistant Banner */}
      <div
        className="card"
        style={{
          marginBottom: '20px',
          background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-muted) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={20} />
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                Enterprise Knowledge Assistant (OPS-5 & bip-knowledge)
              </h3>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                Zero-hallucination policy answers grounded strictly in verified Bjorn SOPs with citations
              </div>
            </div>
          </div>
          <span className="pill-badge mono">PGVECTOR RETRIEVAL: ACTIVE</span>
        </div>

        {/* Query Input Box */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            className="input-control"
            placeholder="Ask a policy, SOP, or compliance question (e.g., invoice approvals, customs limits)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleAsk()}
            disabled={isSearching || !query.trim()}
          >
            <Send size={14} />
            <span>{isSearching ? 'Retrieving...' : 'Ask Assistant'}</span>
          </button>
        </div>

        {/* Preset Query Chips */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Suggested queries:</span>
          {sampleQueries.map((sample, idx) => (
            <button
              key={idx}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '11.5px', padding: '4px 8px' }}
              onClick={() => handleAsk(sample)}
            >
              <span>{sample}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Q&A Thread with Citations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {history.map((item) => (
          <div key={item.id} className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
                <HelpCircle size={16} />
                <span>{item.question}</span>
              </div>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {item.timestamp}
              </span>
            </div>

            <div
              style={{
                fontSize: '13.5px',
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                padding: '14px',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                marginBottom: '14px',
              }}
            >
              {item.answer}
            </div>

            {/* Citations Box (Section 6.3 - Grounded with document citations) */}
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: 'var(--text-muted)',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle2 size={13} style={{ color: '#22c55e' }} />
                <span>Verified Bjorn Policy Citations (Section 6.3)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {item.citations.map((cite, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-primary)',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={14} style={{ color: 'var(--text-muted)' }} />
                      <strong style={{ color: 'var(--text-primary)' }}>{cite.doc}</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>— {cite.section}</span>
                    </div>
                    <span className="pill-badge mono" style={{ fontSize: '10px', padding: '1px 6px' }}>
                      {cite.page}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
