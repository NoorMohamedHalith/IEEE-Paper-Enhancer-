import React from 'react';
import { ResultState, EvidenceSourceType } from '../../types';
import { ShieldCheck, Sparkles, Zap, Activity, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export type ProvenanceType =
  | 'PAPER_REPORTED'
  | 'EXPLICIT'
  | 'DERIVED'
  | 'AI_INFERRED'
  | 'INFERRED'
  | 'PROPOSED'
  | 'MEASURED'
  | 'SIMULATED'
  | 'ESTIMATED'
  | 'UNVERIFIED'
  | 'NOT_AVAILABLE';

interface ProvenanceBadgeProps {
  type: ProvenanceType | ResultState | EvidenceSourceType | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  type,
  size = 'md',
  className = '',
  showIcon = true,
}) => {
  const normType = String(type || '').toUpperCase().replace(/\s+/g, '_');

  let label = 'ESTIMATED';
  let badgeStyle = 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800';
  let IconComponent = Zap;

  if (normType === 'PAPER_REPORTED' || normType === 'EXPLICIT') {
    label = 'PAPER REPORTED';
    badgeStyle = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 font-bold';
    IconComponent = ShieldCheck;
  } else if (normType === 'DERIVED') {
    label = 'DERIVED FROM TEXT';
    badgeStyle = 'bg-teal-100 dark:bg-teal-950/80 text-teal-900 dark:text-teal-200 border-teal-300 dark:border-teal-800 font-semibold';
    IconComponent = ShieldCheck;
  } else if (normType === 'AI_INFERRED' || normType === 'INFERRED') {
    label = 'AI INFERRED';
    badgeStyle = 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-800';
    IconComponent = Sparkles;
  } else if (normType === 'PROPOSED') {
    label = 'PROPOSED ENHANCEMENT';
    badgeStyle = 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-900 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800';
    IconComponent = Zap;
  } else if (normType === 'MEASURED') {
    label = 'MEASURED (BENCHMARKED)';
    badgeStyle = 'bg-emerald-800 text-white border-emerald-900 font-extrabold shadow-2xs';
    IconComponent = CheckCircle2;
  } else if (normType === 'SIMULATED') {
    label = 'SIMULATED';
    badgeStyle = 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800';
    IconComponent = Activity;
  } else if (normType === 'ESTIMATED') {
    label = 'ESTIMATED ONLY (AI)';
    badgeStyle = 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800';
    IconComponent = Zap;
  } else if (normType === 'UNVERIFIED') {
    label = 'UNVERIFIED CLAIM';
    badgeStyle = 'bg-red-100 dark:bg-red-950/80 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800 font-bold';
    IconComponent = AlertTriangle;
  } else if (normType === 'NOT_AVAILABLE' || normType === 'NOT_AVAILABLE') {
    label = 'NOT AVAILABLE';
    badgeStyle = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
    IconComponent = HelpCircle;
  }

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.2 rounded gap-1',
    md: 'text-[10px] px-2 py-0.5 rounded-md gap-1.5',
    lg: 'text-xs px-2.5 py-1 rounded-lg gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono uppercase tracking-wider border leading-none shrink-0 ${sizeClasses} ${badgeStyle} ${className}`}
      title={`Provenance: ${label}`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />}
      <span>{label}</span>
    </span>
  );
};
