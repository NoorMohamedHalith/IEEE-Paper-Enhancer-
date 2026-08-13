import React from 'react';
import { motion } from 'motion/react';
import { FileUp, Sparkles, AlertCircle, Search, Layers, Compass } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'upload' | 'sparkles' | 'alert' | 'search' | 'layers' | 'compass';
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'upload',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const renderIcon = () => {
    switch (icon) {
      case 'sparkles':
        return <Sparkles className="w-8 h-8 text-lime-500 dark:text-lime-400" />;
      case 'alert':
        return <AlertCircle className="w-8 h-8 text-amber-500 dark:text-amber-400" />;
      case 'search':
        return <Search className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />;
      case 'layers':
        return <Layers className="w-8 h-8 text-purple-500 dark:text-purple-400" />;
      case 'compass':
        return <Compass className="w-8 h-8 text-pink-500 dark:text-pink-400" />;
      default:
        return <FileUp className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 glass-panel rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl relative overflow-hidden my-6">
      {/* Background Soft Neon Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Animated Icon Badge */}
      <motion.div
        animate={{
          y: [0, -6, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="w-16 h-16 rounded-2xl glass-panel border border-cyan-400/40 neon-glow-cyan flex items-center justify-center mb-5 shadow-lg relative z-10"
      >
        {renderIcon()}
      </motion.div>

      {/* Title & Description */}
      <div className="max-w-md space-y-2 relative z-10">
        <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
          {description}
        </p>
      </div>

      {/* CTAs */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 relative z-10">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold shadow-md hover:shadow-cyan-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-2 border border-brand-border"
            >
              <span>{actionLabel}</span>
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
