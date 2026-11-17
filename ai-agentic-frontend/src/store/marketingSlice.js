import { createSlice } from '@reduxjs/toolkit';

// ─── CAMPAIGNS ───────────────────────────────────────────────────────────────
const initialCampaigns = [
  {
    id: 'MKT-CAMP-101',
    title: 'Q4 Enterprise Nordic Expansion - Intelligent Ops',
    channel: 'LinkedIn Sponsored & InMail',
    targetSegment: 'Tier-1 Scandinavian Logistics & Manufacturing CXOs',
    objective: 'Drive BIP Operations Pilot sign-ups and Demo requests',
    contentPreview: 'Scale operational resilience without scaling human burnout. Bjorn Intelligence Platform connects fragmented enterprise ERP and logistics streams with autonomous document validation and zero-hallucination policy grounding. Schedule your 90-day pilot deployment today.',
    status: 'PENDING_APPROVAL',
    brandCompliance: {
      score: 96,
      status: 'PASSED',
      voiceCheck: 'Executive, Confident, Non-hyperbolic',
      bannedWordsDetected: 0,
      disclaimerPresent: true,
      notes: 'Tone aligns with 2026 Bjorn Brand Book (Technical Elegance).'
    },
    metrics: { predictedCTR: '4.8%', targetReach: '12,500 Decision Makers' },
    createdAt: 'Today, 11:30 AM',
  },
  {
    id: 'MKT-CAMP-102',
    title: 'Customer Churn Prevention - Automated NBO Outreach',
    channel: 'Direct Executive Email',
    targetSegment: 'Accounts with Churn Risk > 65% (Telemetry Flagged)',
    objective: 'Offer complimentary enterprise architecture audit and dedicated SLA tier',
    contentPreview: 'Subject: Enhancing your enterprise throughput with Bjorn\n\nDear Henrik,\n\nWe noticed your recent increase in cross-border shipment exceptions. As part of our commitment to zero-downtime logistics, we would like to activate your complimentary Dedicated Systems Architect session and review automated exception routing.',
    status: 'APPROVED',
    brandCompliance: {
      score: 98,
      status: 'PASSED',
      voiceCheck: 'Supportive, High-Trust, Empathetic',
      bannedWordsDetected: 0,
      disclaimerPresent: true,
      notes: 'Human reviewed and approved by Sofia Lindqvist.'
    },
    metrics: { predictedCTR: '28.4%', targetReach: '48 High-Value Accounts' },
    createdAt: 'Yesterday, 16:45 PM',
  },
  {
    id: 'MKT-CAMP-103',
    title: 'Global Supply Chain Summit Keynote Teaser',
    channel: 'X / Twitter & Newsletter',
    targetSegment: 'Supply Chain Operations & CIO Network',
    objective: 'Keynote spotlight on Value Contribution Graphs and AI-enabled operations',
    contentPreview: 'Transforming supply chain chaos into mathematical certainty. Join our Chief Architect at the Stockholm Global Summit to discover how Bjorn connects OKRs, Kafka events, and human governance into a unified intelligence mesh.',
    status: 'DRAFT',
    brandCompliance: {
      score: 88,
      status: 'WARNING',
      voiceCheck: 'Slightly overly dramatic ("chaos into mathematical certainty")',
      bannedWordsDetected: 0,
      disclaimerPresent: false,
      notes: 'Recommend softening "chaos" to "operational variance".'
    },
    metrics: { predictedCTR: '3.1%', targetReach: '35,000 Impressions' },
    createdAt: '2 days ago',
  }
];

