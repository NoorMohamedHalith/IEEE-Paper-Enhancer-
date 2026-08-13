import React, { useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { NavigationTab, WorkflowStep17Status } from '../../types';
import { syncWorkflowFromPaper, INITIAL_17_STEPS } from '../../services/ai/workflowEngine';
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
  ArrowDown,
  Lock,
  Play,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp
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
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);

  const workflowSteps = activePaper ? syncWorkflowFromPaper(activePaper) : INITIAL_17_STEPS.map((s, idx) => ({
    ...s,
    status: (idx === 0 ? 'AVAILABLE' : 'LOCKED') as WorkflowStep17Status,
  }));

  const getStatusBadge = (status: WorkflowStep17Status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
            <Check className="w-2.5 h-2.5" /> Completed
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-300 animate-pulse">
            <Play className="w-2.5 h-2.5 fill-current" /> Running
          </span>
        );
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
            Available
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-300">
            <AlertCircle className="w-2.5 h-2.5" /> Failed
          </span>
        );
      case 'SKIPPED':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
            Skipped
          </span>
        );
      case 'LOCKED':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
            <Lock className="w-2.5 h-2.5" /> Locked
          </span>
        );
    }
  };

  const selectedStep = workflowSteps.find((s) => s.id === selectedStepId);

  return (
    <div
      className={`bg-white rounded-2xl border border-zinc-200 shadow-xl p-5 sm:p-7 space-y-6 max-w-6xl mx-auto font-sans ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              17-Step Research-Grade Workflow Engine
            </span>
            {activePaper?.qualityScoreBreakdown && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded border border-emerald-300">
                Quality Score: {activePaper.qualityScoreBreakdown.overallScore}/100
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 mt-1 underline decoration-emerald-800 underline-offset-4">
            AI-Powered Execution Engine Flow
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

      {/* 17-Step Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {workflowSteps.map((step) => {
          const isSelected = selectedStepId === step.id;
          return (
            <div
              key={step.id}
              onClick={() => {
                setSelectedStepId(isSelected ? null : step.id);
                if (step.stage) setActiveTab(step.stage as NavigationTab);
              }}
              className={`
                p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative group hover:shadow-md
                ${
                  step.status === 'COMPLETED'
                    ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-500'
                    : step.status === 'RUNNING'
                    ? 'bg-blue-50 border-blue-400'
                    : step.status === 'AVAILABLE'
                    ? 'bg-amber-50/50 border-amber-300 hover:border-amber-400'
                    : 'bg-zinc-50/60 border-zinc-200 opacity-80 hover:opacity-100'
                }
              `}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-[11px] font-bold text-zinc-900 leading-tight">
                  {step.name}
                </span>
                <div className="shrink-0">{getStatusBadge(step.status)}</div>
              </div>

              <p className="text-[10px] text-zinc-600 leading-snug line-clamp-2">
                {step.description}
              </p>

              <div className="pt-1 flex items-center justify-between text-[9px] text-zinc-500 border-t border-zinc-200/60">
                <span className="font-semibold text-emerald-900 uppercase">{step.stage}</span>
                <span className="flex items-center gap-0.5 text-zinc-700 font-medium">
                  <Eye className="w-2.5 h-2.5" /> Details
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Step Inspector Modal/Drawer */}
      {selectedStep && (
        <div className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/40 space-y-3 transition-all animate-fadeIn">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-900">{selectedStep.name}</span>
              {getStatusBadge(selectedStep.status)}
            </div>
            <button
              onClick={() => setSelectedStepId(null)}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-900"
            >
              Close Step Inspector ✕
            </button>
          </div>

          <p className="text-xs text-zinc-700 leading-relaxed">{selectedStep.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Step Inputs */}
            <div className="p-3 bg-white rounded-lg border border-zinc-200">
              <span className="font-bold text-zinc-900 uppercase tracking-wider block mb-1 text-[10px]">
                Step Inputs
              </span>
              <pre className="text-[10px] text-zinc-700 font-mono overflow-x-auto whitespace-pre-wrap">
                {selectedStep.input
                  ? JSON.stringify(selectedStep.input, null, 2)
                  : 'Pending workflow trigger'}
              </pre>
            </div>

            {/* Step Outputs */}
            <div className="p-3 bg-white rounded-lg border border-zinc-200">
              <span className="font-bold text-zinc-900 uppercase tracking-wider block mb-1 text-[10px]">
                Step Outputs
              </span>
              <pre className="text-[10px] text-zinc-700 font-mono overflow-x-auto whitespace-pre-wrap">
                {selectedStep.output
                  ? JSON.stringify(selectedStep.output, null, 2)
                  : 'Pending step execution completion'}
              </pre>
            </div>

            {/* Validation Layer */}
            <div className="p-3 bg-white rounded-lg border border-zinc-200">
              <span className="font-bold text-zinc-900 uppercase tracking-wider block mb-1 text-[10px]">
                Validation Layer
              </span>
              <pre className="text-[10px] text-zinc-700 font-mono overflow-x-auto whitespace-pre-wrap">
                {selectedStep.validation
                  ? JSON.stringify(selectedStep.validation, null, 2)
                  : 'Pending verification run'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Output Deliverables Summary */}
      <div className="p-4 rounded-xl border-2 border-zinc-800 bg-zinc-50 space-y-3">
        <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider text-center border-b border-zinc-300 pb-2">
          Research-Grade Deliverables
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] font-semibold text-zinc-800">
          <span className="p-2 rounded bg-white border border-zinc-200 shadow-2xs">
            • IEEE PDF Chunk Index
          </span>
          <span className="p-2 rounded bg-white border border-zinc-200 shadow-2xs">
            • OCR Density Verification
          </span>
          <span className="p-2 rounded bg-white border border-zinc-200 shadow-2xs">
            • Grounded Evidence Quotes
          </span>
          <span className="p-2 rounded bg-white border border-zinc-200 shadow-2xs">
            • Traceability Matrix
          </span>
          <span className="p-2 rounded bg-white border border-zinc-200 shadow-2xs">
            • 9-Tech Suitability Matrix
          </span>
          <span className="p-2 rounded bg-white border border-zinc-200 shadow-2xs">
            • Post-AI Claim Verifications
          </span>
          <span className="p-2 rounded bg-white border border-zinc-200 shadow-2xs">
            • Mathematical Quality Score
          </span>
          <span className="p-2 rounded bg-emerald-800 text-white shadow-2xs font-bold">
            • Final IEEE Proposal (PDF)
          </span>
        </div>
      </div>
    </div>
  );
};

