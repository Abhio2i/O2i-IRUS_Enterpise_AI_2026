/**
 * Agentic AI Platform - Application & Postman Studio Controller
 * Handles Postman workbench interactions, collection runner, live execution, and dashboard cockpit.
 */

document.addEventListener('DOMContentLoaded', () => {
    const api = window.AgenticApi;

    // View Navigation
    const viewPostmanBtn = document.getElementById('view-postman-btn');
    const viewDashboardBtn = document.getElementById('view-dashboard-btn');
    const viewPostman = document.getElementById('view-postman');
    const viewDashboard = document.getElementById('view-dashboard');

    // Header Actions & User
    const userDisplay = document.getElementById('user-display');
    const userNameEl = document.getElementById('user-name');
    const userEmailEl = document.getElementById('user-email');
    const userAvatarEl = document.getElementById('user-avatar');
    const navLoginBtn = document.getElementById('nav-login-btn');
    const navRefreshBtn = document.getElementById('nav-refresh-btn');
    const navLogoutBtn = document.getElementById('nav-logout-btn');

    // Auth Modal Elements
    const authModal = document.getElementById('auth-modal');
    const closeAuthModal = document.getElementById('close-auth-modal');
    const authModalTitle = document.getElementById('auth-modal-title');
    const tabAuthLogin = document.getElementById('tab-auth-login');
    const tabAuthRegister = document.getElementById('tab-auth-register');
    const cockpitLoginForm = document.getElementById('cockpit-login-form');
    const cockpitRegisterForm = document.getElementById('cockpit-register-form');
    const authDemoFillBtn = document.getElementById('auth-demo-fill-btn');

    // Quick Variables Elements
    const quickBaseUrl = document.getElementById('quick-baseUrl');
    const quickTenantId = document.getElementById('quick-tenantId');
    const quickEmail = document.getElementById('quick-email');
    const quickDocumentId = document.getElementById('quick-documentId');
    const editVarsBtn = document.getElementById('edit-vars-btn');

    // Postman Studio Elements
    const collectionList = document.getElementById('collection-list');
    const reqTitle = document.getElementById('req-title');
    const reqDesc = document.getElementById('req-desc');
    const reqBadge = document.getElementById('req-badge');
    const urlMethodDisplay = document.getElementById('url-method-display');
    const urlInput = document.getElementById('url-input');
    const evaluatedUrlPreview = document.getElementById('evaluated-url-preview');
    const sendRequestBtn = document.getElementById('send-request-btn');

    // Request Tabs & Panels
    const tabReqBody = document.getElementById('tab-req-body');
    const tabReqHeaders = document.getElementById('tab-req-headers');
    const panelReqBody = document.getElementById('panel-req-body');
    const panelReqHeaders = document.getElementById('panel-req-headers');
    const bodyJsonWrap = document.getElementById('body-json-wrap');
    const bodyJsonEditor = document.getElementById('body-json-editor');
    const bodyFormdataWrap = document.getElementById('body-formdata-wrap');
    const postmanFileInput = document.getElementById('postman-file-input');
    const postmanDocType = document.getElementById('postman-doc-type');
    const postmanDocSource = document.getElementById('postman-doc-source');
    const bodyNoneWrap = document.getElementById('body-none-wrap');
    const headersTableBody = document.getElementById('headers-table-body');
    const headersCount = document.getElementById('headers-count');

    // Response Elements
    const resStatusBadge = document.getElementById('res-status-badge');
    const resTime = document.getElementById('res-time');
    const responseJson = document.getElementById('response-json');
    const responseHeadersBox = document.getElementById('response-headers-box');
    const tabResBody = document.getElementById('tab-res-body');
    const tabResHeaders = document.getElementById('tab-res-headers');
    const panelResBody = document.getElementById('panel-res-body');
    const panelResHeaders = document.getElementById('panel-res-headers');
    const copyResponseBtn = document.getElementById('copy-response-btn');

    // Runner Elements
    const runCollectionBtn = document.getElementById('run-collection-btn');
    const runnerModal = document.getElementById('runner-modal');
    const runnerStepsList = document.getElementById('runner-steps-list');
    const closeRunnerModal = document.getElementById('close-runner-modal');
    const closeRunnerBtn = document.getElementById('close-runner-btn');

    // Variables Modal
    const varsModal = document.getElementById('vars-modal');
    const varsFormFields = document.getElementById('vars-form-fields');
    const closeVarsModal = document.getElementById('close-vars-modal');
    const saveVarsBtn = document.getElementById('save-vars-btn');
    const resetVarsBtn = document.getElementById('reset-vars-btn');

    // Cockpit Elements
    const dropzone = document.getElementById('dropzone');
    const cockpitFileInput = document.getElementById('cockpit-file-input');
    const cockpitFilePreview = document.getElementById('cockpit-file-preview');
    const cockpitFileName = document.getElementById('cockpit-file-name');
    const cockpitFileSize = document.getElementById('cockpit-file-size');
    const cockpitRemoveFile = document.getElementById('cockpit-remove-file');
    const cockpitDocType = document.getElementById('cockpit-doc-type');
    const cockpitSource = document.getElementById('cockpit-source');
    const cockpitUploadBtn = document.getElementById('cockpit-upload-btn');
    const cockpitRefreshBtn = document.getElementById('cockpit-refresh-btn');
    const cockpitStatusFilter = document.getElementById('cockpit-status-filter');
    const cockpitSearchInput = document.getElementById('cockpit-search-input');
    const cockpitDocsBody = document.getElementById('cockpit-docs-body');
    const statTotal = document.getElementById('stat-total');
    const statProcessed = document.getElementById('stat-processed');
    const statException = document.getElementById('stat-exception');
    const statConfidence = document.getElementById('stat-confidence');

    // Document Modal
    const docModal = document.getElementById('doc-modal');
    const closeDocModal = document.getElementById('close-doc-modal');
    const modalDocName = document.getElementById('modal-doc-name');
    const modalDocId = document.getElementById('modal-doc-id');
    const modalDocStatus = document.getElementById('modal-doc-status');
    const modalDocFlag = document.getElementById('modal-doc-flag');
    const modalFieldsGrid = document.getElementById('modal-fields-grid');
    const modalExtractedText = document.getElementById('modal-extracted-text');
    const modalRawJson = document.getElementById('modal-raw-json');
    const copyModalJson = document.getElementById('copy-modal-json');
    const modalPreviewMessage = document.getElementById('modal-preview-message');
    const modalPreviewFrame = document.getElementById('modal-preview-frame');
    const modalDownloadLink = document.getElementById('modal-download-link');
    let activeDocumentPreviewUrl = null;
    let documentPreviewRequest = 0;

    // State
    let activePostmanItemId = 'register';
    let lastResponseData = null;
    let selectedCockpitFile = null;
    let cockpitDocsCache = [];
    const contactsCsvFile = document.getElementById('contacts-csv-file');
    const contactsCsvUpload = document.getElementById('contacts-csv-upload');
    const contactsCsvCheck = document.getElementById('contacts-csv-check');
    const contactsCsvReport = document.getElementById('contacts-csv-report');
    const csvHeaders = ['email','firstName','lastName','company','title','industry','country','annualRevenue','customerStatus','churnProbability'];
    if (contactsCsvFile) contactsCsvFile.addEventListener('change', async () => {
        contactsCsvReport.innerHTML = '';
        const file = contactsCsvFile.files[0]; contactsCsvUpload.disabled = !file;
        if (!file) { contactsCsvCheck.textContent = ''; return; }
        if (!file.name.toLowerCase().endsWith('.csv')) { contactsCsvCheck.textContent = 'Please choose a .csv file.'; contactsCsvUpload.disabled = true; return; }
        try {
            const firstLine = (await file.slice(0, 8192).text()).replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0];
            const headers = firstLine.split(',').map(v => v.trim().replace(/^"|"$/g, '').toLowerCase());
            const unsupported = headers.filter(h => !csvHeaders.some(a => a.toLowerCase() === h));
            const missingEmail = !headers.includes('email');
            if (missingEmail || unsupported.length || new Set(headers).size !== headers.length) {
                contactsCsvCheck.textContent = [missingEmail ? 'Required column missing: email.' : '', unsupported.length ? `Unknown column(s): ${unsupported.join(', ')}.` : '', new Set(headers).size !== headers.length ? 'Duplicate column names found.' : ''].filter(Boolean).join(' ');
                contactsCsvUpload.disabled = true;
            } else { contactsCsvCheck.textContent = `Header looks good (${headers.length} columns).`; contactsCsvUpload.disabled = false; }
        } catch { contactsCsvCheck.textContent = 'Could not read this file. Save it as UTF-8 CSV and try again.'; contactsCsvUpload.disabled = true; }
    });
    const sampleCsvButton = document.getElementById('contacts-csv-sample');
    if (sampleCsvButton) sampleCsvButton.addEventListener('click', () => {
        const blob = new Blob(['email,firstName,lastName,company,title,industry,country,annualRevenue,customerStatus,churnProbability\nalex@example.com,Alex,Kim,Northwind,VP Sales,Technology,Canada,2500000,ACTIVE,12.5\n'], {type:'text/csv;charset=utf-8'});
        const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'marketing-contacts-sample.csv'; link.click(); URL.revokeObjectURL(link.href);
    });
    if (contactsCsvUpload) contactsCsvUpload.addEventListener('click', async () => {
        const file = contactsCsvFile.files[0]; if (!file) return;
        contactsCsvUpload.disabled = true; contactsCsvUpload.textContent = 'Importing…';
        try {
            const result = await api.marketing.importContacts(file);
            const errors = (result.errors || []).map(e => `<li>Row ${e.row}: ${escapeHtml(e.message)}</li>`).join('');
            contactsCsvReport.innerHTML = `<p><strong>${result.imported}</strong> imported · <strong>${result.duplicates}</strong> duplicates skipped · <strong>${result.invalid}</strong> invalid rows · ${result.processed} processed</p>${errors ? `<details><summary>Show row errors</summary><ul>${errors}</ul></details>` : ''}`;
            contactsCsvCheck.textContent = 'Import complete.'; showToast('Contact CSV import complete', 'success');
        } catch (err) { contactsCsvReport.textContent = err.message; showToast(err.message, 'error'); }
        finally { contactsCsvUpload.textContent = 'Import CSV'; contactsCsvUpload.disabled = !contactsCsvFile.files[0]; }
    });
    const sourceListSelect = document.getElementById('ai-source-list');
    const aiFilterButton = document.getElementById('ai-filter-list');
    const aiResult = document.getElementById('ai-list-result');
    async function loadAiSourceLists() {
        if (!sourceListSelect || !api.getCurrentUser()) return;
        try {
            const lists = await api.marketing.lists();
            sourceListSelect.innerHTML = '<option value="">All imported contacts</option>' + lists.map(l => `<option value="${escapeHtml(l.id)}">${escapeHtml(l.name)} (${l.contacts})</option>`).join('');
        } catch (e) { /* Sign-in or empty list state is shown when user opens the tool. */ }
    }
    if (api) api.on('authChange', loadAiSourceLists);
    loadAiSourceLists();
    if (aiFilterButton) aiFilterButton.addEventListener('click', async () => {
        const prompt = document.getElementById('ai-list-prompt').value.trim();
        if (prompt.length < 5) { showToast('Enter a filtering prompt of at least 5 characters.', 'error'); return; }
        aiFilterButton.disabled = true; aiFilterButton.textContent = 'Filtering…'; aiResult.textContent = '';
        try {
            const generated = await api.marketing.generateList({prompt, name:document.getElementById('ai-list-name').value.trim()||null, sourceListId:sourceListSelect.value||null});
            const members = await api.marketing.listMembers(generated.id);
            aiResult.innerHTML = `<p><strong>${escapeHtml(generated.name)}</strong> saved with ${members.length} matching contacts.</p><div class="table-container"><table class="data-table"><thead><tr><th>Email</th><th>Company</th><th>Industry</th><th>Country</th></tr></thead><tbody>${members.map(c=>`<tr><td>${escapeHtml(c.email||'')}</td><td>${escapeHtml(c.company||'—')}</td><td>${escapeHtml(c.industry||'—')}</td><td>${escapeHtml(c.country||'—')}</td></tr>`).join('')}</tbody></table></div>`;
            await loadAiSourceLists(); showToast('AI filtered list saved.', 'success');
        } catch(e) { aiResult.textContent=e.message; showToast(e.message,'error'); }
        finally { aiFilterButton.disabled=false; aiFilterButton.textContent='Filter and Save List'; }
    });
    const campaignFrom = document.getElementById('campaign-from');
    const campaignResult = document.getElementById('campaign-result');
    async function loadCampaignSender() { if(!api.getCurrentUser())return; try { const c=await api.marketing.senderConfig(); if(!campaignFrom.value)campaignFrom.value=c.defaultSender||''; campaignFrom.placeholder=c.allowedSenders?.length?`Allowed: ${c.allowedSenders.join(', ')}`:'Configure SMTP sender on server'; } catch{} }
    if(api) api.on('authChange',loadCampaignSender); loadCampaignSender();
    async function loadCampaignLists(){const select=document.getElementById('campaign-audience-list');if(!select||!api.getCurrentUser())return;try{const lists=await api.marketing.lists();select.innerHTML='<option value="">Send to domain below</option>'+lists.map(l=>`<option value="${escapeHtml(l.id)}">${escapeHtml(l.name)} (${l.contacts})</option>`).join('');}catch{}}
    async function loadCampaignAssets(){const select=document.getElementById('campaign-source-asset');if(!select||!api.getCurrentUser())return;try{const assets=await api.marketing.assets();select.innerHTML='<option value="">Select brochure/catalog source</option>'+assets.filter(a=>['BROCHURE','CATALOG'].includes(a.type)).map(a=>`<option value="${escapeHtml(a.id)}">${escapeHtml(a.name)} · ${escapeHtml(a.type)}</option>`).join('');}catch{}}
    loadCampaignAssets(); if(api)api.on('authChange',loadCampaignAssets);
    loadCampaignLists(); if(api)api.on('authChange',loadCampaignLists);
    document.getElementById('campaign-generate')?.addEventListener('click',async()=>{
        const button=document.getElementById('campaign-generate'); button.disabled=true;
        try { const draft=await api.marketing.generateEmail({targetDomain:document.getElementById('campaign-domain').value,industry:document.getElementById('campaign-industry').value,tone:document.getElementById('campaign-tone').value,topic:document.getElementById('campaign-topic').value,callToAction:document.getElementById('campaign-cta').value,sourceAssetId:document.getElementById('campaign-source-asset').value}); document.getElementById('campaign-subject').value=draft.subject||draft.subjectLine||''; document.getElementById('campaign-content').value=draft.contentHtml||''; showToast('Source-based email draft generated','success'); } catch(e){campaignResult.textContent=e.message;showToast(e.message,'error');} finally{button.disabled=false;}
    });
    document.getElementById('campaign-send')?.addEventListener('click',async()=>{
        const button=document.getElementById('campaign-send'); button.disabled=true; campaignResult.textContent='Sending…';
        try { const listId=document.getElementById('campaign-audience-list').value; const r=await api.marketing.sendCampaign({campaignName:document.getElementById('campaign-name').value,targetDomain:listId?'':document.getElementById('campaign-domain').value,targetListId:listId,fromEmail:campaignFrom.value,senderName:'Agentic AI Platform',replyTo:document.getElementById('campaign-reply-to').value,subject:document.getElementById('campaign-subject').value,contentHtml:document.getElementById('campaign-content').value},document.getElementById('campaign-attachment').files[0]); campaignResult.textContent=`${r.status}: sent ${r.sent}, failed ${r.failed}.`; showToast('Campaign request completed','success'); } catch(e){campaignResult.textContent=e.message;showToast(e.message,'error');} finally{button.disabled=false;}
    });

    // ==========================================
    // TOAST NOTIFICATIONS
    // ==========================================
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
            <div>${message}</div>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(30px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ==========================================
    // VIEW SWITCHER
    // ==========================================
    viewPostmanBtn.addEventListener('click', () => {
        viewPostmanBtn.classList.add('active');
        viewDashboardBtn.classList.remove('active');
        viewPostman.style.display = 'grid';
        viewDashboard.style.display = 'none';
    });

    viewDashboardBtn.addEventListener('click', () => {
        viewDashboardBtn.classList.add('active');
        viewPostmanBtn.classList.remove('active');
        viewPostman.style.display = 'none';
        viewDashboard.style.display = 'block';
        loadCockpitDocuments();
    });

    // ==========================================
    // QUICK VARIABLES BAR
    // ==========================================
    function updateQuickVars() {
        const v = api.variables;
        quickBaseUrl.textContent = v.baseUrl || window.location.origin;
        quickTenantId.textContent = (v.tenantId || '').substring(0, 8) + '...';
        quickTenantId.title = v.tenantId || '';
        quickEmail.textContent = v.email || '';
        quickDocumentId.textContent = v.documentId ? v.documentId.substring(0, 8) + '...' : '(none)';
        quickDocumentId.title = v.documentId || '';
    }

    api.on('variableChange', () => {
        updateQuickVars();
        updateActiveItemUI();
    });
    updateQuickVars();

    // ==========================================
    // USER DISPLAY & GLOBAL AUTH
    // ==========================================
    function updateAuthUI(user) {
        if (user) {
            userDisplay.style.display = 'flex';
            if (navLoginBtn) navLoginBtn.style.display = 'none';
            if (navRefreshBtn) navRefreshBtn.style.display = 'inline-flex';
            if (navLogoutBtn) navLogoutBtn.style.display = 'inline-flex';
            userNameEl.textContent = user.displayName || user.email;
            userEmailEl.textContent = user.email;
            userAvatarEl.textContent = (user.displayName || user.email || 'U')[0].toUpperCase();
        } else {
            userDisplay.style.display = 'none';
            if (navLoginBtn) navLoginBtn.style.display = 'inline-flex';
            if (navRefreshBtn) navRefreshBtn.style.display = 'none';
            if (navLogoutBtn) navLogoutBtn.style.display = 'none';
        }
    }

    api.on('authChange', updateAuthUI);
    updateAuthUI(api.getCurrentUser());

    // Open/Close Auth Modal
    if (navLoginBtn) {
        navLoginBtn.addEventListener('click', () => {
            authModal.classList.add('open');
        });
    }

    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', () => {
            authModal.classList.remove('open');
        });
    }

    // Toggle Sign In vs Register tabs in Auth Modal
    if (tabAuthLogin && tabAuthRegister) {
        tabAuthLogin.addEventListener('click', () => {
            tabAuthLogin.classList.add('active');
            tabAuthRegister.classList.remove('active');
            cockpitLoginForm.style.display = 'block';
            cockpitRegisterForm.style.display = 'none';
            authModalTitle.textContent = 'Sign In to Account';
        });

        tabAuthRegister.addEventListener('click', () => {
            tabAuthRegister.classList.add('active');
            tabAuthLogin.classList.remove('active');
            cockpitLoginForm.style.display = 'none';
            cockpitRegisterForm.style.display = 'block';
            authModalTitle.textContent = 'Register New User';
        });
    }

    // Autofill demo credentials
    if (authDemoFillBtn) {
        authDemoFillBtn.addEventListener('click', () => {
            document.getElementById('auth-login-tenant').value = '11111111-1111-1111-1111-111111111111';
            document.getElementById('auth-login-email').value = 'admin@example.com';
            document.getElementById('auth-login-password').value = 'ChangeThisLocalPassword123!';
            showToast('Demo admin credentials autofilled', 'info');
        });
    }

    // Submit Sign In
    if (cockpitLoginForm) {
        cockpitLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = cockpitLoginForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';

            const tenantId = document.getElementById('auth-login-tenant').value.trim();
            const email = document.getElementById('auth-login-email').value.trim();
            const password = document.getElementById('auth-login-password').value;

            try {
                const user = await api.auth.login({ tenantId, email, password });
                showToast(`Welcome back, ${user.displayName || user.email}!`, 'success');
                authModal.classList.remove('open');
            } catch (err) {
                showToast(err.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        });
    }

    // Submit Register
    if (cockpitRegisterForm) {
        cockpitRegisterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = cockpitRegisterForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';

            const tenantId = document.getElementById('auth-reg-tenant').value.trim();
            const displayName = document.getElementById('auth-reg-name').value.trim();
            const email = document.getElementById('auth-reg-email').value.trim();
            const password = document.getElementById('auth-reg-password').value;

            try {
                const user = await api.auth.register({ tenantId, email, password, displayName });
                showToast(`Account created! Welcome, ${user.displayName}.`, 'success');
                authModal.classList.remove('open');
            } catch (err) {
                showToast(err.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Enterprise Account';
            }
        });
    }

    navRefreshBtn.addEventListener('click', async () => {
        try {
            await api.auth.refresh();
            showToast('Session refreshed via POST /api/auth/refresh', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    navLogoutBtn.addEventListener('click', async () => {
        try {
            await api.auth.logout();
            showToast('Logged out via POST /api/auth/logout', 'info');
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // ==========================================
    // POSTMAN SIDEBAR & WORKBENCH
    // ==========================================
    const items = api.getPostmanItems();

    function renderCollectionSidebar() {
        collectionList.innerHTML = items.map((item, idx) => {
            const isGet = item.method === 'GET';
            const badgeClass = isGet ? 'badge-get' : 'badge-post';
            const activeClass = item.id === activePostmanItemId ? 'active' : '';

            return `
                <button class="collection-item ${activeClass}" data-id="${item.id}">
                    <span class="badge ${badgeClass}">${item.method}</span>
                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</span>
                </button>
            `;
        }).join('');

        collectionList.querySelectorAll('.collection-item').forEach(btn => {
            btn.addEventListener('click', () => {
                activePostmanItemId = btn.dataset.id;
                renderCollectionSidebar();
                updateActiveItemUI();
            });
        });
    }

    function updateActiveItemUI() {
        const item = items.find(i => i.id === activePostmanItemId);
        if (!item) return;

        reqTitle.textContent = item.name;
        reqDesc.textContent = item.description;
        reqBadge.className = `badge ${item.method === 'GET' ? 'badge-get' : 'badge-post'}`;
        reqBadge.textContent = item.method;
        urlMethodDisplay.textContent = item.method;
        urlInput.value = `{{baseUrl}}${item.url}`;
        evaluatedUrlPreview.textContent = api.interpolate(`{{baseUrl}}${item.url}`);

        // Handle Body
        if (item.bodyType === 'json') {
            bodyJsonWrap.style.display = 'block';
            bodyFormdataWrap.style.display = 'none';
            bodyNoneWrap.style.display = 'none';
            bodyJsonEditor.value = item.body || '';
        } else if (item.bodyType === 'formdata') {
            bodyJsonWrap.style.display = 'none';
            bodyFormdataWrap.style.display = 'block';
            bodyNoneWrap.style.display = 'none';
            postmanDocType.value = api.getVariable('documentType') || 'INVOICE';
            postmanDocSource.value = api.getVariable('source') || 'Direct Upload';
        } else {
            bodyJsonWrap.style.display = 'none';
            bodyFormdataWrap.style.display = 'none';
            bodyNoneWrap.style.display = 'block';
        }

        // Handle Headers
        const headerKeys = Object.keys(item.headers || {});
        headersCount.textContent = headerKeys.length;
        if (headerKeys.length === 0) {
            headersTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No custom request headers configured.</td></tr>`;
        } else {
            headersTableBody.innerHTML = headerKeys.map(k => {
                const tplVal = item.headers[k];
                const evalVal = api.interpolate(tplVal);
                return `
                    <tr>
                        <td style="color: var(--accent-blue); font-weight: 600;">${k}</td>
                        <td style="color: var(--text-muted);">${escapeHtml(tplVal)}</td>
                        <td style="color: var(--text-primary); font-weight: 500;">${escapeHtml(evalVal || '(empty)')}</td>
                    </tr>
                `;
            }).join('');
        }
    }

    // Tab switching for request and response
    tabReqBody.addEventListener('click', () => {
        tabReqBody.classList.add('active');
        tabReqHeaders.classList.remove('active');
        panelReqBody.style.display = 'block';
        panelReqHeaders.style.display = 'none';
    });

    tabReqHeaders.addEventListener('click', () => {
        tabReqHeaders.classList.add('active');
        tabReqBody.classList.remove('active');
        panelReqHeaders.style.display = 'block';
        panelReqBody.style.display = 'none';
    });

    tabResBody.addEventListener('click', () => {
        tabResBody.classList.add('active');
        tabResHeaders.classList.remove('active');
        panelResBody.style.display = 'block';
        panelResHeaders.style.display = 'none';
    });

    tabResHeaders.addEventListener('click', () => {
        tabResHeaders.classList.add('active');
        tabResBody.classList.remove('active');
        panelResHeaders.style.display = 'block';
        panelResBody.style.display = 'none';
    });

    // Send Request Handler
    sendRequestBtn.addEventListener('click', async () => {
        sendRequestBtn.disabled = true;
        sendRequestBtn.innerHTML = '<span>⏳</span> Sending...';
        resStatusBadge.className = 'badge badge-info';
        resStatusBadge.textContent = 'Sending request...';
        resTime.textContent = '...';

        const item = items.find(i => i.id === activePostmanItemId);
        const customOverrides = {};

        // Body override
        if (item.bodyType === 'json') {
            customOverrides.body = bodyJsonEditor.value;
        } else if (item.bodyType === 'formdata') {
            if (postmanFileInput.files && postmanFileInput.files[0]) {
                customOverrides.file = postmanFileInput.files[0];
            }
            customOverrides.formFields = {
                documentType: postmanDocType.value,
                source: postmanDocSource.value
            };
        }

        try {
            const res = await api.executePostmanItem(activePostmanItemId, customOverrides);
            lastResponseData = res.data;

            // Update status badge
            if (res.ok) {
                resStatusBadge.className = 'badge badge-success';
                resStatusBadge.textContent = `${res.status} ${res.statusText || 'OK'}`;
            } else {
                resStatusBadge.className = 'badge badge-error';
                resStatusBadge.textContent = `${res.status} ${res.statusText || 'ERROR'}`;
            }

            resTime.textContent = `${res.duration} ms`;

            // Display JSON body
            responseJson.textContent = res.data ? JSON.stringify(res.data, null, 2) : '(Empty response body - 204 No Content)';

            // Display headers
            responseHeadersBox.textContent = JSON.stringify(res.headers, null, 2);

            showToast(`${item.name} completed with status ${res.status}`, res.ok ? 'success' : 'warning');
        } catch (err) {
            const errorInfo = err.data || {};
            resStatusBadge.className = 'badge badge-error';
            resStatusBadge.textContent = errorInfo.status ? `${errorInfo.status} ERROR` : 'NETWORK FAILURE';
            resTime.textContent = errorInfo.duration ? `${errorInfo.duration} ms` : '0 ms';
            responseJson.textContent = JSON.stringify(errorInfo.data || { error: err.message }, null, 2);
            responseHeadersBox.textContent = JSON.stringify(errorInfo.headers || {}, null, 2);
            showToast(err.message, 'error');
        } finally {
            sendRequestBtn.disabled = false;
            sendRequestBtn.innerHTML = '<span>⚡</span> Send';
            updateQuickVars();
        }
    });

    copyResponseBtn.addEventListener('click', () => {
        if (lastResponseData) {
            navigator.clipboard.writeText(JSON.stringify(lastResponseData, null, 2))
                .then(() => showToast('Response JSON copied to clipboard', 'info'))
                .catch(() => showToast('Failed to copy', 'error'));
        }
    });

    // ==========================================
    // RUN ENTIRE POSTMAN COLLECTION RUNNER
    // ==========================================
    runCollectionBtn.addEventListener('click', async () => {
        runnerModal.classList.add('open');
        runnerStepsList.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 1rem;">Starting sequential test execution...</div>';

        const testPlan = [
            { id: 'login', label: '1. Authenticate (Login)', fallbackId: 'register', fallbackLabel: '1. Register New User' },
            { id: 'intake', label: '2. Intake Document (Sample Invoice)' },
            { id: 'list', label: '3. List Documents' },
            { id: 'get_doc', label: '4. Get Document by ID' },
            { id: 'refresh', label: '5. Refresh Session (Rotate Tokens)' }
        ];

        runnerStepsList.innerHTML = '';
        for (const step of testPlan) {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.justifyContent = 'space-between';
            row.style.padding = '0.75rem 1rem';
            row.style.borderRadius = 'var(--radius-md)';
            row.style.background = 'var(--bg-tertiary)';
            row.style.border = '1px solid var(--border-color)';
            row.innerHTML = `
                <div style="font-weight: 600; font-size: 0.85rem;">${step.label}</div>
                <span class="badge badge-info">RUNNING...</span>
            `;
            runnerStepsList.appendChild(row);

            const badge = row.querySelector('.badge');
            try {
                let res = await api.executePostmanItem(step.id);
                if (step.fallbackId && res.status === 401) {
                    badge.textContent = 'Trying register...';
                    const registration = await api.executePostmanItem(step.fallbackId);
                    res = registration.ok ? await api.executePostmanItem(step.id) : registration;
                }

                if (res.ok) {
                    badge.className = 'badge badge-success';
                    badge.textContent = `✓ ${res.status} OK (${res.duration}ms)`;
                } else {
                    badge.className = 'badge badge-error';
                    badge.textContent = `✕ ${res.status} (${res.duration}ms)`;
                }
            } catch (err) {
                badge.className = 'badge badge-error';
                badge.textContent = `✕ FAILED`;
            }
        }

        updateQuickVars();
    });

    closeRunnerModal.addEventListener('click', () => runnerModal.classList.remove('open'));
    closeRunnerBtn.addEventListener('click', () => runnerModal.classList.remove('open'));

    // ==========================================
    // VARIABLES MODAL
    // ==========================================
    editVarsBtn.addEventListener('click', () => {
        varsFormFields.innerHTML = Object.entries(api.variables).map(([k, v]) => {
            return `
                <div class="form-group">
                    <label class="form-label">${k}</label>
                    <input type="text" class="form-input var-input-field" data-key="${k}" value="${escapeHtml(v)}">
                </div>
            `;
        }).join('');
        varsModal.classList.add('open');
    });

    closeVarsModal.addEventListener('click', () => varsModal.classList.remove('open'));

    saveVarsBtn.addEventListener('click', () => {
        const inputs = varsFormFields.querySelectorAll('.var-input-field');
        const updated = {};
        inputs.forEach(inp => {
            updated[inp.dataset.key] = inp.value.trim();
        });
        api.setVariables(updated);
        varsModal.classList.remove('open');
        showToast('Postman environment variables saved', 'success');
    });

    resetVarsBtn.addEventListener('click', () => {
        api.setVariables(api.getDefaultVariables());
        varsModal.classList.remove('open');
        showToast('Variables reset to Postman collection defaults', 'info');
    });

    // ==========================================
    // DOCUMENT INTAKE COCKPIT
    // ==========================================
    function formatBytes(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    dropzone.addEventListener('click', () => cockpitFileInput.click());
    cockpitFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleCockpitFile(e.target.files[0]);
        }
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleCockpitFile(e.dataTransfer.files[0]);
        }
    });

    function handleCockpitFile(file) {
        selectedCockpitFile = file;
        cockpitFileName.textContent = file.name;
        cockpitFileSize.textContent = formatBytes(file.size);
        cockpitFilePreview.style.display = 'flex';
        cockpitUploadBtn.disabled = false;
    }

    cockpitRemoveFile.addEventListener('click', () => {
        selectedCockpitFile = null;
        cockpitFileInput.value = '';
        cockpitFilePreview.style.display = 'none';
        cockpitUploadBtn.disabled = true;
    });

    cockpitUploadBtn.addEventListener('click', async () => {
        if (!selectedCockpitFile) return;
        cockpitUploadBtn.disabled = true;
        cockpitUploadBtn.textContent = 'Ingesting & Extracting...';

        try {
            const doc = await api.documents.upload(selectedCockpitFile, cockpitDocType.value, cockpitSource.value);
            showToast(`Document "${doc.name}" ingested with status ${doc.status}`, doc.status === 'PROCESSED' ? 'success' : 'warning');
            selectedCockpitFile = null;
            cockpitFileInput.value = '';
            cockpitFilePreview.style.display = 'none';
            await loadCockpitDocuments();
            await openDocumentModal(doc);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            cockpitUploadBtn.disabled = !selectedCockpitFile;
            cockpitUploadBtn.textContent = 'Upload & Process with AI Intake';
        }
    });

    async function loadCockpitDocuments() {
        cockpitRefreshBtn.disabled = true;
        try {
            const docs = await api.documents.list();
            cockpitDocsCache = docs || [];
            updateCockpitStats(cockpitDocsCache);
            renderCockpitTable();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            cockpitRefreshBtn.disabled = false;
        }
    }

    cockpitRefreshBtn.addEventListener('click', loadCockpitDocuments);

    function updateCockpitStats(docs) {
        const total = docs.length;
        const processed = docs.filter(d => d.status === 'PROCESSED').length;
        const exceptions = docs.filter(d => d.status === 'EXCEPTION').length;
        const avg = total > 0
            ? (docs.reduce((acc, d) => acc + (parseFloat(d.overallConfidence) || 0), 0) / total).toFixed(1)
            : '0.0';

        statTotal.textContent = total;
        statProcessed.textContent = processed;
        statException.textContent = exceptions;
        statConfidence.textContent = `${avg}%`;
    }

    function renderCockpitTable() {
        const q = (cockpitSearchInput.value || '').toLowerCase().trim();
        const status = cockpitStatusFilter.value;

        const filtered = cockpitDocsCache.filter(doc => {
            const matchesSearch = !q ||
                (doc.name && doc.name.toLowerCase().includes(q)) ||
                (doc.type && doc.type.toLowerCase().includes(q)) ||
                (doc.uploadedBy && doc.uploadedBy.toLowerCase().includes(q));
            const matchesStatus = !status || doc.status === status;
            return matchesSearch && matchesStatus;
        });

        if (filtered.length === 0) {
            cockpitDocsBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">
                        No documents found. Ingest a document on the left or via the Postman API Studio.
                    </td>
                </tr>
            `;
            return;
        }

        cockpitDocsBody.innerHTML = filtered.map(doc => {
            const isProcessed = doc.status === 'PROCESSED';
            const badgeClass = isProcessed ? 'badge-success' : 'badge-warning';
            const confidence = parseFloat(doc.overallConfidence) || 0;
            const dateStr = doc.time ? new Date(doc.time).toLocaleString() : 'N/A';

            return `
                <tr>
                    <td>
                        <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(doc.name)}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${formatBytes(doc.size)} • ${escapeHtml(doc.contentType)}</div>
                    </td>
                    <td>
                        <span class="badge badge-info">${escapeHtml(doc.type || 'DOCUMENT')}</span>
                    </td>
                    <td>
                        <span class="badge ${badgeClass}">
                            ${isProcessed ? '✓ PROCESSED' : '⚠ EXCEPTION'}
                        </span>
                    </td>
                    <td>
                        <div class="confidence-meter">
                            <div class="confidence-bar">
                                <div class="confidence-fill" style="width: ${confidence}%"></div>
                            </div>
                            <span style="font-size: 0.8rem; font-weight: 600;">${confidence}%</span>
                        </div>
                    </td>
                    <td style="font-size: 0.8rem; color: var(--text-secondary);">
                        ${dateStr}
                    </td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="window.viewDoc('${doc.id}')">
                            Inspect
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    cockpitSearchInput.addEventListener('input', renderCockpitTable);
    cockpitStatusFilter.addEventListener('change', renderCockpitTable);

    window.viewDoc = async (id) => {
        try {
            const doc = await api.documents.get(id);
            await openDocumentModal(doc);
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    async function openDocumentModal(doc) {
        clearDocumentPreview();
        modalDocName.textContent = doc.name;
        modalDocId.textContent = doc.id;
        const isProcessed = doc.status === 'PROCESSED';
        modalDocStatus.className = `badge ${isProcessed ? 'badge-success' : 'badge-warning'}`;
        modalDocStatus.textContent = doc.status;

        if (doc.flagReason) {
            modalDocFlag.style.display = 'block';
            modalDocFlag.textContent = `Review Alert: ${doc.flagReason}`;
        } else {
            modalDocFlag.style.display = 'none';
        }

        const fields = doc.extractedFields || {};
        const confidences = doc.fieldConfidences || {};
        const keys = Object.keys(fields);

        if (keys.length === 0) {
            modalFieldsGrid.innerHTML = `<div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.85rem;">No structured invoice entities extracted.</div>`;
        } else {
            modalFieldsGrid.innerHTML = keys.map(k => {
                const val = fields[k];
                const score = confidences[k] !== undefined ? `${confidences[k]}%` : 'N/A';
                return `
                    <div class="field-card">
                        <div class="field-key">
                            <span>${escapeHtml(k)}</span>
                            <span style="color: var(--accent-blue);">${score}</span>
                        </div>
                        <div class="field-val">${escapeHtml(String(val))}</div>
                    </div>
                `;
            }).join('');
        }

        modalExtractedText.textContent = doc.extractedText || '(No text extracted)';
        modalRawJson.textContent = JSON.stringify(doc, null, 2);
        docModal.classList.add('open');
        const requestId = documentPreviewRequest;
        modalPreviewMessage.textContent = 'Loading original document...';
        modalPreviewMessage.style.display = 'block';
        modalPreviewFrame.style.display = 'none';
        modalDownloadLink.style.display = 'none';

        try {
            const file = await api.documents.originalFile(doc.id);
            if (requestId !== documentPreviewRequest) return;
            activeDocumentPreviewUrl = URL.createObjectURL(file);
            const previewable = file.type === 'application/pdf'
                || ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'text/plain'].includes(file.type);
            if (previewable) {
                modalPreviewFrame.src = activeDocumentPreviewUrl;
                modalPreviewFrame.style.display = 'block';
                modalPreviewMessage.style.display = 'none';
            } else {
                modalPreviewMessage.textContent = 'Preview is not available for this file type. Download the original file to view it.';
            }
            modalDownloadLink.href = activeDocumentPreviewUrl;
            modalDownloadLink.download = doc.name || 'document';
            modalDownloadLink.style.display = 'inline-flex';
        } catch (err) {
            if (requestId !== documentPreviewRequest) return;
            modalPreviewMessage.textContent = `${err.message} The extracted text and details are shown below.`;
        }
    }

    function clearDocumentPreview() {
        documentPreviewRequest += 1;
        modalPreviewFrame.removeAttribute('src');
        if (activeDocumentPreviewUrl) {
            URL.revokeObjectURL(activeDocumentPreviewUrl);
            activeDocumentPreviewUrl = null;
        }
    }

    closeDocModal.addEventListener('click', () => {
        docModal.classList.remove('open');
        clearDocumentPreview();
    });
    copyModalJson.addEventListener('click', () => {
        navigator.clipboard.writeText(modalRawJson.textContent)
            .then(() => showToast('JSON copied to clipboard', 'info'))
            .catch(() => showToast('Failed to copy', 'error'));
    });

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Initialize UI
    renderCollectionSidebar();
    updateActiveItemUI();
});
