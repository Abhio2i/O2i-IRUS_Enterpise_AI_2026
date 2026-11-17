import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HrNav } from './HrNav';
import { uploadDocument, verifyDocumentStatus } from '../../store/hrSlice';
import {
  FolderLock, CheckCircle2, Clock, Plus, Download, Search,
  FileText, ShieldCheck, Lock, Eye, X, UploadCloud, FileCheck
} from 'lucide-react';

export const DocumentationPage = () => {
  const dispatch = useDispatch();
  const documentation = useSelector((s) => s.hr.documentation);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    employeeName: '',
    empId: '',
    category: 'Legal & IP Agreements',
    documentType: 'Non-Disclosure Agreement (NDA)',
    documentName: '',
    isConfidential: true,
  });

  const categories = [
    'ALL',
    'Legal & IP Agreements',
    'Identity & Tax',
    'Educational Credentials',
    'Professional Certifications',
    'Background Checks',
  ];

  const filtered = documentation.filter((doc) => {
    const matchCat = filterCat === 'ALL' || doc.category === filterCat;
    const matchSearch =
      doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!uploadForm.employeeName || !uploadForm.documentName) return;

    const newDoc = {
      id: `DOC-HR-${Math.floor(308 + Math.random() * 50)}`,
      empId: uploadForm.empId || 'EMP-014',
      employeeName: uploadForm.employeeName,
      category: uploadForm.category,
      documentName: uploadForm.documentName.endsWith('.pdf') ? uploadForm.documentName : `${uploadForm.documentName}.pdf`,
      documentType: uploadForm.documentType,
      fileSize: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().substring(0, 10),
      status: 'VERIFIED',
      verifiedBy: 'Automated OCR & Legal Desk',
      expiresAt: '2028-12-31',
      isConfidential: uploadForm.isConfidential,
    };

    dispatch(uploadDocument(newDoc));
    setShowUploadModal(false);
    setUploadForm({
      employeeName: '',
      empId: '',
      category: 'Legal & IP Agreements',
      documentType: 'Non-Disclosure Agreement (NDA)',
      documentName: '',
      isConfidential: true,
    });
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      <HrNav />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <FolderLock size={20} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Employee Documentation & Compliance Vault
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Encrypted talent dossier repository: IP assignments, sovereign tax certificates, academic degree apostilles, background checks, and compliance proofs.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 8,
            background: '#10b981',
            color: '#052e16',
            fontWeight: 700,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
          }}
        >
          <UploadCloud size={16} />
          <span>Upload & Verify Document</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Vaulted Documents</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>{documentation.length} Files</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>100% Cryptographically Intact</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Audit Readiness</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>100% Ready</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>EU AI Act & ISO-27001 Prepared</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Confidential IP Deeds</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
            {documentation.filter((d) => d.isConfidential).length} Files Encrypted
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Sovereign HSM Key Access Only</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Expired / Flagged Documents</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>0 Files</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Zero Compliance Breaches</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '8px 14px', width: '340px' }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search documents, employee names, or types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: filterCat === cat ? '#10b981' : 'var(--bg-elevated)',
                color: filterCat === cat ? '#052e16' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Document & Filename</th>
                <th style={{ padding: '14px 18px' }}>Employee & ID</th>
                <th style={{ padding: '14px 18px' }}>Category</th>
                <th style={{ padding: '14px 18px' }}>File Size & Date</th>
                <th style={{ padding: '14px 18px' }}>Verification Audit</th>
                <th style={{ padding: '14px 18px' }}>Validity</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const isVerified = doc.status === 'VERIFIED';

                return (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText size={14} color="#10b981" />
                        <span>{doc.documentType}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {doc.isConfidential && <Lock size={11} color="#f59e0b" />}
                        <span>{doc.documentName}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.employeeName}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{doc.empId}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{doc.category}</span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{doc.fileSize}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Uploaded {doc.uploadDate}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ color: '#10b981', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={12} />
                        <span>{doc.status}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{doc.verifiedBy}</div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{doc.expiresAt}</span>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => alert(`Document ${doc.documentName} decrypted and downloaded.`)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '6px 10px',
                            borderRadius: 6,
                            background: 'var(--bg-surface)',
                            color: 'var(--text-primary)',
                            fontSize: 11.5,
                            border: '1px solid var(--border-default)',
                            cursor: 'pointer',
                          }}
                        >
                          <Download size={12} />
                          <span>Download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 12,
              width: '100%',
              maxWidth: 500,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FolderLock size={18} color="#10b981" />
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Vault New Employee Document
                </h2>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpload}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Employee Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Aris Thorne"
                    value={uploadForm.employeeName}
                    onChange={(e) => setUploadForm({ ...uploadForm, employeeName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-014"
                    value={uploadForm.empId}
                    onChange={(e) => setUploadForm({ ...uploadForm, empId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Vault Category</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                >
                  <option value="Legal & IP Agreements">Legal & IP Agreements</option>
                  <option value="Identity & Tax">Identity & Tax</option>
                  <option value="Educational Credentials">Educational Credentials</option>
                  <option value="Professional Certifications">Professional Certifications</option>
                  <option value="Background Checks">Background Checks</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Document Class / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Intellectual Property & Patent Assignment Deed"
                  value={uploadForm.documentType}
                  onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>File Attachment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aris_Thorne_IP_Assignment_Deed_Signed.pdf"
                  value={uploadForm.documentName}
                  onChange={(e) => setUploadForm({ ...uploadForm, documentName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontSize: 12.5 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: 6, background: '#10b981', color: '#052e16', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 12.5 }}
                >
                  Encrypt & Vault Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentationPage;
