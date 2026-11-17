/**
 * Agentic AI Platform - Postman Collection & API Client
 * Fully implements all APIs from postman/agentic-ai-platform.postman_collection.json:
 * 1. POST /api/auth/register (Register)
 * 2. POST /api/auth/login (Login)
 * 3. POST /api/auth/refresh (Refresh)
 * 4. POST /api/auth/logout (Logout)
 * 5. POST /api/documents/intake (Intake Document - Multipart)
 * 6. GET /api/documents (List Documents)
 * 7. GET /api/documents/{{documentId}} (Get Document)
 */

class ApiError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

class AgenticApiClient {
    constructor() {
        // Load initial Postman variables from collection defaults or localStorage
        this.variables = this.loadVariables();
        this.listeners = {
            log: [],
            variableChange: [],
            authChange: []
        };
        this.currentUser = this.loadStoredUser();
    }

    getDefaultVariables() {
        return {
            baseUrl: window.location.origin,
            tenantId: '11111111-1111-1111-1111-111111111111',
            email: 'admin@example.com',
            password: 'ChangeThisLocalPassword123!',
            displayName: 'Local Admin',
            documentType: 'INVOICE',
            documentId: '',
            source: 'Direct Upload'
        };
    }

    loadVariables() {
        try {
            const saved = localStorage.getItem('agentic_postman_vars');
            const defs = this.getDefaultVariables();
            return saved ? { ...defs, ...JSON.parse(saved) } : defs;
        } catch (e) {
            return this.getDefaultVariables();
        }
    }

    saveVariables() {
        try {
            localStorage.setItem('agentic_postman_vars', JSON.stringify(this.variables));
        } catch (e) {}
    }

    getVariable(key) {
        return this.variables[key] !== undefined ? this.variables[key] : '';
    }

    setVariable(key, val) {
        this.variables[key] = val;
        this.saveVariables();
        this.emit('variableChange', { key, value: val, variables: { ...this.variables } });
    }

    setVariables(obj) {
        this.variables = { ...this.variables, ...obj };
        this.saveVariables();
        this.emit('variableChange', { variables: { ...this.variables } });
    }

