import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  message: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon: Icon,
  title,
  message,
  actionButton,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-zinc-200 p-8 sm:p-12 text-center shadow-2xs ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-zinc-900 mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed mb-6">
        {message}
      </p>

      {actionButton && (
        <button
          onClick={actionButton.onClick}
          className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-2xs transition-all hover:shadow"
        >
          {actionButton.label}
        </button>
      )}
    </div>
  );
};
