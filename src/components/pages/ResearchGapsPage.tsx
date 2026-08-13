import React, { useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { WorkflowStepper } from '../layout/WorkflowStepper';
import { EmptyStateCard } from '../common/EmptyStateCard';
import { EvidenceModal } from '../common/EvidenceModal';
import { PaperEvidence } from '../../types';
import { AlertCircle, ArrowRight, Sparkles, FileText, CheckCircle2, Circle } from 'lucide-react';

export const ResearchGapsPage: React.FC = () => {
  const { activePaper, setActiveTab, setIsUploadModalOpen, toggleGapApproval } = usePaperContext();
  const [selectedEvidence, setSelectedEvidence] = useState<PaperEvidence | null>(null);

  const gaps = activePaper?.analysis?.researchGaps || [];
  const evidences = activePaper?.analysis?.evidences || [];
  const approvedGapIds = activePaper?.approvedGapIds || [];

  const findEvidence = (id?: string) => evidences.find((e) => e.id === id) || evidences[0] || null;

  if (gaps.length === 0) {
    return (
      <div className="space-y-6">
        <WorkflowStepper />

        <EmptyStateCard
          icon={AlertCircle}
          title="Research Gaps Unidentified"
          message="No research gaps identified yet."
          actionButton={
            activePaper && activePaper.status === 'Awaiting analysis'
              ? {
                  label: 'Go to Analysis Page',
                  onClick: () => setActiveTab('analysis'),
                }
              : {
                  label: 'Upload Paper First',
                  onClick: () => setIsUploadModalOpen(true),
                }
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkflowStepper />

      {/* Page Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Evidence-Backed Research Gaps
              </span>
              <span className="text-xs text-zinc-300 dark:text-zinc-700">|</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {approvedGapIds.length} / {gaps.length} Approved for Enhancements
              </span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Research Gaps & Opportunity Analysis
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Mapped directly from paper limitations and methodology bottlenecks
            </p>
          </div>

          <button
            onClick={() => setActiveTab('enhancements')}
            className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors"
          >
            <span>Proceed to Software Enhancements</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Research Gaps Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gaps.map((gap) => {
          const matchedEv = findEvidence(gap.evidenceIds?.[0]);
          const isApproved = approvedGapIds.includes(gap.id);

          return (
            <div
              key={gap.id}
              className={`bg-white dark:bg-zinc-900 rounded-xl border p-5 shadow-2xs flex flex-col justify-between transition-all space-y-4 ${
                isApproved
                  ? 'border-emerald-500/80 dark:border-emerald-600/80 ring-1 ring-emerald-500/30'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-800 dark:bg-emerald-700 text-white">
                      {gap.gapType}
                    </span>

                    {isApproved && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                        Approved Gap
                      </span>
                    )}
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                    Confidence: {gap.confidence || 'High'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">{gap.title}</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {gap.explanation || (gap as any).description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => activePaper && toggleGapApproval(activePaper.id, gap.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isApproved
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                  title="Toggle Approval status for this Research Gap"
                >
                  {isApproved ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                  <span>{isApproved ? 'Approved for Enhancement' : 'Approve Gap'}</span>
                </button>

                <button
                  onClick={() => setSelectedEvidence(matchedEv)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-200 dark:border-emerald-800"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>[View Evidence]</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Evidence Viewer Modal */}
      <EvidenceModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
};
