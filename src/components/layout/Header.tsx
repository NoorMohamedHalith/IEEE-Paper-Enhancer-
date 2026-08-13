import React, { useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { GlobalSearch } from './GlobalSearch';
import { ThemeColorPicker, ACCENT_THEMES } from '../common/ThemeColorPicker';
import { JudgeModeModal } from '../common/JudgeModeModal';
import { Upload, Settings, ShieldCheck, Database, Menu, Save, CheckCircle2, RefreshCw, Sun, Moon, FileText, Printer, Undo2, Redo2, History, Palette, Trophy } from 'lucide-react';

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
    accentColor,
    undo,
    redo,
    canUndo,
    canRedo,
  } = usePaperContext();

  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [isJudgeModeOpen, setIsJudgeModeOpen] = useState(false);
  const activeAccent = ACCENT_THEMES.find((a) => a.id === accentColor) || ACCENT_THEMES[0];

  return (
    <>
      <header className="sticky top-0 z-30 glass-panel border-b border-zinc-200/80 dark:border-zinc-800 shadow-md transition-colors backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Left: Mobile Menu Toggle & Brand Title */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={onOpenMobileMenu}
                className="lg:hidden p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Open Navigation Drawer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center font-extrabold text-base shadow-md neon-glow-cyan shrink-0 transition-all hover:scale-105">
                  IX
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none whitespace-nowrap">
                      IEEE InnovateX
                    </h1>
                    <span className="hidden 2xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border border-cyan-400/40 neon-glow-cyan">
                      AI | IoT | Edge
                    </span>
                  </div>
                  <p className="hidden xl:block text-[10px] text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">
                    Enhance IEEE Projects
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Global Search Bar */}
            <div className="flex-1 min-w-[120px] max-w-xs mx-1 sm:mx-2">
              <GlobalSearch />
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 justify-end">
              
              {/* Judge Mode Highlight CTA */}
              <button
                onClick={() => setIsJudgeModeOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105 cursor-pointer border border-amber-400"
                title="Open Hackathon Judge Walkthrough Mode"
              >
                <Trophy className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Judge Mode</span>
              </button>

              {/* Undo / Redo Control Buttons */}
              <div className="hidden xs:flex items-center gap-0.5">
                <button
                  onClick={() => undo()}
                  disabled={!canUndo}
                  title={canUndo ? 'Undo last change (Ctrl+Z)' : 'Nothing to undo'}
                  className={`p-1.5 rounded-xl border text-xs font-medium flex items-center justify-center transition-all ${
                    canUndo
                      ? 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 cursor-pointer hover:scale-105'
                      : 'text-zinc-300 dark:text-zinc-700 border-zinc-100 dark:border-zinc-800/50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => redo()}
                  disabled={!canRedo}
                  title={canRedo ? 'Redo change (Ctrl+Y)' : 'Nothing to redo'}
                  className={`p-1.5 rounded-xl border text-xs font-medium flex items-center justify-center transition-all ${
                    canRedo
                      ? 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 cursor-pointer hover:scale-105'
                      : 'text-zinc-300 dark:text-zinc-700 border-zinc-100 dark:border-zinc-800/50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Auto-Save Indicator Badge */}
              <button
                onClick={() => triggerAutoSave()}
                disabled={isAutoSaving}
                title="State & Selected Enhancements auto-save every 30 seconds. Click to save now."
                className={`
                  hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer shadow-2xs
                  ${
                    isAutoSaving
                      ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 animate-pulse'
                      : 'bg-lime-500/10 text-lime-800 dark:text-lime-300 border-lime-400/50 hover:bg-lime-500/20'
                  }
                `}
              >
                {isAutoSaving ? (
                  <RefreshCw className="w-3 h-3 text-amber-700 dark:text-amber-400 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-lime-600 dark:text-lime-400" />
                )}
                <span className="font-mono">
                  {isAutoSaving ? 'Saving...' : lastSavedTime ? `Saved ${lastSavedTime}` : 'Saved'}
                </span>
              </button>

              {/* Animated High-Contrast Theme & Accent Palette Popover Toggle */}
              <div className="relative">
                <button
                  onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
                  className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-105 ${
                    isThemePickerOpen
                      ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 ring-2 ring-brand-primary'
                      : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
                  }`}
                  title="Choose Mode & Color Theme Palette"
                >
                  {theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-purple-400 transition-transform duration-300 rotate-12" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 hover:rotate-90" />
                  )}
                  <div className={`w-2.5 h-2.5 rounded-full ${activeAccent.dotColor} ring-1 ring-white dark:ring-zinc-900 shadow-2xs shrink-0`} />
                  <span className="hidden 2xl:inline font-bold">{activeAccent.name}</span>
                  <Palette className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                </button>

                {/* Theme & Accent Color Palette Popover Container */}
                {isThemePickerOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsThemePickerOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      <ThemeColorPicker onClose={() => setIsThemePickerOpen(false)} />
                    </div>
                  </>
                )}
              </div>

              {/* Export PDF Report Button */}
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-cyan-900 dark:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer neon-glow-cyan"
                title="Generate & Export Professional IEEE PDF Research Report"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span className="hidden lg:inline">Report PDF</span>
              </button>

              {/* Audit Trail Button */}
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold flex items-center gap-1 transition-colors relative cursor-pointer"
                title="View Internal Activity Audit Trail"
              >
                <History className="w-3.5 h-3.5 text-lime-500" />
                <span className="hidden xl:inline">Audit Log</span>
                {activityLogs.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-500 absolute top-1 right-1 xl:relative xl:top-auto xl:right-auto xl:w-auto xl:h-auto xl:px-1.5 xl:py-0.2 xl:bg-lime-500/20 xl:text-lime-800 xl:dark:text-lime-300 xl:text-[10px] xl:font-mono xl:font-bold xl:border xl:border-lime-400/40 xl:rounded-full">
                    {activityLogs.length}
                  </span>
                )}
              </button>

              {/* Settings Trigger Button */}
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Workspace & System Settings"
              >
                <Settings className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                <span className="hidden xl:inline">Settings</span>
              </button>

              {/* Primary Action CTA */}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-3 py-1.5 sm:px-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all hover:scale-105 shrink-0 cursor-pointer border border-brand-border"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload Paper</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Judge Mode Presentation Modal */}
      <JudgeModeModal isOpen={isJudgeModeOpen} onClose={() => setIsJudgeModeOpen(false)} />
    </>
  );
};

