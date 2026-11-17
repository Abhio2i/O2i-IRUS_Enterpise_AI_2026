import { createSlice } from '@reduxjs/toolkit';

const initialExceptions = [
  {
    id: 'EXC-8041',
    instanceId: 'WF-INST-2026-0891',
    documentId: 'DOC-8821.pdf',
    processName: 'Vendor Invoice Clearing & Settlement',
    vendor: 'Nordic Supply Chain AB',
    amount: '$48,250.00',
    currentStep: 'Field_Validation_Gateway',
    reason: 'Rule failure: Total amount exceeds autonomous threshold ($10,000) and Tax ID confidence is low (68%).',
    riskTier: 'HIGH',
    status: 'WAITING_APPROVAL',
    confidenceScore: 0.68,
    createdAt: '2026-10-23 15:42:10 UTC',
    extractedFields: [
      { name: 'Invoice Number', value: 'INV-2026-0941', confidence: 0.99, valid: true },
      { name: 'Vendor Name', value: 'Nordic Supply Chain AB', confidence: 0.97, valid: true },
      { name: 'Total Amount', value: '$48,250.00', confidence: 0.95, valid: false, flag: 'Exceeds auto-approval limit $10k' },
      { name: 'Tax ID', value: 'SE-556123-4411', confidence: 0.68, valid: false, flag: 'Low OCR/LLM confidence' },
      { name: 'Payment Terms', value: 'Net 30 Days', confidence: 0.92, valid: true },
      { name: 'Due Date', value: '2026-11-20', confidence: 0.98, valid: true },
    ],
  },
  {
    id: 'EXC-8042',
    instanceId: 'WF-INST-2026-0894',
    documentId: 'PO-FREIGHT-412.pdf',
    processName: 'Freight Logistics Bill of Lading',
    vendor: 'Baltic Oceanic Maritime',
    amount: '$14,920.00',
    currentStep: 'Duplicate_Verification_Rule',
    reason: 'Potential duplicate record: Invoice number PO-FREIGHT-412 matches historical entry from 14 days ago.',
    riskTier: 'MEDIUM',
    status: 'WAITING_APPROVAL',
    confidenceScore: 0.74,
    createdAt: '2026-10-23 16:11:05 UTC',
    extractedFields: [
      { name: 'Bill Reference', value: 'BOL-88219-X', confidence: 0.94, valid: true },
      { name: 'Carrier', value: 'Baltic Oceanic Maritime', confidence: 0.98, valid: true },
      { name: 'Total Freight Cost', value: '$14,920.00', confidence: 0.91, valid: true },
      { name: 'Port of Discharge', value: 'Gothenburg Terminal 4', confidence: 0.74, valid: false, flag: 'Discharge code mismatch' },
    ],
  },
  {
    id: 'EXC-8043',
    instanceId: 'WF-INST-2026-0902',
    documentId: 'SLA-HARDWARE-99.pdf',
    processName: 'IT Infrastructure Vendor SLA',
    vendor: 'Apex Cloud Solutions',
    amount: '$8,400.00',
    currentStep: 'Entity_Extraction_Tika',
    reason: 'Missing PO Line Item #3 cost breakdown in extracted JSON payload.',
    riskTier: 'LOW',
    status: 'WAITING_APPROVAL',
    confidenceScore: 0.81,
    createdAt: '2026-10-23 16:29:40 UTC',
    extractedFields: [
      { name: 'Agreement ID', value: 'SLA-AC-2026-10', confidence: 0.98, valid: true },
      { name: 'Service Provider', value: 'Apex Cloud Solutions', confidence: 0.99, valid: true },
      { name: 'Monthly Retainer', value: '$8,400.00', confidence: 0.95, valid: true },
      { name: 'Line Breakdown', value: 'INCOMPLETE_SPEC', confidence: 0.58, valid: false, flag: 'Needs manual clarification' },
    ],
  },
];

const initialDocuments = [
  { id: 'DOC-9101', name: 'INV-2026-0941.pdf', source: 'Email (ap@bjorn.com)', type: 'Vendor Invoice', status: 'EXCEPTION', uploadedBy: 'Auto-Ingest (Kafka)', size: '1.4 MB', time: '10 mins ago', confidence: '68%' },
  { id: 'DOC-9102', name: 'BOL-88219-X.pdf', source: 'Direct Upload', type: 'Bill of Lading', status: 'EXCEPTION', uploadedBy: 'lars.n@bjorn.com', size: '2.8 MB', time: '35 mins ago', confidence: '74%' },
  { id: 'DOC-9103', name: 'INVOICE-ZEISS-2026.pdf', source: 'REST API (/v1/documents)', type: 'Equipment Invoice', status: 'PROCESSED', uploadedBy: 'Integration Service', size: '840 KB', time: '1 hr ago', confidence: '99%' },
  { id: 'DOC-9104', name: 'MAINTENANCE-AGR-4.pdf', source: 'Email (contracts@bjorn.com)', type: 'Service Contract', status: 'PROCESSED', uploadedBy: 'Auto-Ingest (Kafka)', size: '3.1 MB', time: '2 hrs ago', confidence: '96%' },
  { id: 'DOC-9105', name: 'CUSTOMS-DECL-551.pdf', source: 'FTP Bridge', type: 'Customs Clearance', status: 'PROCESSED', uploadedBy: 'System Batch', size: '512 KB', time: '3 hrs ago', confidence: '98%' },
];

