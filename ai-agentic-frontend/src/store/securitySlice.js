import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // 1. OVERVIEW & DEFENSE STATUS
  overview: {
    threatLevel: 'DEFCON 5 · OPTIMAL SHIELDED',
    threatScore: '0.01%',
    securityHealth: 99.8,
    lastAuditTimestamp: '2026-10-27 08:30 UTC',
    activeIncidents: 0,
    dlpBlocksToday: 4,
    quantumKeyRotationStatus: 'ACTIVE (Kyber-1024)',
    sovereignFacilitiesCount: 3,
    hardwareAttestationPassRate: '100% (128 / 128 Nodes)',
  },

  // 2. DATA SECURITY (DLP, Zero-Trust Encryption, Quantum HSM Keys & Database Vault)
  dataSecurity: {
    encryptionStandard: 'Quantum-Resistant Kyber-1024 / AES-256-GCM',
    hardwareSecurityModule: 'Thales Luna PCIe HSM Sovereign Cluster (FIPS 140-3 Level 4)',
    tokenRedactionLatency: '0.8ms (Zero-Copy GPU Regex Engine)',
    dataAtRestStatus: '100% LUKS3 Enclave NVMe-oF Encrypted',
    trafficInspectedGbps: '142.8 Gbps Continuous',
    redactionAccuracy: '99.999%',
    recentEvents: [
      {
        id: 'SEC-DAT-901',
        timestamp: '2026-10-27 08:15 UTC',
        title: 'Kyber-1024 Quantum Session Key Rotation',
        category: 'Cryptographic HSM',
        source: 'Thales Luna HSM Cluster',
        severity: 'INFO',
        status: 'COMPLETED_SUCCESS',
        details: 'Ephemeral session master keys regenerated and propagated across 128 GPU worker nodes with 0 dropped packets.',
      },
      {
        id: 'SEC-DAT-902',
        timestamp: '2026-10-27 06:42 UTC',
        title: 'Untrusted Subnet Exfiltration Attempt',
        category: 'Data Loss Prevention (DLP)',
        source: 'Edge Bridge Envoy Proxy',
        severity: 'HIGH',
        status: 'BLOCKED_AND_ISOLATED',
        details: 'Anomalous outbound request matching 128-bit vector embeddings signature was intercepted. Origin IP 198.51.100.44 blacklisted permanently.',
      },
      {
        id: 'SEC-DAT-903',
        timestamp: '2026-10-27 04:10 UTC',
        title: 'Zero-Knowledge Vector DB Attestation',
        category: 'Database Ledger',
        source: 'Milvus Sovereign Cluster',
        severity: 'INFO',
        status: 'VERIFIED',
        details: 'Homomorphic encryption integrity verification passed across 18,400,000 enterprise document chunks.',
      },
      {
        id: 'SEC-DAT-904',
        timestamp: '2026-10-26 23:30 UTC',
        title: 'Automated Ephemeral Memory Scrubbing',
        category: 'Memory Security',
        source: 'PyTorch Distributed Worker Daemon',
        severity: 'INFO',
        status: 'COMPLETED_SUCCESS',
        details: 'H100 HBM3 memory spaces purged and overwritten with cryptographic random noise post-inference batch.',
      },
      {
        id: 'SEC-DAT-905',
        timestamp: '2026-10-26 19:15 UTC',
        title: 'PII Tokenization & Redaction Spike Cleared',
        category: 'PII Shield',
        source: 'Document Intake OCR Pipeline',
        severity: 'LOW',
        status: 'CLEARED',
        details: 'Successfully redacted 482 German Tax IDs and Swedish Personal Identification numbers prior to model ingestion.',
      },
    ],
  },

  // 3. IP SECURITY (Model Weights Sovereignty, Steganographic Watermarks & Leak Crawlers)
  ipSecurity: {
    modelsWatermarked: 8,
    zeroDayLeaksDetected: 0,
    crawlerRepositoriesScanned: '4,281,900 Public Repositories (GitHub, HuggingFace, Civitai)',
    commitSigningEnforcement: '100% Cryptographic YubiKey Hardware Signatures',
    reverseEngineeringDefense: 'Differential Privacy Jitter Enabled',
    models: [
      {
        id: 'MDL-IRUS-70B',
        name: 'IRUS-Cognitive-70B-Base (Sovereign Foundation)',
        parameters: '70 Billion Weights (FP8 Quantized)',
        watermarkHash: '0x89F1A447E...C0291B',
        watermarkMethod: 'Frequency-Domain Tensor Perturbation',
        location: 'Kiruna Subterranean Vault (Air-Gapped)',
        status: 'SECURE_CONTAINED',
        lastAttested: '2026-10-27 07:00 UTC',
        accessPolicy: 'Dual-Executive Sign-Off Only',
      },
      {
        id: 'MDL-IRUS-VIS-3',
        name: 'IRUS-Vision-Pro-v3 (Multi-Modal Cognitive Engine)',
        parameters: '34 Billion Parameters',
        watermarkHash: '0x712EB9018...889A14',
        watermarkMethod: 'Steganographic Latent Space Embedding',
        location: 'Stockholm Tier-IV Sovereign Pod',
        status: 'SECURE_CONTAINED',
        lastAttested: '2026-10-27 06:30 UTC',
        accessPolicy: 'Authorized Inference Cluster Only',
      },
      {
        id: 'MDL-IRUS-QUANT',
        name: 'IRUS-Quant-Finance-14B (Algorithmic Settlement Model)',
        parameters: '14 Billion Parameters',
        watermarkHash: '0xAA9104812...D1129E',
        watermarkMethod: 'Zero-Trace Cryptographic Polynomial Injection',
        location: 'Munich Sovereign Colocation',
        status: 'ACTIVE_IN_PRODUCTION',
        lastAttested: '2026-10-27 08:00 UTC',
        accessPolicy: 'Token-Bound Financial Isolation',
      },
      {
        id: 'MDL-IRUS-AGENT',
        name: 'IRUS-Autonomous-Agent-Orchestrator v2.8',
        parameters: '8 Billion Parameters (Low-Latency)',
        watermarkHash: '0x3F91BC442...E9981A',
        watermarkMethod: 'Immutable Signature Marker in Attention Layers',
        location: 'Stockholm & Munich Replicated Ring',
        status: 'ACTIVE_IN_PRODUCTION',
        lastAttested: '2026-10-27 07:45 UTC',
        accessPolicy: 'Internal Agent Mesh Protocol',
      },
    ],
  },

  // 4. PERSONNEL SAFETY (Biometric Facilities, Executive Travel Risk, Geofencing & Anti-Coercion)
  personnelSafety: {
    activeBadgeCount: 71,
    facilityBreachAttempts: 0,
    emergencyPanicBeaconStatus: 'ARMED (Zero Triggered)',
    executiveEscortProtocol: 'ACTIVE',
    facilities: [
      {
        id: 'FAC-STK-01',
        name: 'Stockholm Headquarters & Cognitive Lab',
        location: 'Kungsgatan 44, Stockholm, Sweden',
        securityLevel: 'LEVEL 4 · BIOMETRIC SECURE',
        activePersonnel: 42,
        perimeterStatus: 'LOCKED & MONITORED',
        biometricAccessLogs: '184 passes today · 100% matched',
      },
      {
        id: 'FAC-MUN-02',
        name: 'Munich Hyperscale GPU Pod',
        location: 'Garching Forschungszentrum, Munich, Germany',
        securityLevel: 'LEVEL 5 · RESTRICTED CRITICAL',
        activePersonnel: 18,
        perimeterStatus: 'MANTRA-AIRLOCK ARMED',
        biometricAccessLogs: '62 passes today · 100% matched',
      },
      {
        id: 'FAC-KIR-03',
        name: 'Kiruna Subterranean Vault',
        location: 'Kiruna Underground Complex, Sweden',
        securityLevel: 'LEVEL 6 · SOVEREIGN MAXIMUM DEFENSE',
        activePersonnel: 11,
        perimeterStatus: 'AIR-GAPPED BUNKER SEALED',
        biometricAccessLogs: '14 passes today · 100% matched',
      },
    ],
    executives: [
      {
        empId: 'EMP-001',
        name: 'Dr. Henrik Lindqvist',
        role: 'Chief Technology Officer',
        currentZone: 'Stockholm HQ (Sovereign Perimeter)',
        threatScore: 'LOW (0.01%)',
        deviceAttestation: 'VERIFIED (YubiKey + Iris Token)',
        travelStatus: 'IN_COUNTRY (Sweden)',
        emergencyContactStatus: 'ACTIVE',
      },
      {
        empId: 'EMP-003',
        name: 'Elsa Nordin',
        role: 'Chief People & Talent Officer',
        currentZone: 'Stockholm HQ',
        threatScore: 'LOW (0.01%)',
        deviceAttestation: 'VERIFIED',
        travelStatus: 'IN_COUNTRY (Sweden)',
        emergencyContactStatus: 'ACTIVE',
      },
      {
        empId: 'EMP-014',
        name: 'Siddharth Rao',
        role: 'Lead LLM Quant & Alignment Specialist',
        currentZone: 'Munich Facility',
        threatScore: 'LOW (0.02%)',
        deviceAttestation: 'VERIFIED',
        travelStatus: 'IN_COUNTRY (Germany)',
        emergencyContactStatus: 'ACTIVE',
      },
      {
        empId: 'EMP-002',
        name: 'Dr. Aris Thorne',
        role: 'Principal Cognitive Systems Architect',
        currentZone: 'Zurich AI Summit (Diplomatic Safe Corridor)',
        threatScore: 'MONITORED (0.04%)',
        deviceAttestation: 'VERIFIED (Encrypted Satellite Uplink)',
        travelStatus: 'SWITZERLAND (Travel Clearance #TC-881)',
        emergencyContactStatus: 'ACTIVE',
      },
    ],
  },

  // 5. EQUIPMENT SECURITY (Hardware Attestation, H100 Supercluster Sensors, TPM 2.0 & InfiniBand NDR)
  equipmentSecurity: {
    superclusterStatus: '100% HARDWARE ATTESTED',
    tamperSensorsTriggered: 0,
    firmwareRollbackProtection: 'ENFORCED (Hardware Signed)',
    hardwareAssets: [
      {
        id: 'EQ-GPU-RACK-01',
        name: 'NVIDIA H100 SuperPod Rack 01-08 (128x GPUs)',
        type: 'GPU Supercomputing Cluster',
        location: 'Stockholm Sovereign Pod A',
        tpmAttestation: 'PASSED (TPM 2.0 PCR Hash Valid)',
        chassisIntrusion: 'SECURE_CLOSED',
        operatingTemp: '61.4°C (Optimal)',
        firmwareVersion: 'v5.4.1 (Signed by NVIDIA / O2i HSM)',
        status: 'OPERATIONAL',
      },
      {
        id: 'EQ-NET-NDR-01',
        name: 'Quantum-2 InfiniBand NDR Switches (800Gbps)',
        type: 'High-Speed Non-Blocking Fabric',
        location: 'Munich & Stockholm Interconnect',
        tpmAttestation: 'PASSED',
        chassisIntrusion: 'SECURE_CLOSED',
        operatingTemp: '54.2°C',
        firmwareVersion: 'Mellanox OS v3.12.9 (Port Locked)',
        status: 'OPERATIONAL',
      },
      {
        id: 'EQ-HSM-LUNA-01',
        name: 'Thales Luna PCIe HSM Cryptographic Core',
        type: 'Hardware Security Module Cluster',
        location: 'Kiruna Bunker Vault',
        tpmAttestation: 'PASSED (Zeroization Sensors Armed)',
        chassisIntrusion: 'SECURE_SEALED',
        operatingTemp: '42.8°C',
        firmwareVersion: 'Luna Firmware v7.8.2',
        status: 'OPERATIONAL',
      },
      {
        id: 'EQ-STORAGE-NVME-01',
        name: 'Direct NVMe-oF Sovereign Storage Array (4.8 PB)',
        type: 'Ultra-Low Latency Encrypted Pool',
        location: 'Stockholm Tier-IV Data Pod',
        tpmAttestation: 'PASSED',
        chassisIntrusion: 'SECURE_CLOSED',
        operatingTemp: '48.1°C',
        firmwareVersion: 'Storage OS v2.1.0',
        status: 'OPERATIONAL',
      },
      {
        id: 'EQ-EDGE-NODES-01',
        name: 'Edge AI Attestation Micro-Nodes (12x Deployments)',
        type: 'Secure Enclave Edge Gateways',
        location: 'European Industrial Partner Gateways',
        tpmAttestation: 'PASSED (Anti-Tamper Resin Enclosed)',
        chassisIntrusion: 'MONITORED_REMOTE',
        operatingTemp: '58.0°C',
        firmwareVersion: 'Sealed Edge v1.4',
        status: 'OPERATIONAL',
      },
    ],
  },

  // 6. INFRASTRUCTURE SECURITY (Physical Data Centers, Nuclear/Hydro Power, Anti-DDoS, EMP Shielding)
  infrastructureSecurity: {
    ddosScrubbingCapacity: '2.4 Tbps (Global Anycast Shield)',
    bgpRouteProtection: '100% RPKI Cryptographically Enforced',
    empShieldingRating: 'MIL-STD-188-125 EMP Compliant',
    facilities: [
      {
        id: 'INFRA-DC-KIRUNA',
        name: 'Kiruna Subterranean Sovereign Bunker',
        depth: '120 meters underground in granitic bedrock',
        powerGrid: '100% Dedicated Hydroelectric + 21-Day Fuel Reserves',
        connectivity: 'Triple-Redundant Dark Fiber with Seismic Vaults',
        empProtection: 'Faraday Cage Room with Solid Copper Cladding',
        fireSuppression: 'Inergen Clean Agent (Zero Hardware Damage)',
        status: '100% ONLINE · AIR-GAPPED CORE',
        airQualityTemp: '18.2°C · 38% Humidity',
      },
      {
        id: 'INFRA-DC-STK',
        name: 'Stockholm Tier-IV Sovereign Colocation',
        depth: 'Ground level with anti-ram perimeter barriers',
        powerGrid: 'Dual Substation Feeds + 2MW Rotary UPS Autonomy',
        connectivity: '800Gbps Direct Terrestrial Mesh (Stockholm-Oslo-Helsinki)',
        empProtection: 'Tier-IV Redundant Shielding',
        fireSuppression: 'Novic 1230 Gas Fire Extinguishment',
        status: '100% ONLINE · PRIMARY COMPUTE',
        airQualityTemp: '20.1°C · 42% Humidity',
      },
      {
        id: 'INFRA-DC-MUNICH',
        name: 'Munich Research Hyperscale Cluster',
        depth: 'Fortified Campus Enclave',
        powerGrid: 'Green Geothermal + Dedicated Solar Microgrid',
        connectivity: 'Direct DE-CIX & GÉANT European Research Rings',
        empProtection: 'Hardened Concrete Enclosure',
        fireSuppression: 'Nitrogen Flood Auto-Depressurization',
        status: '100% ONLINE · AI EXPERIMENTATION',
        airQualityTemp: '19.4°C · 40% Humidity',
      },
    ],
  },
};

