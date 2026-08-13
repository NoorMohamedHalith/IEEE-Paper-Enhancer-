import React, { useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { WORKFLOW_STEPS, WorkflowStepId } from '../../types';
import { Check, ArrowRight, Network, Sparkles } from 'lucide-react';
import { AIWorkflowDiagram } from '../common/AIWorkflowDiagram';

export const WorkflowStepper: React.FC = () => {
  const { activeTab, setActiveTab, activePaper } = usePaperContext();
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);

  // Determine current step index based on activeTab
  const currentStep = WORKFLOW_STEPS.find((s) => s.tab === activeTab) || WORKFLOW_STEPS[0];

  return (
    <>
      <div className="bg-white border border-zinc-200 rounded-xl p-3 sm:p-4 shadow-2xs mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Research Enhancement Pipeline
            </span>
            <span className="text-xs text-zinc-400">|</span>
            <span className="text-xs text-zinc-600 font-medium">
              Step {currentStep.id} of 6: <strong className="text-zinc-900">{currentStep.name}</strong>
            </span>
          </div>

          <button
            onClick={() => setShowWorkflowModal(true)}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Network className="w-3.5 h-3.5 text-emerald-800" />
            <span>View 10-Step AI Workflow</span>
          </button>
        </div>

      {/* Stepper Track */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {WORKFLOW_STEPS.map((step) => {
          const isCurrent = step.tab === activeTab;
          const isPassed = step.id < currentStep.id;

          // Check paper stage completed status based on actual work performed
          let isCompleted = false;
          if (activePaper) {
            const isAnalyzed = activePaper.status === 'Analyzed' && activePaper.analysis !== undefined;
            const hasApprovedGaps = (activePaper.approvedGapIds?.length || 0) > 0;
            const hasSelectedEnhancements = (activePaper.selectedEnhancementIds?.length || 0) > 0;
            const hasValidatedEnhancements = (activePaper.validatedEnhancementIds?.length || 0) > 0 && activePaper.projectStatus === 'Validated';
            const isProjectGenerated = activePaper.projectStatus === 'Project Generated' || activePaper.projectStatus === 'Validated';

            if (step.id === 1) isCompleted = true; // Paper is imported/selected
            if (step.id === 2) isCompleted = isAnalyzed; // AI Analysis done
            if (step.id === 3) isCompleted = isAnalyzed && hasApprovedGaps; // Research Gaps approved
            if (step.id === 4) isCompleted = isAnalyzed && hasSelectedEnhancements; // Enhancements selected
            if (step.id === 5) isCompleted = isAnalyzed && hasValidatedEnhancements; // Validation completed
            if (step.id === 6) isCompleted = isAnalyzed && isProjectGenerated && hasValidatedEnhancements; // Final Spec ready
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
                    : isCompleted
                    ? 'bg-emerald-50/30 border-emerald-200/80 hover:bg-emerald-50/60 text-zinc-900'
                    : 'bg-zinc-50/60 border-zinc-200 text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-800'
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
                      ? 'bg-emerald-700 text-white'
                      : 'bg-zinc-200 text-zinc-600'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-emerald-800'}`} />
                ) : (
                  step.id
                )}
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

      {showWorkflowModal && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <AIWorkflowDiagram onClose={() => setShowWorkflowModal(false)} isModal={true} />
        </div>
      )}
    </>
  );
};