    interpolate(str) {
        if (!str || typeof str !== 'string') return str;
        return str.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
            return this.variables[key] !== undefined ? this.variables[key] : match;
        });
    }

    loadStoredUser() {
        try {
            const raw = localStorage.getItem('agentic_user');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    setCurrentUser(user) {
        this.currentUser = user;
        if (user) {
            localStorage.setItem('agentic_user', JSON.stringify(user));
            if (user.email) this.setVariable('email', user.email);
            if (user.displayName) this.setVariable('displayName', user.displayName);
            if (user.tenantId) this.setVariable('tenantId', user.tenantId);
        } else {
            localStorage.removeItem('agentic_user');
        }
        this.emit('authChange', user);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    on(event, handler) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(handler);
        return () => {
            this.listeners[event] = this.listeners[event].filter(h => h !== handler);
        };
    }

    emit(event, payload) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(fn => {
                try { fn(payload); } catch (e) { console.error('Listener error:', e); }
            });
        }
    }

    // ==========================================
    // POSTMAN COLLECTION DEFINITIONS
    // ==========================================
    getPostmanItems() {
        return [
            {
                id: 'register',
                name: 'Register User',
                description: 'Creates a user in an existing tenant. The tenant must already exist.',
                method: 'POST',
                url: '/api/auth/register',
                headers: {
                    'Content-Type': 'application/json'
                },
                bodyType: 'json',
                body: JSON.stringify({
                    tenantId: '{{tenantId}}',
                    email: '{{email}}',
                    password: '{{password}}',
                    displayName: '{{displayName}}'
                }, null, 2)
            },
            {
                id: 'login',
                name: 'Login',
                description: 'Authenticates user with tenant ID, email and password. Receives HttpOnly access and refresh cookies.',
                method: 'POST',
                url: '/api/auth/login',
                headers: {
                    'Content-Type': 'application/json'
                },
                bodyType: 'json',
                body: JSON.stringify({
                    tenantId: '{{tenantId}}',
                    email: '{{email}}',
                    password: '{{password}}'
                }, null, 2)
            },
            {
                id: 'refresh',
                name: 'Refresh Session',
                description: 'Rotates the access and refresh tokens using the refreshToken request body.',
                method: 'POST',
                url: '/api/auth/refresh',
                headers: { 'Content-Type': 'application/json' },
                bodyType: 'json',
                body: JSON.stringify({ refreshToken: '{{refreshToken}}' }, null, 2)
            },
            {
                id: 'logout',
                name: 'Logout',
                description: 'Revokes the active refresh session in MySQL and clears all auth cookies.',
                method: 'POST',
                url: '/api/auth/logout',
                headers: { 'Content-Type': 'application/json' },
                bodyType: 'json',
                body: JSON.stringify({ refreshToken: '{{refreshToken}}' }, null, 2)
            },
            {
                id: 'intake',
                name: 'Intake Document',
                description: 'Zero-trust document ingestion. Extracts text via Apache Tika and parses invoice fields.',
                method: 'POST',
                url: '/api/documents/intake',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                bodyType: 'formdata',
                formFields: {
                    file: null, // File object or sample text
                    documentType: '{{documentType}}',
                    source: '{{source}}'
                }
            },
            {
                id: 'list',
                name: 'List Documents',
                description: 'Lists all ingested documents for the authenticated tenant with overall confidence scores.',
                method: 'GET',
                url: '/api/documents',
                headers: {},
                bodyType: 'none',
                body: null
            },
            {
                id: 'get_doc',
                name: 'Get Document by ID',
                description: 'Retrieves full details of a specific document including extracted fields and individual confidences.',
                method: 'GET',
                url: '/api/documents/{{documentId}}',
                headers: {},
                bodyType: 'none',
                body: null
            }
        ];
    }

    /**
     * Executes any Postman item with variable interpolation, timing, and error handling.
     */
    async executePostmanItem(itemId, customOverrides = {}) {
        const item = this.getPostmanItems().find(i => i.id === itemId);
        if (!item) throw new ApiError(`Unknown Postman item: ${itemId}`, 404);

        const baseUrl = (this.getVariable('baseUrl') || window.location.origin).replace(/\/+$/, '');
        let endpoint = customOverrides.url || item.url;
        endpoint = this.interpolate(endpoint);

        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
        const method = (customOverrides.method || item.method).toUpperCase();

        // Build headers
        const headers = new Headers();
        const headerDefs = { ...item.headers, ...(customOverrides.headers || {}) };

        for (const [k, v] of Object.entries(headerDefs)) {
            const interpolatedVal = this.interpolate(v);
            if (interpolatedVal) {
                headers.set(k, interpolatedVal);
            }
        }

        // Build body
        let body = null;
        const bodyType = customOverrides.bodyType || item.bodyType;

        if (bodyType === 'json') {
            const rawBody = customOverrides.body !== undefined ? customOverrides.body : item.body;
            body = typeof rawBody === 'string' ? this.interpolate(rawBody) : JSON.stringify(rawBody);
            if (!headers.has('Content-Type')) {
                headers.set('Content-Type', 'application/json');
            }
        } else if (bodyType === 'formdata') {
            const formData = new FormData();
            const fields = { ...item.formFields, ...(customOverrides.formFields || {}) };

            // Handle file
            let fileObj = customOverrides.file || fields.file;
            if (!fileObj) {
                // Generate a dummy invoice text file if no file provided
                const sampleInvoice = `INVOICE #INV-2026-9042
Vendor: Global Tech Logistics Inc.
Tax ID: US-99283711
Issue Date: 2026-10-25
Total Amount: $4,850.00
Description: Cloud Platform Processing & Data Intake Service`;
                fileObj = new File([sampleInvoice], "sample_invoice.txt", { type: "text/plain" });
            }
            formData.append('file', fileObj);
            formData.append('documentType', this.interpolate(fields.documentType || 'INVOICE'));
            formData.append('source', this.interpolate(fields.source || 'Direct Upload'));

            body = formData;
            // Never manually set Content-Type for FormData so browser creates boundary
            headers.delete('Content-Type');
        }

        const start = performance.now();
        let response;
        let responseData = null;
        let responseHeaders = {};

        try {
            response = await fetch(url, {
                method,
                headers,
                body,
                credentials: 'include'
            });

            const duration = Math.round(performance.now() - start);

            // Extract response headers
            response.headers.forEach((v, k) => {
                responseHeaders[k] = v;
            });

            const contentType = response.headers.get('content-type') || '';
            if (response.status === 204) {
                responseData = null;
            } else if (contentType.includes('application/json')) {
                responseData = await response.json().catch(() => null);
            } else {
                responseData = await response.text().catch(() => '');
            }

            // Postman-like side effects & test assertions
            if ((itemId === 'login' || itemId === 'register' || itemId === 'refresh') && response.ok && responseData) {
                this.setCurrentUser(responseData);
            }

            if (itemId === 'logout' && response.ok) {
                this.setCurrentUser(null);
            }

            if (itemId === 'intake' && response.ok && responseData && responseData.id) {
                this.setVariable('documentId', responseData.id);
            }

            if (itemId === 'list' && response.ok && Array.isArray(responseData) && responseData.length > 0) {
                this.setVariable('documentId', responseData[0].id);
            }

            const result = {
                id: itemId,
                name: item.name,
                url,
                method,
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                duration,
                headers: responseHeaders,
                data: responseData,
                requestHeaders: Object.fromEntries(headers.entries()),
                requestBody: body instanceof FormData ? '[Multipart FormData]' : body
            };

            this.logRequest(result);
            return result;
        } catch (err) {
            const duration = Math.round(performance.now() - start);
            const errorResult = {
                id: itemId,
                name: item.name,
                url,
                method,
                status: 0,
                statusText: err.message || 'Network Failure',
                ok: false,
                duration,
                headers: {},
                data: { error: err.message },
                requestHeaders: Object.fromEntries(headers.entries()),
                requestBody: body instanceof FormData ? '[Multipart FormData]' : body
            };
            this.logRequest(errorResult);
            throw new ApiError(err.message, 0, errorResult);
        }
    }

    logRequest(entry) {
        this.emit('log', {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            ...entry
        });
    }

    requireSuccess(response) {
        if (!response.ok) {
            let message = response.data && (
                response.data.message || response.data.detail || response.data.error
            );
            if (response.status === 409) {
                message = 'This email is already registered for this tenant. Please sign in instead, or register with a different email.';
            }
            if (response.status === 401 && response.id === 'login') {
                message = 'Login failed. Check the tenant ID, email, and password used when you registered. If you do not know that account password, register with a different email.';
            }
            throw new ApiError(message || `Request failed with status ${response.status}`, response.status, {
                status: response.status,
                data: response.data,
                headers: response.headers,
                duration: response.duration
            });
        }
        return response.data;
    }

    // High level convenient methods
    auth = {
        register: async (params = {}) => {
            if (params.tenantId) this.setVariable('tenantId', params.tenantId);
            if (params.email) this.setVariable('email', params.email);
            if (params.password) this.setVariable('password', params.password);
            if (params.displayName) this.setVariable('displayName', params.displayName);
            const res = await this.executePostmanItem('register');
            return this.requireSuccess(res);
        },
        login: async (params = {}) => {
            if (params.tenantId) this.setVariable('tenantId', params.tenantId);
            if (params.email) this.setVariable('email', params.email);
            if (params.password) this.setVariable('password', params.password);
            const res = await this.executePostmanItem('login');
            return this.requireSuccess(res);
        },
        refresh: async () => {
            const res = await this.executePostmanItem('refresh');
            return this.requireSuccess(res);
        },
        logout: async () => {
            const res = await this.executePostmanItem('logout');
            return this.requireSuccess(res);
        },
        getUser: () => this.getCurrentUser()
    };

    documents = {
        upload: async (file, documentType = 'INVOICE', source = 'Direct Upload') => {
            const res = await this.executePostmanItem('intake', {
                file,
                formFields: { documentType, source }
            });
            return res.data;
        },
        list: async () => {
            const res = await this.executePostmanItem('list');
            return res.data;
        },
        get: async (id) => {
            if (id) this.setVariable('documentId', id);
            const res = await this.executePostmanItem('get_doc');
            return res.data;
        },
        originalFile: async (id) => {
            const user = this.getCurrentUser();
            if (!user || !user.accessToken) {
                throw new ApiError('Sign in before viewing an uploaded document.', 401);
            }
            const baseUrl = (this.getVariable('baseUrl') || window.location.origin).replace(/\/+$/, '');
            const response = await fetch(`${baseUrl}/api/documents/${encodeURIComponent(id)}/content`, {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            });
            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new ApiError(data && data.message ? data.message : `Could not load document (${response.status})`, response.status, data);
            }
            return response.blob();
        }
    };

    marketing = {
        importContacts: async (file) => {
            const user = this.getCurrentUser();
            if (!user || !user.accessToken) throw new ApiError('Sign in before importing contacts.', 401);
            const form = new FormData(); form.append('file', file);
            const response = await fetch(`${(this.getVariable('baseUrl') || window.location.origin).replace(/\/+$/, '')}/api/marketing/contacts/import`, {
                method: 'POST', headers: { Authorization: `Bearer ${user.accessToken}` }, body: form, credentials: 'include'
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) throw new ApiError(data?.detail || data?.message || `Import failed (${response.status})`, response.status, data);
            return data;
        },
        lists: async () => this.marketingRequest('/api/marketing/customer-lists'),
        generateList: async (body) => this.marketingRequest('/api/marketing/customer-lists/ai-generate', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)}),
        listMembers: async (id) => this.marketingRequest(`/api/marketing/customer-lists/${encodeURIComponent(id)}/contacts`)
        ,generateEmail: async (body) => this.marketingRequest('/api/marketing/content/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
        ,senderConfig: async () => this.marketingRequest('/api/marketing/campaigns/senders')
        ,assets: async () => this.marketingRequest('/api/marketing/assets')
        ,sendCampaign: async (fields,file) => {
            const form=new FormData(); Object.entries(fields).forEach(([k,v])=>{if(v!==null&&v!==undefined&&v!=='')form.append(k,v)});
            if(file)form.append('attachment',file);
            return this.marketingRequest('/api/marketing/campaigns/send-bulk',{method:'POST',body:form});
        }
    };

    async marketingRequest(path, options = {}) {
        const user = this.getCurrentUser();
        if (!user || !user.accessToken) throw new ApiError('Sign in before using marketing tools.', 401);
        const response = await fetch(`${(this.getVariable('baseUrl') || window.location.origin).replace(/\/+$/, '')}${path}`, {
            ...options, headers:{Authorization:`Bearer ${user.accessToken}`,...(options.headers||{})}, credentials:'include'
        });
        const data = response.status===204 ? null : await response.json().catch(()=>null);
        if(!response.ok) throw new ApiError(data?.detail||data?.message||`Request failed (${response.status})`,response.status,data);
        return data;
    }
}

const api = new AgenticApiClient();
if (typeof window !== 'undefined') {
    window.AgenticApi = api;
    window.AgenticApiClient = AgenticApiClient;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AgenticApiClient, api, ApiError };
}
