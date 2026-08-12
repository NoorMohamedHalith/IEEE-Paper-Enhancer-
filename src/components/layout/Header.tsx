import React from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { GlobalSearch } from './GlobalSearch';
import { Upload, Settings, ShieldCheck, Database, Menu, Save, CheckCircle2, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    settings,
    setIsUploadModalOpen,
    setIsSettingsModalOpen,
    papers,
    lastSavedTime,
    isAutoSaving,
    triggerAutoSave,
  } = usePaperContext();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Mobile Menu Toggle & Brand Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                IX
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight leading-none">
                    IEEE InnovateX
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Research Engine
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-medium tracking-wide">
                  Transform Research into Innovation
                </p>
              </div>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-md mx-2">
            <GlobalSearch />
          </div>

          {/* Right Controls: Auto-Save Badge, Settings, Upload CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Auto-Save Indicator Badge */}
            <button
              onClick={() => triggerAutoSave()}
              disabled={isAutoSaving}
              title="State & Selected Enhancements auto-save every 30 seconds to LocalStorage/IndexedDB. Click to save now."
              className={`
                hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer
                ${
                  isAutoSaving
                    ? 'bg-amber-50 text-amber-900 border-amber-200 animate-pulse'
                    : 'bg-emerald-50/80 text-emerald-900 border-emerald-200/80 hover:bg-emerald-100/80'
                }
              `}
            >
              {isAutoSaving ? (
                <RefreshCw className="w-3.5 h-3.5 text-amber-700 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              )}
              <span className="font-mono">
                {isAutoSaving ? 'Auto-saving...' : lastSavedTime ? `Auto-saved ${lastSavedTime}` : 'Auto-saved'}
              </span>
            </button>

            {/* Workspace Status Badge */}
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex items-center gap-1.5 text-zinc-700">
                <Database className="w-3.5 h-3.5 text-emerald-800" />
                <span className="font-medium text-zinc-800">{settings.workspaceName}</span>
                <span className="text-zinc-400">|</span>
                <span className="text-zinc-500">
                  {papers.length} {papers.length === 1 ? 'Paper' : 'Papers'}
                </span>
              </div>
            </div>

            {/* Settings Trigger Button */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-lg text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Workspace & System Settings"
            >
              <Settings className="w-4 h-4 text-zinc-600" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* Primary Action CTA */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all hover:shadow focus:ring-2 focus:ring-emerald-800 focus:ring-offset-1"
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
