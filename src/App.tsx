import React, { useState } from 'react';
import { PaperProvider, usePaperContext } from './context/PaperContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { UploadModal } from './components/common/UploadModal';
import { SettingsModal } from './components/common/SettingsModal';
import { ResearchReportModal } from './components/common/ResearchReportModal';
import { AuditTrailModal } from './components/common/AuditTrailModal';
import { AutoSaveToast } from './components/common/AutoSaveToast';

import { DashboardPage } from './components/pages/DashboardPage';
import { PapersPage } from './components/pages/PapersPage';
import { PaperAnalysisPage } from './components/pages/PaperAnalysisPage';
import { ComparePapersPage } from './components/pages/ComparePapersPage';
import { ResearchGapsPage } from './components/pages/ResearchGapsPage';
import { EnhancementsPage } from './components/pages/EnhancementsPage';
import { ValidationPage } from './components/pages/ValidationPage';
import { EnhancedProjectPage } from './components/pages/EnhancedProjectPage';

const MainContent: React.FC = () => {
  const { activeTab } = usePaperContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'papers':
        return <PapersPage />;
      case 'analysis':
        return <PaperAnalysisPage />;
      case 'compare':
        return <ComparePapersPage />;
      case 'gaps':
        return <ResearchGapsPage />;
      case 'enhancements':
        return <EnhancementsPage />;
      case 'validation':
        return <ValidationPage />;
      case 'project':
        return <EnhancedProjectPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900 transition-colors">
      {/* Top Header */}
      <Header onOpenMobileMenu={() => setIsMobileOpen(true)} />

      {/* Main Body Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Sidebar */}
        <Sidebar
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {renderActiveTab()}
        </main>
      </div>

      {/* Modals & Notifications */}
      <UploadModal />
      <SettingsModal />
      <ResearchReportModal />
      <AuditTrailModal />
      <AutoSaveToast />
    </div>
  );
};

export default function App() {
  return (
    <PaperProvider>
      <MainContent />
    </PaperProvider>
  );
}
