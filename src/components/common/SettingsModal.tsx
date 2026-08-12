import React, { useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { X, Database, Key, ShieldCheck, Trash2, Save, CheckCircle2 } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsModalOpen, setIsSettingsModalOpen, settings, updateSettings, clearWorkspace } = usePaperContext();
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
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center font-bold text-sm">
              ⚙️
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Workspace Settings</h3>
              <p className="text-xs text-zinc-500">Database abstraction & AI engine status</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Workspace Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800"
            />
          </div>

          {/* Database Abstraction Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center justify-between">
              <span>Database Architecture Provider</span>
              <span className="text-[10px] text-zinc-400 font-normal">Firestore Abstraction</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDbType('local')}
                className={`p-3 rounded-lg border text-left text-xs font-semibold flex items-center gap-2 ${
                  dbType === 'local'
                    ? 'bg-emerald-50 border-emerald-800 text-emerald-950 ring-1 ring-emerald-800'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                }`}
              >
                <Database className="w-4 h-4 text-emerald-800 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Local DB Adapter</p>
                  <p className="text-[10px] text-zinc-500 font-normal">Zero setup instant</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDbType('firestore')}
                className={`p-3 rounded-lg border text-left text-xs font-semibold flex items-center gap-2 ${
                  dbType === 'firestore'
                    ? 'bg-emerald-50 border-emerald-800 text-emerald-950 ring-1 ring-emerald-800'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                }`}
              >
                <Database className="w-4 h-4 text-emerald-800 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Firebase Firestore</p>
                  <p className="text-[10px] text-zinc-500 font-normal">Cloud persistence</p>
                </div>
              </button>
            </div>
          </div>

          {/* Gemini API Key Status */}
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-800" />
                Gemini AI Engine
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Active & Configured
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Server-side API calls configured with GEMINI_API_KEY environment binding.
            </p>
          </div>

          {/* Auto Analyze Option */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-semibold text-zinc-800">Auto-Analyze on Upload</p>
              <p className="text-[11px] text-zinc-500">Automatically trigger AI extraction on new paper upload</p>
            </div>
            <input
              type="checkbox"
              checked={autoAnalyze}
              onChange={(e) => setAutoAnalyze(e.target.checked)}
              className="w-4 h-4 text-emerald-800 border-zinc-300 rounded focus:ring-emerald-800"
            />
          </div>

          {/* Danger Zone: Clear Workspace */}
          <div className="pt-3 border-t border-zinc-200">
            <button
              onClick={handleClear}
              className="w-full px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Workspace & Reset Papers</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end gap-2">
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-3.5 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Saved!' : 'Save Settings'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
