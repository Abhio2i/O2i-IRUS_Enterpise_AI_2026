import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { resolveSessionExpired, logoutUser } from '../../store/authSlice';
import { refreshAuth, logout as apiLogout } from '../../services/apiClient';
import {
  ShieldAlert,
  Clock,
  RotateCw,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const COUNTDOWN_SECONDS = 45;

export const SessionExpiredModal = () => {
  const dispatch = useDispatch();
  const isSessionExpired = useSelector((s) => s.auth.isSessionExpired);
  const expiryReason = useSelector((s) => s.auth.sessionExpiryReason);
  const authUser = useSelector((s) => s.auth.user);

  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const timerRef = useRef(null);

  // Start countdown whenever modal opens
  useEffect(() => {
    if (isSessionExpired) {
      setTimeLeft(COUNTDOWN_SECONDS);
      setRefreshError('');
      setRefreshSuccess(false);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionExpired]);

  if (!isSessionExpired) return null;

  const handleAutoLogout = async () => {
    try {
      await apiLogout();
    } catch {}
    dispatch(logoutUser());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshError('');
    try {
      const data = await refreshAuth();
      setRefreshSuccess(true);
      setTimeout(() => {
        dispatch(resolveSessionExpired());
      }, 700);
    } catch (err) {
      setRefreshError(
        err.message || 'Session renewal failed. Please log in again to continue.'
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const percentLeft = Math.max(0, Math.min(100, (timeLeft / COUNTDOWN_SECONDS) * 100));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(10, 15, 29, 0.78)',
        backdropFilter: 'blur(10px)',
        padding: '1.25rem',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '1.25rem',
          boxShadow: '0 25px 60px -15px rgba(239, 68, 68, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          color: '#f8fafc',
          fontFamily: 'inherit',
        }}
      >
        {/* Top Warning Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(185, 28, 28, 0.08) 100%)',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f87171',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              Session Expired • सत्र समाप्त
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              Security timeout or authentication token ended
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.55, margin: '0 0 1rem' }}>
            Aapka login session expire ho chuka hai. Agar aap apna kaam continue rakhna chahte hain toh <strong>Refresh Session</strong> par click karein, ya safe exit ke liye <strong>Log Out</strong> karein.
          </p>

          {expiryReason && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '0.625rem',
                padding: '0.625rem 0.875rem',
                fontSize: '0.8rem',
                color: '#fca5a5',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>{expiryReason}</span>
            </div>
          )}

          {refreshSuccess && (
            <div
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '0.625rem',
                padding: '0.75rem',
                fontSize: '0.85rem',
                color: '#4ade80',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle2 size={18} />
              <span>Session refreshed successfully! Resuming your dashboard...</span>
            </div>
          )}

          {refreshError && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.625rem',
                padding: '0.75rem',
                fontSize: '0.82rem',
                color: '#fca5a5',
                marginBottom: '1rem',
              }}
            >
              {refreshError}
            </div>
          )}

          {/* Countdown timer & progress bar */}
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '0.75rem',
              padding: '0.875rem 1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.82rem',
                color: '#94a3b8',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Clock size={14} color="#f59e0b" />
                Automatic logout countdown:
              </span>
              <strong style={{ color: timeLeft <= 10 ? '#ef4444' : '#f59e0b', fontSize: '0.95rem' }}>
                {timeLeft}s
              </strong>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: '5px',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${percentLeft}%`,
                  backgroundColor: timeLeft <= 10 ? '#ef4444' : '#f59e0b',
                  transition: 'width 1s linear',
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleAutoLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#cbd5e1',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '0.625rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
            >
              <LogOut size={16} />
              Log Out Now
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#ffffff',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: '0.625rem',
                cursor: isRefreshing ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.4)',
                opacity: isRefreshing ? 0.75 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              <RotateCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Refreshing Session...' : 'Refresh Session (सत्र ताज़ा करें)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