// ─── LEADS ───────────────────────────────────────────────────────────────────
const initialLeads = [
  {
    id: 'LEAD-001', name: 'Erik Magnusson', company: 'Volvo AB',
    designation: 'Chief Operating Officer', email: 'e.magnusson@volvo.se', phone: '+46 70 123 4567',
    source: 'LinkedIn Campaign', status: 'HOT', pipeline: 'DEMO_SCHEDULED',
    score: 91, value: '$380,000', lastInteraction: '2 hours ago',
    nextFollowUp: '2026-10-25', assignedTo: 'Priya Sharma',
    notes: 'Very interested in document intake automation. Demo booked for Oct 25.',
    tags: ['Enterprise', 'Logistics', 'Demo Ready'],
    interactions: [
      { date: '2026-10-24', type: 'Email', note: 'Sent product overview deck', by: 'Priya Sharma' },
      { date: '2026-10-22', type: 'Call', note: '30-min discovery call. Strong interest in ops automation.', by: 'Priya Sharma' },
      { date: '2026-10-18', type: 'LinkedIn', note: 'Connected via Q4 Nordic campaign', by: 'AI Agent' },
    ],
    notificationDue: true,
  },
  {
    id: 'LEAD-002', name: 'Annika Johansson', company: 'IKEA Group',
    designation: 'VP Supply Chain Technology', email: 'a.johansson@ikea.com', phone: '+46 72 987 6543',
    source: 'Industry Webinar', status: 'WARM', pipeline: 'PROPOSAL_SENT',
    score: 78, value: '$520,000', lastInteraction: '1 day ago',
    nextFollowUp: '2026-10-26', assignedTo: 'Rohan Mehta',
    notes: 'Proposal v2 sent. Awaiting legal review on data residency clause.',
    tags: ['Tier-1', 'Supply Chain', 'Proposal'],
    interactions: [
      { date: '2026-10-23', type: 'Email', note: 'Sent revised Proposal v2 with data residency addendum', by: 'Rohan Mehta' },
      { date: '2026-10-20', type: 'Meeting', note: 'Presentation to 8-person vendor evaluation team', by: 'Rohan Mehta' },
    ],
    notificationDue: false,
  },
  {
    id: 'LEAD-003', name: 'Lars Petersen', company: 'Maersk Line',
    designation: 'Director of Digital Innovation', email: 'l.petersen@maersk.com', phone: '+45 33 123 7890',
    source: 'Cold Outreach ABM', status: 'COLD', pipeline: 'INITIAL_CONTACT',
    score: 44, value: '$210,000', lastInteraction: '5 days ago',
    nextFollowUp: '2026-10-28', assignedTo: 'Priya Sharma',
    notes: 'Initial contact made. No response yet. Schedule follow-up.',
    tags: ['Maritime', 'Mid-Market'],
    interactions: [
      { date: '2026-10-19', type: 'Email', note: 'Cold intro email sent with Nordic case study', by: 'AI Agent' },
    ],
    notificationDue: true,
  },
  {
    id: 'LEAD-004', name: 'Hanna Bjork', company: 'ABB Industrial',
    designation: 'CTO', email: 'h.bjork@abb.com', phone: '+46 8 765 4321',
    source: 'Partner Referral', status: 'HOT', pipeline: 'NEGOTIATION',
    score: 96, value: '$750,000', lastInteraction: 'Today',
    nextFollowUp: '2026-10-25', assignedTo: 'Rohan Mehta',
    notes: 'Contract negotiation in final stages. Legal reviewing MSA.',
    tags: ['Enterprise', 'Industrial', 'Hot Deal'],
    interactions: [
      { date: '2026-10-24', type: 'Call', note: 'Negotiation call on pricing tiers and SLA terms', by: 'Rohan Mehta' },
      { date: '2026-10-21', type: 'Email', note: 'Sent MSA draft v3', by: 'Rohan Mehta' },
    ],
    notificationDue: false,
  },
  {
    id: 'LEAD-005', name: 'Mikael Lindqvist', company: 'SKF Bearings',
    designation: 'Head of Enterprise IT', email: 'm.lindqvist@skf.com', phone: '+46 31 337 1000',
    source: 'SEO / Organic', status: 'WARM', pipeline: 'QUALIFICATION',
    score: 63, value: '$145,000', lastInteraction: '3 days ago',
    nextFollowUp: '2026-10-27', assignedTo: 'Priya Sharma',
    notes: 'Downloaded whitepaper on process mining. Needs qualification call.',
    tags: ['Manufacturing', 'SMB'],
    interactions: [
      { date: '2026-10-21', type: 'Email', note: 'Follow-up after whitepaper download.', by: 'AI Agent' },
      { date: '2026-10-19', type: 'Web', note: 'Downloaded Process Mining whitepaper via SEO landing page', by: 'AI Agent' },
    ],
    notificationDue: true,
  },
];

