/**
 * Enterprise AI Platform - API Client
 *
 * Fully integrated with Spring Boot backend at http://localhost:9095
 * Postman Collection v2.1.0 compliant:
 * - Authentication: Register, Login, Refresh, Logout (Bearer Token Auth)
 * - Document Intake: Intake, List, Get, View/Download Original File, Delete
 * - Marketing: Import Contacts CSV, Get Contacts, AI Generate List,
 *              Customer Lists CRUD, Get Customer List Members
 * - Marketing Assets: List, Upload, Get, Preview, Download, Change Type, Delete
 */

export const getBackendBase = () => {
  if (typeof window !== 'undefined') {
    try {
      const override = localStorage.getItem('agentic_backend_url');
      if (override && override.includes(':9090')) {
        localStorage.removeItem('agentic_backend_url');
      } else if (override && override.trim()) {
        return override.trim();
      }
    } catch {}

    const hostname = window.location.hostname;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${window.location.protocol}//${hostname}:9095`;
    }
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  return 'http://localhost:9095';
};

export let BACKEND_URL = getBackendBase();
console.log('[API CLIENT] Configured BACKEND_URL:', BACKEND_URL);

export function setBackendBaseUrl(newUrl) {
  if (newUrl) {
    BACKEND_URL = newUrl.replace(/\/+$/, '');
    try {
      localStorage.setItem('agentic_backend_url', BACKEND_URL);
    } catch {}
  }
}

export const DEFAULT_TENANT_ID = '11111111-1111-1111-1111-111111111111';

// Token storage helpers
export const getAccessToken = () => {
  try {
    return localStorage.getItem('agentic_access_token') || '';
  } catch {
    return '';
  }
};

export const getRefreshToken = () => {
  try {
    return localStorage.getItem('agentic_refresh_token') || '';
  } catch {
    return '';
  }
};

export const setAuthTokens = (data) => {
  try {
    if (data?.accessToken) {
      localStorage.setItem('agentic_access_token', data.accessToken);
    }
    if (data?.refreshToken) {
      localStorage.setItem('agentic_refresh_token', data.refreshToken);
    }
  } catch {}
};

export const clearAuthTokens = () => {
  try {
    localStorage.removeItem('agentic_access_token');
    localStorage.removeItem('agentic_refresh_token');
  } catch {}
};

function getAuthHeaders(extra = {}) {
  const token = getAccessToken();
  const headers = { ...extra };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// User-friendly error message parser
async function parseErrorResponse(res, defaultMsg = 'Request failed') {
  let serverMessage = '';
  try {
    const clone = res.clone();
    const data = await clone.json();
    serverMessage = data.message || data.error || data.detail || '';
    if (data.errors && Array.isArray(data.errors)) {
      serverMessage = data.errors.map((e) => e.defaultMessage || e.message || JSON.stringify(e)).join(', ');
    }
  } catch {
    try {
      serverMessage = await res.text();
    } catch {}
  }

  if (res.status === 400) {
    return serverMessage && serverMessage !== 'Bad Request'
      ? serverMessage
      : 'Invalid or missing fields. Please check your inputs.';
  }
  if (res.status === 401) {
    return serverMessage && serverMessage !== 'Unauthorized'
      ? serverMessage
      : 'Invalid credentials or expired session. Please sign in again.';
  }
  if (res.status === 403) {
    return serverMessage || 'Access forbidden / registration disabled.';
  }
  if (res.status === 404) {
    return serverMessage || 'Resource not found. Please verify Tenant ID.';
  }
  if (res.status === 409) {
    return 'This email is already registered for this tenant. Please use Sign In instead.';
  }

  return serverMessage || `${defaultMsg} (${res.status})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. AUTHENTICATION APIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register User
 * POST /api/auth/register
 * Status: 201 Created
 */
export async function register({
  tenantId = DEFAULT_TENANT_ID,
  email,
  password,
  displayName,
}) {
  if (!email || !password || !displayName) {
    throw new Error('Email, password, and display name are required for registration.');
  }

  const payload = {
    tenantId: tenantId || DEFAULT_TENANT_ID,
    email: email.trim().toLowerCase(),
    password,
    displayName: displayName.trim(),
  };

  const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Registration failed');
    throw new Error(errMsg);
  }

  const data = await res.json();
  setAuthTokens(data);
  return data;
}

/**
 * Login User
 * POST /api/auth/login
 * Status: 200 OK
 */
export async function login({
  tenantId = DEFAULT_TENANT_ID,
  email,
  password,
}) {
  if (!email || !password) {
    throw new Error('Email and password are required for login.');
  }

  const payload = {
    tenantId: tenantId || DEFAULT_TENANT_ID,
    email: email.trim().toLowerCase(),
    password,
  };

  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Login failed');
    throw new Error(errMsg);
  }

  const data = await res.json();
  setAuthTokens(data);
  return data;
}

/**
 * Refresh Session Tokens
 * POST /api/auth/refresh
 * Body: {"refreshToken": "..."}
 * Status: 200 OK
 */
export async function refreshAuth() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available. Please sign in again.');
  }

  const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearAuthTokens();
    const errMsg = await parseErrorResponse(res, 'Session refresh failed');
    throw new Error(errMsg);
  }

  const data = await res.json();
  setAuthTokens(data);
  return data;
}

/**
 * Logout User
 * POST /api/auth/logout
 * Body: {"refreshToken": "..."}
 * Status: 204 No Content
 */
export async function logout() {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch (err) {
    console.warn('API logout notice:', err.message);
  } finally {
    clearAuthTokens();
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DOCUMENT INTAKE APIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Document Intake
 * POST /api/documents/intake
 * Header: Authorization: Bearer <accessToken>
 * Multipart/form-data: { file, documentType, source }
 * Status: 201 Created
 */
export async function intakeDocument({ file, documentType = 'INVOICE', source = 'Direct Upload' }) {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  formData.append('documentType', documentType);
  formData.append('source', source || 'Direct Upload');

  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/documents/intake`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/documents/intake`, {
          method: 'POST',
          headers,
          body: formData,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Document intake failed');
    throw new Error(errMsg);
  }

  return res.json();
}

/**
 * List Ingested Documents
 * GET /api/documents
 * Header: Authorization: Bearer <accessToken>
 * Status: 200 OK
 */
export async function listDocuments() {
  let headers = getAuthHeaders({ 'Accept': 'application/json' });

  let res = await fetch(`${BACKEND_URL}/api/documents`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Accept': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/documents`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to list documents');
    throw new Error(errMsg);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : (data.documents || data.items || []);
}

/**
 * Get Document Metadata & Extracted Text
 * GET /api/documents/:id
 * Header: Authorization: Bearer <accessToken>
 * Status: 200 OK
 */
export async function getDocument(documentId) {
  if (!documentId) throw new Error('documentId is required');

  let headers = getAuthHeaders({ 'Accept': 'application/json' });

  let res = await fetch(`${BACKEND_URL}/api/documents/${encodeURIComponent(documentId)}`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Accept': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/documents/${encodeURIComponent(documentId)}`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to get document');
    throw new Error(errMsg);
  }

  return res.json();
}