const initialKnowledgeHistory = [
  {
    id: 'KQ-1',
    question: 'What is the maximum expense limit allowed for autonomous auto-approval without a Director sign-off?',
    answer: 'Under the Bjorn Global Procurement Governance SOP (Rev 2026.2), invoices and purchase commitments up to $10,000 USD can be autonomously processed if all extraction confidence scores exceed 90% and 3-way line item match succeeds. Any single item or aggregated batch exceeding $10,000 USD must be held in the human Exception Queue for Level-2 Controller approval.',
    citations: [
      { doc: 'Bjorn_Global_Procurement_Policy_2026.pdf', section: 'Section 4.2 - Autonomous Approval Thresholds', page: 'p. 14' },
      { doc: 'Internal_Controls_Matrix_v3.pdf', section: 'Schedule B: Financial Signing Limits', page: 'p. 7' }
    ],
    timestamp: '14:20 UTC'
  },
  {
    id: 'KQ-2',
    question: 'What are the required compliance documents for hazardous materials shipping through Gothenburg?',
    answer: 'In accordance with Nordic Maritime Freight Guidelines (Section 8.1), hazardous materials cargo requires: 1) International Maritime Dangerous Goods (IMDG) Declaration, 2) Safety Data Sheet (SDS) updated within 12 months, and 3) Gothenburg Port Authority Pre-Clearance Permit signed by the appointed safety officer.',
    citations: [
      { doc: 'Nordic_Maritime_Logistics_SOP.pdf', section: 'Section 8.1 - Hazardous Goods Mandates', page: 'p. 31' }
    ],
    timestamp: '15:05 UTC'
  }
];

// ─── OPERATIONS: PROJECTS ─────────────────────────────────────────
const initialProjects = [
  {
    id: 'PRJ-301',
    code: 'AUTO-DOC-V2',
    name: 'Hyper-Automation Document Pipeline v2',
    description: 'Autonomous extraction, multi-lingual OCR, and LLM verification for 50,000+ monthly vendor invoices and freight bills.',
    dept: 'Enterprise Operations',
    owner: 'Henrik Lindqvist',
    pmEmail: 'henrik.l@bjorn.com',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    health: 'ON_TRACK', // ON_TRACK | AT_RISK | DELAYED | COMPLETED
    budget: '$280,000',
    spent: '$195,000',
    progress: 72,
    startDate: '2026-08-01',
    targetDate: '2026-11-30',
    tags: ['AI Vision', 'Kafka', 'Tika OCR', 'Spring Boot'],
    milestones: [
      { id: 'M1', name: 'Multi-lingual LayoutLM Integration', dueDate: '2026-08-30', completed: true },
      { id: 'M2', name: 'Exception Queue WebSocket Subscriptions', dueDate: '2026-09-25', completed: true },
      { id: 'M3', name: 'Load Testing: 200 docs/sec Burst', dueDate: '2026-10-31', completed: false },
      { id: 'M4', name: 'Production Cutover & Legacy Sunsetting', dueDate: '2026-11-30', completed: false },
    ],
    kpis: { throughputTarget: '200 docs/sec', autonomousTarget: '95%', slaBreachLimit: '<0.2%' }
  },
  {
    id: 'PRJ-302',
    code: 'SAP-SETTLE-GW',
    name: 'SAP S/4HANA Finance Settlement Gateway',
    description: 'Zero-touch bi-directional reconciliation bridge between Bjorn autonomous invoice engine and core SAP S/4HANA ledger.',
    dept: 'Core FinOps',
    owner: 'Astrid Bergman',
    pmEmail: 'astrid.b@bjorn.com',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    health: 'ON_TRACK',
    budget: '$450,000',
    spent: '$380,000',
    progress: 84,
    startDate: '2026-06-15',
    targetDate: '2026-12-15',
    tags: ['SAP S/4HANA', 'mTLS', 'Audit Trail', 'Settlement'],
    milestones: [
      { id: 'M1', name: 'BAPI/OData Connector Certification', dueDate: '2026-07-20', completed: true },
      { id: 'M2', name: 'Automated 3-Way Reconciliation Service', dueDate: '2026-09-10', completed: true },
      { id: 'M3', name: 'Dual Authorization Controller Gateway', dueDate: '2026-10-25', completed: true },
      { id: 'M4', name: 'Final SOX Audit Sign-Off', dueDate: '2026-12-15', completed: false },
    ],
    kpis: { throughputTarget: '1,500 vouchers/hr', autonomousTarget: '98%', slaBreachLimit: '<0.05%' }
  },
  {
    id: 'PRJ-303',
    code: 'KAFKA-MESH',
    name: 'Kafka Multi-Cluster Event Ingestion Mesh',
    description: 'Resilient event-driven backbone linking regional ingestion nodes across Stockholm, Frankfurt, and Dublin data centers.',
    dept: 'Cloud & Infrastructure',
    owner: 'Erik Solheim',
    pmEmail: 'erik.s@bjorn.com',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    health: 'AT_RISK',
    budget: '$175,000',
    spent: '$155,000',
    progress: 58,
    startDate: '2026-09-01',
    targetDate: '2026-11-15',
    tags: ['Strimzi', 'Kafka MirrorMaker', 'TLS 1.3', 'Kubernetes'],
    milestones: [
      { id: 'M1', name: 'Stockholm Primary Cluster Provisioning', dueDate: '2026-09-18', completed: true },
      { id: 'M2', name: 'Cross-Region Partition Rebalance Topology', dueDate: '2026-10-15', completed: false },
      { id: 'M3', name: 'End-to-End Latency Verification (<15ms)', dueDate: '2026-11-01', completed: false },
      { id: 'M4', name: 'Disaster Recovery Failover Drill', dueDate: '2026-11-15', completed: false },
    ],
    kpis: { throughputTarget: '50k events/sec', autonomousTarget: '99.99%', slaBreachLimit: '<0.01%' }
  },
  {
    id: 'PRJ-304',
    code: 'AI-FRAUD-GUARD',
    name: 'Autonomous Fraud & Anomaly Guard',
    description: 'Real-time embedding vector matching and graph analysis to detect supplier identity forgery and duplicate invoice schemes.',
    dept: 'AI Security Ops',
    owner: 'Sofia Vestergaard',
    pmEmail: 'sofia.v@bjorn.com',
    priority: 'MEDIUM',
    status: 'PLANNING',
    health: 'ON_TRACK',
    budget: '$120,000',
    spent: '$25,000',
    progress: 20,
    startDate: '2026-10-15',
    targetDate: '2027-02-28',
    tags: ['Graph Neural Nets', 'Vector DB', 'Presidio', 'Security'],
    milestones: [
      { id: 'M1', name: 'Historical Fraud Dataset Ingestion & Masking', dueDate: '2026-11-15', completed: false },
      { id: 'M2', name: 'Graph Analysis Proof-of-Concept', dueDate: '2026-12-20', completed: false },
      { id: 'M3', name: 'Real-Time Scorer Interceptor Integration', dueDate: '2027-01-30', completed: false },
      { id: 'M4', name: 'Production Rollout to EU Region', dueDate: '2027-02-28', completed: false },
    ],
    kpis: { throughputTarget: 'Sub-50ms inference', autonomousTarget: '92% recall', slaBreachLimit: '<0.05%' }
  },
  {
    id: 'PRJ-305',
    code: 'LOG-OCR-BRIDGE',
    name: 'Gothenburg Terminal Logistics OCR Bridge',
    description: 'High-speed camera and scanner bridge at maritime gates for automatic Bill of Lading, container ID, and customs clearing.',
    dept: 'Supply Chain Operations',
    owner: 'Lars Nygren',
    pmEmail: 'lars.n@bjorn.com',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    health: 'ON_TRACK',
    budget: '$210,000',
    spent: '$190,000',
    progress: 90,
    startDate: '2026-05-10',
    targetDate: '2026-10-31',
    tags: ['Edge AI', 'Gothenburg Port', 'Customs', 'Hardware'],
    milestones: [
      { id: 'M1', name: 'Gate 4 Hardware Sensor Installation', dueDate: '2026-06-30', completed: true },
      { id: 'M2', name: 'IMDG Hazardous Cargo Model Training', dueDate: '2026-08-15', completed: true },
      { id: 'M3', name: 'Swedish Customs EDI Direct Line Testing', dueDate: '2026-09-30', completed: true },
      { id: 'M4', name: 'Live Harbor Operational Handover', dueDate: '2026-10-31', completed: false },
    ],
    kpis: { throughputTarget: '1 container/4s', autonomousTarget: '97%', slaBreachLimit: '<0.5%' }
  },
  {
    id: 'PRJ-306',
    code: 'NORDIC-TAX-REG',
    name: 'Nordic Cross-Border Tax Compliance Engine',
    description: 'Dynamic automated VAT & reverse charge calculations covering Sweden, Denmark, Norway, and Finland tax authorities.',
    dept: 'Regulatory Tech',
    owner: 'Mette Hansen',
    pmEmail: 'mette.h@bjorn.com',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    health: 'DELAYED',
    budget: '$320,000',
    spent: '$290,000',
    progress: 48,
    startDate: '2026-07-01',
    targetDate: '2026-11-10',
    tags: ['VIES Registry', 'Skatteverket', 'VAT Engine', 'Compliance'],
    milestones: [
      { id: 'M1', name: 'Nordic Tax Jurisdiction Rulebook Definition', dueDate: '2026-07-31', completed: true },
      { id: 'M2', name: 'Real-time VIES API Validation Cache', dueDate: '2026-08-30', completed: false },
      { id: 'M3', name: 'Danish Skat & Swedish Skatteverket Cert', dueDate: '2026-10-15', completed: false },
      { id: 'M4', name: 'Automated Monthly Tax Filing Export', dueDate: '2026-11-10', completed: false },
    ],
    kpis: { throughputTarget: '100% Tax Accuracy', autonomousTarget: '90%', slaBreachLimit: '0.0%' }
  }
];