// ─── PROPOSALS ───────────────────────────────────────────────────────────────
const initialProposals = [
  { id: 'PROP-2026-001', leadId: 'LEAD-002', company: 'IKEA Group', contactName: 'Annika Johansson', title: 'Enterprise Operations Intelligence Suite', version: 'v2.1', value: '$520,000', validUntil: '2026-11-15', status: 'UNDER_REVIEW', sentDate: '2026-10-23', products: ['Document Intake AI', 'Exception Queue Manager', 'Process Mining Engine', 'Knowledge Assistant'], nextAction: 'Legal review on data residency clause. Follow up Nov 1.', probability: 72 },
  { id: 'PROP-2026-002', leadId: 'LEAD-004', company: 'ABB Industrial', contactName: 'Hanna Bjork', title: 'Multi-Pillar AI Transformation – Strategic Partnership', version: 'v3.0', value: '$750,000', validUntil: '2026-10-31', status: 'NEGOTIATION', sentDate: '2026-10-17', products: ['Full Operations Suite', 'Marketing Intelligence', 'Strategy Module', 'Dedicated Support Engineer'], nextAction: 'Final pricing approval from VP. Sign-off expected this week.', probability: 91 },
  { id: 'PROP-2026-003', leadId: 'LEAD-001', company: 'Volvo AB', contactName: 'Erik Magnusson', title: 'Operations Pilot – 90-Day Intelligent Document Processing', version: 'v1.0', value: '$380,000', validUntil: '2026-11-30', status: 'DRAFT', sentDate: null, products: ['Document Intake AI', 'Exception Queue Manager'], nextAction: 'Finalize after demo on Oct 25. Send within 48h post-demo.', probability: 55 },
  { id: 'PROP-2026-004', leadId: null, company: 'Sandvik AB', contactName: 'Jonas Eriksson', title: 'Process Automation Assessment & Proof of Concept', version: 'v1.0', value: '$95,000', validUntil: '2026-11-20', status: 'SENT', sentDate: '2026-10-20', products: ['Process Mining Engine', 'Knowledge Assistant'], nextAction: 'No response in 4 days. Send reminder.', probability: 38 },
];

// ─── TARGET CUSTOMER LISTS ───────────────────────────────────────────────────
const initialCustomerLists = [
  { id: 'LIST-001', name: 'Tier-1 Nordic Enterprises 2026', description: 'Top 50 enterprise accounts in Scandinavia with >1B revenue in logistics, manufacturing, and maritime.', count: 50, segment: 'Enterprise', industries: ['Logistics', 'Manufacturing', 'Maritime', 'Energy'], criteria: 'Revenue > 1B, HQ in Scandinavia, Digital maturity score > 70', lastUpdated: '2026-10-20', status: 'ACTIVE', conversionRate: '18%', aiRecommended: true },
  { id: 'LIST-002', name: 'High Churn Risk Retention Targets', description: 'Existing customers with churn probability > 50% flagged by AI telemetry analysis.', count: 23, segment: 'Retention', industries: ['All Sectors'], criteria: 'Churn risk > 50%, Contract renewal within 90 days, Support tickets > 5 in last 30 days', lastUpdated: '2026-10-24', status: 'ACTIVE', conversionRate: '64%', aiRecommended: true },
  { id: 'LIST-003', name: 'Mid-Market DACH Expansion', description: 'Mid-market opportunities in Germany, Austria, Switzerland for product expansion.', count: 120, segment: 'Mid-Market', industries: ['Automotive', 'Industrial Equipment', 'Financial Services'], criteria: 'Revenue 100M-500M, HQ in DACH region, Active ERP modernisation project', lastUpdated: '2026-10-18', status: 'BUILDING', conversionRate: '9%', aiRecommended: false },
  { id: 'LIST-004', name: 'SEO Inbound Qualified Leads Q4', description: 'Leads who downloaded 2+ assets via organic search in Q4 2026.', count: 87, segment: 'Inbound', industries: ['Mixed'], criteria: 'Downloaded 2+ whitepapers via organic, Company size >500 employees', lastUpdated: '2026-10-24', status: 'ACTIVE', conversionRate: '12%', aiRecommended: true },
];

