import React, { useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { ACCENT_THEMES } from './ThemeColorPicker';
import { X, Database, Key, ShieldCheck, Trash2, Save, CheckCircle2, Sun, Moon, Palette, Check } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsModalOpen, setIsSettingsModalOpen, settings, updateSettings, clearWorkspace, theme, toggleTheme, accentColor, setAccentColor } = usePaperContext();
  const [workspaceName, setWorkspaceName] = useState(settings.workspaceName);
  const [dbType, setDbType] = useState<'local' | 'firestore'>(settings.dbAdapterType);
  const [autoAnalyze, setAutoAnalyze] = useState(settings.autoAnalyzeOnUpload);
  const [isSaved, setIsSaved] = useState(false);

  if (!isSettingsModalOpen) return null;

  const handleSave = async () => {
    await updateSettings({
      ...settings,
      workspaceName,
      dbAdapterType: dbType,
      autoAnalyzeOnUpload: autoAnalyze,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsSettingsModalOpen(false);
    }, 800);
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear all papers and reset the active workspace?')) {
      await clearWorkspace();
      setIsSettingsModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold text-sm">
              ⚙️
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Workspace Settings</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Database abstraction & UI configuration</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Workspace Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800"
            />
          </div>

          {/* Theme Switcher */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Appearance & Atmosphere
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`p-2.5 rounded-lg border text-left text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-amber-50 dark:bg-zinc-800 border-amber-300 dark:border-zinc-700 text-amber-900 dark:text-amber-300 ring-1 ring-amber-400'
                    : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Clean Minimal</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">Light Mode</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => theme === 'light' && toggleTheme()}
                className={`p-2.5 rounded-lg border text-left text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-zinc-900 text-zinc-100 border-zinc-700 ring-1 ring-zinc-500'
                    : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Moon className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold">High-Contrast</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">Late-Night Dark</p>
                </div>
              </button>
            </div>
          </div>

          {/* Dynamic Accent Color Theme */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-brand-primary" />
                Accent Theme Palette
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-light text-brand-primary">
                {ACCENT_THEMES.find((a) => a.id === accentColor)?.name}
              </span>
            </label>

            <div className="grid grid-cols-3 gap-1.5">
              {ACCENT_THEMES.map((item) => {
                const isSelected = accentColor === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAccentColor(item.id)}
                    className={`
                      p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer
                      ${
                        isSelected
                          ? `${item.bgColor} ${item.borderColor} ring-2 ring-brand-primary font-bold shadow-2xs`
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }
                    `}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full ${item.dotColor} shrink-0 flex items-center justify-center`}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {item.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Database Architecture Provider */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
              <span>Database Architecture Provider</span>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">100% Offline Local</span>
            </label>
            <div className="p-3.5 rounded-xl border border-brand-primary/40 bg-brand-light/30 dark:bg-zinc-900/60 text-xs font-medium space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-primary shrink-0" />
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">IndexedDB (Offline Browser Database)</p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">All paper texts, page chunks, analysis records, and audit logs are stored 100% offline inside your browser database without online server requirements.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gemini API Key Status */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
                Gemini AI Engine
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Active & Configured
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Server-side API calls configured with GEMINI_API_KEY environment binding.
            </p>
          </div>

          {/* Auto Analyze Option */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Auto-Analyze on Upload</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Automatically trigger AI extraction on new paper upload</p>
            </div>
            <input
              type="checkbox"
              checked={autoAnalyze}
              onChange={(e) => setAutoAnalyze(e.target.checked)}
              className="w-4 h-4 text-emerald-800 border-zinc-300 rounded focus:ring-emerald-800"
            />
          </div>

          {/* Danger Zone: Clear Workspace */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={handleClear}
              className="w-full px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Workspace & Reset Papers</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Saved!' : 'Save Settings'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

