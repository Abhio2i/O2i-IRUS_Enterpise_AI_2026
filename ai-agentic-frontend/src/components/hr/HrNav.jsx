import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveRoute } from '../../store/navigationSlice';
import {
  Users, UserCheck, PhoneCall, FileSignature, BookOpen, CreditCard, Award, FolderLock
} from 'lucide-react';

export const HrNav = () => {
  const dispatch = useDispatch();
  const activeRoute = useSelector((s) => s.navigation.activeRoute);

  const TABS = [
    { id: 'hr.identification', label: 'Person Identification', icon: UserCheck, badge: 'KYC & Bio' },
    { id: 'hr.interviews', label: 'AI On-Call Interviewing', icon: PhoneCall, badge: 'Recruiter' },
    { id: 'hr.offers', label: 'Offer Letters', icon: FileSignature, badge: 'ESOPs' },
    { id: 'hr.policies', label: 'Policies', icon: BookOpen, badge: 'Governance' },
    { id: 'hr.payroll', label: 'Salary Disbursement', icon: CreditCard, badge: 'Pay Slip' },
    { id: 'hr.experience', label: 'Experience Letters', icon: Award, badge: 'Credentials' },
    { id: 'hr.documentation', label: 'Documentation', icon: FolderLock, badge: 'Vault' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--bg-elevated)',
        padding: '6px 10px',
        borderRadius: 10,
        border: '1px solid var(--border-default)',
        marginBottom: 24,
        overflowX: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px 6px 4px',
          color: '#10b981',
          fontSize: 12.5,
          fontWeight: 700,
          borderRight: '1px solid var(--border-subtle)',
          marginRight: 4,
          flexShrink: 0,
        }}
      >
        <Users size={15} />
        <span>HR & People Suite:</span>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeRoute === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => dispatch(setActiveRoute(tab.id))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 14px',
                borderRadius: 7,
                fontSize: 12.5,
                fontWeight: isActive ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? '#10b981' : 'transparent',
                color: isActive ? '#052e16' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: 10,
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: isActive ? 'rgba(5, 46, 22, 0.25)' : 'var(--bg-surface)',
                  color: isActive ? '#052e16' : 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HrNav;