// ─── RECOMMENDATIONS ─────────────────────────────────────────────────────────
const initialRecommendations = [
  { id: 'REC-001', type: 'ACQUISITION', priority: 'HIGH', title: 'Launch ABM Campaign for Automotive DACH Sector', description: 'AI analysis shows 340% higher response rate from automotive CXOs in DACH when outreach references ERP modernisation and supply chain resilience.', targetSegment: 'Automotive CXOs in Germany & Austria', estimatedRevenue: '$1.2M pipeline', confidence: 89, tactics: ['Personalised LinkedIn InMail Sequence', '2-page Executive Brief', 'Roundtable Invitation – Stuttgart Nov 2026'], status: 'RECOMMENDED', aiInsight: 'Based on 12 won deals in similar segments, average sales cycle is 67 days with 3-touch sequence.' },
  { id: 'REC-002', type: 'RETENTION', priority: 'CRITICAL', title: 'URGENT: Activate Save Playbook for Valmet Industrial', description: 'Customer health score dropped from 78 to 54 in 30 days. Telemetry shows reduced platform engagement. Immediate executive outreach recommended.', targetSegment: 'Valmet Industrial Systems', estimatedRevenue: 'Protect $185,000 ARR', confidence: 94, tactics: ['CEO-to-CEO outreach within 48h', 'Complimentary Architecture Audit', 'Dedicated TAM Assignment', 'SLA Upgrade Offer'], status: 'URGENT', aiInsight: 'Customers with similar patterns churn at 68% rate if no intervention within 2 weeks.' },
  { id: 'REC-003', type: 'EXPANSION', priority: 'MEDIUM', title: 'Upsell Process Mining to Konecranes', description: 'Konecranes has been exploring advanced analytics documentation. Their current contract does not include Process Mining.', targetSegment: 'Konecranes Global Freight', estimatedRevenue: '+$85,000 ARR expansion', confidence: 78, tactics: ['ROI Calculator Demo', 'Process Mining Pilot Offer (30-day)', 'Case Study: Port Authority Singapore'], status: 'RECOMMENDED', aiInsight: 'Similar logistics accounts have 73% uptake on Process Mining add-on with port use-case specificity.' },
  { id: 'REC-004', type: 'ACQUISITION', priority: 'MEDIUM', title: 'Activate SEO Inbound Leads with Nurture Sequence', description: '87 qualified inbound leads from organic search have downloaded assets but have not been contacted.', targetSegment: 'SEO Inbound Qualified Leads Q4', estimatedRevenue: '$500,000 potential pipeline', confidence: 61, tactics: ['5-Touch Email Nurture Sequence', 'Personalised ROI Calculator Link', 'Webinar Invitation'], status: 'RECOMMENDED', aiInsight: 'Inbound leads contacted within 5 days convert at 3.4x rate vs those contacted after 10 days.' },
];

