import React, { useState, useEffect } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { WorkflowStepper } from '../layout/WorkflowStepper';
import { EmptyStateCard } from '../common/EmptyStateCard';
import { EvidenceModal } from '../common/EvidenceModal';
import { SelectedEnhancementsDragDrop } from '../common/SelectedEnhancementsDragDrop';
import { EnhancementDependencyTree } from '../common/EnhancementDependencyTree';
import { EnhancementRecommendation, PaperEvidence, IEEEPaper } from '../../types';
import { generateClientDynamicRecommendations } from '../../services/ai/recommendationEngine';
import {
  Sparkles,
  Check,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  FileText,
  Filter,
  Info,
  CheckSquare,
  Square,
  Lock,
  Cpu,
  BarChart3,
  Award
} from 'lucide-react';

export const EnhancementsPage: React.FC = () => {
  const {
    papers,
    activePaper,
    selectActivePaper,
    toggleEnhancementSelection,
    approveEnhancements,
    ensureRecommendations,
    setActiveTab,
    setIsUploadModalOpen
  } = usePaperContext();

  const analyzedPapers = papers.filter((p) => p.status === 'Analyzed' && p.analysis);

  const [selectedPaperId, setSelectedPaperId] = useState<string>(
    activePaper?.id || (analyzedPapers[0]?.id || '')
  );

  useEffect(() => {
    if (activePaper) {
      setSelectedPaperId(activePaper.id);
      ensureRecommendations(activePaper.id);
    } else if (analyzedPapers.length > 0) {
      setSelectedPaperId(analyzedPapers[0].id);
      ensureRecommendations(analyzedPapers[0].id);
    }
  }, [activePaper, analyzedPapers.length]);

  const currentPaper = analyzedPapers.find((p) => p.id === selectedPaperId) || activePaper;

  // Selected recommendations local state for checkbox selection
  const selectedIds = currentPaper?.selectedEnhancementIds || [];

  // Recommendations array
  const rawRecommendations = currentPaper?.analysis?.recommendations || [];
  const recommendations: EnhancementRecommendation[] =
    rawRecommendations.length > 0
      ? rawRecommendations
      : currentPaper
      ? generateClientDynamicRecommendations(currentPaper)
      : [];

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedEvidence, setSelectedEvidence] = useState<PaperEvidence | null>(null);
  const [expandedBreakdownId, setExpandedBreakdownId] = useState<string | null>(null);
  const [expandedTraceabilityId, setExpandedTraceabilityId] = useState<string | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const [queueView, setQueueView] = useState<'tree' | 'queue'>('tree');

  // Categories list
  const categories = ['All', ...Array.from(new Set(recommendations.map((r) => r.category)))];

  const filteredRecommendations =
    selectedCategory === 'All'
      ? recommendations
      : recommendations.filter((r) => r.category === selectedCategory);

  const handleSelectPaper = (id: string) => {
    setSelectedPaperId(id);
    selectActivePaper(id);
    ensureRecommendations(id);
  };

  const handleToggleSelect = (recId: string) => {
    if (!currentPaper) return;
    toggleEnhancementSelection(currentPaper.id, recId);
  };

  const handleViewEvidence = (rec: EnhancementRecommendation) => {
    if (!currentPaper?.analysis?.evidences) return;
    const evidences = currentPaper.analysis.evidences;
    const ev = evidences.find((e) => rec.evidenceIds.includes(e.id)) || evidences[0] || null;
    setSelectedEvidence(ev);
  };

  const handleApproveAndContinue = () => {
    if (!currentPaper || selectedIds.length === 0) return;
    approveEnhancements(currentPaper.id, selectedIds);
    setIsApprovalModalOpen(false);
  };

  if (!currentPaper || !currentPaper.analysis) {
    return (
      <div className="space-y-6">
        <WorkflowStepper />
        <EmptyStateCard
          icon={Sparkles}
          title="Enhancement Recommendation Engine"
          message="Enhancement recommendations will appear after paper methodology & research gap analysis."
          actionButton={{
            label: 'Upload & Analyze IEEE Paper',
            onClick: () => setIsUploadModalOpen(true),
          }}
        />
      </div>
    );
  }

  const selectedRecommendations = recommendations.filter((r) => selectedIds.includes(r.id));

  return (
    <div className="space-y-6 pb-20">
      <WorkflowStepper />

      {/* Header Banner & Paper Switcher */}
      <div className="bg-white rounded-2xl border border-[#E8EAEF] p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8EAEF]">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#F0F4F2] text-[#064E3B] border border-[#CBD5E1] flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#064E3B]" />
                Software-Only Engine
              </span>
              <span className="text-xs text-zinc-300">|</span>
              <span className="text-xs text-[#64748B] font-medium">
                {selectedIds.length} of {recommendations.filter(r => !r.isNoStrongEnhancement).length} Enhancements Selected
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#064E3B]" />
              Dynamic Research Enhancement Engine
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Recommendations derived directly from verified paper limitations, evidence quotes, and research gaps
            </p>
          </div>

          {/* Paper Selector Dropdown */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#064E3B]">
                Active Study
              </span>
              <span className="text-xs font-semibold text-[#1E293B]">
                {currentPaper.year} IEEE Paper
              </span>
            </div>

            <select
              value={selectedPaperId}
              onChange={(e) => handleSelectPaper(e.target.value)}
              className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#064E3B] shadow-2xs"
            >
              {analyzedPapers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title.slice(0, 45)}... ({p.year})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills & Software-Only Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
            <span className="text-[11px] font-bold text-[#64748B] flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#064E3B]" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border
                  ${
                    selectedCategory === cat
                      ? 'bg-[#064E3B] text-white border-[#064E3B]'
                      : 'bg-[#F8FAFC] text-[#64748B] border-[#E8EAEF] hover:bg-zinc-100'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#064E3B] font-bold bg-[#F0F4F2] px-3 py-1.5 rounded-lg border border-[#CBD5E1] shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mode: Software-Only Implementation</span>
          </div>
        </div>
      </div>

      {/* Queue View Switcher Banner */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-2.5 shadow-2xs">
        <div className="flex items-center gap-2 px-3">
          <Layers className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Implementation Planning & Priority View
          </span>
        </div>

        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setQueueView('tree')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              queueView === 'tree'
                ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Visual Dependency Tree</span>
          </button>

          <button
            onClick={() => setQueueView('queue')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              queueView === 'queue'
                ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Interactive Priority Queue ({selectedIds.length})</span>
          </button>
        </div>
      </div>

      {/* Selected Enhancements Dependency Tree vs Drag & Drop Queue */}
      {queueView === 'tree' ? (
        <EnhancementDependencyTree
          paperId={currentPaper.id}
          recommendations={recommendations}
          selectedIds={selectedIds}
        />
      ) : (
        <SelectedEnhancementsDragDrop
          paperId={currentPaper.id}
          recommendations={recommendations}
          selectedIds={selectedIds}
        />
      )}

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E8EAEF] text-xs text-[#64748B] italic">
            No enhancements match the selected category filter.
          </div>
        ) : (
          filteredRecommendations.map((rec) => {
            const isSelected = selectedIds.includes(rec.id);
            const isNoEnhancement = rec.isNoStrongEnhancement;

            // Render Negative / Deferred Recommendation Card
            if (isNoEnhancement) {
              return (
                <div
                  key={rec.id}
                  className="bg-[#F8FAFC] rounded-2xl border border-dashed border-[#CBD5E1] p-5 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-zinc-200 text-zinc-700 uppercase flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-zinc-500" />
                      Deferred Recommendation
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Relevance Score: {rec.relevanceScore}%
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-800 mb-1">{rec.title}</h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {rec.rationale}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-100/80 border border-zinc-200 text-xs text-zinc-600 space-y-1">
                    <span className="font-bold text-zinc-700 text-[11px] uppercase tracking-wider block">
                      Negative Recommendation Assessment:
                    </span>
                    <p>{rec.noEnhancementReason || rec.relevanceBreakdown?.explanation}</p>
                  </div>
                </div>
              );
            }

            // Render Standard Software Enhancement Card
            return (
              <div
                key={rec.id}
                className={`
                  bg-white rounded-2xl border p-6 shadow-2xs transition-all space-y-4
                  ${
                    isSelected
                      ? 'border-[#064E3B] bg-[#F0F4F2]/30 ring-1 ring-[#064E3B]/20'
                      : 'border-[#E8EAEF] hover:border-[#CBD5E1]'
                  }
                `}
              >
                {/* Top Row: Checkbox, Name, Category, Relevance Score Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* Checkbox Trigger */}
                    <button
                      onClick={() => handleToggleSelect(rec.id)}
                      className={`
                        mt-0.5 w-6 h-6 rounded-md flex items-center justify-center transition-colors border shrink-0
                        ${
                          isSelected
                            ? 'bg-[#064E3B] text-white border-[#064E3B]'
                            : 'bg-white border-[#CBD5E1] hover:border-[#064E3B] text-transparent'
                        }
                      `}
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F0F4F2] text-[#064E3B] border border-[#CBD5E1]">
                          {rec.category}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          Feasibility: {rec.feasibility}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                          Impact: {rec.impact}
                        </span>
                      </div>

                      <h3
                        onClick={() => handleToggleSelect(rec.id)}
                        className="text-base font-bold text-[#1E293B] hover:text-[#064E3B] cursor-pointer transition-colors"
                      >
                        {rec.title}
                      </h3>
                    </div>
                  </div>

                  {/* Explainable Relevance Score Badge */}
                  <div className="text-right shrink-0">
                    <button
                      onClick={() => setExpandedBreakdownId(expandedBreakdownId === rec.id ? null : rec.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#F0F4F2] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#064E3B] text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Award className="w-3.5 h-3.5 text-[#064E3B]" />
                      <span>Relevance: {rec.relevanceScore}%</span>
                      {expandedBreakdownId === rec.id ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    <span className="block text-[9px] text-[#64748B] font-mono mt-0.5">
                      Click to explain score
                    </span>
                  </div>
                </div>

                {/* Score Breakdown Accordion */}
                {expandedBreakdownId === rec.id && rec.relevanceBreakdown && (
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-[#E8EAEF] pb-2">
                      <span className="font-bold text-[#1E293B] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-[#064E3B]" />
                        Explainable Relevance Scoring Model ({rec.relevanceScore}/100)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-2 rounded-lg bg-white border border-[#E8EAEF]">
                        <span className="block text-[10px] text-[#64748B]">Evidence Grounding</span>
                        <span className="text-sm font-bold text-[#064E3B]">
                          {rec.relevanceBreakdown.evidenceAlignment}/25
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-[#E8EAEF]">
                        <span className="block text-[10px] text-[#64748B]">Problem Directness</span>
                        <span className="text-sm font-bold text-[#064E3B]">
                          {rec.relevanceBreakdown.problemAlignment}/25
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-[#E8EAEF]">
                        <span className="block text-[10px] text-[#64748B]">Software Feasibility</span>
                        <span className="text-sm font-bold text-[#064E3B]">
                          {rec.relevanceBreakdown.feasibilityScore}/25
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-[#E8EAEF]">
                        <span className="block text-[10px] text-[#64748B]">Implementation Relevance</span>
                        <span className="text-sm font-bold text-[#064E3B]">
                          {rec.relevanceBreakdown.implementationRelevance}/25
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#64748B] leading-relaxed italic bg-white p-2.5 rounded-lg border border-[#E8EAEF]">
                      "{rec.relevanceBreakdown.explanation}"
                    </p>
                  </div>
                )}

                {/* Main Recommendation Content Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left Column: Problem & Rationale */}
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF]">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-0.5">
                        Addresses Limitation / Gap
                      </span>
                      <p className="text-xs font-semibold text-[#1E293B]">
                        {rec.rationale}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF]">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-0.5">
                        Implementation Approach
                      </span>
                      <p className="text-xs text-[#64748B]">
                        {rec.implementationApproach}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Dependencies & Expected Benefit */}
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF]">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-1">
                        Dependencies & Software Requirements
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(rec.dependencies || []).map((dep, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0F4F2] text-[#064E3B] border border-[#CBD5E1]"
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF]">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-0.5">
                        Expected Benefit & Validation Target
                      </span>
                      <p className="text-xs text-[#1E293B] font-medium">
                        {rec.expectedBenefit}
                      </p>
                      <span className="block text-[10px] font-mono text-[#064E3B] font-bold mt-1">
                        Metric: {rec.validationMetric}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Traceability Link Accordion */}
                <div>
                  <button
                    onClick={() => setExpandedTraceabilityId(expandedTraceabilityId === rec.id ? null : rec.id)}
                    className="text-xs font-bold text-[#064E3B] hover:underline flex items-center gap-1"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>
                      {expandedTraceabilityId === rec.id ? 'Hide Traceability Link' : 'Show Full Traceability Chain (Paper -> Module)'}
                    </span>
                    {expandedTraceabilityId === rec.id ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  {expandedTraceabilityId === rec.id && rec.traceabilityLink && (
                    <div className="mt-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[11px] space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#064E3B]">
                        <span>Full Evidence Traceability Flow</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Verified Complete
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left text-[11px] font-medium">
                        <span className="p-1.5 rounded bg-white border border-[#E8EAEF] text-[#1E293B] shrink-0">
                          Paper Evidence Quote
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#64748B] shrink-0 hidden sm:block" />
                        <span className="p-1.5 rounded bg-white border border-[#E8EAEF] text-[#1E293B] shrink-0">
                          {rec.traceabilityLink.limitation.slice(0, 20)}...
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#64748B] shrink-0 hidden sm:block" />
                        <span className="p-1.5 rounded bg-[#064E3B] text-white shrink-0 font-bold">
                          {rec.traceabilityLink.newSoftwareModule}
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#64748B] shrink-0 hidden sm:block" />
                        <span className="p-1.5 rounded bg-white border border-[#E8EAEF] text-[#064E3B] font-bold shrink-0">
                          Validation Metric
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls: View Evidence & Selection Button */}
                <div className="pt-4 border-t border-[#E8EAEF] flex items-center justify-between">
                  <button
                    onClick={() => handleViewEvidence(rec)}
                    className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-zinc-100 border border-[#E8EAEF] text-[#1E293B] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#064E3B]" />
                    <span>View Grounded Evidence Quote</span>
                  </button>

                  <button
                    onClick={() => handleToggleSelect(rec.id)}
                    className={`
                      px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs
                      ${
                        isSelected
                          ? 'bg-[#064E3B] text-white hover:bg-[#053F2F]'
                          : 'bg-[#F0F4F2] text-[#064E3B] hover:bg-[#E2E8F0] border border-[#CBD5E1]'
                      }
                    `}
                  >
                    {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{isSelected ? 'Selected for Validation' : 'Select Enhancement'}</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-4 left-4 right-4 md:left-64 z-30 pointer-events-none">
        <div className="max-w-5xl mx-auto bg-[#1E293B] text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 pointer-events-auto border border-zinc-700 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#064E3B] flex items-center justify-center text-white font-bold text-sm">
              {selectedIds.length}
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                Selected Research Enhancements
              </p>
              <p className="text-[11px] text-zinc-400">
                {selectedIds.length > 0
                  ? 'Ready for software validation phase'
                  : 'Check at least one enhancement to continue'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsApprovalModalOpen(true)}
            disabled={selectedIds.length === 0}
            className="px-5 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#053F2F] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <span>Approve & Continue to Validation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation & Approval Modal */}
      {isApprovalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8EAEF] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#E8EAEF]">
                <div className="w-10 h-10 rounded-xl bg-[#F0F4F2] text-[#064E3B] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">
                    Confirm Approved Enhancements
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {selectedIds.length} software module(s) selected for validation
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedRecommendations.map((rec, idx) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#1E293B]">
                        {idx + 1}. {rec.title}
                      </p>
                      <span className="text-[10px] text-[#64748B]">
                        Module: {rec.traceabilityLink?.newSoftwareModule || rec.category}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                      Score {rec.relevanceScore}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-[#F0F4F2] border border-[#CBD5E1] text-xs text-[#064E3B] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <p>
                  Upon approval, these enhancements will become active parts of your project proposal and proceed to automated performance metric validation.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8EAEF]">
                <button
                  onClick={() => setIsApprovalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveAndContinue}
                  className="px-5 py-2 rounded-xl bg-[#064E3B] hover:bg-[#053F2F] text-white text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <span>Approve & Proceed to Validation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Viewer Modal */}
      <EvidenceModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
};
