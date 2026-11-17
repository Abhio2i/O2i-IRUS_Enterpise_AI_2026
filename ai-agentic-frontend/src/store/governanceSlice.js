import { createSlice } from '@reduxjs/toolkit';

const initialAuditLogs = [
  {
    id: 'AUD-991',
    actor: 'system.document-ai',
    action: 'FIELD_EXTRACTION_COMPLETED',
    endpoint: '/api/v1/documents/DOC-9101',
    riskTier: 'LOW',
    model: 'Spring AI / Claude-3.5-Sonnet',
    tokens: 1842,
    timestamp: '2026-10-23 16:41:22 UTC',
    details: 'Extracted 6 fields from vendor invoice DOC-9101 with average confidence 87.2%'
  },
  {
    id: 'AUD-992',
    actor: 'system.rule-engine',
    action: 'EXCEPTION_TRIGGERED',
    endpoint: '/api/v1/workflows/WF-INST-2026-0891',
    riskTier: 'HIGH',
    model: 'RuleEngine / Drools',
    tokens: 0,
    timestamp: '2026-10-23 16:41:25 UTC',
    details: 'Item flagged for human-in-the-loop: Exceeds $10,000 threshold ($48,250.00)'
  },
  {
    id: 'AUD-993',
    actor: 'agent.marketing-studio',
    action: 'CAMPAIGN_CONTENT_SYNTHESIZED',
    endpoint: '/api/v1/marketing/campaigns/generate',
    riskTier: 'MEDIUM',
    model: 'Spring AI / GPT-4o',
    tokens: 2410,
    timestamp: '2026-10-23 16:30:11 UTC',
    details: 'Generated LinkedIn Outreach copy. Brand rulebook compliance verified (96/100)'
  },
  {
    id: 'AUD-994',
    actor: 'user:freja.lind@bjorn.com',
    action: 'KNOWLEDGE_RETRIEVAL_QUERY',
    endpoint: '/api/v1/knowledge/ask',
    riskTier: 'LOW',
    model: 'pgvector + text-embedding-3 + LLM',
    tokens: 954,
    timestamp: '2026-10-23 16:15:02 UTC',
    details: 'Retrieved 3 chunks from Global Procurement Policy 2026. Zero hallucination filter passed.'
  }
];

const initialState = {
  auditLogs: initialAuditLogs,
  monthlyBudget: 5000,
  monthlySpent: 1240.85,
  totalTokensUsed: '4,892,100',
  activeRiskTierBreakdown: {
    low: 74,
    medium: 21,
    high: 5
  }
};

export const governanceSlice = createSlice({
  name: 'governance',
  initialState,
  reducers: {
    addAuditLog: (state, action) => {
      state.auditLogs.unshift(action.payload);
    },
  },
});

export const { addAuditLog } = governanceSlice.actions;
export default governanceSlice.reducer;