// ─── OPERATIONS: STATUS & RISK REGISTER ──────────────────────────
const initialOperationalRisks = [
  {
    id: 'RSK-101',
    projectId: 'PRJ-303',
    projectTitle: 'Kafka Multi-Cluster Event Ingestion Mesh',
    title: 'Partitions unbalanced across Region EU-North',
    severity: 'HIGH',
    category: 'Infrastructure',
    owner: 'Erik Solheim',
    impact: 'Potential latency spikes during peak batch hours (14:00 - 17:00 UTC).',
    mitigation: 'Deploying Strimzi Cruise Control automatic partition rebalancer with 250MB/s threshold.',
    status: 'MITIGATING', // ACTIVE | MITIGATING | RESOLVED
    rag: 'AMBER',
    reportedDate: '2026-10-22'
  },
  {
    id: 'RSK-102',
    projectId: 'PRJ-306',
    projectTitle: 'Nordic Cross-Border Tax Compliance Engine',
    title: 'VIES Public API Rate-limit throttling on batch validation',
    severity: 'CRITICAL',
    category: 'External Dependency',
    owner: 'Mette Hansen',
    impact: 'Clearing delays for 300+ Swedish & Danish freight invoices during morning intake bursts.',
    mitigation: 'Implemented Redis multi-tier caching layer (TTL 24h) and async queue batching.',
    status: 'ACTIVE',
    rag: 'RED',
    reportedDate: '2026-10-20'
  },
  {
    id: 'RSK-103',
    projectId: 'PRJ-301',
    projectTitle: 'Hyper-Automation Document Pipeline v2',
    title: 'OCR OCR-B font recognition variance on legacy scans',
    severity: 'LOW',
    category: 'Algorithm',
    owner: 'Sofia Vestergaard',
    impact: '1.8% increased exception queue routing for dot-matrix invoices.',
    mitigation: 'Trained ViT patch transformer on synthetic dot-matrix dataset; deployed to canary.',
    status: 'RESOLVED',
    rag: 'GREEN',
    reportedDate: '2026-10-18'
  },
  {
    id: 'RSK-104',
    projectId: 'PRJ-302',
    projectTitle: 'SAP S/4HANA Finance Settlement Gateway',
    title: 'SOX dual sign-off key rotation latency',
    severity: 'MEDIUM',
    category: 'Governance & Security',
    owner: 'Astrid Bergman',
    impact: 'Batch approval signing took >3.2 seconds under heavy test load.',
    mitigation: 'Switched to asynchronous HSM signature caching with session-bound ephemeral keys.',
    status: 'RESOLVED',
    rag: 'GREEN',
    reportedDate: '2026-10-15'
  }
];

