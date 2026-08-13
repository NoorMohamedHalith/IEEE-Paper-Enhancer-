import React from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { ProvenanceBadge } from './ProvenanceBadge';
import { ShieldCheck, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, Layers, HelpCircle, Activity } from 'lucide-react';

export const ResearchIntegrityPanel: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { activePaper } = usePaperContext();

  if (!activePaper || !activePaper.analysis) {
    return (
      <div className={`p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 text-center ${className}`}>
        No active paper analyzed. Upload an IEEE research paper to activate the Research Integrity Panel.
      </div>
    );
  }

  const analysis = activePaper.analysis;
  const rawText = activePaper.rawText || '';

  // 1. Evidence Links Count
  const evidenceCount = (analysis.evidences || []).length;
  const verifiedEvidenceCount = (analysis.evidences || []).filter((e) => e.quoteOrExcerpt && e.quoteOrExcerpt.trim().length > 5).length;

  // 2. Paper Reported Metrics
  const paperReportedMetricsCount = (analysis.results || []).length;

  // 3. AI Inferences Count
  const aiInferredCount = (analysis.limitations || []).filter((l) => l.type === 'INFERRED').length +
    (analysis.evidences || []).filter((e) => e.sourceType === 'INFERRED').length;

  // 4. Proposed Enhancements
  const proposedEnhancementsCount = (analysis.recommendations || []).length;

  // 5. Estimated Results
  const estimatedResultsCount = (activePaper.predictionMetrics || []).filter((m) => m.status === 'ESTIMATED').length;

  // 6. Measured Results
  const measuredResultsCount = (activePaper.predictionMetrics || []).filter((m) => m.status === 'MEASURED').length;

  // 7. Incomplete Links
  const unverifiedClaimsCount = (analysis.claimVerifications || []).filter((c) => !c.isVerified).length;

  // 8. Overall Validation Status
  const isFullyValidated = (activePaper.validatedEnhancementIds?.length || 0) > 0 && unverifiedClaimsCount === 0;
  const validationStatus = measuredResultsCount > 0
    ? 'MEASURED & PASSED'
    : isFullyValidated
    ? 'PASSED'
    : estimatedResultsCount > 0
    ? 'ESTIMATED ONLY'
    : 'READY FOR BENCHMARK';

  return (
    <div className={`bg-white rounded-2xl border border-zinc-200 shadow-md p-5 space-y-4 font-sans ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-800 text-white rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Research Integrity Dashboard
            </h3>
            <p className="text-[10px] text-zinc-500">
              100% Dynamic Evidence Provenance & Claim Audit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
              validationStatus.includes('MEASURED') || validationStatus === 'PASSED'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : validationStatus === 'ESTIMATED ONLY'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-blue-100 text-blue-900 border-blue-300'
            }`}
          >
            STATUS: {validationStatus}
          </span>
        </div>
      </div>

      {/* Metric Tiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {/* Tile 1 */}
        <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center space-y-0.5">
          <span className="text-[10px] font-bold text-emerald-800 block uppercase">Evidence</span>
          <span className="text-sm font-extrabold text-emerald-950 block">✓ {verifiedEvidenceCount} Links</span>
          <ProvenanceBadge type="EXPLICIT" size="sm" showIcon={false} />
        </div>

        {/* Tile 2 */}
        <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-200 text-center space-y-0.5">
          <span className="text-[10px] font-bold text-teal-800 block uppercase">Paper Metrics</span>
          <span className="text-sm font-extrabold text-teal-950 block">✓ {paperReportedMetricsCount} Reported</span>
          <ProvenanceBadge type="PAPER_REPORTED" size="sm" showIcon={false} />
        </div>

        {/* Tile 3 */}
        <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-200 text-center space-y-0.5">
          <span className="text-[10px] font-bold text-purple-800 block uppercase">AI Inferences</span>
          <span className="text-sm font-extrabold text-purple-950 block">ℹ {aiInferredCount} Inferred</span>
          <ProvenanceBadge type="AI_INFERRED" size="sm" showIcon={false} />
        </div>

        {/* Tile 4 */}
        <div className="p-2.5 rounded-xl bg-cyan-50/60 border border-cyan-200 text-center space-y-0.5">
          <span className="text-[10px] font-bold text-cyan-800 block uppercase">Enhancements</span>
          <span className="text-sm font-extrabold text-cyan-950 block">✓ {proposedEnhancementsCount} Proposed</span>
          <ProvenanceBadge type="PROPOSED" size="sm" showIcon={false} />
        </div>

        {/* Tile 5 */}
        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-center space-y-0.5">
          <span className="text-[10px] font-bold text-amber-800 block uppercase">Estimates</span>
          <span className="text-sm font-extrabold text-amber-950 block">⚠ {estimatedResultsCount} Estimated</span>
          <ProvenanceBadge type="ESTIMATED" size="sm" showIcon={false} />
        </div>

        {/* Tile 6 */}
        <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-center space-y-0.5">
          <span className="text-[10px] font-bold text-emerald-900 block uppercase">Measured</span>
          <span className="text-sm font-extrabold text-emerald-950 block">✓ {measuredResultsCount} Benchmarked</span>
          <ProvenanceBadge type="MEASURED" size="sm" showIcon={false} />
        </div>

        {/* Tile 7 */}
        <div className={`p-2.5 rounded-xl border text-center space-y-0.5 ${unverifiedClaimsCount > 0 ? 'bg-red-50 border-red-200' : 'bg-zinc-50 border-zinc-200'}`}>
          <span className="text-[10px] font-bold text-zinc-600 block uppercase">Incomplete Links</span>
          <span className={`text-sm font-extrabold block ${unverifiedClaimsCount > 0 ? 'text-red-700' : 'text-zinc-800'}`}>
            {unverifiedClaimsCount > 0 ? `⚠ ${unverifiedClaimsCount} Claims` : '✓ 0 Broken'}
          </span>
          <ProvenanceBadge type={unverifiedClaimsCount > 0 ? 'UNVERIFIED' : 'PAPER_REPORTED'} size="sm" showIcon={false} />
        </div>

        {/* Tile 8 */}
        <div className="p-2.5 rounded-xl bg-zinc-900 text-white border border-zinc-800 text-center space-y-0.5">
          <span className="text-[10px] font-bold text-zinc-400 block uppercase">Quality Score</span>
          <span className="text-sm font-extrabold text-emerald-400 block">
            {activePaper.qualityScoreBreakdown?.overallScore !== undefined
              ? `${activePaper.qualityScoreBreakdown.overallScore} / 100`
              : 'NOT CALCULATED'}
          </span>
          <span className="text-[9px] font-bold text-zinc-300 block">
            GRADE {activePaper.qualityScoreBreakdown?.grade || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};
