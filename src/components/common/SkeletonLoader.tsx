import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'table' | 'banner';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 1,
  className = '',
}) => {
  const items = Array.from({ length: count });

  if (type === 'banner') {
    return (
      <div className={`p-6 rounded-2xl glass-panel border border-cyan-500/30 neon-glow-cyan animate-pulse space-y-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-2 flex-1">
            <div className="w-1/3 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="w-1/2 h-3 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
          </div>
        </div>
        <div className="w-full h-16 rounded-xl bg-zinc-200/50 dark:bg-zinc-800/50" />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`space-y-3 p-4 rounded-2xl glass-panel border border-zinc-200 dark:border-zinc-800 ${className}`}>
        <div className="w-full h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        {items.map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800/50">
            <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="w-3/4 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-1/2 h-2.5 rounded bg-zinc-200/60 dark:bg-zinc-800/60 animate-pulse" />
            </div>
            <div className="w-16 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl glass-panel border border-zinc-200 dark:border-zinc-800 shadow-2xs animate-pulse space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-24 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 dark:bg-cyan-500/30" />
          </div>
          <div className="w-3/4 h-6 rounded-md bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-2 pt-2">
            <div className="w-full h-3 rounded bg-zinc-200/60 dark:bg-zinc-800/60" />
            <div className="w-5/6 h-3 rounded bg-zinc-200/60 dark:bg-zinc-800/60" />
          </div>
        </div>
      ))}
    </div>
  );
};
