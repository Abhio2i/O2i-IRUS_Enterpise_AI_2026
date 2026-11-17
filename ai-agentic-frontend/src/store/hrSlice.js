import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // 1. PERSON IDENTIFICATION (KYC, Biometrics, AML & Background Checks)
  identifications: [
    {
      id: 'IDV-901',
      empId: 'CAN-802',
      name: 'Dr. Aris Thorne',
      role: 'Principal Cognitive Systems Architect',
      country: 'Sweden / EU',
      docType: 'EU Sovereign Bio-Passport',
      docNumber: 'SE-•••-8924',
      biometricScore: 99.4,
      livenessPassed: true,
      amlSanctionCheck: 'CLEARED (Zero match on OFAC/EU/UN lists)',
      bgVerification: 'VERIFIED (PhD ETH Zurich, 6 yrs DeepMind)',
      status: 'VERIFIED',
      verifiedAt: '2026-10-24 14:20 UTC',
      riskRating: 'LOW (0.02%)',
      notes: 'Biometric liveness confirmed with 3D depth-map verification. Identity cryptographic signature valid.',
    },
    {
      id: 'IDV-902',
      empId: 'CAN-805',
      name: 'Elena Rostova',
      role: 'Lead Distributed GPU Cluster Engineer',
      country: 'Germany / EU',
      docType: 'German National ID (Personalausweis)',
      docNumber: 'DE-•••-4419',
      biometricScore: 98.8,
      livenessPassed: true,
      amlSanctionCheck: 'CLEARED',
      bgVerification: 'VERIFIED (TU Munich, ex-NVIDIA Hyperscale)',
      status: 'VERIFIED',
      verifiedAt: '2026-10-25 09:15 UTC',
      riskRating: 'LOW (0.01%)',
      notes: 'Government eID chip read completed via NFC. Face match 98.8% against credential photo.',
    },
    {
      id: 'IDV-903',
      empId: 'CAN-811',
      name: 'Kavita Sundaram',
      role: 'Staff Autonomous Agent Safety Researcher',
      country: 'United Kingdom',
      docType: 'UK Biometric Passport & Aadhaar OCI',
      docNumber: 'GB-•••-1102',
      biometricScore: 99.1,
      livenessPassed: true,
      amlSanctionCheck: 'CLEARED',
      bgVerification: 'VERIFIED (Cambridge AI Lab, Alan Turing Inst)',
      status: 'VERIFIED',
      verifiedAt: '2026-10-25 16:40 UTC',
      riskRating: 'LOW (0.03%)',
      notes: 'Dual-credential biometric match. Zero conflict of interest or adverse regulatory records.',
    },
    {
      id: 'IDV-904',
      empId: 'CAN-819',
      name: 'Marcus Vance',
      role: 'Senior Enterprise Solutions Director',
      country: 'United States',
      docType: 'US Real-ID Passport Card',
      docNumber: 'USA-•••-7721',
      biometricScore: 94.2,
      livenessPassed: true,
      amlSanctionCheck: 'FLAGGED_MANUAL_REVIEW',
      bgVerification: 'PENDING_FORMER_EMPLOYER_CLEARANCE',
      status: 'UNDER_REVIEW',
      verifiedAt: '2026-10-26 10:05 UTC',
      riskRating: 'MEDIUM (1.4%)',
      notes: 'Name similarity match on OFAC common-surname list requires manual compliance officer sign-off.',
    },
    {
      id: 'IDV-905',
      empId: 'CAN-824',
      name: 'Linnea Lindholm',
      role: 'Autonomous Ops & SLA Engineer',
      country: 'Finland',
      docType: 'Finnish Citizen eID Card',
      docNumber: 'FI-•••-3309',
      biometricScore: 91.5,
      livenessPassed: false,
      amlSanctionCheck: 'PENDING',
      bgVerification: 'PENDING_UPLOAD',
      status: 'PENDING_DOCS',
      verifiedAt: '2026-10-26 12:30 UTC',
      riskRating: 'LOW (0.05%)',
      notes: 'Glare detected on document edge during OCR intake. Automated SMS sent requesting clear re-capture.',
    },
  ],

  // 2. AI ON CALL INTERVIEWING (Autonomous Recruiter Agent, Transcripts & Evaluation Radar)
  interviews: [
    {
      id: 'CALL-781',
      candidateName: 'Elena Rostova',
      role: 'Lead Distributed GPU Cluster Engineer',
      phone: '+49 170 •••••38',
      callDate: '2026-10-25 11:30 CET',
      duration: '18m 42s',
      status: 'COMPLETED',
      overallScore: 94.2,
      scores: {
        technicalMastery: 96,
        systemArchitecture: 94,
        problemSolving: 92,
        clarityCommunication: 89,
        cultureSafetyAlignment: 95,
      },
      aiSummary: 'Demonstrated deep mastery of InfiniBand NDR non-blocking topologies and PyTorch Distributed checkpointing. Formulated robust zero-loss failover strategy for 1,024-node GPU ring under network jitter.',
      recommendation: 'STRONG_HIRE_ADVANCE_TO_OFFER',
      aiModel: 'IRUS-VoiceRecruiter v4.1 (Low-Latency Neural Audio)',
      transcript: [
        { speaker: 'IRUS AI Recruiter', time: '00:04', text: 'Hello Elena! This is the O2i IRUS Autonomous Technical Recruiter. Thank you for taking our on-call interview for the Lead Distributed GPU Cluster role.' },
        { speaker: 'Elena Rostova', time: '00:15', text: 'Hi! Glad to be here. Excited to dive into O2i\'s supercomputing infrastructure.' },
        { speaker: 'IRUS AI Recruiter', time: '00:22', text: 'Let\'s start with interconnect resilience: How would you architect fault-tolerant model checkpointing across 128 NVIDIA H100 nodes when an NDR switch undergoes transient packet drops?' },
        { speaker: 'Elena Rostova', time: '00:38', text: 'I would configure asynchronous non-blocking double-buffering via NCCL ring-allreduce with adaptive packet rerouting over secondary RoCE v2 routes, offloading tensor state directly to NVMe-oF pools without halting active forward-backward passes.' },
        { speaker: 'IRUS AI Recruiter', time: '01:12', text: 'Excellent. What is your strategy for thermal throttling mitigation during 72-hour LLM pre-training runs?' },
        { speaker: 'Elena Rostova', time: '01:25', text: 'Dynamic power-capping combined with predictive telemetry sensors that proactively throttle non-critical background jobs before hot-spot junctions exceed 82°C.' },
      ],
    },
    {
      id: 'CALL-782',
      candidateName: 'Dr. Aris Thorne',
      role: 'Principal Cognitive Systems Architect',
      phone: '+46 70 •••••82',
      callDate: '2026-10-24 15:00 CET',
      duration: '22m 10s',
      status: 'COMPLETED',
      overallScore: 97.4,
      scores: {
        technicalMastery: 98,
        systemArchitecture: 99,
        problemSolving: 96,
        clarityCommunication: 95,
        cultureSafetyAlignment: 98,
      },
      aiSummary: 'World-class expertise in agentic cognitive loops, semantic routing, and self-healing memory architectures. Outstanding alignment with O2i sovereign AI philosophy.',
      recommendation: 'URGENT_HIRE_ISSUE_OFFER',
      aiModel: 'IRUS-VoiceRecruiter v4.1',
      transcript: [
        { speaker: 'IRUS AI Recruiter', time: '00:05', text: 'Greetings Dr. Thorne. We have reviewed your work on autonomous agent meta-reasoning. Could you outline how you prevent cognitive hallucination drift in multi-agent orchestration?' },
        { speaker: 'Dr. Aris Thorne', time: '00:24', text: 'By implementing strict formal verification gates with bidirectional constraint solvers and immutable provenance graphs at each agent handoff step.' },
        { speaker: 'IRUS AI Recruiter', time: '00:49', text: 'How do you handle latency overheads introduced by real-time formal verification?' },
        { speaker: 'Dr. Aris Thorne', time: '01:05', text: 'We use speculative execution trees. The verification solver runs in parallel with downstream speculative tasks, pruning branches if a constraint fails before state commitment.' },
      ],
    },
    {
      id: 'CALL-783',
      candidateName: 'Kavita Sundaram',
      role: 'Staff Autonomous Agent Safety Researcher',
      phone: '+44 79 •••••11',
      callDate: '2026-10-26 14:00 GMT',
      duration: '19m 50s',
      status: 'COMPLETED',
      overallScore: 93.8,
      scores: {
        technicalMastery: 94,
        systemArchitecture: 92,
        problemSolving: 95,
        clarityCommunication: 94,
        cultureSafetyAlignment: 97,
      },
      aiSummary: 'Exceptional grounding in algorithmic safety bounds, EU AI Act compliance, and red-teaming autonomous agent actions.',
      recommendation: 'STRONG_HIRE_ADVANCE_TO_OFFER',
      aiModel: 'IRUS-VoiceRecruiter v4.1',
      transcript: [
        { speaker: 'IRUS AI Recruiter', time: '00:06', text: 'Welcome Kavita. Please walk us through your methodology for evaluating adversarial prompt injection into multi-modal agent workflows.' },
        { speaker: 'Kavita Sundaram', time: '00:21', text: 'We establish an isolated sandbox with automated red-team perturbations spanning token-level noise, steganographic image payloads, and semantic jailbreaks, measuring containment delta.' },
      ],
    },
    {
      id: 'CALL-784',
      candidateName: 'Henrik Larsson',
      role: 'Senior Platform Reliability Engineer',
      phone: '+46 72 •••••90',
      callDate: '2026-10-27 10:00 CET',
      duration: 'Scheduled (20m slot)',
      status: 'SCHEDULED',
      overallScore: null,
      scores: {
        technicalMastery: 0,
        systemArchitecture: 0,
        problemSolving: 0,
        clarityCommunication: 0,
        cultureSafetyAlignment: 0,
      },
      aiSummary: 'Autonomous interview scheduled on calendar. Outbound AI telephony session will initialize at 10:00 CET.',
      recommendation: 'AWAITING_CALL',
      aiModel: 'IRUS-VoiceRecruiter v4.1',
      transcript: [],
    },
  ],

  // 3. OFFER LETTERS (Compensation, ESOPs, Terms & Digital E-Sign Lifecycle)
  offerLetters: [
    {
      id: 'OFF-2026-081',
      candidateName: 'Dr. Aris Thorne',
      role: 'Principal Cognitive Systems Architect',
      department: 'Core AI Research',
      level: 'L7 - Principal Fellow',
      location: 'Stockholm HQ / Hybrid Sovereign',
      baseSalary: '$310,000',
      annualBonus: '$65,000 (Target 21%)',
      equityGrant: '0.42% ESOP (4-year vest, 1-year cliff)',
      joiningDate: '2026-12-01',
      validUntil: '2026-11-15',
      status: 'SIGNED_ACCEPTED',
      signedAt: '2026-10-25 18:45 UTC',
      docuSignEnvelopeId: 'DS-ENV-90182-O2I',
      benefits: 'Dedicated 2x H100 Cloud Compute, Full Executive Healthcare, Unlimited Sabbatical, Relocation Package ($25,000)',
    },
    {
      id: 'OFF-2026-082',
      candidateName: 'Elena Rostova',
      role: 'Lead Distributed GPU Cluster Engineer',
      department: 'Infrastructure & Compute',
      level: 'L6 - Staff Lead',
      location: 'Munich / Stockholm Hybrid',
      baseSalary: '$265,000',
      annualBonus: '$48,000 (Target 18%)',
      equityGrant: '0.28% ESOP (4-year vest, 1-year cliff)',
      joiningDate: '2026-12-15',
      validUntil: '2026-11-10',
      status: 'SENT_FOR_SIGNATURE',
      signedAt: null,
      docuSignEnvelopeId: 'DS-ENV-90183-O2I',
      benefits: 'High-Performance Home Workstation, Tier-IV Data Center Access, Premium Health & Dental, Annual Conference Budget ($10,000)',
    },
    {
      id: 'OFF-2026-083',
      candidateName: 'Kavita Sundaram',
      role: 'Staff Autonomous Agent Safety Researcher',
      department: 'Safety & Alignment',
      level: 'L6 - Staff Researcher',
      location: 'London / Remote Sovereign',
      baseSalary: '$240,000',
      annualBonus: '$42,000 (Target 17.5%)',
      equityGrant: '0.22% ESOP (4-year vest, 1-year cliff)',
      joiningDate: '2027-01-05',
      validUntil: '2026-11-20',
      status: 'GENERATED_PENDING_APPROVAL',
      signedAt: null,
      docuSignEnvelopeId: 'DS-ENV-90184-O2I',
      benefits: 'Frontier AI Research Grant, Wellness Allowance, Sovereign Remote Workspace Setup ($8,000)',
    },
  ],

  // 4. POLICIES (Company HR Policies, AI Co-Worker Ethics, IP Assignment, Sabbatical & Moonlighting)
  policies: [
    {
      id: 'POL-HR-001',
      code: 'HR-IP-2026',
      title: 'Proprietary IP Assignment & Model Weights Sovereignty Policy',
      category: 'Intellectual Property',
      version: 'v4.1',
      effectiveDate: '2026-01-01',
      mandatory: true,
      acknowledgmentRate: '100% (71 / 71 Employees)',
      userAcknowledged: true,
      summary: 'All foundational model weights, fine-tuned agent adapters, synthetic reasoning datasets, and cognitive heuristics developed during tenure are exclusively owned by O2i - IRUS. Zero external leakage permitted.',
      clauses: [
        'Strict sovereign containment of internal model checkpoints',
        'Automatic assignment of all algorithmic patents and copyrights',
        'Mandatory usage of enterprise encrypted HSM keys for code signing',
      ],
    },
    {
      id: 'POL-HR-002',
      code: 'HR-AI-2026',
      title: 'Autonomous AI Co-Worker & Human Oversight Framework',
      category: 'AI Ethics & Operations',
      version: 'v3.2',
      effectiveDate: '2026-03-15',
      mandatory: true,
      acknowledgmentRate: '98.5% (70 / 71 Employees)',
      userAcknowledged: true,
      summary: 'Defines the collaborative protocol between human engineers and autonomous cognitive agents. Humans retain constitutional override and veto rights over financial, safety, and client data flows.',
      clauses: [
        'Four-eyes principle for actions exceeding autonomous threshold',
        'Algorithmic explainability audit trails must accompany all agent commits',
        'Prohibition against spoofing human identity or deceptive agent labeling',
      ],
    },
    {
      id: 'POL-HR-003',
      code: 'HR-MOON-2026',
      title: 'Conflict of Interest & Dual Employment (Moonlighting) Policy',
      category: 'Conduct & Governance',
      version: 'v2.8',
      effectiveDate: '2026-02-01',
      mandatory: true,
      acknowledgmentRate: '97.2% (69 / 71 Employees)',
      userAcknowledged: false,
      summary: 'Strict prohibition on advisory, engineering, or equity engagements with competing frontier AI labs or sovereign intelligence contractors without written Board approval.',
      clauses: [
        'Annual disclosure of external academic speaking engagements and open-source contributions',
        'Complete restriction on providing commercial AI model consulting',
        'Confidentiality covenants survive termination for 36 months',
      ],
    },
    {
      id: 'POL-HR-004',
      code: 'HR-LEAVE-2026',
      title: 'High-Trust Unlimited Leave, Mental Well-Being & Sabbatical Policy',
      category: 'Benefits & Culture',
      version: 'v2.4',
      effectiveDate: '2026-04-01',
      mandatory: false,
      acknowledgmentRate: '95.8% (68 / 71 Employees)',
      userAcknowledged: true,
      summary: 'High-trust, output-oriented leave framework. Unlimited paid time off with mandatory 25-day annual minimum, plus 6-week paid recharge sabbatical after 3 years of service.',
      clauses: [
        'Zero tracking of daily working hours; evaluated strictly on milestone output',
        'Fully paid parental leave of 26 weeks for all primary caregivers',
        'Sabbatical grant of $5,000 for personal rejuvenation or exploratory study',
      ],
    },
    {
      id: 'POL-HR-005',
      code: 'HR-SAFETY-2026',
      title: 'Autonomous Systems Whistleblower & Safe AI Reporting Protocol',
      category: 'Compliance & Safety',
      version: 'v1.9',
      effectiveDate: '2026-05-10',
      mandatory: true,
      acknowledgmentRate: '100% (71 / 71 Employees)',
      userAcknowledged: true,
      summary: 'Guaranteed anti-retaliation protection for any employee reporting model misalignment, unconstrained agent behavior, safety benchmark bypasses, or regulatory non-compliance.',
      clauses: [
        'Direct encrypted escalation hotline to independent Board Safety Committee',
        'Immunity from disciplinary action when raising good-faith safety concerns',
        'Mandatory temporary suspension of disputed model deployment pending review',
      ],
    },
  ],

  // 5. SALARY DISBURSEMENT (PAYROLL & INTERACTIVE PAY SLIPS)
  payroll: {
    currentCycle: 'October 2026',
    cyclePeriod: '01 Oct 2026 - 31 Oct 2026',
    disbursementDate: '2026-10-25',
    status: 'DISBURSED',
    totalGrossDisbursed: '$1,842,500',
    totalNetDisbursed: '$1,374,320',
    totalTaxesDeducted: '$382,680',
    totalPfDeducted: '$85,500',
    headcountPaid: 71,
    disbursementMethod: 'SEPA Instant / SWIFT Wire Direct Credit',
    clearingBank: 'Svenska Handelsbanken & Deutsche Bank Corporate',
    batchReference: 'BATCH-O2I-PAYROLL-202610-71E',
    employees: [
      {
        empId: 'EMP-001',
        name: 'Dr. Henrik Lindqvist',
        designation: 'Chief Technology Officer',
        department: 'Executive Leadership',
        bank: 'Handelsbanken Private Banking',
        accountMasked: 'SE-•••-9012',
        joiningDate: '2023-01-15',
        panTaxId: 'SWE-TAX-771928',
        earnings: {
          basic: 18500,
          hra: 6000,
          specialAllowance: 4500,
          performanceBonus: 3000,
          grossTotal: 32000,
        },
        deductions: {
          incomeTaxTds: 6800,
          providentFund: 1200,
          professionalTax: 250,
          healthInsurance: 350,
          totalDeductions: 8600,
        },
        netPay: 23400,
        status: 'PAID',
        utrRef: 'SEPA-UTR-991823741',
      },
      {
        empId: 'EMP-014',
        name: 'Siddharth Rao',
        designation: 'Lead LLM Quant & Alignment Specialist',
        department: 'Core AI Research',
        bank: 'Deutsche Bank Global',
        accountMasked: 'DE-•••-4091',
        joiningDate: '2024-03-01',
        panTaxId: 'DE-TAX-448201',
        earnings: {
          basic: 14700,
          hra: 4900,
          specialAllowance: 3400,
          performanceBonus: 1500,
          grossTotal: 24500,
        },
        deductions: {
          incomeTaxTds: 4165,
          providentFund: 1200,
          professionalTax: 200,
          healthInsurance: 300,
          totalDeductions: 5865,
        },
        netPay: 18635,
        status: 'PAID',
        utrRef: 'SEPA-UTR-991823742',
      },
      {
        empId: 'EMP-022',
        name: 'Astrid Bergman',
        designation: 'Staff DevOps & GPU Infrastructure Lead',
        department: 'Infrastructure & Compute',
        bank: 'Nordea Enterprise',
        accountMasked: 'FI-•••-1184',
        joiningDate: '2024-06-15',
        panTaxId: 'SWE-TAX-902184',
        earnings: {
          basic: 13500,
          hra: 4500,
          specialAllowance: 3000,
          performanceBonus: 1200,
          grossTotal: 22200,
        },
        deductions: {
          incomeTaxTds: 3774,
          providentFund: 1200,
          professionalTax: 200,
          healthInsurance: 300,
          totalDeductions: 5474,
        },
        netPay: 16726,
        status: 'PAID',
        utrRef: 'SEPA-UTR-991823743',
      },
      {
        empId: 'EMP-031',
        name: 'Carlos Mendez',
        designation: 'Senior Autonomous Systems Engineer',
        department: 'Autonomous Operations',
        bank: 'Santander International',
        accountMasked: 'ES-•••-5529',
        joiningDate: '2025-01-10',
        panTaxId: 'ES-TAX-339104',
        earnings: {
          basic: 11000,
          hra: 3700,
          specialAllowance: 2500,
          performanceBonus: 800,
          grossTotal: 18000,
        },
        deductions: {
          incomeTaxTds: 3060,
          providentFund: 1000,
          professionalTax: 150,
          healthInsurance: 250,
          totalDeductions: 4460,
        },
        netPay: 13540,
        status: 'PAID',
        utrRef: 'SEPA-UTR-991823744',
      },
      {
        empId: 'EMP-045',
        name: 'Mei-Ling Zhou',
        designation: 'Principal Regulatory & Sovereign Counsel',
        department: 'Legal & Compliance',
        bank: 'HSBC Private Client',
        accountMasked: 'GB-•••-8831',
        joiningDate: '2024-09-01',
        panTaxId: 'GB-TAX-552019',
        earnings: {
          basic: 16000,
          hra: 5200,
          specialAllowance: 3800,
          performanceBonus: 2000,
          grossTotal: 27000,
        },
        deductions: {
          incomeTaxTds: 5400,
          providentFund: 1200,
          professionalTax: 200,
          healthInsurance: 300,
          totalDeductions: 7100,
        },
        netPay: 19900,
        status: 'PAID',
        utrRef: 'SEPA-UTR-991823745',
      },
    ],
  },

  // 6. EXPERIENCE LETTERS (Relieving & Experience Certificates with Cryptographic Signatures)
  experienceLetters: [
    {
      id: 'EXP-2026-08',
      certId: 'O2I-EXP-CERT-2026-008',
      employeeName: 'Sofia Lindqvist',
      empId: 'EMP-003',
      formerDesignation: 'Staff Distributed Systems Engineer',
      department: 'Core Infrastructure',
      joiningDate: '2023-08-15',
      relievingDate: '2026-09-30',
      tenureYears: '3.1 Years',
      conduct: 'EXEMPLARY & OUTSTANDING',
      reasonForLeaving: 'Pursuing Postdoctoral Research at CERN OpenLab',
      endorsement: 'Sofia spearheaded zero-copy RDMA memory transport across our 128-node NVIDIA H100 supercluster, slashing inter-node communication latency by 44%. Her deep systems mastery, intellectual rigour, and collegial mentorship contributed immensely to O2i\'s growth.',
      signatory: 'Dr. Henrik Lindqvist',
      signatoryTitle: 'Chief Technology Officer, O2i - IRUS Enterprise AI',
      verificationHash: '0x8f9c2a71d4b68e903f1b4c92ad17fe5531',
      status: 'ISSUED_VERIFIED',
      issuedDate: '2026-10-01',
    },
    {
      id: 'EXP-2026-09',
      certId: 'O2I-EXP-CERT-2026-009',
      employeeName: 'Lukas Meyer',
      empId: 'EMP-019',
      formerDesignation: 'Senior Front-End Architect',
      department: 'Enterprise Experience',
      joiningDate: '2024-02-01',
      relievingDate: '2026-10-15',
      tenureYears: '2.7 Years',
      conduct: 'HIGHLY COMMENDED',
      reasonForLeaving: 'Founding an Autonomous Agent Visual Analytics Venture',
      endorsement: 'Lukas designed and implemented the foundational glassmorphic design system and real-time WebSocket state management powering our executive command centers. We extend our warmest wishes for his entrepreneurial endeavor.',
      signatory: 'Elsa Nordin',
      signatoryTitle: 'Chief People & Talent Officer, O2i - IRUS Enterprise AI',
      verificationHash: '0x3c71a9bf281d0943fe82a048719bc0192a',
      status: 'ISSUED_VERIFIED',
      issuedDate: '2026-10-18',
    },
    {
      id: 'EXP-2026-10',
      certId: 'O2I-EXP-CERT-2026-010',
      employeeName: 'Frederik Van Houten',
      empId: 'EMP-028',
      formerDesignation: 'AI Security & Cryptographic Engineer',
      department: 'Security & Sovereignty',
      joiningDate: '2024-05-10',
      relievingDate: '2026-10-20',
      tenureYears: '2.4 Years',
      conduct: 'EXCELLENT',
      reasonForLeaving: 'Relocating to the Netherlands for Family Reasons',
      endorsement: 'Frederik established our Thales Luna Quantum HSM cryptographic key-hierarchy and automated zero-trust authorization pipelines.',
      signatory: 'Elsa Nordin',
      signatoryTitle: 'Chief People & Talent Officer, O2i - IRUS Enterprise AI',
      verificationHash: '0x5e10bd4498aa2319c8f00127bb61a29f84',
      status: 'DRAFT_PENDING_EXECUTIVE_SEAL',
      issuedDate: '2026-10-26',
    },
  ],

  // 7. DOCUMENTATION (Employee Talent Vault, Compliance Proofs, NDAs, Tax & Education)
  documentation: [
    {
      id: 'DOC-HR-301',
      empId: 'EMP-001',
      employeeName: 'Dr. Henrik Lindqvist',
      category: 'Legal & IP Agreements',
      documentName: 'O2i_Comprehensive_IP_Assignment_v4.pdf',
      documentType: 'IP & Patent Assignment Deed',
      fileSize: '3.8 MB',
      uploadDate: '2023-01-15',
      status: 'VERIFIED',
      verifiedBy: 'Sovereign Legal Counsel & Auto-OCR',
      expiresAt: 'Perpetual / Indefinite',
      isConfidential: true,
    },
    {
      id: 'DOC-HR-302',
      empId: 'EMP-014',
      employeeName: 'Siddharth Rao',
      category: 'Identity & Tax',
      documentName: 'Tax_Residency_Certificate_Form16_DE.pdf',
      documentType: 'Tax Form & Double Taxation Proof',
      fileSize: '1.9 MB',
      uploadDate: '2026-01-10',
      status: 'VERIFIED',
      verifiedBy: 'Finance & Tax Compliance Unit',
      expiresAt: '2026-12-31',
      isConfidential: true,
    },
    {
      id: 'DOC-HR-303',
      empId: 'EMP-014',
      employeeName: 'Siddharth Rao',
      category: 'Educational Credentials',
      documentName: 'PhD_Computer_Science_Degree_Apostille.pdf',
      documentType: 'Doctoral Degree & Apostille',
      fileSize: '4.2 MB',
      uploadDate: '2024-03-01',
      status: 'VERIFIED',
      verifiedBy: 'Global Background Screening (FirstAdvantage)',
      expiresAt: 'Permanent',
      isConfidential: false,
    },
    {
      id: 'DOC-HR-304',
      empId: 'EMP-022',
      employeeName: 'Astrid Bergman',
      category: 'Legal & IP Agreements',
      documentName: 'Non_Disclosure_Agreement_Mutual_Sovereign.pdf',
      documentType: 'Mutual NDA & Trade Secrets Covenant',
      fileSize: '2.1 MB',
      uploadDate: '2024-06-15',
      status: 'VERIFIED',
      verifiedBy: 'Legal Dept',
      expiresAt: 'Perpetual',
      isConfidential: true,
    },
    {
      id: 'DOC-HR-305',
      empId: 'EMP-031',
      employeeName: 'Carlos Mendez',
      category: 'Identity & Tax',
      documentName: 'Spain_NIE_Social_Security_Affiliation.pdf',
      documentType: 'Social Security Registration',
      fileSize: '1.4 MB',
      uploadDate: '2025-01-10',
      status: 'VERIFIED',
      verifiedBy: 'HR Operations',
      expiresAt: '2027-01-10',
      isConfidential: true,
    },
    {
      id: 'DOC-HR-306',
      empId: 'EMP-045',
      employeeName: 'Mei-Ling Zhou',
      category: 'Professional Certifications',
      documentName: 'Solicitor_Regulation_Authority_Practising_Cert.pdf',
      documentType: 'Bar Practising Certificate',
      fileSize: '2.7 MB',
      uploadDate: '2024-09-01',
      status: 'VERIFIED',
      verifiedBy: 'Chief Legal Officer',
      expiresAt: '2026-11-01',
      isConfidential: false,
    },
    {
      id: 'DOC-HR-307',
      empId: 'EMP-022',
      employeeName: 'Astrid Bergman',
      category: 'Background Checks',
      documentName: 'Interpol_Europol_Criminal_Record_Clearance.pdf',
      documentType: 'Police Clearance Certificate',
      fileSize: '1.1 MB',
      uploadDate: '2024-06-10',
      status: 'VERIFIED',
      verifiedBy: 'Sovereign Security Desk',
      expiresAt: '2027-06-10',
      isConfidential: true,
    },
  ],
};

