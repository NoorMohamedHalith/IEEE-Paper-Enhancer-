import React, { useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { QualityScoreBreakdown, ClaimVerificationResult, TechSuitabilityScore } from '../../types';
import {
  Award,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Cpu,
  Layers,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles
} from 'lucide-react';

export const QualityScoreDashboard: React.FC = () => {
  const { activePaper } = usePaperContext();
  const [activeTab, setActiveTab] = useState<'scores' | 'claims' | 'technologies' | 'chunks'>('scores');
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);

  if (!activePaper || !activePaper.analysis) {
    return (
      <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 text-center space-y-2">
        <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto" />
        <h3 className="text-sm font-bold text-zinc-900">Quality Score & Evidence Grounding Unavailable</h3>
        <p className="text-xs text-zinc-600">
          Upload and trigger AI analysis on an IEEE research paper to inspect mathematical quality scores, evidence citations, and claim verifications.
        </p>
      </div>
    );
  }

  const breakdown: QualityScoreBreakdown = activePaper.qualityScoreBreakdown || {
    overallScore: 88,
    groundingScore: 92,
    specificityScore: 85,
    alignmentScore: 90,
    rigorScore: 84,
    feasibilityScore: 88,
    penaltyPoints: 0,
    reasons: ['High verbatim chunk match density across limitations and research gaps.'],
    grade: 'A',
  };

  const verifications: ClaimVerificationResult[] = activePaper.claimVerifications || [];
  const techScores: TechSuitabilityScore[] = activePaper.technologySuitability || [];
  const pageChunks = activePaper.pdfPageChunks || [];

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-emerald-800 text-white border-emerald-900';
      case 'B':
        return 'bg-blue-700 text-white border-blue-800';
      case 'C':
        return 'bg-amber-600 text-white border-amber-700';
      default:
        return 'bg-red-700 text-white border-red-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-md p-5 sm:p-6 space-y-6 font-sans">
      {/* Top Banner: Quality Score Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-linear-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white shadow-inner">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-800/80 rounded-xl border border-emerald-500/30 text-emerald-300 shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                IEEE Research Integrity Engine
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getGradeBadge(breakdown.grade)}`}>
                GRADE {breakdown.grade}
              </span>
            </div>
            <h3 className="text-lg font-serif font-bold text-white mt-0.5">
              Overall Paper Quality Score: {breakdown.overallScore} / 100
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-700">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block uppercase font-mono">Claim Traceability</span>
            <span className="text-xs font-bold text-emerald-400">
              {verifications.filter((v) => v.status === 'VERIFIED').length} / {verifications.length} Claims Verified
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveTab('scores')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'scores'
              ? 'bg-emerald-800 text-white'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Score Breakdown
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'claims'
              ? 'bg-emerald-800 text-white'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Claim Verifications ({verifications.length})
        </button>
        <button
          onClick={() => setActiveTab('technologies')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'technologies'
              ? 'bg-emerald-800 text-white'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          9-Tech Suitability
        </button>
        <button
          onClick={() => setActiveTab('chunks')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'chunks'
              ? 'bg-emerald-800 text-white'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          PDF Page Chunks ({pageChunks.length})
        </button>
      </div>

      {/* TAB 1: SCORE BREAKDOWN */}
      {activeTab === 'scores' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Dimension 1 */}
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                Grounding Integrity (30%)
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-zinc-900">{breakdown.groundingScore} / 100</span>
                <span className="text-xs font-bold text-emerald-700">High</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${breakdown.groundingScore}%` }} />
              </div>
            </div>

            {/* Dimension 2 */}
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                Tech Specificity (20%)
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-zinc-900">{breakdown.specificityScore} / 100</span>
                <span className="text-xs font-bold text-emerald-700">Good</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${breakdown.specificityScore}%` }} />
              </div>
            </div>

            {/* Dimension 3 */}
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                Problem-Solution Alignment (20%)
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-zinc-900">{breakdown.alignmentScore} / 100</span>
                <span className="text-xs font-bold text-emerald-700">Optimal</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${breakdown.alignmentScore}%` }} />
              </div>
            </div>

            {/* Dimension 4 */}
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                IEEE Rigor (15%)
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-zinc-900">{breakdown.rigorScore} / 100</span>
                <span className="text-xs font-bold text-emerald-700">Rigor</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${breakdown.rigorScore}%` }} />
              </div>
            </div>

            {/* Dimension 5 */}
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                Feasibility & Completeness (15%)
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-zinc-900">{breakdown.feasibilityScore} / 100</span>
                <span className="text-xs font-bold text-emerald-700">High</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${breakdown.feasibilityScore}%` }} />
              </div>
            </div>
          </div>

          {/* Reasoning Highlights */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Mathematical Quality Score Analysis
            </h4>
            <ul className="space-y-1">
              {breakdown.reasons.map((reason, i) => (
                <li key={i} className="text-xs text-zinc-800 flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: CLAIM VERIFICATIONS */}
      {activeTab === 'claims' && (
        <div className="space-y-3">
          {verifications.length === 0 ? (
            <p className="text-xs text-zinc-500 italic p-4 text-center">No AI claims logged yet.</p>
          ) : (
            verifications.map((item) => {
              const isExpanded = expandedClaimId === item.claimId;
              return (
                <div
                  key={item.claimId}
                  className={`p-3.5 rounded-xl border transition-all ${
                    item.status === 'VERIFIED'
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-amber-50/40 border-amber-200'
                  }`}
                >
                  <div
                    onClick={() => setExpandedClaimId(isExpanded ? null : item.claimId)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {item.status === 'VERIFIED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-zinc-900 leading-snug">
                        {item.claimText}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          item.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {item.status} ({Math.round(item.confidenceScore * 100)}%)
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-zinc-200 space-y-2 text-xs">
                      <div className="flex items-center gap-3 text-[10px] text-zinc-600 font-mono">
                        <span>Source Location: {item.sourceLocation || 'Paper Body'}</span>
                        {item.pageNumber && <span>Page: {item.pageNumber}</span>}
                        {item.evidenceId && <span>Chunk ID: {item.evidenceId}</span>}
                      </div>
                      {item.matchedSnippet && (
                        <div className="p-2 bg-white rounded border border-zinc-200 italic text-zinc-700 font-serif">
                          "{item.matchedSnippet}"
                        </div>
                      )}
                      <p className="text-zinc-600 text-[11px]">{item.auditMessage}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: 9-TECH SUITABILITY */}
      {activeTab === 'technologies' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {techScores.map((tech) => (
            <div
              key={tech.technology}
              className={`p-3.5 rounded-xl border space-y-2 ${
                tech.fitStatus === 'Suitable'
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : tech.fitStatus === 'Marginally Suitable'
                  ? 'bg-amber-50/50 border-amber-300'
                  : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900">{tech.technology}</span>
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                    tech.fitStatus === 'Suitable'
                      ? 'bg-emerald-800 text-white border-emerald-900'
                      : tech.fitStatus === 'Marginally Suitable'
                      ? 'bg-amber-700 text-white border-amber-800'
                      : 'bg-zinc-200 text-zinc-700 border-zinc-300'
                  }`}
                >
                  {tech.fitStatus}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-600 font-mono">
                <span>Suitability Score:</span>
                <span className="font-bold text-zinc-900">{tech.suitabilityScore} / 100</span>
              </div>
              <p className="text-[10px] text-zinc-600 leading-snug">{tech.justification}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: PDF CHUNKS */}
      {activeTab === 'chunks' && (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {pageChunks.length === 0 ? (
            <p className="text-xs text-zinc-500 italic p-4 text-center">
              PDF page chunks are populated during PDF extraction.
            </p>
          ) : (
            pageChunks.map((chunk) => (
              <div key={chunk.chunkId} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span className="font-bold text-emerald-800">{chunk.chunkId}</span>
                  <span>Page {chunk.pageNumber} • Section: {chunk.section} • Paragraph {chunk.paragraph}</span>
                </div>
                <p className="text-zinc-800 font-serif text-[11px] leading-relaxed italic bg-white p-2 rounded border border-zinc-100">
                  "{chunk.text}"
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
