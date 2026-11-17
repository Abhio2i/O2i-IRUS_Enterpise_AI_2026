import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { approveCampaign, rejectCampaign, createCampaign } from '../../store/marketingSlice';
import { addAuditLog } from '../../store/governanceSlice';
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Send,
  ShieldCheck,
  Megaphone,
  AlertTriangle,
  FileText,
  Sliders,
  ArrowRight,
} from 'lucide-react';

export const GenerativeStudioTab = () => {
  const dispatch = useDispatch();
  const campaigns = useSelector((state) => state.marketing.campaigns);
  const brandGuidelines = useSelector((state) => state.marketing.brandGuidelines);

  const [isGenerating, setIsGenerating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    channel: 'LinkedIn Sponsored & InMail',
    targetSegment: 'Tier-1 Nordic Enterprise CIOs',
    objective: 'Drive BIP Demo Signups for Intelligent Document Automation',
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title) return;

    setIsGenerating(true);

    setTimeout(() => {
      const newCampaign = {
        id: `MKT-CAMP-${Math.floor(104 + Math.random() * 50)}`,
        title: form.title,
        channel: form.channel,
        targetSegment: form.targetSegment,
        objective: form.objective,
        contentPreview: `Subject: Eliminating operational variance with autonomous document intelligence\n\nModern enterprise supply chains can no longer tolerate 48-minute invoice settlement latencies. The Bjorn Intelligence Platform unifies document extraction, Drools validation, and human-in-the-loop governance into a deterministic zero-hallucination workflow.\n\nDiscover how Scandinavian leaders achieve 90% cycle time reduction.`,
        status: 'PENDING_APPROVAL',
        brandCompliance: {
          score: 95,
          status: 'PASSED',
          voiceCheck: 'Executive, Analytical, High-Precision',
          bannedWordsDetected: 0,
          disclaimerPresent: true,
          notes: 'Auto-verified against 2026 Bjorn Brand Rulebook.',
        },
        metrics: { predictedCTR: '5.2%', targetReach: '18,000 Decision Makers' },
        createdAt: 'Just now',
      };

      dispatch(createCampaign(newCampaign));
      dispatch(
        addAuditLog({
          id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          actor: 'agent.marketing-studio',
          action: 'CAMPAIGN_CONTENT_GENERATED',
          endpoint: '/api/v1/marketing/campaigns/generate',
          riskTier: 'MEDIUM',
          model: 'Spring AI / GPT-4o',
          tokens: 2840,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          details: `Generated campaign "${newCampaign.title}". Brand compliance score: 95/100. Routed for human approval.`,
        })
      );

      setIsGenerating(false);
      setForm({
        title: '',
        channel: 'LinkedIn Sponsored & InMail',
        targetSegment: 'Tier-1 Nordic Enterprise CIOs',
        objective: 'Drive BIP Demo Signups for Intelligent Document Automation',
      });
    }, 850);
  };

  const handleApprove = (campaignId, title) => {
    dispatch(approveCampaign(campaignId));
    dispatch(
      addAuditLog({
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        actor: 'user:sofia.lindqvist@bjorn.com',
        action: 'MARKETING_HUMAN_APPROVAL',
        endpoint: `/api/v1/marketing/campaigns/${campaignId}/approve`,
        riskTier: 'MEDIUM',
        model: 'Human-in-the-Loop',
        tokens: 0,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        details: `Human approved campaign "${title}" for scheduled deployment.`,
      })
    );
  };

  const handleRevision = (campaignId) => {
    dispatch(rejectCampaign(campaignId));
  };

  return (
    <div>
      <div className="grid-2" style={{ gridTemplateColumns: '420px 1fr' }}>
        {/* Generator Form & Brand Rulebook */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Generator Form */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Sparkles size={16} />
                <span>Generative Content Studio</span>
              </div>
              <span className="pill-badge mono">SPRING AI GENERATOR</span>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Campaign Title
                </label>
                <input
                  className="input-control"
                  placeholder="e.g. Q4 Executive Supply Chain Briefing"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Distribution Channel
                </label>
                <select
                  className="input-control"
                  value={form.channel}
                  onChange={(e) => setForm({ ...form, channel: e.target.value })}
                >
                  <option>LinkedIn Sponsored & InMail</option>
                  <option>Direct Executive Email (ABM)</option>
                  <option>Press Memo & Whitepaper Synopsis</option>
                  <option>Global Summit Keynote Teaser</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Audience Segment
                </label>
                <input
                  className="input-control"
                  value={form.targetSegment}
                  onChange={(e) => setForm({ ...form, targetSegment: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Primary Objective
                </label>
                <input
                  className="input-control"
                  value={form.objective}
                  onChange={(e) => setForm({ ...form, objective: e.target.value })}
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={isGenerating || !form.title}>
                <Sparkles size={14} />
                <span>{isGenerating ? 'Synthesizing with Spring AI...' : 'Draft Campaign Asset'}</span>
              </button>
            </form>
          </div>

          {/* Brand Rulebook Compliance Card (Section 6.8) */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <ShieldCheck size={16} />
                <span>Brand Rulebook Validator</span>
              </div>
              <span className="pill-badge mono">ENFORCED</span>
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Tone Rule:</strong> {brandGuidelines.tone}
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Prohibited Terms:</strong>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {brandGuidelines.prohibitedKeywords.map((w, i) => (
                    <span key={i} className="pill-badge high" style={{ fontSize: '10px' }}>
                      {w}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Mandatory Disclaimer:</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                  "{brandGuidelines.mandatoryDisclaimer}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Assets List with Approval Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-header" style={{ margin: 0, paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
              Synthesized Campaigns & Human Approval Gate (Section 6.8)
            </h3>
            <span className="pill-badge mono">{campaigns.length} ASSETS</span>
          </div>

          {campaigns.map((camp) => (
            <div key={camp.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mono" style={{ fontSize: '11px', fontWeight: 700 }}>
                      {camp.id}
                    </span>
                    <span className="pill-badge" style={{ fontSize: '10.5px' }}>
                      {camp.channel}
                    </span>
                    {camp.status === 'APPROVED' ? (
                      <span className="pill-badge low" style={{ fontSize: '10px' }}>
                        Approved & Scheduled
                      </span>
                    ) : camp.status === 'REVISION_REQUESTED' ? (
                      <span className="pill-badge high" style={{ fontSize: '10px' }}>
                        Revision Requested
                      </span>
                    ) : (
                      <span className="pill-badge medium" style={{ fontSize: '10px' }}>
                        Awaiting Human Approval
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginTop: '4px' }}>{camp.title}</h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Target: <strong>{camp.targetSegment}</strong> · Objective: {camp.objective}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Compliance Score
                  </div>
                  <div className="mono" style={{ fontSize: '18px', fontWeight: 700 }}>
                    {camp.brandCompliance.score}/100
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div
                style={{
                  padding: '14px',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  marginBottom: '14px',
                  color: 'var(--text-primary)',
                }}
              >
                {camp.contentPreview}
              </div>

              {/* Brand Check Feedback & Approval Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Brand Audit: <strong style={{ color: 'var(--text-secondary)' }}>{camp.brandCompliance.notes}</strong>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {camp.status !== 'APPROVED' ? (
                    <>
                      <button
                        className="btn btn-outline btn-sm btn-danger"
                        onClick={() => handleRevision(camp.id)}
                      >
                        <XCircle size={13} />
                        <span>Request Revision</span>
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleApprove(camp.id, camp.title)}
                      >
                        <CheckCircle size={13} />
                        <span>Approve Campaign</span>
                      </button>
                    </>
                  ) : (
                    <span className="pill-badge mono low" style={{ fontSize: '11px' }}>
                      DEPLOYMENT READY (READY FOR SYNC)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
