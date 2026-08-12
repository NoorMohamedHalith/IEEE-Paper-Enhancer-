import React, { useState } from 'react';
import { TraceabilityNode } from '../../types';
import { GitCommit, ArrowRight, FileText, AlertTriangle, AlertCircle, Sparkles, Box, CheckCircle2, Maximize2, Minimize2 } from 'lucide-react';

interface TraceabilityDiagramProps {
  nodes?: TraceabilityNode[];
  className?: string;
}

export const TraceabilityDiagram: React.FC<TraceabilityDiagramProps> = ({ nodes = [], className = '' }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!nodes || nodes.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 text-center shadow-2xs ${className}`}>
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
          <GitCommit className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-800 mb-1">Evidence & Enhancement Traceability</h3>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          No data until real analysis exists.
        </p>
      </div>
    );
  }

  const steps = [
    { key: 'paperEvidence', label: 'Paper Evidence', icon: FileText, color: 'bg-slate-100 text-slate-800 border-slate-300' },
    { key: 'originalLimitation', label: 'Original Limitation', icon: AlertTriangle, color: 'bg-rose-50 text-rose-800 border-rose-200' },
    { key: 'researchGap', label: 'Research Gap', icon: AlertCircle, color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { key: 'enhancement', label: 'Enhancement', icon: Sparkles, color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
    { key: 'newSoftwareModule', label: 'New Software Module', icon: Box, color: 'bg-indigo-50 text-indigo-900 border-indigo-200' },
    { key: 'validationMetric', label: 'Validation Metric', icon: CheckCircle2, color: 'bg-teal-50 text-teal-900 border-teal-200' },
  ] as const;

  return (
    <div
      className={`
        bg-white rounded-xl border border-zinc-200 p-5 sm:p-6 shadow-2xs transition-all
        ${isFullscreen ? 'fixed inset-4 z-50 overflow-y-auto shadow-2xl border-emerald-800' : ''}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-200">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-emerald-800" />
            End-to-End Evidence Traceability
          </h3>
          <p className="text-xs text-zinc-500">
            Linear proof mapping from original paper text to software module and validation metrics
          </p>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg border border-zinc-200 text-xs flex items-center gap-1.5 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fit to Screen / Expand'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fit View'}</span>
        </button>
      </div>

      {/* Traceability Chains List */}
      <div className="space-y-6">
        {nodes.map((node, index) => (
          <div key={index} className="bg-zinc-50/70 rounded-xl border border-zinc-200 p-4">
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-800">Chain #{index + 1}</span>
              <span>Evidence Trail</span>
            </div>

            {/* Horizontal Flow on Desktop, Vertical Stack on Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative">
              {steps.map((step, stepIdx) => {
                const Icon = step.icon;
                const value = node[step.key as keyof TraceabilityNode];

                return (
                  <div key={step.key} className="relative flex flex-col justify-between">
                    <div className={`p-3 rounded-lg border h-full ${step.color} shadow-2xs`}>
                      <div className="flex items-center gap-1.5 mb-1.5 font-bold text-[11px]">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{step.label}</span>
                      </div>
                      <p className="text-xs leading-snug line-clamp-4 font-normal">
                        {value || 'N/A'}
                      </p>
                    </div>

                    {/* Step Connector Arrow */}
                    {stepIdx < steps.length - 1 && (
                      <div className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-white border border-zinc-300 items-center justify-center text-zinc-400">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
