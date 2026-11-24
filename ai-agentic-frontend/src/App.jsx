import { SentryConsolePage } from './components/security/SentryConsolePage';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { GovernanceDrawer } from './components/GovernanceDrawer';
import { AgentRoadmapModal } from './components/common/AgentRoadmapModal';
import { AuthModal } from './components/common/AuthModal';
import { SessionExpiredModal } from './components/common/SessionExpiredModal';
import { LoginPage } from './components/auth/LoginPage';
import { triggerSessionExpired } from './store/authSlice';
import { getAccessToken, isTokenExpired, refreshAuth } from './services/apiClient';

// Operations Pages
import { ProjectsPage } from './components/operations/ProjectsPage';
import { StatusPage } from './components/operations/StatusPage';
import { PlannerTeamPage } from './components/operations/PlannerTeamPage';
import { DocsSecurityPage } from './components/operations/DocsSecurityPage';
import { WorkflowImprovementsPage } from './components/operations/WorkflowImprovementsPage';
import { ExceptionQueuePage } from './components/operations/ExceptionQueuePage';
import { DocumentIntakePage } from './components/operations/DocumentIntakePage';
import { ProcessMiningPage } from './components/operations/ProcessMiningPage';
import { KnowledgeAssistantPage } from './components/operations/KnowledgeAssistantPage';
import { AutomatedReportsPage } from './components/operations/AutomatedReportsPage';

// Marketing Pages
import { ContentStudioPage } from './components/marketing/ContentStudioPage';
import { Customer360Page } from './components/marketing/Customer360Page';
import { PredictiveScoringPage } from './components/marketing/PredictiveScoringPage';
import { AttributionPage } from './components/marketing/AttributionPage';
import { LeadManagementPage } from './components/marketing/LeadManagementPage';
import { ProposalsPage } from './components/marketing/ProposalsPage';
import { CustomerListsPage } from './components/marketing/CustomerListsPage';
import { RecommendationsPage } from './components/marketing/RecommendationsPage';
import { BrochuresCatalogPage } from './components/marketing/BrochuresCatalogPage';
import { SeoKeywordsPage } from './components/marketing/SeoKeywordsPage';

// Strategy & Leadership Pages
import { GoalsPage } from './components/strategy/GoalsPage';
import { TimelinesPage } from './components/strategy/TimelinesPage';
import { ActionPlanPage } from './components/strategy/ActionPlanPage';
import { PoliciesPage } from './components/strategy/PoliciesPage';

// Finance Pages
import { FinanceDashboardPage } from './components/finance/FinanceDashboardPage';
import { RevenuesPage } from './components/finance/RevenuesPage';
import { ExpensesPage } from './components/finance/ExpensesPage';
import { TaxesPage } from './components/finance/TaxesPage';
import { FinancialPlanningPage } from './components/finance/FinancialPlanningPage';

// HR & People Pages
import { PersonIdentificationPage } from './components/hr/PersonIdentificationPage';
import { AiInterviewingPage } from './components/hr/AiInterviewingPage';
import { OfferLettersPage } from './components/hr/OfferLettersPage';
import { HrPoliciesPage } from './components/hr/HrPoliciesPage';
import { SalaryDisbursementPage } from './components/hr/SalaryDisbursementPage';
import { ExperienceLettersPage } from './components/hr/ExperienceLettersPage';
import { DocumentationPage } from './components/hr/DocumentationPage';

// Security & Defense Pages
import { SecurityOverviewPage } from './components/security/SecurityOverviewPage';
import { DataSecurityPage } from './components/security/DataSecurityPage';
import { IpSecurityPage } from './components/security/IpSecurityPage';
import { PersonnelSafetyPage } from './components/security/PersonnelSafetyPage';
import { EquipmentSecurityPage } from './components/security/EquipmentSecurityPage';
import { InfrastructureSecurityPage } from './components/security/InfrastructureSecurityPage';

