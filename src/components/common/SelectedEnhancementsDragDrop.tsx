import React, { useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { EnhancementRecommendation } from '../../types';
import { GripVertical, ChevronUp, ChevronDown, Trash2, Zap, ArrowRight, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface SelectedEnhancementsDragDropProps {
  paperId: string;
  recommendations: EnhancementRecommendation[];
  selectedIds: string[];
}

export const SelectedEnhancementsDragDrop: React.FC<SelectedEnhancementsDragDropProps> = ({
  paperId,
  recommendations,
  selectedIds,
}) => {
  const { reorderSelectedEnhancements, toggleEnhancementSelection } = usePaperContext();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Filter and order selected recommendations matching selectedIds sequence
  const selectedRecs = selectedIds
    .map((id) => recommendations.find((r) => r.id === id))
    .filter((r): r is EnhancementRecommendation => r !== undefined);

  if (selectedRecs.length === 0) {
    return (
      <div className="bg-[#F8FAFC] rounded-2xl border border-dashed border-[#CBD5E1] p-6 text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
          <Zap className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-zinc-900">No Enhancements Selected for Implementation</h3>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Click "Select Enhancement" on any recommendation card below to add it to your prioritized implementation queue.
        </p>
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Set transparent drag image or standard HTML5 ghost
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const updatedIds = [...selectedIds];
    const [movedId] = updatedIds.splice(draggedIndex, 1);
    updatedIds.splice(dropIndex, 0, movedId);

    reorderSelectedEnhancements(paperId, updatedIds);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updatedIds = [...selectedIds];
    const [movedId] = updatedIds.splice(index, 1);
    updatedIds.splice(index - 1, 0, movedId);
    reorderSelectedEnhancements(paperId, updatedIds);
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedIds.length - 1) return;
    const updatedIds = [...selectedIds];
    const [movedId] = updatedIds.splice(index, 1);
    updatedIds.splice(index + 1, 0, movedId);
    reorderSelectedEnhancements(paperId, updatedIds);
  };

  const handleRemove = (recId: string) => {
    toggleEnhancementSelection(paperId, recId);
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-800/20 p-5 sm:p-6 shadow-sm space-y-4">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
              Interactive Queue
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              {selectedRecs.length} {selectedRecs.length === 1 ? 'Module' : 'Modules'} Prioritized
            </span>
          </div>
          <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-800" />
            Selected Enhancements (Prioritized Implementation Order)
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Drag and drop or use arrows to reorder proposed software modules. Implementation sequence auto-saves instantly.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
          <span>Auto-Saved Sequence</span>
        </div>
      </div>

      {/* Drag and Drop List */}
      <div className="space-y-2.5">
        {selectedRecs.map((rec, index) => {
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={rec.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                group relative bg-zinc-50/90 hover:bg-white rounded-xl border p-3.5 transition-all flex items-center justify-between gap-3 text-xs cursor-grab active:cursor-grabbing select-none
                ${
                  isDragging
                    ? 'opacity-40 border-dashed border-emerald-800 bg-emerald-50 scale-[0.99]'
                    : isDragOver
                    ? 'border-emerald-800 ring-2 ring-emerald-800/20 bg-emerald-50/50'
                    : 'border-zinc-200 hover:border-emerald-800/40 hover:shadow-xs'
                }
              `}
            >
              {/* Drag Handle & Priority Rank */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-1 rounded-md text-zinc-400 group-hover:text-emerald-800 transition-colors">
                  <GripVertical className="w-4 h-4" />
                </div>

                <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                  #{index + 1}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-200">
                      {rec.category}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold">
                      Relevance Score: {rec.relevanceScore}%
                    </span>
                  </div>
                  <h4 className="font-bold text-zinc-900 truncate">{rec.title}</h4>
                  <p className="text-[11px] text-zinc-500 truncate max-w-lg">
                    {rec.traceabilityLink?.newSoftwareModule ? `Software Module: ${rec.traceabilityLink.newSoftwareModule}` : rec.implementationApproach}
                  </p>
                </div>
              </div>

              {/* Action Controls: Up, Down, Remove */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveUp(index);
                    }}
                    disabled={index === 0}
                    className="p-1 rounded bg-white hover:bg-zinc-100 border border-zinc-200 disabled:opacity-30 disabled:hover:bg-white text-zinc-600 transition-colors"
                    title="Move Up in Priority"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveDown(index);
                    }}
                    disabled={index === selectedRecs.length - 1}
                    className="p-1 rounded bg-white hover:bg-zinc-100 border border-zinc-200 disabled:opacity-30 disabled:hover:bg-white text-zinc-600 transition-colors"
                    title="Move Down in Priority"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(rec.id);
                  }}
                  className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                  title="Remove from Selected Enhancements"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
