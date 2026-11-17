import { createSlice } from '@reduxjs/toolkit';

// ─── INITIAL REVENUES (ENTERPRISE PROJECTS) ──────────────────────
const initialRevenues = [
  {
    id: 'REV-PRJ-01',
    projectName: 'DACH Tier-1 Automotive EDI & Cognitive Dispatch',
    client: 'Bavaria Motor Works & Tier-1 Consortium',
    domain: 'Automotive & Manufacturing',
    contractValue: '$14,200,000',
    arr: '$14.2M',
    mrr: '$1,183,333',
    billedToDate: '$10,650,000',
    receivablesDue: '$3,550,000',
    billingStatus: 'PARTIALLY_BILLED', // BILLED | PARTIALLY_BILLED | PENDING_MILESTONE | OVERDUE
    grossMargin: '86.4%',
    paymentTerms: 'Net 30 Days',
    contractStart: '2026-01-01',
    contractEnd: '2028-12-31',
    tier: 'Enterprise Platinum',
    health: 'HEALTHY'
  },
  {
    id: 'REV-PRJ-02',
    projectName: 'Nordic Autonomous Freight Customs & Clearance Grid',
    client: 'Nordic Transport & Port Alliance',
    domain: 'Logistics & Supply Chain',
    contractValue: '$9,800,000',
    arr: '$9.8M',
    mrr: '$816,666',
    billedToDate: '$7,350,000',
    receivablesDue: '$2,450,000',
    billingStatus: 'BILLED',
    grossMargin: '84.0%',
    paymentTerms: 'Net 45 Days',
    contractStart: '2026-03-15',
    contractEnd: '2028-03-14',
    tier: 'Enterprise Platinum',
    health: 'HEALTHY'
  },
  {
    id: 'REV-PRJ-03',
    projectName: 'UK Cross-Border Financial Settlement Cloud Corridor',
    client: 'London & Northern Banking Trust',
    domain: 'Financial Services & Banking',
    contractValue: '$12,500,000',
    arr: '$12.5M',
    mrr: '$1,041,666',
    billedToDate: '$6,250,000',
    receivablesDue: '$6,250,000',
    billingStatus: 'PENDING_MILESTONE',
    grossMargin: '89.2%',
    paymentTerms: 'Net 30 Days',
    contractStart: '2026-06-01',
    contractEnd: '2029-05-31',
    tier: 'Enterprise Platinum',
    health: 'HEALTHY'
  },
  {
    id: 'REV-PRJ-04',
    projectName: 'Benelux Maritime Container Multi-Modal AI Pipeline',
    client: 'Rotterdam-Antwerp Gateway Group',
    domain: 'Maritime Logistics',
    contractValue: '$6,400,000',
    arr: '$6.4M',
    mrr: '$533,333',
    billedToDate: '$4,800,000',
    receivablesDue: '$1,600,000',
    billingStatus: 'BILLED',
    grossMargin: '81.5%',
    paymentTerms: 'Net 30 Days',
    contractStart: '2026-02-01',
    contractEnd: '2027-12-31',
    tier: 'Enterprise Gold',
    health: 'HEALTHY'
  },
  {
    id: 'REV-PRJ-05',
    projectName: 'Sovereign Defense Air-Gapped Inference Cluster',
    client: 'Scandinavian Sovereign Defense Agency',
    domain: 'Government & Defense',
    contractValue: '$5,700,000',
    arr: '$5.7M',
    mrr: '$475,000',
    billedToDate: '$2,850,000',
    receivablesDue: '$2,850,000',
    billingStatus: 'PENDING_MILESTONE',
    grossMargin: '92.0%',
    paymentTerms: 'Net 60 Days',
    contractStart: '2026-08-01',
    contractEnd: '2029-07-31',
    tier: 'Enterprise Sovereign',
    health: 'HEALTHY'
  }
];

