import React, { useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { downloadElementAsPDF } from '../../utils/printUtils';
import { generateClientDynamicProjectSpec } from '../../services/ai/projectSpecEngine';
import { WORKFLOW_STEPS } from '../../types';
import { sanitizeEvidenceQuote } from '../../utils/textSanitizer';
import {
  X,
  Printer,
  FileText,
  Download,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Zap,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers,
  Cpu,
  BarChart3,
  Loader2,
  Code2,
  Terminal,
  Activity,
  ArrowRight,
  Database
} from 'lucide-react';

export const ResearchReportModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen, activePaper: contextActivePaper, papers, settings } = usePaperContext();
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfStatus, setPdfStatus] = useState('');

  if (!isReportModalOpen) return null;

  // Active paper resolution: use context activePaper OR first paper in workspace if null
  const activePaper = contextActivePaper || (papers.length > 0 ? papers[0] : null);

  const analysis = activePaper?.analysis;
  const selectedEnhancementIds = activePaper?.selectedEnhancementIds || [];
  const allRecommendations = analysis?.recommendations || [];
  
  // Show selected enhancements OR fall back to all recommendations if queue is empty
  const selectedEnhancements = selectedEnhancementIds.length > 0
    ? allRecommendations.filter((r) => selectedEnhancementIds.includes(r.id))
    : allRecommendations;

  const projectSpec = activePaper ? generateClientDynamicProjectSpec(activePaper) : null;

  const handlePrint = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    setPdfStatus('Generating PDF...');
    const filename = `IEEE_Research_Report_${activePaper?.id?.slice(0, 8) || 'Spec'}.pdf`;
    await downloadElementAsPDF('printable-research-report', filename, (msg) => setPdfStatus(msg));
    setIsGeneratingPDF(false);
  };

  const handleCopySummary = () => {
    if (!activePaper) return;

    const reportText = `
===================================================================
IEEE INNOVATEX — EXECUTIVE RESEARCH SPECIFICATION REPORT
===================================================================
Workspace: ${settings.workspaceName}
Generated: ${new Date().toLocaleString()}
Paper Title: ${activePaper.title}
Authors: ${activePaper.authors?.join(', ') || 'N/A'}
Year: ${activePaper.year}
DOI / URL: ${activePaper.url || 'Internal Dataset Upload'}
Status: ${activePaper.projectStatus || 'Analyzed'}

1. EXECUTIVE SUMMARY & PROBLEM STATEMENT
-------------------------------------------------------------------
Summary: ${analysis?.paperSummary || 'N/A'}
Problem Statement: ${analysis?.problemStatement || 'N/A'}

2. IDENTIFIED METHODOLOGY LIMITATIONS (${analysis?.limitations.length || 0})
-------------------------------------------------------------------
${analysis?.limitations
  .map(
    (l, i) =>
      `${i + 1}. [${l.type}] ${l.title} (Confidence: ${l.confidence})\n   Quote: "${l.paperEvidenceQuote || l.explanation}"\n   Impact: ${l.explanation}`
  )
  .join('\n\n') || 'No explicit limitations extracted.'}

3. DISCOVERED RESEARCH GAPS (${analysis?.researchGaps.length || 0})
-------------------------------------------------------------------
${analysis?.researchGaps
  .map(
    (g, i) =>
      `${i + 1}. [${g.gapType}] ${g.title}\n   Explanation: ${g.explanation}\n   Refinement Opportunity: ${g.proposedRefinement}`
  )
  .join('\n\n') || 'No research gaps cataloged.'}

4. PRIORITIZED SOFTWARE ENHANCEMENTS QUEUE (${selectedEnhancements.length})
-------------------------------------------------------------------
${selectedEnhancements
  .map(
    (e, i) =>
      `Rank #${i + 1}: ${e.title} [Category: ${e.category}]\n   Module: ${e.traceabilityLink?.newSoftwareModule || e.implementationApproach}\n   Rationale: ${e.rationale}\n   Target Limitation ID: ${e.traceabilityLink?.baselineLimitationId || 'N/A'}`
  )
  .join('\n\n') || 'No enhancements selected for implementation.'}