// ─── BROCHURES ───────────────────────────────────────────────────────────────
const initialBrochures = [
  { id: 'BRO-001', title: 'Enterprise AI Operations Platform – Executive Overview', type: 'Product Brochure', format: 'PDF', version: 'v4.2', pages: 12, status: 'PUBLISHED', lastUpdated: '2026-10-18', syncStatus: 'SYNCED', channels: ['Website', 'Sales Portal', 'Partner Hub'], downloadCount: 1247, aiSyncEnabled: true, pendingChanges: 0 },
  { id: 'BRO-002', title: 'Process Mining & Operational Intelligence – Technical Brief', type: 'Technical Brief', format: 'PDF', version: 'v2.1', pages: 8, status: 'NEEDS_UPDATE', lastUpdated: '2026-09-05', syncStatus: 'OUT_OF_SYNC', channels: ['Website', 'Sales Portal'], downloadCount: 892, aiSyncEnabled: true, pendingChanges: 3 },
  { id: 'BRO-003', title: 'Customer Success Stories – Nordic Logistics 2026', type: 'Case Study Compilation', format: 'PDF', version: 'v1.5', pages: 24, status: 'PUBLISHED', lastUpdated: '2026-10-20', syncStatus: 'SYNCED', channels: ['Website', 'Email Campaigns', 'Events'], downloadCount: 2103, aiSyncEnabled: false, pendingChanges: 0 },
  { id: 'BRO-004', title: 'Maritime & Port Authority AI Solutions', type: 'Vertical Brochure', format: 'PDF', version: 'v1.0', pages: 6, status: 'DRAFT', lastUpdated: '2026-10-22', syncStatus: 'NOT_PUBLISHED', channels: [], downloadCount: 0, aiSyncEnabled: true, pendingChanges: 0 },
];

// ─── CATALOGS ────────────────────────────────────────────────────────────────
const initialCatalogs = [
  { id: 'CAT-001', name: 'Product Catalog 2026 – Full Suite', version: 'v7.0', products: 14, lastSync: '2026-10-24 09:15 UTC', status: 'AUTO_SYNCED', nextScheduledSync: '2026-10-25 00:00 UTC', syncSource: 'Product DB v7.0 + Pricing Engine', channels: ['Website', 'CRM', 'Partner Portal', 'Sales App'], changesSinceLastSync: 2, autoUpdateEnabled: true },
  { id: 'CAT-002', name: 'Pricing Catalog – Enterprise Tier Q4 2026', version: 'v3.4', products: 8, lastSync: '2026-10-22 18:00 UTC', status: 'PENDING_REVIEW', nextScheduledSync: 'Manual approval required', syncSource: 'Finance Pricing Engine v3.4', channels: ['Sales Portal', 'CRM'], changesSinceLastSync: 5, autoUpdateEnabled: false },
  { id: 'CAT-003', name: 'Partner / Reseller Product List', version: 'v2.1', products: 9, lastSync: '2026-10-24 08:00 UTC', status: 'AUTO_SYNCED', nextScheduledSync: '2026-10-25 08:00 UTC', syncSource: 'Partner API v2.1', channels: ['Partner Hub', 'Reseller Portal'], changesSinceLastSync: 0, autoUpdateEnabled: true },
];

// ─── STANDIES ────────────────────────────────────────────────────────────────
const initialStandies = [
  { id: 'STD-001', title: 'Operations AI – X-Banner Standee', dimensions: '60cm x 160cm', event: 'Stockholm AI & Enterprise Summit 2026', eventDate: '2026-11-12', status: 'APPROVED', version: 'v2.0', lastUpdated: '2026-10-19', printVendor: 'Scandinavian Print House', quantity: 6, notes: 'Updated with new brand colors and 2026 product lineup.', contentHighlights: ['Document Intake AI', 'Zero-Hallucination Policy', 'Human Governance Layer'] },
  { id: 'STD-002', title: 'Full AI Suite – Retractable Banner (Landscape)', dimensions: '200cm x 100cm', event: 'Gothenburg Industrial Expo 2026', eventDate: '2026-11-28', status: 'IN_REVIEW', version: 'v1.2', lastUpdated: '2026-10-22', printVendor: 'Nordic Display Solutions', quantity: 3, notes: 'Awaiting brand compliance review for updated tagline.', contentHighlights: ['Multi-Pillar AI Platform', 'Nordic Enterprise Reference', 'ROI: 63x on ABM'] },
  { id: 'STD-003', title: 'Maritime Solutions – Vertical Standee', dimensions: '85cm x 200cm', event: 'Copenhagen Maritime Forum 2026', eventDate: '2026-12-05', status: 'DRAFT', version: 'v1.0', lastUpdated: '2026-10-24', printVendor: 'TBD', quantity: 4, notes: 'New vertical for maritime sector. Needs product shots.', contentHighlights: ['Port & Cargo AI', 'Maersk Case Study', 'Exception Handling Engine'] },
];

