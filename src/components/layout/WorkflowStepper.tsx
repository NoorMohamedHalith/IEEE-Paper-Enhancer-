import React from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { WORKFLOW_STEPS, WorkflowStepId } from '../../types';
import { Check, ArrowRight } from 'lucide-react';

export const WorkflowStepper: React.FC = () => {
  const { activeTab, setActiveTab, activePaper } = usePaperContext();

  // Determine current step index based on activeTab
  const currentStep = WORKFLOW_STEPS.find((s) => s.tab === activeTab) || WORKFLOW_STEPS[0];

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-3 sm:p-4 shadow-2xs mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Research Enhancement Pipeline
          </span>
          <span className="text-xs text-zinc-400">|</span>
          <span className="text-xs text-zinc-600 font-medium">
            Step {currentStep.id} of 6: <strong className="text-zinc-900">{currentStep.name}</strong>
          </span>
        </div>
      </div>

      {/* Stepper Track */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {WORKFLOW_STEPS.map((step) => {
          const isCurrent = step.tab === activeTab;
          const isPassed = step.id < currentStep.id;

          // Check paper stage completed status
          let isCompleted = false;
          if (activePaper) {
            if (step.id === 1 && activePaper) isCompleted = true;
            if (step.id === 2 && activePaper.status === 'Analyzed') isCompleted = true;
            if (step.id === 3 && activePaper.analysis?.researchGaps.length) isCompleted = true;
            if (step.id === 4 && (activePaper.selectedEnhancementIds?.length || 0) > 0) isCompleted = true;
            if (step.id === 5 && (activePaper.validatedEnhancementIds?.length || 0) > 0) isCompleted = true;
            if (step.id === 6 && activePaper.validatedEnhancementIds?.length) isCompleted = true;
          }

          return (
            <button
              key={step.id}
              onClick={() => setActiveTab(step.tab)}
              className={`
                relative flex items-center gap-2 p-2.5 rounded-lg text-left transition-all border
                ${
                  isCurrent
                    ? 'bg-emerald-50/80 border-emerald-800 ring-1 ring-emerald-800 text-emerald-950 font-semibold shadow-2xs'
                    : isCompleted || isPassed
                    ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100/80 text-zinc-800'
                    : 'bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50'
                }
              `}
            >
              {/* Step Badge / Icon */}
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors
                  ${
                    isCurrent
                      ? 'bg-emerald-800 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-zinc-200 text-zinc-600'
                  }
                `}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : step.id}
              </div>

              {/* Step Label */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{step.name}</p>
                <p className="text-[10px] text-zinc-500 truncate hidden xl:block">
                  {step.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