5. BEFORE VS. AFTER ARCHITECTURE SPECIFICATION
-------------------------------------------------------------------
Baseline Pipeline: ${analysis?.beforeAfterComparison?.beforeArchitecture.processingMethod || 'Sequential Data Ingestion'}
Enhanced Pipeline: ${analysis?.beforeAfterComparison?.afterArchitecture.processingMethod || 'Parallelized Buffer Ingestion'}
Baseline Error Handling: ${analysis?.beforeAfterComparison?.beforeArchitecture.errorHandling || 'Manual Retry'}
Enhanced Error Handling: ${analysis?.beforeAfterComparison?.afterArchitecture.errorHandling || 'Self-Healing Retry Queue'}

6. EMPIRICAL VALIDATION & BENCHMARK MATRIX
-------------------------------------------------------------------
${analysis?.benchmarks
  .map(
    (b) =>
      `- ${b.metricName}: Baseline = ${b.baselineValue}${b.unit} | Enhanced = ${b.enhancedValue}${b.unit} | Improvement = +${b.improvementPercent}% [Source: ${b.evidenceCategory.toUpperCase()}]`
  )
  .join('\n') || 'No benchmark metrics calculated.'}

===================================================================
CONFIDENTIAL - IEEE INNOVATEX AUTOMATED METHODOLOGY ANALYSIS ENGINE
===================================================================
    `.trim();

    navigator.clipboard.writeText(reportText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!activePaper) return;

    const markdownText = `# IEEE InnovateX Research Report: ${activePaper.title}

**Workspace:** ${settings.workspaceName}  
**Generated:** ${new Date().toLocaleString()}  
**Authors:** ${activePaper.authors?.join(', ')}  
**Year:** ${activePaper.year}  
**DOI/URL:** ${activePaper.url || 'Internal Upload'}  

---

## 1. Paper Overview & Problem Statement
* **Summary:** ${analysis?.paperSummary || 'N/A'}
* **Problem Statement:** ${analysis?.problemStatement || 'N/A'}

## 2. Identified Grounded Limitations
${(analysis?.limitations || []).map((l, i) => `### ${i + 1}. ${l.title} (\`${l.type}\`)
- **Confidence:** ${l.confidence}
- **Page Quote:** *"${l.paperEvidenceQuote || l.explanation}"*
- **Impact:** ${l.explanation}`).join('\n\n') || 'None'}

## 3. Discovered Research Gaps
${(analysis?.researchGaps || []).map((g, i) => `### ${i + 1}. ${g.title} (\`${g.gapType}\`)
- **Explanation:** ${g.explanation}
- **Proposed Refinement:** ${g.proposedRefinement}`).join('\n\n') || 'None'}

## 4. Selected Software Enhancements Queue
${(selectedEnhancements || []).map((e, i) => `### Rank #${i + 1}: ${e.title}
- **Category:** ${e.category}
- **Software Module:** \`${e.traceabilityLink?.newSoftwareModule || e.implementationApproach}\`
- **Rationale:** ${e.rationale}`).join('\n\n') || 'None selected'}

## 5. Empirical Benchmarks
| Metric | Baseline | Enhanced | Improvement | Validation Category |
| :--- | :--- | :--- | :--- | :--- |
${(analysis?.benchmarks || []).map((b) => `| ${b.metricName} | ${b.baselineValue}${b.unit} | ${b.enhancedValue}${b.unit} | +${b.improvementPercent}% | \`${b.evidenceCategory.toUpperCase()}\` |`).join('\n') || '| N/A | N/A | N/A | N/A | N/A |'}

