import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SecurityNav } from './SecurityNav';
import { revokePersonnelAccess, triggerEmergencyBeacon, togglePerimeterLockdown } from '../../store/securitySlice';
import {
  Users, ShieldCheck, MapPin, AlertTriangle, CheckCircle2,
  Lock, Radio, ShieldAlert, X, Eye, PhoneCall, Building2
} from 'lucide-react';

export const PersonnelSafetyPage = () => {
  const dispatch = useDispatch();
  const personnelSafety = useSelector((s) => s.security.personnelSafety);

  const [selectedExec, setSelectedExec] = useState(null);
  const [notice, setNotice] = useState(null);

  const handleRevoke = (empId) => {
    dispatch(revokePersonnelAccess(empId));
    setNotice(`Zero-trust credentials revoked for ${empId}. Tokens quarantined remotely.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handlePanicBeacon = () => {
    dispatch(triggerEmergencyBeacon());
    setNotice('Emergency sovereign alert sent to 24/7 Security Operations Desk.');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleLockdown = (facId) => {
    dispatch(togglePerimeterLockdown(facId));
    setNotice(`Perimeter status updated for facility ${facId}.`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      <SecurityNav />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Users size={20} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Personnel Safety & Executive Protection Shield
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Biometric facility access control, executive travel safe corridors, satellite geofencing telemetry, and anti-coercion zero-trust protocols.
          </p>
        </div>

        <button
          onClick={handlePanicBeacon}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 8,
            background: '#ef4444',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
          }}
        >
          <Radio size={15} />
          <span>Test Emergency Panic Beacon</span>
        </button>
      </div>

      {notice && (
        <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 13, fontWeight: 600 }}>
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Personnel Badges</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>71 Verified</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Iris & 3D Biometric Match</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Facility Breach Attempts</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e', marginTop: 4 }}>0 Breaches</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>100% Perimeter Integrity</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Emergency Beacon Status</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>ARMED & READY</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Sub-2s Direct Satellite Link</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Executive Travel Shield</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>Safe Corridors</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Zero High-Risk Travel Flags</div>
        </div>
      </div>

      {/* Facilities Perimeter Access Cards */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', color: 'var(--text-primary)' }}>
          Physical Facilities & Biometric Access Status
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {personnelSafety.facilities.map((fac) => {
            const isLockdown = fac.perimeterStatus.includes('LOCKDOWN');

            return (
              <div
                key={fac.id}
                style={{
                  background: 'var(--bg-elevated)',
                  border: `1px solid ${isLockdown ? '#ef4444' : 'var(--border-default)'}`,
                  borderRadius: 10,
                  padding: '18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                      {fac.securityLevel}
                    </span>
                    <h4 style={{ fontSize: 15, fontWeight: 700, margin: '4px 0 0', color: 'var(--text-primary)' }}>
                      {fac.name}
                    </h4>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{fac.location}</div>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: isLockdown ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.12)',
                      color: isLockdown ? '#ef4444' : '#10b981',
                      border: `1px solid ${isLockdown ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                    }}
                  >
                    {fac.perimeterStatus}
                  </span>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 6, fontSize: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Active Badges Present:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{fac.activePersonnel} Personnel</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Biometric Pass Match:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>{fac.biometricAccessLogs}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleLockdown(fac.id)}
                  style={{
                    width: '100%',
                    padding: '7px 12px',
                    borderRadius: 6,
                    background: isLockdown ? '#10b981' : 'var(--bg-surface)',
                    color: isLockdown ? '#052e16' : '#ef4444',
                    border: `1px solid ${isLockdown ? '#10b981' : 'rgba(239, 68, 68, 0.3)'}`,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isLockdown ? 'Release Facility Lockdown' : 'Arm Perimeter Lockdown'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Executive Travel & Telemetry Radar */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Key Leadership & Frontier AI Scientist Safety Radar
          </h3>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Real-time geofence coordinates, hardware cryptographic token health, and travel clearance
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Personnel & Emp ID</th>
                <th style={{ padding: '14px 18px' }}>Current Geofence Zone</th>
                <th style={{ padding: '14px 18px' }}>Threat Risk Rating</th>
                <th style={{ padding: '14px 18px' }}>Device & Token Attestation</th>
                <th style={{ padding: '14px 18px' }}>Travel Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {personnelSafety.executives.map((exec) => {
                const isRevoked = exec.deviceAttestation.includes('REVOKED');

                return (
                  <tr key={exec.empId} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{exec.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        {exec.empId} · {exec.role}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-primary)' }}>
                        <MapPin size={12} color="#10b981" />
                        <span>{exec.currentZone}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontWeight: 700, color: '#22c55e', fontSize: 12 }}>{exec.threatScore}</span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          background: isRevoked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.12)',
                          color: isRevoked ? '#ef4444' : '#10b981',
                        }}
                      >
                        {isRevoked ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                        <span>{exec.deviceAttestation}</span>
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{exec.travelStatus}</span>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      {!isRevoked ? (
                        <button
                          onClick={() => handleRevoke(exec.empId)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 6,
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Quarantine Token
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>QUARANTINED</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PersonnelSafetyPage;
