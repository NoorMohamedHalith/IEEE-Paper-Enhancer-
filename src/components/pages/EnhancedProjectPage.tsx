import React, { useState, useEffect } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { downloadElementAsPDF, triggerPrint } from '../../utils/printUtils';
import { WorkflowStepper } from '../layout/WorkflowStepper';
import { EmptyStateCard } from '../common/EmptyStateCard';
import { ArchitectureGraph } from '../common/ArchitectureGraph';
import { InteractiveTraceabilityChain, TraceabilityChainItem } from '../common/InteractiveTraceabilityChain';
import { generateProjectSpec } from '../../services/ai/projectSpecEngine';
import { EnhancedProjectSpec, PredictionMetric, ResultState } from '../../types';
import {
  FolderGit2,
  Download,
  Printer,
  Sparkles,
  Layers,
  FileText,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Cpu,
  Code2,
  Terminal,
  HelpCircle,
  Copy,
  Check,
  ArrowRight,
  Loader2
} from 'lucide-react';

export const EnhancedProjectPage: React.FC = () => {
  const { activePaper, setActiveTab, setIsUploadModalOpen } = usePaperContext();
  const [projectSpec, setProjectSpec] = useState<EnhancedProjectSpec | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [pdfStatus, setPdfStatus] = useState<string>('');

  const selectedIds = activePaper?.selectedEnhancementIds || [];
  const analysis = activePaper?.analysis;

  useEffect(() => {
    if (!activePaper || !analysis) return;

    let isMounted = true;
    setLoading(true);

    generateProjectSpec(activePaper)
      .then((spec) => {
        if (isMounted) {
          setProjectSpec(spec);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to load project spec:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activePaper?.id, selectedIds.length]);

  if (!activePaper || !analysis) {
    return (
      <div className="space-y-6">
        <WorkflowStepper />
        <EmptyStateCard
          icon={FolderGit2}
          title="Enhanced Project Proposal Engine"
          message="Upload an IEEE paper and select enhancements to generate a complete project specification."
          actionButton={{
            label: 'Upload Paper First',
            onClick: () => setIsUploadModalOpen(true),
          }}
        />
      </div>
    );
  }

  const selectedRecommendations =
    analysis.recommendations?.filter((r) => selectedIds.includes(r.id)) || [];

  const handleDownloadJSON = () => {
    if (!projectSpec) return;
    const blob = new Blob([JSON.stringify(projectSpec, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IEEE_InnovateX_Proposal_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    setPdfStatus('Generating PDF...');
    const filename = `Enhanced_Project_Spec_${activePaper?.id?.slice(0, 8) || 'Report'}.pdf`;
    await downloadElementAsPDF('printable-enhanced-project', filename, (msg) => setPdfStatus(msg));
    setIsGeneratingPDF(false);
  };

  const handleCopySummary = () => {
    if (!projectSpec) return;
    const text = `PROJECT PROPOSAL: ${projectSpec.projectTitle}\nConcept: ${projectSpec.oneLineConcept}\nProblem: ${projectSpec.problemStatement}\nSolution: ${projectSpec.proposedSolution}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Construct Traceability Chain Items
  const traceabilityChainItems: TraceabilityChainItem[] = (selectedRecommendations || []).map(
    (rec, idx) => {
      const limitations = analysis?.limitations || [];
      const gaps = analysis?.researchGaps || [];
      const evidences = analysis?.evidences || [];

      const matchingLimitation =
        limitations.find((l) => l.id === rec.limitationId) ||
        limitations[idx] ||
        limitations[0];
      const matchingGap =
        gaps.find((g) => g.id === rec.researchGapId) ||
        gaps[0];
      const matchingEvidence =
        evidences.find((e) => rec.evidenceIds?.includes(e.id)) ||
        evidences[0];

      return {
        id: `chain-${rec.id}`,
        evidence: matchingEvidence,
        limitation: matchingLimitation,
        gap: matchingGap,
        enhancement: rec,
        moduleName: rec.traceabilityLink?.newSoftwareModule || 'SoftwareOptimizationWrapper.ts',
        metric: {
          metricName: rec.validationMetric,
          baselineValue: 'Baseline Metric',
          enhancedValue: 'Enhanced Target',
          status: 'ESTIMATED' as ResultState,
        },
      };
    }
  );

  return (
    <div id="printable-enhanced-project" className="space-y-6 pb-20">
      <WorkflowStepper />

      {/* Hero Header & Proposal Actions */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800 text-white">
                Validated Project Proposal
              </span>
              <span className="text-xs text-zinc-400">|</span>
              <span className="text-xs text-zinc-500 font-medium">Software-Only Implementation</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900">
              {projectSpec?.projectTitle || `Enhanced ${activePaper.title}`}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Derived directly from IEEE Paper: <strong className="text-zinc-800">{activePaper.title}</strong>
            </p>
          </div>

          {/* Proposal Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleCopySummary}
              className="px-3 py-2 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4 text-zinc-600" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-3.5 py-2 rounded-lg border border-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
              title="Download PDF document directly to your device"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-800" />
              ) : (
                <Printer className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              )}
              <span>{isGeneratingPDF ? (pdfStatus || 'Generating PDF...') : 'Print / Download PDF'}</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Report (JSON)</span>
            </button>
          </div>
        </div>

        {/* One-Line Concept & Executive Summary */}
        <div className="pt-4 space-y-3">
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
              One-Line Core Concept
            </span>
            <p className="text-xs font-bold text-emerald-950 leading-relaxed">
              {projectSpec?.oneLineConcept || 'A modular software refinement layer introducing zero-latency stream caching.'}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-800" />
              Executive Summary
            </h3>
            <p className="text-xs text-zinc-700 leading-relaxed">
              This project proposal addresses the core limitations of <strong>{activePaper.title}</strong> by integrating {selectedRecommendations.length || 2} software-only module optimizations. By decoupling heavy computational loops into lock-free stream buffers, the enhanced system achieves performance gains without modifying underlying hardware architectures.
            </p>
          </div>
        </div>
      </div>

      {/* Problem Statement & Research Gap Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-700" />
            Problem Statement & Baseline Limitations
          </h3>
          <p className="text-xs text-zinc-700 leading-relaxed">
            {projectSpec?.problemStatement || analysis.problemStatement}
          </p>
          <div className="pt-2 border-t border-zinc-100">
            <span className="text-[11px] font-semibold text-zinc-500 block mb-1.5">Grounded Paper Limitations:</span>
            <ul className="space-y-1">
              {(analysis.limitations || []).map((lim, idx) => (
                <li key={idx} className="text-xs text-zinc-700 bg-rose-50/50 p-2 rounded border border-rose-100 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                  <span><strong>{lim.title}:</strong> {lim.explanation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-800" />
            Proposed Solution & Expected Impact
          </h3>
          <p className="text-xs text-zinc-700 leading-relaxed">
            {projectSpec?.proposedSolution || 'Modular algorithmic enhancements decoupling ingestion buffers and providing fault-tolerant validation.'}
          </p>
          <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs text-emerald-950 font-medium">
            <strong>Expected Impact:</strong> {projectSpec?.expectedImpact || 'Eliminates algorithmic bottlenecks and accelerates processing.'}
          </div>
        </div>
      </div>

      {/* Research Novelty & Engineering Contribution */}
      {projectSpec?.researchNovelty && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Hackathon Novelty Thesis
              </span>
              <h3 className="text-base font-bold text-zinc-900 mt-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-800" />
                Research Novelty & Engineering Contribution
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-800 text-white">
              Category 2: IEEE Enhancement
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1 md:col-span-2">
              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">Engineering Contribution (Practical Implementation)</span>
              <p className="text-xs font-bold text-emerald-950 leading-relaxed">
                {projectSpec.researchNovelty.engineeringContribution || 'Modular software architecture, zero-hardware virtual MQTT event streaming pipeline, lock-free ring-buffer edge middleware, and self-contained CJS container runtime packaging.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1 md:col-span-2">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">Academic Originality (Methodology Distinction)</span>
              <p className="text-xs text-blue-950 leading-relaxed font-medium">
                {projectSpec.researchNovelty.academicOriginality || 'Applied methodology enhancement integrating AI residual estimation and edge queue decoupling on top of existing IEEE paper theoretical formulations.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Core Addressed Limitation</span>
              <p className="text-xs font-semibold text-rose-900">{projectSpec.researchNovelty.addressedLimitation}</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Technical Novelty</span>
              <p className="text-xs font-semibold text-zinc-900">{projectSpec.researchNovelty.technicalNovelty}</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">AI Layer Contribution</span>
              <p className="text-xs text-zinc-800">{projectSpec.researchNovelty.aiContribution}</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Edge Computing Contribution</span>
              <p className="text-xs text-zinc-800">{projectSpec.researchNovelty.edgeContribution}</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1 md:col-span-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Software IoT Integration & Differentiation</span>
              <p className="text-xs text-zinc-800 mt-1">
                <strong>IoT Integration:</strong> {projectSpec.researchNovelty.iotIntegrationApproach}
              </p>
              <p className="text-xs text-zinc-800 mt-1">
                <strong>Differentiation:</strong> {projectSpec.researchNovelty.differentiationFromOriginal}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Decision Support Engine */}
      {projectSpec?.decisionSupport && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                AI + Edge Decision Engine
              </span>
              <h3 className="text-base font-bold text-zinc-900 mt-1 flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-800" />
                Intelligent Decision Support System
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
              Source: [{projectSpec.decisionSupport.decisionSource}]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Prediction Outcome</span>
              <p className="text-xs font-bold text-emerald-950">{projectSpec.decisionSupport.prediction}</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Calculated Risk Score</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-bold text-zinc-900">{projectSpec.decisionSupport.riskScore}%</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  projectSpec.decisionSupport.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                  projectSpec.decisionSupport.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {projectSpec.decisionSupport.severity} SEVERITY
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Recommended Action</span>
              <p className="text-xs font-semibold text-zinc-900">{projectSpec.decisionSupport.recommendedAction}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
            <span className="text-[11px] font-bold text-zinc-700 uppercase">Why This Decision? (Decision Rationale)</span>
            <p className="text-xs text-zinc-600">{projectSpec.decisionSupport.whyThisDecision.rationale}</p>
            <div className="pt-2 border-t border-zinc-200 flex flex-wrap gap-2 text-[10px] text-zinc-500">
              <span><strong>Evidence Source:</strong> {projectSpec.decisionSupport.whyThisDecision.evidenceSource}</span>
            </div>
          </div>
        </div>
      )}

      {/* Architecture Graph Section */}
      {projectSpec?.architecture && (
        <ArchitectureGraph data={projectSpec.architecture} />
      )}

      {/* Software Modules Code Breakdown */}
      {projectSpec?.softwareModules && projectSpec.softwareModules.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Implementation Specs
              </span>
              <h3 className="text-base font-bold text-zinc-900 mt-1 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-800" />
                Software Modules & Architecture Code
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(projectSpec?.softwareModules || []).map((mod, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5 font-mono">
                    <Terminal className="w-4 h-4 text-emerald-800" />
                    {mod.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-800 text-white">
                    TypeScript
                  </span>
                </div>

                <p className="text-xs text-zinc-600">{mod.description}</p>

                <div className="p-2 rounded bg-rose-50 border border-rose-100 text-[11px] text-rose-900">
                  <strong>Mitigates Limitation:</strong> {mod.linkedLimitation}
                </div>

                {mod.codeSnippet && (
                  <pre className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
                    {mod.codeSnippet}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scalable Deployment Roadmap */}
      {projectSpec?.scalableDeployment && projectSpec.scalableDeployment.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                100% Software-Based Evolution
              </span>
              <h3 className="text-base font-bold text-zinc-900 mt-1 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-800" />
                Scalable Deployment Roadmap
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-800 text-white">
              Zero Physical Hardware Requirement
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {projectSpec.scalableDeployment.map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between space-y-3 relative">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-md bg-emerald-800 text-white font-mono font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      {step.stage}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900">{step.title}</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">{step.description}</p>
                </div>

                <div className="pt-2 border-t border-zinc-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Core Components:</span>
                  <div className="flex flex-wrap gap-1">
                    {step.components.map((c, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-[10px] font-mono text-zinc-700">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technology Stack */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-800" />
            Technology Stack
          </h3>

          <div className="space-y-3">
            {(projectSpec?.technologyStack || [
              { category: 'Core Runtime', items: ['TypeScript 5', 'Node.js', 'Express 5'] },
              { category: 'AI & Data Processing', items: ['Google GenAI SDK', 'RxJS Streams'] },
              { category: 'Validation Suite', items: ['Vitest Benchmarks', 'Client Microsecond Timers'] },
            ]).map((stack, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  {stack.category}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {stack.items.map((item, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-white border border-zinc-200 text-xs font-medium text-zinc-800">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Plan Phases */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-800" />
            Implementation Plan
          </h3>

          <div className="space-y-3">
            {(projectSpec?.implementationPlan || [
              { phase: 'Phase 1', title: 'Baseline Isolation', description: 'Extract existing algorithm.', deliverable: 'Isolated API' },
              { phase: 'Phase 2', title: 'Enhancement Integration', description: 'Deploy new software modules.', deliverable: 'Integrated System' },
              { phase: 'Phase 3', title: 'Empirical Validation', description: 'Run live benchmark tests.', deliverable: 'Validated Report' },
            ]).map((phase, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">{phase.phase}</span>
                  <span className="text-[10px] font-semibold text-zinc-500">Deliverable: {phase.deliverable}</span>
                </div>
                <h4 className="text-xs font-bold text-emerald-950">{phase.title}</h4>
                <p className="text-xs text-zinc-600">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Limitations of Enhancement & Future Work */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-700" />
            Limitations of Our Enhancement
          </h3>
          <ul className="space-y-1.5">
            {(projectSpec?.limitationsOfEnhancement || [
              'Requires initial baseline dataset calibration.',
              'Buffer queue memory scales with extreme burst traffic.'
            ]).map((lim, idx) => (
              <li key={idx} className="text-xs text-zinc-700 bg-amber-50/50 p-2.5 rounded border border-amber-200 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-800" />
            Future Research Directions
          </h3>
          <ul className="space-y-1.5">
            {(projectSpec?.futureWork || [
              'Auto-tune buffer bounds across multi-node Kubernetes clusters.',
              'Implement zero-knowledge privacy assertions for telemetry payload stream.'
            ]).map((fw, idx) => (
              <li key={idx} className="text-xs text-zinc-700 bg-emerald-50/50 p-2.5 rounded border border-emerald-200 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-1.5 shrink-0" />
                <span>{fw}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* End-to-End Evidence Traceability Chain */}
      {traceabilityChainItems.length > 0 && (
        <InteractiveTraceabilityChain items={traceabilityChainItems} />
      )}
    </div>
  );
};