// ─── OPERATIONS: PLANNER & TEAM MANAGEMENT ───────────────────────
const initialTeamMembers = [
  {
    id: 'TM-01',
    name: 'Henrik Lindqvist',
    role: 'Staff Solutions Architect',
    dept: 'Enterprise Operations',
    avatar: 'HL',
    color: '#6366f1',
    capacityHours: 40,
    allocatedHours: 36,
    utilization: 90,
    status: 'OPTIMAL',
    skills: ['System Architecture', 'Kafka', 'Spring Boot', 'Exception Governance'],
    activeTasksCount: 3,
  },
  {
    id: 'TM-02',
    name: 'Astrid Bergman',
    role: 'Lead DevOps & Cloud Engineer',
    dept: 'Core FinOps',
    avatar: 'AB',
    color: '#ec4899',
    capacityHours: 40,
    allocatedHours: 42,
    utilization: 105,
    status: 'OVERLOADED',
    skills: ['Kubernetes', 'Terraform', 'CI/CD Pipelines', 'Hardware HSM'],
    activeTasksCount: 4,
  },
  {
    id: 'TM-03',
    name: 'Erik Solheim',
    role: 'Senior Data Platform Engineer',
    dept: 'Cloud & Infrastructure',
    avatar: 'ES',
    color: '#06b6d4',
    capacityHours: 40,
    allocatedHours: 32,
    utilization: 80,
    status: 'OPTIMAL',
    skills: ['Kafka Mesh', 'Apache Flink', 'PostgreSQL', 'Redis Clusters'],
    activeTasksCount: 2,
  },
  {
    id: 'TM-04',
    name: 'Sofia Vestergaard',
    role: 'Lead AI & Vision Scientist',
    dept: 'AI Security Ops',
    avatar: 'SV',
    color: '#8b5cf6',
    capacityHours: 40,
    allocatedHours: 28,
    utilization: 70,
    status: 'AVAILABLE',
    skills: ['Large Multimodal Models', 'Doc Vision Transformers', 'Python', 'MLOps'],
    activeTasksCount: 2,
  },
  {
    id: 'TM-05',
    name: 'Lars Nygren',
    role: 'Principal Integration Specialist',
    dept: 'Supply Chain Operations',
    avatar: 'LN',
    color: '#10b981',
    capacityHours: 40,
    allocatedHours: 38,
    utilization: 95,
    status: 'OPTIMAL',
    skills: ['SAP S/4HANA', 'EDIFACT / ANSI X12', 'REST APIs', 'Settlement'],
    activeTasksCount: 3,
  },
  {
    id: 'TM-06',
    name: 'Mette Hansen',
    role: 'Senior Compliance & Security Lead',
    dept: 'Regulatory Tech',
    avatar: 'MH',
    color: '#f59e0b',
    capacityHours: 40,
    allocatedHours: 35,
    utilization: 87.5,
    status: 'OPTIMAL',
    skills: ['GDPR Art 32', 'SOC 2 Type II', 'Data Redaction', 'Audit Logging'],
    activeTasksCount: 3,
  }
];

const initialPlannerTasks = [
  {
    id: 'TSK-2401',
    title: 'Implement Redis VIES cache fallback for Swedish invoices',
    assigneeId: 'TM-03',
    assigneeName: 'Erik Solheim',
    projectId: 'PRJ-306',
    priority: 'CRITICAL',
    estimateHours: 12,
    status: 'IN_PROGRESS', // BACKLOG | TODO | IN_PROGRESS | REVIEW | DONE
    sprint: 'Sprint 24',
    dueDate: '2026-10-28',
  },
  {
    id: 'TSK-2402',
    title: 'Refactor OCR Layout Parser with ViT Model v2.1',
    assigneeId: 'TM-04',
    assigneeName: 'Sofia Vestergaard',
    projectId: 'PRJ-301',
    priority: 'HIGH',
    estimateHours: 16,
    status: 'IN_PROGRESS',
    sprint: 'Sprint 24',
    dueDate: '2026-10-29',
  },
  {
    id: 'TSK-2403',
    title: 'Automate Strimzi Kafka cluster partition rebalancing',
    assigneeId: 'TM-02',
    assigneeName: 'Astrid Bergman',
    projectId: 'PRJ-303',
    priority: 'HIGH',
    estimateHours: 14,
    status: 'REVIEW',
    sprint: 'Sprint 24',
    dueDate: '2026-10-30',
  },
  {
    id: 'TSK-2404',
    title: 'SAP S/4HANA Settlement webhook handshake certification',
    assigneeId: 'TM-05',
    assigneeName: 'Lars Nygren',
    projectId: 'PRJ-302',
    priority: 'MEDIUM',
    estimateHours: 10,
    status: 'DONE',
    sprint: 'Sprint 24',
    dueDate: '2026-10-24',
  },
  {
    id: 'TSK-2405',
    title: 'Complete SOC2 Type II cryptographic key rotation runbook',
    assigneeId: 'TM-06',
    assigneeName: 'Mette Hansen',
    projectId: 'PRJ-304',
    priority: 'HIGH',
    estimateHours: 8,
    status: 'DONE',
    sprint: 'Sprint 24',
    dueDate: '2026-10-23',
  },
  {
    id: 'TSK-2406',
    title: 'Enterprise Event Bus latency profiling & stress bench',
    assigneeId: 'TM-01',
    assigneeName: 'Henrik Lindqvist',
    projectId: 'PRJ-303',
    priority: 'MEDIUM',
    estimateHours: 10,
    status: 'TODO',
    sprint: 'Sprint 24',
    dueDate: '2026-11-01',
  },
  {
    id: 'TSK-2407',
    title: 'Multi-region disaster recovery failover drill documentation',
    assigneeId: 'TM-02',
    assigneeName: 'Astrid Bergman',
    projectId: 'PRJ-301',
    priority: 'LOW',
    estimateHours: 6,
    status: 'BACKLOG',
    sprint: 'Sprint 24',
    dueDate: '2026-11-05',
  },
];

