import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PaperProvider, usePaperContext } from './context/PaperContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { FlowingBackground } from './components/common/FlowingBackground';
import { UploadModal } from './components/common/UploadModal';
import { SettingsModal } from './components/common/SettingsModal';
import { ResearchReportModal } from './components/common/ResearchReportModal';
import { AuditTrailModal } from './components/common/AuditTrailModal';
import { AutoSaveToast } from './components/common/AutoSaveToast';
import { RemovePaperFloatingWidget } from './components/common/RemovePaperFloatingWidget';

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
    <div className="min-h-screen bg-slate-50/60 dark:bg-zinc-950/80 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased selection:bg-lime-200 selection:text-lime-950 transition-colors relative overflow-x-hidden">
      {/* Animated Flowing Water / Paper Background Layer */}
      <FlowingBackground />

      {/* Top Header */}
      <Header onOpenMobileMenu={() => setIsMobileOpen(true)} />

      {/* Main Body Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex relative z-10">
        {/* Sidebar */}
        <Sidebar
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Dynamic Page Container with 60fps Motion Easing Transitions */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modals & Notifications */}
      <UploadModal />
      <SettingsModal />
      <ResearchReportModal />
      <AuditTrailModal />
      <AutoSaveToast />
      <RemovePaperFloatingWidget />
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
