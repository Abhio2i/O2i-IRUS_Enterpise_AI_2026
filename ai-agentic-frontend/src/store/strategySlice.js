import { createSlice } from '@reduxjs/toolkit';

// ─── STRATEGY: GOALS & SUB-GOALS ─────────────────────────────────
const initialGoals = [
  {
    id: 'GOAL-01',
    pillar: 'Revenue & Market Leadership',
    title: 'Scale to $250M ARR via Pan-European Enterprise AI Penetration',
    description: 'Establish Bjorn Intelligence as the #1 Autonomous Enterprise OS across DACH, Nordic, and UK enterprise segments.',
    owner: 'Magnus Lind, CEO',
    sponsorRole: 'Chief Executive Officer',
    targetYear: '2028',
    overallProgress: 42,
    status: 'ON_TRACK', // ON_TRACK | AT_RISK | AHEAD | DELAYED
    budget: '$34.5M',
    subGoals: [
      { id: 'SG-101', title: 'Capture 35% market share in Nordic automated supply chains', target: '35% Share', current: '18% Share', progress: 51, status: 'ON_TRACK', quarter: 'Q3 2027' },
      { id: 'SG-102', title: 'Expand DACH Tier-1 automotive customer base to 40+ accounts', target: '40 Accounts', current: '14 Accounts', progress: 35, status: 'ON_TRACK', quarter: 'Q1 2028' },
      { id: 'SG-103', title: 'Launch UK Financial Settlement Cloud Corridor', target: '100% Operational', current: '55% Built', progress: 55, status: 'AHEAD', quarter: 'Q4 2027' },
      { id: 'SG-104', title: 'Achieve Net Revenue Retention (NRR) > 135%', target: '135% NRR', current: '124% NRR', progress: 68, status: 'ON_TRACK', quarter: 'Q4 2028' },
    ]
  },
  {
    id: 'GOAL-02',
    pillar: 'Autonomous Operations',
    title: 'Achieve 95% Zero-Touch Autonomous Operations across Core Workflows',
    description: 'Eliminate manual document handling, invoice reconciliation, and exception clearing through self-healing cognitive agent loops.',
    owner: 'Elin Torsson, COO',
    sponsorRole: 'Chief Operating Officer',
    targetYear: '2027',
    overallProgress: 74,
    status: 'AHEAD',
    budget: '$18.0M',
    subGoals: [
      { id: 'SG-201', title: 'Autonomous Invoice Clearing pass rate > 95%', target: '95.0%', current: '91.4%', progress: 88, status: 'ON_TRACK', quarter: 'Q2 2027' },
      { id: 'SG-202', title: 'Sub-60 second average process cycle time (baseline 48m)', target: '<60 sec', current: '4.8 min', progress: 75, status: 'AHEAD', quarter: 'Q3 2027' },
      { id: 'SG-203', title: 'Self-tuning exception resolution without human intervention', target: '80% Auto-fix', current: '45% Auto-fix', progress: 56, status: 'ON_TRACK', quarter: 'Q4 2027' },
      { id: 'SG-204', title: 'Zero human data-entry on freight customs clearance', target: '0% Manual', current: '8% Manual', progress: 82, status: 'AHEAD', quarter: 'Q2 2027' },
    ]
  },
  {
    id: 'GOAL-03',
    pillar: 'ESG & Sustainable Operations',
    title: 'Net-Zero Carbon Operations & Green Supply Chain Mandate',
    description: 'Transition all compute workloads to 100% renewable Nordic hydro/wind data centers and mandate green logistics routing for clients.',
    owner: 'Karin Hedlund, CSO',
    sponsorRole: 'Chief Sustainability Officer',
    targetYear: '2029',
    overallProgress: 38,
    status: 'ON_TRACK',
    budget: '$12.0M',
    subGoals: [
      { id: 'SG-301', title: '100% Renewable power for AI inference cluster workloads', target: '100% Green', current: '78% Green', progress: 78, status: 'AHEAD', quarter: 'Q4 2027' },
      { id: 'SG-302', title: 'Scope 1, 2, 3 carbon footprint audit reduction by 60%', target: '-60% CO2', current: '-22% CO2', progress: 36, status: 'ON_TRACK', quarter: 'Q2 2028' },
      { id: 'SG-303', title: 'Automated green freight emissions calculator embedded in settlement', target: '100% Invoices', current: '20% Invoices', progress: 20, status: 'AT_RISK', quarter: 'Q1 2029' },
    ]
  },
  {
    id: 'GOAL-04',
    pillar: 'Sovereign AI Infrastructure',
    title: 'Build Sovereign European AI Infrastructure & Proprietary SLMs',
    description: 'Maintain complete data sovereignty, EU AI Act compliance, and fine-tune domain-specific Small Language Models for enterprise privacy.',
    owner: 'Dr. Jens Holmgren, CTO',
    sponsorRole: 'Chief Technology Officer',
    targetYear: '2028',
    overallProgress: 60,
    status: 'ON_TRACK',
    budget: '$26.5M',
    subGoals: [
      { id: 'SG-401', title: '100% On-premise air-gapped sovereign cluster option for defense & finance', target: 'Certified', current: 'Beta in Stkhm', progress: 65, status: 'ON_TRACK', quarter: 'Q3 2027' },
      { id: 'SG-402', title: 'Full EU AI Act Tier-1 Compliance certification', target: 'Certified', current: 'Audit in prog', progress: 70, status: 'ON_TRACK', quarter: 'Q1 2028' },
      { id: 'SG-403', title: 'Sub-15ms proprietary document vision transformer latency', target: '<15ms', current: '28ms', progress: 48, status: 'ON_TRACK', quarter: 'Q3 2028' },
    ]
  }
];

