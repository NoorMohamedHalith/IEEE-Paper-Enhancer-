import React from 'react';
import { BeforeAfterData } from '../../types';
import { ArrowRight, Layers, Cpu, ShieldAlert, Zap, CheckCircle2 } from 'lucide-react';

interface BeforeAfterComparisonProps {
  data?: BeforeAfterData;
  className?: string;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({ data, className = '' }) => {
  if (!data) {
    return (
      <div className={`bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 text-center shadow-2xs ${className}`}>
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-800 mb-1">Architecture Comparison</h3>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Existing System → Enhanced System architecture comparison will populate after paper analysis and software enhancement selection.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-zinc-200 p-5 sm:p-6 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-200">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-800" />
            System Architecture Evolution
          </h3>
          <p className="text-xs text-zinc-500">Comparative evaluation of baseline vs AI-enhanced software architecture</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          Software-Only Optimization
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        
        {/* Existing System Card */}
        <div className="bg-zinc-50/80 rounded-xl border border-zinc-200 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200">
              <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-zinc-500" />
                Existing System
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 font-semibold">
                Original Paper
              </span>
            </div>

            <h4 className="text-xs font-bold text-zinc-900 mb-2">{data.existingSystem.title}</h4>
            <p className="text-xs text-zinc-600 mb-4 leading-relaxed">{data.existingSystem.architectureOverview}</p>

            {data.existingSystem.keyComponents.length > 0 && (
              <div className="mb-4">
                <span className="text-[11px] font-semibold text-zinc-500 block mb-1.5">Key Components:</span>
                <ul className="space-y-1">
                  {data.existingSystem.keyComponents.map((comp, i) => (
                    <li key={i} className="text-xs text-zinc-700 bg-white px-2.5 py-1.5 rounded border border-zinc-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      <span>{comp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {data.existingSystem.limitationsSummary.length > 0 && (
            <div className="mt-4 pt-3 border-t border-zinc-200/80">
              <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1 mb-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Key Limitations:
              </span>
              <ul className="space-y-1">
                {data.existingSystem.limitationsSummary.map((lim, i) => (
                  <li key={i} className="text-xs text-zinc-600 pl-3 border-l-2 border-rose-300">
                    {lim}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Transition Arrow Indicator on Desktop */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-emerald-800 text-white items-center justify-center shadow-md border-2 border-white">
          <ArrowRight className="w-4 h-4" />
        </div>

        {/* Enhanced System Card */}
        <div className="bg-emerald-50/40 rounded-xl border border-emerald-200 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-200">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-800" />
                Enhanced System
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-800 text-white font-semibold">
                IEEE InnovateX
              </span>
            </div>

            <h4 className="text-xs font-bold text-emerald-950 mb-2">{data.enhancedSystem.title}</h4>
            <p className="text-xs text-zinc-700 mb-4 leading-relaxed">{data.enhancedSystem.architectureOverview}</p>

            {data.enhancedSystem.newSoftwareModules.length > 0 && (
              <div className="mb-4">
                <span className="text-[11px] font-semibold text-emerald-800 block mb-1.5">New Software Modules:</span>
                <ul className="space-y-1">
                  {data.enhancedSystem.newSoftwareModules.map((mod, i) => (
                    <li key={i} className="text-xs text-emerald-900 bg-white px-2.5 py-1.5 rounded border border-emerald-200 flex items-center gap-2 font-medium">
                      <Zap className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                      <span>{mod}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {data.enhancedSystem.expectedBenefits.length > 0 && (
            <div className="mt-4 pt-3 border-t border-emerald-200/80">
              <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Expected Enhancements:
              </span>
              <ul className="space-y-1">
                {data.enhancedSystem.expectedBenefits.map((ben, i) => (
                  <li key={i} className="text-xs text-zinc-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-800 shrink-0" />
                    <span>{ben}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