const PageRouter = () => {
  const route = useSelector((s) => s.navigation.activeRoute);

  switch (route) {
    case 'operations.projects':             return <ProjectsPage />;
    case 'operations.status':               return <StatusPage />;
    case 'operations.planner':              return <PlannerTeamPage />;
    case 'operations.docsSecurity':         return <DocsSecurityPage />;
    case 'operations.workflowImprovements': return <WorkflowImprovementsPage />;
    case 'operations.exceptions':           return <ExceptionQueuePage />;
    case 'operations.intake':       return <DocumentIntakePage />;
    case 'operations.mining':       return <ProcessMiningPage />;
    case 'operations.knowledge':    return <KnowledgeAssistantPage />;
    case 'operations.reports':      return <AutomatedReportsPage />;
    case 'marketing':
    case 'marketing.leads':         return <LeadManagementPage />;
    case 'marketing.proposals':     return <ProposalsPage />;
    case 'marketing.lists':         return <CustomerListsPage />;
    case 'marketing.recs':          return <RecommendationsPage />;
    case 'marketing.collateral':    return <BrochuresCatalogPage />;
    case 'marketing.seo':           return <SeoKeywordsPage />;
    case 'marketing.studio':        return <ContentStudioPage />;
    case 'marketing.customer360':   return <Customer360Page />;
    case 'marketing.scoring':       return <PredictiveScoringPage />;
    case 'marketing.attribution':   return <AttributionPage />;
    case 'strategy':
    case 'strategy.goals':          return <GoalsPage />;
    case 'strategy.timelines':      return <TimelinesPage />;
    case 'strategy.actionPlan':     return <ActionPlanPage />;
    case 'strategy.policies':       return <PoliciesPage />;
    case 'finance':
    case 'finance.dashboard':       return <FinanceDashboardPage />;
    case 'finance.revenues':        return <RevenuesPage />;
    case 'finance.expenses':        return <ExpensesPage />;
    case 'finance.taxes':           return <TaxesPage />;
    case 'finance.planning':        return <FinancialPlanningPage />;
    case 'hr':
    case 'hr.identification':       return <PersonIdentificationPage />;
    case 'hr.interviews':           return <AiInterviewingPage />;
    case 'hr.offers':               return <OfferLettersPage />;
    case 'hr.policies':             return <HrPoliciesPage />;
    case 'hr.payroll':              return <SalaryDisbursementPage />;
    case 'hr.experience':           return <ExperienceLettersPage />;
    case 'hr.documentation':        return <DocumentationPage />;
    case 'security':
    case 'security.overview':       return <SecurityOverviewPage />;
    case 'security.data':           return <DataSecurityPage />;
    case 'security.ip':             return <IpSecurityPage />;
    case 'security.personnel':      return <PersonnelSafetyPage />;
    case 'security.equipment':      return <EquipmentSecurityPage />;
    case 'security.infrastructure': return <InfrastructureSecurityPage />;
    case 'security.sentry':         return <SentryConsolePage />;
    case 'operations':              return <ProjectsPage />;
    default:                        return <ExceptionQueuePage />;
  }
};

export const App = () => {
  const dispatch = useDispatch();
  const theme = useSelector((s) => s.theme.mode);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  // Monitor session validity and listen to session-expired events
  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Listen for global session-expired events fired by apiClient
    const handleSessionExpiredEvent = (e) => {
      const reason = e?.detail?.reason || 'Your security session has expired.';
      dispatch(triggerSessionExpired(reason));
    };

    window.addEventListener('agentic:session-expired', handleSessionExpiredEvent);

    // 2. Periodic token validity check (runs every 30 seconds)
    const checkInterval = setInterval(async () => {
      const token = getAccessToken();
      if (!token) return;

      if (isTokenExpired(token)) {
        console.warn('[SESSION WATCHER] Access token expired, attempting silent renewal...');
        try {
          await refreshAuth();
          console.info('[SESSION WATCHER] Token renewed successfully.');
        } catch (err) {
          console.warn('[SESSION WATCHER] Silent token renewal failed:', err.message);
          dispatch(triggerSessionExpired('Your session has expired. Please refresh to continue.'));
        }
      }
    }, 30000);

    return () => {
      window.removeEventListener('agentic:session-expired', handleSessionExpiredEvent);
      clearInterval(checkInterval);
    };
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) {
    return (
      <div data-theme={theme}>
        <LoginPage />
      </div>
    );
  }

  return (
    <div className="app-shell" data-theme={theme}>
      {/* Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-area">
        {/* Top breadcrumb bar */}
        <Topbar />

        {/* Scrollable Page Content */}
        <main className="page-viewport">
          <PageRouter />
        </main>
      </div>

      {/* Global Overlays */}
      <GovernanceDrawer />
      <AgentRoadmapModal />

      <AuthModal />
      <SessionExpiredModal />
    </div>
  );
};

export default App;