// ─── STRATEGY: TIMELINES (2027 - 2029) ───────────────────────────
const initialTimelines = [
  // 2027 Milestones
  {
    id: 'TL-2027-01',
    year: '2027',
    quarter: 'Q1 2027',
    title: 'Launch Autonomous Invoice & Freight Engine v3.0',
    horizon: 'Horizon 1: Foundation & Scale',
    pillar: 'Autonomous Operations',
    capex: '$4.2M',
    leadExec: 'Elin Torsson (COO)',
    status: 'SCHEDULED', // SCHEDULED | IN_PROGRESS | ACHIEVED | DELAYED
    riskScore: 'Low',
    deliverables: ['Self-healing exception router', 'Swedish & Danish automated customs bridge', 'VIES registry zero-cache latency'],
    strategicImpact: 'Accelerates autonomous pass rate from 91% to 95% across 100k monthly vouchers.'
  },
  {
    id: 'TL-2027-02',
    year: '2027',
    quarter: 'Q2 2027',
    title: 'Stockholm Sovereign AI Cluster Expansion (Tier-IV)',
    horizon: 'Horizon 1: Foundation & Scale',
    pillar: 'Sovereign AI Infrastructure',
    capex: '$6.5M',
    leadExec: 'Dr. Jens Holmgren (CTO)',
    status: 'SCHEDULED',
    riskScore: 'Medium',
    deliverables: ['128 H100 GPU cluster dedicated to European sovereign inference', '100% hydro-powered facility certification'],
    strategicImpact: 'Guarantees GDPR Article 32 data sovereignty for banking and defense clients.'
  },
  {
    id: 'TL-2027-03',
    year: '2027',
    quarter: 'Q4 2027',
    title: 'UK & Benelux Commercial Hub Expansion',
    horizon: 'Horizon 1: Foundation & Scale',
    pillar: 'Revenue & Market Leadership',
    capex: '$5.0M',
    leadExec: 'Magnus Lind (CEO)',
    status: 'SCHEDULED',
    riskScore: 'Low',
    deliverables: ['London & Amsterdam enterprise sales operations', 'GBP cross-border automated clearing gateway'],
    strategicImpact: 'Expected to add $35M in pipeline across British & Dutch logistics enterprises.'
  },

  // 2028 Milestones
  {
    id: 'TL-2028-01',
    year: '2028',
    quarter: 'Q1 2028',
    title: 'Full EU AI Act Comprehensive Compliance Sign-Off',
    horizon: 'Horizon 2: European Expansion',
    pillar: 'Sovereign AI Infrastructure',
    capex: '$2.8M',
    leadExec: 'Mette Hansen (Head of Legal & Compliance)',
    status: 'PLANNED',
    riskScore: 'Medium',
    deliverables: ['EU AI Board formal certification', 'Explainability & bias audit reporting engine', 'ISO 42001 AI Management System cert'],
    strategicImpact: 'Moat against US competitors facing European regulatory scrutiny.'
  },
  {
    id: 'TL-2028-02',
    year: '2028',
    quarter: 'Q2 2028',
    title: 'Autonomous Multi-Modal Supply Chain Agent Network',
    horizon: 'Horizon 2: European Expansion',
    pillar: 'Autonomous Operations',
    capex: '$7.5M',
    leadExec: 'Elin Torsson (COO)',
    status: 'PLANNED',
    riskScore: 'High',
    deliverables: ['Autonomous negotiations with freight forwarders', 'Real-time multi-carrier carbon optimization', 'Automated bill-of-lading settlement'],
    strategicImpact: 'Unlocks $45M annual operational savings for top 50 European clients.'
  },
  {
    id: 'TL-2028-03',
    year: '2028',
    quarter: 'Q4 2028',
    title: 'Cross $150M ARR & Strategic Acquisition in DACH',
    horizon: 'Horizon 2: European Expansion',
    pillar: 'Revenue & Market Leadership',
    capex: '$18.0M',
    leadExec: 'Magnus Lind (CEO)',
    status: 'PLANNED',
    riskScore: 'Medium',
    deliverables: ['Acquisition of leading German EDI/ERP integration specialist', 'Integrated German automotive customer base'],
    strategicImpact: 'Doubles German market penetration and accelerates pathway to $250M ARR.'
  },

  // 2029 Milestones
  {
    id: 'TL-2029-01',
    year: '2029',
    quarter: 'Q1 2029',
    title: 'Net-Zero Carbon Supply Chain Milestone (60% Cut)',
    horizon: 'Horizon 3: Global Autonomy',
    pillar: 'ESG & Sustainable Operations',
    capex: '$4.0M',
    leadExec: 'Karin Hedlund (CSO)',
    status: 'PLANNED',
    riskScore: 'Medium',
    deliverables: ['Verified Scope 1, 2, 3 carbon reduction', '100% green routing integration mandatory on all contracts'],
    strategicImpact: 'Positions Bjorn as the worldwide ESG leader in cognitive enterprise operations.'
  },
  {
    id: 'TL-2029-02',
    year: '2029',
    quarter: 'Q3 2029',
    title: 'Global Expansion: North American Sovereign Node Rollout',
    horizon: 'Horizon 3: Global Autonomy',
    pillar: 'Revenue & Market Leadership',
    capex: '$15.0M',
    leadExec: 'Magnus Lind (CEO)',
    status: 'PLANNED',
    riskScore: 'High',
    deliverables: ['US East & West data nodes with FedRAMP certification', 'Bilateral transatlantic settlement clearing'],
    strategicImpact: 'Reaches final milestone towards global enterprise leadership and $250M ARR.'
  }
];

