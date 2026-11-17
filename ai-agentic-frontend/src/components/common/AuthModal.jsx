import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  closeAuthModal,
  setAuthenticatedUser,
  setAuthError,
  setAuthStatus,
} from '../../store/authSlice';
import { addAuditLog } from '../../store/governanceSlice';
import {
  login,
  register,
  DEFAULT_TENANT_ID,
} from '../../services/apiClient';
import {
  Lock,
  Mail,
  User,
  Building,
  KeyRound,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const AuthModal = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((s) => s.auth.isAuthModalOpen);
  const initialMode = useSelector((s) => s.auth.authModalMode);
  const currentTenantId = useSelector((s) => s.auth.tenantId || DEFAULT_TENANT_ID);

  const [mode, setMode] = useState(initialMode || 'login'); // 'login' | 'register'
  const [tenantId, setTenantIdInput] = useState(currentTenantId);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showTenantConfig, setShowTenantConfig] = useState(false);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide your corporate email and password.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    dispatch(setAuthStatus('loading'));

    const effectiveTenantId = tenantId.trim() || DEFAULT_TENANT_ID;

    try {
      if (mode === 'login') {
        const res = await login({
          tenantId: effectiveTenantId,
          email: email.trim(),
          password,
        });

        const userObj = {
          email: email.trim(),
          displayName: (res && (res.displayName || res.name)) || email.split('@')[0],
          tenantId: effectiveTenantId,
          role: (res && res.role) || 'TENANT_ADMIN',
          lastLogin: new Date().toISOString(),
        };

        dispatch(setAuthenticatedUser(userObj));
        dispatch(
          addAuditLog({
            id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
            actor: email.trim(),
            action: 'AUTH_LOGIN_SUCCESS',
            endpoint: '/api/auth/login',
            riskTier: 'LOW',
            model: 'Auth Gateway / HttpOnly JWT',
            tokens: 0,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
            details: `User ${email.trim()} authenticated successfully.`,
          })
        );

        setSuccessMsg('Signed in successfully.');
        setTimeout(() => {
          dispatch(closeAuthModal());
        }, 500);

      } else {
        const res = await register({
          tenantId: effectiveTenantId,
          email: email.trim(),
          password,
          displayName: displayName.trim() || email.split('@')[0],
        });

        dispatch(
          addAuditLog({
            id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
            actor: email.trim(),
            action: 'AUTH_REGISTER_SUCCESS',
            endpoint: '/api/auth/register',
            riskTier: 'LOW',
            model: 'Auth Gateway / RBAC',
            tokens: 0,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
            details: `Tenant account registered: "${displayName || email}"`,
          })
        );

        setSuccessMsg('Account registered. Signing in...');

        try {
          const loginRes = await login({
            tenantId: effectiveTenantId,
            email: email.trim(),
            password,
          });
          dispatch(
            setAuthenticatedUser({
              email: email.trim(),
              displayName: displayName.trim() || (loginRes && loginRes.displayName) || email.split('@')[0],
              tenantId: effectiveTenantId,
              role: (res && res.role) || (loginRes && loginRes.role) || 'TENANT_ADMIN',
            })
          );
          setTimeout(() => {
            dispatch(closeAuthModal());
          }, 600);
        } catch {
          setTimeout(() => {
            setMode('login');
            setSuccessMsg('Registration completed. Please enter password to sign in.');
          }, 800);
        }
      }
    } catch (err) {
      console.error('[AUTH ERROR]:', err);
      let message = err.message || 'Authentication request failed.';
      if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
        message = 'Unable to connect to the authentication server. Please check your network connection.';
      }
      setErrorMsg(message);
      dispatch(setAuthError(message));
    } finally {
      setLoading(false);
    }
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
        zIndex: 99999,
        padding: 16,
        backdropFilter: 'blur(5px)',
      }}
      onClick={() => !loading && dispatch(closeAuthModal())}
    >
      <div
        style={{
          background: 'var(--bg-elevated, #ffffff)',
          borderRadius: 12,
          border: '1px solid var(--border-default, #e2e8f0)',
          maxWidth: 440,
          width: '100%',
          padding: '28px 24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => dispatch(closeAuthModal())}
          disabled={loading}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted, #94a3b8)',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(37, 99, 235, 0.1)',
              color: 'var(--brand-primary, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
            }}
          >
            <Lock size={20} />
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
            {mode === 'login' ? 'Tenant Authentication' : 'Create Tenant Account'}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
            Secure enterprise access gateway
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-hover, #f1f5f9)',
            padding: 3,
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '7px 0',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: mode === 'login' ? 'var(--bg-elevated, #ffffff)' : 'transparent',
              color: mode === 'login' ? 'var(--brand-primary, #2563eb)' : 'var(--text-secondary)',
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
              padding: '7px 0',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: mode === 'register' ? 'var(--bg-elevated, #ffffff)' : 'transparent',
              color: mode === 'register' ? 'var(--brand-primary, #2563eb)' : 'var(--text-secondary)',
              boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            Register
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#dc2626',
              fontSize: 12.5,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              color: '#16a34a',
              fontSize: 12.5,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Display Name (Register Only) */}
          {mode === 'register' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5, color: 'var(--text-secondary)' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Jane Doe"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: 7,
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5, color: 'var(--text-secondary)' }}>
              Work Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: 7,
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 5, color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '9px 38px 9px 34px',
                  borderRadius: 7,
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Optional Tenant ID */}
          <div style={{ marginBottom: 18 }}>
            {!showTenantConfig ? (
              <button
                type="button"
                onClick={() => setShowTenantConfig(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--text-secondary)',
                  fontSize: 12,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Specify Organization Tenant ID (Optional)
              </button>
            ) : (
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 5, color: 'var(--text-secondary)' }}>
                  <span>Tenant ID</span>
                  <button
                    type="button"
                    onClick={() => setShowTenantConfig(false)}
                    style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    Hide
                  </button>
                </label>
                <div style={{ position: 'relative' }}>
                  <Building size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={tenantId}
                    onChange={(e) => setTenantIdInput(e.target.value)}
                    placeholder="11111111-1111-1111-1111-111111111111"
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 34px',
                      borderRadius: 7,
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-main)',
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--brand-primary, #2563eb)',
              color: '#ffffff',
              fontSize: 13.5,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: loading ? 0.75 : 1,
            }}
          >
            <span>{loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</span>
            <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
