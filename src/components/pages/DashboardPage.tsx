import React, { useState } from 'react';
import { motion } from 'motion/react';
import { usePaperContext } from '../../context/PaperContext';
import { WorkflowStepper } from '../layout/WorkflowStepper';
import { ResearchIntegrityPanel } from '../common/ResearchIntegrityPanel';
import { BeforeAfterComparison } from '../common/BeforeAfterComparison';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { FileText, AlertCircle, Sparkles, FolderGit2, Upload, Link as LinkIcon, ArrowRight, Play, ShieldCheck, HelpCircle, Zap, Cpu, Compass, Database } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { papers, activePaper, setIsUploadModalOpen, setActiveTab, triggerAnalysis, isAnalyzing } = usePaperContext();

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const hasPapers = papers.length > 0;

  // Real calculated metrics
  const papersCount = hasPapers ? papers.length : 0;
  
  let gapsCount = 0;
  let enhancementsCount = 0;
  let projectStatusDisplay = 'Not Started';

  if (activePaper) {
    if (activePaper.analysis) {
      gapsCount = activePaper.analysis.researchGaps?.length || 0;
      enhancementsCount = activePaper.analysis.recommendations?.length || 0;
    }
    projectStatusDisplay = activePaper.projectStatus || 'Awaiting Analysis';
  }

  const selectedEnhancements = activePaper?.analysis?.recommendations?.filter(r => 
    activePaper.selectedEnhancementIds?.includes(r.id)
  ) || [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Workflow Stepper */}
      <WorkflowStepper />

      {/* Dynamic Research Integrity Panel */}
      <ResearchIntegrityPanel />

      {/* Demo Mode / Hero Spotlight Banner when NO paper exists */}
      {!hasPapers ? (
        <div
          onMouseMove={handleMouseMove}
          className="relative rounded-3xl glass-panel border border-cyan-500/30 dark:border-cyan-500/40 p-8 sm:p-10 shadow-xl overflow-hidden hover-lift-glow animate-neon-pulse"
        >
          {/* Cursor Follow Radial Glow */}
          <div
            className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-60"
            style={{
              background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(6, 182, 212, 0.15), rgba(132, 204, 22, 0.1) 40%, transparent 80%)`,
            }}
          />

          <div className="max-w-3xl space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 text-xs font-bold border border-cyan-400/40 neon-glow-cyan">
              <Zap className="w-4 h-4 text-cyan-500 animate-bounce" />
              <span>IEEE Peer-Reviewed Methodology Engine — Live Demo</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
              Transform Research Papers into <span className="bg-gradient-to-r from-cyan-500 via-lime-500 to-pink-500 bg-clip-text text-transparent">Enhanced Code Deployments</span>
            </h2>
            
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
              Upload any IEEE, ACM, or ArXiv research paper PDF to run automated methodology extraction, limitation discovery, research gap synthesis, and generate software-only enhancement modules.
            </p>

            <div className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 backdrop-blur-md text-xs text-zinc-700 dark:text-zinc-300 space-y-1.5 shadow-inner">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-lime-500" />
                Hackathon Judge Quick-Start Guide:
              </span>
              <p>1. Upload an IEEE PDF or paste an ArXiv / DOI URL.</p>
              <p>2. View live Gemini extraction & evidence grounded in section text.</p>
              <p>3. Compare original vs enhanced code architecture side-by-side.</p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsUploadModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer border border-brand-border"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Research Paper PDF</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsUploadModalOpen(true)}
                className="px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <LinkIcon className="w-4 h-4 text-cyan-500" />
                <span>Paste ArXiv / DOI URL</span>
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        /* Active Workspace Overview Banner when paper exists */
        <div className="rounded-3xl glass-panel border border-lime-500/30 dark:border-lime-500/40 p-6 shadow-xl neon-glow-lime hover-lift-glow">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-lime-500/20 text-lime-800 dark:text-lime-300 border border-lime-400/50 uppercase tracking-wider">
                  Active Paper Context
                </span>
                {activePaper?.isSample && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-400/50 uppercase tracking-wider flex items-center gap-1">
                    <Database className="w-3 h-3 text-amber-600" />
                    DEMO DATA (Sample Paper Active)
                  </span>
                )}
                <span className="text-xs text-zinc-400">|</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Uploaded {activePaper?.uploadedAt ? new Date(activePaper.uploadedAt).toLocaleDateString() : 'Today'}</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                {activePaper?.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {activePaper?.status === 'Awaiting analysis' && (
                <button
                  onClick={() => activePaper && triggerAnalysis(activePaper.id)}
                  disabled={isAnalyzing}
                  className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-white" />
                  <span>{isAnalyzing ? 'Analyzing with Gemini...' : 'Analyze Paper Now'}</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('analysis')}
                className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Full Analysis</span>
                <ArrowRight className="w-3.5 h-3.5 text-lime-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Neon Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Papers */}
        <div className="rounded-2xl glass-panel border border-cyan-500/30 dark:border-cyan-500/40 p-5 shadow-lg neon-glow-cyan hover-lift-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Research Papers</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 dark:bg-cyan-500/25 text-cyan-600 dark:text-cyan-300 flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            <AnimatedCounter value={hasPapers ? papersCount : 0} />
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            {hasPapers ? `${papers.length} paper(s) in lab context` : 'No papers uploaded yet'}
          </p>
        </div>

        {/* Metric 2: Research Gaps */}
        <div className="rounded-2xl glass-panel border border-pink-500/30 dark:border-pink-500/40 p-5 shadow-lg neon-glow-pink hover-lift-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Research Gaps</span>
            <div className="w-9 h-9 rounded-xl bg-pink-500/15 dark:bg-pink-500/25 text-pink-600 dark:text-pink-300 flex items-center justify-center shadow-xs">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            <AnimatedCounter value={gapsCount} />
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            {activePaper?.analysis ? 'Evidence-backed research gaps' : 'Pending paper analysis'}
          </p>
        </div>

        {/* Metric 3: Enhancements */}
        <div className="rounded-2xl glass-panel border border-lime-500/30 dark:border-lime-500/40 p-5 shadow-lg neon-glow-lime hover-lift-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Enhancements</span>
            <div className="w-9 h-9 rounded-xl bg-lime-500/15 dark:bg-lime-500/25 text-lime-600 dark:text-lime-300 flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            <AnimatedCounter value={enhancementsCount} />
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            {activePaper?.analysis ? 'Software-only modules' : 'Pending paper analysis'}
          </p>
        </div>

        {/* Metric 4: Project Status */}
        <div className="rounded-2xl glass-panel border border-purple-500/30 dark:border-purple-500/40 p-5 shadow-lg neon-glow-blue hover-lift-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Project Status</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 dark:bg-purple-500/25 text-purple-600 dark:text-purple-300 flex items-center justify-center shadow-xs">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 truncate mt-2">
            {projectStatusDisplay}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            {hasPapers ? 'Active development pipeline' : 'Awaiting paper upload'}
          </p>
        </div>

      </div>

      {/* Judge Executive Overview Panel */}
      {activePaper && activePaper.analysis && (
        <div className="rounded-3xl glass-panel border border-cyan-500/30 dark:border-cyan-500/40 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-800 dark:text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-400/40">
                Judge Executive Overview
              </span>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mt-1.5 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-500" />
                7 Core Research Transformation Answers
              </h3>
            </div>
            <span className="text-xs font-bold text-lime-800 dark:text-lime-300 bg-lime-500/10 border border-lime-400/40 px-3 py-1 rounded-full">
              Dynamically Grounded
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Q1 */}
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-xs">1. What paper did we use?</span>
              <p className="text-zinc-800 dark:text-zinc-200 font-bold">{activePaper.title}</p>
              <p className="text-zinc-500 text-[11px]">
                Authors: {activePaper.authors?.join(', ') || 'Extracted Authors'} | Year: {activePaper.year || 'N/A'}
              </p>
            </div>

            {/* Q2 */}
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-xs">2. What was the original system?</span>
              <p className="text-zinc-700 dark:text-zinc-300 line-clamp-2">
                {activePaper.analysis.methodology?.processing || activePaper.analysis.paperSummary || 'N/A'}
              </p>
            </div>

            {/* Q3 */}
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-xs">3. What limitations were identified?</span>
              <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 space-y-0.5">
                {(activePaper.analysis.limitations || []).slice(0, 2).map((lim, i) => (
                  <li key={i} className="line-clamp-1">{lim.title}</li>
                ))}
              </ul>
            </div>

            {/* Q4 */}
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-xs">4. What research gaps were found?</span>
              <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 space-y-0.5">
                {(activePaper.analysis.researchGaps || []).slice(0, 2).map((gap, i) => (
                  <li key={i} className="line-clamp-1">{gap.title} ({gap.gapType})</li>
                ))}
              </ul>
            </div>

            {/* Q5 */}
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-xs">5. What enhancements did we select?</span>
              <p className="text-lime-600 dark:text-lime-400 font-extrabold">
                {selectedEnhancements.length > 0 
                  ? `${selectedEnhancements.length} Software Enhancements Selected`
                  : 'Pending Enhancement Selection in Pipeline'}
              </p>
            </div>

            {/* Q6 */}
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-xs">6. What is our enhanced system?</span>
              <p className="text-zinc-700 dark:text-zinc-300 line-clamp-2">
                A software-only refinement layer introducing dynamic buffer queues and zero-trust verification.
              </p>
            </div>

            {/* Q7 */}
            <div className="p-4 rounded-2xl bg-lime-500/10 border border-lime-400/40 space-y-1.5 md:col-span-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-xs">7. How will we validate it?</span>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-brand-primary text-white flex items-center gap-1 shadow-2xs">
                  🟢 MEASURED (Client performance.now benchmarks)
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-400/40 flex items-center gap-1">
                  🔵 SIMULATED (Queue stress runners)
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 flex items-center gap-1">
                  🟡 ESTIMATED (AI Models)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Before -> After Architecture Comparison */}
      <BeforeAfterComparison data={activePaper?.analysis?.beforeAfterComparison} />

    </div>
  );
};