// ─── STRATEGY: PLAN OF ACTION ────────────────────────────────────
const initialActionPlans = [
  {
    id: 'ACT-01',
    title: 'Sovereign LLM Fine-Tuning on Nordic Regulatory Data',
    stream: 'Technology & AI',
    priority: 'HIGH',
    leadOwner: 'Dr. Jens Holmgren',
    raci: { r: 'Sofia Vestergaard', a: 'Dr. Jens Holmgren', c: 'Mette Hansen', i: 'Elin Torsson' },
    status: 'IN_EXECUTION', // DRAFT | APPROVED | IN_EXECUTION | COMPLETED
    startDate: '2026-11-01',
    targetDate: '2027-04-30',
    budget: '$1,400,000',
    kpi: '98% extraction accuracy on Scandinavian dialects',
    actionSteps: [
      { step: 'Ingest 5M anonymized Nordic invoices & tax filing transcripts', done: true },
      { step: 'Pre-train 14B parameter domain-specific multilingual model', done: true },
      { step: 'Benchmark against GPT-4o on complex table layout reasoning', done: false },
      { step: 'Deploy into private air-gapped production cluster', done: false },
    ]
  },
  {
    id: 'ACT-02',
    title: 'Strategic DACH Automotive Supplier ABM Blitz',
    stream: 'Revenue & Growth',
    priority: 'HIGH',
    leadOwner: 'Magnus Lind',
    raci: { r: 'Chief Commercial Officer', a: 'Magnus Lind', c: 'VP Enterprise Sales', i: 'Board of Directors' },
    status: 'IN_EXECUTION',
    startDate: '2026-10-15',
    targetDate: '2027-06-30',
    budget: '$850,000',
    kpi: 'Close 12 Tier-1 German OEM suppliers ($18M ACV)',
    actionSteps: [
      { step: 'Identify top 80 DACH automotive manufacturers with ERP fragmentation', done: true },
      { step: 'Executive outreach dinners in Munich, Stuttgart & Frankfurt', done: false },
      { step: 'Deliver tailored 48-hour pilot proofs-of-concept for 10 finalists', done: false },
      { step: 'Negotiate 3-year multi-entity enterprise contracts', done: false },
    ]
  },
  {
    id: 'ACT-03',
    title: 'Automated Carbon Footprint Invoicing Protocol',
    stream: 'ESG & Governance',
    priority: 'MEDIUM',
    leadOwner: 'Karin Hedlund',
    raci: { r: 'Henrik Lindqvist', a: 'Karin Hedlund', c: 'Lars Nygren', i: 'Compliance Lead' },
    status: 'APPROVED',
    startDate: '2027-01-10',
    targetDate: '2027-07-31',
    budget: '$420,000',
    kpi: 'Real-time carbon emissions printed on 100% of freight vouchers',
    actionSteps: [
      { step: 'Integrate European EcoTransIT freight emission coefficient APIs', done: true },
      { step: 'Build automated emission calculation hook in Kafka ingestion pipeline', done: false },
      { step: 'Publish ESG monthly carbon reduction certificate for enterprise clients', done: false },
    ]
  },
  {
    id: 'ACT-04',
    title: 'Enterprise Capital Allocation & M&A War Chest Strategy',
    stream: 'Corporate Finance & M&A',
    priority: 'HIGH',
    leadOwner: 'Board Investment Committee',
    raci: { r: 'CFO', a: 'Magnus Lind', c: 'General Counsel', i: 'Institutional Investors' },
    status: 'IN_EXECUTION',
    startDate: '2026-09-01',
    targetDate: '2027-12-31',
    budget: '$50,000,000',
    kpi: 'Secure $50M credit facility for bolt-on AI acquisitions',
    actionSteps: [
      { step: 'Finalize credit terms with Nordic Investment Bank consortium', done: true },
      { step: 'Complete due diligence on German EDI connector company', done: false },
      { step: 'Establish target valuation models and post-merger integration team', done: false },
    ]
  }
];

