import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setProjectionScenario, adjustScenarioGrowth } from '../../store/financeSlice';
import { FinanceNav } from './FinanceNav';
import {
  LineChart, TrendingUp, DollarSign, Activity, Users, Cpu,
  Sparkles, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight,
  Sliders, ShieldCheck, Play, Download, Check
} from 'lucide-react';

export const FinancialPlanningPage = () => {
  const dispatch = useDispatch();
  const projections = useSelector((s) => s.finance.projections || {});
  const activeScenarioKey = projections.activeScenario || 'BASE_CASE';
  const currentScenario = projections.scenarios ? projections.scenarios[activeScenarioKey] : null;

  const [simulatedGrowth, setSimulatedGrowth] = useState(currentScenario?.growthRatePercent || 42);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleScenarioChange = (scenarioKey) => {
    dispatch(setProjectionScenario(scenarioKey));
    setSimulatedGrowth(projections.scenarios[scenarioKey]?.growthRatePercent || 42);
    showNotification(`Switched active financial forecast to ${projections.scenarios[scenarioKey]?.name}`);
  };

  const handleApplyGrowth = () => {
    dispatch(adjustScenarioGrowth({ scenarioKey: activeScenarioKey, newGrowthRate: simulatedGrowth }));
    showNotification(`Updated ${activeScenarioKey} annual growth trajectory to ${simulatedGrowth}% YoY.`);
  };

  return (
    <div className="finance-planning-page" style={{ paddingBottom: 48, maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ─── TOAST NOTIFICATION ─── */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1100,
            background: 'var(--bg-elevated)',
            border: '1px solid #22c55e',
            borderRadius: 8,
            padding: '12px 18px',
            color: 'var(--text-primary)',
            fontSize: 13,
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Sparkles size={16} color="#22c55e" />
          <span>{notification}</span>
        </div>
      )}

      {/* ─── FINANCE SUITE SUB-NAV ─── */}
      <FinanceNav />

      {/* ─── PAGE HEADER ─── */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
          paddingBottom: 20,
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div
            className="page-tag"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(34, 197, 94, 0.1)',
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: '0.03em',
              marginBottom: 8,
            }}
          >
            <LineChart size={13} /> Finance · Multi-Horizon Financial Modeling & Sensitivity Analysis [FIN-PLAN]
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', margin: '4px 0 6px 0', color: 'var(--text-primary)' }}>
            Financial Projections & Strategic Planning
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 740, lineHeight: 1.5, margin: 0 }}>
            Dynamic multi-scenario forecasting (Base, Bull, Bear), capital runway modeling, gross margin sensitivity, and break-even path towards $250M ARR.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => showNotification('Exporting financial projection sensitivity model to XLSX format...')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600 }}
        >
          <Download size={14} /> Export Forecast Model
        </button>
      </div>

      {/* ─── SCENARIO SELECTOR CARDS (BASE / BULL / BEAR) ─── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
          Select Active Strategic Planning Scenario:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {/* Base Case */}
          <div
            className="card"
            onClick={() => handleScenarioChange('BASE_CASE')}
            style={{
              padding: '18px 20px',
              borderRadius: 12,
              cursor: 'pointer',
              background: activeScenarioKey === 'BASE_CASE' ? 'rgba(34, 197, 94, 0.12)' : 'var(--bg-surface)',
              border: activeScenarioKey === 'BASE_CASE' ? '2px solid #22c55e' : '1px solid var(--border-default)',
              boxShadow: activeScenarioKey === 'BASE_CASE' ? '0 4px 20px rgba(34, 197, 94, 0.2)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
                BASE CASE
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                +42% YoY ARR
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Sustained European Expansion
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Steady enterprise penetration across DACH, Nordic, and UK corridor clients.
            </div>
          </div>

          {/* Bull Case */}
          <div
            className="card"
            onClick={() => handleScenarioChange('BULL_CASE')}
            style={{
              padding: '18px 20px',
              borderRadius: 12,
              cursor: 'pointer',
              background: activeScenarioKey === 'BULL_CASE' ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-surface)',
              border: activeScenarioKey === 'BULL_CASE' ? '2px solid #f59e0b' : '1px solid var(--border-default)',
              boxShadow: activeScenarioKey === 'BULL_CASE' ? '0 4px 20px rgba(245, 158, 11, 0.2)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
                BULL CASE
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>
                +68% YoY ARR
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Global Autonomy & Transatlantic Scale
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Accelerated sovereign defense and North American node enterprise adoption.
            </div>
          </div>

          {/* Bear Case */}
          <div
            className="card"
            onClick={() => handleScenarioChange('BEAR_CASE')}
            style={{
              padding: '18px 20px',
              borderRadius: 12,
              cursor: 'pointer',
              background: activeScenarioKey === 'BEAR_CASE' ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-surface)',
              border: activeScenarioKey === 'BEAR_CASE' ? '2px solid #06b6d4' : '1px solid var(--border-default)',
              boxShadow: activeScenarioKey === 'BEAR_CASE' ? '0 4px 20px rgba(6, 182, 212, 0.2)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4' }}>
                BEAR CASE
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4', fontFamily: 'JetBrains Mono, monospace' }}>
                +24% YoY ARR
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Macroeconomic Contraction
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Conservative modeling with extended enterprise sales cycles and disciplined hiring.
            </div>
          </div>
        </div>
      </div>

      {/* ─── MULTI-YEAR PROJECTIONS TABLE ─── */}
      <div className="card" style={{ padding: 22, borderRadius: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Multi-Year Pro-Forma Statement
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '2px 0 0 0' }}>
              Financial Trajectory (2026 – 2029 Horizons)
            </h3>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Break-Even Milestone:</span>
            <strong style={{ color: 'var(--success)' }}>{currentScenario?.breakEvenQuarter}</strong>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>Horizon Year</th>
                <th style={{ padding: '10px 12px' }}>Target ARR</th>
                <th style={{ padding: '10px 12px' }}>Recognized Revenue</th>
                <th style={{ padding: '10px 12px' }}>Compute & Hosting COGS</th>
                <th style={{ padding: '10px 12px' }}>Total OPEX</th>
                <th style={{ padding: '10px 12px' }}>EBITDA Operating Profit</th>
                <th style={{ padding: '10px 12px' }}>Net Free Cash Flow</th>
                <th style={{ padding: '10px 12px' }}>Headcount</th>
              </tr>
            </thead>
            <tbody>
              {currentScenario?.dataPoints.map((row) => (
                <tr key={row.year} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}>
                  <td style={{ padding: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>{row.year}</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>{row.arr}</td>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{row.revenue}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>{row.cogs}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>{row.opex}</td>
                  <td style={{ padding: '12px', color: 'var(--success)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{row.ebitda}</td>
                  <td style={{ padding: '12px', color: '#22d3ee', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{row.cashFlow}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{row.headcount} Staff</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── DYNAMIC SENSITIVITY LEVERS ─── */}
      <div className="card" style={{ padding: 22, borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 6, borderRadius: 6, background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
              <Sliders size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: 16.5, fontWeight: 700, margin: 0 }}>Interactive Growth & Sensitivity Simulation</h3>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Adjust growth rate lever to stress-test runway and margin expansion</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', padding: '16px 20px', borderRadius: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Simulated Annual Revenue Growth Rate (% YoY):
            </span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#22c55e', fontFamily: 'JetBrains Mono, monospace' }}>
              +{simulatedGrowth}%
            </span>
          </div>

          <input
            type="range"
            min="15"
            max="80"
            step="1"
            value={simulatedGrowth}
            onChange={(e) => setSimulatedGrowth(parseInt(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#22c55e' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            <span>Conservative (+15%)</span>
            <span>Target Baseline (+42%)</span>
            <span>Hyper-Scale (+80%)</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            className="btn btn-primary"
            onClick={handleApplyGrowth}
            style={{ background: '#22c55e', color: '#000', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Check size={14} /> Apply Simulation Levers
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialPlanningPage;
