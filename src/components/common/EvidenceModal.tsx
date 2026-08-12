import React from 'react';
import { PaperEvidence } from '../../types';
import { X, Quote, FileText, CheckCircle2, AlertTriangle, Bookmark } from 'lucide-react';

interface EvidenceModalProps {
  evidence: PaperEvidence | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ evidence, onClose }) => {
  if (!evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E8EAEF] shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8EAEF] bg-[#FDFDFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F0F4F2] text-[#064E3B] flex items-center justify-center">
              <Quote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">
                Evidence Inspection ({evidence.id})
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Grounded paper source excerpt
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-[#64748B] transition-colors"
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
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {evidence.sourceType === 'EXPLICIT' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-700" />
                )}
                <span>{evidence.sourceType} STATEMENT</span>
              </span>

              <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-[#1E293B] font-mono text-[11px] border border-[#E8EAEF]">
                {evidence.chunkId}
              </span>
            </div>

            <div className="text-xs font-semibold text-[#1E293B] flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#064E3B]" />
              <span>Page {evidence.page} • {evidence.section}</span>
            </div>
          </div>

          {/* Source Excerpt */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF] relative">
            <p className="text-xs text-[#1E293B] leading-relaxed italic">
              "{evidence.quoteOrExcerpt}"
            </p>
          </div>

          {/* Explanation Footer */}
          <div className="p-3 rounded-lg bg-[#F0F4F2]/60 border border-[#CBD5E1] text-[11px] text-[#1E293B] flex items-start gap-2">
            <Bookmark className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
            <span>
              <strong>Source Grounding Policy:</strong> This excerpt is directly verified from the extracted paper layer. Confidence ratings reflect AI inference clarity, not factual truth.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E8EAEF] bg-[#FDFDFB] text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#064E3B] text-white text-xs font-semibold hover:bg-[#053F2F] transition-colors"
          >
            Close Evidence
          </button>
        </div>

      </div>
    </div>
  );
};