/**
 * View / Download Original File
 * GET /api/documents/:id/content
 * Header: Authorization: Bearer <accessToken>
 * Status: 200 OK
 */
export async function getDocumentContent(documentId) {
  if (!documentId) throw new Error('documentId is required');

  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/documents/${encodeURIComponent(documentId)}/content`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/documents/${encodeURIComponent(documentId)}/content`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to fetch original file');
    throw new Error(err);
  }

  const blob = await res.blob();
  const contentType = res.headers.get('content-type') || blob.type || 'application/octet-stream';
  const disposition = res.headers.get('content-disposition') || '';
  let filename = '';
  const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
  if (match) {
    filename = decodeURIComponent(match[1]);
  }

  return {
    blob,
    contentType,
    filename,
    blobUrl: URL.createObjectURL(blob),
  };
}

/**
 * Download original document helper
 */
export async function downloadDocumentFile(documentId, fallbackName = 'document') {
  const { blobUrl, filename } = await getDocumentContent(documentId);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename || fallbackName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
}

/**
 * Delete Document
 * DELETE /api/documents/:documentId
 * Header: Authorization: Bearer <accessToken>
 * Status: 204 No Content
 */
export async function deleteDocument(documentId) {
  if (!documentId) throw new Error('documentId is required');
  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/documents/${encodeURIComponent(documentId)}`, {
    method: 'DELETE',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/documents/${encodeURIComponent(documentId)}`, {
          method: 'DELETE',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok && res.status !== 204) {
    const err = await parseErrorResponse(res, 'Delete document failed');
    throw new Error(err);
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MARKETING: CONTACTS APIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Import Customer Contacts from CSV
 * POST /api/marketing/contacts/import
 * Multipart: file (CSV)
 * Required header: email. Optional: firstName, lastName, company, title,
 *   industry, country, annualRevenue, customerStatus, churnProbability
 * Status: 200 OK — returns array of imported contact objects
 */
export async function importContacts(file, folderName = '', targetListId = '') {
  if (!file) throw new Error('CSV file is required');

  const formData = new FormData();
  formData.append('file', file);
  if (folderName && folderName.trim()) {
    formData.append('folderName', folderName.trim());
  }
  if (targetListId && targetListId.trim()) {
    formData.append('targetListId', targetListId.trim());
  }

  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/contacts/import`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/contacts/import`, {
          method: 'POST',
          headers,
          body: formData,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Contact import failed');
    throw new Error(err);
  }

  const data = await res.json();
  return data;
}

/**
 * Delete All Imported Contacts for Tenant
 * DELETE /api/marketing/contacts
 */
export async function deleteAllContacts() {
  let headers = getAuthHeaders();
  let res = await fetch(`${BACKEND_URL}/api/marketing/contacts`, {
    method: 'DELETE',
    headers,
  });
  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/contacts`, {
          method: 'DELETE',
          headers,
        });
      }
    } catch {}
  }
  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to delete all contacts');
    throw new Error(err);
  }
  return true;
}

/**
 * Delete Single Contact
 * DELETE /api/marketing/contacts/:id
 */
export async function deleteContact(id) {
  if (!id) throw new Error('Contact ID is required');
  let headers = getAuthHeaders();
  let res = await fetch(`${BACKEND_URL}/api/marketing/contacts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
  });
  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/contacts/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers,
        });
      }
    } catch {}
  }
  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to delete contact');
    throw new Error(err);
  }
  return true;
}

/**
 * Get Imported Contacts
 * GET /api/marketing/contacts
 * Header: Authorization: Bearer <accessToken>
 */
