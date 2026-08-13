import React, { useEffect, useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { CheckCircle2, Database, X, Sparkles } from 'lucide-react';

export const AutoSaveToast: React.FC = () => {
  const { toastNotification, dismissToast } = usePaperContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toastNotification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          dismissToast();
        }, 300); // Allow exit transition
      }, 3500); // 3.5 seconds display

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [toastNotification, dismissToast]);

  if (!toastNotification && !isVisible) return null;

  return (
    <div
      className={`
        fixed bottom-5 right-5 z-50 max-w-sm w-full transition-all duration-300 ease-out pointer-events-auto
        ${
          isVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }
      `}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-800/30 dark:border-emerald-700/40 p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 relative overflow-hidden">
        
        {/* Subtle accent line on left */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-800 dark:bg-emerald-600 rounded-l-2xl" />

        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 shrink-0 mt-0.5 border border-emerald-200/50 dark:border-emerald-800/50">
          <Database className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 pr-4 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Auto-Saved
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              LocalStorage / IndexedDB
            </span>
          </div>

          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            {toastNotification?.title || 'Research Session Saved'}
          </h4>

          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {toastNotification?.text || 'All paper analysis, limitations, and selected software enhancements persist.'}
          </p>
        </div>

        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => dismissToast(), 200);
          }}
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