// ─── INITIAL EXPENSES (FIXED + HUMAN CAPITAL + EQUIPMENT) ────────
const initialExpenses = [
  // 1. FIXED COSTS
  {
    id: 'EXP-FIX-01',
    category: 'FIXED_COSTS',
    name: 'Stockholm Tier-IV Sovereign Data Center Lease',
    vendor: 'Nordic Hydro Colocation AB',
    monthlyCost: '$145,000',
    annualCost: '$1,740,000',
    billingCycle: 'Monthly',
    department: 'Infrastructure & Sovereign AI',
    status: 'ACTIVE',
    renewalDate: '2027-10-31',
    notes: '100% renewable hydro/wind powered facility with zero carbon footprint SLA.'
  },
  {
    id: 'EXP-FIX-02',
    category: 'FIXED_COSTS',
    name: 'Frankfurt Direct Interconnect & Colocation Hub',
    vendor: 'Equinix FR4 Sovereign Node',
    monthlyCost: '$92,000',
    annualCost: '$1,104,000',
    billingCycle: 'Monthly',
    department: 'Infrastructure & Sovereign AI',
    status: 'ACTIVE',
    renewalDate: '2027-08-15',
    notes: 'Low-latency gateway (<3ms) to Frankfurt DE-CIX and DACH banking core.'
  },
  {
    id: 'EXP-FIX-03',
    category: 'FIXED_COSTS',
    name: 'Enterprise Cybersecurity & Errors & Omissions Policy',
    vendor: 'Allianz Global Corporate & Specialty',
    monthlyCost: '$38,000',
    annualCost: '$456,000',
    billingCycle: 'Quarterly',
    department: 'Legal & Risk Compliance',
    status: 'ACTIVE',
    renewalDate: '2027-04-30',
    notes: '$100M aggregate policy covering sovereign AI liability and GDPR indemnification.'
  },
  {
    id: 'EXP-FIX-04',
    category: 'FIXED_COSTS',
    name: 'Cloud Dev Platform & Kafka Enterprise Licenses',
    vendor: 'Confluent & GitHub Enterprise Cloud',
    monthlyCost: '$42,000',
    annualCost: '$504,000',
    billingCycle: 'Annual Prepaid',
    department: 'Engineering & Platform Ops',
    status: 'ACTIVE',
    renewalDate: '2027-06-30',
    notes: 'Distributed event streaming across 16 core ingestion topics.'
  },

  // 2. HUMAN CAPITAL COSTS
  {
    id: 'EXP-HUM-01',
    category: 'HUMAN_CAPITAL',
    name: 'Core Cognitive Engineering & Model Fine-Tuning Team',
    vendor: 'Internal Engineering Payroll (38 Engineers)',
    monthlyCost: '$540,000',
    annualCost: '$6,480,000',
    billingCycle: 'Monthly Payroll',
    department: 'Research & Model Development',
    status: 'ACTIVE',
    headcount: 38,
    avgSalary: '$170,500',
    notes: 'Transformers, SLM quantization, and Scandinavian/German NLP domain fine-tuning.'
  },
  {
    id: 'EXP-HUM-02',
    category: 'HUMAN_CAPITAL',
    name: 'Executive Management & Board Leadership',
    vendor: 'C-Suite Executive Payroll (CEO, COO, CTO, CSO, VP)',
    monthlyCost: '$185,000',
    annualCost: '$2,220,000',
    billingCycle: 'Monthly Payroll',
    department: 'Executive Leadership',
    status: 'ACTIVE',
    headcount: 6,
    avgSalary: '$370,000',
    notes: 'Senior executive compensation including statutory European pension mandates.'
  },
  {
    id: 'EXP-HUM-03',
    category: 'HUMAN_CAPITAL',
    name: 'Autonomous Operations & Support Specialist Unit',
    vendor: 'Customer Operations & Solutions Architects (22 Staff)',
    monthlyCost: '$210,000',
    annualCost: '$2,520,000',
    billingCycle: 'Monthly Payroll',
    department: 'Autonomous Operations',
    status: 'ACTIVE',
    headcount: 22,
    avgSalary: '$114,500',
    notes: 'Exception resolution, client integration engineering, and Tier-3 technical support.'
  },
  {
    id: 'EXP-HUM-04',
    category: 'HUMAN_CAPITAL',
    name: 'European Regulatory Compliance & Legal Counsel',
    vendor: 'In-House Legal & External Regulatory Counsel',
    monthlyCost: '$75,000',
    annualCost: '$900,000',
    billingCycle: 'Monthly',
    department: 'Legal & Governance',
    status: 'ACTIVE',
    headcount: 5,
    avgSalary: '$180,000',
    notes: 'EU AI Act compliance sign-offs, GDPR Article 32 audits, and cross-border IP protection.'
  },

  // 3. EQUIPMENT & HARDWARE COSTS
  {
    id: 'EXP-EQP-01',
    category: 'EQUIPMENT_HARDWARE',
    name: 'NVIDIA H100 SXM5 80GB GPU Supercomputing Nodes (128 Units)',
    vendor: 'Hewlett Packard Enterprise / NVIDIA Tier-1',
    monthlyCost: '$260,000',
    annualCost: '$3,120,000',
    billingCycle: 'Capital Equipment Lease (36m)',
    department: 'Hardware & Compute Clusters',
    status: 'ACTIVE',
    depreciationYears: 4,
    unitsCount: 128,
    notes: 'Air-cooled supercluster dedicated to European sovereign multi-tenant inference.'
  },
  {
    id: 'EXP-EQP-02',
    category: 'EQUIPMENT_HARDWARE',
    name: 'Quantum-Resistant HSM & Envelope Encryption Hardware Racks',
    vendor: 'Thales Luna PCIe HSM Enterprise',
    monthlyCost: '$48,000',
    annualCost: '$576,000',
    billingCycle: 'Quarterly Amortization',
    department: 'Security & Sovereignty',
    status: 'ACTIVE',
    depreciationYears: 5,
    unitsCount: 16,
    notes: 'FIPS 140-3 Level 3 hardware security modules storing zero-trust master keys.'
  },
  {
    id: 'EXP-EQP-03',
    category: 'EQUIPMENT_HARDWARE',
    name: 'High-Density 800Gbps InfiniBand NDR Networking Fabric',
    vendor: 'NVIDIA Quantum-2 InfiniBand Core',
    monthlyCost: '$55,000',
    annualCost: '$660,000',
    billingCycle: 'Lease with Purchase Option',
    department: 'Hardware & Compute Clusters',
    status: 'ACTIVE',
    depreciationYears: 4,
    unitsCount: 24,
    notes: 'Sub-microsecond inter-node communication latency for parallel SLM inference.'
  },
  {
    id: 'EXP-EQP-04',
    category: 'EQUIPMENT_HARDWARE',
    name: 'Edge AI Telemetry Gateway Gatekeepers (On-Premises Client Nodes)',
    vendor: 'Advantech Enterprise Embedded Rigs',
    monthlyCost: '$28,000',
    annualCost: '$336,000',
    billingCycle: 'Monthly',
    department: 'Autonomous Operations',
    status: 'ACTIVE',
    depreciationYears: 3,
    unitsCount: 90,
    notes: 'Pre-processing edge boxes deployed inside client logistics hubs.'
  }
];