export async function listContacts() {
  let headers = getAuthHeaders({ 'Accept': 'application/json' });

  let res = await fetch(`${BACKEND_URL}/api/marketing/contacts`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Accept': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/contacts`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Fetch contacts failed');
    throw new Error(err);
  }

  const data = await res.json();
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MARKETING: CUSTOMER LISTS APIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List Customer Lists
 * GET /api/marketing/customer-lists
 * Header: Authorization: Bearer <accessToken>
 */
export async function listCustomerLists() {
  let headers = getAuthHeaders({ 'Accept': 'application/json' });

  let res = await fetch(`${BACKEND_URL}/api/marketing/customer-lists`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Accept': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/customer-lists`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Fetch customer lists failed');
    throw new Error(err);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : (data.items || data.data || []);
}

/**
 * Get Single Customer List
 * GET /api/marketing/customer-lists/:id
 * Header: Authorization: Bearer <accessToken>
 */
export async function getCustomerList(customerListId) {
  if (!customerListId) throw new Error('customerListId is required');
  let headers = getAuthHeaders({ 'Accept': 'application/json' });

  let res = await fetch(`${BACKEND_URL}/api/marketing/customer-lists/${encodeURIComponent(customerListId)}`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Accept': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/customer-lists/${encodeURIComponent(customerListId)}`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Get customer list failed');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Create Customer List
 * POST /api/marketing/customer-lists
 * Header: Authorization: Bearer <accessToken>
 * Status: 201 Created
 */
export async function createCustomerList({
  name,
  description,
  contacts = 50,
  conversionRate = 18.0,
  segment = 'Enterprise',
  status = 'ACTIVE',
  aiGenerated = true,
}) {
  if (!name || !description) {
    throw new Error('Name and description are required for creating a customer list');
  }

  let headers = getAuthHeaders({ 'Content-Type': 'application/json' });

  const payload = {
    name: name.trim(),
    description: description.trim(),
    contacts: Number(contacts) || 0,
    conversionRate: Number(conversionRate) || 0.0,
    segment: segment.trim() || 'Enterprise',
    status: status === 'BUILDING' ? 'BUILDING' : 'ACTIVE',
    aiGenerated: Boolean(aiGenerated),
  };

  let res = await fetch(`${BACKEND_URL}/api/marketing/customer-lists`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Content-Type': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/customer-lists`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Create customer list failed');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Update Customer List
 * PUT /api/marketing/customer-lists/:id
 * Header: Authorization: Bearer <accessToken>
 * Status: 200 OK
 */
export async function updateCustomerList(customerListId, {
  name,
  description,
  contacts,
  conversionRate,
  segment,
  status,
  aiGenerated,
}) {
  if (!customerListId) throw new Error('customerListId is required');

  let headers = getAuthHeaders({ 'Content-Type': 'application/json' });

  const payload = {
    name: name?.trim(),
    description: description?.trim(),
    contacts: contacts != null ? Number(contacts) : 50,
    conversionRate: conversionRate != null ? Number(conversionRate) : 18.0,
    segment: segment?.trim() || 'Enterprise',
    status: status === 'BUILDING' ? 'BUILDING' : 'ACTIVE',
    aiGenerated: aiGenerated != null ? Boolean(aiGenerated) : true,
  };

  let res = await fetch(`${BACKEND_URL}/api/marketing/customer-lists/${encodeURIComponent(customerListId)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Content-Type': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/customer-lists/${encodeURIComponent(customerListId)}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Update customer list failed');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Delete Customer List
 * DELETE /api/marketing/customer-lists/:id
 * Header: Authorization: Bearer <accessToken>
 * Status: 204 No Content
 */
export async function deleteCustomerList(customerListId) {
  if (!customerListId) throw new Error('customerListId is required');

  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/customer-lists/${encodeURIComponent(customerListId)}`, {
    method: 'DELETE',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/customer-lists/${encodeURIComponent(customerListId)}`, {
          method: 'DELETE',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok && res.status !== 204) {
    const err = await parseErrorResponse(res, 'Delete customer list failed');
    throw new Error(err);
  }

  return true;
}

/**
 * AI Generate Customer List from imported contacts
 * POST /api/marketing/customer-lists/ai-generate
 * Body: { prompt: string, name: string, sourceListId?: string }
 * Header: Authorization: Bearer <accessToken>
 * Status: 201 Created
 */
export async function aiGenerateCustomerList({ prompt, name, sourceListId = null }) {
  if (!prompt || !name) throw new Error('Both prompt and name are required');

  let headers = getAuthHeaders({ 'Content-Type': 'application/json' });
  const payload = {
    prompt: prompt.trim(),
    name: name.trim(),
    ...(sourceListId ? { sourceListId } : {}),
  };

  let res = await fetch(`${BACKEND_URL}/api/marketing/customer-lists/ai-generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Content-Type': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/customer-lists/ai-generate`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'AI customer list generation failed');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Get contacts assigned to a specific customer list
 * GET /api/marketing/customer-lists/:id/contacts
 * Header: Authorization: Bearer <accessToken>
 */
export async function getCustomerListContacts(customerListId) {
  if (!customerListId) throw new Error('customerListId is required');

  let headers = getAuthHeaders({ 'Accept': 'application/json' });

  let res = await fetch(`${BACKEND_URL}/api/marketing/customer-lists/${encodeURIComponent(customerListId)}/contacts`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Accept': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/customer-lists/${encodeURIComponent(customerListId)}/contacts`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Fetch customer list contacts failed');
    throw new Error(err);
  }

  const data = await res.json();
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MARKETING: BROCHURES & CATALOGS ASSETS APIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List Marketing Assets (Brochures & Catalogs)
 * GET /api/marketing/assets
 * Header: Authorization: Bearer <accessToken>
 * Status: 200 OK
 */
export async function listMarketingAssets() {
  let headers = getAuthHeaders({ 'Accept': 'application/json' });

  let res = await fetch(`${BACKEND_URL}/api/marketing/assets`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Accept': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/assets`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to list marketing assets');
    throw new Error(err);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : (data.assets || data.items || data.data || []);
}

/**
 * List Marketing Asset Folders
 * GET /api/marketing/assets/folders
 * Header: Authorization: Bearer <accessToken>
 * Status: 200 OK
 */
export async function listMarketingAssetFolders() {
  let headers = getAuthHeaders({ 'Accept': 'application/json' });

  let res = await fetch(`${BACKEND_URL}/api/marketing/assets/folders`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Accept': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/assets/folders`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to list asset folders');
    throw new Error(err);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Upload Brochure or Catalog Asset
 * POST /api/marketing/assets
 * Multipart/form-data: { file, type: "BROCHURE" | "CATALOG", folder?: string }
 * Header: Authorization: Bearer <accessToken>
 * Maximum 20 MiB
 * Status: 201 Created
 */
export async function uploadMarketingAsset({ file, type = 'BROCHURE', folder = 'General' }) {
  if (!file) throw new Error('File is required for upload');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  formData.append('folder', folder || 'General');

  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/assets`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/assets`, {
          method: 'POST',
          headers,
          body: formData,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to upload marketing asset');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Bulk Upload Brochures or Catalogs to Folder
 * POST /api/marketing/assets/bulk
 * Multipart/form-data: { files (up to 50), type: "BROCHURE" | "CATALOG", folder: string }
 * Header: Authorization: Bearer <accessToken>
 * Status: 201 Created
 */
export async function uploadMarketingAssetsBulk({ files, type = 'CATALOG', folder = 'General' }) {
  if (!files || !files.length) throw new Error('At least one file is required');
  if (files.length > 50) throw new Error('Maximum 50 files allowed per bulk upload');

  const formData = new FormData();
  for (const f of files) {
    formData.append('files', f);
  }
  formData.append('type', type);
  formData.append('folder', folder || 'General');

  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/assets/bulk`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/assets/bulk`, {
          method: 'POST',
          headers,
          body: formData,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to bulk upload marketing assets');
    throw new Error(err);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

/**
 * Get Single Marketing Asset Metadata
 * GET /api/marketing/assets/:id
 * Header: Authorization: Bearer <accessToken>
 * Status: 200 OK
 */
export async function getMarketingAsset(assetId) {
  if (!assetId) throw new Error('assetId is required');

  let headers = getAuthHeaders({ 'Accept': 'application/json' });

  let res = await fetch(`${BACKEND_URL}/api/marketing/assets/${encodeURIComponent(assetId)}`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Accept': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/assets/${encodeURIComponent(assetId)}`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to get marketing asset');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Preview / Stream Marketing Asset Content
 * GET /api/marketing/assets/:id/content
 * Header: Authorization: Bearer <accessToken>
 * Status: 200 OK
 */
export async function previewMarketingAsset(assetId) {
  if (!assetId) throw new Error('assetId is required');

  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/assets/${encodeURIComponent(assetId)}/content`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/assets/${encodeURIComponent(assetId)}/content`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to preview marketing asset');
    throw new Error(err);
  }

  const blob = await res.blob();
  const contentType = res.headers.get('content-type') || blob.type || 'application/octet-stream';
  const disposition = res.headers.get('content-disposition') || '';
  let filename = '';
  const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
  if (match) {
    filename = decodeURIComponent(match[1]);
  }

  return {
    blob,
    contentType,
    filename,
    blobUrl: URL.createObjectURL(blob),
  };
}

/**
 * Download Marketing Asset
 * GET /api/marketing/assets/:id/content?download=true
 * Header: Authorization: Bearer <accessToken>
 * Status: 200 OK
 */
export async function downloadMarketingAsset(assetId, fallbackName = 'asset') {
  if (!assetId) throw new Error('assetId is required');

  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/assets/${encodeURIComponent(assetId)}/content?download=true`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/assets/${encodeURIComponent(assetId)}/content?download=true`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to download marketing asset');
    throw new Error(err);
  }

  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition') || '';
  let filename = '';
  const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
  if (match) {
    filename = decodeURIComponent(match[1]);
  }

  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename || fallbackName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
}

/**
 * Change Marketing Asset Type
 * PUT /api/marketing/assets/:id
 * Multipart/form-data: { type: "BROCHURE" | "CATALOG" }
 * Header: Authorization: Bearer <accessToken>
 * Status: 200 OK
 */
export async function changeMarketingAssetType(assetId, newType) {
  if (!assetId) throw new Error('assetId is required');
  if (!newType) throw new Error('newType is required (BROCHURE or CATALOG)');

  const formData = new FormData();
  formData.append('type', newType);

  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/assets/${encodeURIComponent(assetId)}`, {
    method: 'PUT',
    headers,
    body: formData,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/assets/${encodeURIComponent(assetId)}`, {
          method: 'PUT',
          headers,
          body: formData,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to change marketing asset type');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Delete Marketing Asset
 * DELETE /api/marketing/assets/:id
 * Header: Authorization: Bearer <accessToken>
 * Status: 204 No Content
 */
export async function deleteMarketingAsset(assetId) {
  if (!assetId) throw new Error('assetId is required');

  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/assets/${encodeURIComponent(assetId)}`, {
    method: 'DELETE',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/assets/${encodeURIComponent(assetId)}`, {
          method: 'DELETE',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok && res.status !== 204) {
    const err = await parseErrorResponse(res, 'Delete marketing asset failed');
    throw new Error(err);
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MARKETING: DOMAIN CAMPAIGNS, TEMPLATES & AI CONTENT STUDIO APIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find Marketing Contacts by Domain
 * GET /api/marketing/contacts?domain=:contactDomain
 * Header: Authorization: Bearer <accessToken>
 * Status: 200 OK
 */
export async function getContactsByDomain(domain) {
  let url = `${BACKEND_URL}/api/marketing/contacts`;
  if (domain && domain.trim()) {
    url += `?domain=${encodeURIComponent(domain.trim())}`;
  }

  let headers = getAuthHeaders({ 'Accept': 'application/json' });
  let res = await fetch(url, { method: 'GET', headers });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Accept': 'application/json' });
        res = await fetch(url, { method: 'GET', headers });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to fetch contacts by domain');
    throw new Error(err);
  }

  const data = await res.json();
  return data;
}

/**
 * Generate AI Email Draft
 * POST /api/marketing/content/generate
 * Header: Authorization: Bearer <accessToken>
 * Body: { targetDomain, industry, tone, topic, callToAction }
 * Status: 200 OK
 */
export async function generateAiEmailDraft({
  targetDomain = 'volvo.se',
  industry = 'Automotive',
  tone = 'EXECUTIVE',
  topic = 'ERP Modernisation & AI Supply Chain Integration',
  callToAction = 'Schedule a 15-min Architecture Review',
  prompt = '',
  sourceAssetId = '',
}) {
  let headers = getAuthHeaders({ 'Content-Type': 'application/json' });
  const payload = { targetDomain, industry, tone, topic, callToAction, prompt, sourceAssetId };

  let res = await fetch(`${BACKEND_URL}/api/marketing/content/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Content-Type': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/content/generate`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'AI email draft generation failed');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Send Bulk Marketing Campaign
 * POST /api/marketing/campaigns/send-bulk
 * Header: Authorization: Bearer <accessToken>
 * Body: FormData (multipart/form-data)
 * Fields: campaignName, targetDomain, subject, contentHtml, senderName, replyTo, variables, attachment (optional)
 * Status: 202 Accepted
 */
export async function sendBulkCampaign({
  campaignName,
  targetDomain,
  targetListId,
  directEmail,
  directFirstName,
  directLastName,
  directCompany,
  subject,
  contentHtml,
  fromEmail = '',
  senderName = 'Oxygen to Innovation',
  replyTo = 'ab2@o2i.tech',
  cc = '',
  bcc = '',
  variables = ['firstName', 'lastName', 'company', 'senderName', 'email'],
  attachment = null,
}) {
  if (!campaignName || !subject || !contentHtml) {
    throw new Error('campaignName, subject, and contentHtml are required');
  }

  const formData = new FormData();
  formData.append('campaignName', campaignName);
  if (directEmail) formData.append('directEmail', directEmail);
  if (directFirstName) formData.append('directFirstName', directFirstName);
  if (directLastName) formData.append('directLastName', directLastName);
  if (directCompany) formData.append('directCompany', directCompany);
  if (targetListId) formData.append('targetListId', targetListId);
  if (targetDomain) formData.append('targetDomain', targetDomain);
  formData.append('subject', subject);
  formData.append('contentHtml', contentHtml);
  if (fromEmail) formData.append('fromEmail', fromEmail);
  if (senderName) formData.append('senderName', senderName);
  if (replyTo) formData.append('replyTo', replyTo);
  if (cc && cc.trim()) formData.append('cc', cc.trim());
  if (bcc && bcc.trim()) formData.append('bcc', bcc.trim());

  if (Array.isArray(variables)) {
    variables.forEach((v) => formData.append('variables', v));
  } else if (variables) {
    formData.append('variables', variables);
  }

  if (attachment) {
    formData.append('attachment', attachment);
  }

  let headers = getAuthHeaders(); // browser automatically sets boundary for FormData

  let res = await fetch(`${BACKEND_URL}/api/marketing/campaigns/send-bulk`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/campaigns/send-bulk`, {
          method: 'POST',
          headers,
          body: formData,
        });
      }
    } catch {}
  }

  if (!res.ok && res.status !== 202) {
    const err = await parseErrorResponse(res, 'Failed to launch bulk campaign');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Get Campaign Status
 * GET /api/marketing/campaigns/:campaignId/status
 * Header: Authorization: Bearer <accessToken>
 * Status: 200 OK
 */
export async function getCampaignStatus(campaignId) {
  if (!campaignId) throw new Error('campaignId is required');

  let headers = getAuthHeaders({ 'Accept': 'application/json' });
  let res = await fetch(`${BACKEND_URL}/api/marketing/campaigns/${encodeURIComponent(campaignId)}/status`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Accept': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/campaigns/${encodeURIComponent(campaignId)}/status`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to get campaign status');
    throw new Error(err);
  }

  return res.json();
}

/**
 * List Dispatched Campaigns from Backend
 * GET /api/marketing/campaigns
 * Header: Authorization: Bearer <accessToken>
 * Status: 200 OK
 */
export async function listCampaigns() {
  let headers = getAuthHeaders({ 'Accept': 'application/json' });
  let res = await fetch(`${BACKEND_URL}/api/marketing/campaigns`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Accept': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/campaigns`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    return [];
  }

  return res.json();
}

/**
 * Get Configured Senders from Backend Environment
 * GET /api/marketing/campaigns/senders
 * Header: Authorization: Bearer <accessToken>
 * Status: 200 OK
 */
export async function getSenderConfig() {
  let headers = getAuthHeaders({ 'Accept': 'application/json' });
  let res = await fetch(`${BACKEND_URL}/api/marketing/campaigns/senders`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Accept': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/campaigns/senders`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    return { smtpConfigured: false, defaultSender: '', allowedSenders: [] };
  }

  return res.json();
}

/**
 * List Email Templates
 * GET /api/marketing/templates
 * Header: Authorization: Bearer <accessToken>
 * Status: 200 OK
 */
export async function listEmailTemplates() {
  let headers = getAuthHeaders({ 'Accept': 'application/json' });
  let res = await fetch(`${BACKEND_URL}/api/marketing/templates`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Accept': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/templates`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to list email templates');
    throw new Error(err);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : (data.templates || data.items || data.data || []);
}

/**
 * Create Email Template
 * POST /api/marketing/templates
 * Header: Authorization: Bearer <accessToken>
 * Body: { name, subject, contentHtml, contentText, industry, tone }
 * Status: 201 Created
 */
export async function createEmailTemplate({
  name,
  subject,
  contentHtml,
  contentText,
  industry = 'General',
  tone = 'EXECUTIVE',
}) {
  if (!name || !subject || !contentHtml) {
    throw new Error('name, subject, and contentHtml are required');
  }

  let headers = getAuthHeaders({ 'Content-Type': 'application/json' });
  const payload = {
    name,
    subject,
    contentHtml,
    contentText: contentText || contentHtml.replace(/<[^>]+>/g, ''),
    industry,
    tone,
  };

  let res = await fetch(`${BACKEND_URL}/api/marketing/templates`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Content-Type': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/templates`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to create email template');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Delete Email Template
 * DELETE /api/marketing/templates/:templateId
 * Header: Authorization: Bearer <accessToken>
 * Status: 204 No Content
 */
export async function deleteEmailTemplate(templateId) {
  if (!templateId) throw new Error('templateId is required');

  let headers = getAuthHeaders();
  let res = await fetch(`${BACKEND_URL}/api/marketing/templates/${encodeURIComponent(templateId)}`, {
    method: 'DELETE',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/templates/${encodeURIComponent(templateId)}`, {
          method: 'DELETE',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok && res.status !== 204) {
    const err = await parseErrorResponse(res, 'Failed to delete email template');
    throw new Error(err);
  }

  return true;
}

// ==========================================
// MARKETING - PROPOSALS API
// ==========================================

/**
 * Generate AI Proposal Draft
 * POST /api/marketing/proposals/generate
 */
export async function generateAiProposal(payload) {
  let headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  let res = await fetch(`${BACKEND_URL}/api/marketing/proposals/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
        res = await fetch(`${BACKEND_URL}/api/marketing/proposals/generate`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to generate AI proposal draft');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Create Proposal Draft
 * POST /api/marketing/proposals
 */
export async function createProposal(payload) {
  let headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  let res = await fetch(`${BACKEND_URL}/api/marketing/proposals`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
        res = await fetch(`${BACKEND_URL}/api/marketing/proposals`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to create proposal draft');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Upload Existing Proposal Document
 * POST /api/marketing/proposals/upload
 * Multipart form data: file, clientCompany, contactName, contactEmail, industry, useCase, budget, timeline, status, services
 */
export async function uploadProposalDocument(formData) {
  let headers = getAuthHeaders();
  delete headers['Content-Type'];

  let res = await fetch(`${BACKEND_URL}/api/marketing/proposals/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        const freshHeaders = getAuthHeaders();
        delete freshHeaders['Content-Type'];
        res = await fetch(`${BACKEND_URL}/api/marketing/proposals/upload`, {
          method: 'POST',
          headers: freshHeaders,
          body: formData,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to upload proposal document');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Download Proposal Original Document File
 * GET /api/marketing/proposals/:id/document
 */
export async function downloadProposalDocument(proposalId, fallbackFilename = 'proposal-document.pdf') {
  if (!proposalId) throw new Error('proposalId is required');
  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/proposals/${encodeURIComponent(proposalId)}/document`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/proposals/${encodeURIComponent(proposalId)}/document`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to download proposal document');
    throw new Error(err);
  }

  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition') || '';
  let filename = fallbackFilename;
  const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
  if (match) {
    filename = decodeURIComponent(match[1]);
  }

  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  return filename;
}

/**
 * Fetch Proposal Original Document as Raw Blob
 * GET /api/marketing/proposals/:id/document
 */
export async function getProposalDocumentBlob(proposalId) {
  if (!proposalId) throw new Error('proposalId is required');
  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/proposals/${encodeURIComponent(proposalId)}/document`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/proposals/${encodeURIComponent(proposalId)}/document`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to fetch proposal document');
    throw new Error(err);
  }

  return await res.blob();
}

/**
 * List Proposals
 * GET /api/marketing/proposals
 */
export async function listProposals() {
  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/proposals`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/proposals`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to fetch proposals');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Get Proposal by ID
 * GET /api/marketing/proposals/:proposalId
 */
export async function getProposal(proposalId) {
  if (!proposalId) throw new Error('proposalId is required');

  let headers = getAuthHeaders();
  let res = await fetch(`${BACKEND_URL}/api/marketing/proposals/${encodeURIComponent(proposalId)}`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/proposals/${encodeURIComponent(proposalId)}`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to fetch proposal');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Update Proposal Content and Deal Status
 * PUT /api/marketing/proposals/:proposalId
 */
export async function updateProposal(proposalId, payload) {
  if (!proposalId) throw new Error('proposalId is required');

  let headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  let res = await fetch(`${BACKEND_URL}/api/marketing/proposals/${encodeURIComponent(proposalId)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
        res = await fetch(`${BACKEND_URL}/api/marketing/proposals/${encodeURIComponent(proposalId)}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to update proposal');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Send Proposal Email
 * POST /api/marketing/proposals/:proposalId/send
 * Supports optional multipart FormData or options: { subject, contentHtml, replyTo, attachment }
 */
export async function sendProposalEmail(proposalId, options = {}) {
  if (!proposalId) throw new Error('proposalId is required');

  let body;
  if (options instanceof FormData) {
    body = options;
  } else {
    body = new FormData();
    if (options.subject) body.append('subject', options.subject);
    if (options.contentHtml) body.append('contentHtml', options.contentHtml);
    if (options.replyTo) body.append('replyTo', options.replyTo);
    if (options.attachment) body.append('attachment', options.attachment);
  }

  const authHeaders = getAuthHeaders();
  let headers = { ...authHeaders };
  delete headers['Content-Type'];

  let res = await fetch(`${BACKEND_URL}/api/marketing/proposals/${encodeURIComponent(proposalId)}/send`, {
    method: 'POST',
    headers,
    body,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        const freshHeaders = getAuthHeaders();
        delete freshHeaders['Content-Type'];
        res = await fetch(`${BACKEND_URL}/api/marketing/proposals/${encodeURIComponent(proposalId)}/send`, {
          method: 'POST',
          headers: freshHeaders,
          body,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to send proposal email');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Get Proposal Pipeline Totals
 * GET /api/marketing/proposals/pipeline
 */
export async function getProposalPipeline() {
  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/proposals/pipeline`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/proposals/pipeline`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to fetch proposal pipeline');
    throw new Error(err);
  }

  return res.json();
}

// ─── CUSTOMER 360 & ACCOUNT INTELLIGENCE ──────────────────────────────────────

/**
 * List Customer 360 Accounts with optional filters
 * GET /api/marketing/customer-360?q=...&industry=...&tier=...&status=...
 */
export async function listCustomer360Accounts({ q = '', industry = '', tier = '', status = '' } = {}) {
  let headers = getAuthHeaders();
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (industry) params.append('industry', industry);
  if (tier) params.append('tier', tier);
  if (status) params.append('status', status);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  let res = await fetch(`${BACKEND_URL}/api/marketing/customer-360${queryStr}`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/customer-360${queryStr}`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to list customer 360 accounts');
    throw new Error(err);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Create Customer 360 Account
 * POST /api/marketing/customer-360
 */
export async function createCustomer360Account(accountData) {
  let headers = getAuthHeaders({ 'Content-Type': 'application/json' });

  let res = await fetch(`${BACKEND_URL}/api/marketing/customer-360`, {
    method: 'POST',
    headers,
    body: JSON.stringify(accountData),
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Content-Type': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/customer-360`, {
          method: 'POST',
          headers,
          body: JSON.stringify(accountData),
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to create customer 360 account');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Get Customer 360 Account by ID
 * GET /api/marketing/customer-360/:id
 */
export async function getCustomer360Account(accountId) {
  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/customer-360/${encodeURIComponent(accountId)}`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/customer-360/${encodeURIComponent(accountId)}`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to get customer 360 account');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Update Customer 360 Account by ID
 * PUT /api/marketing/customer-360/:id
 */
export async function updateCustomer360Account(accountId, accountData) {
  let headers = getAuthHeaders({ 'Content-Type': 'application/json' });

  let res = await fetch(`${BACKEND_URL}/api/marketing/customer-360/${encodeURIComponent(accountId)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(accountData),
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Content-Type': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/customer-360/${encodeURIComponent(accountId)}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(accountData),
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to update customer 360 account');
    throw new Error(err);
  }

  return res.json();
}

/**
 * List Telemetry Signals for Account
 * GET /api/marketing/customer-360/:id/signals
 */
export async function listCustomer360Signals(accountId) {
  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/customer-360/${encodeURIComponent(accountId)}/signals`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/customer-360/${encodeURIComponent(accountId)}/signals`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to list telemetry signals');
    throw new Error(err);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Add Telemetry Signal for Account
 * POST /api/marketing/customer-360/:id/signals
 */
export async function addCustomer360Signal(accountId, signalData) {
  let headers = getAuthHeaders({ 'Content-Type': 'application/json' });

  let res = await fetch(`${BACKEND_URL}/api/marketing/customer-360/${encodeURIComponent(accountId)}/signals`, {
    method: 'POST',
    headers,
    body: JSON.stringify(signalData),
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Content-Type': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/customer-360/${encodeURIComponent(accountId)}/signals`, {
          method: 'POST',
          headers,
          body: JSON.stringify(signalData),
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to add telemetry signal');
    throw new Error(err);
  }

  return res.json();
}

/**
 * List NBO Recommendations for Account
 * GET /api/marketing/customer-360/:id/offers
 */
export async function listCustomer360Offers(accountId) {
  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/customer-360/${encodeURIComponent(accountId)}/offers`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/customer-360/${encodeURIComponent(accountId)}/offers`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to list NBO recommendations');
    throw new Error(err);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Add NBO Recommendation for Account
 * POST /api/marketing/customer-360/:id/offers
 */
export async function addCustomer360Offer(accountId, offerData) {
  let headers = getAuthHeaders({ 'Content-Type': 'application/json' });

  let res = await fetch(`${BACKEND_URL}/api/marketing/customer-360/${encodeURIComponent(accountId)}/offers`, {
    method: 'POST',
    headers,
    body: JSON.stringify(offerData),
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Content-Type': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/customer-360/${encodeURIComponent(accountId)}/offers`, {
          method: 'POST',
          headers,
          body: JSON.stringify(offerData),
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to add NBO recommendation');
    throw new Error(err);
  }

  return res.json();
}

// ══════════════════════════════════════════════════════════════════
// MARKETING - SEO KEYWORDS INTELLIGENCE
// ══════════════════════════════════════════════════════════════════

/**
 * List SEO Keywords
 * GET /api/marketing/seo/keywords?q={q}&maxDifficulty={maxDifficulty}
 */
export async function listSeoKeywords({ q = '', maxDifficulty = 100 } = {}) {
  let headers = getAuthHeaders();
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (maxDifficulty !== null && maxDifficulty !== undefined) params.set('maxDifficulty', maxDifficulty);
  const queryStr = params.toString() ? `?${params.toString()}` : '';

  let res = await fetch(`${BACKEND_URL}/api/marketing/seo/keywords${queryStr}`, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/seo/keywords${queryStr}`, {
          method: 'GET',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to fetch SEO keywords');
    throw new Error(err);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Create SEO Keyword
 * POST /api/marketing/seo/keywords
 */
export async function createSeoKeyword(keywordData) {
  let headers = getAuthHeaders({ 'Content-Type': 'application/json' });

  let res = await fetch(`${BACKEND_URL}/api/marketing/seo/keywords`, {
    method: 'POST',
    headers,
    body: JSON.stringify(keywordData),
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders({ 'Content-Type': 'application/json' });
        res = await fetch(`${BACKEND_URL}/api/marketing/seo/keywords`, {
          method: 'POST',
          headers,
          body: JSON.stringify(keywordData),
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to create SEO keyword');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Delete SEO Keyword
 * DELETE /api/marketing/seo/keywords/{id}
 */
export async function deleteSeoKeyword(seoKeywordId) {
  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/seo/keywords/${encodeURIComponent(seoKeywordId)}`, {
    method: 'DELETE',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/seo/keywords/${encodeURIComponent(seoKeywordId)}`, {
          method: 'DELETE',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok && res.status !== 204) {
    const err = await parseErrorResponse(res, 'Failed to delete SEO keyword');
    throw new Error(err);
  }

  return true;
}

/**
 * Optimize SEO Keyword (Groq AI)
 * POST /api/marketing/seo/keywords/{id}/optimize
 */
export async function optimizeSeoKeyword(seoKeywordId) {
  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/seo/keywords/${encodeURIComponent(seoKeywordId)}/optimize`, {
    method: 'POST',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/seo/keywords/${encodeURIComponent(seoKeywordId)}/optimize`, {
          method: 'POST',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to optimize SEO keyword');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Run Demo SEO Sweep
 * POST /api/marketing/seo/sweep
 */
export async function runSeoSweep() {
  let headers = getAuthHeaders();

  let res = await fetch(`${BACKEND_URL}/api/marketing/seo/sweep`, {
    method: 'POST',
    headers,
  });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshed = await refreshAuth();
      if (refreshed?.accessToken) {
        headers = getAuthHeaders();
        res = await fetch(`${BACKEND_URL}/api/marketing/seo/sweep`, {
          method: 'POST',
          headers,
        });
      }
    } catch {}
  }

  if (!res.ok) {
    const err = await parseErrorResponse(res, 'Failed to run SEO sweep');
    throw new Error(err);
  }

  return res.json();
}

/**
 * Get SEO Live Provider Config
 * GET /api/marketing/seo/config
 */
export async function getSeoConfig() {
  let headers = getAuthHeaders();
  try {
    let res = await fetch(`${BACKEND_URL}/api/marketing/seo/config`, { method: 'GET', headers });
    if (!res.ok) return { liveProviderConfigured: false, provider: 'Demo Simulation Engine' };
    return res.json();
  } catch {
    return { liveProviderConfigured: false, provider: 'Demo Simulation Engine' };
  }
}

/**
 * Check Rank for single keyword
 * POST /api/marketing/seo/keywords/{id}/check-rank
 */
export async function checkKeywordRank(seoKeywordId) {
  let headers = getAuthHeaders();
  let res = await fetch(`${BACKEND_URL}/api/marketing/seo/keywords/${encodeURIComponent(seoKeywordId)}/check-rank`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) throw new Error('Failed to check keyword rank');
  return res.json();
}


