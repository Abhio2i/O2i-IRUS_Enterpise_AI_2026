import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setOperationsTab } from '../../store/navigationSlice';
import { ExceptionQueueTab } from './ExceptionQueueTab';
import { DocumentIntakeTab } from './DocumentIntakeTab';
import { ProcessMiningTab } from './ProcessMiningTab';
import { KnowledgeAssistantTab } from './KnowledgeAssistantTab';
import { OperationalReportsTab } from './OperationalReportsTab';
import {
  AlertTriangle,
  UploadCloud,
  Activity,
  BookOpen,
  FileSpreadsheet,
  Cog,
  CheckCircle,
} from 'lucide-react';

export const OperationsHub = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.navigation.operationsTab);
  const exceptions = useSelector((state) => state.operations.exceptions);

  const tabs = [
    {
      id: 'exceptions',
      label: 'Exception Queue',
      code: 'OPS-2',
      icon: AlertTriangle,
      badge: exceptions.length > 0 ? exceptions.length : null,
    },
    {
      id: 'intake',
      label: 'Document Intake & Extraction',
      code: 'OPS-1',
      icon: UploadCloud,
    },
    {
      id: 'processMining',
      label: 'Process Mining & Bottlenecks',
      code: 'OPS-3 / 4',
      icon: Activity,
    },
    {
      id: 'knowledge',
      label: 'Knowledge Assistant (SOPs)',
      code: 'OPS-5',
      icon: BookOpen,
    },
    {
      id: 'reports',
      label: 'Automated Reporting',
      code: 'OPS-6',
      icon: FileSpreadsheet,
    },
  ];

  return (
    <div>
      {/* Pillar Overview Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pill-badge mono">PILLAR 1 · MONTH 1–4 PILOT CORE</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Java 21 / Spring Boot 3.x / Camunda 8 BPMN
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', letterSpacing: '-0.3px' }}>
            Operations Agent (Operational Excellence Hub)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '2px' }}>
            Autonomous high-volume document ingestion, field extraction, validation rule gateway, and human-in-the-loop exception handling.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div className="system-status-indicator">
            <span className="pulse-dot"></span>
            <span>AUTONOMOUS WORKFLOW: ACTIVE</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Straight-through rate: <strong style={{ color: 'var(--text-primary)' }}>91.4%</strong>
          </div>
        </div>
      </div>

      {/* Sub Tabs Bar */}
      <div className="sub-tabs-container" style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        <div className="sub-tabs-list">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`sub-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => dispatch(setOperationsTab(tab.id))}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                <span className="mono" style={{ fontSize: '10px', opacity: 0.7 }}>
                  [{tab.code}]
                </span>
                {tab.badge !== null && (
                  <span
                    className="pill-badge high"
                    style={{ fontSize: '10px', padding: '0 5px', height: '18px' }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Viewport */}
      <div>
        {activeTab === 'exceptions' && <ExceptionQueueTab />}
        {activeTab === 'intake' && <DocumentIntakeTab />}
        {activeTab === 'processMining' && <ProcessMiningTab />}
        {activeTab === 'knowledge' && <KnowledgeAssistantTab />}
        {activeTab === 'reports' && <OperationalReportsTab />}
      </div>
    </div>
  );
};