// ─── INITIAL TAXES & FISCAL COMPLIANCE ───────────────────────────
const initialTaxes = {
  corporateTaxRate: '20.6%', // Swedish Corporate Tax Rate
  effectiveTaxRate: '14.8%', // Reduced due to Sovereign R&D Credits
  grossTaxableIncomeYtd: '$10,400,000',
  totalTaxProvisionYtd: '$1,539,200',
  rdTaxCreditOffset: '-$603,200', // Vinnova / EU Horizon Tech credit
  netTaxLiabilityPayable: '$936,000',
  taxComplianceStatus: 'FULLY_COMPLIANT',
  vatReconciliation: {
    status: 'RECONCILED',
    grossVatCollected: '$7,420,000',
    inputVatRecoverable: '$5,180,000',
    netVatRemitted: '$2,240,000',
    viesReportingStatus: 'Cross-Border EU VIES Registry Matches 100%'
  },
  statutoryCalendar: [
    { id: 'TAX-01', obligation: 'Q4 Estimated Corporate Tax Advance Payment', dueDate: '2026-11-12', amount: '$468,000', status: 'PENDING', authority: 'Skatteverket (Swedish Tax Agency)' },
    { id: 'TAX-02', obligation: 'Monthly EU OSS Cross-Border VAT Declaration', dueDate: '2026-11-20', amount: '$186,000', status: 'PENDING', authority: 'European Union One-Stop-Shop' },
    { id: 'TAX-03', obligation: 'Statutory Payroll Withholding & Social Contributions', dueDate: '2026-11-15', amount: '$312,000', status: 'PREPARED', authority: 'Swedish Social Insurance Agency' },
    { id: 'TAX-04', obligation: 'Annual Transfer Pricing & Cross-Border Sovereign Audit', dueDate: '2027-01-31', amount: 'N/A (Filing)', status: 'IN_PREPARATION', authority: 'Deloitte Fiscal Audit Team' }
  ]
};

