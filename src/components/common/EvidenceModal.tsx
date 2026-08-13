import React from 'react';
import { PaperEvidence } from '../../types';
import { InsightFeedbackControl } from './InsightFeedbackControl';
import { sanitizeEvidenceQuote } from '../../utils/textSanitizer';
import { X, Quote, FileText, CheckCircle2, AlertTriangle, Bookmark } from 'lucide-react';

interface EvidenceModalProps {
  evidence: PaperEvidence | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ evidence, onClose }) => {
  if (!evidence) return null;

  const displayQuote = sanitizeEvidenceQuote(evidence.quoteOrExcerpt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Quote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Evidence Inspection ({evidence.id})
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Grounded paper source excerpt
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* Badges & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                  evidence.sourceType === 'EXPLICIT'
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                }`}
              >
                {evidence.sourceType === 'EXPLICIT' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                )}
                <span>{evidence.sourceType} STATEMENT</span>
              </span>

              <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[11px] border border-zinc-200 dark:border-zinc-700">
                {evidence.chunkId}
              </span>
            </div>

            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Page {evidence.page} • {evidence.section}</span>
            </div>
          </div>

          {/* Source Excerpt */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 relative">
            <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed italic">
              "{displayQuote}"
            </p>
          </div>

          {/* Rate Evidence Relevance */}
          <InsightFeedbackControl
            itemId={evidence.id}
            itemType="evidence"
            itemTitle={`Evidence ${evidence.chunkId} (p. ${evidence.page})`}
          />

          {/* Explanation Footer */}
          <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-[11px] text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
            <Bookmark className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Source Grounding Policy:</strong> This excerpt is directly verified from the extracted paper layer. Confidence ratings reflect AI inference clarity, not factual truth.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-emerald-800 dark:bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-900 dark:hover:bg-emerald-600 transition-colors"
          >
            Close Evidence
          </button>
        </div>

      </div>
    </div>
  );
};