// ─── SEO KEYWORDS ────────────────────────────────────────────────────────────
const initialSeoKeywords = [
  { id: 'SEO-001', keyword: 'enterprise AI operations platform', currentRank: 3, previousRank: 7, searchVolume: '8,400 / mo', difficulty: 'HIGH', trend: 'UP', page: '/solutions/operations', status: 'OPTIMIZED', lastUpdated: '2026-10-24', aiAction: 'Auto-updated meta description and H1 to include the keyword naturally.' },
  { id: 'SEO-002', keyword: 'document processing automation software', currentRank: 11, previousRank: 14, searchVolume: '12,100 / mo', difficulty: 'MEDIUM', trend: 'UP', page: '/products/document-intake', status: 'IMPROVING', lastUpdated: '2026-10-22', aiAction: 'Added 3 internal links from blog posts. Schema markup updated.' },
  { id: 'SEO-003', keyword: 'AI exception queue management', currentRank: 1, previousRank: 2, searchVolume: '3,200 / mo', difficulty: 'LOW', trend: 'STABLE', page: '/products/exception-management', status: 'RANKING_1', lastUpdated: '2026-10-24', aiAction: 'Featured snippet secured. Schema FAQ added last cycle.' },
  { id: 'SEO-004', keyword: 'process mining enterprise ERP', currentRank: 18, previousRank: 25, searchVolume: '5,600 / mo', difficulty: 'HIGH', trend: 'UP', page: '/solutions/process-mining', status: 'IMPROVING', lastUpdated: '2026-10-21', aiAction: 'Content refresh deployed. Blog post published.' },
  { id: 'SEO-005', keyword: 'logistics AI software Scandinavia', currentRank: 2, previousRank: 4, searchVolume: '1,800 / mo', difficulty: 'LOW', trend: 'UP', page: '/regions/nordic', status: 'OPTIMIZED', lastUpdated: '2026-10-23', aiAction: 'Geo-targeted content block added. Local schema markup deployed.' },
  { id: 'SEO-006', keyword: 'knowledge assistant enterprise automation', currentRank: 34, previousRank: 40, searchVolume: '2,900 / mo', difficulty: 'MEDIUM', trend: 'UP', page: '/products/knowledge-assistant', status: 'NEEDS_ATTENTION', lastUpdated: '2026-10-20', aiAction: 'Backlink building campaign initiated. 4 guest articles in pipeline.' },
  { id: 'SEO-007', keyword: 'B2B SaaS ROI calculator AI', currentRank: 6, previousRank: 6, searchVolume: '4,200 / mo', difficulty: 'MEDIUM', trend: 'STABLE', page: '/tools/roi-calculator', status: 'OPTIMIZED', lastUpdated: '2026-10-18', aiAction: 'Maintaining position with monthly content freshness updates.' },
];