// ─── INITIAL FINANCIAL PROJECTIONS & SCENARIOS ──────────────────
const initialProjections = {
  activeScenario: 'BASE_CASE', // BASE_CASE | BULL_CASE | BEAR_CASE
  scenarios: {
    BASE_CASE: {
      name: 'Base Case: Sustained European Enterprise Penetration',
      description: 'Steady 42% YoY ARR growth with expansion across DACH, Nordic, and UK logistics sectors.',
      growthRatePercent: 42,
      burnRateTrajectory: 'Decreasing (-18% YoY)',
      breakEvenQuarter: 'Q2 2027 (Achieved Operating Profitability)',
      dataPoints: [
        { year: '2026', arr: '$48.6M', revenue: '$38.2M', cogs: '$7.2M', opex: '$24.5M', ebitda: '$6.5M', cashFlow: '$4.2M', headcount: 82 },
        { year: '2027', arr: '$78.0M', revenue: '$68.0M', cogs: '$11.8M', opex: '$38.0M', ebitda: '$18.2M', cashFlow: '$14.0M', headcount: 120 },
        { year: '2028', arr: '$140.0M', revenue: '$126.0M', cogs: '$21.0M', opex: '$62.0M', ebitda: '$43.0M', cashFlow: '$36.5M', headcount: 195 },
        { year: '2029', arr: '$250.0M', revenue: '$232.0M', cogs: '$36.0M', opex: '$98.0M', ebitda: '$98.0M', cashFlow: '$82.0M', headcount: 310 },
      ]
    },
    BULL_CASE: {
      name: 'Bull Case: Hyper-Scale Global Autonomy & Sovereign Dominance',
      description: 'Aggressive 68% YoY growth backed by transatlantic sovereign banking node contracts.',
      growthRatePercent: 68,
      burnRateTrajectory: 'Aggressive Reinvestment in Compute',
      breakEvenQuarter: 'Q4 2026',
      dataPoints: [
        { year: '2026', arr: '$54.0M', revenue: '$42.5M', cogs: '$8.1M', opex: '$26.0M', ebitda: '$8.4M', cashFlow: '$6.1M', headcount: 95 },
        { year: '2027', arr: '$98.0M', revenue: '$85.0M', cogs: '$14.2M', opex: '$44.0M', ebitda: '$26.8M', cashFlow: '$21.0M', headcount: 155 },
        { year: '2028', arr: '$195.0M', revenue: '$178.0M', cogs: '$27.5M', opex: '$78.0M', ebitda: '$72.5M', cashFlow: '$61.0M', headcount: 260 },
        { year: '2029', arr: '$360.0M', revenue: '$335.0M', cogs: '$48.0M', opex: '$120.0M', ebitda: '$167.0M', cashFlow: '$142.0M', headcount: 440 },
      ]
    },
    BEAR_CASE: {
      name: 'Bear Case: Macroeconomic Contraction & Extended Procurement Cycles',
      description: 'Conservative 24% YoY growth scenario with delayed German enterprise IT budgeting cycles.',
      growthRatePercent: 24,
      burnRateTrajectory: 'Strict Cost Discipline & Headcount Freeze',
      breakEvenQuarter: 'Q4 2027',
      dataPoints: [
        { year: '2026', arr: '$44.0M', revenue: '$34.0M', cogs: '$6.8M', opex: '$22.5M', ebitda: '$4.7M', cashFlow: '$2.8M', headcount: 78 },
        { year: '2027', arr: '$58.0M', revenue: '$51.0M', cogs: '$9.5M', opex: '$31.0M', ebitda: '$10.5M', cashFlow: '$7.5M', headcount: 96 },
        { year: '2028', arr: '$82.0M', revenue: '$74.0M', cogs: '$13.2M', opex: '$42.0M', ebitda: '$18.8M', cashFlow: '$14.2M', headcount: 125 },
        { year: '2029', arr: '$125.0M', revenue: '$116.0M', cogs: '$19.5M', opex: '$58.0M', ebitda: '$38.5M', cashFlow: '$30.0M', headcount: 165 },
      ]
    }
  }
};