const securitySlice = createSlice({
  name: 'security',
  initialState,
  reducers: {
    // 1. Data Security Reducers
    triggerDlpScan: (state) => {
      state.overview.dlpBlocksToday += 1;
      state.dataSecurity.recentEvents.unshift({
        id: `SEC-DAT-${Math.floor(906 + Math.random() * 50)}`,
        timestamp: 'Just Now',
        title: 'Manual Zero-Knowledge DLP Attestation Triggered',
        category: 'Data Loss Prevention',
        source: 'Executive Security Console',
        severity: 'INFO',
        status: 'COMPLETED_SUCCESS',
        details: 'Deep tensor and payload inspection completed. 0 unauthorized secrets or unredacted tokens detected.',
      });
    },
    rotateQuantumKeys: (state) => {
      state.overview.lastAuditTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      state.dataSecurity.recentEvents.unshift({
        id: `SEC-DAT-${Math.floor(906 + Math.random() * 50)}`,
        timestamp: 'Just Now',
        title: 'Kyber-1024 Quantum Master Key Rotation',
        category: 'Cryptographic HSM',
        source: 'Thales Luna HSM Cluster',
        severity: 'INFO',
        status: 'COMPLETED_SUCCESS',
        details: 'New Kyber-1024 lattice keypair generated and synchronized across all sovereign RPC endpoints.',
      });
    },

    // 2. IP Security Reducers
    attestModelWeights: (state, action) => {
      const modelId = action.payload;
      const model = state.ipSecurity.models.find((m) => m.id === modelId);
      if (model) {
        model.lastAttested = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        model.status = 'SECURE_CONTAINED';
      }
    },

    // 3. Personnel Safety Reducers
    revokePersonnelAccess: (state, action) => {
      const empId = action.payload;
      const exec = state.personnelSafety.executives.find((e) => e.empId === empId);
      if (exec) {
        exec.deviceAttestation = 'REVOKED (Zero-Trust Quarantined)';
        exec.threatScore = 'ELEVATED (Under Investigation)';
      }
    },
    triggerEmergencyBeacon: (state) => {
      state.personnelSafety.emergencyPanicBeaconStatus = 'STANDBY_ALERT_ACTIVE';
    },

    // 4. Equipment Security Reducers
    runEquipmentAttestation: (state, action) => {
      const eqId = action.payload;
      const eq = state.equipmentSecurity.hardwareAssets.find((item) => item.id === eqId);
      if (eq) {
        eq.tpmAttestation = 'PASSED (Cryptographically Verified Just Now)';
      }
    },

    // 5. Infrastructure Security Reducers
    togglePerimeterLockdown: (state, action) => {
      const facId = action.payload;
      const facility = state.personnelSafety.facilities.find((f) => f.id === facId);
      if (facility) {
        facility.perimeterStatus =
          facility.perimeterStatus.includes('LOCKDOWN')
            ? 'LOCKED & MONITORED'
            : 'LOCKDOWN ACTIVE · ARMED';
      }
    },
  },
});

export const {
  triggerDlpScan,
  rotateQuantumKeys,
  attestModelWeights,
  revokePersonnelAccess,
  triggerEmergencyBeacon,
  runEquipmentAttestation,
  togglePerimeterLockdown,
} = securitySlice.actions;

export default securitySlice.reducer;
