import React, { useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { Trash2, AlertTriangle, X, RefreshCw } from 'lucide-react';

export const RemovePaperFloatingWidget: React.FC = () => {
  const { activePaper, papers, removePaper, clearWorkspace } = usePaperContext();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const targetPaper = activePaper || (papers.length > 0 ? papers[0] : null);

  const handleConfirmDelete = async () => {
    if (targetPaper) {
      await removePaper(targetPaper.id);
    } else {
      await clearWorkspace();
    }
    setShowConfirmModal(false);
  };

  return (
    <>
      {/* Floating Bottom Right Button - Always Visible */}
      <div className="fixed bottom-6 right-6 z-40 print:hidden">
        {targetPaper ? (
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg flex items-center gap-2 border border-rose-500/80 transition-all hover:scale-105 active:scale-95 group"
            title="Remove active paper from workspace"
          >
            <Trash2 className="w-4 h-4 transition-transform group-hover:rotate-12" />
            <span>Remove Active Paper</span>
          </button>
        ) : (
          <button
            onClick={async () => {
              await clearWorkspace();
              window.location.reload();
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-lg flex items-center gap-2 border border-amber-500/80 transition-all hover:scale-105 active:scale-95"
            title="Reset storage & reload workspace"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Workspace</span>
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Remove Research Paper?</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">This will remove the paper from your active workspace.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Selected Paper:</span>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-2">
                {targetPaper ? targetPaper.title : 'All Workspace Papers'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