// ─── OPERATIONS: DOCUMENTATION & DATA SECURITY ────────────────────
const initialDocumentation = [
  {
    id: 'DOC-SOP-01',
    title: 'Autonomous Invoice Ingestion & OCR Failure SOP',
    category: 'Operational Runbooks',
    version: 'v3.2',
    author: 'Henrik Lindqvist',
    lastAudit: '2026-10-14',
    classification: 'INTERNAL', // PUBLIC | INTERNAL | CONFIDENTIAL | RESTRICTED
    status: 'VERIFIED',
    size: '2.4 MB',
    pages: 18,
    tags: ['OCR', 'Exceptions', 'Procurement', 'SOP'],
    summary: 'Standard operating procedure for routing low-confidence extractions, human field corrections, and feedback loop ingestion into model retraining pipelines.'
  },
  {
    id: 'DOC-SOP-02',
    title: 'SAP S/4HANA Integration Architecture & Failure Modes',
    category: 'Architecture & ADRs',
    version: 'v2.0',
    author: 'Lars Nygren',
    lastAudit: '2026-09-28',
    classification: 'CONFIDENTIAL',
    status: 'VERIFIED',
    size: '4.8 MB',
    pages: 34,
    tags: ['SAP', 'ERP', 'Architecture', 'ADR'],
    summary: 'Comprehensive ADR detailing synchronous OData voucher clearing, transactional idempotency guarantees, and retry jitter schedules during SAP maintenance windows.'
  },
  {
    id: 'DOC-SOP-03',
    title: 'Enterprise Data Classification & Field Redaction Standard',
    category: 'Data Security & Policy',
    version: 'v4.1',
    author: 'Mette Hansen',
    lastAudit: '2026-10-20',
    classification: 'RESTRICTED',
    status: 'VERIFIED',
    size: '1.9 MB',
    pages: 12,
    tags: ['GDPR', 'Redaction', 'Security', 'Classification'],
    summary: 'Prescribes mandatory masking rules for PII, IBAN, and payment card data across all raw document ingestion staging buckets before LLM embedding.'
  },
  {
    id: 'DOC-SOP-04',
    title: 'Multi-Cluster Kafka Disaster Recovery & Backup Runbook',
    category: 'Operational Runbooks',
    version: 'v1.8',
    author: 'Erik Solheim',
    lastAudit: '2026-10-05',
    classification: 'INTERNAL',
    status: 'REVIEW_DUE',
    size: '3.1 MB',
    pages: 22,
    tags: ['Kafka', 'DR', 'Infrastructure', 'Failover'],
    summary: 'Step-by-step operational runbook for executing region failover between Stockholm and Frankfurt clusters with zero message loss and under 45-second RTO.'
  },
  {
    id: 'DOC-SOP-05',
    title: 'Zero-Trust mTLS & HSM Encryption Key Rotation SOP',
    category: 'Data Security & Policy',
    version: 'v2.5',
    author: 'Astrid Bergman',
    lastAudit: '2026-10-22',
    classification: 'RESTRICTED',
    status: 'VERIFIED',
    size: '1.5 MB',
    pages: 16,
    tags: ['mTLS', 'HSM', 'Key Rotation', 'Zero Trust'],
    summary: 'Protocol for 90-day automated rolling rotation of inter-service SPIFFE/SPIRE certificates and master envelope encryption keys hosted in Cloud KMS.'
  }
];

const initialSecurityState = {
  securityScore: 98,
  encryptionAtRest: {
    status: 'ENFORCED',
    algorithm: 'AES-256-GCM',
    keyManagement: 'Hardware HSM (FIPS 140-3 Level 3)',
    lastRotation: '2026-10-01',
    compliance: 'Compliant'
  },
  encryptionInTransit: {
    status: 'ENFORCED',
    protocol: 'TLS 1.3 / mTLS Inter-Service',
    cipherSuites: 'ECDHE-RSA-AES256-GCM-SHA384',
    certExpiryDays: 82,
    compliance: 'Compliant'
  },
  dataRedaction: {
    status: 'ACTIVE',
    engine: 'Presidio Entity Masker + Custom NER',
    maskedFieldCount: 42910,
    falsePositiveRate: '<0.01%',
    compliance: 'Compliant'
  },
  complianceStandards: [
    { id: 'SOC2', name: 'SOC 2 Type II', authority: 'AICPA', status: 'COMPLIANT', auditDate: '2026-08-15', score: '100%', controlsPassed: 64, totalControls: 64 },
    { id: 'GDPR', name: 'GDPR Article 32 & 35', authority: 'EU Data Protection Board', status: 'COMPLIANT', auditDate: '2026-09-10', score: '98.5%', controlsPassed: 42, totalControls: 43 },
    { id: 'ISO27001', name: 'ISO/IEC 27001:2022', authority: 'BSI Certification', status: 'COMPLIANT', auditDate: '2026-07-20', score: '100%', controlsPassed: 93, totalControls: 93 },
    { id: 'HIPAA', name: 'HIPAA Security Rule', authority: 'HHS OCR Guidelines', status: 'COMPLIANT', auditDate: '2026-06-30', score: '97.8%', controlsPassed: 38, totalControls: 39 },
  ],
  dlpAlerts: [
    { id: 'DLP-401', timestamp: '2026-10-25 14:12 UTC', severity: 'MEDIUM', rule: 'Credit Card Pattern Redaction', source: 'Document Intake (DOC-9102)', details: 'Masked 16-digit PAN in freight annexure before vector persistence.', status: 'RESOLVED', actionTaken: 'Auto-Masked & Flagged' },
    { id: 'DLP-402', timestamp: '2026-10-24 18:30 UTC', severity: 'LOW', rule: 'Unusual IP Access to Restricted Runbook', source: 'User Session (192.168.4.12)', details: 'User authenticated via SSO MFA; GeoIP matched Stockholm VPN.', status: 'VERIFIED', actionTaken: 'Audit Logged' },
    { id: 'DLP-403', timestamp: '2026-10-23 09:15 UTC', severity: 'HIGH', rule: 'Bulk Document Export Request Threshold', source: 'Batch Export Service', details: 'Triggered step-up dual authorization requirement for 500+ records.', status: 'RESOLVED', actionTaken: 'Dual Sign-off Approved' }
  ]
};