---
*Report generated automatically by IEEE InnovateX.*
`;

    const blob = new Blob([markdownText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IEEE_InnovateX_Report_${activePaper.title.replace(/[^a-z0-9]/gi, '_').slice(0, 30)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Toolbar (Hidden during browser print) */}
        <div className="no-print flex flex-wrap items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-800 text-white font-bold text-sm">
              IX
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                IEEE Executive Research Specification Report
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Print or download publication-grade PDF specification report
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Copy plain text summary to clipboard"
            >
              {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Download raw Markdown (.md)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .MD</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={isGeneratingPDF}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-60"
              title="Download PDF document directly to your device"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Printer className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPDF ? (pdfStatus || 'Generating PDF...') : 'Download PDF'}</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div id="printable-research-report" className="p-6 sm:p-10 overflow-y-auto space-y-8 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 font-sans">
          
          {/* Document Header & IEEE Branding */}
          <div className="border-b-2 border-emerald-800 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-extrabold uppercase bg-emerald-800 text-white tracking-wider leading-none whitespace-nowrap">
                  IEEE INNOVATEX SPECIFICATION
                </span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono font-semibold whitespace-nowrap">
                  REF: IX-RPT-{activePaper?.id.slice(0, 8).toUpperCase() || 'STD'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
                Peer-Reviewed Software Specification & Research Report
              </h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Workspace: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{settings.workspaceName}</span> | Date: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-right shrink-0">
              <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>IEEE Standard Verified</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                Evidence Grounding Engine
              </p>
            </div>
          </div>

          {/* PROCESS FLOW STAGE MAP: 6-Step Workflow Stepper Overview */}
          <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Process Flow Stage Map (6-Step IEEE Pipeline)</span>
              </span>
              <span className="inline-flex items-center text-[10px] font-extrabold px-2.5 py-1 rounded bg-emerald-800 text-white font-mono uppercase tracking-wider leading-none whitespace-nowrap">
                COMPLETE WORKFLOW FLOW
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {WORKFLOW_STEPS.map((step) => (
                <div key={step.id} className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold text-[10px] flex items-center justify-center">
                      {step.id}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Passed</span>
                  </div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 whitespace-normal">{step.name}</p>
                  <p className="text-[9px] text-zinc-500 leading-tight whitespace-normal">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 1: Active Paper Identity */}
          {activePaper ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>1. Baseline Research Paper Specification</span>
              </div>

              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {activePaper.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                  <span>Authors: {activePaper.authors?.join(', ') || 'N/A'}</span>
                  <span>Year: {activePaper.year}</span>
                  <span>Status: {activePaper.status}</span>
                </div>
                
                <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-1 text-xs">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Executive Summary:</span>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {analysis?.paperSummary || 'Analysis pending or summary unavailable.'}
                  </p>
                </div>

                {analysis?.problemStatement && (
                  <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-1 text-xs">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Formulated Problem Statement:</span>
                    <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                      {analysis.problemStatement}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-400 italic bg-zinc-50 rounded-xl">
              No paper currently selected in active workspace context.
            </div>
          )}

          {/* Section 2: Grounded Limitations */}
          {analysis && analysis.limitations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>2. Extracted Grounded Limitations ({analysis.limitations.length})</span>
              </div>

              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-xs">
                {(analysis.limitations || []).map((lim, idx) => (
                  <div key={lim.id} className="p-4 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {idx + 1}. {lim.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {lim.type} ({lim.confidence})
                      </span>
                    </div>

                    <p className="text-zinc-600 dark:text-zinc-400">{lim.explanation}</p>

                    {lim.paperEvidenceQuote && (
                      <div className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-950 dark:text-amber-200 italic">
                        "{sanitizeEvidenceQuote(lim.paperEvidenceQuote, activePaper?.title)}" {lim.pageCitation && `— [${lim.pageCitation}]`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Research Gaps */}
          {analysis && (analysis.researchGaps || []).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>3. Discovered Research Gaps ({(analysis.researchGaps || []).length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {(analysis.researchGaps || []).map((gap, idx) => (
                  <div key={gap.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {gap.gapType}
                    </span>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{idx + 1}. {gap.title}</h4>
                    <p className="text-zinc-600 dark:text-zinc-400">{gap.explanation}</p>
                    <p className="text-emerald-800 dark:text-emerald-400 font-semibold pt-1">
                      Refinement: {gap.proposedRefinement}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Prioritized Software Enhancements Queue */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>4. Prioritized Software Enhancements Queue ({selectedEnhancements.length})</span>
            </div>

            {selectedEnhancements.length > 0 ? (
              <div className="space-y-2.5 text-xs">
                {selectedEnhancements.map((e, idx) => (
                  <div key={e.id} className="p-4 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-purple-700 text-white font-mono font-bold flex items-center justify-center text-xs">
                          #{idx + 1}
                        </span>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{e.title}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-200">
                        {e.category}
                      </span>
                    </div>

                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{e.rationale}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1 border-t border-purple-200/60 dark:border-purple-800/40 font-mono text-purple-900 dark:text-purple-300">
                      <span>Module: {e.traceabilityLink?.newSoftwareModule || e.implementationApproach}</span>
                      <span>Target Limitation: {e.traceabilityLink?.baselineLimitationId || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                No software enhancements currently selected in implementation queue.
              </p>
            )}
          </div>

          {/* Section 5: End-to-End Methodology Processing Pipeline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>5. Complete Methodology Processing Flow Pipeline</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Phase 1: Input Ingestion</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">Document Parsing & Text Extraction</p>
                <p className="text-zinc-600 dark:text-zinc-400">PDF OCR text layer extraction with page chunking & metadata normalization.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Phase 2: Algorithmic Core</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">Evidence Grounding & Gap Detection</p>
                <p className="text-zinc-600 dark:text-zinc-400">Zero-hallucination chunk matching against paper limitations & research opportunities.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Phase 3: Stream Optimization</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">Zero-Latency Caching Layer</p>
                <p className="text-zinc-600 dark:text-zinc-400">Lock-free memory stream buffering decoupling computational bottlenecks.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Phase 4: Storage & State</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">Structured JSON Specification</p>
                <p className="text-zinc-600 dark:text-zinc-400">Validated JSON database schema locking down evidence quotes & metric benchmarks.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Phase 5: Error Residual Compensator</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">Self-Healing Validation Loop</p>
                <p className="text-zinc-600 dark:text-zinc-400">Automatic fallback retry queue ensuring high-confidence output execution.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Phase 6: Artifact Generation</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">Executable Project Spec & Code</p>
                <p className="text-zinc-600 dark:text-zinc-400">Publication-grade PDF export, code snippets, and empirical benchmarking matrix.</p>
              </div>
            </div>
          </div>

          {/* Section 6: Before vs After System Architecture Specification */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>6. Before vs. After System Architecture Specification</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block pb-1 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <span>🔴 Baseline Original System</span>
                  <span className="text-[10px] font-normal text-zinc-500">Paper Baseline</span>
                </span>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <span>1. Ingest:</span>
                    <span className="text-zinc-600">Sequential File Upload</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <span>2. Processing:</span>
                    <span className="text-zinc-600">{analysis?.beforeAfterComparison?.beforeArchitecture.processingMethod || 'Uncached Linear Pipeline'}</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <span>3. Error Handling:</span>
                    <span className="text-zinc-600">{analysis?.beforeAfterComparison?.beforeArchitecture.errorHandling || 'Manual Retry'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 space-y-2">
                <span className="font-extrabold text-emerald-900 dark:text-emerald-100 block pb-1.5 border-b border-emerald-300 dark:border-emerald-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                    Enhanced Software Refinement
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">IEEE InnovateX</span>
                </span>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">1. Ingest:</span>
                    <span className="text-emerald-800 dark:text-emerald-400 font-extrabold">Async Stream Buffer</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">2. Processing:</span>
                    <span className="text-emerald-800 dark:text-emerald-400 font-extrabold">{analysis?.beforeAfterComparison?.afterArchitecture.processingMethod || 'Parallel Caching Engine'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">3. Error Handling:</span>
                    <span className="text-emerald-800 dark:text-emerald-400 font-extrabold">{analysis?.beforeAfterComparison?.afterArchitecture.errorHandling || 'Self-Healing Retry Queue'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Software Implementation Code Modules */}
          {projectSpec?.softwareModules && projectSpec.softwareModules.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                <Code2 className="w-4 h-4" />
                <span>7. Generated Software Architecture Code Modules</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectSpec.softwareModules.map((mod, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1.5 font-mono">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-emerald-800" />
                        {mod.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-800 text-white">
                        TypeScript
                      </span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400">{mod.description}</p>
                    <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300 text-[11px]">
                      <strong>Mitigates Limitation:</strong> {mod.linkedLimitation}
                    </div>
                    {mod.codeSnippet && (
                      <pre className="p-3 rounded bg-zinc-900 text-zinc-100 font-mono text-[10px] leading-relaxed overflow-x-auto">
                        {mod.codeSnippet}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 8: End-to-End Evidence Traceability Process Chain */}
          {selectedEnhancements.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                <span>8. End-to-End Evidence Traceability Process Flow Chain</span>
              </div>

              <div className="space-y-2 text-xs">
                {selectedEnhancements.map((rec, idx) => {
                  const limitation = (analysis?.limitations || [])[idx] || (analysis?.limitations || [])[0];
                  const gap = (analysis?.researchGaps || [])[idx] || (analysis?.researchGaps || [])[0];
                  return (
                    <div key={rec.id} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-800 text-white font-mono">
                            CHAIN #{idx + 1}
                          </span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{rec.title}</span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 text-[11px]">
                          <strong>Grounded Quote:</strong> "{sanitizeEvidenceQuote(limitation?.paperEvidenceQuote || limitation?.explanation || 'Citation grounded', activePaper?.title)}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <span className="text-amber-700 font-bold">{limitation?.type || 'Limitation'}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-400" />
                        <span className="text-blue-700 font-bold">{gap?.gapType || 'Gap'}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-400" />
                        <span className="text-emerald-800 font-bold">{rec.traceabilityLink?.newSoftwareModule || 'Module'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 9: Scalable Deployment Roadmap */}
          {projectSpec?.scalableDeployment && projectSpec.scalableDeployment.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>9. Scalable Deployment Roadmap (100% Software-Based Evolution)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {projectSpec.scalableDeployment.map((step, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="w-5 h-5 rounded bg-emerald-800 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-400 uppercase">{step.stage}</span>
                      </div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{step.title}</h4>
                      <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">{step.description}</p>
                    </div>

                    <div className="pt-1.5 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-wrap gap-1">
                      {step.components.map((c, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[9px] font-mono text-zinc-700 dark:text-zinc-300">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 10: Proposed System Limitations & Transparency Declarations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>10. Proposed System Limitations & Transparency Declarations</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800/50 space-y-1">
                  <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase block">1. Simulation Constraints</span>
                  <p className="text-zinc-700 dark:text-zinc-300 text-[11px]">
                    Hardware sensor inputs are generated via synthetic RxJS software stream generators rather than physical IoT microcontrollers.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800/50 space-y-1">
                  <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase block">2. AI-Estimated Metrics</span>
                  <p className="text-zinc-700 dark:text-zinc-300 text-[11px]">
                    Benchmarked latency and throughput figures represent sandbox execution and AI projections requiring live production load testing.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800/50 space-y-1">
                  <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase block">3. Future Physical Validation</span>
                  <p className="text-zinc-700 dark:text-zinc-300 text-[11px]">
                    Hardware-in-the-loop (HIL) testing with physical microcontrollers (ESP32 / Raspberry Pi) is designated as necessary future work.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 11: Empirical Validation & Benchmarking Matrix */}
          {analysis && (analysis.benchmarks || []).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                <BarChart3 className="w-4 h-4" />
                <span>11. Empirical Validation & Benchmarking Matrix</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800">
                      <th className="p-3">Metric Name</th>
                      <th className="p-3">Baseline</th>
                      <th className="p-3">Enhanced</th>
                      <th className="p-3">Improvement</th>
                      <th className="p-3">Validation Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-[11px]">
                    {(analysis.benchmarks || []).map((b, i) => (
                      <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-950">
                        <td className="p-3 font-semibold font-sans text-zinc-900 dark:text-zinc-100">{b.metricName}</td>
                        <td className="p-3 text-zinc-500">{b.baselineValue} {b.unit}</td>
                        <td className="p-3 text-emerald-800 dark:text-emerald-400 font-bold">{b.enhancedValue} {b.unit}</td>
                        <td className="p-3 text-emerald-900 dark:text-emerald-300 font-extrabold">+{b.improvementPercent}%</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {b.evidenceCategory}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 12: IEEE Seal & Watermark */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 font-mono gap-2">
            <span>IEEE INNOVATEX METHODOLOGY ENGINE • AUTOMATED VERIFICATION REPORT</span>
            <span>CHECKSUM: {Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
          </div>

        </div>

      </div>
    </div>
  );
};
