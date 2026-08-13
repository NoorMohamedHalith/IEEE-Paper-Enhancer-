import React from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { GlobalSearch } from './GlobalSearch';
import { Upload, Settings, ShieldCheck, Database, Menu, Save, CheckCircle2, RefreshCw, Sun, Moon, FileText, Printer, Undo2, Redo2, History } from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    settings,
    setIsUploadModalOpen,
    setIsSettingsModalOpen,
    setIsReportModalOpen,
    setIsAuditModalOpen,
    activityLogs,
    papers,
    lastSavedTime,
    isAutoSaving,
    triggerAutoSave,
    theme,
    toggleTheme,
    undo,
    redo,
    canUndo,
    canRedo,
  } = usePaperContext();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Mobile Menu Toggle & Brand Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-800 dark:bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                IX
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
                    IEEE InnovateX
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Research Engine
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium tracking-wide">
                  Transform Research into Innovation
                </p>
              </div>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-md mx-2">
            <GlobalSearch />
          </div>

          {/* Right Controls: Auto-Save Badge, Undo/Redo, Theme Toggle, Report PDF, Settings, Upload CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Undo / Redo Control Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => undo()}
                disabled={!canUndo}
                title={canUndo ? 'Undo last change (Ctrl+Z)' : 'Nothing to undo'}
                className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center transition-colors ${
                  canUndo
                    ? 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 cursor-pointer'
                    : 'text-zinc-300 dark:text-zinc-700 border-zinc-100 dark:border-zinc-800/50 cursor-not-allowed opacity-50'
                }`}
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => redo()}
                disabled={!canRedo}
                title={canRedo ? 'Redo change (Ctrl+Y)' : 'Nothing to redo'}
                className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center transition-colors ${
                  canRedo
                    ? 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 cursor-pointer'
                    : 'text-zinc-300 dark:text-zinc-700 border-zinc-100 dark:border-zinc-800/50 cursor-not-allowed opacity-50'
                }`}
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Auto-Save Indicator Badge */}
            <button
              onClick={() => triggerAutoSave()}
              disabled={isAutoSaving}
              title="State & Selected Enhancements auto-save every 30 seconds to LocalStorage/IndexedDB. Click to save now."
              className={`
                hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer
                ${
                  isAutoSaving
                    ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800 animate-pulse'
                    : 'bg-emerald-50/80 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/80'
                }
              `}
            >
              {isAutoSaving ? (
                <RefreshCw className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              )}
              <span className="font-mono">
                {isAutoSaving ? 'Auto-saving...' : lastSavedTime ? `Auto-saved ${lastSavedTime}` : 'Auto-saved'}
              </span>
            </button>

            {/* High-Contrast Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:px-2.5 sm:py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title={theme === 'dark' ? 'Switch to Clean Minimalism Light Mode' : 'Switch to High-Contrast Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-600" />
              )}
              <span className="hidden md:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            {/* Export PDF Report Button */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="p-2 sm:px-2.5 sm:py-2 rounded-lg text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Generate & Export Professional IEEE PDF Research Report"
            >
              <Printer className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              <span className="hidden md:inline">Report PDF</span>
            </button>

            {/* Workspace Status Badge */}
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                <Database className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{settings.workspaceName}</span>
                <span className="text-zinc-400 dark:text-zinc-600">|</span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {papers.length} {papers.length === 1 ? 'Paper' : 'Papers'}
                </span>
              </div>
            </div>

            {/* Audit Trail Button */}
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors relative"
              title="View Internal Activity Audit Trail & User History"
            >
              <History className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              <span className="hidden sm:inline">Audit Log</span>
              {activityLogs.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 sm:relative sm:top-auto sm:right-auto sm:w-auto sm:h-auto sm:px-1.5 sm:py-0.2 sm:bg-emerald-100 sm:dark:bg-emerald-950 sm:text-emerald-800 sm:dark:text-emerald-300 sm:text-[10px] sm:font-mono sm:font-bold sm:border sm:border-emerald-200 sm:dark:border-emerald-800">
                  {activityLogs.length}
                </span>
              )}
            </button>

            {/* Settings Trigger Button */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Workspace & System Settings"
            >
              <Settings className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* Primary Action CTA */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all hover:shadow focus:ring-2 focus:ring-emerald-800 focus:ring-offset-1"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden xs:inline">Upload Paper</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

