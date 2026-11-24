import { createSlice } from '@reduxjs/toolkit';

const savedUser = (() => {
  try {
    const raw = localStorage.getItem('agentic_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const DEFAULT_TENANT = '11111111-1111-1111-1111-111111111111';

const initialState = {
  isAuthenticated: !!savedUser,
  user: savedUser || null,
  tenantId: savedUser?.tenantId || DEFAULT_TENANT,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  isAuthModalOpen: false,
  authModalMode: 'login', // 'login' | 'register'
  isSessionExpired: false,
  sessionExpiryReason: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticatedUser: (state, action) => {
      state.isAuthenticated = true;
      state.user = {
        ...(state.user || {}),
        ...action.payload,
      };
      state.tenantId = action.payload.tenantId || state.tenantId;
      state.status = 'succeeded';
      state.error = null;
      try {
        localStorage.setItem('agentic_auth_user', JSON.stringify(state.user));
      } catch (err) {
        console.warn('Could not persist auth user:', err);
      }
    },
    logoutUser: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      state.isSessionExpired = false;
      state.sessionExpiryReason = '';
      try {
        localStorage.removeItem('agentic_auth_user');
        // Tokens are cleared by apiClient.logout() via clearAuthTokens()
        // but belt-and-suspenders removal here too
        localStorage.removeItem('agentic_access_token');
        localStorage.removeItem('agentic_refresh_token');
      } catch (err) {
        console.warn('Could not remove auth data:', err);
      }
    },
    setTenantId: (state, action) => {
      state.tenantId = action.payload;
      if (state.user) {
        state.user.tenantId = action.payload;
      }
    },
    openAuthModal: (state, action) => {
      state.isAuthModalOpen = true;
      state.authModalMode = action.payload || 'login';
      state.error = null;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
      state.error = null;
    },
    setAuthStatus: (state, action) => {
      state.status = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    triggerSessionExpired: (state, action) => {
      state.isSessionExpired = true;
      state.sessionExpiryReason = action.payload || 'Security token expired. Please refresh your session or sign in again.';
    },
    resolveSessionExpired: (state) => {
      state.isSessionExpired = false;
      state.sessionExpiryReason = '';
    },
  },
});

export const {
  setAuthenticatedUser,
  logoutUser,
  setTenantId,
  openAuthModal,
  closeAuthModal,
  setAuthStatus,
  setAuthError,
  triggerSessionExpired,
  resolveSessionExpired,
} = authSlice.actions;

export default authSlice.reducer;