// ─── ATTRIBUTION ─────────────────────────────────────────────────────────────
const initialAttribution = {
  totalBudget: '$120,000', blendedCAC: '$1,840', averageLTV: '$240,000', ltvToCacRatio: '130.4x',
  channels: [
    { name: 'Direct Sales Outbound (ABM)', spend: '$45,000', pipelineGenerated: '$2,850,000', roi: '63.3x', share: '42%' },
    { name: 'LinkedIn Executive Sponsored', spend: '$32,000', pipelineGenerated: '$1,620,000', roi: '50.6x', share: '28%' },
    { name: 'Industry Webinars & Roundtables', spend: '$18,000', pipelineGenerated: '$980,000', roi: '54.4x', share: '17%' },
    { name: 'Organic / Whitepapers', spend: '$12,000', pipelineGenerated: '$720,000', roi: '60.0x', share: '11%' },
    { name: 'Partner Co-Marketing', spend: '$13,000', pipelineGenerated: '$340,000', roi: '26.1x', share: '2%' },
  ],
};

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
const initialState = {
  campaigns: initialCampaigns,
  customers: [
    { id: 'CUST-001', company: 'Scania Logistics Nordic', industry: 'Heavy Transport & Fleet', tier: 'Tier-1 Enterprise', contractValue: '$420,000 / yr', healthScore: 92, leadScore: 96, churnRisk: 'LOW (8%)', nextBestOffer: 'Add-on: Process Mining Real-Time Kafka Connector', intentSignals: 'High API query volume; Viewed Enterprise Security SLA whitepaper 4 times.', lastContact: '3 days ago' },
    { id: 'CUST-002', company: 'Valmet Industrial Systems', industry: 'Industrial Equipment', tier: 'Mid-Market Enterprise', contractValue: '$185,000 / yr', healthScore: 54, leadScore: 68, churnRisk: 'HIGH (72%)', nextBestOffer: 'Retention Offer: 20% discount on Dedicated Support Engineer', intentSignals: 'Decrease in document intake frequency; Multiple unresolved exceptions.', lastContact: 'Yesterday' },
    { id: 'CUST-003', company: 'Konecranes Global Freight', industry: 'Port Crane & Cargo Handling', tier: 'Tier-1 Enterprise', contractValue: '$610,000 / yr', healthScore: 89, leadScore: 94, churnRisk: 'LOW (11%)', nextBestOffer: 'Upsell: Full Multi-Pillar Strategy & Knowledge Assistant Suite', intentSignals: 'HR leadership explored Team Value Contribution Graph documentation.', lastContact: '5 days ago' },
    { id: 'CUST-004', company: 'Fjord Maritime Cargo', industry: 'Maritime Shipping', tier: 'Growth Account', contractValue: '$95,000 / yr', healthScore: 78, leadScore: 82, churnRisk: 'MEDIUM (38%)', nextBestOffer: 'Expansion: Ingestion Gateway upgrade to 100k docs/mo', intentSignals: 'Reached 92% of monthly document quota 10 days before cycle renewal.', lastContact: '1 week ago' },
  ],
  attribution: initialAttribution,
  leads: initialLeads,
  proposals: initialProposals,
  customerLists: initialCustomerLists,
  recommendations: initialRecommendations,
  brochures: initialBrochures,
  catalogs: initialCatalogs,
  standies: initialStandies,
  seoKeywords: initialSeoKeywords,
  activeFilterSegment: 'ALL',
  notifications: [
    { id: 'NOTIF-001', type: 'FOLLOW_UP', leadId: 'LEAD-001', message: 'Follow-up due today: Erik Magnusson (Volvo AB) — Demo prep required.', priority: 'HIGH', read: false, createdAt: '2026-10-24 09:00' },
    { id: 'NOTIF-002', type: 'FOLLOW_UP', leadId: 'LEAD-003', message: 'No response from Lars Petersen (Maersk) in 5 days. Send reminder now.', priority: 'MEDIUM', read: false, createdAt: '2026-10-24 08:30' },
    { id: 'NOTIF-003', type: 'PROPOSAL_EXPIRY', leadId: 'LEAD-004', message: 'Proposal PROP-2026-002 (ABB Industrial) expires in 7 days. Confirm status.', priority: 'HIGH', read: false, createdAt: '2026-10-24 07:00' },
    { id: 'NOTIF-004', type: 'SEO_UPDATE', leadId: null, message: 'AI auto-updated 3 SEO keywords. Enterprise AI ops platform moved from #7 to #3.', priority: 'LOW', read: true, createdAt: '2026-10-24 06:00' },
    { id: 'NOTIF-005', type: 'CATALOG_SYNC', leadId: null, message: 'Product Catalog synced across 4 channels. 2 new product entries added.', priority: 'LOW', read: true, createdAt: '2026-10-24 05:15' },
  ],
  brandGuidelines: {
    tone: 'Authoritative, precise, enterprise-grade, Scandinavian minimalism',
    prohibitedKeywords: ['revolutionary', 'magic', 'cheap', 'foolproof', 'guaranteed overnight'],
    mandatoryDisclaimer: 'Enterprise AI decisions maintain human oversight for high-risk financial and contractual operations.',
  },
};

