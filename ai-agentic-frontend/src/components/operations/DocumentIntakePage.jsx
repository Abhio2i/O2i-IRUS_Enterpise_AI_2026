import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addIngestedDocument, removeIngestedDocument } from '../../store/operationsSlice';
import { addAuditLog } from '../../store/governanceSlice';
import {
  UploadCloud, Server, CheckCircle2, AlertTriangle, FileText,
  Search, RefreshCw, X, Eye, FileSpreadsheet, FileCheck2,
  Download, ExternalLink, Trash2, Copy, Check
} from 'lucide-react';
import {
  intakeDocument,
  listDocuments,
  getDocument,
  getDocumentContent,
  downloadDocumentFile,
  deleteDocument,
} from '../../services/apiClient';

const PIPELINE_STEPS = [
  { n: '01', title: 'Intake Gateway', desc: 'Email · REST API · Kafka Topic · Direct Upload' },
  { n: '02', title: 'Apache Tika + PDFBox', desc: 'Raw text, OCR parsing, table extraction' },
  { n: '03', title: 'Spring AI LLM Extractor', desc: 'Typed JSON schema with confidence scores' },
  { n: '04', title: 'Drools Rule Engine', desc: 'Threshold checks, format validation, duplicate detection' },
  { n: '05', title: 'Camunda 8 BPMN Engine', desc: 'Auto-approve or route to Exception Queue' },
  { n: '06', title: 'Audit Event Stream', desc: 'Immutable Kafka log + OpenTelemetry traces' },
];

const DOCUMENT_TYPES = [
  { value: 'INVOICE', label: 'Vendor Invoice' },
  { value: 'BILL_OF_LADING', label: 'Bill of Lading / Freight Bill' },
  { value: 'CONTRACT', label: 'Service Contract / SLA' },
  { value: 'PURCHASE_ORDER', label: 'Purchase Order (PO)' },
  { value: 'CUSTOMS_DECLARATION', label: 'Customs Clearance Form' },
  { value: 'FINANCIAL_STATEMENT', label: 'Financial Statement / Audit' },
];

const SOURCES = [
  { value: 'Direct Upload', label: 'Direct Upload (Operator Console)' },
  { value: 'Email Gateway (ap@bjorn.com)', label: 'Email Gateway (ap@bjorn.com)' },
  { value: 'Kafka: intake.files.topic', label: 'Kafka Stream: intake.files.topic' },
  { value: 'FTP Bridge', label: 'FTP Bridge (Batch Ingest)' },
  { value: 'REST API', label: 'REST API Gateway' },
];

