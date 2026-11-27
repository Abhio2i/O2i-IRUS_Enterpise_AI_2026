import React, { useState, useEffect, useMemo } from 'react';
import { SecurityNav } from './SecurityNav';
import {
  ShieldAlert,
  Video,
  VideoOff,
  RefreshCw,
  Maximize2,
  ExternalLink,
  Activity,
  Server,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Moon,
  Sun,
  LayoutGrid,
  Monitor,
  Flame,
  Clock,
  Car,
  Truck,
  User,
  Shield,
  Filter,
  Search,
  Eye,
  Film,
  Download,
} from 'lucide-react';

const SENTRY_BASE = 'http://86.48.20.60:9090';

export const SentryConsolePage = () => {
  const [activeTab, setActiveTab] = useState('incidents'); // default to incidents or cameras
  const [stats, setStats] = useState({
    cameras_online: 6,
    cameras_total: 7,
    today: 9,
    total: 7843,
    system_health_pct: 86,
    server_time: 'LIVE',
    night_mode: false,
    cameras: [
      { id: 'onc_1', name: 'Cloud_C310_96C6', online: true },
      { id: 'onc_2', name: 'Cloud_Camera_2', online: true },
      { id: 'onc_3', name: 'Cloud_Camera_3', online: true },
      { id: 'onc_4', name: 'Home_Camera_1', online: false },
      { id: 'onc_5', name: 'Home_Camera_2', online: true },
      { id: 'onc_6', name: 'Home_Camera_3', online: true },
      { id: 'onc_7', name: 'Home_Camera_4', online: true },
    ],
  });

  const [incidents, setIncidents] = useState([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [frameTimestamp, setFrameTimestamp] = useState(Date.now());
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [incidentFilter, setIncidentFilter] = useState('all');
  const [cameraFilter, setCameraFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [iframeKey, setIframeKey] = useState(0);

  // Raw Video 24 (Continuous 24h Recordings) State
  const [rawRecordings, setRawRecordings] = useState([]);
  const [recordingSettings, setRecordingSettings] = useState({});
  const [rawCameraFilter, setRawCameraFilter] = useState('all');
  const [rawDateFilter, setRawDateFilter] = useState('');
  const [rawLoading, setRawLoading] = useState(false);
  const [rawAuthError, setRawAuthError] = useState(false);
  const [togglingCamId, setTogglingCamId] = useState(null);

  const fetchRawRecordings = async (cam = rawCameraFilter, dt = rawDateFilter) => {
    setRawLoading(true);
    try {
      const params = new URLSearchParams();
      if (cam && cam !== 'all') params.set('camera', cam);
      if (dt) params.set('date', dt);

      const res = await fetch(`${SENTRY_BASE}/api/recordings?${params.toString()}`);
      if (res.status === 401 || res.status === 403) {
        setRawAuthError(true);
        setRawRecordings([]);
        return;
      }
      if (res.ok) {
        setRawAuthError(false);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.recordings ?? data.files ?? data.data ?? []);
        setRawRecordings(list);
      }
    } catch (err) {
      console.warn('Could not fetch Raw 24h recordings:', err);
    } finally {
      setRawLoading(false);
    }
  };

  const fetchRecordingSettings = async () => {
    try {
      const res = await fetch(`${SENTRY_BASE}/api/recording_settings`);
      if (res.status === 401 || res.status === 403) {
        setRawAuthError(true);
        return;
      }
      if (res.ok) {
        setRawAuthError(false);
        const data = await res.json();
        setRecordingSettings(data.settings || data || {});
      }
    } catch (err) {
      console.warn('Could not fetch recording settings:', err);
    }
  };

  const handleToggleCameraRecording = async (camId, nextEnabled) => {
    setTogglingCamId(camId);
    try {
      const res = await fetch(`${SENTRY_BASE}/api/recording_settings/${encodeURIComponent(camId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      if (res.status === 401 || res.status === 403) {
        setRawAuthError(true);
        return;
      }
      if (res.ok) {
        setRecordingSettings((prev) => ({
          ...prev,
          [camId]: typeof prev[camId] === 'object' ? { ...prev[camId], enabled: nextEnabled } : nextEnabled,
        }));
      }
    } catch (err) {
      console.warn('Failed to toggle 24h recording:', err);
    } finally {
      setTogglingCamId(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'raw24') {
      fetchRawRecordings(rawCameraFilter, rawDateFilter);
      fetchRecordingSettings();
    }
  }, [activeTab, rawCameraFilter, rawDateFilter]);

  // Fetch Stats & Incidents directly from Sentry (CORS enabled)
  const fetchData = async () => {
    try {
      const [statsRes, incRes] = await Promise.all([
        fetch(`${SENTRY_BASE}/api/stats`),
        fetch(`${SENTRY_BASE}/api/incidents`),
      ]);

      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        setStats((prev) => ({ ...prev, ...statsData }));
      }

      if (incRes && incRes.ok) {
        const incData = await incRes.json();
        const list = Array.isArray(incData)
          ? incData
          : incData.incidents ?? incData.data ?? incData.clips ?? [];
        setIncidents(list);
        console.log('[SENTRY] incidents loaded:', list.length, list[0]);
      } else {
        console.warn('[SENTRY] incidents fetch failed:', incRes && incRes.status);
      }
    } catch (err) {
      console.warn('Could not fetch Sentry API data', err);
    } finally {
      setIsLoadingIncidents(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Poll live camera frames every 1.5s
  useEffect(() => {
    if (!isLiveStreaming) return;
    const frameInterval = setInterval(() => {
      setFrameTimestamp(Date.now());
    }, 1500);
    return () => clearInterval(frameInterval);
  }, [isLiveStreaming]);

  // Filtered Incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (incidentFilter !== 'all' && inc.reason !== incidentFilter) return false;
      if (cameraFilter !== 'all' && inc.camera_name !== cameraFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cam = (inc.camera_name || '').toLowerCase();
        const rsn = (inc.reason || '').toLowerCase();
        const targets = JSON.stringify(inc.detected_targets || []).toLowerCase();
        if (!cam.includes(q) && !rsn.includes(q) && !targets.includes(q)) return false;
      }
      return true;
    });
  }, [incidents, incidentFilter, cameraFilter, searchQuery]);

  // Reason Badge Helper
  const getReasonConfig = (reason) => {
    switch (reason) {
      case 'zone_breach':
        return { label: 'Zone Breach', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'after_hours_activity':
        return { label: 'After Hours', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'loitering':
        return { label: 'Loitering', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' };
      case 'loud_sound':
        return { label: 'Audio Spike', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)' };
      default:
        return { label: reason || 'Alert', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' };
    }
  };

  const formatTimestamp = (iso) => {
    if (!iso) return 'Just now';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  const getClipUrl = (clipPath) => {
    if (!clipPath) return '';
    const filename = clipPath.split(/[\\/]/).pop();
    return `${SENTRY_BASE}/incidents/${filename}`;
  };

  const openDedicatedWindow = () => {
    window.open(
      SENTRY_BASE,
      'SentrySurveillanceConsole',
      'width=1400,height=900,menubar=no,status=no,toolbar=no,resizable=yes'
    );
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      <SecurityNav />

      {/* Main Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldAlert size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--text-primary)',
                }}
              >
                SENTRY // AI CCTV Surveillance Console
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#22c55e',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 8px #22c55e',
                  }}
                />
                SYSTEM ACTIVE · 86.48.20.60:9090
              </span>
            </div>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 13,
                color: 'var(--text-muted)',
              }}
            >
              Real-time video clips, live streaming cameras, and AI target intrusion tracking inside React.
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Main Tab selector */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-elevated)',
              padding: 4,
              borderRadius: 8,
              border: '1px solid var(--border-default)',
            }}
          >
            <button
              onClick={() => setActiveTab('incidents')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'incidents' ? '#ef4444' : 'transparent',
                color: activeTab === 'incidents' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <Film size={14} /> Recorded Clips & Incidents ({filteredIncidents.length})
            </button>

            <button
              onClick={() => setActiveTab('cameras')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'cameras' ? '#ef4444' : 'transparent',
                color: activeTab === 'cameras' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <LayoutGrid size={14} /> Live CCTV Grid
            </button>

            <button
              onClick={() => setActiveTab('raw24')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'raw24' ? '#ef4444' : 'transparent',
                color: activeTab === 'raw24' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <Clock size={14} /> Raw Video 24
            </button>

            <button
              onClick={() => setActiveTab('iframe')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'iframe' ? '#ef4444' : 'transparent',
                color: activeTab === 'iframe' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <Monitor size={14} /> Web Console Frame
            </button>
          </div>

          <button
            onClick={() => setIsLiveStreaming((s) => !s)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 8,
              background: 'var(--bg-elevated)',
              color: isLiveStreaming ? '#22c55e' : 'var(--text-muted)',
              border: '1px solid var(--border-default)',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isLiveStreaming ? <Pause size={14} /> : <Play size={14} />}
            {isLiveStreaming ? 'Streaming (1.5s)' : 'Paused'}
          </button>

          <button
            onClick={openDedicatedWindow}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)',
            }}
          >
            <span>Open Dedicated Window</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          onClick={() => setActiveTab('cameras')}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
          }}
        >
          <div style={{ padding: 8, borderRadius: 8, background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e' }}>
            <Video size={18} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>CAMERAS ONLINE</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#22c55e' }}>
              {stats.cameras_online} / {stats.cameras_total}
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('incidents')}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
          }}
        >
          <div style={{ padding: 8, borderRadius: 8, background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
            <Flame size={18} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>RECORDED CLIPS</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>
              {stats.today} Today <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({stats.total} total)</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ padding: 8, borderRadius: 8, background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>SYSTEM HEALTH</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              {stats.system_health_pct}%
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ padding: 8, borderRadius: 8, background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
            {stats.night_mode ? <Moon size={18} /> : <Sun size={18} />}
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>SURVEILLANCE MODE</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              {stats.night_mode ? 'Night Window (High Sens)' : 'Day Mode (Active)'}
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: RECORDED INCIDENTS & VIDEO CLIPS */}
      {activeTab === 'incidents' && (
        <div>
          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  gap: 4,
                  background: 'var(--bg-elevated)',
                  padding: 4,
                  borderRadius: 8,
                  border: '1px solid var(--border-default)',
                }}
              >
                {[
                  { id: 'all', label: 'All Clips' },
                  { id: 'zone_breach', label: 'Zone Breach' },
                  { id: 'loitering', label: 'Loitering' },
                  { id: 'after_hours_activity', label: 'After Hours' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setIncidentFilter(f.id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: incidentFilter === f.id ? '#ef4444' : 'transparent',
                      color: incidentFilter === f.id ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Camera Filter Dropdown */}
              <select
                value={cameraFilter}
                onChange={(e) => setCameraFilter(e.target.value)}
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12.5,
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Cameras ({incidents.length} clips)</option>
                {stats.cameras.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 8,
                padding: '6px 12px',
                width: 260,
              }}
            >
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search target, camera..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: 12.5,
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* Incidents Grid with Embedded Video Players */}
          {isLoadingIncidents ? (
            <div style={{ padding: 50, textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={26} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
              <div style={{ fontSize: 14 }}>Loading incident recordings and evidence clips...</div>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div
              style={{
                padding: 40,
                textAlign: 'center',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 12,
                color: 'var(--text-muted)',
              }}
            >
              <CheckCircle2 size={32} color="#22c55e" style={{ marginBottom: 10 }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                No Matching Incidents
              </div>
              <div style={{ fontSize: 13, marginTop: 4 }}>
                Zero active breaches or alerts found under the current filter criteria.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: 16,
              }}
            >
              {filteredIncidents.slice(0, 30).map((inc) => {
                const reasonCfg = getReasonConfig(inc.reason);
                const targets = inc.detected_targets || [];
                const clipUrl = getClipUrl(inc.clip_path);

                return (
                  <div
                    key={inc.id || inc.timestamp}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 12,
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-card)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'border-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = reasonCfg.color)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                  >
                    {/* In-Card Video Player */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '16 / 9',
                        background: '#090a0f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {clipUrl ? (
                        <video
                          src={clipUrl}
                          controls
                          preload="metadata"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            background: '#000',
                          }}
                        />
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No video clip available</div>
                      )}

                      {/* Top Overlay Badge */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          zIndex: 2,
                          pointerEvents: 'none',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: reasonCfg.bg,
                            color: reasonCfg.color,
                            border: `1px solid ${reasonCfg.border}`,
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          {reasonCfg.label}
                        </span>
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() => setActiveVideoModal(inc)}
                        title="Expand Theater Mode"
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: 5,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          zIndex: 2,
                        }}
                      >
                        <Maximize2 size={13} />
                      </button>
                    </div>

                    {/* Incident Details Body */}
                    <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        {/* Camera and Time */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Video size={14} color="#ef4444" />
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                              {inc.camera_name}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                            <Clock size={12} />
                            <span>{formatTimestamp(inc.timestamp)}</span>
                          </div>
                        </div>

                        {/* Detected Target Badges */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                          {targets.length > 0 ? (
                            targets.map((tgt, i) => (
                              <span
                                key={i}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: 11,
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  background: 'var(--bg-surface)',
                                  border: '1px solid var(--border-subtle)',
                                  color: 'var(--text-secondary)',
                                  textTransform: 'capitalize',
                                }}
                              >
                                {tgt.class === 'person' ? <User size={12} /> : tgt.class === 'truck' ? <Truck size={12} /> : <Car size={12} />}
                                <span>{tgt.class}</span>
                                {tgt.track_id && <span style={{ color: 'var(--text-muted)' }}>#{tgt.track_id}</span>}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Target: Motion Recorded</span>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: 8,
                          borderTop: '1px solid var(--border-subtle)',
                          fontSize: 11,
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          ID: #{inc.id}
                        </span>

                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            onClick={() => setActiveVideoModal(inc)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11.5,
                            }}
                          >
                            <Play size={11} /> Theater Mode
                          </button>

                          <a
                            href={clipUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: 'var(--text-muted)',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Download size={11} /> Save
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE CCTV GRID */}
      {activeTab === 'cameras' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isLiveStreaming ? '#ef4444' : '#6b7280',
                  boxShadow: isLiveStreaming ? '0 0 10px #ef4444' : 'none',
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Live Video Feeds ({stats.cameras.filter((c) => c.online).length} Active Streams)
              </span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Click any camera card to zoom / expand
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 16,
            }}
          >
            {stats.cameras.map((cam) => {
              const frameUrl = `${SENTRY_BASE}/live_frame/${cam.id}.jpg?t=${frameTimestamp}`;

              return (
                <div
                  key={cam.id}
                  onClick={() => cam.online && setSelectedCamera(cam)}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-card)',
                    cursor: cam.online ? 'pointer' : 'default',
                    transition: 'transform 0.18s ease, border-color 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (cam.online) e.currentTarget.style.borderColor = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    if (cam.online) e.currentTarget.style.borderColor = 'var(--border-default)';
                  }}
                >
                  {/* Camera Header Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-surface)',
                      borderBottom: '1px solid var(--border-default)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: cam.online ? '#22c55e' : '#ef4444',
                        }}
                      />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {cam.name}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: cam.online ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: cam.online ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {cam.online ? 'LIVE' : 'OFFLINE'}
                    </span>
                  </div>

                  {/* Video Viewport */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '16 / 9',
                      background: '#090a0f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {cam.online ? (
                      <img
                        src={frameUrl}
                        alt={cam.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          color: '#6b7280',
                        }}
                      >
                        <VideoOff size={28} />
                        <span style={{ fontSize: 11, fontWeight: 600 }}>Camera Stream Offline</span>
                      </div>
                    )}

                    {cam.online && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 6,
                          left: 8,
                          right: 8,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 10,
                          color: '#fff',
                          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                          pointerEvents: 'none',
                        }}
                      >
                        <span style={{ background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4 }}>
                          {cam.id}
                        </span>
                        <span style={{ background: 'rgba(239, 68, 68, 0.75)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                          ● REC
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2B: RAW VIDEO 24 (24H CONTINUOUS RECORDINGS) */}
      {activeTab === 'raw24' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 24h Recording ON/OFF Controls per Camera */}
          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} color="#06b6d4" />
                <span style={{ fontWeight: 700, fontSize: 14 }}>24h Continuous Raw Recording Controls</span>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  (Daily auto-merged into YYYYMMDD_full24h.mp4 · 15-day retention)
                </span>
              </div>
              <button
                type="button"
                onClick={() => { fetchRawRecordings(); fetchRecordingSettings(); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border-default)',
                  background: 'var(--bg-surface)', color: 'var(--text-primary)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} className={rawLoading ? 'spin' : ''} /> Refresh
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(stats.cameras || []).map((cam) => {
                const setting = recordingSettings[cam.id] ?? recordingSettings[cam.name];
                const isEnabled = typeof setting === 'object' ? Boolean(setting?.enabled) : Boolean(setting);
                const isBusy = togglingCamId === cam.id;
                return (
                  <button
                    key={cam.id}
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleToggleCameraRecording(cam.id, !isEnabled)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '7px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: isBusy ? 'wait' : 'pointer',
                      border: `1px solid ${isEnabled ? 'rgba(34, 197, 94, 0.4)' : 'var(--border-default)'}`,
                      background: isEnabled ? 'rgba(34, 197, 94, 0.12)' : 'var(--bg-surface)',
                      color: isEnabled ? '#22c55e' : 'var(--text-muted)',
                    }}
                  >
                    <span
                      style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: isEnabled ? '#22c55e' : '#64748b',
                      }}
                    />
                    <span>{cam.name}</span>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: isEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)' }}>
                      {isBusy ? '...' : (isEnabled ? 'REC ON' : 'OFF')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 401 Auth Notice if Sentry /api/recordings still has @login_required */}
          {rawAuthError && (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                color: '#f59e0b',
                fontSize: 12.5,
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={15} /> Sentry Recordings API Returned 401 (Login Required)
              </div>
              <div>
                On your VPS, <code>/api/recordings</code> and <code>/api/recording_settings</code> in <code>~/sentry/dashboard/app.py</code> still require Sentry login. Remove <code>@login_required</code> from those routes and run <code>sudo systemctl restart sentry</code> so the Agentic AI dashboard can stream 24h raw videos directly.
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              background: 'var(--bg-elevated)',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid var(--border-default)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
              <Filter size={14} /> Filter Recordings:
            </div>

            <select
              value={rawCameraFilter}
              onChange={(e) => setRawCameraFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: 12.5,
              }}
            >
              <option value="all">All Cameras</option>
              {(stats.cameras || []).map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            <input
              type="date"
              value={rawDateFilter}
              onChange={(e) => setRawDateFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: 12.5,
              }}
            />

            {rawDateFilter && (
              <button
                type="button"
                onClick={() => setRawDateFilter('')}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--border-default)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Clear Date
              </button>
            )}

            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
              {rawRecordings.length} video(s) found
            </span>
          </div>

          {/* Recordings Grid */}
          {rawLoading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-default)' }}>
              Loading 24h continuous raw recordings from {SENTRY_BASE}...
            </div>
          ) : rawRecordings.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-default)' }}>
              No raw recordings found for the selected camera or date. Enable 24h recording above for active cameras.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: 16,
              }}
            >
              {rawRecordings.map((rec, idx) => {
                const camName = rec.camera || rec.camera_name || 'Camera';
                const filename = rec.filename || rec.name || '';
                const videoUrl = `${SENTRY_BASE}/recordings/${encodeURIComponent(camName)}/${encodeURIComponent(filename)}`;
                const isFull24h = filename.includes('full24h') || rec.is_full_24h || rec.type === 'full24h';
                const sizeMb = rec.size_mb ?? (rec.size_bytes ? (rec.size_bytes / (1024 * 1024)).toFixed(1) : null);

                return (
                  <div
                    key={`${camName}-${filename}-${idx}`}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: `1px solid ${isFull24h ? 'rgba(6, 182, 212, 0.45)' : 'var(--border-default)'}`,
                      borderRadius: 12,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ position: 'relative', background: '#000', aspectRatio: '16/9' }}>
                      <video
                        controls
                        preload="metadata"
                        src={videoUrl}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      {isFull24h && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            padding: '4px 9px',
                            borderRadius: 6,
                            background: 'rgba(6, 182, 212, 0.9)',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 700,
                            pointerEvents: 'none',
                          }}
                        >
                          24h Full Video
                        </span>
                      )}
                    </div>

                    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>
                          {camName}
                        </span>
                        {sizeMb && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                            {sizeMb} MB
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                        {filename} {rec.date ? `· ${rec.date}` : ''}
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button
                          type="button"
                          onClick={() => setActiveVideoModal({
                            camera_name: camName,
                            reason: isFull24h ? '24h Full Continuous Raw Recording' : 'Raw Recording Segment',
                            video_url: videoUrl,
                            timestamp: rec.date || filename,
                          })}
                          style={{
                            flex: 1,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '7px 10px', borderRadius: 6, border: 'none',
                            background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          <Maximize2 size={13} /> Theater Mode
                        </button>
                        <a
                          href={videoUrl}
                          download={filename}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '7px 12px', borderRadius: 6,
                            border: '1px solid var(--border-default)',
                            background: 'var(--bg-surface)', color: 'var(--text-primary)',
                            fontSize: 12, fontWeight: 600, textDecoration: 'none',
                          }}
                        >
                          <Download size={13} /> Download
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FULL IFRAME VIEW */}
      {activeTab === 'iframe' && (
        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            overflow: 'hidden',
            height: 'calc(100vh - 270px)',
            minHeight: 650,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              background: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-default)',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Embedded Sentry Web Frame · {SENTRY_BASE}
            </span>
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              <RefreshCw size={13} /> Reload Frame
            </button>
          </div>

          <iframe
            key={iframeKey}
            src={SENTRY_BASE}
            title="Sentry Surveillance Web"
            style={{
              width: '100%',
              height: '100%',
              flex: 1,
              border: 'none',
              background: '#090a0f',
            }}
          />
        </div>
      )}

      {/* THEATER MODE VIDEO MODAL */}
      {activeVideoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setActiveVideoModal(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 960,
              background: 'var(--bg-surface)',
              borderRadius: 14,
              overflow: 'hidden',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-modal)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 18px',
                borderBottom: '1px solid var(--border-default)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: getReasonConfig(activeVideoModal.reason).bg,
                    color: getReasonConfig(activeVideoModal.reason).color,
                    border: `1px solid ${getReasonConfig(activeVideoModal.reason).border}`,
                  }}
                >
                  {getReasonConfig(activeVideoModal.reason).label}
                </span>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                  {activeVideoModal.camera_name} · Incident #{activeVideoModal.id}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  ({formatTimestamp(activeVideoModal.timestamp)})
                </span>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: 18,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>

            {/* Video Player */}
            <div style={{ background: '#000', width: '100%', aspectRatio: '16 / 9' }}>
              <video
                src={getClipUrl(activeVideoModal.clip_path)}
                controls
                autoPlay
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN CAMERA MODAL */}
      {selectedCamera && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setSelectedCamera(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 1100,
              background: 'var(--bg-surface)',
              borderRadius: 14,
              overflow: 'hidden',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-modal)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 18px',
                borderBottom: '1px solid var(--border-default)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                  {selectedCamera.name} (Live Camera Stream)
                </span>
              </div>
              <button
                onClick={() => setSelectedCamera(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: 18,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#000', width: '100%', aspectRatio: '16 / 9' }}>
              <img
                src={`${SENTRY_BASE}/live_frame/${selectedCamera.id}.jpg?t=${frameTimestamp}`}
                alt={selectedCamera.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentryConsolePage;
