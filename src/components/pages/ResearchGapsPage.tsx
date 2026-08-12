import React, { useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { WorkflowStepper } from '../layout/WorkflowStepper';
import { EmptyStateCard } from '../common/EmptyStateCard';
import { EvidenceModal } from '../common/EvidenceModal';
import { PaperEvidence } from '../../types';
import { AlertCircle, ArrowRight, Sparkles, FileText } from 'lucide-react';

export const ResearchGapsPage: React.FC = () => {
  const { activePaper, setActiveTab, setIsUploadModalOpen } = usePaperContext();
  const [selectedEvidence, setSelectedEvidence] = useState<PaperEvidence | null>(null);

  const gaps = activePaper?.analysis?.researchGaps || [];
  const evidences = activePaper?.analysis?.evidences || [];

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
      <div className="bg-white rounded-2xl border border-[#E8EAEF] p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8EAEF]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#F0F4F2] text-[#064E3B] border border-[#CBD5E1]">
                Evidence-Backed Research Gaps
              </span>
              <span className="text-xs text-zinc-300">|</span>
              <span className="text-xs text-[#64748B] font-medium">
                {gaps.length} Identified Research Gaps
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#1E293B]">
              Research Gaps & Opportunity Analysis
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Mapped directly from paper limitations and methodology bottlenecks
            </p>
          </div>

          <button
            onClick={() => setActiveTab('enhancements')}
            className="px-4 py-2 rounded-lg bg-[#064E3B] hover:bg-[#053F2F] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors"
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

          return (
            <div
              key={gap.id}
              className="bg-white rounded-xl border border-[#E8EAEF] p-5 shadow-2xs flex flex-col justify-between hover:border-[#CBD5E1] transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#064E3B] text-white">
                    {gap.gapType}
                  </span>

                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-[#1E293B]">
                    Confidence: {gap.confidence || 'High'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#1E293B] mb-2">{gap.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {gap.explanation || (gap as any).description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8EAEF] flex items-center justify-between">
                <span className="text-[11px] text-[#64748B]">
                  Grounding: {gap.evidenceIds?.length || 1} Source Evidence(s)
                </span>

                <button
                  onClick={() => setSelectedEvidence(matchedEv)}
                  className="px-3 py-1.5 rounded-lg bg-[#F0F4F2] hover:bg-[#E2E8F0] text-[#064E3B] text-xs font-bold flex items-center gap-1.5 transition-colors"
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