export const marketingSlice = createSlice({
  name: 'marketing',
  initialState,
  reducers: {
    approveCampaign: (state, action) => {
      const c = state.campaigns.find(c => c.id === action.payload);
      if (c) c.status = 'APPROVED';
    },
    rejectCampaign: (state, action) => {
      const c = state.campaigns.find(c => c.id === action.payload);
      if (c) c.status = 'REVISION_REQUESTED';
    },
    createCampaign: (state, action) => { state.campaigns.unshift(action.payload); },
    setFilterSegment: (state, action) => { state.activeFilterSegment = action.payload; },
    updateLeadStatus: (state, action) => {
      const { id, status, pipeline } = action.payload;
      const lead = state.leads.find(l => l.id === id);
      if (lead) { if (status) lead.status = status; if (pipeline) lead.pipeline = pipeline; lead.lastInteraction = 'Just now'; }
    },
    addLeadInteraction: (state, action) => {
      const { leadId, interaction } = action.payload;
      const lead = state.leads.find(l => l.id === leadId);
      if (lead) { lead.interactions.unshift(interaction); lead.lastInteraction = 'Just now'; lead.notificationDue = false; }
    },
    markNotificationRead: (state, action) => {
      const notif = state.notifications.find(n => n.id === action.payload);
      if (notif) notif.read = true;
    },
    markAllNotificationsRead: (state) => { state.notifications.forEach(n => { n.read = true; }); },
    addNotification: (state, action) => { state.notifications.unshift(action.payload); },
    updateProposalStatus: (state, action) => {
      const { id, status } = action.payload;
      const prop = state.proposals.find(p => p.id === id);
      if (prop) prop.status = status;
    },
    syncBrochure: (state, action) => {
      const b = state.brochures.find(b => b.id === action.payload);
      if (b) { b.syncStatus = 'SYNCED'; b.status = 'PUBLISHED'; b.lastUpdated = new Date().toISOString().split('T')[0]; b.pendingChanges = 0; }
    },
    syncCatalog: (state, action) => {
      const c = state.catalogs.find(c => c.id === action.payload);
      if (c) { c.status = 'AUTO_SYNCED'; c.lastSync = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC'; c.changesSinceLastSync = 0; }
    },
    triggerSeoUpdate: (state, action) => {
      const k = state.seoKeywords.find(k => k.id === action.payload);
      if (k) { k.lastUpdated = new Date().toISOString().split('T')[0]; k.status = 'OPTIMIZED'; }
    },
    updateListStatus: (state, action) => {
      const { id, status } = action.payload;
      const list = state.customerLists.find(l => l.id === id);
      if (list) list.status = status;
    },
    setCustomerLists: (state, action) => {
      state.customerLists = action.payload;
    },
    addCustomerList: (state, action) => {
      state.customerLists.unshift(action.payload);
    },
    removeCustomerList: (state, action) => {
      const id = typeof action.payload === 'object' ? action.payload.id : action.payload;
      state.customerLists = state.customerLists.filter(l => l.id !== id);
    },
  },
});

export const {
  approveCampaign, rejectCampaign, createCampaign, setFilterSegment,
  updateLeadStatus, addLeadInteraction,
  markNotificationRead, markAllNotificationsRead, addNotification,
  updateProposalStatus, syncBrochure, syncCatalog, triggerSeoUpdate, updateListStatus,
  setCustomerLists, addCustomerList, removeCustomerList,
} = marketingSlice.actions;

export default marketingSlice.reducer;

