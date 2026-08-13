import React, { useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { downloadElementAsPDF, triggerPrint } from '../../utils/printUtils';
import { WorkflowStepper } from '../layout/WorkflowStepper';
import { EmptyStateCard } from '../common/EmptyStateCard';
import { EvidenceModal } from '../common/EvidenceModal';
import { InsightFeedbackControl } from '../common/InsightFeedbackControl';
import { AnalysisDashboard } from '../analysis/AnalysisDashboard';
import { PaperEvidence } from '../../types';
import {
  FileSearch,
  BookOpen,
  AlertCircle,
  Database,
  Award,
  HelpCircle,
  Layers,
  ArrowRight,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  FileText,
  Target,
  Sparkles,
  Info,
  Download,
  Printer,
  BarChart3
} from 'lucide-react';

export const PaperAnalysisPage: React.FC = () => {
  const {
    activePaper,
    setIsUploadModalOpen,
    triggerAnalysis,
    isAnalyzing,
    analysisStage,
    analysisError,
    setActiveTab
  } = usePaperContext();

  const [activeTabSection, setActiveTabSection] = useState<string>('all');
  const [selectedEvidence, setSelectedEvidence] = useState<PaperEvidence | null>(null);

  // Failure state view
  if (activePaper && activePaper.status === 'Failed') {
    return (
      <div className="space-y-6">
        <WorkflowStepper />

        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-2xl mx-auto space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1E293B]">
            AI analysis could not be completed.
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            {analysisError || 'The Gemini AI analysis pipeline encountered an issue parsing or validating the paper text layer.'}
          </p>

          <div className="pt-2">
            <button
              onClick={() => triggerAnalysis(activePaper.id)}
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#053F2F] text-white text-xs font-bold flex items-center gap-2 mx-auto shadow-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Analysis</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Analysis Stage Progress View
  if (isAnalyzing || (activePaper && activePaper.status === 'Analyzing')) {
    const stages = [
      'Extracted',
      'Analyzing structure',
      'Analyzing methodology',
      'Detecting limitations',
      'Finding research gaps',
      'Generating analysis',
      'Validating output',
      'Complete'
    ];

    const currentIdx = stages.indexOf(analysisStage || 'Extracted');

    return (
      <div className="space-y-6">
        <WorkflowStepper />

        <div className="bg-white rounded-2xl border border-[#E8EAEF] p-8 max-w-2xl mx-auto space-y-6 shadow-2xs text-center">
          <div className="w-12 h-12 rounded-full bg-[#F0F4F2] text-[#064E3B] flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>

          <div>
            <h3 className="text-base font-bold text-[#1E293B]">
              Executing Evidence-Grounded AI Analysis
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Analyzing paper text chunks strictly without inventing facts
            </p>
          </div>

          {/* Real Stage Progression Tracker */}
          <div className="space-y-2 text-left bg-[#F8FAFC] p-4 rounded-xl border border-[#E8EAEF]">
            {stages.map((stg, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div key={stg} className="flex items-center gap-3 text-xs">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isPast
                        ? 'bg-[#064E3B] text-white'
                        : isCurrent
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-zinc-200 text-zinc-500'
                    }`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`font-medium ${
                      isCurrent
                        ? 'text-[#064E3B] font-bold'
                        : isPast
                        ? 'text-[#1E293B]'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    {stg}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Awaiting Analysis / Empty State Check
  if (!activePaper || activePaper.status !== 'Analyzed' || !activePaper.analysis) {
    return (
      <div className="space-y-6">
        <WorkflowStepper />

        <EmptyStateCard
          icon={FileSearch}
          title="Paper Analysis Awaiting Input"
          message="Paper analysis will appear after a paper is uploaded and analyzed."
          actionButton={
            activePaper && activePaper.status === 'Awaiting analysis'
              ? {
                  label: 'Analyze Current Paper',
                  onClick: () => triggerAnalysis(activePaper.id),
                }
              : {
                  label: 'Upload Paper to Analyze',
                  onClick: () => setIsUploadModalOpen(true),
                }
          }
        />
      </div>
    );
  }

  const { analysis } = activePaper;
  const evidences = analysis.evidences || [];

  const findEvidence = (id?: string) => evidences.find((e) => e.id === id) || evidences[0] || null;

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `IEEE_Analysis_${activePaper.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfStatus, setPdfStatus] = useState('');

  const handlePrintPDF = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    const originalTabSection = activeTabSection;
    setActiveTabSection('all');
    setPdfStatus('Generating PDF...');
    await new Promise((resolve) => setTimeout(resolve, 150));
    const filename = `IEEE_Paper_Analysis_${activePaper?.id?.slice(0, 8) || 'Report'}.pdf`;
    await downloadElementAsPDF('printable-paper-analysis', filename, (msg) => setPdfStatus(msg));
    setActiveTabSection(originalTabSection);
    setIsGeneratingPDF(false);
  };

  return (
    <div id="printable-paper-analysis" className="space-y-6">
      <WorkflowStepper />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E8EAEF] p-6 shadow-2xs print:border-none print:shadow-none">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E8EAEF]">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#F0F4F2] text-[#064E3B] border border-[#CBD5E1]">
                Evidence-Grounded IEEE Analysis
              </span>
              <span className="text-xs text-zinc-300">|</span>
              <span className="text-xs text-[#64748B]">
                Analyzed {new Date(analysis.analyzedAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#1E293B]">
              {analysis.paperInformation?.title || 'IEEE Paper'}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Authors: {(analysis.paperInformation?.authors || []).join(', ')} • Year: {analysis.paperInformation?.year || 'N/A'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap print:hidden">
            <button
              onClick={handleExportJSON}
              className="px-3 py-2 rounded-lg bg-[#F8FAFC] hover:bg-[#F0F4F2] text-[#1E293B] text-xs font-semibold border border-[#E8EAEF] flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#064E3B]" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handlePrintPDF}
              disabled={isGeneratingPDF}
              className="px-3 py-2 rounded-lg bg-[#F8FAFC] hover:bg-[#F0F4F2] text-[#1E293B] text-xs font-semibold border border-[#E8EAEF] flex items-center gap-1.5 transition-colors disabled:opacity-60"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#064E3B]" />
              ) : (
                <Printer className="w-3.5 h-3.5 text-[#064E3B]" />
              )}
              <span>{isGeneratingPDF ? (pdfStatus || 'Generating PDF...') : 'Download PDF'}</span>
            </button>

            <button
              onClick={() => setActiveTab('gaps')}
              className="px-4 py-2 rounded-lg bg-[#064E3B] hover:bg-[#053F2F] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <span>Proceed to Research Gaps</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-1.5 pt-4 overflow-x-auto text-xs print:hidden">
          {[
            { id: 'all', label: 'All Sections' },
            { id: 'dashboard', label: 'Summary Dashboard' },
            { id: 'summary', label: 'Summary & Problem' },
            { id: 'methodology', label: 'Methodology Grid' },
            { id: 'results', label: 'Reported Results' },
            { id: 'limitations', label: 'Limitations & Evidence' },
            { id: 'gaps', label: 'Research Gaps' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveTabSection(sec.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                activeTabSection === sec.id
                  ? 'bg-[#064E3B] text-white'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F0F4F2]'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Summary Dashboard */}
      {(activeTabSection === 'all' || activeTabSection === 'dashboard') && (
        <AnalysisDashboard analysis={analysis} />
      )}

      {/* Main Analysis Sections */}
      <div className="space-y-6">

        {/* Paper Summary & Problem Statement */}
        {(activeTabSection === 'all' || activeTabSection === 'summary') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Paper Summary */}
            <div className="bg-white rounded-xl border border-[#E8EAEF] p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#064E3B]" />
                Paper Summary
              </h3>
              <p className="text-xs text-[#1E293B] leading-relaxed">
                {analysis.paperSummary}
              </p>

              {analysis.objectives && analysis.objectives.length > 0 && (
                <div className="pt-2 border-t border-[#E8EAEF]">
                  <h4 className="text-[11px] font-bold text-[#1E293B] mb-1.5 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#064E3B]" />
                    Research Objectives
                  </h4>
                  <ul className="space-y-1 pl-4 list-disc text-xs text-[#64748B]">
                    {analysis.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Core Research Problem */}
            <div className="bg-white rounded-xl border border-[#E8EAEF] p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#064E3B]" />
                Core Problem Statement
              </h3>
              <p className="text-xs text-[#1E293B] dark:text-zinc-200 leading-relaxed">
                {analysis.problemStatement}
              </p>

              {evidences.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedEvidence(evidences[0])}
                    className="px-2.5 py-1 rounded bg-[#F0F4F2] dark:bg-emerald-950/80 hover:bg-[#E2E8F0] text-[#064E3B] dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-colors border border-emerald-200 dark:border-emerald-800"
                  >
                    <FileText className="w-3 h-3" />
                    <span>[View Source Evidence]</span>
                  </button>
                </div>
              )}

              <InsightFeedbackControl
                itemId="core_problem"
                itemType="summary"
                itemTitle="Core Problem Statement"
              />
            </div>

          </div>
        )}

        {/* Structured Methodology Breakdown Grid */}
        {(activeTabSection === 'all' || activeTabSection === 'methodology') && (
          <div className="bg-white rounded-xl border border-[#E8EAEF] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EAEF]">
              <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#064E3B]" />
                Methodology & System Architecture Breakdown
              </h3>
              <span className="text-[11px] text-[#64748B]">
                Grounded Extraction
              </span>
            </div>

            {typeof analysis.methodology === 'object' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'System Input', value: analysis.methodology.input },
                  { label: 'Processing Logic', value: analysis.methodology.processing },
                  { label: 'Core Algorithm', value: analysis.methodology.algorithm },
                  { label: 'System Output', value: analysis.methodology.output },
                  { label: 'Architecture Framework', value: analysis.methodology.architecture },
                  { label: 'Dataset Specification', value: analysis.methodology.dataset },
                  { label: 'Evaluation Method', value: analysis.methodology.evaluation },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                      {item.label}
                    </span>
                    <p className={`text-xs ${item.value === 'NOT_FOUND' ? 'text-zinc-400 italic' : 'text-[#1E293B] font-medium'}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#1E293B]">{analysis.methodology}</p>
            )}

            {/* Tech Stack & Algorithms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#E8EAEF]">
              <div>
                <h4 className="text-xs font-bold text-[#1E293B] mb-2">Named Algorithms</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(analysis.algorithms || []).length > 0 ? (
                    (analysis.algorithms || []).map((alg, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-[#F8FAFC] text-[#1E293B] text-xs font-medium border border-[#E8EAEF]">
                        {alg}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-400 italic">NOT_FOUND</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#1E293B] mb-2">Technologies & Libraries</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(analysis.technologies || []).length > 0 ? (
                    (analysis.technologies || []).map((tech, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-[#F0F4F2] text-[#064E3B] text-xs font-medium border border-[#CBD5E1]">
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-400 italic">NOT_FOUND</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reported Results */}
        {(activeTabSection === 'all' || activeTabSection === 'results') && (
          <div className="bg-white rounded-xl border border-[#E8EAEF] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EAEF]">
              <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-[#064E3B]" />
                Actual Reported Results (Unfabricated)
              </h3>
              <span className="text-[11px] text-[#64748B]">
                Only metrics directly present in text
              </span>
            </div>

            {Array.isArray(analysis.results) && analysis.results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {analysis.results.map((resItem, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E293B]">{resItem.metric}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#064E3B] text-white">
                        {resItem.value}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      Source: {resItem.source} (Page {resItem.page})
                    </p>

                    {resItem.evidenceId && (
                      <button
                        onClick={() => setSelectedEvidence(findEvidence(resItem.evidenceId))}
                        className="text-[10px] text-[#064E3B] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 pt-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>[View Evidence]</span>
                      </button>
                    )}

                    <InsightFeedbackControl
                      itemId={`res_${idx}`}
                      itemType="result"
                      itemTitle={resItem.metric}
                      compact
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic">
                No quantitative performance metrics were reported in the provided text layer.
              </p>
            )}
          </div>
        )}

        {/* Limitations & Evidence */}
        {(activeTabSection === 'all' || activeTabSection === 'limitations') && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                Limitations & Constraints Grounding
              </h3>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {(analysis.limitations || []).length} Detected Limitations
              </span>
            </div>

            <div className="space-y-3">
              {(analysis.limitations || []).map((lim) => {
                const matchedEv = findEvidence(lim.evidenceIds?.[0]);

                return (
                  <div key={lim.id} className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            lim.type === 'EXPLICIT'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {lim.type} LIMITATION
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                          Confidence: {lim.confidence}
                        </span>
                      </div>

                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Page {lim.page} • {lim.section}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{lim.title}</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{lim.explanation}</p>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setSelectedEvidence(matchedEv)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-200 dark:border-emerald-800"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>[View Evidence]</span>
                      </button>
                    </div>

                    <InsightFeedbackControl
                      itemId={lim.id}
                      itemType="limitation"
                      itemTitle={lim.title}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Research Gaps Section */}
        {(activeTabSection === 'all' || activeTabSection === 'gaps') && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                Evidence-Backed Research Gaps
              </h3>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {(analysis.researchGaps || []).length} Actionable Gaps
              </span>
            </div>

            <div className="space-y-3">
              {(analysis.researchGaps || []).map((gap) => {
                const matchedEv = findEvidence(gap.evidenceIds?.[0]);

                return (
                  <div key={gap.id} className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-800 dark:bg-emerald-700 text-white uppercase">
                          {gap.gapType}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                          Confidence: {gap.confidence}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{gap.title}</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{gap.explanation}</p>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setSelectedEvidence(matchedEv)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-200 dark:border-emerald-800"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>[View Evidence]</span>
                      </button>
                    </div>

                    <InsightFeedbackControl
                      itemId={gap.id}
                      itemType="research_gap"
                      itemTitle={gap.title}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Evidence Viewer Modal */}
      <EvidenceModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
};
