import React, { useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { RelevanceRating, InsightFeedback } from '../../types';
import { ThumbsUp, ThumbsDown, Sparkles, CheckCircle2, MessageSquare, CornerDownRight } from 'lucide-react';

interface InsightFeedbackControlProps {
  itemId: string;
  itemType: 'limitation' | 'research_gap' | 'result' | 'summary' | 'evidence';
  itemTitle: string;
  existingFeedback?: InsightFeedback;
  compact?: boolean;
}

export const InsightFeedbackControl: React.FC<InsightFeedbackControlProps> = ({
  itemId,
  itemType,
  itemTitle,
  existingFeedback,
  compact = false,
}) => {
  const { activePaper, submitInsightFeedback } = usePaperContext();
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState(existingFeedback?.comment || '');

  if (!activePaper) return null;

  // Retrieve current paper feedback state if exists
  const currentFeedback = existingFeedback || (activePaper.feedbackMap ? activePaper.feedbackMap[itemId] : undefined);

  const handleRate = async (rating: RelevanceRating) => {
    await submitInsightFeedback(activePaper.id, {
      itemId,
      itemType,
      itemTitle,
      rating,
      comment: commentText.trim() || undefined,
    });
  };

  const handleSaveComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFeedback) {
      await handleRate('relevant');
    } else {
      await submitInsightFeedback(activePaper.id, {
        itemId,
        itemType,
        itemTitle,
        rating: currentFeedback.rating,
        comment: commentText.trim() || undefined,
      });
    }
    setIsCommentOpen(false);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mr-1">
          Insight Relevance:
        </span>

        <button
          onClick={() => handleRate('relevant')}
          className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
            currentFeedback?.rating === 'relevant'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
          title="Rate as Highly Relevant"
        >
          <ThumbsUp className="w-3 h-3" />
          <span>Relevant</span>
        </button>

        <button
          onClick={() => handleRate('somewhat_relevant')}
          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
            currentFeedback?.rating === 'somewhat_relevant'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
          title="Rate as Somewhat Relevant"
        >
          <span>Partial</span>
        </button>

        <button
          onClick={() => handleRate('irrelevant')}
          className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
            currentFeedback?.rating === 'irrelevant'
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
          title="Rate as Irrelevant or Misinterpreted"
        >
          <ThumbsDown className="w-3 h-3" />
          <span>Irrelevant</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
            Gemini Extraction Accuracy:
          </span>

          {currentFeedback && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Feedback Saved</span>
            </span>
          )}
        </div>

        {/* Rating Pills */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleRate('relevant')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              currentFeedback?.rating === 'relevant'
                ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-2xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>High Relevance</span>
          </button>

          <button
            onClick={() => handleRate('somewhat_relevant')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              currentFeedback?.rating === 'somewhat_relevant'
                ? 'bg-amber-600 dark:bg-amber-700 text-white shadow-2xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <span>Partial</span>
          </button>

          <button
            onClick={() => handleRate('irrelevant')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              currentFeedback?.rating === 'irrelevant'
                ? 'bg-rose-700 dark:bg-rose-800 text-white shadow-2xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>Irrelevant</span>
          </button>

          <button
            onClick={() => setIsCommentOpen(!isCommentOpen)}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Add specific feedback comment"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Optional Comment Input Form */}
      {isCommentOpen && (
        <form onSubmit={handleSaveComment} className="pt-1 flex items-center gap-2">
          <CornerDownRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Optional comment (e.g. 'Missing page 4 metric context')"
            className="flex-1 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded-lg bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
          >
            Save Note
          </button>
        </form>
      )}

      {currentFeedback?.comment && !isCommentOpen && (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic pl-5">
          Note: "{currentFeedback.comment}"
        </p>
      )}
    </div>
  );
};