// ─── STRATEGY: CORPORATE POLICIES ────────────────────────────────
const initialPolicies = [
  {
    id: 'POL-01',
    code: 'GOV-AI-2027',
    title: 'Autonomous AI Decision Signing & Liability Charter',
    category: 'AI Ethics & Autonomy',
    version: 'v3.0',
    approvalStatus: 'BOARD_APPROVED', // BOARD_APPROVED | UNDER_REVIEW | DRAFT
    effectiveDate: '2027-01-01',
    lastReviewDate: '2026-10-18',
    owner: 'Magnus Lind (CEO) & Legal Counsel',
    complianceStandard: 'EU AI Act Article 14 & ISO 42001',
    summary: 'Defines autonomous monetary execution thresholds ($10,000 auto-clear, $50,000 dual-auth), algorithmic explainability requirements, and legal accountability boundaries for non-human cognitive agents.',
    enforcementRate: '100% Automated',
    keyClauses: [
      'Clause 2.1: Full audit traceability on all machine-signed financial vouchers.',
      'Clause 3.4: Mandatory human intervention if extraction confidence falls below 90%.',
      'Clause 5.2: Bi-annual independent algorithmic bias audit by external certified counsel.'
    ]
  },
  {
    id: 'POL-02',
    code: 'FIN-CAP-2027',
    title: 'Capital Allocation & Strategic M&A Investment Mandate',
    category: 'Finance & Capital',
    version: 'v2.2',
    approvalStatus: 'BOARD_APPROVED',
    effectiveDate: '2026-12-01',
    lastReviewDate: '2026-09-30',
    owner: 'Board Investment Committee',
    complianceStandard: 'SOX 404 & Swedish Companies Act',
    summary: 'Governs corporate liquidity thresholds, minimum return on invested capital (ROIC > 22%), and criteria for purchasing intellectual property, patents, or bolt-on European competitors.',
    enforcementRate: 'Board Review Mandatory',
    keyClauses: [
      'Clause 1.3: Minimum 18-month cash runway reserve buffer at all times.',
      'Clause 4.1: Acquisitions exceeding $5M require supermajority Board sign-off.',
      'Clause 6.3: Post-acquisition technology stack must transition to Bjorn Sovereign Mesh within 120 days.'
    ]
  },
  {
    id: 'POL-03',
    code: 'ESG-ZERO-2028',
    title: 'Corporate Net-Zero Carbon & Supplier Code of Conduct',
    category: 'Sustainability & ESG',
    version: 'v1.4',
    approvalStatus: 'UNDER_REVIEW',
    effectiveDate: '2027-06-01',
    lastReviewDate: '2026-10-22',
    owner: 'Karin Hedlund (CSO)',
    complianceStandard: 'CSRD Directive & GHG Protocol',
    summary: 'Mandates that all third-party data center operators, hardware suppliers, and logistics vendors prove carbon neutrality or pay a standardized green penalty fee.',
    enforcementRate: '88% Compliant',
    keyClauses: [
      'Clause 3.1: Zero fossil-fuel energy in primary Tier-IV data center contracts.',
      'Clause 4.2: Supplier annual carbon emission reports must be submitted before contract renewal.',
      'Clause 7.1: Internal carbon tax ($65/ton CO2) levied on executive international flight travel.'
    ]
  },
  {
    id: 'POL-04',
    code: 'SEC-SOV-2027',
    title: 'Sovereign Cloud Data Residency & Encryption Standard',
    category: 'Data Security & Sovereignty',
    version: 'v4.0',
    approvalStatus: 'BOARD_APPROVED',
    effectiveDate: '2026-11-01',
    lastReviewDate: '2026-10-15',
    owner: 'Dr. Jens Holmgren (CTO)',
    complianceStandard: 'GDPR Chapter V & EU Cloud Code of Conduct',
    summary: 'Strict prohibition on transferring European customer financial records or vector embeddings outside EEA territory without hardware-enforced confidential computing envelopes.',
    enforcementRate: '100% Cryptographically Enforced',
    keyClauses: [
      'Clause 1.2: Customer encryption keys must reside on dedicated European CloudKMS HSMs.',
      'Clause 2.4: Zero telemetry data exfiltration to US parent cloud operators.',
      'Clause 4.5: Immediate failover to local offline cache in case of transatlantic subsea cable cut.'
    ]
  }
];

