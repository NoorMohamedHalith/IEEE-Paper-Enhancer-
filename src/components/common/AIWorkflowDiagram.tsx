import React, { useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { NavigationTab } from '../../types';
import {
  FileUp,
  FileSearch,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  Zap,
  CheckSquare,
  Layers,
  Code2,
  FileCheck2,
  Check,
  X,
  Info,
  ArrowRight,
  ArrowDown
} from 'lucide-react';

interface AIWorkflowDiagramProps {
  onClose?: () => void;
  className?: string;
  isModal?: boolean;
}

export const AIWorkflowDiagram: React.FC<AIWorkflowDiagramProps> = ({
  onClose,
  className = '',
  isModal = false,
}) => {
  const { activeTab, setActiveTab, activePaper } = usePaperContext();

  const isAnalyzed = activePaper?.status === 'Analyzed' && !!activePaper?.analysis;
  const hasSelectedGaps = (activePaper?.approvedGapIds?.length || 0) > 0;
  const hasSelectedEnhancements = (activePaper?.selectedEnhancementIds?.length || 0) > 0;
  const isValidated = (activePaper?.validatedEnhancementIds?.length || 0) > 0 || activePaper?.projectStatus === 'Validated';
  const isProjectDone = activePaper?.projectStatus === 'Project Generated' || activePaper?.projectStatus === 'Validated';

  const steps = [
    {
      id: 1,
      title: '1. Upload IEEE Paper',
      description: 'User uploads an IEEE research paper (PDF)',
      icon: FileUp,
      tab: 'papers' as NavigationTab,
      isCompleted: !!activePaper,
    },
    {
      id: 2,
      title: '2. Extract & Clean Text',
      description: 'Text is extracted from the paper and cleaned for analysis',
      icon: FileSearch,
      tab: 'analysis' as NavigationTab,
      isCompleted: isAnalyzed,
    },
    {
      id: 3,
      title: '3. AI Analysis (Gemini AI)',
      description: 'AI understands the paper and extracts key information',
      icon: Sparkles,
      tab: 'analysis' as NavigationTab,
      isCompleted: isAnalyzed,
    },
    {
      id: 4,
      title: '4. Identify Evidence & Limitations',
      description: '• Evidence from paper\n• Limitations of existing system',
      icon: ShieldAlert,
      tab: 'analysis' as NavigationTab,
      isCompleted: isAnalyzed,
    },
    {
      id: 5,
      title: '5. Find Research Gaps',
      description: 'Research gaps are identified based on the limitations',
      icon: HelpCircle,
      tab: 'gaps' as NavigationTab,
      isCompleted: isAnalyzed && hasSelectedGaps,
    },
    {
      id: 6,
      title: '6. Suggest Enhancements',
      description: 'AI suggests possible enhancements to address the gaps',
      icon: Zap,
      tab: 'enhancements' as NavigationTab,
      isCompleted: isAnalyzed && hasSelectedEnhancements,
    },
    {
      id: 7,
      title: '7. User Selects Enhancements',
      description: 'User selects the most suitable enhancements',
      icon: CheckSquare,
      tab: 'enhancements' as NavigationTab,
      isCompleted: isAnalyzed && hasSelectedEnhancements,
    },
    {
      id: 8,
      title: '8. Generate Enhanced Architecture',
      description: 'New architecture is designed with the selected enhancements',
      icon: Layers,
      tab: 'project' as NavigationTab,
      isCompleted: isProjectDone,
    },
    {
      id: 9,
      title: '9. Generate Software Modules',
      description: 'Required software modules and components are identified',
      icon: Code2,
      tab: 'project' as NavigationTab,
      isCompleted: isProjectDone,
    },
    {
      id: 10,
      title: '10. Validation & Report Generation',
      description: 'Improvements are validated and final research report is generated',
      icon: FileCheck2,
      tab: 'validation' as NavigationTab,
      isCompleted: isValidated || isProjectDone,
    },
  ];

  return (
    <div
      className={`bg-white rounded-2xl border border-zinc-200 shadow-xl p-5 sm:p-7 space-y-6 max-w-6xl mx-auto font-sans ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            System Execution Flow
          </span>
          <h2 className="text-xl font-extrabold text-zinc-900 mt-1 underline decoration-emerald-800 underline-offset-4">
            AI-Powered WORKFLOW
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main 10-Step Workflow Process Grid */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Row: Steps 1 to 5 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {steps.slice(0, 5).map((step) => {
              const IconComp = step.icon;
              return (
                <div
                  key={step.id}
                  onClick={() => {
                    setActiveTab(step.tab);
                    if (onClose) onClose();
                  }}
                  className={`
                    p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative group hover:shadow-md
                    ${
                      step.isCompleted
                        ? 'bg-emerald-50/60 border-emerald-300 hover:border-emerald-500'
                        : 'bg-white border-zinc-200 hover:border-zinc-400'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[11px] font-bold text-zinc-900 leading-tight">
                      {step.title}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                        step.isCompleted ? 'bg-emerald-800 text-white' : 'bg-zinc-100 text-zinc-400'
                      }`}
                    >
                      {step.isCompleted ? <Check className="w-3 h-3" /> : step.id}
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-600 leading-snug whitespace-pre-line">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Flow Direction Indicator */}
          <div className="flex justify-end pr-8 py-1">
            <ArrowDown className="w-5 h-5 text-emerald-800 animate-bounce" />
          </div>

          {/* Bottom Row: Steps 6 to 10 (Reversed flow layout for clean visualization) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {steps.slice(5, 10).map((step) => {
              const IconComp = step.icon;
              return (
                <div
                  key={step.id}
                  onClick={() => {
                    setActiveTab(step.tab);
                    if (onClose) onClose();
                  }}
                  className={`
                    p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative group hover:shadow-md
                    ${
                      step.isCompleted
                        ? 'bg-emerald-50/60 border-emerald-300 hover:border-emerald-500'
                        : 'bg-white border-zinc-200 hover:border-zinc-400'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[11px] font-bold text-zinc-900 leading-tight">
                      {step.title}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                        step.isCompleted ? 'bg-emerald-800 text-white' : 'bg-zinc-100 text-zinc-400'
                      }`}
                    >
                      {step.isCompleted ? <Check className="w-3 h-3" /> : step.id}
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-600 leading-snug whitespace-pre-line">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Down Arrow into Final Output Box */}
          <div className="flex justify-center py-2">
            <ArrowDown className="w-6 h-6 text-emerald-800" />
          </div>

          {/* Final Output Summary Box */}
          <div className="p-4 rounded-xl border-2 border-zinc-800 bg-zinc-50 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider text-center border-b border-zinc-300 pb-2">
              Final Output
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] font-semibold text-zinc-800">
              <span className="p-2 rounded bg-white border border-zinc-200 shadow-2xs">
                • Paper Summary
              </span>
              <span className="p-2 rounded bg-white border border-zinc-200 shadow-2xs">
                • Limitations
              </span>
              <span className="p-2 rounded bg-white border border-zinc-200 shadow-2xs">
                • Research Gaps
              </span>
              <span className="p-2 rounded bg-white border border-zinc-200 shadow-2xs">
                • Selected Enhancements
              </span>
              <span className="p-2 rounded bg-white border border-zinc-200 shadow-2xs">
                • Enhanced Architecture
              </span>
              <span className="p-2 rounded bg-white border border-zinc-200 shadow-2xs">
                • Software Modules
              </span>
              <span className="p-2 rounded bg-white border border-zinc-200 shadow-2xs">
                • Validation Results
              </span>
              <span className="p-2 rounded bg-emerald-800 text-white shadow-2xs font-bold">
                • Final Report (PDF)
              </span>
            </div>
          </div>
        </div>

        {/* Side Callout Box - Important Notice */}
        <div className="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-serif font-bold text-zinc-900 border-b border-amber-200 pb-2">
              Important
            </h3>
            <p className="text-xs text-zinc-800 font-medium leading-relaxed">
              The system analyzes <strong>only the uploaded paper</strong>.
            </p>
            <ul className="space-y-2 text-xs text-zinc-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold">•</span>
                <span>
                  <strong>No fixed project data.</strong> Every gap and module is derived from paper text.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold">•</span>
                <span>
                  <strong>No random default values.</strong> Metrics are calibrated against IEEE benchmarks.
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-amber-200/80 text-[10px] text-zinc-500">
            Strict IEEE InnovateX Methodological Integrity Standard
          </div>
        </div>
      </div>
    </div>
  );
};