// ─── OPERATIONS: WORKFLOW IMPROVEMENTS (KAIZEN & AGENTIC OPTIMIZATION) ──
const initialWorkflowImprovements = [
  {
    id: 'WFI-AP-01',
    title: 'Three-Way Invoice Reconciliation Cognitive Loop',
    domain: 'Accounts Payable & Invoicing',
    stage: 'DEPLOYED_LIVE', // IDENTIFIED | IN_OPTIMIZATION | BENCHMARKING | DEPLOYED_LIVE
    baselineTime: '42.5 min',
    optimizedTime: '1.8 min',
    speedup: '95.8%',
    hoursSavedMo: 480,
    annualSavings: '$68,500',
    stpRate: '96.2%',
    lead: 'Elin Torsson (COO)',
    steps: [
      { name: 'Multi-Format PDF Intake', type: 'OCR/Vision Transformer', latency: '240ms', auto: true },
      { name: 'PO Matching & Tolerance Check', type: 'Vector Embedding Search', latency: '110ms', auto: true },
      { name: 'VIES Tax Registry Lookup', type: 'REST API Gateway', latency: '45ms', auto: true },
      { name: 'Autonomous SAP ERP Voucher Booking', type: 'Kafka Direct Post', latency: '95ms', auto: true },
    ],
    impactSummary: 'Eliminated manual line-item comparison against SAP purchase orders for 96% of recurring vendor bills.'
  },
  {
    id: 'WFI-LOG-02',
    title: 'Pan-European Freight Customs & Bill of Lading Clearance',
    domain: 'Freight Customs & Logistics',
    stage: 'IN_OPTIMIZATION',
    baselineTime: '64.0 min',
    optimizedTime: '3.2 min',
    speedup: '95.0%',
    hoursSavedMo: 520,
    annualSavings: '$82,000',
    stpRate: '91.4%',
    lead: 'Henrik Lindqvist (Head of Logistics AI)',
    steps: [
      { name: 'Multimodal Bill of Lading Parsing', type: 'LayoutLMv3', latency: '320ms', auto: true },
      { name: 'TARIC HS Harmonized Code Resolution', type: 'Fine-tuned Domain LLM', latency: '190ms', auto: true },
      { name: 'Port Authority Customs Declaration Filing', type: 'Sovereign EDI Bridge', latency: '85ms', auto: false },
      { name: 'Demurrage Risk Prediction Interceptor', type: 'LightGBM Classifier', latency: '15ms', auto: true },
    ],
    impactSummary: 'Reduces Swedish and German customs dwell times from 4.5 hours to sub-10 minutes.'
  },
  {
    id: 'WFI-PROC-03',
    title: 'Autonomous Vendor Dispute & Exception Self-Healing Loop',
    domain: 'Procurement & PO',
    stage: 'BENCHMARKING',
    baselineTime: '38.0 min',
    optimizedTime: '4.5 min',
    speedup: '88.2%',
    hoursSavedMo: 340,
    annualSavings: '$44,000',
    stpRate: '87.5%',
    lead: 'Sofia Vestergaard (Operations Eng)',
    steps: [
      { name: 'Discrepancy Root-Cause Classification', type: 'LLM Agentic Classifier', latency: '140ms', auto: true },
      { name: 'Automated Vendor Clarification Dispatch', type: 'Autonomous Email Agent', latency: '350ms', auto: true },
      { name: 'Credit Note Extraction & Offset', type: 'Document AI', latency: '210ms', auto: true },
    ],
    impactSummary: 'Self-heals price variance exceptions by automatically requesting updated credit memos from suppliers.'
  },
  {
    id: 'WFI-FIN-04',
    title: 'Real-Time Multi-Entity FX Settlement Hedging Interceptor',
    domain: 'Customer Settlement',
    stage: 'DEPLOYED_LIVE',
    baselineTime: '28.0 min',
    optimizedTime: '0.8 min',
    speedup: '97.1%',
    hoursSavedMo: 290,
    annualSavings: '$56,000',
    stpRate: '98.8%',
    lead: 'Lars Nygren (VP Enterprise Systems)',
    steps: [
      { name: 'Cross-Border Invoicing FX Ingestion', type: 'Live ECB Feed', latency: '20ms', auto: true },
      { name: 'Bilateral Spot Rate Netting Calculation', type: 'Quant Settlement Core', latency: '12ms', auto: true },
      { name: 'Treasury Cash Pool Rebalance Trigger', type: 'SWIFT ISO 20022 Hook', latency: '60ms', auto: true },
    ],
    impactSummary: 'Removes manual treasury rebalancing spreadsheets across SEK, EUR, NOK, and GBP operations.'
  },
  {
    id: 'WFI-OPS-05',
    title: 'Automated ESG Carbon Routing & Logistics Emission Ledger',
    domain: 'Freight Customs & Logistics',
    stage: 'IDENTIFIED',
    baselineTime: '50.0 min',
    optimizedTime: '2.0 min',
    speedup: '96.0%',
    hoursSavedMo: 210,
    annualSavings: '$28,000',
    stpRate: '92.0%',
    lead: 'Karin Hedlund (CSO)',
    steps: [
      { name: 'Freight Waybill Distance Extraction', type: 'GIS Route Engine', latency: '180ms', auto: true },
      { name: 'EcoTransIT Standard Carbon Calculation', type: 'Emission Factor Matrix', latency: '40ms', auto: true },
      { name: 'Green Audit Certificate Generation', type: 'Cryptographic PDF Stamper', latency: '90ms', auto: true },
    ],
    impactSummary: 'Eliminates quarterly manual ESG auditing by producing instant verified carbon certificates per shipment.'
  }
];

const initialWorkflowRecommendations = [
  {
    id: 'REC-01',
    title: 'Parallelize Customs Sanction Screening with Invoice OCR',
    domain: 'Freight Customs & Logistics',
    estimatedHoursSaved: 160,
    cycleTimeCut: '-4.2 min / doc',
    confidence: '98%',
    description: 'Currently running sequentially in pipeline. Executing in parallel worker threads drops total execution latency from 7.1s to 2.8s.',
    applied: false
  },
  {
    id: 'REC-02',
    title: 'Auto-Clear Recurring Micro-Discrepancies (<$50 EUR)',
    domain: 'Accounts Payable & Invoicing',
    estimatedHoursSaved: 220,
    cycleTimeCut: '-14 min / voucher',
    confidence: '95%',
    description: 'Historical audit shows 0.02% fraud on sub-50 EUR rounding variance. Setting dynamic threshold clears 310 monthly tickets.',
    applied: false
  },
  {
    id: 'REC-03',
    title: 'Dynamic SLA Timeout on Benelux Port EDI Gateway',
    domain: 'Freight Customs & Logistics',
    estimatedHoursSaved: 95,
    cycleTimeCut: '-8.5 min / filing',
    confidence: '92%',
    description: 'Rotterdam gateway occasionally hangs for 120s on peak hours. Implementing a 15s circuit-breaker with secondary fallback.',
    applied: false
  }
];