const initialState = {
  // Executive Overview Summary
  summary: {
    arr: '$48.6M',
    mrr: '$4.05M',
    cashBalance: '$21,450,000',
    netBurnRate: '$618,000 / mo',
    runwayMonths: 34,
    grossMargin: '84.6%',
    ebitdaMargin: '26.8%',
    totalRevenueYtd: '$36,800,000',
    totalExpensesYtd: '$25,480,000',
    totalTaxesYtd: '$1,539,200',
  },
  revenues: initialRevenues,
  expenses: initialExpenses,
  taxes: initialTaxes,
  projections: initialProjections,
  filterExpenseCategory: 'ALL', // ALL | FIXED_COSTS | HUMAN_CAPITAL | EQUIPMENT_HARDWARE
  filterRevenueStatus: 'ALL',
};

export const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    // ─── REVENUES REDUCERS ───────────────────────────────────────
    addProjectRevenue: (state, action) => {
      state.revenues.unshift(action.payload);
    },
    updateRevenueStatus: (state, action) => {
      const { id, billingStatus } = action.payload;
      const rev = state.revenues.find(r => r.id === id);
      if (rev) {
        rev.billingStatus = billingStatus;
        if (billingStatus === 'BILLED') {
          rev.billedToDate = rev.contractValue;
          rev.receivablesDue = '$0';
        }
      }
    },

    // ─── EXPENSES REDUCERS ───────────────────────────────────────
    addExpense: (state, action) => {
      state.expenses.unshift(action.payload);
    },
    updateExpense: (state, action) => {
      const { id, monthlyCost, annualCost, status } = action.payload;
      const exp = state.expenses.find(e => e.id === id);
      if (exp) {
        if (monthlyCost) exp.monthlyCost = monthlyCost;
        if (annualCost) exp.annualCost = annualCost;
        if (status) exp.status = status;
      }
    },
    deleteExpense: (state, action) => {
      const { id } = action.payload;
      state.expenses = state.expenses.filter(e => e.id !== id);
    },
    setFilterExpenseCategory: (state, action) => {
      state.filterExpenseCategory = action.payload;
    },

    // ─── TAXES REDUCERS ──────────────────────────────────────────
    fileTaxReturn: (state, action) => {
      const { obligationId } = action.payload;
      const obl = state.taxes.statutoryCalendar.find(o => o.id === obligationId);
      if (obl) {
        obl.status = 'PAID_AND_FILED';
      }
    },
    applyRdTaxCreditBonus: (state, action) => {
      const { bonusAmount } = action.payload;
      state.taxes.rdTaxCreditOffset = `-$${bonusAmount}`;
    },

    // ─── PROJECTIONS REDUCERS ────────────────────────────────────
    setProjectionScenario: (state, action) => {
      state.projections.activeScenario = action.payload;
    },
    adjustScenarioGrowth: (state, action) => {
      const { scenarioKey, newGrowthRate } = action.payload;
      if (state.projections.scenarios[scenarioKey]) {
        state.projections.scenarios[scenarioKey].growthRatePercent = newGrowthRate;
      }
    }
  }
});

export const {
  addProjectRevenue,
  updateRevenueStatus,
  addExpense,
  updateExpense,
  deleteExpense,
  setFilterExpenseCategory,
  fileTaxReturn,
  applyRdTaxCreditBonus,
  setProjectionScenario,
  adjustScenarioGrowth
} = financeSlice.actions;

export default financeSlice.reducer;
