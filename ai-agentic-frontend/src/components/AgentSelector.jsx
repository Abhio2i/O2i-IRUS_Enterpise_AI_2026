import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveAgent, setRoadmapModalAgent } from '../store/navigationSlice';
import {
  Cog,
  Megaphone,
  Compass,
  Users,
  Coins,
  CheckCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export const AgentSelector = () => {
  const dispatch = useDispatch();
  const activeAgent = useSelector((state) => state.navigation.activeAgent);

  const agents = [
    {
      id: 'operations',
      name: 'Operations Agent',
      pillar: 'Pillar 1: Operational Excellence',
      icon: Cog,
      status: 'ACTIVE_PILOT',
      statusText: 'In Scope (Month 1-4)',
      built: true,
    },
    {
      id: 'marketing',
      name: 'Marketing Agent',
      pillar: 'Pillar 3: Marketing Excellence',
      icon: Megaphone,
      status: 'ACTIVE_PILOT',
      statusText: 'In Scope (Sec 3.3)',
      built: true,
    },
    {
      id: 'strategy',
      name: 'Strategy Agent',
      pillar: 'Pillar 4: Strategic Excellence',
      icon: Compass,
      status: 'ROADMAP',
      statusText: 'Deferred (Phase 2)',
      built: false,
    },
    {
      id: 'hr',
      name: 'HR & Team Value Agent',
      pillar: 'Pillar 2: Team Value Addition',
      icon: Users,
      status: 'ROADMAP',
      statusText: 'Deferred (Sec 3.2)',
      built: false,
    },
    {
      id: 'finance',
      name: 'Finance Agent',
      pillar: 'Pillar 5: Enterprise Settlement',
      icon: Coins,
      status: 'ROADMAP',
      statusText: 'Deferred (Phase 2)',
      built: false,
    },
  ];

  const handleSelect = (agent) => {
    if (agent.built) {
      dispatch(setActiveAgent(agent.id));
    } else {
      dispatch(setRoadmapModalAgent(agent.id));
    }
  };

  return (
    <nav className="agent-nav-bar">
      <div className="agent-tabs-list">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isActive = activeAgent === agent.id;

          return (
            <button
              key={agent.id}
              className={`agent-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleSelect(agent)}
              title={`${agent.name} — ${agent.pillar}`}
            >
              <Icon size={16} />
              <span>{agent.name.replace(' Agent', '')}</span>
              <span className="badge-scope">
                {agent.built ? 'ACTIVE' : 'ROADMAP'}
              </span>
              {!agent.built && <ArrowUpRight size={12} style={{ opacity: 0.6 }} />}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span className="mono">DEPLOYED: 2 AGENTS ONLINE</span>
      </div>
    </nav>
  );
};