export const DocumentIntakePage = () => {
  const dispatch = useDispatch();
  const reduxDocuments = useSelector((s) => s.operations.documents);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [simulating, setSimulating] = useState(false);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadDocType, setUploadDocType] = useState('INVOICE');
  const [uploadSource, setUploadSource] = useState('Direct Upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Document Details Inspector Modal
  const [selectedDocDetail, setSelectedDocDetail] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [fileActionMsg, setFileActionMsg] = useState('');

  // Refresh Documents from Backend GET /api/documents
  const handleRefreshFromBackend = async () => {
    try {
      const liveDocs = await listDocuments();
      if (Array.isArray(liveDocs) && liveDocs.length > 0) {
        liveDocs.forEach((doc) => {
          const fileSizeMB = doc.size ? (doc.size / (1024 * 1024)).toFixed(2) + ' MB' : '1.5 MB';
          const conf = doc.overallConfidence != null ? `${doc.overallConfidence}%` : (doc.confidence || '95.0%');
          dispatch(addIngestedDocument({
            id: doc.id || doc.documentId || `DOC-${Math.floor(9300 + Math.random() * 600)}`,
            name: doc.name || doc.originalFilename || doc.fileName || 'Uploaded-Document.pdf',
            source: doc.source || 'Direct Upload',
            type: doc.type || doc.documentType || 'Vendor Invoice',
            status: doc.status || 'PROCESSED',
            flagReason: doc.flagReason,
            uploadedBy: doc.uploadedBy || 'operator@org.com',
            size: fileSizeMB,
            time: doc.time ? new Date(doc.time).toLocaleTimeString() : 'Just now',
            confidence: conf,
            extractedFields: doc.extractedFields || {},
            fieldConfidences: doc.fieldConfidences || {},
            extractedText: doc.extractedText || '',
            remoteDetails: doc,
          }));
        });
      }
    } catch (err) {
      console.warn('Backend listing sync notice:', err.message);
    }
  };

  useEffect(() => {
    handleRefreshFromBackend();
  }, []);

  // Real Document Upload handler
  const handleRealUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a document file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');
    setUploadProgress(30);

    try {
      setUploadProgress(60);
      const backendDoc = await intakeDocument({
        file: selectedFile,
        documentType: uploadDocType,
        source: uploadSource,
      });

      setUploadProgress(100);

      const fileSizeMB = (backendDoc.size ? backendDoc.size / (1024 * 1024) : selectedFile.size / (1024 * 1024)).toFixed(2);
      const docTypeLabel = DOCUMENT_TYPES.find(d => d.value === uploadDocType)?.label || uploadDocType;
      const confidenceStr = backendDoc.overallConfidence != null ? `${backendDoc.overallConfidence}%` : '95.0%';
      const isAutoApproved = backendDoc.status === 'PROCESSED';

      const newDoc = {
        id: backendDoc.id || `DOC-${Math.floor(9200 + Math.random() * 800)}`,
        name: backendDoc.name || selectedFile.name,
        source: backendDoc.source || uploadSource,
        type: docTypeLabel,
        status: backendDoc.status || 'PROCESSED',
        flagReason: backendDoc.flagReason || null,
        uploadedBy: backendDoc.uploadedBy || 'Authenticated Operator',
        size: `${fileSizeMB} MB`,
        time: backendDoc.time ? new Date(backendDoc.time).toLocaleTimeString() : 'Just now',
        confidence: confidenceStr,
        mimeType: backendDoc.contentType || selectedFile.type || 'application/octet-stream',
        extractedFields: backendDoc.extractedFields || {},
        fieldConfidences: backendDoc.fieldConfidences || {},
        extractedText: backendDoc.extractedText || '',
        remoteDetails: backendDoc,
      };

      dispatch(addIngestedDocument(newDoc));
      dispatch(addAuditLog({
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        actor: backendDoc.uploadedBy || 'operator.intake-gateway',
        action: isAutoApproved ? 'DOCUMENT_INTAKE_AUTO_APPROVED' : 'DOCUMENT_INTAKE_EXCEPTION',
        endpoint: '/api/documents/intake',
        riskTier: isAutoApproved ? 'LOW' : 'MEDIUM',
        model: 'Spring AI / Apache Tika + Drools Gateway',
        tokens: 1450,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        details: `File "${selectedFile.name}" ingested. Status: ${backendDoc.status}. ${backendDoc.flagReason || 'All schema validations passed.'}`,
      }));

      const successNotice = isAutoApproved
        ? `"${selectedFile.name}" processed successfully (${confidenceStr} confidence, Auto-Approved).`
        : `"${selectedFile.name}" ingested into Exception Queue: ${backendDoc.flagReason || 'Requires review'}.`;

      setUploadSuccess(successNotice);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadSuccess('');
        setIsUploading(false);
        setUploadProgress(0);
      }, 1500);

    } catch (err) {
      console.error('[INTAKE ERROR]:', err);
      let errMsg = err.message || 'Document upload failed.';
      if (errMsg.includes('401') || errMsg.toLowerCase().includes('unauthorized')) {
        errMsg = 'Authentication expired. Please refresh your session or sign in again.';
      } else if (errMsg.includes('403') || errMsg.toLowerCase().includes('forbidden')) {
        errMsg = 'Access denied: Token has no valid tenant permissions.';
      }
      setUploadError(errMsg);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Open Document Detail modal
  const handleInspectDocument = async (doc) => {
    setSelectedDocDetail(doc);
    try {
      const remoteData = await getDocument(doc.id);
      setSelectedDocDetail((prev) => ({ ...prev, remoteDetails: remoteData }));
    } catch {
      // Local document details preserved
    }
  };

  // View original file inline or in new tab
  const handleViewOriginal = async (doc) => {
    if (!doc?.id) return;
    setDownloadingId(doc.id);
    setFileActionMsg('');
    try {
      const { blobUrl } = await getDocumentContent(doc.id);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.warn('Original file view notice:', err.message);
      setFileActionMsg(`Could not load original file: ${err.message}`);
      setTimeout(() => setFileActionMsg(''), 4500);
    } finally {
      setDownloadingId(null);
    }
  };

  // Download original file
  const handleDownloadOriginal = async (doc) => {
    if (!doc?.id) return;
    setDownloadingId(doc.id);
    setFileActionMsg('');
    try {
      await downloadDocumentFile(doc.id, doc.name || 'document');
    } catch (err) {
      console.warn('Original file download notice:', err.message);
      setFileActionMsg(`Could not download file: ${err.message}`);
      setTimeout(() => setFileActionMsg(''), 4500);
    } finally {
      setDownloadingId(null);
    }
  };

  // Delete document
  const handleDeleteDoc = async (doc) => {
    if (!doc?.id) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${doc.name || doc.id}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    setDeletingId(doc.id);
    setFileActionMsg('');
    try {
      await deleteDocument(doc.id);
      dispatch(removeIngestedDocument(doc.id));
      if (selectedDocDetail?.id === doc.id) {
        setSelectedDocDetail(null);
      }
      dispatch(addAuditLog({
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        actor: 'operator.admin',
        action: 'DOCUMENT_DELETED',
        endpoint: `/api/documents/${doc.id}`,
        riskTier: 'LOW',
        model: 'Spring AI Platform Gateway',
        tokens: 0,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        details: `Document "${doc.name || doc.id}" removed from local repository and database.`,
      }));
    } catch (err) {
      console.error('Delete document failed:', err);
      setFileActionMsg(`Could not delete document: ${err.message}`);
      setTimeout(() => setFileActionMsg(''), 4500);
    } finally {
      setDeletingId(null);
    }
  };

  // Simulations
  const simulate = (type) => {
    setSimulating(true);
    setTimeout(() => {
      const doc = {
        id: `DOC-${Math.floor(9200 + Math.random() * 800)}`,
        name: type === 'invoice' ? 'SUPPLIER-INV-2026.pdf' : 'LOGISTICS-WAYBILL-NE.pdf',
        source: type === 'invoice' ? 'Direct Upload (Operator)' : 'Kafka: intake.files.topic',
        type: type === 'invoice' ? 'Vendor Invoice' : 'Bill of Lading',
        status: 'PROCESSED',
        uploadedBy: 'operator@org.com',
        size: '1.8 MB',
        time: 'Just now',
        confidence: '97%',
      };
      dispatch(addIngestedDocument(doc));
      dispatch(addAuditLog({
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        actor: 'bip-ingestion.gateway',
        action: 'DOCUMENT_INGESTED',
        endpoint: '/api/documents/intake',
        riskTier: 'LOW',
        model: 'Spring AI / Claude-3.5-Sonnet',
        tokens: 1620,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        details: `Autonomous validation passed for ${doc.name}. Fields extracted with 97% avg confidence.`,
      }));
      setSimulating(false);
    }, 700);
  };

  // Filtered documents
  const filteredDocuments = reduxDocuments.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypeFilter === 'ALL' || doc.type.toLowerCase().includes(selectedTypeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-tag">Operations · Document Intake [OPS-1]</div>
          <h2>Intelligent Document Ingestion Pipeline</h2>
          <p>
            High-volume enterprise documents (invoices, contracts, freight bills) are ingested from multiple sources, 
            parsed via Apache Tika, structured via Spring AI, and validated through a Drools rule gateway before autonomous settlement.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => simulate('freight')} disabled={simulating}>
            <Server size={13} /> Simulate Stream
          </button>

          <button className="btn btn-ghost btn-sm" onClick={() => simulate('invoice')} disabled={simulating}>
            <FileSpreadsheet size={13} /> Sample Invoice
          </button>

          <button
            className="btn btn-solid btn-sm"
            onClick={() => setIsUploadModalOpen(true)}
            style={{ background: 'var(--brand-primary, #2563eb)', color: '#fff', fontWeight: 600 }}
          >
            <UploadCloud size={14} /> Upload Document
          </button>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="card-header">
          <div className="card-title">Automation Pipeline Architecture</div>
          <span className="badge">Spring AI + Apache Tika + Camunda 8</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-hover)', borderRadius: 8, border: '1px solid var(--border-default)', position: 'relative' }}>
              <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>{step.n}</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>{step.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents Table Card */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>
              Active Storage Vault
            </div>
            <div className="card-title" style={{ marginBottom: 0 }}>Ingested Enterprise Documents</div>
          </div>

          {/* Search, Filter, Refresh Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '6px 10px 6px 28px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  width: 170,
                }}
              />
            </div>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid var(--border-default)',
                background: 'var(--bg-main)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="ALL">All Types</option>
              <option value="Invoice">Invoices</option>
              <option value="Lading">Bills of Lading</option>
              <option value="Contract">Contracts</option>
              <option value="Customs">Customs</option>
            </select>

            <button
              className="btn btn-ghost btn-sm"
              onClick={handleRefreshFromBackend}
              title="Refresh document records"
              style={{ padding: '6px 10px' }}
            >
              <RefreshCw size={13} />
            </button>

            <span className="badge">{filteredDocuments.length} Records</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Document ID</th>
                <th>File Name</th>
                <th>Source</th>
                <th>Type</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                    No documents found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} style={{ cursor: 'pointer' }} onClick={() => handleInspectDocument(doc)}>
                    <td className="mono" style={{ fontWeight: 700, color: 'var(--brand-primary, #2563eb)' }}>
                      {doc.id}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText size={14} color="var(--text-secondary)" />
                        <span>{doc.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{doc.source}</td>
                    <td><span className="badge" style={{ fontSize: 11 }}>{doc.type}</span></td>
                    <td className="mono" style={{ fontWeight: 600 }}>{doc.confidence}</td>
                    <td>
                      {doc.status === 'PROCESSED'
                        ? <span className="badge success">Auto-Approved</span>
                        : <span className="badge danger">In Exception Queue</span>
                      }
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }} className="mono">{doc.time}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px 8px', fontSize: 11, marginRight: 4 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspectDocument(doc);
                        }}
                      >
                        <Eye size={12} /> Inspect
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px 8px', fontSize: 11, marginRight: 4 }}
                        disabled={downloadingId === doc.id}
                        title="Download / View original file"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadOriginal(doc);
                        }}
                      >
                        <Download size={12} /> {downloadingId === doc.id ? 'Loading...' : 'File'}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px 8px', fontSize: 11, color: '#dc2626' }}
                        disabled={deletingId === doc.id}
                        title="Delete document"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDoc(doc);
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REAL DOCUMENT UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => !isUploading && setIsUploadModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-elevated, #ffffff)',
              borderRadius: 12,
              border: '1px solid var(--border-default)',
              maxWidth: 520,
              width: '100%',
              padding: 24,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Upload Enterprise Document</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                  Autonomous intake with OCR text extraction and schema validation.
                </p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={isUploading}
                style={{ padding: 6, borderRadius: 6 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Error & Success Messages */}
            {uploadError && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#dc2626', fontSize: 12.5, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={15} />
                <span>{uploadError}</span>
              </div>
            )}
            {uploadSuccess && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.25)', color: '#16a34a', fontSize: 12.5, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={15} />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRealUpload}>
              {/* Dropzone File Input */}
              <div
                style={{
                  border: '2px dashed var(--border-default)',
                  borderRadius: 10,
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: selectedFile ? 'var(--bg-hover)' : 'var(--bg-main)',
                  cursor: 'pointer',
                  marginBottom: 16,
                  transition: 'all 0.2s',
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                      setUploadError('');
                    }
                  }}
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg,.csv,.txt"
                />

                {selectedFile ? (
                  <div>
                    <FileCheck2 size={36} color="var(--brand-primary, #2563eb)" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedFile.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · {selectedFile.type || 'Document'}
                    </div>
                    <span className="badge success" style={{ marginTop: 8 }}>File Selected</span>
                  </div>
                ) : (
                  <div>
                    <UploadCloud size={36} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>Click or Drag Document Here</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      Supports PDF, DOCX, XLSX, Images, CSV (Up to 50MB)
                    </div>
                  </div>
                )}
              </div>

              {/* Document Type Selector */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                  Document Category
                </label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                  }}
                >
                  {DOCUMENT_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>{dt.label}</option>
                  ))}
                </select>
              </div>

              {/* Source Selector */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                  Ingestion Source Channel
                </label>
                <select
                  value={uploadSource}
                  onChange={(e) => setUploadSource(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                  }}
                >
                  {SOURCES.map((src) => (
                    <option key={src.value} value={src.value}>{src.label}</option>
                  ))}
                </select>
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, color: 'var(--text-secondary)' }}>
                    <span>Extracting & Validating...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--brand-primary, #2563eb)', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-solid btn-sm"
                  disabled={isUploading || !selectedFile}
                  style={{ background: 'var(--brand-primary, #2563eb)', color: '#fff', fontWeight: 600, minWidth: 120 }}
                >
                  {isUploading ? 'Processing...' : 'Ingest Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT INSPECTOR MODAL */}
      {selectedDocDetail && (() => {
        const rawConf = parseFloat(String(selectedDocDetail.confidence || '0').replace('%', ''));
        const confScore = isNaN(rawConf) ? 0 : rawConf;
        const isSuccessStatus = selectedDocDetail.status === 'PROCESSED';
        const confColor = confScore >= 85 ? '#16a34a' : confScore >= 50 ? '#d97706' : '#dc2626';

        const fields = selectedDocDetail.extractedFields || selectedDocDetail.remoteDetails?.extractedFields || {};
        const confidences = selectedDocDetail.fieldConfidences || selectedDocDetail.remoteDetails?.fieldConfidences || {};
        const hasFields = Object.keys(fields).length > 0;
        const ocrText = selectedDocDetail.extractedText || selectedDocDetail.remoteDetails?.extractedText || '';

        const rawDetails = selectedDocDetail.remoteDetails || {
          id: selectedDocDetail.id,
          name: selectedDocDetail.name,
          contentType: selectedDocDetail.contentType || selectedDocDetail.mimeType,
          size: selectedDocDetail.size,
          type: selectedDocDetail.type,
          source: selectedDocDetail.source,
          uploadedBy: selectedDocDetail.uploadedBy,
          status: selectedDocDetail.status,
          flagReason: selectedDocDetail.flagReason,
          overallConfidence: confScore,
          time: selectedDocDetail.time,
        };

        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 16,
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setSelectedDocDetail(null)}
          >
            <div
              style={{
                background: 'var(--bg-elevated, #ffffff)',
                borderRadius: 14,
                border: '1px solid var(--border-default)',
                maxWidth: 620,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: 24,
                boxShadow: '0 24px 48px rgba(0,0,0,0.22)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: isSuccessStatus ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      border: `1px solid ${isSuccessStatus ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <FileText size={22} color={isSuccessStatus ? '#16a34a' : '#dc2626'} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span
                        className="mono"
                        style={{
                          fontSize: 11,
                          color: 'var(--brand-primary, #2563eb)',
                          background: 'rgba(37, 99, 235, 0.08)',
                          padding: '2px 8px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          userSelect: 'all',
                        }}
                        title="Click to copy document ID"
                        onClick={() => {
                          if (selectedDocDetail?.id) {
                            navigator.clipboard?.writeText(selectedDocDetail.id);
                            setCopiedId(true);
                            setTimeout(() => setCopiedId(false), 2000);
                          }
                        }}
                      >
                        {selectedDocDetail.id}
                        {copiedId ? <Check size={11} color="#16a34a" /> : <Copy size={11} />}
                      </span>
                      {copiedId && (
                        <span style={{ fontSize: 10.5, color: '#16a34a', fontWeight: 600 }}>Copied!</span>
                      )}
                    </div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {selectedDocDetail.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                      {selectedDocDetail.size && (
                        <span>{typeof selectedDocDetail.size === 'number' ? `${(selectedDocDetail.size / 1024).toFixed(1)} KB` : selectedDocDetail.size}</span>
                      )}
                      {(selectedDocDetail.contentType || selectedDocDetail.mimeType) && (
                        <>
                          <span>•</span>
                          <span className="mono" style={{ fontSize: 11 }}>{selectedDocDetail.contentType || selectedDocDetail.mimeType}</span>
                        </>
                      )}
                      {selectedDocDetail.uploadedBy && (
                        <>
                          <span>•</span>
                          <span>{selectedDocDetail.uploadedBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSelectedDocDetail(null)}
                  style={{ padding: 6, borderRadius: 6 }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* 4 Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
                <div style={{ padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Document Category</div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginTop: 3, color: 'var(--text-primary)' }}>
                    {selectedDocDetail.type || 'Vendor Invoice'}
                  </div>
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Source Gateway</div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginTop: 3, color: 'var(--text-primary)' }}>
                    {selectedDocDetail.source || 'Direct Upload'}
                  </div>
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Confidence Score</div>
                  <div className="mono" style={{ fontWeight: 700, fontSize: 15, marginTop: 3, color: confColor }}>
                    {confScore}%
                  </div>
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Pipeline Status</div>
                  <div style={{ marginTop: 4 }}>
                    {isSuccessStatus ? (
                      <span className="badge success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, padding: '3px 8px' }}>
                        <CheckCircle2 size={12} /> Auto-Approved
                      </span>
                    ) : (
                      <span className="badge danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, padding: '3px 8px' }}>
                        <AlertTriangle size={12} /> Exception Review
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Exception Warning if flagged */}
              {selectedDocDetail.flagReason && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#dc2626',
                    fontSize: 12.5,
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>Exception Reason</div>
                    <div style={{ color: 'var(--text-primary)', fontSize: 12, lineHeight: 1.4 }}>
                      {selectedDocDetail.flagReason}
                    </div>
                  </div>
                </div>
              )}

              {/* Extracted Fields Table OR Empty State */}
              {hasFields ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Extracted Schema Attributes
                  </div>
                  <div style={{ borderRadius: 8, border: '1px solid var(--border-default)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-default)', textAlign: 'left' }}>
                          <th style={{ padding: '8px 12px', fontWeight: 600 }}>Attribute</th>
                          <th style={{ padding: '8px 12px', fontWeight: 600 }}>Extracted Value</th>
                          <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(fields).map(([key, val]) => {
                          const score = confidences[key];
                          const scoreNum = typeof score === 'number' ? score : parseFloat(score) || 0;
                          return (
                            <tr key={key} style={{ borderBottom: '1px solid var(--border-default)' }}>
                              <td className="mono" style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{key}</td>
                              <td style={{ padding: '8px 12px', fontWeight: 600 }}>{String(val)}</td>
                              <td className="mono" style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: scoreNum >= 90 ? '#16a34a' : '#d97706' }}>
                                {score != null ? `${scoreNum}%` : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '20px 16px',
                    borderRadius: 8,
                    border: '1px dashed var(--border-default)',
                    background: 'var(--bg-hover)',
                    textAlign: 'center',
                    marginBottom: 16,
                  }}
                >
                  <FileText size={26} color="var(--text-muted)" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    No Structured Invoice Fields Detected
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 440, margin: '4px auto 0', lineHeight: 1.4 }}>
                    Standard invoice fields (Invoice #, Vendor, Total, Date) were not identified. Use <strong>View Original File</strong> below to inspect the document.
                  </div>
                </div>
              )}

              {/* OCR Parsed Text Preview (Collapsible) */}
              {ocrText && ocrText.trim().length > 0 && (
                <details style={{ marginBottom: 14, background: 'var(--bg-hover)', borderRadius: 8, border: '1px solid var(--border-default)', padding: '8px 12px' }}>
                  <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Extracted Text Preview ({ocrText.length} characters)
                  </summary>
                  <pre
                    style={{
                      margin: '8px 0 0',
                      padding: 10,
                      background: 'var(--bg-main)',
                      borderRadius: 6,
                      fontSize: 11.5,
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-wrap',
                      maxHeight: 140,
                      overflowY: 'auto',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    {ocrText}
                  </pre>
                </details>
              )}

              {/* Technical JSON Payload (Collapsed by default) */}
              <details style={{ marginBottom: 16, background: 'var(--bg-hover)', borderRadius: 8, border: '1px solid var(--border-default)', padding: '8px 12px' }}>
                <summary style={{ cursor: 'pointer', fontSize: 11.5, fontWeight: 500, color: 'var(--text-muted)' }}>
                  Technical Schema & Metadata (JSON)
                </summary>
                <pre
                  className="mono"
                  style={{
                    background: 'var(--bg-main)',
                    padding: 10,
                    borderRadius: 6,
                    fontSize: 11,
                    overflowX: 'auto',
                    marginTop: 8,
                    border: '1px solid var(--border-default)',
                    maxHeight: 120,
                  }}
                >
                  {JSON.stringify(rawDetails, null, 2)}
                </pre>
              </details>

              {/* Status / Notice Alert if any */}
              {fileActionMsg && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#dc2626',
                    fontSize: 12,
                    marginBottom: 14,
                  }}
                >
                  {fileActionMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 18, borderTop: '1px solid var(--border-default)', paddingTop: 14 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-solid btn-sm"
                    style={{ background: 'var(--brand-primary, #2563eb)', color: '#fff', fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px' }}
                    disabled={downloadingId === selectedDocDetail.id}
                    onClick={() => handleViewOriginal(selectedDocDetail)}
                  >
                    <ExternalLink size={13} /> {downloadingId === selectedDocDetail.id ? 'Loading...' : 'View Original File'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px' }}
                    disabled={downloadingId === selectedDocDetail.id}
                    onClick={() => handleDownloadOriginal(selectedDocDetail)}
                  >
                    <Download size={13} /> Download
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 12.5, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px' }}
                    disabled={deletingId === selectedDocDetail.id}
                    title="Delete this document permanently"
                    onClick={() => handleDeleteDoc(selectedDocDetail)}
                  >
                    <Trash2 size={13} /> {deletingId === selectedDocDetail.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSelectedDocDetail(null)}
                  style={{ padding: '7px 16px', fontSize: 12.5 }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
