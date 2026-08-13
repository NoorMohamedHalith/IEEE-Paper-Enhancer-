import React, { useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { AIWorkflowDiagram } from '../common/AIWorkflowDiagram';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export const WorkflowStepper: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          AI-Powered WorkFLOW Engine
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg hover:bg-zinc-50 transition-colors shadow-2xs"
        >
          <span>{isExpanded ? 'Hide Workflow Diagram' : 'Show 17-Step AI Workflow'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && <AIWorkflowDiagram />}
    </div>
  );
};
