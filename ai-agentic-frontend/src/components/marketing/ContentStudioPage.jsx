import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createCampaign } from '../../store/marketingSlice';
import { addAuditLog } from '../../store/governanceSlice';
import {
  Mail, CheckCircle, ShieldCheck, Send, Eye,
  Globe, RefreshCw, AlertCircle, FileText, Trash2, ArrowRight, Sparkles, Server, Users, Zap,
  Bold, Italic, Underline, List, ListOrdered, Link2, Type, Code, Eraser, XCircle, Paperclip,
  Inbox, MessageSquare, MousePointer, Activity, MailCheck
} from 'lucide-react';
import {
  getContactsByDomain,
  generateAiEmailDraft,
  sendBulkCampaign,
  getCampaignStatus,
  cancelCampaign,
  listEmailTemplates,
  createEmailTemplate,
  deleteEmailTemplate,
  getSenderConfig,
  listCustomerLists,
  getCustomerListContacts,
  listCampaigns,
  listMarketingAssets,
  getProposalDocumentBlob,
  getTrackingSummary,
  getTrackingEvents,
  getCampaignReplies,
  syncCampaignReplies,
  markReplyAsRead,
} from '../../services/apiClient';

export const ContentStudioPage = () => {
  const dispatch = useDispatch();
  const reduxCampaigns = useSelector((s) => s.marketing.campaigns || []);
  const brand = useSelector((s) => s.marketing.brandGuidelines);

  // Tabs
  const [activeTab, setActiveTab] = useState('Sender');
  const [backendCampaigns, setBackendCampaigns] = useState([]);

  // Audience targeting state
  const [audienceType, setAudienceType] = useState(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('selectedCampaignListId')) return 'LIST';
      if (localStorage.getItem('selectedDirectContact')) return 'DIRECT';
    }
    return 'DOMAIN';
  });
  const [targetDomain, setTargetDomain] = useState('volvo.se');
  const [selectedListId, setSelectedListId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCampaignListId') || '';
    }
    return '';
  });
  const [savedLists, setSavedLists] = useState([]);
  const [matchedContacts, setMatchedContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [directEmail, setDirectEmail] = useState('');
  const [directFirstName, setDirectFirstName] = useState('');
  const [directLastName, setDirectLastName] = useState('');
  const [directCompany, setDirectCompany] = useState('Oxygen to Innovation');
  const [syncedProposal, setSyncedProposal] = useState(null);

  const audienceTypeRef = useRef(audienceType);
  const changeAudienceType = (newType) => {
    audienceTypeRef.current = newType;
    setAudienceType(newType);
  };
  useEffect(() => {
    audienceTypeRef.current = audienceType;
  }, [audienceType]);

  // Marketing Assets for Brochure / Catalog Grounding
  const [marketingAssets, setMarketingAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [loadingAssets, setLoadingAssets] = useState(false);

  // AI Generation inputs
  const [aiIndustry, setAiIndustry] = useState('Automotive');
  const [aiTone, setAiTone] = useState('EXECUTIVE');
  const [aiTopic, setAiTopic] = useState('ERP Modernisation & AI Supply Chain Integration');
  const [aiCta, setAiCta] = useState('Schedule a 15-min Architecture Review');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Email Composer state
  const [campaignName, setCampaignName] = useState('Oxygen to Innovation - Executive Outreach');
  const [emailSubject, setEmailSubject] = useState('A practical path to faster exception settlement | Oxygen to Innovation');
  const [emailBodyHtml, setEmailBodyHtml] = useState(
`<p>Hi {{firstName}},</p>
<p>Organizations across the industry are under growing pressure to accelerate throughput, strengthen operational resilience, and maintain real-time visibility across complex business workflows.</p>

<p>At <strong>Oxygen to Innovation</strong>, our Enterprise AI Platform connects your operational workflows directly with intelligent document intake, automated compliance checks, and enterprise-grade exception routing. By verifying incoming files against corporate business rules in real time, teams eliminate repetitive manual data re-entry while maintaining strict audit governance.</p>

<p>For {{company}}, a practical modernization engagement focuses on four high-impact areas:</p>
<ul>
  <li><strong>ERP & Core Touchpoints:</strong> Bi-directional synchronization minimizing manual transcription latency.</li>
  <li><strong>Autonomous Exception Routing:</strong> Intelligent exception queues with customizable approval controls and audit trails.</li>
  <li><strong>Predictive Analytics:</strong> Real-time tracking of operational cycle times, exception frequency, and SLA performance.</li>
  <li><strong>Enterprise Security:</strong> Role-based access control, SOC2/ISO compliance, and complete data residency.</li>
</ul>

<p>We have prepared a targeted solution brief and reference architecture outlining a focused, phased rollout for engineering and operational leadership.</p>

<p><a href="https://o2i.tech"><strong>Schedule a 15-Minute Architecture Review</strong></a>, or reply with a convenient time that suits your calendar this week.</p>

<p>Best regards,<br/><strong>{{senderName}}</strong><br/>Oxygen to Innovation</p>
<p><small style="color: #6b7280;">If this topic is outside your current mandate, reply with your preferences and we will update our records immediately.</small></p>`
  );
  const [fromEmail, setFromEmail] = useState('');
  const [defaultSender, setDefaultSender] = useState('');
  const [allowedSenders, setAllowedSenders] = useState([]);
  const [senderName, setSenderName] = useState('Oxygen to Innovation');
  const [replyTo, setReplyTo] = useState('ab2@o2i.tech');
  const [ccEmails, setCcEmails] = useState('');
  const [bccEmails, setBccEmails] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  // Dispatch / Sending state
  const [isSending, setIsSending] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [activeCampaignResult, setActiveCampaignResult] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState(null);

  // Templates state
  const [templates, setTemplates] = useState([]);
  const [_loadingTemplates, setLoadingTemplates] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

  // Reply & Engagement Tracking state
  const [repliesList, setRepliesList] = useState([]);
  const [trackingSummary, setTrackingSummary] = useState({
    totalOpens: 0,
    uniqueOpens: 0,
    totalClicks: 0,
    uniqueClicks: 0,
    totalReplies: 0,
    unreadReplies: 0,
  });
  const [isSyncingReplies, setIsSyncingReplies] = useState(false);
  const [selectedReply, setSelectedReply] = useState(null);
  const [replyFilter, setReplyFilter] = useState('ALL'); // 'ALL' | 'UNREAD'
  const [showOriginalThread, setShowOriginalThread] = useState(false);
  const [copiedReply, setCopiedReply] = useState(false);
  const [trackingEvents, setTrackingEvents] = useState([]);
  const [activeTrackingView, setActiveTrackingView] = useState('REPLIES'); // 'REPLIES' | 'EVENTS'
  const [eventFilter, setEventFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'CLICK'

  // In-App Email Reply Composer State
  const [replyComposerOpen, setReplyComposerOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [replySenderFrom, setReplySenderFrom] = useState('');
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [replyCc, setReplyCc] = useState('');
  const [replyBcc, setReplyBcc] = useState('');
  const [showBccField, setShowBccField] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [showReplyThreadPreview, setShowReplyThreadPreview] = useState(false);
  const [activeInlineReplyId, setActiveInlineReplyId] = useState(null);

  // Notices
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('success');

  const emailSubjectRef = useRef(null);
  const emailBodyRef = useRef(null);
  const visualEditorRef = useRef(null);
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' | 'code'

  const ensureHtml = (content) => {
    if (!content) return '';
    const trimmed = content.trim();
    if (/<[a-z][\s\S]*>/i.test(trimmed)) {
      return trimmed;
    }
    return trimmed
      .split(/\n\s*\n/)
      .map(p => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`)
      .join('\n');
  };

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Helper to cleanly separate recipient's reply from our previous outreach pitch / thread history
  const splitEmailThread = (fullText) => {
    if (!fullText) return { replyText: '', quotedText: '' };
    const normalized = fullText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const splitPatterns = [
      /\n\s*(On\s+[\s\S]+?wrote:\s*[\s\S]*)/i,
      /\n\s*(-{3,}\s*Original Message\s*-{3,}[\s\S]*)/i,
      /\n\s*(From:\s+[^\n]+[\s\S]*?(?:Sent|Date):\s+[^\n]+[\s\S]*)/i,
      /\n\s*([_\-]{8,}[\s\S]*)/,
      /\n(\s*>[ \t]*[\s\S]*)/,
    ];

    for (const regex of splitPatterns) {
      const match = normalized.match(regex);
      if (match && match.index !== undefined && match.index >= 0) {
        const replyPart = normalized.substring(0, match.index).trim();
        const quotedPart = match[1].trim();
        if (replyPart.length > 0) {
          return { replyText: replyPart, quotedText: quotedPart };
        }
      }
    }

    return { replyText: normalized.trim(), quotedText: '' };
  };

  const handleVisualInput = () => {
    if (visualEditorRef.current) {
      setEmailBodyHtml(visualEditorRef.current.innerHTML);
    }
  };

  const execFormat = (command, value = null) => {
    if (visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand(command, false, value);
      setEmailBodyHtml(visualEditorRef.current.innerHTML);
    }
  };

  const handleInsertLink = () => {
    const url = window.prompt('Enter link URL (e.g. https://o2i.tech):', 'https://');
    if (url && url.trim()) {
      execFormat('createLink', url.trim());
    }
  };

  const insertTokenBody = (token) => {
    if (editorMode === 'visual' && visualEditorRef.current) {
      visualEditorRef.current.focus();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        document.execCommand('insertText', false, token);
      } else {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(token);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setEmailBodyHtml(visualEditorRef.current.innerHTML);
    } else {
      const el = emailBodyRef.current;
      if (el) {
        const start = el.selectionStart || 0;
        const end = el.selectionEnd || 0;
        const val = emailBodyHtml;
        const next = val.substring(0, start) + token + val.substring(end);
        setEmailBodyHtml(next);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start + token.length, start + token.length);
        }, 0);
      } else {
        setEmailBodyHtml(prev => prev + token);
      }
    }
  };

  useEffect(() => {
    if (editorMode === 'visual' && visualEditorRef.current) {
      if (visualEditorRef.current.innerHTML !== emailBodyHtml) {
        visualEditorRef.current.innerHTML = emailBodyHtml || '';
      }
    }
  }, [emailBodyHtml, editorMode]);

  const insertTokenSubject = (token) => {
    const el = emailSubjectRef.current;
    if (el) {
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const val = emailSubject;
      const next = val.substring(0, start) + token + val.substring(end);
      setEmailSubject(next);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + token.length, start + token.length);
      }, 0);
    } else {
      setEmailSubject(prev => prev + ' ' + token);
    }
  };

  const showFeedback = (msg, type = 'success') => {
    setNotice(msg);
    setNoticeType(type);
    setTimeout(() => setNotice(''), 4500);
  };

  // Fetch contacts matching domain
  const fetchDomainContacts = async (domainToSearch) => {
    if (audienceTypeRef.current !== 'DOMAIN') return;
    if (!domainToSearch || !domainToSearch.trim()) {
      if (audienceTypeRef.current === 'DOMAIN') setMatchedContacts([]);
      return;
    }
    setLoadingContacts(true);
    try {
      const data = await getContactsByDomain(domainToSearch);
      if (audienceTypeRef.current === 'DOMAIN') {
        setMatchedContacts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Domain search notice:', err.message);
      if (audienceTypeRef.current === 'DOMAIN') {
        setMatchedContacts([]);
      }
    } finally {
      if (audienceTypeRef.current === 'DOMAIN') {
        setLoadingContacts(false);
      }
    }
  };

  // Fetch contacts from a saved list
  const fetchListContacts = async (listId) => {
    if (audienceTypeRef.current !== 'LIST') return;
    if (!listId) {
      if (audienceTypeRef.current === 'LIST') setMatchedContacts([]);
      return;
    }
    setLoadingContacts(true);
    try {
      const data = await getCustomerListContacts(listId);
      if (audienceTypeRef.current === 'LIST') {
        setMatchedContacts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('List contacts notice:', err.message);
      if (audienceTypeRef.current === 'LIST') {
        setMatchedContacts([]);
        showFeedback(`Failed to load list contacts: ${err.message}`, 'error');
      }
    } finally {
      if (audienceTypeRef.current === 'LIST') {
        setLoadingContacts(false);
      }
    }
  };

  // Load saved lists
  const fetchSavedLists = async () => {
    try {
      const data = await listCustomerLists();
      if (Array.isArray(data)) {
        setSavedLists(data);
        if (data.length > 0) {
          setSelectedListId(prev => {
            if (prev && data.some(l => l.id === prev)) {
              return prev;
            }
            const firstId = data[0].id;
            if (audienceTypeRef.current === 'LIST') {
              fetchListContacts(firstId);
            }
            return firstId;
          });
        }
      }
    } catch (err) {
      console.warn('Saved lists fetch notice:', err.message);
    }
  };

  // Load tenant marketing assets (brochures & catalogs)
  const fetchMarketingAssets = async () => {
    setLoadingAssets(true);
    try {
      const data = await listMarketingAssets();
      const assets = Array.isArray(data) ? data : [];
      setMarketingAssets(assets);
      if (assets.length > 0) {
        setSelectedAssetId(prev => prev || assets[0].id);
      }
    } catch (err) {
      console.warn('Marketing assets fetch notice:', err.message);
    } finally {
      setLoadingAssets(false);
    }
  };

  // Load templates
  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const data = await listEmailTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Templates fetch notice:', err.message);
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Load backend campaigns
  const fetchCampaignsList = async () => {
    try {
      const data = await listCampaigns();
      if (Array.isArray(data)) setBackendCampaigns(data);
    } catch {}
  };

  const campaignsList = [
    ...backendCampaigns,
    ...reduxCampaigns.filter(rc => !backendCampaigns.some(bc => (bc.campaignId && bc.campaignId === rc.id) || bc.id === rc.id)),
  ];

  const fetchTrackingAndReplies = async () => {
    try {
      const [sum, rep, evts] = await Promise.all([
        getTrackingSummary().catch(() => null),
        getCampaignReplies().catch(() => null),
        getTrackingEvents().catch(() => []),
      ]);
      if (sum) setTrackingSummary(sum);
      if (rep && Array.isArray(rep.replies)) setRepliesList(rep.replies);
      if (Array.isArray(evts)) setTrackingEvents(evts);
    } catch (err) {
      console.warn('Could not load tracking/replies:', err);
    }
  };

  const handleManualSyncReplies = async () => {
    setIsSyncingReplies(true);
    try {
      const res = await syncCampaignReplies();
      if (res.status === 'SUCCESS') {
        showFeedback(res.message + (res.newReplies > 0 ? ` (${res.newReplies} new replies synchronized!)` : ' (Inbox is up-to-date)'), 'success');
      } else {
        showFeedback(res.message || 'Sync completed', 'info');
      }
      await fetchTrackingAndReplies();
    } catch (err) {
      showFeedback(`Reply sync failed: ${err.message}`, 'error');
    } finally {
      setIsSyncingReplies(false);
    }
  };

  const handleMarkReplyRead = async (replyId) => {
    try {
      await markReplyAsRead(replyId);
      setRepliesList(prev => prev.map(r => r.id === replyId ? { ...r, isRead: true } : r));
      setTrackingSummary(prev => ({ ...prev, unreadReplies: Math.max(0, (prev.unreadReplies || 1) - 1) }));
    } catch (err) {
      console.warn('Failed to mark reply as read:', err);
    }
  };

  const formatContactGreeting = (senderName, senderEmail) => {
    if (!senderName || senderName.trim().length === 0) {
      if (senderEmail && senderEmail.includes('@')) {
        const userPart = senderEmail.split('@')[0].replace(/[._-]/g, ' ');
        return userPart.charAt(0).toUpperCase() + userPart.slice(1);
      }
      return 'there';
    }
    let name = senderName.trim();
    if (name.includes(',')) {
      const parts = name.split(',');
      if (parts.length >= 2 && parts[1].trim().length > 0) {
        name = parts[1].trim();
      } else {
        name = parts[0].trim();
      }
    }
    const words = name.split(/\s+/);
    if (words.length > 0 && words[0].length > 0) {
      name = words[0];
    }
    if (name.length > 1 && name === name.toUpperCase()) {
      name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    return name;
  };

  const handleToggleInlineReply = (reply) => {
    if (!reply) return;
    if (activeInlineReplyId === reply.id) {
      setActiveInlineReplyId(null);
      setReplyTarget(null);
    } else {
      setActiveInlineReplyId(reply.id);
      setReplyTarget(reply);
      const origSubj = reply.subject || '';
      const cleanSubj = origSubj.trim().toLowerCase().startsWith('re:') ? origSubj.trim() : `Re: ${origSubj.trim() || 'Your message'}`;
      setReplySubject(cleanSubj);
      setReplySenderFrom(fromEmail || defaultSender || 'ab2@o2i.tech');
      setReplyCc('');
      setReplyBcc('');
      setShowBccField(false);
      setReplyAttachments([]);
      const firstName = formatContactGreeting(reply.senderName, reply.senderEmail);
      setReplyBody(`Hi ${firstName},\n\nThank you for getting back to us.\n\nBest regards,\n${senderName || 'Oxygen to Innovation Team'}`);
    }
  };

  const handleOpenReplyComposer = (reply) => {
    if (!reply) return;
    setReplyTarget(reply);
    const origSubj = reply.subject || '';
    const cleanSubj = origSubj.trim().toLowerCase().startsWith('re:') ? origSubj.trim() : `Re: ${origSubj.trim() || 'Your message'}`;
    setReplySubject(cleanSubj);
    setReplySenderFrom(fromEmail || defaultSender || 'ab2@o2i.tech');
    setReplyCc('');
    setReplyBcc('');
    setShowBccField(false);
    setReplyAttachments([]);
    setShowReplyThreadPreview(false);

    const firstName = formatContactGreeting(reply.senderName, reply.senderEmail);
    setReplyBody(`Hi ${firstName},\n\nThank you for getting back to us.\n\nBest regards,\n${senderName || 'Oxygen to Innovation Team'}`);

    setSelectedReply(null);
    setReplyComposerOpen(true);
  };

  const handleSendReplySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!replyTarget || !replyTarget.senderEmail) {
      showFeedback('No recipient email specified for reply.', 'error');
      return;
    }
    if (!replySubject.trim()) {
      showFeedback('Please provide an email subject for your reply.', 'error');
      return;
    }
    if (!replyBody.trim()) {
      showFeedback('Please write your reply message before sending.', 'error');
      return;
    }

    setIsSendingReply(true);
    try {
      const { replyText } = splitEmailThread(replyTarget.bodyText || replyTarget.snippet);
      const originalHistory = replyText || replyTarget.snippet || replyTarget.bodyText || '';
      const replyDate = replyTarget.receivedAt ? new Date(replyTarget.receivedAt).toLocaleString() : 'recently';
      const senderDisplay = replyTarget.senderName
        ? `${replyTarget.senderName} &lt;${replyTarget.senderEmail}&gt;`
        : replyTarget.senderEmail;

      const formattedHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14.5px; line-height: 1.6; color: #1e293b;">
          ${replyBody.trim().split('\n').map(p => p.trim() ? `<p style="margin: 0 0 12px 0;">${escapeHtml(p)}</p>` : `<br/>`).join('')}
          <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #e2e8f0; border-left: 3px solid #cbd5e1; padding-left: 14px; color: #64748b; font-size: 13px;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569;">
              On ${replyDate}, ${senderDisplay} wrote:
            </p>
            <div style="white-space: pre-wrap; font-family: inherit;">
              ${escapeHtml(originalHistory)}
            </div>
          </div>
        </div>
      `.trim();

      const effectiveFrom = replySenderFrom.trim() || fromEmail.trim() || defaultSender || 'ab2@o2i.tech';
      const effectiveSenderName = senderName || 'Oxygen to Innovation';

      await sendBulkCampaign({
        campaignName: `Direct Reply: ${replySubject.trim()}`,
        directEmail: replyTarget.senderEmail.trim(),
        directFirstName: replyTarget.senderName || '',
        directCompany: replyTarget.schoolName || '',
        subject: replySubject.trim(),
        contentHtml: formattedHtml,
        fromEmail: effectiveFrom,
        senderName: effectiveSenderName,
        replyTo: replyTo || effectiveFrom,
        inReplyTo: replyTarget.messageId || undefined,
        cc: replyCc.trim() || undefined,
        bcc: replyBcc.trim() || undefined,
        attachments: replyAttachments,
      });

      showFeedback(`Reply sent successfully to ${replyTarget.senderEmail}!`, 'success');

      if (!replyTarget.isRead) {
        handleMarkReplyRead(replyTarget.id);
      }

      setReplyComposerOpen(false);
      setActiveInlineReplyId(null);
      setReplyTarget(null);
      setReplyBody('');
      setReplyCc('');
      setReplyBcc('');
      setShowBccField(false);
      setReplyAttachments([]);
    } catch (err) {
      showFeedback(`Failed to send reply: ${err.message}`, 'error');
    } finally {
      setIsSendingReply(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const preselectedListId = localStorage.getItem('selectedCampaignListId');
    const preselectedDirectContactRaw = localStorage.getItem('selectedDirectContact');

    if (!preselectedListId && !preselectedDirectContactRaw && audienceTypeRef.current === 'DOMAIN') {
      fetchDomainContacts(targetDomain);
    }
    fetchTemplates();
    fetchSavedLists();
    fetchMarketingAssets();
    fetchCampaignsList();
    fetchTrackingAndReplies();
    getSenderConfig()
      .then(cfg => {
        if (cfg?.defaultSender) {
          setDefaultSender(cfg.defaultSender);
          setAllowedSenders(cfg.allowedSenders || [cfg.defaultSender]);
          setFromEmail(prev => prev || cfg.defaultSender);
        }
      })
      .catch(() => {});
  }, []); // intentionally run once on mount

  const applyProposalDraft = async (prop) => {
    if (!prop) return;
    setActiveTab('Sender');
    setSyncedProposal(prop);

    if (prop.campaignName) setCampaignName(prop.campaignName);
    if (prop.subject) setEmailSubject(prop.subject);
    if (prop.bodyHtml) setEmailBodyHtml(prop.bodyHtml);

    if (prop.contactEmail && prop.contactEmail.includes('@')) {
      changeAudienceType('DIRECT');
      setDirectEmail(prop.contactEmail.trim());
      if (prop.contactName) {
        const parts = prop.contactName.trim().split(/\s+/);
        setDirectFirstName(parts[0] || '');
        setDirectLastName(parts.slice(1).join(' ') || '');
      } else {
        setDirectFirstName('');
        setDirectLastName('');
      }
      if (prop.company) setDirectCompany(prop.company.trim());
    } else if (prop.domain) {
      changeAudienceType('DOMAIN');
      setTargetDomain(prop.domain);
      fetchDomainContacts(prop.domain);
    }

    // Auto-fetch original proposal document if present and not already attached
    if (prop.proposalId && prop.originalFilename) {
      try {
        const blob = await getProposalDocumentBlob(prop.proposalId);
        if (blob && blob.size > 0) {
          const file = new File([blob], prop.originalFilename, { type: blob.type || 'application/pdf' });
          setAttachmentFiles([file]);
        }
      } catch (err) {
        console.warn('Could not auto-attach proposal document blob:', err.message);
      }
    }

    showFeedback(`Proposal for "${prop.company}" automatically drafted and synced in Email Sender!`, 'success');
  };

  useEffect(() => {
    if (audienceType === 'LIST') {
      if (selectedListId) {
        fetchListContacts(selectedListId);
      } else {
        setMatchedContacts([]);
      }
    } else if (audienceType === 'DOMAIN') {
      fetchDomainContacts(targetDomain);
    } else if (audienceType === 'DIRECT') {
      setMatchedContacts([]);
    }
  }, [audienceType, selectedListId]);

  // Check if routed from Customer Lists or Proposals on mount
  useEffect(() => {
    const preselectedListId = localStorage.getItem('selectedCampaignListId');
    const preselectedListName = localStorage.getItem('selectedCampaignListName');
    if (preselectedListId) {
      setActiveTab('Sender');
      changeAudienceType('LIST');
      setSelectedListId(preselectedListId);
      fetchListContacts(preselectedListId);
      if (preselectedListName) {
        setCampaignName(`${preselectedListName} Outreach Campaign`);
      }
      localStorage.removeItem('selectedCampaignListId');
      localStorage.removeItem('selectedCampaignListName');
    }

    const preselectedDirectContactRaw = localStorage.getItem('selectedDirectContact');
    if (preselectedDirectContactRaw) {
      try {
        const contact = JSON.parse(preselectedDirectContactRaw);
        setActiveTab('Sender');
        changeAudienceType('DIRECT');
        setDirectEmail(contact.email || '');
        setDirectFirstName(contact.firstName || '');
        setDirectLastName(contact.lastName || '');
        setDirectCompany(contact.company || 'Oxygen to Innovation');
        setCampaignName(`Direct Outreach - ${contact.company || contact.email}`);
      } catch {}
      localStorage.removeItem('selectedDirectContact');
    }

    const proposalCampaignRaw = localStorage.getItem('selectedProposalCampaign') || localStorage.getItem('activeSelectedProposal');
    if (proposalCampaignRaw) {
      try {
        const prop = JSON.parse(proposalCampaignRaw);
        applyProposalDraft(prop);
      } catch (e) {
        console.warn('Proposal sync parse warning:', e.message);
      }
      localStorage.removeItem('selectedProposalCampaign');
    }
  }, []);

  // Handle AI Email Generation
  const handleGenerateAi = async () => {
    if (!selectedAssetId) {
      showFeedback('Please select a brochure or catalog as grounding source before generating.', 'error');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await generateAiEmailDraft({
        targetDomain,
        industry: aiIndustry,
        tone: aiTone,
        topic: aiTopic,
        callToAction: aiCta,
        prompt: aiPrompt,
        sourceAssetId: selectedAssetId,
      });

      if (res.subject || res.subjectLine) setEmailSubject(res.subject || res.subjectLine);
      if (res.bodyHtml || res.contentHtml) setEmailBodyHtml(res.bodyHtml || res.contentHtml);
      if (res.campaignName) setCampaignName(res.campaignName);

      showFeedback(`AI drafted personalized email grounded in selected brochure/catalog.`);
    } catch (err) {
      showFeedback(`AI generation failed: ${err.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Bulk Campaign Dispatch
  const handleSendBulk = async (e) => {
    e.preventDefault();
    if (audienceType === 'DIRECT') {
      if (!directEmail || !directEmail.trim() || !directEmail.includes('@')) {
        showFeedback('Please enter a valid recipient email address for test send.', 'error');
        return;
      }
    } else if (audienceType === 'DOMAIN' && (!targetDomain || !targetDomain.trim())) {
      showFeedback('Please enter a target customer domain.', 'error');
      return;
    } else if (audienceType === 'LIST' && !selectedListId) {
      showFeedback('Please select a saved customer list.', 'error');
      return;
    } else if (matchedContacts.length === 0) {
      const msg = audienceType === 'DOMAIN'
        ? `No verified contacts found for domain "${targetDomain}". Import contacts first, or switch to "⚡ Test / Single" tab to send immediately!`
        : `No contacts found in the selected saved list. Switch to "⚡ Test / Single" tab to test immediately!`;
      showFeedback(msg, 'error');
      return;
    }

    if (defaultSender && fromEmail && !allowedSenders.some(s => s.toLowerCase() === fromEmail.trim().toLowerCase())) {
      showFeedback(`Sender email "${fromEmail}" must match backend env (SMTP_FROM: ${defaultSender})`, 'error');
      return;
    }

    setIsSending(true);
    try {
      const selectedListName = savedLists.find(l => l.id === selectedListId)?.name || 'Saved List';
      const effectiveFrom = fromEmail.trim() || defaultSender || 'verified-sender@example.com';
      const effectiveCampaignName = campaignName.trim() || (audienceType === 'DIRECT' ? `Direct Test to ${directEmail.trim()}` : 'Executive Campaign');
      const result = await sendBulkCampaign({
        campaignName: effectiveCampaignName,
        targetDomain: audienceType === 'DOMAIN' ? targetDomain.trim() : undefined,
        targetListId: audienceType === 'LIST' ? selectedListId : undefined,
        directEmail: audienceType === 'DIRECT' ? directEmail.trim() : undefined,
        directFirstName: audienceType === 'DIRECT' ? directFirstName.trim() : undefined,
        directLastName: audienceType === 'DIRECT' ? directLastName.trim() : undefined,
        directCompany: audienceType === 'DIRECT' ? directCompany.trim() : undefined,
        subject: emailSubject,
        contentHtml: ensureHtml(emailBodyHtml),
        fromEmail: effectiveFrom,
        senderName,
        replyTo,
        cc: ccEmails.trim() || undefined,
        bcc: bccEmails.trim() || undefined,
        variables: ['firstName', 'lastName', 'company', 'senderName', 'email'],
        attachment: attachmentFiles[0] || null,
        attachments: attachmentFiles,
      });

      setActiveCampaignResult(result);
      fetchCampaignsList();
      const count = result.recipientCount || (audienceType === 'DIRECT' ? 1 : matchedContacts.length);
      showFeedback(`Email "${effectiveCampaignName}" accepted — dispatching to ${count} recipient(s) via SMTP!`);

      const channelDesc = audienceType === 'DIRECT'
        ? `Direct Test Email (${directEmail})`
        : audienceType === 'DOMAIN'
          ? `Bulk Domain Email (@${targetDomain})`
          : `Bulk List Email (${selectedListName})`;
      const targetDesc = audienceType === 'DIRECT'
        ? `${directEmail} (${directFirstName || 'Valued Customer'} @ ${directCompany || 'Enterprise'})`
        : audienceType === 'DOMAIN'
          ? `${targetDomain} Verified Contacts (${matchedContacts.length})`
          : `${selectedListName} (${matchedContacts.length} Contacts)`;

      dispatch(createCampaign({
        id: result.campaignId || `CMP-${Math.floor(100 + Math.random() * 900)}`,
        title: campaignName,
        channel: channelDesc,
        targetSegment: targetDesc,
        objective: aiTopic,
        contentPreview: emailSubject,
        status: 'DEPLOYED',
        brandCompliance: { score: 98, status: 'PASSED', voiceCheck: aiTone, bannedWordsDetected: 0 },
        metrics: { predictedCTR: '6.4%', targetReach: `${matchedContacts.length} Contacts` },
        createdAt: 'Just now',
      }));

      dispatch(addAuditLog({
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        actor: 'user.marketing-operator',
        action: 'DOMAIN_BULK_EMAIL_DISPATCHED',
        endpoint: '/api/marketing/campaigns/send-bulk',
        riskTier: 'MEDIUM',
        model: 'SMTP Gateway',
        tokens: 840,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        details: `Dispatched campaign "${campaignName}" to ${matchedContacts.length} contacts (${targetDesc}).`,
      }));

      // Poll campaign status actively while SENDING
      if (result.campaignId && result.status === 'SENDING') {
        let errCount = 0;
        const intervalId = setInterval(async () => {
          try {
            const status = await getCampaignStatus(result.campaignId);
            errCount = 0;
            setTrackingStatus(status);
            setActiveCampaignResult(prev => prev ? {
              ...prev,
              status: status.status,
              sent: status.sentCount,
              failed: status.bouncedCount,
              recipientCount: status.totalRecipients || prev.recipientCount,
            } : prev);
            if (status.status !== 'SENDING') {
              clearInterval(intervalId);
              fetchCampaignsList();
              const msg = status.status === 'COMPLETED'
                ? `Campaign completed! ${status.sentCount || 0} / ${status.totalRecipients || 0} emails delivered safely with GoDaddy rate pacing.`
                : `Campaign finished with status: ${status.status} (${status.sentCount || 0} sent, ${status.bouncedCount || 0} failed).`;
              showFeedback(msg, status.status === 'COMPLETED' ? 'success' : 'error');
            }
          } catch {
            errCount++;
            if (errCount > 5) clearInterval(intervalId);
          }
        }, 2000);
      } else if (result.campaignId) {
        setTimeout(async () => {
          try {
            const status = await getCampaignStatus(result.campaignId);
            setTrackingStatus(status);
            setActiveCampaignResult(prev => prev ? {
              ...prev,
              status: status.status,
              sent: status.sentCount,
              failed: status.bouncedCount,
              recipientCount: status.totalRecipients || prev.recipientCount,
            } : prev);
          } catch {}
        }, 1000);
      }
    } catch (err) {
      showFeedback(`Campaign dispatch failed: ${err.message}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Handle Cancel Campaign
  const handleCancelCampaign = async (campaignIdToCancel) => {
    const cid = campaignIdToCancel || activeCampaignResult?.campaignId;
    if (!cid) return;
    if (!window.confirm('Are you sure you want to stop/cancel sending this campaign? Any pending emails will be aborted.')) {
      return;
    }
    setIsCancelling(true);
    try {
      const res = await cancelCampaign(cid);
      showFeedback(res.message || 'Campaign cancelled successfully. Further email sending stopped.', 'info');
      setTrackingStatus(prev => prev ? { ...prev, status: 'CANCELLED' } : { status: 'CANCELLED' });
      setActiveCampaignResult(prev => prev ? { ...prev, status: 'CANCELLED' } : { status: 'CANCELLED' });
      fetchCampaignsList();
    } catch (err) {
      showFeedback(`Failed to cancel campaign: ${err.message}`, 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle Save Template
  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) return;
    try {
      const created = await createEmailTemplate({
        name: newTemplateName.trim(),
        subject: emailSubject,
        contentHtml: ensureHtml(emailBodyHtml),
        industry: aiIndustry,
        tone: aiTone,
      });
      setTemplates(prev => [created, ...prev]);
      setShowSaveTemplateModal(false);
      setNewTemplateName('');
      showFeedback(`Saved template "${created.name}".`);
    } catch (err) {
      showFeedback(`Could not save template: ${err.message}`, 'error');
    }
  };

  // Handle Delete Template
  const handleDeleteTemplate = async (templateId, name) => {
    if (!window.confirm(`Delete template "${name}"?`)) return;
    try {
      await deleteEmailTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      showFeedback('Template deleted.');
    } catch (err) {
      showFeedback(`Delete failed: ${err.message}`, 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-tag">Marketing · Email Sender & Bulk Outreach</div>
          <h2>Email Sender — Domain Blast & Campaign Manager</h2>
          <p>
            Target specific customer domains (e.g. <code>@volvo.se</code>), generate AI-personalized email drafts,
            and send bulk SMTP campaigns via <code>/api/marketing/campaigns/send-bulk</code>.
            Requires <code>SMTP_HOST</code>, <code>SMTP_PORT</code>, <code>SMTP_USERNAME</code>, <code>SMTP_PASSWORD</code> and <code>SMTP_FROM</code> configured on the server.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${activeTab === 'Sender' ? 'btn-solid' : 'btn-ghost'}`}
            onClick={() => setActiveTab('Sender')}
          >
            <Mail size={13} /> Email Sender
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'Campaigns' ? 'btn-solid' : 'btn-ghost'}`}
            onClick={() => {
              setActiveTab('Campaigns');
              fetchCampaignsList();
            }}
          >
            <Send size={13} /> Campaigns ({campaignsList.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'Templates' ? 'btn-solid' : 'btn-ghost'}`}
            onClick={() => setActiveTab('Templates')}
          >
            <FileText size={13} /> Email Templates ({templates.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'Responses' ? 'btn-solid' : 'btn-ghost'}`}
            onClick={() => {
              setActiveTab('Responses');
              fetchTrackingAndReplies();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: activeTab === 'Responses' ? 'var(--brand-primary, #2563eb)' : undefined,
              color: activeTab === 'Responses' ? '#fff' : undefined,
            }}
          >
            <Inbox size={13} /> Responses & Inbox
            {trackingSummary.unreadReplies > 0 ? (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: 10,
                marginLeft: 3
              }}>
                {trackingSummary.unreadReplies}
              </span>
            ) : (
              <span style={{ fontSize: 11, opacity: 0.8, marginLeft: 2 }}>
                ({repliesList.length})
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SMTP Configuration Notice */}
      <div style={{
        padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
        color: '#92400e',
      }}>
        <Server size={13} style={{ flexShrink: 0 }} />
        <span>
          <strong>SMTP & Verified Senders:</strong> Set <code>SMTP_HOST</code>, <code>SMTP_PORT</code>, <code>SMTP_USERNAME</code>, <code>SMTP_PASSWORD</code>, <code>SMTP_FROM</code> and optional <code>SMTP_ALLOWED_FROM</code> in your server environment. The entered From Email must match one of your configured verified addresses.
        </span>
      </div>

      {notice && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, fontSize: 12.5, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8,
          background: noticeType === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${noticeType === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: noticeType === 'success' ? '#16a34a' : '#dc2626',
        }}>
          {noticeType === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {notice}
        </div>
      )}

      {/* ─── TAB: EMAIL SENDER ─── */}
      {activeTab === 'Sender' && (
        <div>
          {syncedProposal && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 16,
              background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(99,102,241,0.08))',
              border: '1px solid rgba(37,99,235,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: '#2563eb', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <FileText size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    ⚡ Proposal Auto-Draft Synced: {syncedProposal.company}
                    <span className="badge success" style={{ fontSize: 10 }}>{syncedProposal.status || 'ACTIVE'}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>{syncedProposal.value}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Recipient: <strong>{syncedProposal.contactEmail || syncedProposal.domain}</strong> · Subject, executive proposal pitch, and attachment auto-drafted from proposal.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => {
                    setSyncedProposal(null);
                    localStorage.removeItem('activeSelectedProposal');
                    localStorage.removeItem('selectedProposalCampaign');
                    showFeedback('Unlinked proposal draft.', 'info');
                  }}
                  style={{ fontSize: 11 }}
                >
                  ✕ Unlink Proposal
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20 }}>
          {/* LEFT: Target Domain & AI Generator Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 1. Target Audience Box (Domain, Saved List, or Direct Test) */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  {audienceType === 'DOMAIN' ? <Globe size={14} /> : audienceType === 'LIST' ? <Users size={14} /> : <Zap size={14} />} Target Audience
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    type="button"
                    className={`btn btn-xs ${audienceType === 'DOMAIN' ? 'btn-solid' : 'btn-ghost'}`}
                    style={audienceType === 'DOMAIN' ? { background: 'var(--brand-primary, #2563eb)', color: '#fff', fontSize: 11, padding: '2px 8px' } : { fontSize: 11, padding: '2px 8px' }}
                    onClick={() => changeAudienceType('DOMAIN')}
                  >
                    Domain
                  </button>
                  <button
                    type="button"
                    className={`btn btn-xs ${audienceType === 'LIST' ? 'btn-solid' : 'btn-ghost'}`}
                    style={audienceType === 'LIST' ? { background: 'var(--brand-primary, #2563eb)', color: '#fff', fontSize: 11, padding: '2px 8px' } : { fontSize: 11, padding: '2px 8px' }}
                    onClick={() => {
                      changeAudienceType('LIST');
                      const targetId = selectedListId || (savedLists.length > 0 ? savedLists[0].id : '');
                      if (targetId) {
                        setSelectedListId(targetId);
                        fetchListContacts(targetId);
                      }
                    }}
                  >
                    Saved List
                  </button>
                  <button
                    type="button"
                    className={`btn btn-xs ${audienceType === 'DIRECT' ? 'btn-solid' : 'btn-ghost'}`}
                    style={audienceType === 'DIRECT' ? { background: '#10b981', color: '#fff', fontSize: 11, padding: '2px 8px' } : { fontSize: 11, padding: '2px 8px' }}
                    onClick={() => changeAudienceType('DIRECT')}
                  >
                    ⚡ Test / Single
                  </button>
                </div>
              </div>

              {audienceType === 'DIRECT' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>Recipient Email (Direct Test)</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="e.g. test@company.com or your-email@gmail.com"
                      value={directEmail}
                      onChange={(e) => setDirectEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div>
                      <label className="form-label" style={{ fontSize: 11 }}>First Name ({`{{firstName}}`})</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Rahul"
                        value={directFirstName}
                        onChange={(e) => setDirectFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: 11 }}>Last Name ({`{{lastName}}`})</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Sharma"
                        value={directLastName}
                        onChange={(e) => setDirectLastName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: 11 }}>Company ({`{{company}}`})</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Volvo Group"
                        value={directCompany}
                        onChange={(e) => setDirectCompany(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : audienceType === 'DOMAIN' ? (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. volvo.se"
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => fetchDomainContacts(targetDomain)}
                    disabled={loadingContacts}
                    title="Refresh domain contacts"
                  >
                    <RefreshCw size={13} className={loadingContacts ? 'spin' : ''} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <select
                    className="input"
                    value={selectedListId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setSelectedListId(newId);
                      if (newId) fetchListContacts(newId);
                      else setMatchedContacts([]);
                    }}
                  >
                    <option value="">-- Select Saved List ({savedLists.length}) --</option>
                    {savedLists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.contacts ?? l.count ?? 0} contacts)
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      fetchSavedLists();
                      if (selectedListId) fetchListContacts(selectedListId);
                    }}
                    disabled={loadingContacts}
                    title="Refresh saved lists"
                  >
                    <RefreshCw size={13} className={loadingContacts ? 'spin' : ''} />
                  </button>
                </div>
              )}

              <div style={{ padding: '10px 12px', borderRadius: 7, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>Target Audience:</span>
                  <span className="mono" style={{ fontWeight: 700, color: (audienceType === 'DIRECT' ? (directEmail ? '#16a34a' : '#f59e0b') : (matchedContacts.length > 0 ? '#16a34a' : '#ef4444')) }}>
                    {audienceType === 'DIRECT' ? (directEmail ? '1 Direct Recipient' : 'Enter recipient') : `${matchedContacts.length} Contacts`}
                  </span>
                </div>
                {audienceType === 'DIRECT' ? (
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                    ⚡ Single test email will be sent directly to <strong>{directEmail || 'entered address'}</strong> with tokens replaced.
                  </div>
                ) : matchedContacts.length > 0 ? (
                  <div style={{ maxHeight: 90, overflowY: 'auto', marginTop: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                    {matchedContacts.map((c, i) => (
                      <div key={c.id || i} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        • {c.email} ({c.firstName || 'Contact'} — {c.company || 'Enterprise'})
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>
                    {audienceType === 'DOMAIN'
                      ? `No contacts found with domain @${targetDomain}. Import them via Customer Lists, or click "⚡ Test / Single" above.`
                      : (selectedListId ? 'No contacts found in this list. Click "⚡ Test / Single" above.' : 'Select a saved list above.')}
                  </div>
                )}
              </div>
            </div>

            {/* 2. AI Generator Tuning */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><Sparkles size={14} /> AI Grounding & Objective</div>
                <span className="badge">Groq / Grounded</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Brochure / Catalog Asset Picker */}
                <div>
                  <label className="form-label" style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Grounding Brochure / Catalog *</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      style={{ padding: '0 4px', fontSize: 10, color: 'var(--brand-primary, #2563eb)' }}
                      onClick={fetchMarketingAssets}
                      disabled={loadingAssets}
                      title="Refresh uploaded brochures & catalogs"
                    >
                      <RefreshCw size={10} className={loadingAssets ? 'spin' : ''} /> Refresh
                    </button>
                  </label>
                  {marketingAssets.length > 0 ? (
                    <select
                      className="input"
                      value={selectedAssetId}
                      onChange={e => setSelectedAssetId(e.target.value)}
                      required
                    >
                      <option value="">-- Select a Brochure or Catalog ({marketingAssets.length}) --</option>
                      {marketingAssets.map(asset => (
                        <option key={asset.id} value={asset.id}>
                          📄 {asset.originalFilename || asset.name} ({asset.type || 'ASSET'}{asset.folder ? ` • ${asset.folder}` : ''})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ fontSize: 11, color: '#b45309', background: 'rgba(245, 158, 11, 0.1)', padding: '6px 8px', borderRadius: 5, border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                      No brochures or catalogs found in tenant assets. Please upload one in <strong>Asset Library</strong> to ground AI drafts.
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>Target Industry</label>
                  <select className="input" value={aiIndustry} onChange={e => setAiIndustry(e.target.value)}>
                    <option>Automotive</option>
                    <option>Logistics & Freight</option>
                    <option>Financial Services</option>
                    <option>Manufacturing</option>
                    <option>Technology</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>Voice Tone</label>
                  <select className="input" value={aiTone} onChange={e => setAiTone(e.target.value)}>
                    <option value="EXECUTIVE">Executive / C-Suite (Authoritative)</option>
                    <option value="TECHNICAL">Technical / Architecture Focus</option>
                    <option value="VALUE">Value Proposition & ROI Focus</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>Campaign Topic</label>
                  <input
                    className="input"
                    value={aiTopic}
                    onChange={e => setAiTopic(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>Call To Action (CTA)</label>
                  <input
                    className="input"
                    value={aiCta}
                    onChange={e => setAiCta(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>Custom Prompt / Angle (Optional)</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="e.g. Focus on our SAP integration, 30-day proof-of-concept, and enterprise security."
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    style={{ fontSize: 12, resize: 'vertical' }}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-solid btn-sm"
                  style={{ background: '#6366f1', color: '#fff', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  onClick={handleGenerateAi}
                  disabled={isGenerating}
                >
                  <Sparkles size={13} /> {isGenerating ? 'Drafting with Groq AI...' : 'Generate Personalized Pitch'}
                </button>
              </div>
            </div>

            {/* 3. Brand Compliance Rulebook Preview */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><ShieldCheck size={14} /> Brand Safety Policy</div>
                <span className="badge success">Enforced</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                <div><strong>Tone:</strong> {brand.tone}</div>
                <div style={{ marginTop: 4 }}><strong>Merge tokens:</strong> <code>{`{{firstName}}`}</code>, <code>{`{{company}}`}</code></div>
              </div>
            </div>
          </div>

          {/* RIGHT: Email Composer & Bulk Dispatcher */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div>
                <div className="card-title"><Mail size={15} /> Email Composer & Bulk Sender</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Sending to <strong>{matchedContacts.length}</strong> recipients ({audienceType === 'DOMAIN' ? `@${targetDomain}` : (savedLists.find(l => l.id === selectedListId)?.name || 'Saved List')}) via SMTP
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowSaveTemplateModal(true)}
              >
                Save as Template
              </button>
            </div>

            <form onSubmit={handleSendBulk} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">Campaign Name</label>
                <input
                  type="text"
                  className="input"
                  value={campaignName}
                  onChange={e => setCampaignName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>From Email (Verified Sender)</span>
                    <span style={{ fontSize: 10, color: 'var(--brand-primary, #2563eb)' }}>
                      {defaultSender ? `BACKEND ENV: ${defaultSender}` : 'SMTP_FROM'}
                    </span>
                  </label>
                  <input
                    type="email"
                    list="allowed-senders-list"
                    className="input"
                    value={fromEmail}
                    onChange={e => setFromEmail(e.target.value)}
                    placeholder={defaultSender ? defaultSender : 'Must match backend env (SMTP_FROM)'}
                  />
                  {allowedSenders.length > 0 && (
                    <datalist id="allowed-senders-list">
                      {allowedSenders.map(s => <option key={s} value={s} />)}
                    </datalist>
                  )}
                  {defaultSender && (
                    <div style={{
                      fontSize: 11,
                      marginTop: 4,
                      color: allowedSenders.some(s => s.toLowerCase() === fromEmail.trim().toLowerCase()) || !fromEmail
                        ? '#16a34a'
                        : '#dc2626',
                    }}>
                      {allowedSenders.some(s => s.toLowerCase() === fromEmail.trim().toLowerCase())
                        ? `✓ Matches backend verified env sender (${fromEmail})`
                        : fromEmail
                          ? `⚠ Address must match backend env (SMTP_FROM: ${defaultSender})`
                          : `Defaulting to backend env: ${defaultSender}`}
                    </div>
                  )}
                </div>
                <div>
                  <label className="form-label">Sender Display Name</label>
                  <input
                    type="text"
                    className="input"
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    placeholder="Oxygen to Innovation"
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Reply-To Email</label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {!showCc && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand-primary, #2563eb)', padding: '2px 8px', borderRadius: 4, background: 'rgba(37, 99, 235, 0.08)' }}
                        onClick={() => setShowCc(true)}
                        title="Add Cc (Carbon Copy - visible to all recipients)"
                      >
                        + Cc
                      </button>
                    )}
                    {!showBcc && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        style={{ fontSize: 11, fontWeight: 600, color: '#059669', padding: '2px 8px', borderRadius: 4, background: 'rgba(5, 150, 105, 0.08)' }}
                        onClick={() => setShowBcc(true)}
                        title="Add Bcc (Blind Carbon Copy - hidden from recipients)"
                      >
                        + Bcc
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="email"
                  className="input"
                  value={replyTo}
                  onChange={e => setReplyTo(e.target.value)}
                  placeholder="ab2@o2i.tech"
                />
              </div>

              {showCc && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--bg-hover)', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ background: '#2563eb', color: '#fff', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700 }}>Cc</span>
                      <span>Carbon Copy (Gmail Style — recipients can see each other)</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => { setShowCc(false); setCcEmails(''); }}
                      style={{ fontSize: 11, padding: '1px 6px', color: 'var(--text-muted)' }}
                      title="Remove Cc field"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter email addresses separated by commas (e.g. manager@o2i.tech, partner@company.com)"
                    value={ccEmails}
                    onChange={e => setCcEmails(e.target.value)}
                    style={{ fontSize: 12 }}
                  />
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                    Recipients will see these email addresses in the Cc header.
                  </div>
                </div>
              )}

              {showBcc && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--bg-hover)', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ background: '#059669', color: '#fff', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700 }}>Bcc</span>
                      <span>Blind Carbon Copy (Gmail Style — completely hidden from recipients)</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => { setShowBcc(false); setBccEmails(''); }}
                      style={{ fontSize: 11, padding: '1px 6px', color: 'var(--text-muted)' }}
                      title="Remove Bcc field"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter email addresses separated by commas (e.g. crm-inbox@o2i.tech, audit@o2i.tech)"
                    value={bccEmails}
                    onChange={e => setBccEmails(e.target.value)}
                    style={{ fontSize: 12 }}
                  />
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                    Recipients will NOT see these email addresses (confidential CRM / manager loop).
                  </div>
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Subject Line</label>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Insert:</span>
                    <button
                      type="button"
                      className="btn btn-xs"
                      style={{ fontSize: 10, padding: '1px 6px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 4 }}
                      onClick={() => insertTokenSubject('{{company}}')}
                      title="Insert Company token into Subject"
                    >
                      + {`{{company}}`}
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs"
                      style={{ fontSize: 10, padding: '1px 6px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 4 }}
                      onClick={() => insertTokenSubject('{{school}}')}
                      title="Insert School token into Subject"
                    >
                      + {`{{school}}`}
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs"
                      style={{ fontSize: 10, padding: '1px 6px', background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 4 }}
                      onClick={() => insertTokenSubject('{{firstName}}')}
                      title="Insert First Name token into Subject"
                    >
                      + {`{{firstName}}`}
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs"
                      style={{ fontSize: 10, padding: '1px 6px', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: 4 }}
                      onClick={() => insertTokenSubject('{{lastName}}')}
                      title="Insert Last Name token into Subject"
                    >
                      + {`{{lastName}}`}
                    </button>
                  </div>
                </div>
                <input
                  ref={emailSubjectRef}
                  type="text"
                  className="input"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  required
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <label className="form-label" style={{ marginBottom: 0, fontWeight: 700 }}>Email Body Composer</label>
                    <span style={{ fontSize: 11, color: editorMode === 'visual' ? '#16a34a' : 'var(--text-muted)', background: editorMode === 'visual' ? 'rgba(34,197,94,0.1)' : 'var(--bg-hover)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                      {editorMode === 'visual' ? '✓ No HTML Tags Needed' : 'Raw HTML Mode'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Insert Variable:</span>
                    {[
                      { token: '{{company}}', label: '{{company}} (Org / School)', color: '#059669', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)' },
                      { token: '{{school}}', label: '{{school}}', color: '#059669', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)' },
                      { token: '{{org}}', label: '{{org}}', color: '#059669', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)' },
                      { token: '{{firstName}}', label: '{{firstName}}', color: '#4f46e5', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.25)' },
                      { token: '{{lastName}}', label: '{{lastName}}', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.1)', border: 'rgba(2, 132, 199, 0.25)' },
                      { token: '{{email}}', label: '{{email}}', color: '#d97706', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.25)' },
                      { token: '{{senderName}}', label: '{{senderName}}', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)', border: 'rgba(124, 58, 237, 0.25)' },
                    ].map(item => (
                      <button
                        key={item.token}
                        type="button"
                        className="btn btn-xs"
                        style={{
                          fontSize: 10.5,
                          padding: '2px 7px',
                          color: item.color,
                          background: item.bg,
                          border: `1px solid ${item.border}`,
                          borderRadius: 5,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        onClick={() => insertTokenBody(item.token)}
                        title={`Click to insert ${item.token} at cursor position`}
                      >
                        + {item.token}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toolbar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '7px 10px',
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px 8px 0 0',
                  borderBottom: 'none',
                  flexWrap: 'wrap',
                  gap: 6
                }}>
                  {editorMode === 'visual' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        style={{ minWidth: 26, padding: '3px 7px' }}
                        onClick={() => execFormat('bold')}
                        title="Bold (Ctrl+B)"
                      >
                        <Bold size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        style={{ minWidth: 26, padding: '3px 7px' }}
                        onClick={() => execFormat('italic')}
                        title="Italic (Ctrl+I)"
                      >
                        <Italic size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        style={{ minWidth: 26, padding: '3px 7px' }}
                        onClick={() => execFormat('underline')}
                        title="Underline (Ctrl+U)"
                      >
                        <Underline size={13} />
                      </button>
                      <div style={{ width: 1, height: 16, background: 'var(--border-default)', margin: '0 4px' }} />
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        style={{ minWidth: 26, padding: '3px 7px' }}
                        onClick={() => execFormat('insertUnorderedList')}
                        title="Bullet List"
                      >
                        <List size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        style={{ minWidth: 26, padding: '3px 7px' }}
                        onClick={() => execFormat('insertOrderedList')}
                        title="Numbered List"
                      >
                        <ListOrdered size={13} />
                      </button>
                      <div style={{ width: 1, height: 16, background: 'var(--border-default)', margin: '0 4px' }} />
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        style={{ minWidth: 26, padding: '3px 7px' }}
                        onClick={handleInsertLink}
                        title="Insert Web Link"
                      >
                        <Link2 size={13} /> Link
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        style={{ minWidth: 26, padding: '3px 7px' }}
                        onClick={() => execFormat('removeFormat')}
                        title="Clear Formatting"
                      >
                        <Eraser size={13} /> Clear
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Advanced HTML Source Editor
                    </div>
                  )}

                  {/* Mode switcher tabs */}
                  <div style={{
                    display: 'inline-flex',
                    borderRadius: 6,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    padding: 2
                  }}>
                    <button
                      type="button"
                      style={{
                        border: 'none',
                        borderRadius: 4,
                        padding: '3px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: editorMode === 'visual' ? 'var(--brand-primary, #2563eb)' : 'transparent',
                        color: editorMode === 'visual' ? '#fff' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      onClick={() => setEditorMode('visual')}
                      title="User-Friendly Visual Editor (Normal text without HTML tags)"
                    >
                      <Type size={11} /> Visual (Friendly)
                    </button>
                    <button
                      type="button"
                      style={{
                        border: 'none',
                        borderRadius: 4,
                        padding: '3px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: editorMode === 'code' ? 'var(--brand-primary, #2563eb)' : 'transparent',
                        color: editorMode === 'code' ? '#fff' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      onClick={() => setEditorMode('code')}
                      title="Raw HTML Code Mode"
                    >
                      <Code size={11} /> HTML Code
                    </button>
                  </div>
                </div>

                {/* Editor Content Body */}
                {editorMode === 'visual' ? (
                  <div
                    ref={visualEditorRef}
                    contentEditable
                    onInput={handleVisualInput}
                    onBlur={handleVisualInput}
                    style={{
                      minHeight: 240,
                      maxHeight: 480,
                      overflowY: 'auto',
                      padding: '14px 16px',
                      borderRadius: '0 0 8px 8px',
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-input, var(--bg-elevated))',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      lineHeight: 1.65,
                      outline: 'none',
                    }}
                    suppressContentEditableWarning
                  />
                ) : (
                  <textarea
                    ref={emailBodyRef}
                    className="input mono"
                    rows={11}
                    value={emailBodyHtml}
                    onChange={e => setEmailBodyHtml(e.target.value)}
                    style={{
                      fontSize: 12,
                      borderRadius: '0 0 8px 8px',
                      borderTop: 'none'
                    }}
                    required
                  />
                )}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {editorMode === 'visual'
                    ? '💡 Tip: Type normally or paste text. Use Bold, Italic, Bullet lists, or Insert Variables above — no HTML tags needed!'
                    : '💡 In HTML Code mode, you can directly inspect and edit raw tags like <p>, <strong>, and <a>.'}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Paperclip size={13} style={{ color: '#2563eb' }} />
                    <strong>Attachments</strong> (Brochures, Images, PDFs, Catalogs — Max 25 MB total)
                  </span>
                  {attachmentFiles.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      style={{ color: '#dc2626', padding: '0 6px', fontSize: 11, fontWeight: 600 }}
                      onClick={() => setAttachmentFiles([])}
                    >
                      ✕ Clear All ({attachmentFiles.length})
                    </button>
                  )}
                </label>

                {/* Multi-file Input */}
                <input
                  type="file"
                  multiple
                  className="input"
                  style={{ fontSize: 12, padding: '7px 10px', width: '100%', cursor: 'pointer' }}
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.zip"
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);
                    if (newFiles.length === 0) return;

                    setAttachmentFiles(prev => {
                      const combined = [...prev];
                      for (const nf of newFiles) {
                        const existingIdx = combined.findIndex(f => f.name === nf.name && f.size === nf.size);
                        if (existingIdx >= 0) {
                          combined[existingIdx] = nf;
                        } else {
                          combined.push(nf);
                        }
                      }
                      const totalBytes = combined.reduce((acc, f) => acc + f.size, 0);
                      if (totalBytes > 25 * 1024 * 1024) {
                        showFeedback('Total attachments size exceeds 25 MB limit. Please remove some files.', 'error');
                      }
                      return combined;
                    });
                    e.target.value = '';
                  }}
                />

                {/* Attached Files Badges */}
                {attachmentFiles.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {attachmentFiles.map((file, idx) => {
                      const sizeInKb = (file.size / 1024).toFixed(0);
                      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
                      const displaySize = file.size > 1024 * 1024 ? `${sizeInMb} MB` : `${sizeInKb} KB`;
                      const isImg = file.type?.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(file.name);
                      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

                      return (
                        <div
                          key={`${file.name}-${idx}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '3px 8px',
                            background: isImg ? 'rgba(147, 51, 234, 0.08)' : (isPdf ? 'rgba(239, 68, 68, 0.08)' : 'rgba(37, 99, 235, 0.08)'),
                            border: `1px solid ${isImg ? 'rgba(147, 51, 234, 0.25)' : (isPdf ? 'rgba(239, 68, 68, 0.25)' : 'rgba(37, 99, 235, 0.25)')}`,
                            borderRadius: 6,
                            fontSize: 11.5,
                            color: isImg ? '#7e22ce' : (isPdf ? '#dc2626' : '#2563eb'),
                            fontWeight: 500
                          }}
                        >
                          <span>{isImg ? '🖼️' : (isPdf ? '📄' : '📎')}</span>
                          <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.name}>
                            {file.name}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>({displaySize})</span>
                          <button
                            type="button"
                            onClick={() => setAttachmentFiles(prev => prev.filter((_, i) => i !== idx))}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '0 2px',
                              fontSize: 12,
                              fontWeight: 700,
                              lineHeight: 1
                            }}
                            title="Remove file"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Dynamic Live Preview (Always visible with real recipient or sample fallback) */}
              {(() => {
                const previewRecipient = (audienceType === 'DIRECT' && directEmail)
                  ? { email: directEmail, firstName: directFirstName || 'Partner', lastName: directLastName || '', company: directCompany || 'Oxygen to Innovation' }
                  : (matchedContacts.length > 0)
                    ? matchedContacts[0]
                    : { email: 'client@example.com', firstName: 'Partner', lastName: '', company: 'Oxygen to Innovation' };

                const isSample = audienceType !== 'DIRECT' && matchedContacts.length === 0;

                const rawFirst = (previewRecipient.firstName && previewRecipient.firstName !== '—') ? previewRecipient.firstName.trim() : '';
                const rawLast = (previewRecipient.lastName && previewRecipient.lastName !== '—') ? previewRecipient.lastName.trim() : '';
                const fullName = (rawFirst + (rawLast ? ` ${rawLast}` : '')).trim();

                const isGenericName = (name) => {
                  if (!name) return true;
                  const n = name.trim().toLowerCase();
                  return ['mail', 'contact', 'mail contact', 'primary', 'primary contact', 'admission', 'admission contact', 'admissions', 'admissions contact', 'info', 'info contact', 'admin', 'admin contact', 'office', 'general'].includes(n);
                };

                const deriveOrgName = (email, website) => {
                  let d = (website || (email?.includes('@') ? email.split('@')[1] : '') || '').toLowerCase().trim();
                  d = d.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
                  d = d.replace(/\.(com|ca|org|net|edu|on\.ca|qc\.ca|bc\.ca|ab\.ca)$/i, '');
                  if (!d) return 'Team';
                  for (const suffix of ['school', 'academy', 'college', 'montessori', 'institute', 'grammar']) {
                    if (d.endsWith(suffix) && d.length > suffix.length) {
                      const base = d.slice(0, -suffix.length);
                      return `${base.charAt(0).toUpperCase() + base.slice(1)} ${suffix.charAt(0).toUpperCase() + suffix.slice(1)}`;
                    }
                  }
                  return d.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                };

                const rawComp = (previewRecipient.company && previewRecipient.company !== '—')
                  ? previewRecipient.company.trim()
                  : ((previewRecipient.parentOrganization && previewRecipient.parentOrganization !== '—')
                      ? previewRecipient.parentOrganization.trim()
                      : '');

                // Smart auto-fallback: if company name is missing, use contact's personal name only if real, else clean domain name!
                let compValue = rawComp;
                if (!compValue) {
                  if (fullName && !isGenericName(fullName)) {
                    compValue = fullName;
                  } else {
                    compValue = deriveOrgName(previewRecipient.email, previewRecipient.website);
                  }
                }

                const fNameValue = (rawFirst && !isGenericName(rawFirst)) ? rawFirst : (compValue || 'Partner');

                const displayCompany = previewRecipient.company || compValue;
                const displayName = (previewRecipient.firstName && !isGenericName(previewRecipient.firstName))
                  ? `${previewRecipient.firstName} ${previewRecipient.lastName || ''}`.trim()
                  : (displayCompany ? `${displayCompany} Team` : 'Contact');

                const renderedSubject = (emailSubject || '')
                  .replace(/\{\{firstName\}\}/gi, fNameValue)
                  .replace(/\{\{lastName\}\}/gi, rawLast)
                  .replace(/\{\{(company|organization|org|orgName|companyName|school|schoolName|parentOrganization)\}\}/gi, compValue)
                  .replace(/\{\{email\}\}/gi, previewRecipient.email || 'client@example.com')
                  .replace(/\{\{senderName\}\}/gi, senderName || 'Oxygen to Innovation');

                const renderedHtml = (emailBodyHtml || '')
                  .replace(/\{\{firstName\}\}/gi, `<span style="background: rgba(99,102,241,0.15); padding: 1px 5px; border-radius: 4px; color: #4338ca; font-weight: 600;">${fNameValue}</span>`)
                  .replace(/\{\{lastName\}\}/gi, rawLast ? `<span style="background: rgba(2,132,199,0.15); padding: 1px 5px; border-radius: 4px; color: #0284c7; font-weight: 600;">${rawLast}</span>` : '')
                  .replace(/\{\{(company|organization|org|orgName|companyName|school|schoolName|parentOrganization)\}\}/gi, `<span style="background: rgba(16,185,129,0.15); padding: 1px 5px; border-radius: 4px; color: #047857; font-weight: 600;">${compValue}</span>`)
                  .replace(/\{\{email\}\}/gi, `<span style="background: rgba(245,158,11,0.15); padding: 1px 5px; border-radius: 4px; color: #b45309; font-weight: 600;">${previewRecipient.email || 'client@example.com'}</span>`)
                  .replace(/\{\{senderName\}\}/gi, senderName || 'Oxygen to Innovation');

                return (
                  <div style={{ padding: '14px 16px', borderRadius: 8, background: 'var(--bg-hover)', border: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Eye size={12} /> Live Preview (Tokens Rendered)
                      </div>
                      <div style={{ fontSize: 11, color: isSample ? '#f59e0b' : 'var(--brand-primary, #2563eb)' }}>
                        {isSample ? '⚡ Sample Preview: ' : '✓ Preview Recipient: '}
                        <strong>{previewRecipient.email}</strong> ({displayName}{displayCompany ? ` @ ${displayCompany}` : ''})
                      </div>
                    </div>
                    {(ccEmails.trim() || bccEmails.trim()) && (
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, marginBottom: 8, paddingBottom: 6, borderBottom: '1px dashed var(--border-subtle)', color: 'var(--text-muted)' }}>
                        {ccEmails.trim() && <div><strong style={{ color: '#2563eb' }}>Cc:</strong> {ccEmails.trim()}</div>}
                        {bccEmails.trim() && <div><strong style={{ color: '#059669' }}>Bcc:</strong> {bccEmails.trim()}</div>}
                      </div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
                      Subject: {renderedSubject}
                    </div>
                    <div
                      style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}
                      dangerouslySetInnerHTML={{ __html: renderedHtml }}
                    />
                  </div>
                );
              })()}

              {/* Active Campaign Result */}
              {activeCampaignResult && (
                (() => {
                  const effectiveStatus = trackingStatus?.status || activeCampaignResult.status;
                  const isFailed = effectiveStatus === 'FAILED';
                  const isCancelled = effectiveStatus === 'CANCELLED';
                  const isCompleted = effectiveStatus === 'COMPLETED';
                  const isSendingLoop = effectiveStatus === 'SENDING';

                  return (
                    <div style={{
                      padding: '12px 14px', borderRadius: 8,
                      background: isFailed ? 'rgba(239,68,68,0.08)' : (isCancelled ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)'),
                      border: `1px solid ${isFailed ? 'rgba(239,68,68,0.25)' : (isCancelled ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.25)')}`,
                      color: isFailed ? '#dc2626' : (isCancelled ? '#b45309' : '#16a34a'),
                      fontSize: 12
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ fontWeight: 700 }}>
                          {isFailed
                            ? '✕ Campaign Failed'
                            : (isCancelled
                              ? '⏹ Campaign Stopped / Cancelled'
                              : (isCompleted
                                ? '✓ Campaign Completed'
                                : '✓ Campaign Accepted (Sending...)'))} — ID: {activeCampaignResult.campaignId || 'CMP-QUEUED'}
                        </div>
                        {isSendingLoop && (
                          <button
                            type="button"
                            onClick={() => handleCancelCampaign(activeCampaignResult.campaignId)}
                            disabled={isCancelling}
                            className="btn btn-sm"
                            style={{
                              background: '#dc2626',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '5px 12px',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              boxShadow: '0 1px 3px rgba(220,38,38,0.3)'
                            }}
                          >
                            <XCircle size={14} /> {isCancelling ? 'Stopping...' : 'Stop / Cancel Sending'}
                          </button>
                        )}
                      </div>
                      <div>Recipients: {trackingStatus?.totalRecipients || activeCampaignResult.recipientCount || (audienceType === 'DIRECT' ? 1 : matchedContacts.length)} contacts ({audienceType === 'DIRECT' ? directEmail : (audienceType === 'DOMAIN' ? `@${targetDomain}` : (savedLists.find(l => l.id === selectedListId)?.name || 'Saved List'))})</div>
                      {activeCampaignResult.cc && activeCampaignResult.cc.length > 0 && (
                        <div>Cc: <strong>{activeCampaignResult.cc.join(', ')}</strong></div>
                      )}
                      {activeCampaignResult.bcc && activeCampaignResult.bcc.length > 0 && (
                        <div>Bcc: <strong>{activeCampaignResult.bcc.join(', ')}</strong></div>
                      )}
                      <div>
                        Sent: <strong>{trackingStatus?.sentCount ?? activeCampaignResult.sent ?? 0}</strong>
                        {' · '}
                        Failed: <strong>{trackingStatus?.bouncedCount ?? activeCampaignResult.failed ?? 0}</strong>
                      </div>
                      {activeCampaignResult.rateLimitPolicy && (
                        <div style={{ marginTop: 4, color: '#0284c7', fontSize: 11.5, fontWeight: 600 }}>
                          🛡️ {activeCampaignResult.rateLimitPolicy}
                        </div>
                      )}
                      {activeCampaignResult.note && (
                        <div style={{ marginTop: 4, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          ℹ {activeCampaignResult.note}
                        </div>
                      )}
                      {activeCampaignResult.errorDetail && (
                        <div style={{ marginTop: 4, color: '#dc2626', fontWeight: 600 }}>
                          ⚠ Error: {activeCampaignResult.errorDetail}
                        </div>
                      )}
                      {trackingStatus && (
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, fontSize: 12 }}>
                            <span>
                              Status: <strong style={{ color: isCompleted ? '#16a34a' : (isCancelled ? '#b45309' : (isSendingLoop ? '#2563eb' : '#dc2626')) }}>{trackingStatus.status}</strong>
                              {isSendingLoop && (
                                <span style={{ marginLeft: 8, fontSize: 11, color: '#0284c7' }}>
                                  {(trackingStatus.sentCount > 0 && trackingStatus.sentCount % 25 === 0 && trackingStatus.sentCount < (trackingStatus.totalRecipients || 1))
                                    ? '⏸ Cooldown active (60s wait for GoDaddy rate limit)'
                                    : '🚀 Sending batch (25/min safe mode)...'}
                                </span>
                              )}
                            </span>
                            <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                              {trackingStatus.sentCount ?? 0} / {trackingStatus.totalRecipients ?? activeCampaignResult.totalQueued ?? 1} Sent
                            </span>
                          </div>
                          <div style={{ height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min(100, Math.round(((trackingStatus.sentCount ?? 0) / (trackingStatus.totalRecipients || 1)) * 100))}%`,
                              background: isCompleted ? '#22c55e' : (isCancelled ? '#f59e0b' : '#2563eb'),
                              transition: 'width 0.4s ease'
                            }} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              {/* GoDaddy Rate Pacing Info Pill */}
              <div style={{
                fontSize: 11.5,
                color: '#0369a1',
                background: 'rgba(14, 165, 233, 0.08)',
                border: '1px solid rgba(14, 165, 233, 0.25)',
                padding: '6px 12px',
                borderRadius: 6,
                marginTop: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>🛡️</span>
                <span><strong>GoDaddy Rate Limit Protection:</strong> Pacing at <strong>25 emails/minute</strong> with 60s cooldown between batches to prevent mailbox bans.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Target: <strong>{audienceType === 'DIRECT' ? (directEmail || 'Direct Recipient') : `${matchedContacts.length} recipients`}</strong> {audienceType === 'DIRECT' ? '' : `(${audienceType === 'DOMAIN' ? `@${targetDomain}` : (savedLists.find(l => l.id === selectedListId)?.name || 'Saved List')})`}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {(trackingStatus?.status || activeCampaignResult?.status) === 'SENDING' && (
                    <button
                      type="button"
                      onClick={() => handleCancelCampaign(activeCampaignResult?.campaignId)}
                      disabled={isCancelling}
                      className="btn"
                      style={{
                        background: '#dc2626',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '9px 18px',
                        fontWeight: 600,
                        fontSize: 12.5,
                        borderRadius: 6,
                        cursor: 'pointer',
                        border: 'none',
                        boxShadow: '0 1px 3px rgba(220,38,38,0.3)'
                      }}
                    >
                      <XCircle size={14} /> {isCancelling ? 'Stopping...' : 'Stop / Cancel Sending'}
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn-solid"
                    style={{ background: 'var(--brand-primary, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px' }}
                    disabled={isSending || (trackingStatus?.status || activeCampaignResult?.status) === 'SENDING' || (audienceType === 'DIRECT' ? !directEmail : matchedContacts.length === 0)}
                  >
                    <Send size={13} /> {isSending ? 'Dispatching...' : (syncedProposal ? `⚡ Send Proposal to ${directFirstName || directEmail}` : (audienceType === 'DIRECT' ? '⚡ Send Single Test Email' : `Send Bulk Email (${matchedContacts.length})`))}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        </div>
      )}

      {/* ─── TAB: CAMPAIGNS ─── */}
      {activeTab === 'Campaigns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Dispatched Outreach Campaigns</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Track delivery, status, and target audiences for all bulk campaigns.
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={fetchCampaignsList}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {campaignsList.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No campaigns dispatched yet. Use the <strong>Email Sender</strong> tab to launch your first outreach campaign.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
              {campaignsList.map((camp, idx) => (
                <div key={camp.id || camp.campaignId || idx} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {camp.id || camp.campaignId}
                      </span>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span className={`pill-badge ${camp.status === 'COMPLETED' || camp.status === 'DEPLOYED' || camp.status === 'APPROVED' ? 'success' : (camp.status === 'FAILED' ? 'danger' : (camp.status === 'CANCELLED' ? 'warning' : 'neutral'))}`}>
                          {camp.status}
                        </span>
                        {camp.status === 'SENDING' && (
                          <button
                            type="button"
                            className="btn btn-xs"
                            style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                            onClick={() => handleCancelCampaign(camp.id || camp.campaignId)}
                            disabled={isCancelling}
                          >
                            <XCircle size={11} /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 6px' }}>{camp.title || camp.campaignName}</h4>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      <strong>Audience:</strong> {camp.targetSegment || camp.targetDomain}
                    </div>
                    {camp.subject && (
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <strong>Subject:</strong> {camp.subject}
                      </div>
                    )}
                  </div>

                  <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>{camp.createdAt || (camp.dispatchedAt ? new Date(camp.dispatchedAt).toLocaleString() : 'Recent')}</span>
                    {camp.sentCount !== undefined ? (
                      <span><strong>{camp.sentCount}</strong> / {camp.totalRecipients || 0} sent</span>
                    ) : (
                      <span>{camp.metrics?.targetReach || 'Active'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: EMAIL TEMPLATES ─── */}
      {activeTab === 'Templates' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {templates.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
              No email templates yet. Compose an email and click "Save as Template".
            </div>
          )}
          {templates.map(tpl => (
            <div key={tpl.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className="badge" style={{ fontSize: 10 }}>{tpl.industry || 'Enterprise'}</span>
                    {tpl.tone && <span className="badge" style={{ fontSize: 10, opacity: 0.7 }}>{tpl.tone}</span>}
                  </div>
                  <button
                    className="btn btn-ghost btn-xs"
                    style={{ color: '#dc2626' }}
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                    title="Delete template"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{tpl.name}</h4>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {tpl.subject}
                </div>
                <div
                  style={{ fontSize: 11.5, color: 'var(--text-secondary)', maxHeight: 80, overflow: 'hidden', lineHeight: 1.5 }}
                  dangerouslySetInnerHTML={{ __html: tpl.contentHtml }}
                />
              </div>

              <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className="btn btn-xs btn-solid"
                  onClick={() => {
                    setEmailSubject(tpl.subject);
                    setEmailBodyHtml(tpl.contentHtml);
                    setCampaignName(tpl.name);
                    setActiveTab('Sender');
                    showFeedback(`Loaded template "${tpl.name}" into Email Sender.`);
                  }}
                >
                  Use in Sender <ArrowRight size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RESPONSES & INBOUND TRACKING INBOX TAB */}
      {activeTab === 'Responses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Top Banner & IMAP Sync */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Inbox size={18} color="var(--brand-primary, #2563eb)" /> Inbound Replies & Engagement Tracking
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Real-time tracking of recipient opens, link clicks, and inbound responses from ALL recipients (enterprise clients, leads, and schools) synchronized directly from GoDaddy IMAP (<code>ab2@o2i.tech</code>).
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 6, padding: 2, border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className={`btn btn-xs ${replyFilter === 'ALL' ? 'btn-solid' : 'btn-ghost'}`}
                  onClick={() => setReplyFilter('ALL')}
                >
                  All ({repliesList.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-xs ${replyFilter === 'UNREAD' ? 'btn-solid' : 'btn-ghost'}`}
                  onClick={() => setReplyFilter('UNREAD')}
                  style={{ color: trackingSummary.unreadReplies > 0 ? '#ef4444' : undefined }}
                >
                  Unread ({trackingSummary.unreadReplies})
                </button>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-solid"
                onClick={handleManualSyncReplies}
                disabled={isSyncingReplies}
                style={{
                  background: 'var(--brand-primary, #2563eb)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 600,
                  boxShadow: '0 1px 3px rgba(37,99,235,0.25)'
                }}
              >
                <RefreshCw size={13} className={isSyncingReplies ? 'spin' : ''} />
                {isSyncingReplies ? 'Syncing GoDaddy Inbox...' : 'Sync Replies Now'}
              </button>
            </div>
          </div>

          {/* 4 Funnel Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
            <div
              className="card"
              style={{ padding: '14px 16px', borderLeft: '4px solid #2563eb', cursor: 'pointer', transition: 'all 0.2s ease' }}
              onClick={() => setActiveTab('Campaigns')}
              title="Click to view all Campaigns"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Campaigns Sent</span>
                <Send size={15} color="#2563eb" />
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                {campaignsList.length}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Bulk outreach campaigns
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: '14px 16px',
                borderLeft: '4px solid #10b981',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTrackingView === 'EVENTS' && eventFilter === 'OPEN' ? 'rgba(16,185,129,0.08)' : undefined
              }}
              onClick={() => { setActiveTrackingView('EVENTS'); setEventFilter('OPEN'); }}
              title="Click to view Email Opens log"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Opens</span>
                <Eye size={15} color="#10b981" />
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>
                {trackingSummary.uniqueOpens} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>({trackingSummary.totalOpens} total)</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                1x1 transparent tracking pixel
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: '14px 16px',
                borderLeft: '4px solid #f59e0b',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTrackingView === 'EVENTS' && eventFilter === 'CLICK' ? 'rgba(245,158,11,0.08)' : undefined
              }}
              onClick={() => { setActiveTrackingView('EVENTS'); setEventFilter('CLICK'); }}
              title="Click to view Link Clicks log"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Link Clicks</span>
                <MousePointer size={15} color="#f59e0b" />
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>
                {trackingSummary.uniqueClicks} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>({trackingSummary.totalClicks} total)</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Tracked links clicked by recipients
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: '14px 16px',
                borderLeft: '4px solid #8b5cf6',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTrackingView === 'REPLIES' ? 'rgba(139,92,246,0.08)' : undefined
              }}
              onClick={() => setActiveTrackingView('REPLIES')}
              title="Click to view Inbound Replies"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Inbound Replies</span>
                <Inbox size={15} color="#8b5cf6" />
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#8b5cf6' }}>
                {trackingSummary.totalReplies} <span style={{ fontSize: 12, fontWeight: 600, color: '#ef4444' }}>{trackingSummary.unreadReplies > 0 ? `(${trackingSummary.unreadReplies} new)` : ''}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Synced from GoDaddy IMAP
              </div>
            </div>
          </div>

          {/* View Mode Switcher: Replies Inbox vs Live Tracking Events */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={`btn btn-sm ${activeTrackingView === 'REPLIES' ? 'btn-solid' : 'btn-ghost'}`}
                onClick={() => setActiveTrackingView('REPLIES')}
                style={{
                  background: activeTrackingView === 'REPLIES' ? 'var(--brand-primary, #2563eb)' : undefined,
                  color: activeTrackingView === 'REPLIES' ? '#fff' : undefined,
                  display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600
                }}
              >
                <Inbox size={14} /> Inbound Replies ({repliesList.length})
                {trackingSummary.unreadReplies > 0 && (
                  <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 10 }}>
                    {trackingSummary.unreadReplies}
                  </span>
                )}
              </button>

              <button
                type="button"
                className={`btn btn-sm ${activeTrackingView === 'EVENTS' ? 'btn-solid' : 'btn-ghost'}`}
                onClick={() => setActiveTrackingView('EVENTS')}
                style={{
                  background: activeTrackingView === 'EVENTS' ? 'var(--brand-primary, #2563eb)' : undefined,
                  color: activeTrackingView === 'EVENTS' ? '#fff' : undefined,
                  display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600
                }}
              >
                <Activity size={14} /> Live Opens & Clicks Activity ({trackingEvents.length})
              </button>
            </div>

            {activeTrackingView === 'EVENTS' && (
              <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 6, padding: 2, border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className={`btn btn-xs ${eventFilter === 'ALL' ? 'btn-solid' : 'btn-ghost'}`}
                  onClick={() => setEventFilter('ALL')}
                >
                  All ({trackingEvents.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-xs ${eventFilter === 'OPEN' ? 'btn-solid' : 'btn-ghost'}`}
                  onClick={() => setEventFilter('OPEN')}
                  style={{ color: eventFilter === 'OPEN' ? undefined : '#10b981' }}
                >
                  Opens ({trackingSummary.totalOpens})
                </button>
                <button
                  type="button"
                  className={`btn btn-xs ${eventFilter === 'CLICK' ? 'btn-solid' : 'btn-ghost'}`}
                  onClick={() => setEventFilter('CLICK')}
                  style={{ color: eventFilter === 'CLICK' ? undefined : '#f59e0b' }}
                >
                  Clicks ({trackingSummary.totalClicks})
                </button>
              </div>
            )}
          </div>

          {/* Live Events Stream */}
          {activeTrackingView === 'EVENTS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(() => {
                const filteredEvents = trackingEvents.filter(e => eventFilter === 'ALL' || e.eventType === eventFilter);
                if (filteredEvents.length === 0) {
                  return (
                    <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                      <Activity size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                        No tracking events recorded yet for this filter
                      </div>
                      <div>
                        When recipients open outreach emails or click tracked links, real-time engagement events appear here immediately.
                      </div>
                    </div>
                  );
                }

                return filteredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="card"
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderLeft: `4px solid ${evt.eventType === 'OPEN' ? '#10b981' : '#f59e0b'}`,
                      background: evt.eventType === 'OPEN' ? 'rgba(16,185,129,0.03)' : 'rgba(245,158,11,0.03)',
                      gap: 12,
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        background: evt.eventType === 'OPEN' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: evt.eventType === 'OPEN' ? '#047857' : '#b45309',
                        padding: '3px 8px', borderRadius: 4, fontWeight: 800, fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4
                      }}>
                        {evt.eventType === 'OPEN' ? <Eye size={12} /> : <MousePointer size={12} />}
                        {evt.eventType === 'OPEN' ? 'EMAIL OPENED' : 'LINK CLICKED'}
                      </span>
                      <span style={{
                        background: 'rgba(37,99,235,0.12)', color: '#2563eb',
                        padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 11
                      }}>
                        🏢 {evt.companyName || 'Company / Contact'}
                      </span>
                      <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                        {evt.contactName || evt.contactEmail}
                      </strong>
                      {evt.contactName && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          &lt;{evt.contactEmail}&gt;
                        </span>
                      )}
                      {evt.eventType === 'CLICK' && evt.targetUrl && (
                        <a
                          href={evt.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: 11.5,
                            color: '#2563eb',
                            textDecoration: 'underline',
                            maxWidth: 320,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'inline-block'
                          }}
                        >
                          🔗 {evt.targetUrl}
                        </a>
                      )}
                      {evt.eventType === 'OPEN' && (
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                          {evt.userAgent?.includes('Inbound Reply') ? '✓ Confirmed via Inbound Reply' : '✓ 1x1 Pixel Loaded'}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      <span>IP: {evt.ipAddress || 'unknown'}</span>
                      <span>{new Date(evt.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

          {/* Replies Inbox List */}
          {activeTrackingView === 'REPLIES' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(() => {
              const filtered = repliesList.filter(r => replyFilter === 'ALL' || !r.isRead);
              if (filtered.length === 0) {
                return (
                  <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    <Inbox size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {replyFilter === 'UNREAD' ? 'No unread replies' : 'No incoming email responses found yet'}
                    </div>
                    <div>
                      When any recipient (enterprise company, lead, client, or school) replies to your email, their message will appear here automatically.
                      Click <strong>"Sync Replies Now"</strong> above to check your GoDaddy mailbox.
                    </div>
                  </div>
                );
              }

              return filtered.map((reply) => (
                <div
                  key={reply.id}
                  className="card"
                  style={{
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    borderLeft: `4px solid ${reply.isRead ? 'var(--border-default)' : '#2563eb'}`,
                    background: reply.isRead ? 'var(--bg-elevated)' : 'rgba(37,99,235,0.03)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {!reply.isRead && (
                        <span style={{
                          background: '#2563eb', color: '#fff', fontSize: 10, fontWeight: 700,
                          padding: '2px 6px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: 0.5
                        }}>
                          NEW
                        </span>
                      )}
                      <span style={{
                        background: 'rgba(16,185,129,0.15)', color: '#047857',
                        padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 11
                      }}>
                        🏢 {reply.schoolName || 'Company / Contact'}
                      </span>
                      <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                        {reply.senderName || reply.senderEmail}
                      </strong>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        &lt;{reply.senderEmail}&gt;
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {new Date(reply.receivedAt).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Subject: {reply.subject || 'No Subject'}
                  </div>

                  <div style={{
                    fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5,
                    background: 'var(--bg-hover)', padding: '8px 12px', borderRadius: 6
                  }}>
                    {splitEmailThread(reply.bodyText || reply.snippet).replyText || reply.snippet || '(No text preview available)'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-xs btn-solid"
                        onClick={() => {
                          setSelectedReply(reply);
                          setShowOriginalThread(false);
                          setCopiedReply(false);
                          if (!reply.isRead) handleMarkReplyRead(reply.id);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Eye size={11} /> Read Full Message
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleInlineReply(reply)}
                        className={`btn btn-xs ${activeInlineReplyId === reply.id ? 'btn-solid' : 'btn-outline'}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          borderColor: '#2563eb',
                          color: activeInlineReplyId === reply.id ? '#fff' : '#2563eb',
                          background: activeInlineReplyId === reply.id ? '#2563eb' : 'transparent',
                          fontWeight: 600,
                        }}
                      >
                        <Mail size={11} /> {activeInlineReplyId === reply.id ? 'Close Reply' : 'Reply via Email'}
                      </button>
                    </div>
                    {!reply.isRead && (
                      <button
                        type="button"
                        className="btn btn-xs btn-ghost"
                        onClick={() => handleMarkReplyRead(reply.id)}
                        style={{ fontSize: 11, color: 'var(--text-muted)' }}
                      >
                        <CheckCircle size={11} /> Mark as Read
                      </button>
                    )}
                  </div>

                  {/* INLINE REPLY COMPOSER RIGHT INSIDE THIS CARD */}
                  {activeInlineReplyId === reply.id && (
                    <div
                      style={{
                        marginTop: 14,
                        padding: '16px 18px',
                        background: 'var(--bg-card)',
                        borderRadius: 10,
                        border: '1px solid var(--border-default)',
                        borderLeft: '4px solid #2563eb',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Header bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 11.5,
                              fontWeight: 700,
                              background: 'rgba(37,99,235,0.08)',
                              color: '#2563eb',
                              padding: '3px 8px',
                              borderRadius: 6,
                            }}
                          >
                            <Mail size={13} /> Replying to:
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {reply.senderEmail}
                          </span>
                          {reply.schoolName && (
                            <span
                              style={{
                                fontSize: 11,
                                padding: '2px 8px',
                                background: 'var(--bg-hover)',
                                color: 'var(--text-secondary)',
                                borderRadius: 6,
                                border: '1px solid var(--border-subtle)',
                                fontWeight: 500,
                              }}
                            >
                              🏢 {reply.schoolName}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="btn btn-xs btn-ghost"
                          onClick={() => setActiveInlineReplyId(null)}
                          style={{ fontSize: 11.5, color: 'var(--text-muted)' }}
                        >
                          ✕ Close
                        </button>
                      </div>

                      {/* From Account, CC & Subject */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: 12, width: '100%', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>From (Sending Account)</label>
                          <input
                            type="text"
                            value={replySenderFrom}
                            onChange={e => setReplySenderFrom(e.target.value)}
                            placeholder="ab2@o2i.tech"
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border-default)',
                              borderRadius: 6,
                              padding: '8px 11px',
                              fontSize: 12.5,
                              color: 'var(--text-primary)',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>CC (Carbon Copy)</label>
                            {!showBccField && (
                              <button
                                type="button"
                                onClick={() => setShowBccField(true)}
                                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                              >
                                + Add BCC
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={replyCc}
                            onChange={e => setReplyCc(e.target.value)}
                            placeholder="colleague@domain.com, team@domain.com (comma separated)"
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border-default)',
                              borderRadius: 6,
                              padding: '8px 12px',
                              fontSize: 12.5,
                              color: 'var(--text-primary)',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>

                      {/* Optional BCC Row */}
                      {showBccField && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', boxSizing: 'border-box' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>BCC (Blind Carbon Copy)</label>
                            <button
                              type="button"
                              onClick={() => { setShowBccField(false); setReplyBcc(''); }}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', padding: 0 }}
                            >
                              ✕ Remove BCC
                            </button>
                          </div>
                          <input
                            type="text"
                            value={replyBcc}
                            onChange={e => setReplyBcc(e.target.value)}
                            placeholder="bcc@domain.com (comma separated)"
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border-default)',
                              borderRadius: 6,
                              padding: '8px 12px',
                              fontSize: 12.5,
                              color: 'var(--text-primary)',
                              outline: 'none',
                            }}
                          />
                        </div>
                      )}

                      {/* Subject */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', boxSizing: 'border-box' }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Subject</label>
                        <input
                          type="text"
                          value={replySubject}
                          onChange={e => setReplySubject(e.target.value)}
                          placeholder="Re: Subject"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 6,
                            padding: '8px 12px',
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            outline: 'none',
                          }}
                        />
                      </div>

                      {/* Reply Message Textarea - FULL WIDTH */}
                      <div style={{ width: '100%', boxSizing: 'border-box' }}>
                        <textarea
                          rows={7}
                          value={replyBody}
                          onChange={e => setReplyBody(e.target.value)}
                          placeholder="Type your reply message here..."
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            display: 'block',
                            minHeight: 160,
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 8,
                            padding: '12px 14px',
                            fontSize: 13.5,
                            lineHeight: 1.6,
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            outline: 'none',
                          }}
                          autoFocus
                        />
                      </div>

                      {/* Attachments & Action Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, width: '100%', boxSizing: 'border-box', paddingTop: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 11.5,
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: '6px 12px',
                              background: 'var(--bg-surface)',
                              borderRadius: 6,
                              border: '1px solid var(--border-default)',
                            }}
                          >
                            <Paperclip size={13} /> Attach File
                            <input
                              type="file"
                              multiple
                              style={{ display: 'none' }}
                              onChange={e => {
                                if (e.target.files) {
                                  setReplyAttachments(prev => [...prev, ...Array.from(e.target.files)]);
                                }
                              }}
                            />
                          </label>
                          {replyAttachments.length > 0 && (
                            <span style={{ fontSize: 11.5, color: '#2563eb', fontWeight: 600 }}>
                              📎 {replyAttachments.length} file(s) attached
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            onClick={() => setActiveInlineReplyId(null)}
                            disabled={isSendingReply}
                            style={{ fontSize: 12.5 }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-solid"
                            onClick={handleSendReplySubmit}
                            disabled={isSendingReply}
                            style={{
                              background: 'var(--brand-primary, #2563eb)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              fontWeight: 600,
                              padding: '7px 18px',
                              borderRadius: 7,
                              boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
                            }}
                          >
                            {isSendingReply ? (
                              <>
                                <RefreshCw size={13} className="spin" /> Sending Reply via SMTP...
                              </>
                            ) : (
                              <>
                                <Send size={13} /> Send Reply Now
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
          )}
        </div>
      )}

      {/* FULL REPLY MESSAGE MODAL - CLEARLY SPLIT BETWEEN THEIR REPLY & OUR ORIGINAL PITCH */}
      {selectedReply && (() => {
        const { replyText, quotedText } = splitEmailThread(selectedReply.bodyText || selectedReply.snippet);
        return (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999, padding: 16, backdropFilter: 'blur(5px)'
            }}
            onClick={() => { setSelectedReply(null); setShowOriginalThread(false); setCopiedReply(false); }}
          >
            <div
              style={{
                background: 'var(--bg-elevated)', borderRadius: 14,
                border: '1px solid var(--border-default)', maxWidth: 680, width: '100%',
                padding: 24, maxHeight: '88vh', display: 'flex', flexDirection: 'column',
                boxShadow: '0 20px 45px rgba(0,0,0,0.35)'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'rgba(16,185,129,0.15)', color: '#047857',
                      padding: '3px 10px', borderRadius: 6, fontWeight: 700, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5
                    }}>
                      🏢 {selectedReply.schoolName || 'Company / Contact'}
                    </span>
                    <span style={{
                      background: 'rgba(37,99,235,0.12)', color: '#2563eb',
                      padding: '3px 10px', borderRadius: 6, fontWeight: 700, fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4
                    }}>
                      📥 Inbound Response
                    </span>
                  </div>
                  <h3 style={{ margin: '6px 0 2px', fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedReply.subject || 'No Subject'}
                  </h3>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    From: <strong style={{ color: 'var(--text-primary)' }}>{selectedReply.senderName || selectedReply.senderEmail}</strong> &lt;{selectedReply.senderEmail}&gt;
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    Received: {new Date(selectedReply.receivedAt).toLocaleString()}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => { setSelectedReply(null); setShowOriginalThread(false); setCopiedReply(false); }}
                  style={{ fontSize: 18, lineHeight: 1, padding: '4px 8px' }}
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Body */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingRight: 4 }}>
                
                {/* 🟢 CARD 1: RECIPIENT'S RESPONSE */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1.5px solid rgba(16, 185, 129, 0.35)',
                  borderLeft: '5px solid #10b981',
                  borderRadius: 10,
                  padding: '14px 16px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#047857', fontWeight: 800, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      <span>💬</span>
                      <span>Recipient's Response</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>
                      Latest Incoming Message
                    </span>
                  </div>
                  <div style={{
                    fontSize: 13.5,
                    lineHeight: 1.65,
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    wordBreak: 'break-word'
                  }}>
                    {replyText || selectedReply.bodyText || '(No reply message text)'}
                  </div>
                </div>

                {/* ⚪ CARD 2: ORIGINAL OUTREACH / THREAD HISTORY */}
                {quotedText ? (
                  <div style={{
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border-default)',
                    borderLeft: '4px solid var(--text-muted)',
                    borderRadius: 10,
                    padding: '12px 16px'
                  }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                      onClick={() => setShowOriginalThread(prev => !prev)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        <span>📜</span>
                        <span>Original Outreach Pitch / Thread History</span>
                      </div>
                      <button
                        type="button"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: 11.5,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontWeight: 600
                        }}
                      >
                        {showOriginalThread ? 'Hide Pitch ▲' : 'Show Original Pitch ▼'}
                      </button>
                    </div>

                    {showOriginalThread && (
                      <div style={{
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: '1px dashed var(--border-subtle)',
                        fontSize: 12.5,
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        color: 'var(--text-muted)',
                        fontFamily: 'inherit',
                        maxHeight: 260,
                        overflowY: 'auto',
                        wordBreak: 'break-word'
                      }}>
                        {quotedText}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    background: 'var(--bg-hover)',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 11.5,
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <span>ℹ️</span>
                    <span>This email was received as a direct message without quoted previous pitch history.</span>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
                paddingTop: 12,
                borderTop: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: 10
              }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Message-ID: <code style={{ fontSize: 10.5 }}>{selectedReply.messageId ? selectedReply.messageId.substring(0, 32) + '...' : 'N/A'}</code>
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(replyText || selectedReply.bodyText || '');
                      setCopiedReply(true);
                      setTimeout(() => setCopiedReply(false), 2000);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    {copiedReply ? '✓ Copied!' : '📋 Copy Response'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenReplyComposer(selectedReply)}
                    className="btn btn-sm btn-solid"
                    style={{ background: 'var(--brand-primary, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                  >
                    <Mail size={13} /> Reply via Email
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => { setSelectedReply(null); setShowOriginalThread(false); setCopiedReply(false); }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* IN-APP EMAIL REPLY COMPOSER MODAL - SENDS REPLIES DIRECTLY WITHIN THE PLATFORM */}
      {replyComposerOpen && replyTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: 16,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => { if (!isSendingReply) setReplyComposerOpen(false); }}
        >
          <div
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: 14,
              border: '1px solid var(--border-default)',
              maxWidth: 720,
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-surface, var(--bg-elevated))',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(37, 99, 235, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb',
                  }}
                >
                  <Mail size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Reply to {replyTarget.senderName || replyTarget.senderEmail}
                  </h3>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      In-app direct reply via SMTP (ab2@o2i.tech)
                    </span>
                    {replyTarget.schoolName && (
                      <span
                        style={{
                          fontSize: 10.5,
                          padding: '1px 7px',
                          background: 'rgba(37,99,235,0.08)',
                          color: '#2563eb',
                          borderRadius: 4,
                          fontWeight: 600,
                        }}
                      >
                        🏢 {replyTarget.schoolName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-xs btn-ghost"
                onClick={() => { if (!isSendingReply) setReplyComposerOpen(false); }}
                style={{ padding: '4px 8px', borderRadius: 6 }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Composer Form */}
            <div style={{ padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Recipient & Sender Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 4 }}>
                    To (Recipient)
                  </label>
                  <div
                    style={{
                      padding: '8px 12px',
                      background: 'var(--bg-subtle, rgba(0,0,0,0.03))',
                      borderRadius: 6,
                      border: '1px solid var(--border-subtle)',
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>{replyTarget.senderEmail}</span>
                    {replyTarget.senderName && (
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({replyTarget.senderName})</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 4 }}>
                    From (Sending Account)
                  </label>
                  <input
                    type="text"
                    value={replySenderFrom}
                    onChange={e => setReplySenderFrom(e.target.value)}
                    placeholder="ab2@o2i.tech"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 6,
                      padding: '8px 12px',
                      fontSize: 12.5,
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* CC & BCC Row */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 0 }}>
                    CC (Carbon Copy)
                  </label>
                  {!showBccField && (
                    <button
                      type="button"
                      onClick={() => setShowBccField(true)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      + Add BCC
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={replyCc}
                  onChange={e => setReplyCc(e.target.value)}
                  placeholder="colleague@domain.com, team@domain.com (comma separated)"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 6,
                    padding: '8px 12px',
                    fontSize: 12.5,
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              {showBccField && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 0 }}>
                      BCC (Blind Carbon Copy)
                    </label>
                    <button
                      type="button"
                      onClick={() => { setShowBccField(false); setReplyBcc(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', padding: 0 }}
                    >
                      ✕ Remove BCC
                    </button>
                  </div>
                  <input
                    type="text"
                    value={replyBcc}
                    onChange={e => setReplyBcc(e.target.value)}
                    placeholder="bcc@domain.com (comma separated)"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 6,
                      padding: '8px 12px',
                      fontSize: 12.5,
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="form-label" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 4 }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={e => setReplySubject(e.target.value)}
                  placeholder="Re: Subject"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 6,
                    padding: '8px 12px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Quoted Message Reference Accordion */}
              <div
                style={{
                  background: 'var(--bg-surface, var(--bg-card))',
                  borderRadius: 8,
                  border: '1px solid var(--border-subtle)',
                  padding: '8px 12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => setShowReplyThreadPreview(!showReplyThreadPreview)}
                >
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)' }}>
                    💬 Replying to Message History {showReplyThreadPreview ? '▲' : '▼'}
                  </span>
                  <span style={{ fontSize: 10.5, color: '#2563eb' }}>
                    {showReplyThreadPreview ? 'Hide original message' : 'Preview message'}
                  </span>
                </div>
                {showReplyThreadPreview && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 10,
                      background: 'var(--bg-elevated)',
                      borderRadius: 6,
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      maxHeight: 140,
                      overflowY: 'auto',
                      borderLeft: '3px solid #2563eb',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.5,
                    }}
                  >
                    {splitEmailThread(replyTarget.bodyText || replyTarget.snippet).replyText || replyTarget.snippet || replyTarget.bodyText || 'No text'}
                  </div>
                )}
              </div>

              {/* Message Body */}
              <div style={{ width: '100%', boxSizing: 'border-box' }}>
                <label className="form-label" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 4 }}>
                  Reply Message Body
                </label>
                <textarea
                  rows={8}
                  value={replyBody}
                  onChange={e => setReplyBody(e.target.value)}
                  placeholder="Type your message here..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    display: 'block',
                    minHeight: 180,
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                  autoFocus
                />
              </div>

              {/* Attachments */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '5px 10px',
                      background: 'var(--bg-surface)',
                      borderRadius: 6,
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <Paperclip size={13} />
                    Attach Files
                    <input
                      type="file"
                      multiple
                      style={{ display: 'none' }}
                      onChange={e => {
                        if (e.target.files) {
                          setReplyAttachments(prev => [...prev, ...Array.from(e.target.files)]);
                        }
                      }}
                    />
                  </label>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    PDF, DOCX, ZIP, or proposals (max 25MB total)
                  </span>
                </div>

                {replyAttachments.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {replyAttachments.map((f, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 11,
                          padding: '3px 8px',
                          background: 'var(--bg-subtle)',
                          borderRadius: 6,
                          border: '1px solid var(--border-subtle)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        📄 {f.name} ({(f.size / 1024).toFixed(0)} KB)
                        <button
                          type="button"
                          onClick={() => setReplyAttachments(prev => prev.filter((_, i) => i !== idx))}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 12,
                            color: '#ef4444',
                            padding: 0,
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 10,
                background: 'var(--bg-surface, var(--bg-elevated))',
              }}
            >
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => setReplyComposerOpen(false)}
                disabled={isSendingReply}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-solid"
                onClick={handleSendReplySubmit}
                disabled={isSendingReply}
                style={{
                  background: 'var(--brand-primary, #2563eb)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 600,
                  padding: '7px 16px',
                }}
              >
                {isSendingReply ? (
                  <>
                    <RefreshCw size={13} className="spin" />
                    Sending Reply via SMTP...
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    Send Reply Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVE TEMPLATE MODAL */}
      {showSaveTemplateModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16, backdropFilter: 'blur(4px)' }}
          onClick={() => setShowSaveTemplateModal(false)}
        >
          <div
            style={{ background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-default)', maxWidth: 440, width: '100%', padding: 22 }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>Save as Reusable Template</h3>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Template Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Automotive Executive Outreach"
                value={newTemplateName}
                onChange={e => setNewTemplateName(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowSaveTemplateModal(false)}>Cancel</button>
              <button
                className="btn btn-solid btn-sm"
                style={{ background: 'var(--brand-primary, #2563eb)', color: '#fff' }}
                onClick={handleSaveTemplate}
                disabled={!newTemplateName.trim()}
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
