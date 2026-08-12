import React, { useState } from 'react';
import { PaperEvidence, GroundedLimitation, GroundedResearchGap, EnhancementRecommendation, PredictionMetric } from '../../types';
import { FileText, ShieldAlert, Sparkles, Zap, Layers, CheckCircle2, ChevronRight, ArrowRight, Check } from 'lucide-react';

export interface TraceabilityChainItem {
  id: string;
  evidence: PaperEvidence;
  limitation: GroundedLimitation;
  gap: GroundedResearchGap;
  enhancement: EnhancementRecommendation;
  moduleName: string;
  metric: PredictionMetric | { metricName: string; baselineValue: string; enhancedValue: string; status: string };
}

interface InteractiveTraceabilityChainProps {
  items: TraceabilityChainItem[];
  className?: string;
}

type StepType = 'evidence' | 'limitation' | 'gap' | 'enhancement' | 'module' | 'validation';

export const InteractiveTraceabilityChain: React.FC<InteractiveTraceabilityChainProps> = ({
  items,
  className = ''
}) => {
  const [selectedChainIndex, setSelectedChainIndex] = useState<number>(0);
  const [selectedStep, setSelectedStep] = useState<StepType>('evidence');

  if (!items || items.length === 0) {
    return (
      <div className={`bg-white rounded-2xl border border-zinc-200 p-6 text-center text-xs text-zinc-500 ${className}`}>
        No traceability chain items available.
      </div>
    );
  }

  const currentItem = items[selectedChainIndex] || items[0];

  const steps: { id: StepType; label: string; icon: any }[] = [
    { id: 'evidence', label: '1. Paper Evidence', icon: FileText },
    { id: 'limitation', label: '2. Limitation', icon: ShieldAlert },
    { id: 'gap', label: '3. Research Gap', icon: Sparkles },
    { id: 'enhancement', label: '4. Enhancement', icon: Zap },
    { id: 'module', label: '5. Software Module', icon: Layers },
    { id: 'validation', label: '6. Validation Target', icon: CheckCircle2 }
  ];

  return (
    <div className={`bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            End-to-End Verification Chain
          </span>
          <h3 className="text-base font-bold text-zinc-900 mt-1 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-800" />
            Interactive Evidence Traceability Chain
          </h3>
          <p className="text-xs text-zinc-500">
            Click any step in the chain to inspect verbatim paper quotes and software transformations
          </p>
        </div>

        {/* Chain Switcher if multiple items exist */}
        {items.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedChainIndex(idx)}
                className={`
                  px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border
                  ${
                    selectedChainIndex === idx
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }
                `}
              >
                Chain #{idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Horizontal Flow Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isActive = selectedStep === step.id;

          return (
            <button
              key={step.id}
              onClick={() => setSelectedStep(step.id)}
              className={`
                p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 shadow-2xs
                ${
                  isActive
                    ? 'bg-emerald-800 text-white border-emerald-900 ring-2 ring-emerald-600'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <StepIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-800'}`} />
                <span className={`text-[9px] font-bold ${isActive ? 'text-emerald-200' : 'text-zinc-400'}`}>
                  STEP
                </span>
              </div>
              <span className="text-xs font-bold leading-snug">{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step Inspector Panel */}
      <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4 animate-in fade-in duration-150">
        {selectedStep === 'evidence' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-800" />
                Paper Evidence Passage
              </span>
              <span className="text-[10px] font-mono bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded">
                Section: {currentItem.evidence.section || 'Methodology'} | Page {currentItem.evidence.page || 'N/A'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200 italic text-xs text-zinc-800 leading-relaxed">
              "{currentItem.evidence.quoteOrExcerpt || 'Extract demonstrating system limitation.'}"
            </div>

            <p className="text-[11px] text-zinc-500">
              Source: Grounded direct extraction from uploaded IEEE paper text.
            </p>
          </div>
        )}

        {selectedStep === 'limitation' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-700" />
                Original System Limitation
              </span>
              <span className="text-[10px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                Grounded Limitation
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-rose-200 text-xs text-zinc-800 space-y-1">
              <p className="font-bold text-rose-950 text-sm">{currentItem.limitation.title}</p>
              <p className="text-zinc-600 leading-relaxed">{currentItem.limitation.explanation}</p>
            </div>
          </div>
        )}

        {selectedStep === 'gap' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Identified Research Gap
              </span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                Gap Type: {currentItem.gap.gapType || 'Technical'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-amber-200 text-xs text-zinc-800 space-y-1">
              <p className="font-bold text-amber-950 text-sm">{currentItem.gap.title}</p>
              <p className="text-zinc-600 leading-relaxed">{currentItem.gap.explanation}</p>
            </div>
          </div>
        )}

        {selectedStep === 'enhancement' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-800" />
                Selected Software Enhancement
              </span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Relevance Score: {currentItem.enhancement.relevanceScore}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-emerald-200 text-xs text-zinc-800 space-y-2">
              <p className="font-bold text-emerald-950 text-sm">{currentItem.enhancement.title}</p>
              <p className="text-zinc-600 leading-relaxed">{currentItem.enhancement.rationale}</p>
              <p className="text-[#064E3B] font-semibold">Approach: {currentItem.enhancement.implementationApproach}</p>
            </div>
          </div>
        )}

        {selectedStep === 'module' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-800" />
                New Software Module Architecture
              </span>
              <span className="text-[10px] font-bold bg-emerald-800 text-white px-2 py-0.5 rounded">
                Software-Only
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200 font-mono text-xs text-zinc-800 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <span className="font-bold text-emerald-900">{currentItem.moduleName}</span>
                <span className="text-[10px] text-zinc-400">TypeScript Module</span>
              </div>
              <p className="text-zinc-600 font-sans text-xs">
                Encapsulates algorithmic optimization without modifying hardware dependencies.
              </p>
            </div>
          </div>
        )}

        {selectedStep === 'validation' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                Target Metric & Validation Status
              </span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Status: {currentItem.metric.status}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-emerald-200 text-xs text-zinc-800 space-y-2">
              <p className="font-bold text-zinc-900 text-sm">{currentItem.metric.metricName}</p>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
                <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                  <span className="block text-[10px] text-zinc-500">Baseline Value</span>
                  <span className="font-semibold text-zinc-800">{currentItem.metric.baselineValue}</span>
                </div>
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                  <span className="block text-[10px] text-emerald-800">Target Value</span>
                  <span className="font-bold text-emerald-900">{currentItem.metric.enhancedValue}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