const initialState = {
  exceptions: initialExceptions,
  resolvedCount: 142,
  autoApprovedCount: 1289,
  documents: initialDocuments,
  knowledgeHistory: initialKnowledgeHistory,
  searchKnowledgeQuery: '',
  processMetrics: {
    avgCycleTimeMinutes: '4.8m',
    cycleTimeBaseline: '48.0m',
    reductionRate: '90.0%',
    autonomousPassRate: '91.4%',
    humanReworkRate: '3.2%',
    totalVolumeToday: 1431,
    bottlenecks: [
      { step: 'Vendor Tax ID Verification', avgDuration: '18.4m', reworkFrequency: '14.2%', severity: 'HIGH', suggestion: 'Enable European VIES automatic registry lookup cache.' },
      { step: 'Multi-Currency Line Settlement', avgDuration: '9.1m', reworkFrequency: '7.8%', severity: 'MEDIUM', suggestion: 'Sync ECB spot exchange rates hourly instead of daily.' },
      { step: 'Customs Duty Harmonized Code Match', avgDuration: '6.5m', reworkFrequency: '4.1%', severity: 'LOW', suggestion: 'Fine-tune vector chunk embeddings on 2026 HS Tariffs.' }
    ]
  },
  forecastData: {
    currentLoad: '78%',
    predictedTomorrow: '114% (Peak Spike)',
    suggestedAction: 'Scale Spring Batch worker threads from 4 to 8 during 08:00 - 12:00 CET.',
    statusAlert: 'Capacity Warning: End-of-Month vendor invoice surge expected on Oct 25-27.'
  },
  // New Operations Modules
  projects: initialProjects,
  operationalRisks: initialOperationalRisks,
  teamMembers: initialTeamMembers,
  plannerTasks: initialPlannerTasks,
  documentation: initialDocumentation,
  securityState: initialSecurityState,
  workflowImprovements: initialWorkflowImprovements,
  workflowRecommendations: initialWorkflowRecommendations,
};

