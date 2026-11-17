import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HrNav } from './HrNav';
import { triggerAiCall, advanceCandidateToOffer } from '../../store/hrSlice';
import { setActiveRoute } from '../../store/navigationSlice';
import {
  PhoneCall, Mic, Bot, CheckCircle2, Clock, Play, Pause,
  Sparkles, Award, ArrowRight, UserCheck, X, Volume2, ShieldCheck
} from 'lucide-react';

export const AiInterviewingPage = () => {
  const dispatch = useDispatch();
  const interviews = useSelector((s) => s.hr.interviews);

  const [selectedCall, setSelectedCall] = useState(interviews[0] || null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [callForm, setCallForm] = useState({
    candidateName: '',
    role: '',
    phone: '',
  });

  const handleTriggerCall = (e) => {
    e.preventDefault();
    if (!callForm.candidateName || !callForm.role) return;

    dispatch(
      triggerAiCall({
        candidateName: callForm.candidateName,
        role: callForm.role,
        phone: callForm.phone || '+46 70 •••••88',
      })
    );
    setShowTriggerModal(false);
    setCallForm({ candidateName: '', role: '', phone: '' });
  };

  const handleAdvance = (callId) => {
    dispatch(advanceCandidateToOffer(callId));
    dispatch(setActiveRoute('hr.offers'));
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      <HrNav />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <PhoneCall size={20} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              AI On-Call Interviewing & Autonomous Voice Recruiter
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--text-muted)' }}>
            Real-time neural telephony screening: live architectural questioning, timestamped transcription, and multi-dimensional cognitive scoring.
          </p>
        </div>

        <button
          onClick={() => setShowTriggerModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 8,
            background: '#10b981',
            color: '#052e16',
            fontWeight: 700,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
          }}
        >
          <Mic size={16} />
          <span>Trigger AI On-Call Interview</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Autonomous Voice Agent</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>IRUS-Voice v4.1</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Sub-140ms Neural Audio Latency</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Average Cognitive Score</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>94.1 / 100</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Top 0.8% Global Frontier AI Talent</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Interview Completion Rate</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>100%</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Zero call drops or timeout aborts</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Average Turnaround to Offer</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#a78bfa', marginTop: 4 }}>4.8 Hours</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Compared to 18-day legacy process</div>
        </div>
      </div>

      {/* Main Grid: Calls List on left, Detailed Inspector on right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 20 }}>
        {/* Calls Column */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bot size={16} color="#10b981" />
            <span>Autonomous Candidate Call Sessions</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {interviews.map((call) => {
              const isSelected = selectedCall && selectedCall.id === call.id;
              const isCompleted = call.status === 'COMPLETED';
              const isInCall = call.status === 'IN_CALL';

              return (
                <div
                  key={call.id}
                  onClick={() => setSelectedCall(call)}
                  style={{
                    background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-elevated)',
                    border: `1px solid ${isSelected ? '#10b981' : 'var(--border-default)'}`,
                    borderRadius: 10,
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-primary)' }}>
                        {call.candidateName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {call.role}
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        background: isCompleted
                          ? 'rgba(16, 185, 129, 0.12)'
                          : isInCall
                          ? 'rgba(56, 189, 248, 0.15)'
                          : 'rgba(245, 158, 11, 0.12)',
                        color: isCompleted ? '#10b981' : isInCall ? '#38bdf8' : '#f59e0b',
                        border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.3)' : isInCall ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      }}
                    >
                      {call.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: 10, marginTop: 8 }}>
                    <span>{call.callDate} · {call.duration}</span>
                    {call.overallScore ? (
                      <span style={{ fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Award size={13} />
                        Score: {call.overallScore}%
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Slot Reserved</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call Detail Inspector */}
        {selectedCall && (
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-default)', paddingBottom: 16, marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                    Session Analysis: {selectedCall.id}
                  </span>
                </div>
                <h2 style={{ fontSize: 19, fontWeight: 700, margin: '4px 0 0', color: 'var(--text-primary)' }}>
                  {selectedCall.candidateName}
                </h2>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                  {selectedCall.role} · Direct Telephony: {selectedCall.phone}
                </div>
              </div>

              {selectedCall.overallScore && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#10b981' }}>
                    {selectedCall.overallScore}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>COGNITIVE AGGREGATE</div>
                </div>
              )}
            </div>

            {/* Cognitive Evaluation Radar Scores */}
            {selectedCall.scores && selectedCall.scores.technicalMastery > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10 }}>
                  Cognitive Competence Breakdown (5-Point Evaluator)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Technical Systems Mastery', score: selectedCall.scores.technicalMastery },
                    { label: 'Distributed Systems Architecture', score: selectedCall.scores.systemArchitecture },
                    { label: 'Real-Time Problem Solving', score: selectedCall.scores.problemSolving },
                    { label: 'Communication & Conciseness', score: selectedCall.scores.clarityCommunication },
                    { label: 'AI Safety & Cultural Alignment', score: selectedCall.scores.cultureSafetyAlignment },
                  ].map((dim) => (
                    <div key={dim.label} style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                        <span>{dim.label}</span>
                        <span style={{ fontWeight: 700, color: '#10b981' }}>{dim.score}%</span>
                      </div>
                      <div style={{ width: '100%', height: 5, borderRadius: 3, background: 'var(--bg-elevated)', marginTop: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${dim.score}%`, height: '100%', background: '#10b981' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Synthesized Verdict */}
            <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 700, fontSize: 12.5, marginBottom: 4 }}>
                <Sparkles size={14} />
                <span>Autonomous Recruiter Assessment:</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {selectedCall.aiSummary}
              </p>
              <div style={{ marginTop: 8, fontSize: 11.5, color: '#10b981', fontWeight: 700 }}>
                Recommendation: {selectedCall.recommendation}
              </div>
            </div>

            {/* Audio Wave Player & Transcript */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Live Voice Transcript & Audio Playback
                </div>

                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: isPlayingAudio ? '#10b981' : 'var(--bg-surface)',
                    color: isPlayingAudio ? '#052e16' : 'var(--text-primary)',
                    fontSize: 11.5,
                    fontWeight: 600,
                    border: '1px solid var(--border-default)',
                    cursor: 'pointer',
                  }}
                >
                  {isPlayingAudio ? <Pause size={12} /> : <Play size={12} />}
                  <span>{isPlayingAudio ? 'Pause Playback' : 'Listen Recording'}</span>
                </button>
              </div>

              {/* Audio Waveform Mock */}
              {isPlayingAudio && (
                <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 8, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Volume2 size={16} color="#10b981" />
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3, height: 24 }}>
                    {[12, 18, 22, 14, 8, 24, 20, 16, 12, 22, 26, 18, 14, 9, 20, 24, 16, 11, 20, 25, 14].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}px`, background: '#10b981', borderRadius: 2 }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>01:42 / 18:42</span>
                </div>
              )}

              {/* Timestamped Transcript */}
              <div style={{ maxHeight: 240, overflowY: 'auto', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '12px 14px' }}>
                {selectedCall.transcript && selectedCall.transcript.length > 0 ? (
                  selectedCall.transcript.map((line, idx) => {
                    const isAi = line.speaker.includes('AI') || line.speaker.includes('IRUS');
                    return (
                      <div key={idx} style={{ marginBottom: 12, fontSize: 12.5, lineHeight: 1.5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, color: isAi ? '#10b981' : '#38bdf8' }}>
                            {line.speaker}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{line.time}</span>
                        </div>
                        <div style={{ color: 'var(--text-primary)', paddingLeft: 8, borderLeft: `2px solid ${isAi ? '#10b981' : '#38bdf8'}` }}>
                          {line.text}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 12.5 }}>
                    Session pending. Outbound call scheduled at designated time slot.
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => handleAdvance(selectedCall.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  borderRadius: 8,
                  background: '#10b981',
                  color: '#052e16',
                  fontWeight: 700,
                  fontSize: 12.5,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                }}
              >
                <span>Advance to Offer Letter Generation</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trigger Call Modal */}
      {showTriggerModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 12,
              width: '100%',
              maxWidth: 480,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PhoneCall size={18} color="#10b981" />
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Trigger Autonomous AI Phone Interview
                </h2>
              </div>
              <button
                onClick={() => setShowTriggerModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTriggerCall}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Candidate Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jennifer Vance"
                  value={callForm.candidateName}
                  onChange={(e) => setCallForm({ ...callForm, candidateName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Target Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staff Research Scientist - Formal Verification"
                  value={callForm.role}
                  onChange={(e) => setCallForm({ ...callForm, role: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Candidate Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +46 70 819 2831"
                  value={callForm.phone}
                  onChange={(e) => setCallForm({ ...callForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowTriggerModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontSize: 12.5 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: 6, background: '#10b981', color: '#052e16', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 12.5 }}
                >
                  Initiate Outbound Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiInterviewingPage;
