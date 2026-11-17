import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { syncBrochure, syncCatalog } from '../../store/marketingSlice';
import {
  FileText, RefreshCw, CheckCircle, AlertTriangle, Clock, Download,
  Package, Upload, Trash2, Eye, Plus, X, AlertCircle, Folder, FolderPlus,
  Files, Layers, Filter, Image as ImageIcon, Loader2, BookOpen
} from 'lucide-react';
import {
  listMarketingAssets,
  listMarketingAssetFolders,
  uploadMarketingAsset,
  uploadMarketingAssetsBulk,
  previewMarketingAsset,
  downloadMarketingAsset,
  changeMarketingAssetType,
  deleteMarketingAsset,
} from '../../services/apiClient';

const SYNC_STATUS = {
  SYNCED:        { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)',  label: 'SYNCED' },
  OUT_OF_SYNC:   { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  label: 'OUT OF SYNC' },
  NOT_PUBLISHED: { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', label: 'NOT PUBLISHED' },
};

const CAT_STATUS = {
  AUTO_SYNCED:    { color: '#22c55e', label: 'Auto-Synced' },
  PENDING_REVIEW: { color: '#f59e0b', label: 'Pending Review' },
};

const STANDY_STATUS = {
  APPROVED:  { color: '#22c55e', label: 'APPROVED' },
  IN_REVIEW: { color: '#f59e0b', label: 'IN REVIEW' },
  DRAFT:     { color: '#6366f1', label: 'DRAFT' },
};

// In-memory cache for asset blob preview URLs
const assetThumbnailCache = new Map();

const AssetThumbnail = ({ asset, onPreview }) => {
  const [thumbUrl, setThumbUrl] = useState(() => (asset?.id ? assetThumbnailCache.get(asset.id) : null) || null);
  const [loading, setLoading] = useState(false);

  const isImage = Boolean(
    (asset?.contentType && asset.contentType.startsWith('image/')) ||
    /\.(png|jpe?g|webp|gif|svg|bmp|ico)$/i.test(asset?.name || asset?.filename || '')
  );

  useEffect(() => {
    if (!asset?.id || !isImage) return;

    if (assetThumbnailCache.has(asset.id)) {
      setThumbUrl(assetThumbnailCache.get(asset.id));
      return;
    }

    let active = true;
    setLoading(true);

    previewMarketingAsset(asset.id)
      .then(({ blobUrl }) => {
        assetThumbnailCache.set(asset.id, blobUrl);
        if (active) {
          setThumbUrl(blobUrl);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [asset?.id, isImage]);

  const isPdf = Boolean(
    asset?.contentType === 'application/pdf' ||
    /\.pdf$/i.test(asset?.name || asset?.filename || '')
  );

  const accentColor = asset?.type === 'CATALOG' ? '#10b981' : '#2563eb';

  return (
    <div
      onClick={() => onPreview && onPreview(asset.id)}
      title="Click to preview file"
      style={{
        width: 62,
        height: 62,
        minWidth: 62,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1.5px solid var(--border-subtle, rgba(0,0,0,0.1))',
        background: isImage ? '#f8fafc' : (asset?.type === 'CATALOG' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(37, 99, 235, 0.08)'),
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      }}
    >
      {isImage && thumbUrl ? (
        <img
          src={thumbUrl}
          alt={asset?.name || 'Collateral image'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : isImage && loading ? (
        <Loader2 size={18} className="spin" color="var(--text-muted)" />
      ) : isImage ? (
        <ImageIcon size={24} color={accentColor} />
      ) : isPdf ? (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <FileText size={22} color="#dc2626" />
          <span style={{ fontSize: 9, fontWeight: 800, color: '#dc2626', marginTop: 1, letterSpacing: 0.5 }}>PDF</span>
        </div>
      ) : (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <FileText size={22} color={accentColor} />
          <span style={{ fontSize: 8.5, fontWeight: 800, color: accentColor, marginTop: 1, letterSpacing: 0.5 }}>DOC</span>
        </div>
      )}
    </div>
  );
};

const tabs = ['Brochures', 'Catalogs', 'Standies'];

export const BrochuresCatalogPage = () => {
  const dispatch = useDispatch();
  const reduxBrochures = useSelector(s => s.marketing.brochures);
  const reduxCatalogs = useSelector(s => s.marketing.catalogs);
  const standies = useSelector(s => s.marketing.standies);

  const [activeTab, setActiveTab] = useState('Brochures');

  // Backend Marketing Assets & Folders state
  const [backendAssets, setBackendAssets] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('ALL');
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [actionNotice, setActionNotice] = useState('');
  const [actionError, setActionError] = useState('');

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState('single'); // 'single' | 'bulk'
  const [uploadFile, setUploadFile] = useState(null);
  const [bulkFiles, setBulkFiles] = useState([]);
  const [uploadType, setUploadType] = useState('BROCHURE');
  const [uploadFolder, setUploadFolder] = useState('General');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const bulkFileInputRef = useRef(null);

  // Load assets and folders from backend
  const fetchAssetsAndFolders = async () => {
    setLoadingAssets(true);
    try {
      const [assetsData, foldersData] = await Promise.all([
        listMarketingAssets().catch(err => {
          console.warn('Failed to load assets:', err.message);
          return [];
        }),
        listMarketingAssetFolders().catch(err => {
          console.warn('Failed to load folders:', err.message);
          return [];
        }),
      ]);

      setBackendAssets(Array.isArray(assetsData) ? assetsData : []);
      
      // Compute union of inferred folders + API folders
      const assetFolders = (Array.isArray(assetsData) ? assetsData : [])
        .map(a => a.folder || 'General')
        .filter(Boolean);
      const allUniqueFolders = Array.from(new Set([...(Array.isArray(foldersData) ? foldersData : []), ...assetFolders, 'General'])).sort();
      setFolders(allUniqueFolders);
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    fetchAssetsAndFolders();
  }, []);

  const showNotice = (msg, isErr = false) => {
    if (isErr) {
      setActionError(msg);
      setTimeout(() => setActionError(''), 4500);
    } else {
      setActionNotice(msg);
      setTimeout(() => setActionNotice(''), 4500);
    }
  };

  // Upload handler (supports single and bulk up to 50 files)
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const effectiveFolder = uploadFolder.trim() || 'General';

    if (uploadMode === 'single') {
      if (!uploadFile) {
        showNotice('Please select a file to upload.', true);
        return;
      }
      setIsUploading(true);
      try {
        const created = await uploadMarketingAsset({
          file: uploadFile,
          type: uploadType,
          folder: effectiveFolder,
        });
        setBackendAssets(prev => [created, ...prev]);
        if (!folders.includes(effectiveFolder)) {
          setFolders(prev => Array.from(new Set([...prev, effectiveFolder])).sort());
        }
        setSelectedFolder(effectiveFolder);
        setIsUploadOpen(false);
        setUploadFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        showNotice(`Successfully uploaded ${uploadType.toLowerCase()} to folder "${effectiveFolder}": "${created.name || uploadFile.name}".`);
      } catch (err) {
        showNotice(err.message || 'Upload failed.', true);
      } finally {
        setIsUploading(false);
      }
    } else {
      // Bulk upload
      if (!bulkFiles.length) {
        showNotice('Please select at least 1 file for bulk upload.', true);
        return;
      }
      if (bulkFiles.length > 50) {
        showNotice('A maximum of 50 files can be uploaded at once.', true);
        return;
      }
      setIsUploading(true);
      try {
        const createdList = await uploadMarketingAssetsBulk({
          files: bulkFiles,
          type: uploadType,
          folder: effectiveFolder,
        });
        setBackendAssets(prev => [...(Array.isArray(createdList) ? createdList : [createdList]), ...prev]);
        if (!folders.includes(effectiveFolder)) {
          setFolders(prev => Array.from(new Set([...prev, effectiveFolder])).sort());
        }
        setSelectedFolder(effectiveFolder);
        setIsUploadOpen(false);
        setBulkFiles([]);
        if (bulkFileInputRef.current) bulkFileInputRef.current.value = '';
        showNotice(`Successfully bulk uploaded ${bulkFiles.length} ${uploadType.toLowerCase()} files to folder "${effectiveFolder}".`);
      } catch (err) {
        showNotice(err.message || 'Bulk upload failed.', true);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Preview Asset
  const handlePreview = async (assetId) => {
    try {
      const { blobUrl } = await previewMarketingAsset(assetId);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      showNotice(`Preview failed: ${err.message}`, true);
    }
  };

  // Download Asset
  const handleDownload = async (assetId, name) => {
    try {
      await downloadMarketingAsset(assetId, name || 'asset');
    } catch (err) {
      showNotice(`Download failed: ${err.message}`, true);
    }
  };

  // Change Type
  const handleChangeType = async (assetId, currentType) => {
    const nextType = currentType === 'BROCHURE' ? 'CATALOG' : 'BROCHURE';
    try {
      const updated = await changeMarketingAssetType(assetId, nextType);
      setBackendAssets(prev => prev.map(a => (a.id === assetId ? { ...a, type: updated.type || nextType } : a)));
      showNotice(`Asset converted to ${nextType}.`);
    } catch (err) {
      showNotice(`Change type failed: ${err.message}`, true);
    }
  };

  // Delete Asset
  const handleDelete = async (assetId, name) => {
    if (!window.confirm(`Permanently delete "${name || assetId}"?`)) return;
    try {
      await deleteMarketingAsset(assetId);
      setBackendAssets(prev => prev.filter(a => a.id !== assetId));
      showNotice(`Deleted "${name || assetId}".`);
    } catch (err) {
      showNotice(`Delete failed: ${err.message}`, true);
    }
  };

  // Filter backend assets by activeTab and selectedFolder
  const tabFilteredAssets = backendAssets.filter(a => {
    if (activeTab === 'Brochures' && a.type !== 'BROCHURE') return false;
    if (activeTab === 'Catalogs' && a.type !== 'CATALOG') return false;
    return true;
  });

  const displayedAssets = tabFilteredAssets.filter(a => {
    if (selectedFolder === 'ALL') return true;
    return (a.folder || 'General') === selectedFolder;
  });

  const backendBrochures = backendAssets.filter(a => a.type === 'BROCHURE');
  const backendCatalogs = backendAssets.filter(a => a.type === 'CATALOG');

  const draftStandies = standies.filter(s => s.status === 'DRAFT').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-tag">Marketing · Collateral Folders & Asset Manager</div>
          <h2>Brochures, Catalogs & Asset Folders</h2>
          <p>
            Organize assets into named folders (<code>/api/marketing/assets/folders</code>) with single and bulk uploads (up to 50 files via <code>/api/marketing/assets/bulk</code>).
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={fetchAssetsAndFolders} disabled={loadingAssets}>
            <RefreshCw size={13} className={loadingAssets ? 'spin' : ''} /> Refresh
          </button>
          <button
            className="btn btn-solid btn-sm"
            style={{ background: 'var(--brand-primary, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => {
              setUploadType(activeTab === 'Catalogs' ? 'CATALOG' : 'BROCHURE');
              setUploadMode('single');
              setIsUploadOpen(true);
            }}
          >
            <Plus size={13} /> Upload File
          </button>
          <button
            className="btn btn-solid btn-sm"
            style={{ background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => {
              setUploadType(activeTab === 'Catalogs' ? 'CATALOG' : 'BROCHURE');
              setUploadMode('bulk');
              setIsUploadOpen(true);
            }}
          >
            <Files size={13} /> Bulk Upload (up to 50)
          </button>
        </div>
      </div>

      {actionNotice && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#16a34a', fontSize: 12.5, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={14} /> {actionNotice}
        </div>
      )}

      {actionError && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626', fontSize: 12.5, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={14} /> {actionError}
        </div>
      )}

      {/* Summary Strip */}
      <div className="stats-grid cols-4" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">Brochures (Live + Pre-set)</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{backendBrochures.length + reduxBrochures.length}</div>
          <div className="stat-desc">{backendBrochures.length} files in backend</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Catalogs (Live + Pre-set)</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{backendCatalogs.length + reduxCatalogs.length}</div>
          <div className="stat-desc">{backendCatalogs.length} files in backend</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Asset Folders</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{folders.length}</div>
          <div className="stat-desc">{folders.slice(0, 3).join(', ')}{folders.length > 3 ? '...' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Collateral Files</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{backendAssets.length}</div>
          <div className="stat-desc">Across all tenant folders</div>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)', marginBottom: 16 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--text-primary)' : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s',
            }}
          >
            {tab}
            {tab === 'Brochures' && backendBrochures.length > 0 && <span style={{ marginLeft: 6, background: '#2563eb', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>{backendBrochures.length} Live</span>}
            {tab === 'Catalogs' && backendCatalogs.length > 0 && <span style={{ marginLeft: 6, background: '#2563eb', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>{backendCatalogs.length} Live</span>}
          </button>
        ))}
      </div>

      {/* ── FOLDER MANAGER BAR (for Brochures & Catalogs) ── */}
      {activeTab !== 'Standies' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 18,
          scrollbarWidth: 'thin'
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginRight: 4 }}>
            <Filter size={12} /> Folder:
          </span>

          <button
            className={`btn btn-xs ${selectedFolder === 'ALL' ? 'btn-solid' : 'btn-ghost'}`}
            style={{ borderRadius: 14, padding: '4px 10px', fontSize: 11.5 }}
            onClick={() => setSelectedFolder('ALL')}
          >
            <Layers size={11} /> All Folders ({tabFilteredAssets.length})
          </button>

          {folders.map(fName => {
            const count = tabFilteredAssets.filter(a => (a.folder || 'General') === fName).length;
            const isSelected = selectedFolder === fName;
            return (
              <button
                key={fName}
                className={`btn btn-xs ${isSelected ? 'btn-solid' : 'btn-ghost'}`}
                style={{
                  borderRadius: 14, padding: '4px 10px', fontSize: 11.5,
                  background: isSelected ? 'var(--brand-primary, #2563eb)' : 'var(--bg-hover)',
                  color: isSelected ? '#fff' : 'var(--text-primary)',
                  border: '1px solid var(--border-default)',
                }}
                onClick={() => setSelectedFolder(fName)}
              >
                <Folder size={11} /> {fName} ({count})
              </button>
            );
          })}

          <button
            className="btn btn-xs btn-ghost"
            style={{ borderRadius: 14, padding: '4px 8px', fontSize: 11, color: 'var(--brand-primary, #2563eb)' }}
            onClick={() => {
              setUploadMode('bulk');
              setUploadFolder('');
              setIsUploadOpen(true);
            }}
            title="Upload into a new folder"
          >
            <FolderPlus size={11} /> + New Folder Upload
          </button>
        </div>
      )}

      {/* ── BROCHURES TAB ─────────────────────────── */}
      {activeTab === 'Brochures' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Uploaded Backend Brochure Assets */}
          {displayedAssets.map(asset => (
            <div key={asset.id} className="card" style={{ borderLeft: '4px solid #2563eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <AssetThumbnail asset={asset} onPreview={handlePreview} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--brand-primary, #2563eb)', background: 'rgba(37, 99, 235, 0.08)', padding: '2px 6px', borderRadius: 4 }}>{asset.id}</span>
                      <span className="badge" style={{ fontSize: 10 }}>BROCHURE</span>
                      <span
                        className="badge"
                        style={{ fontSize: 10, background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => setSelectedFolder(asset.folder || 'General')}
                        title={`Filter by folder: ${asset.folder || 'General'}`}
                      >
                        <Folder size={10} /> {asset.folder || 'General'}
                      </span>
                      <span className="badge success" style={{ fontSize: 9 }}>ONLINE</span>
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{asset.name || asset.filename || 'Uploaded Brochure'}</h4>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                      <span>{asset.size ? `${(asset.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF'}</span>
                      <span>{asset.contentType || 'application/pdf'}</span>
                      <span>Uploaded {asset.uploadedAt || asset.createdAt ? new Date(asset.uploadedAt || asset.createdAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
                  <button className="btn btn-sm btn-ghost" onClick={() => handlePreview(asset.id)} title="Preview File">
                    <Eye size={12} /> Preview
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => handleDownload(asset.id, asset.name)} title="Download File">
                    <Download size={12} /> Download
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => handleChangeType(asset.id, 'BROCHURE')} title="Convert to Catalog">
                    Move to Catalog
                  </button>
                  <button className="btn btn-sm btn-ghost" style={{ color: '#dc2626' }} onClick={() => handleDelete(asset.id, asset.name)} title="Delete Asset">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {displayedAssets.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-hover)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 13 }}>
              {selectedFolder !== 'ALL'
                ? `No brochures found in folder "${selectedFolder}".`
                : 'No backend brochures uploaded yet. Click "Upload File" or "Bulk Upload" to add collateral.'}
            </div>
          )}

          {/* Seeded Brochures */}
          {selectedFolder === 'ALL' && reduxBrochures.map(b => {
            const ss = SYNC_STATUS[b.syncStatus] || SYNC_STATUS.NOT_PUBLISHED;
            return (
              <div key={b.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: 62,
                        height: 62,
                        minWidth: 62,
                        borderRadius: 12,
                        border: '1.5px solid var(--border-subtle, rgba(0,0,0,0.1))',
                        background: 'rgba(37, 99, 235, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                      title="Brochure Asset"
                    >
                      <BookOpen size={24} color="#2563eb" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                        <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{b.id}</span>
                        <span className="badge" style={{ fontSize: 10 }}>{b.type}</span>
                        <span className="badge" style={{ fontSize: 10 }}>{b.version}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, borderRadius: 6, padding: '2px 7px' }}>{ss.label}</span>
                        {b.aiSyncEnabled && <span className="badge" style={{ fontSize: 9, color: '#6366f1', background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.25)' }}>AI Sync ON</span>}
                      </div>
                      <h4 style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 5 }}>{b.title}</h4>
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <span>{b.pages} pages · {b.format}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Download size={11} /> {b.downloadCount.toLocaleString()} downloads</span>
                        <span>Updated {b.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    {b.syncStatus === 'OUT_OF_SYNC' ? (
                      <button className="btn btn-sm btn-solid" onClick={() => dispatch(syncBrochure(b.id))}>
                        <RefreshCw size={12} /> Sync Now ({b.pendingChanges} changes)
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-ghost" onClick={() => dispatch(syncBrochure(b.id))}>
                        <RefreshCw size={12} /> Force Re-Sync
                      </button>
                    )}
                    <button className="btn btn-sm btn-ghost"><FileText size={12} /> View Brochure</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CATALOGS TAB ─────────────────────────── */}
      {activeTab === 'Catalogs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Uploaded Backend Catalog Assets */}
          {displayedAssets.map(asset => (
            <div key={asset.id} className="card" style={{ borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <AssetThumbnail asset={asset} onPreview={handlePreview} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                      <span className="mono" style={{ fontSize: 10, color: '#10b981', background: 'rgba(16, 185, 129, 0.08)', padding: '2px 6px', borderRadius: 4 }}>{asset.id}</span>
                      <span className="badge" style={{ fontSize: 10 }}>CATALOG</span>
                      <span
                        className="badge"
                        style={{ fontSize: 10, background: 'rgba(16, 185, 129, 0.1)', color: '#059669', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => setSelectedFolder(asset.folder || 'General')}
                        title={`Filter by folder: ${asset.folder || 'General'}`}
                      >
                        <Folder size={10} /> {asset.folder || 'General'}
                      </span>
                      <span className="badge success" style={{ fontSize: 9 }}>ONLINE</span>
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{asset.name || asset.filename || 'Product Catalog'}</h4>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                      <span>{asset.size ? `${(asset.size / (1024 * 1024)).toFixed(2)} MB` : 'Document'}</span>
                      <span>{asset.contentType || 'application/pdf'}</span>
                      <span>Uploaded {asset.uploadedAt || asset.createdAt ? new Date(asset.uploadedAt || asset.createdAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
                  <button className="btn btn-sm btn-ghost" onClick={() => handlePreview(asset.id)} title="Preview File">
                    <Eye size={12} /> Preview
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => handleDownload(asset.id, asset.name)} title="Download File">
                    <Download size={12} /> Download
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => handleChangeType(asset.id, 'CATALOG')} title="Convert to Brochure">
                    Move to Brochure
                  </button>
                  <button className="btn btn-sm btn-ghost" style={{ color: '#dc2626' }} onClick={() => handleDelete(asset.id, asset.name)} title="Delete Asset">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {displayedAssets.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-hover)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 13 }}>
              {selectedFolder !== 'ALL'
                ? `No catalogs found in folder "${selectedFolder}".`
                : 'No backend catalogs uploaded yet. Click "Upload File" or "Bulk Upload" to add collateral.'}
            </div>
          )}

          {/* Seeded Catalogs */}
          {selectedFolder === 'ALL' && reduxCatalogs.map(c => {
            const cs = CAT_STATUS[c.status] || CAT_STATUS.PENDING_REVIEW;
            return (
              <div key={c.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: 62,
                        height: 62,
                        minWidth: 62,
                        borderRadius: 12,
                        border: '1.5px solid var(--border-subtle, rgba(0,0,0,0.1))',
                        background: 'rgba(16, 185, 129, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                      title="Catalog Asset"
                    >
                      <Package size={24} color="#10b981" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                        <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.id}</span>
                        <span className="badge" style={{ fontSize: 10 }}>{c.version}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: cs.color, background: cs.color + '15', border: `1px solid ${cs.color}40`, borderRadius: 6, padding: '2px 8px' }}>{cs.label}</span>
                        {c.autoUpdateEnabled && <span className="badge" style={{ fontSize: 9, color: '#22c55e', background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.25)' }}>Auto-Update ON</span>}
                      </div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{c.name}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: '4px 20px', fontSize: 12, color: 'var(--text-secondary)' }}>
                        <span><Package size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />{c.products} products</span>
                        <span><Clock size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Last sync: {c.lastSync}</span>
                        <span><RefreshCw size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Next: {c.nextScheduledSync}</span>
                      </div>
                      {c.changesSinceLastSync > 0 && (
                        <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 6, fontSize: 12, color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <AlertTriangle size={12} /> {c.changesSinceLastSync} pending changes since last sync
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-sm btn-solid" onClick={() => dispatch(syncCatalog(c.id))}>
                      <RefreshCw size={12} /> Sync Catalog
                    </button>
                    {!c.autoUpdateEnabled && (
                      <button className="btn btn-sm btn-ghost"><CheckCircle size={12} /> Approve Changes</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── STANDIES TAB ─────────────────────────── */}
      {activeTab === 'Standies' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {standies.map(s => {
            const ss = STANDY_STATUS[s.status] || STANDY_STATUS.DRAFT;
            return (
              <div key={s.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 7, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: ss.color, background: ss.color + '15', border: `1px solid ${ss.color}40`, borderRadius: 6, padding: '2px 7px' }}>{ss.label}</span>
                      <span className="badge" style={{ fontSize: 10 }}>{s.version}</span>
                    </div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{s.title}</h4>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <div><strong>Dimensions:</strong> {s.dimensions}</div>
                  <div><strong>Target Event:</strong> {s.targetEvent}</div>
                  <div><strong>Print Vendor:</strong> {s.printer}</div>
                  <div><strong>Print Quantity:</strong> {s.quantity} units</div>
                </div>

                {s.notes && (
                  <div style={{ padding: '8px 10px', background: 'var(--bg-hover)', borderRadius: 6, border: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 12 }}>
                    {s.notes}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm btn-ghost" style={{ flex: 1 }}><FileText size={12} /> View Design</button>
                  {s.status !== 'APPROVED' && <button className="btn btn-sm btn-solid" style={{ flex: 1 }}><CheckCircle size={12} /> Approve</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD MODAL (Single + Bulk up to 50 files with Folder assignment) */}
      {isUploadOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 16, backdropFilter: 'blur(4px)',
          }}
          onClick={() => setIsUploadOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-elevated, #ffffff)', borderRadius: 14,
              border: '1px solid var(--border-default)', maxWidth: 540, width: '100%',
              padding: 24, boxShadow: '0 24px 48px rgba(0,0,0,0.22)', maxHeight: '90vh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                  {uploadMode === 'bulk' ? 'Bulk Upload Marketing Collateral' : 'Upload Marketing Asset'}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {uploadMode === 'bulk' ? 'Upload up to 50 brochure/catalog files in one batch' : 'Upload single brochure or catalog to a target folder'}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsUploadOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Mode Selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
              <button
                type="button"
                className={`btn btn-sm ${uploadMode === 'single' ? 'btn-solid' : 'btn-ghost'}`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={() => setUploadMode('single')}
              >
                <Upload size={13} /> Single File Upload
              </button>
              <button
                type="button"
                className={`btn btn-sm ${uploadMode === 'bulk' ? 'btn-solid' : 'btn-ghost'}`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={() => setUploadMode('bulk')}
              >
                <Files size={13} /> Bulk Upload (up to 50)
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              {/* Asset Type */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Asset Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${uploadType === 'BROCHURE' ? 'btn-solid' : 'btn-ghost'}`}
                    style={{ flex: 1 }}
                    onClick={() => setUploadType('BROCHURE')}
                  >
                    Brochure
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${uploadType === 'CATALOG' ? 'btn-solid' : 'btn-ghost'}`}
                    style={{ flex: 1 }}
                    onClick={() => setUploadType('CATALOG')}
                  >
                    Catalog
                  </button>
                </div>
              </div>

              {/* Target Folder */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  <span>Target Folder Name</span>
                  <span style={{ fontSize: 11, color: 'var(--brand-primary, #2563eb)' }}>Select or create new</span>
                </label>
                <input
                  type="text"
                  list="asset-folders-list"
                  className="input"
                  placeholder="e.g. Enterprise 2026 or ERP Integrations"
                  value={uploadFolder}
                  onChange={e => setUploadFolder(e.target.value)}
                  required
                />
                <datalist id="asset-folders-list">
                  {folders.map(f => <option key={f} value={f} />)}
                </datalist>

                {/* Quick Folder Chips */}
                {folders.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {folders.slice(0, 5).map(f => (
                      <button
                        key={f}
                        type="button"
                        className="btn btn-xs btn-ghost"
                        style={{
                          fontSize: 10.5, padding: '2px 8px', borderRadius: 12,
                          background: uploadFolder === f ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-hover)',
                          borderColor: uploadFolder === f ? 'var(--brand-primary, #2563eb)' : 'var(--border-subtle)',
                        }}
                        onClick={() => setUploadFolder(f)}
                      >
                        📁 {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SINGLE FILE UPLOADER */}
              {uploadMode === 'single' && (
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Select Asset File (Max 20 MiB)</label>
                  <div
                    style={{
                      padding: '24px 16px', borderRadius: 8, border: '2px dashed var(--border-default)',
                      background: 'var(--bg-hover)', textAlign: 'center', cursor: 'pointer',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={24} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                    {uploadFile ? (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{uploadFile.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        Click to choose PDF, catalog or brochure file
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.zip"
                      style={{ display: 'none' }}
                      onChange={e => setUploadFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              )}

              {/* BULK FILE UPLOADER (Up to 50 files) */}
              {uploadMode === 'bulk' && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Select Multiple Files (Up to 50 files)</label>
                    {bulkFiles.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        style={{ color: '#dc2626', fontSize: 11 }}
                        onClick={() => setBulkFiles([])}
                      >
                        Clear All ({bulkFiles.length})
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      padding: '20px 16px', borderRadius: 8, border: '2px dashed var(--border-default)',
                      background: 'var(--bg-hover)', textAlign: 'center', cursor: 'pointer', marginBottom: 10,
                    }}
                    onClick={() => bulkFileInputRef.current?.click()}
                  >
                    <Files size={24} color="#4f46e5" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Click to select multiple collateral files</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      Hold Ctrl / Shift to pick up to 50 files (PDF, images, etc.)
                    </div>
                    <input
                      ref={bulkFileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg,.zip"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const selected = Array.from(e.target.files || []);
                        if (selected.length + bulkFiles.length > 50) {
                          showNotice('Maximum 50 files allowed per bulk upload batch.', true);
                        }
                        const combined = [...bulkFiles, ...selected].slice(0, 50);
                        setBulkFiles(combined);
                      }}
                    />
                  </div>

                  {/* Bulk files preview list */}
                  {bulkFiles.length > 0 && (
                    <div style={{
                      maxHeight: 140, overflowY: 'auto', borderRadius: 8, background: 'var(--bg-surface, #f8fafc)',
                      border: '1px solid var(--border-subtle)', padding: '8px 10px', fontSize: 11.5,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>
                        <span>Selected Files ({bulkFiles.length})</span>
                        <span>Total: {(bulkFiles.reduce((s, f) => s + f.size, 0) / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                      {bulkFiles.map((file, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '4px 0', borderBottom: idx < bulkFiles.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>
                            {idx + 1}. {file.name}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <span style={{ color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(0)} KB</span>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              style={{ padding: '0 4px', color: '#dc2626' }}
                              onClick={() => setBulkFiles(prev => prev.filter((_, i) => i !== idx))}
                              title="Remove file"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-solid btn-sm"
                  style={{ background: uploadMode === 'bulk' ? '#4f46e5' : 'var(--brand-primary, #2563eb)', color: '#fff' }}
                  disabled={isUploading || (uploadMode === 'single' ? !uploadFile : !bulkFiles.length)}
                >
                  {isUploading
                    ? (uploadMode === 'bulk' ? `Uploading ${bulkFiles.length} files...` : 'Uploading...')
                    : (uploadMode === 'bulk' ? `Upload All (${bulkFiles.length}) to "${uploadFolder || 'General'}"` : `Upload to "${uploadFolder || 'General'}"`)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
