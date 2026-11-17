import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthenticatedUser, setAuthError, setAuthStatus } from '../../store/authSlice';
import { addAuditLog } from '../../store/governanceSlice';
import {
  login,
  register,
  DEFAULT_TENANT_ID,
  BACKEND_URL,
} from '../../services/apiClient';
import {
  Mail, Building2, KeyRound, Eye, EyeOff,
  AlertCircle, CheckCircle2, Shield, ArrowRight, User, Check
} from 'lucide-react';

export const LoginPage = () => {
  const dispatch = useDispatch();
  const theme = useSelector((s) => s.theme.mode);

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [tenantId, setTenantId] = useState(DEFAULT_TENANT_ID);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showTenantField, setShowTenantField] = useState(false);

  // Validation criteria
  const isPasswordLengthValid = password.length >= 8 && password.length <= 72;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Client-side validations
    if (!email.trim() || !isEmailValid) {
      setErrorMsg('Please enter a valid corporate email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg(`Password is too short (${password.length} characters). It must be between 8 and 72 characters.`);
      return;
    }

    if (password.length > 72) {
      setErrorMsg(`Password exceeds maximum length (${password.length}/72 characters).`);
      return;
    }

    if (mode === 'register' && !displayName.trim()) {
      setErrorMsg('Please enter your full name for registration.');
      return;
    }

    setLoading(true);
    dispatch(setAuthStatus('loading'));

    const effectiveTenantId = tenantId.trim() || DEFAULT_TENANT_ID;

    try {
      if (mode === 'register') {
        const safeDisplayName = displayName.trim() || 'Enterprise User';
        const regRes = await register({
          tenantId: effectiveTenantId,
          email: email.trim(),
          password,
          displayName: safeDisplayName,
        });

        dispatch(addAuditLog({
          id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          actor: email.trim(),
          action: 'AUTH_REGISTER_SUCCESS',
          endpoint: '/api/auth/register',
          riskTier: 'LOW',
          model: 'Auth Gateway / Bearer Token',
          tokens: 0,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          details: `Tenant account registered: "${regRes.displayName || safeDisplayName}" (${email.trim()})`,
        }));

        setSuccessMsg('Account registered successfully! Access granted.');

        const userObj = {
          userId: regRes.userId,
          email: regRes.email || email.trim(),
          displayName: regRes.displayName || safeDisplayName,
          tenantId: regRes.tenantId || effectiveTenantId,
          role: regRes.role || 'USER',
          lastLogin: new Date().toISOString(),
        };

        dispatch(setAuthenticatedUser(userObj));
      } else {
        const res = await login({
          tenantId: effectiveTenantId,
          email: email.trim(),
          password,
        });

        const userObj = {
          userId: res.userId,
          email: res.email || email.trim(),
          displayName: res.displayName || (email.split('@')[0] === 'admin' ? 'Administrator' : email.split('@')[0]),
          tenantId: res.tenantId || effectiveTenantId,
          role: res.role || 'USER',
          lastLogin: new Date().toISOString(),
        };

        dispatch(setAuthenticatedUser(userObj));
        dispatch(addAuditLog({
          id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          actor: email.trim(),
          action: 'AUTH_LOGIN_SUCCESS',
          endpoint: '/api/auth/login',
          riskTier: 'LOW',
          model: 'Auth Gateway / Bearer Token',
          tokens: 0,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          details: `User ${email.trim()} authenticated successfully with Bearer token.`,
        }));
      }
    } catch (err) {
      console.error('[AUTH ERROR]:', err);
      let msg = err.message || 'Authentication failed. Please verify your credentials.';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        msg = `Unable to connect to the authentication server at ${BACKEND_URL}. Please verify backend is running.`;
      }
      setErrorMsg(msg);
      dispatch(setAuthError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-theme={theme}
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'var(--bg-main, #0f172a)',
        color: 'var(--text-primary, #f8fafc)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Left Hero Showcase */}
      <div
        style={{
          flex: '1 1 45%',
          background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #090d16 100%)',
          borderRight: '1px solid var(--border-default, rgba(255,255,255,0.08))',
          padding: '56px 64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: -120,
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Brand Header */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Shield size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px', color: '#ffffff' }}>
                Agentic AI Platform
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                Autonomous Enterprise Operations
              </div>
            </div>
          </div>

          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: 18,
              letterSpacing: '-0.8px',
              color: '#ffffff',
            }}
          >
            Intelligent Automation<br />for Modern Enterprises
          </h1>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.65)',
              maxWidth: 420,
              margin: 0,
            }}
          >
            Unified orchestrator for document ingestion, autonomous workflow execution,
            and real-time enterprise process governance.
          </p>
        </div>

        {/* Feature Highlights */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[
            { title: 'End-to-End Document Ingestion', desc: 'Spring AI + Apache Tika automated extraction pipeline' },
            { title: 'Zero-Trust Architecture', desc: 'Tenant-isolated sessions with cryptographic audit validation' },
            { title: 'Enterprise Password Standard', desc: 'Compliant with enterprise 8–72 character security policy' },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 2,
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={13} color="#60a5fa" />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f8fafc' }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', position: 'relative', zIndex: 1 }}>
          © 2026 Agentic Enterprise AI Inc. All rights reserved.
        </div>
      </div>

      {/* Right Form Container */}
      <div
        style={{
          flex: '1 1 55%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 32px',
          background: 'var(--bg-elevated, #ffffff)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: '-0.5px',
                color: 'var(--text-primary, #0f172a)',
                margin: '0 0 8px 0',
              }}
            >
              {mode === 'login' ? 'Sign in to your account' : 'Create an account'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary, #64748b)', margin: 0 }}>
              {mode === 'login'
                ? 'Welcome back. Enter your corporate credentials to continue.'
                : 'Get started with your enterprise tenant access.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-hover, #f1f5f9)',
              padding: 4,
              borderRadius: 8,
              marginBottom: 24,
            }}
          >
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '8px 0',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: mode === 'login' ? 'var(--bg-elevated, #ffffff)' : 'transparent',
                color: mode === 'login' ? 'var(--brand-primary, #2563eb)' : 'var(--text-secondary, #64748b)',
                boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '8px 0',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: mode === 'register' ? 'var(--bg-elevated, #ffffff)' : 'transparent',
                color: mode === 'register' ? 'var(--brand-primary, #2563eb)' : 'var(--text-secondary, #64748b)',
                boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              Register
            </button>
          </div>

          {/* Notifications */}
          {errorMsg && (
            <div
              style={{
                padding: '11px 14px',
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#dc2626',
                fontSize: 13,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ lineHeight: 1.4 }}>{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                padding: '11px 14px',
                borderRadius: 8,
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                color: '#16a34a',
                fontSize: 13,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <div>{successMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Display Name (Only in Register mode) */}
            {mode === 'register' && (
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 6,
                    color: 'var(--text-primary, #0f172a)',
                  }}
                >
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted, #94a3b8)',
                    }}
                  />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Hemant Kumar"
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: 8,
                      border: '1px solid var(--border-default, #e2e8f0)',
                      background: 'var(--bg-main, #ffffff)',
                      color: 'var(--text-primary, #0f172a)',
                      fontSize: 14,
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: 'var(--text-primary, #0f172a)',
                }}
              >
                Work Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted, #94a3b8)',
                  }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: 8,
                    border: `1px solid ${email && !isEmailValid ? '#ef4444' : 'var(--border-default, #e2e8f0)'}`,
                    background: 'var(--bg-main, #ffffff)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: 14,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-primary, #0f172a)',
                  }}
                >
                  Password
                </label>
                {mode === 'login' && (
                  <span style={{ fontSize: 12, color: 'var(--brand-primary, #2563eb)', cursor: 'pointer' }}>
                    Forgot password?
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <KeyRound
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted, #94a3b8)',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8–72 characters"
                  style={{
                    width: '100%',
                    padding: '10px 42px 10px 38px',
                    borderRadius: 8,
                    border: `1px solid ${password.length > 0 && !isPasswordLengthValid ? '#f59e0b' : 'var(--border-default, #e2e8f0)'}`,
                    background: 'var(--bg-main, #ffffff)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: 14,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted, #94a3b8)',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Requirement Hint */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 6,
                  fontSize: 12,
                  color: isPasswordLengthValid
                    ? '#16a34a'
                    : password.length > 0
                    ? '#d97706'
                    : 'var(--text-secondary, #64748b)',
                  transition: 'color 0.2s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {isPasswordLengthValid ? <Check size={13} color="#16a34a" /> : <span>•</span>}
                  <span>Must be 8–72 characters</span>
                </span>
                <span className="mono" style={{ fontSize: 11 }}>
                  {password.length}/72
                </span>
              </div>
            </div>

            {/* Optional Organization / Tenant ID toggle */}
            <div style={{ marginBottom: 22 }}>
              {!showTenantField ? (
                <button
                  type="button"
                  onClick={() => setShowTenantField(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--text-secondary, #64748b)',
                    fontSize: 12.5,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Configure Organization Tenant ID (Optional)
                </button>
              ) : (
                <div>
                  <label
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12.5,
                      fontWeight: 600,
                      marginBottom: 6,
                      color: 'var(--text-primary, #0f172a)',
                    }}
                  >
                    <span>Organization Tenant ID</span>
                    <button
                      type="button"
                      onClick={() => setShowTenantField(false)}
                      style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--text-muted, #94a3b8)', cursor: 'pointer' }}
                    >
                      Hide
                    </button>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building2
                      size={16}
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted, #94a3b8)',
                      }}
                    />
                    <input
                      type="text"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      placeholder="11111111-1111-1111-1111-111111111111"
                      style={{
                        width: '100%',
                        padding: '9px 14px 9px 38px',
                        borderRadius: 8,
                        border: '1px solid var(--border-default, #e2e8f0)',
                        background: 'var(--bg-main, #ffffff)',
                        color: 'var(--text-primary, #0f172a)',
                        fontSize: 12,
                        fontFamily: 'monospace',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: 'none',
                background: loading ? '#93c5fd' : '#2563eb',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 1px 3px rgba(37, 99, 235, 0.2)',
                transition: 'background-color 0.15s',
              }}
            >
              <span>{loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Switch mode footer */}
          <div style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'var(--text-secondary, #64748b)' }}>
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-primary, #2563eb)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-primary, #2563eb)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