const initialState = {
  goals: initialGoals,
  timelines: initialTimelines,
  actionPlans: initialActionPlans,
  policies: initialPolicies,
  timelineFilterYear: 'ALL', // 'ALL' | '2027' | '2028' | '2029'
  actionPlanFilterStream: 'ALL',
  timelineRange: {
    startYear: 2027,
    endYear: 2029,
  },
  horizons: [
    { year: 2027, phaseLabel: 'Horizon 1', name: 'Foundation & Scale', capexTarget: '$15.7M', focus: 'Core cognitive infrastructure & automated intake' },
    { year: 2028, phaseLabel: 'Horizon 2', name: 'European Expansion', capexTarget: '$28.3M', focus: 'DACH penetration & multi-modal agent networks' },
    { year: 2029, phaseLabel: 'Horizon 3', name: 'Global Autonomy', capexTarget: '$19.0M', focus: 'Transatlantic sovereign nodes & net-zero operations' },
  ],
};

export const strategySlice = createSlice({
  name: 'strategy',
  initialState,
  reducers: {
    // ─── GOALS REDUCERS ──────────────────────────────────────────
    addGoal: (state, action) => {
      state.goals.unshift(action.payload);
    },
    updateGoalProgress: (state, action) => {
      const { id, progress } = action.payload;
      const g = state.goals.find(goal => goal.id === id);
      if (g) {
        g.overallProgress = Math.min(100, Math.max(0, progress));
        if (g.overallProgress >= 100) g.status = 'AHEAD';
        else if (g.overallProgress < 40) g.status = 'AT_RISK';
        else g.status = 'ON_TRACK';
      }
    },
    toggleSubGoalStatus: (state, action) => {
      const { goalId, subGoalId } = action.payload;
      const g = state.goals.find(goal => goal.id === goalId);
      if (g) {
        const sg = g.subGoals.find(s => s.id === subGoalId);
        if (sg) {
          sg.status = sg.status === 'AHEAD' || sg.status === 'ON_TRACK' ? 'COMPLETED' : 'ON_TRACK';
          sg.progress = sg.status === 'COMPLETED' ? 100 : 75;
          const avg = Math.round(g.subGoals.reduce((acc, s) => acc + s.progress, 0) / g.subGoals.length);
          g.overallProgress = avg;
        }
      }
    },

    // ─── TIMELINES REDUCERS ──────────────────────────────────────
    addTimelineMilestone: (state, action) => {
      state.timelines.unshift(action.payload);
    },
    updateTimelineStatus: (state, action) => {
      const { id, status } = action.payload;
      const m = state.timelines.find(tl => tl.id === id);
      if (m) m.status = status;
    },
    adjustMilestoneTimeline: (state, action) => {
      const { id, year, quarter, capex, riskScore, leadExec, title } = action.payload;
      const m = state.timelines.find(tl => tl.id === id);
      if (m) {
        if (title !== undefined) m.title = title;
        if (year !== undefined) {
          m.year = String(year);
          const matchedHorizon = state.horizons.find(h => String(h.year) === String(year));
          m.horizon = matchedHorizon ? matchedHorizon.name : `Horizon: Phase ${year}`;
        }
        if (quarter !== undefined) m.quarter = quarter;
        if (capex !== undefined) m.capex = capex;
        if (riskScore !== undefined) m.riskScore = riskScore;
        if (leadExec !== undefined) m.leadExec = leadExec;
      }
    },
    shiftMilestoneQuarter: (state, action) => {
      const { id, delta } = action.payload; // delta: -1 or +1
      const start = state.timelineRange.startYear || 2027;
      const end = state.timelineRange.endYear || 2029;
      const allQuarters = [];
      for (let y = start; y <= end; y++) {
        allQuarters.push(`Q1 ${y}`, `Q2 ${y}`, `Q3 ${y}`, `Q4 ${y}`);
      }
      const m = state.timelines.find(tl => tl.id === id);
      if (m) {
        const curIdx = allQuarters.indexOf(m.quarter);
        if (curIdx !== -1) {
          const newIdx = Math.min(allQuarters.length - 1, Math.max(0, curIdx + delta));
          const newQuarter = allQuarters[newIdx];
          m.quarter = newQuarter;
          const newYear = newQuarter.split(' ')[1];
          m.year = newYear;
          const matchedHorizon = state.horizons.find(h => String(h.year) === String(newYear));
          m.horizon = matchedHorizon ? matchedHorizon.name : `Horizon: Phase ${newYear}`;
        }
      }
    },
    deleteMilestone: (state, action) => {
      const { id } = action.payload;
      state.timelines = state.timelines.filter(t => t.id !== id);
    },
    setTimelineFilterYear: (state, action) => {
      state.timelineFilterYear = action.payload;
    },
    setTimelineRange: (state, action) => {
      const { startYear, endYear } = action.payload;
      const s = parseInt(startYear);
      const e = parseInt(endYear);
      if (s <= e) {
        state.timelineRange = { startYear: s, endYear: e };
        const years = [];
        for (let y = s; y <= e; y++) years.push(y);
        state.horizons = years.map((y, idx) => {
          const existing = state.horizons.find(h => h.year === y);
          if (existing) return existing;
          return {
            year: y,
            phaseLabel: `Horizon ${idx + 1}`,
            name: `Phase ${idx + 1}: Strategic Expansion`,
            capexTarget: '$15.0M',
            focus: `Strategic corporate growth and execution for Horizon ${idx + 1}`
          };
        });
      }
    },
    updateHorizon: (state, action) => {
      const { year, name, capexTarget, focus } = action.payload;
      const h = state.horizons.find(item => item.year === parseInt(year));
      if (h) {
        if (name !== undefined) h.name = name;
        if (capexTarget !== undefined) h.capexTarget = capexTarget;
        if (focus !== undefined) h.focus = focus;
      }
    },

    // ─── ACTION PLANS REDUCERS ───────────────────────────────────
    addActionPlan: (state, action) => {
      state.actionPlans.unshift(action.payload);
    },
    updateActionPlanStatus: (state, action) => {
      const { id, status } = action.payload;
      const a = state.actionPlans.find(plan => plan.id === id);
      if (a) a.status = status;
    },
    toggleActionStep: (state, action) => {
      const { planId, stepIndex } = action.payload;
      const a = state.actionPlans.find(plan => plan.id === planId);
      if (a && a.actionSteps[stepIndex]) {
        a.actionSteps[stepIndex].done = !a.actionSteps[stepIndex].done;
        const allDone = a.actionSteps.every(s => s.done);
        if (allDone) a.status = 'COMPLETED';
      }
    },

    // ─── POLICIES REDUCERS ───────────────────────────────────────
    addPolicy: (state, action) => {
      state.policies.unshift(action.payload);
    },
    updatePolicyApproval: (state, action) => {
      const { id, approvalStatus } = action.payload;
      const p = state.policies.find(pol => pol.id === id);
      if (p) {
        p.approvalStatus = approvalStatus;
        p.lastReviewDate = new Date().toISOString().split('T')[0];
      }
    }
  }
});

export const {
  addGoal,
  updateGoalProgress,
  toggleSubGoalStatus,
  addTimelineMilestone,
  updateTimelineStatus,
  adjustMilestoneTimeline,
  shiftMilestoneQuarter,
  deleteMilestone,
  setTimelineFilterYear,
  setTimelineRange,
  updateHorizon,
  addActionPlan,
  updateActionPlanStatus,
  toggleActionStep,
  addPolicy,
  updatePolicyApproval
} = strategySlice.actions;

export default strategySlice.reducer;
