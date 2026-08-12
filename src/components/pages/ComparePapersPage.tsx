import React, { useState, useEffect } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { WorkflowStepper } from '../layout/WorkflowStepper';
import { EmptyStateCard } from '../common/EmptyStateCard';
import { IEEEPaper, PaperEvidence } from '../../types';
import { EvidenceModal } from '../common/EvidenceModal';
import {
  GitCompare,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  Sparkles,
  Layers,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Columns
} from 'lucide-react';

export const ComparePapersPage: React.FC = () => {
  const { papers, setActiveTab, setIsUploadModalOpen } = usePaperContext();

  // Filter only analyzed papers
  const analyzedPapers = papers.filter((p) => p.status === 'Analyzed' && p.analysis);

  const [paperAId, setPaperAId] = useState<string>('');
  const [paperBId, setPaperBId] = useState<string>('');
  const [selectedEvidence, setSelectedEvidence] = useState<PaperEvidence | null>(null);

  useEffect(() => {
    if (analyzedPapers.length >= 1 && !paperAId) {
      setPaperAId(analyzedPapers[0].id);
    }
    if (analyzedPapers.length >= 2 && !paperBId) {
      setPaperBId(analyzedPapers[1].id);
    } else if (analyzedPapers.length === 1 && !paperBId) {
      setPaperBId(analyzedPapers[0].id);
    }
  }, [analyzedPapers]);

  const paperA = analyzedPapers.find((p) => p.id === paperAId) || analyzedPapers[0];
  const paperB = analyzedPapers.find((p) => p.id === paperBId) || analyzedPapers[1] || paperA;

  // Export comparison as JSON
  const handleExportJSON = () => {
    if (!paperA || !paperB) return;
    const comparisonData = {
      exportedAt: new Date().toISOString(),
      paperA: {
        id: paperA.id,
        title: paperA.title,
        analysis: paperA.analysis
      },
      paperB: {
        id: paperB.id,
        title: paperB.title,
        analysis: paperB.analysis
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(comparisonData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `IEEE_Paper_Comparison_${paperA.id}_vs_${paperB.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export printable view / PDF
  const handlePrintPDF = () => {
    window.print();
  };

  if (analyzedPapers.length === 0) {
    return (
      <div className="space-y-6">
        <WorkflowStepper />
        <EmptyStateCard
          icon={GitCompare}
          title="No Analyzed Papers Available for Comparison"
          message="To compare research papers side-by-side, you need at least two analyzed IEEE papers in your workspace."
          actionButton={{
            label: 'Upload & Analyze Papers',
            onClick: () => setIsUploadModalOpen(true),
          }}
        />
      </div>
    );
  }

  const analysisA = paperA?.analysis;
  const analysisB = paperB?.analysis;

  const methA = typeof analysisA?.methodology === 'object' ? analysisA.methodology : null;
  const methB = typeof analysisB?.methodology === 'object' ? analysisB.methodology : null;

  return (
    <div className="space-y-6">
      <WorkflowStepper />

      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-[#E8EAEF] p-6 shadow-2xs print:shadow-none print:border-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8EAEF]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#F0F4F2] text-[#064E3B] border border-[#CBD5E1]">
                Comparative Research Analysis
              </span>
              <span className="text-xs text-zinc-300">|</span>
              <span className="text-xs text-[#64748B]">
                {analyzedPapers.length} Analyzed Papers Ready
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
              <Columns className="w-5 h-5 text-[#064E3B]" />
              Side-by-Side Paper Methodology & Results Comparison
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Compare architectural choices, empirical results, and research limitations across studies
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 print:hidden">
            <button
              onClick={handleExportJSON}
              className="px-3 py-2 rounded-lg bg-[#F8FAFC] hover:bg-[#F0F4F2] text-[#1E293B] text-xs font-semibold border border-[#E8EAEF] flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#064E3B]" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handlePrintPDF}
              className="px-3.5 py-2 rounded-lg bg-[#064E3B] hover:bg-[#053F2F] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Paper Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 print:hidden">
          {/* Paper A Selector */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1]">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#064E3B] mb-1.5">
              Paper Selection A (Baseline)
            </label>
            <select
              value={paperAId}
              onChange={(e) => setPaperAId(e.target.value)}
              className="w-full bg-white border border-[#E8EAEF] rounded-lg px-3 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
            >
              {analyzedPapers.map((p) => (
                <option key={`a-${p.id}`} value={p.id}>
                  {p.title} ({p.year})
                </option>
              ))}
            </select>
          </div>

          {/* Paper B Selector */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1]">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#064E3B] mb-1.5">
              Paper Selection B (Comparison)
            </label>
            <select
              value={paperBId}
              onChange={(e) => setPaperBId(e.target.value)}
              className="w-full bg-white border border-[#E8EAEF] rounded-lg px-3 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
            >
              {analyzedPapers.map((p) => (
                <option key={`b-${p.id}`} value={p.id}>
                  {p.title} ({p.year})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      {paperA && paperB && analysisA && analysisB && (
        <div className="space-y-6">

          {/* 1. Paper Overview Header Comparison */}
          <div className="bg-white rounded-xl border border-[#E8EAEF] p-6 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2 border-b border-[#E8EAEF] pb-3">
              <BookOpen className="w-4 h-4 text-[#064E3B]" />
              1. General Overview & Scope
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Paper A Overview */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF] space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#064E3B] text-white">
                  PAPER A
                </span>
                <h4 className="text-sm font-bold text-[#1E293B] mt-1">{paperA.title}</h4>
                <p className="text-xs text-[#64748B]">
                  Authors: {paperA.authors.join(', ')} • Year: {paperA.year}
                </p>
                <div className="pt-2 border-t border-[#E8EAEF]">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Summary</span>
                  <p className="text-xs text-[#1E293B] mt-1 leading-relaxed">
                    {analysisA.paperSummary}
                  </p>
                </div>
              </div>

              {/* Paper B Overview */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF] space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#064E3B] text-white">
                  PAPER B
                </span>
                <h4 className="text-sm font-bold text-[#1E293B] mt-1">{paperB.title}</h4>
                <p className="text-xs text-[#64748B]">
                  Authors: {paperB.authors.join(', ')} • Year: {paperB.year}
                </p>
                <div className="pt-2 border-t border-[#E8EAEF]">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Summary</span>
                  <p className="text-xs text-[#1E293B] mt-1 leading-relaxed">
                    {analysisB.paperSummary}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Problem Statement Comparison */}
          <div className="bg-white rounded-xl border border-[#E8EAEF] p-6 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2 border-b border-[#E8EAEF] pb-3">
              <AlertCircle className="w-4 h-4 text-[#064E3B]" />
              2. Core Problem Statements
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF] space-y-1">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Paper A Problem</span>
                <p className="text-xs text-[#1E293B] leading-relaxed">{analysisA.problemStatement}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E8EAEF] space-y-1">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Paper B Problem</span>
                <p className="text-xs text-[#1E293B] leading-relaxed">{analysisB.problemStatement}</p>
              </div>
            </div>
          </div>

          {/* 3. Methodology Matrix Side-by-Side Table */}
          <div className="bg-white rounded-xl border border-[#E8EAEF] p-6 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2 border-b border-[#E8EAEF] pb-3">
              <Layers className="w-4 h-4 text-[#064E3B]" />
              3. Methodology & System Architecture Matrix
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8EAEF] bg-[#F8FAFC]">
                    <th className="p-3 font-bold text-[#1E293B] w-1/5 uppercase text-[10px] tracking-wider">
                      Architectural Aspect
                    </th>
                    <th className="p-3 font-bold text-[#064E3B] w-2/5 border-l border-[#E8EAEF]">
                      Paper A: {paperA.title.slice(0, 35)}...
                    </th>
                    <th className="p-3 font-bold text-[#064E3B] w-2/5 border-l border-[#E8EAEF]">
                      Paper B: {paperB.title.slice(0, 35)}...
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EAEF]">
                  {[
                    { key: 'input', label: 'System Input' },
                    { key: 'processing', label: 'Processing Pipeline' },
                    { key: 'algorithm', label: 'Primary Algorithm' },
                    { key: 'output', label: 'System Output' },
                    { key: 'architecture', label: 'Framework / Model' },
                    { key: 'dataset', label: 'Dataset Used' },
                    { key: 'evaluation', label: 'Evaluation Method' },
                  ].map((row) => (
                    <tr key={row.key} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-3 font-bold text-[#1E293B] bg-[#F8FAFC]">{row.label}</td>
                      <td className="p-3 border-l border-[#E8EAEF] text-[#1E293B]">
                        {methA ? (methA as any)[row.key] || 'NOT_FOUND' : 'N/A'}
                      </td>
                      <td className="p-3 border-l border-[#E8EAEF] text-[#1E293B]">
                        {methB ? (methB as any)[row.key] || 'NOT_FOUND' : 'N/A'}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="p-3 font-bold text-[#1E293B] bg-[#F8FAFC]">Named Algorithms</td>
                    <td className="p-3 border-l border-[#E8EAEF] text-[#1E293B]">
                      {analysisA.algorithms?.join(', ') || 'NOT_FOUND'}
                    </td>
                    <td className="p-3 border-l border-[#E8EAEF] text-[#1E293B]">
                      {analysisB.algorithms?.join(', ') || 'NOT_FOUND'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#1E293B] bg-[#F8FAFC]">Technologies</td>
                    <td className="p-3 border-l border-[#E8EAEF] text-[#1E293B]">
                      {analysisA.technologies?.join(', ') || 'NOT_FOUND'}
                    </td>
                    <td className="p-3 border-l border-[#E8EAEF] text-[#1E293B]">
                      {analysisB.technologies?.join(', ') || 'NOT_FOUND'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Reported Results Comparison */}
          <div className="bg-white rounded-xl border border-[#E8EAEF] p-6 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2 border-b border-[#E8EAEF] pb-3">
              <Award className="w-4 h-4 text-[#064E3B]" />
              4. Reported Results & Metrics Comparison
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Paper A Results */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                  Paper A Results ({analysisA.results?.length || 0})
                </span>
                {Array.isArray(analysisA.results) && analysisA.results.length > 0 ? (
                  <div className="space-y-2">
                    {analysisA.results.map((r, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E8EAEF] flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#1E293B]">{r.metric}</p>
                          <p className="text-[10px] text-[#64748B]">Page {r.page} • {r.source}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#064E3B] text-white">
                          {r.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic p-3 bg-[#F8FAFC] rounded-lg">
                    No explicit numerical metrics extracted.
                  </p>
                )}
              </div>

              {/* Paper B Results */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                  Paper B Results ({analysisB.results?.length || 0})
                </span>
                {Array.isArray(analysisB.results) && analysisB.results.length > 0 ? (
                  <div className="space-y-2">
                    {analysisB.results.map((r, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E8EAEF] flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#1E293B]">{r.metric}</p>
                          <p className="text-[10px] text-[#64748B]">Page {r.page} • {r.source}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#064E3B] text-white">
                          {r.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic p-3 bg-[#F8FAFC] rounded-lg">
                    No explicit numerical metrics extracted.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 5. Limitations & Gaps Comparison */}
          <div className="bg-white rounded-xl border border-[#E8EAEF] p-6 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2 border-b border-[#E8EAEF] pb-3">
              <Sparkles className="w-4 h-4 text-[#064E3B]" />
              5. Key Limitations & Research Gaps
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Paper A Limitations & Gaps */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Paper A Limitations</span>
                <div className="space-y-2">
                  {analysisA.limitations?.map((lim) => (
                    <div key={lim.id} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E8EAEF]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#1E293B]">{lim.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                          {lim.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B]">{lim.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paper B Limitations & Gaps */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Paper B Limitations</span>
                <div className="space-y-2">
                  {analysisB.limitations?.map((lim) => (
                    <div key={lim.id} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E8EAEF]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#1E293B]">{lim.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                          {lim.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B]">{lim.explanation}</p>
                    </div>
                  ))}
                </div>
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