export const operationsSlice = createSlice({
  name: 'operations',
  initialState,
  reducers: {
    resolveException: (state, action) => {
      const { id, resolution } = action.payload; // resolution: 'APPROVED' | 'CORRECTED' | 'REJECTED'
      const index = state.exceptions.findIndex(e => e.id === id);
      if (index !== -1) {
        state.exceptions.splice(index, 1);
        state.resolvedCount += 1;
      }
    },
    updateExtractedField: (state, action) => {
      const { exceptionId, fieldIndex, newValue } = action.payload;
      const exception = state.exceptions.find(e => e.id === exceptionId);
      if (exception && exception.extractedFields[fieldIndex]) {
        exception.extractedFields[fieldIndex].value = newValue;
        exception.extractedFields[fieldIndex].valid = true;
        exception.extractedFields[fieldIndex].flag = 'Manually verified by human operator';
      }
    },
    addIngestedDocument: (state, action) => {
      state.documents.unshift(action.payload);
    },
    askKnowledgeQuestion: (state, action) => {
      state.knowledgeHistory.unshift(action.payload);
    },

    // ─── PROJECTS REDUCERS ───────────────────────────────────────
    addProject: (state, action) => {
      state.projects.unshift(action.payload);
    },
    updateProjectStatus: (state, action) => {
      const { id, status, health } = action.payload;
      const p = state.projects.find(proj => proj.id === id);
      if (p) {
        if (status) p.status = status;
        if (health) p.health = health;
      }
    },
    updateProjectProgress: (state, action) => {
      const { id, progress } = action.payload;
      const p = state.projects.find(proj => proj.id === id);
      if (p) {
        p.progress = Math.min(100, Math.max(0, progress));
        if (p.progress === 100) {
          p.status = 'COMPLETED';
          p.health = 'COMPLETED';
        }
      }
    },
    toggleMilestone: (state, action) => {
      const { projectId, milestoneId } = action.payload;
      const p = state.projects.find(proj => proj.id === projectId);
      if (p) {
        const m = p.milestones.find(ms => ms.id === milestoneId);
        if (m) {
          m.completed = !m.completed;
          const completedCount = p.milestones.filter(ms => ms.completed).length;
          p.progress = Math.round((completedCount / p.milestones.length) * 100);
        }
      }
    },

    // ─── STATUS & RISK REDUCERS ─────────────────────────────────
    addOperationalRisk: (state, action) => {
      state.operationalRisks.unshift(action.payload);
    },
    resolveOperationalRisk: (state, action) => {
      const { id, status, rag } = action.payload;
      const r = state.operationalRisks.find(risk => risk.id === id);
      if (r) {
        r.status = status || 'RESOLVED';
        r.rag = rag || 'GREEN';
      }
    },
    updateRiskMitigation: (state, action) => {
      const { id, mitigation } = action.payload;
      const r = state.operationalRisks.find(risk => risk.id === id);
      if (r) {
        r.mitigation = mitigation;
      }
    },

    // ─── PLANNER & TEAM REDUCERS ─────────────────────────────────
    addPlannerTask: (state, action) => {
      state.plannerTasks.unshift(action.payload);
      const tm = state.teamMembers.find(m => m.id === action.payload.assigneeId);
      if (tm) {
        tm.allocatedHours += (action.payload.estimateHours || 8);
        tm.utilization = Math.round((tm.allocatedHours / tm.capacityHours) * 100);
        tm.activeTasksCount += 1;
        if (tm.utilization > 100) tm.status = 'OVERLOADED';
        else if (tm.utilization >= 75) tm.status = 'OPTIMAL';
        else tm.status = 'AVAILABLE';
      }
    },
    updateTaskStatus: (state, action) => {
      const { id, status } = action.payload;
      const t = state.plannerTasks.find(task => task.id === id);
      if (t) {
        t.status = status;
      }
    },
    reassignTask: (state, action) => {
      const { taskId, newAssigneeId } = action.payload;
      const t = state.plannerTasks.find(task => task.id === taskId);
      const oldMember = t ? state.teamMembers.find(m => m.id === t.assigneeId) : null;
      const newMember = state.teamMembers.find(m => m.id === newAssigneeId);

      if (t && newMember) {
        if (oldMember) {
          oldMember.allocatedHours = Math.max(0, oldMember.allocatedHours - t.estimateHours);
          oldMember.utilization = Math.round((oldMember.allocatedHours / oldMember.capacityHours) * 100);
          oldMember.activeTasksCount = Math.max(0, oldMember.activeTasksCount - 1);
          if (oldMember.utilization > 100) oldMember.status = 'OVERLOADED';
          else if (oldMember.utilization >= 75) oldMember.status = 'OPTIMAL';
          else oldMember.status = 'AVAILABLE';
        }

        t.assigneeId = newMember.id;
        t.assigneeName = newMember.name;
        newMember.allocatedHours += t.estimateHours;
        newMember.utilization = Math.round((newMember.allocatedHours / newMember.capacityHours) * 100);
        newMember.activeTasksCount += 1;
        if (newMember.utilization > 100) newMember.status = 'OVERLOADED';
        else if (newMember.utilization >= 75) newMember.status = 'OPTIMAL';
        else newMember.status = 'AVAILABLE';
      }
    },
    updateMemberCapacity: (state, action) => {
      const { memberId, newCapacity } = action.payload;
      const tm = state.teamMembers.find(m => m.id === memberId);
      if (tm) {
        tm.capacityHours = newCapacity;
        tm.utilization = Math.round((tm.allocatedHours / tm.capacityHours) * 100);
        if (tm.utilization > 100) tm.status = 'OVERLOADED';
        else if (tm.utilization >= 75) tm.status = 'OPTIMAL';
        else tm.status = 'AVAILABLE';
      }
    },

    // ─── DOCUMENTATION & SECURITY REDUCERS ───────────────────────
    addDocumentation: (state, action) => {
      state.documentation.unshift(action.payload);
    },
    updateDocAuditDate: (state, action) => {
      const { id } = action.payload;
      const doc = state.documentation.find(d => d.id === id);
      if (doc) {
        doc.lastAudit = new Date().toISOString().split('T')[0];
        doc.status = 'VERIFIED';
      }
    },
    resolveDlpAlert: (state, action) => {
      const { id } = action.payload;
      const alert = state.securityState.dlpAlerts.find(a => a.id === id);
      if (alert) {
        alert.status = 'RESOLVED';
      }
    },
    toggleComplianceControl: (state, action) => {
      const { standardId, delta } = action.payload;
      const std = state.securityState.complianceStandards.find(s => s.id === standardId);
      if (std) {
        std.controlsPassed = Math.min(std.totalControls, Math.max(0, std.controlsPassed + delta));
        std.score = `${((std.controlsPassed / std.totalControls) * 100).toFixed(1)}%`;
      }
    },

    // ─── WORKFLOW IMPROVEMENTS REDUCERS ─────────────────────────
    addWorkflowImprovement: (state, action) => {
      state.workflowImprovements.unshift(action.payload);
    },
    updateWorkflowStage: (state, action) => {
      const { id, stage } = action.payload;
      const w = state.workflowImprovements.find(wf => wf.id === id);
      if (w) w.stage = stage;
    },
    deployWorkflowImprovement: (state, action) => {
      const { id } = action.payload;
      const w = state.workflowImprovements.find(wf => wf.id === id);
      if (w) {
        w.stage = 'DEPLOYED_LIVE';
      }
    },
    applyAiRecommendation: (state, action) => {
      const { id } = action.payload;
      const rec = state.workflowRecommendations.find(r => r.id === id);
      if (rec) {
        rec.applied = true;
        state.workflowImprovements.unshift({
          id: `WFI-AUTO-${Math.floor(100 + Math.random() * 900)}`,
          title: rec.title,
          domain: rec.domain,
          stage: 'DEPLOYED_LIVE',
          baselineTime: '36.0 min',
          optimizedTime: '2.1 min',
          speedup: '94.2%',
          hoursSavedMo: rec.estimatedHoursSaved,
          annualSavings: `$${(rec.estimatedHoursSaved * 12 * 45).toLocaleString()}`,
          stpRate: '95.5%',
          lead: 'Cognitive Engine Agent Loop',
          steps: [
            { name: 'Telemetry Anomaly Interception', type: 'Kafka Stream Filter', latency: '18ms', auto: true },
            { name: 'Agentic Policy Enforcement', type: 'Self-tuning Rule', latency: '40ms', auto: true },
            { name: 'Automated ERP Resolution', type: 'Direct API Post', latency: '85ms', auto: true }
          ],
          impactSummary: rec.description
        });
      }
    },
    deleteWorkflowImprovement: (state, action) => {
      const { id } = action.payload;
      state.workflowImprovements = state.workflowImprovements.filter(w => w.id !== id);
    },
    removeIngestedDocument: (state, action) => {
      const id = typeof action.payload === 'object' ? action.payload.id : action.payload;
      state.documents = state.documents.filter((d) => d.id !== id);
    }
  },
});

export const {
  resolveException,
  updateExtractedField,
  addIngestedDocument,
  removeIngestedDocument,
  askKnowledgeQuestion,
  // Projects
  addProject,
  updateProjectStatus,
  updateProjectProgress,
  toggleMilestone,
  // Status & Risks
  addOperationalRisk,
  resolveOperationalRisk,
  updateRiskMitigation,
  // Planner & Team
  addPlannerTask,
  updateTaskStatus,
  reassignTask,
  updateMemberCapacity,
  // Documentation & Security
  addDocumentation,
  updateDocAuditDate,
  resolveDlpAlert,
  toggleComplianceControl,
  // Workflow Improvements
  addWorkflowImprovement,
  updateWorkflowStage,
  deployWorkflowImprovement,
  applyAiRecommendation,
  deleteWorkflowImprovement
} = operationsSlice.actions;

export default operationsSlice.reducer;