const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {
    // 1. Person Identification Reducers
    verifyIdentity: (state, action) => {
      const id = action.payload;
      const target = state.identifications.find((item) => item.id === id);
      if (target) {
        target.status = 'VERIFIED';
        target.biometricScore = Math.max(target.biometricScore, 98.5);
        target.livenessPassed = true;
        target.amlSanctionCheck = 'CLEARED (Manual Compliance Override)';
        target.bgVerification = 'VERIFIED';
        target.riskRating = 'LOW (0.01%)';
        target.verifiedAt = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      }
    },
    addIdentificationRecord: (state, action) => {
      state.identifications.unshift(action.payload);
    },

    // 2. AI On Call Interview Reducers
    triggerAiCall: (state, action) => {
      const { candidateName, role, phone } = action.payload;
      const newCall = {
        id: `CALL-${Math.floor(100 + Math.random() * 900)}`,
        candidateName,
        role,
        phone,
        callDate: 'Just Now (Active)',
        duration: '03m 15s',
        status: 'IN_CALL',
        overallScore: 92.5,
        scores: {
          technicalMastery: 93,
          systemArchitecture: 91,
          problemSolving: 94,
          clarityCommunication: 90,
          cultureSafetyAlignment: 94,
        },
        aiSummary: 'Autonomous recruiter engaged candidate. Live telemetry indicates confident responses on distributed consensus and high reasoning velocity.',
        recommendation: 'STRONG_CANDIDATE_IN_PROGRESS',
        aiModel: 'IRUS-VoiceRecruiter v4.1',
        transcript: [
          { speaker: 'IRUS AI Recruiter', time: '00:03', text: `Greetings ${candidateName}. The O2i Autonomous Recruiter is evaluating your technical alignment for the ${role} position.` },
          { speaker: candidateName, time: '00:18', text: 'Thank you! Excited to walk through my experience.' },
          { speaker: 'IRUS AI Recruiter', time: '00:30', text: 'Could you summarize how you achieve sub-millisecond inference in GPU clusters?' },
        ],
      };
      state.interviews.unshift(newCall);
    },
    advanceCandidateToOffer: (state, action) => {
      const interviewId = action.payload;
      const target = state.interviews.find((i) => i.id === interviewId);
      if (target) {
        target.recommendation = 'ADVANCED_TO_OFFER_GENERATION';
      }
    },

    // 3. Offer Letter Reducers
    createOfferLetter: (state, action) => {
      state.offerLetters.unshift(action.payload);
    },
    updateOfferStatus: (state, action) => {
      const { id, status } = action.payload;
      const target = state.offerLetters.find((o) => o.id === id);
      if (target) {
        target.status = status;
        if (status === 'SIGNED_ACCEPTED') {
          target.signedAt = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        }
      }
    },

    // 4. Policies Reducers
    acknowledgePolicy: (state, action) => {
      const policyId = action.payload;
      const policy = state.policies.find((p) => p.id === policyId);
      if (policy) {
        policy.userAcknowledged = true;
      }
    },
    addPolicyAmendment: (state, action) => {
      state.policies.unshift(action.payload);
    },

    // 5. Salary Disbursement Reducers
    disburseMonthlyBatch: (state) => {
      state.payroll.status = 'DISBURSED';
      state.payroll.disbursementDate = new Date().toISOString().substring(0, 10);
      state.payroll.employees.forEach((emp) => {
        emp.status = 'PAID';
        if (!emp.utrRef) {
          emp.utrRef = `SEPA-UTR-${Math.floor(100000000 + Math.random() * 900000000)}`;
        }
      });
    },

    // 6. Experience Letter Reducers
    issueExperienceLetter: (state, action) => {
      state.experienceLetters.unshift(action.payload);
    },
    updateExperienceLetterStatus: (state, action) => {
      const { id, status } = action.payload;
      const target = state.experienceLetters.find((e) => e.id === id);
      if (target) {
        target.status = status;
      }
    },

    // 7. Documentation Reducers
    uploadDocument: (state, action) => {
      state.documentation.unshift(action.payload);
    },
    verifyDocumentStatus: (state, action) => {
      const docId = action.payload;
      const doc = state.documentation.find((d) => d.id === docId);
      if (doc) {
        doc.status = 'VERIFIED';
        doc.verifiedBy = 'Compliance Officer (Direct Sign-off)';
      }
    },
  },
});

export const {
  verifyIdentity,
  addIdentificationRecord,
  triggerAiCall,
  advanceCandidateToOffer,
  createOfferLetter,
  updateOfferStatus,
  acknowledgePolicy,
  addPolicyAmendment,
  disburseMonthlyBatch,
  issueExperienceLetter,
  updateExperienceLetterStatus,
  uploadDocument,
  verifyDocumentStatus,
} = hrSlice.actions;

export default hrSlice.reducer;
