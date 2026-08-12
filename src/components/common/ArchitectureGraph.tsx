import React, { useState } from 'react';
import { ArchitectureGraphData, ArchitectureNode } from '../../types';
import { ArrowRight, Cpu, Zap, Database, Activity, ShieldCheck, CheckCircle2, ChevronRight, Info } from 'lucide-react';

interface ArchitectureGraphProps {
  data: ArchitectureGraphData;
  className?: string;
}

export const ArchitectureGraph: React.FC<ArchitectureGraphProps> = ({ data, className = '' }) => {
  const [activeNode, setActiveNode] = useState<ArchitectureNode | null>(null);

  const renderNodeIcon = (type: ArchitectureNode['type'], isNew?: boolean) => {
    if (isNew) return <Zap className="w-4 h-4 text-emerald-800 shrink-0" />;
    switch (type) {
      case 'input':
        return <Database className="w-4 h-4 text-zinc-500 shrink-0" />;
      case 'processing':
        return <Cpu className="w-4 h-4 text-zinc-600 shrink-0" />;
      case 'new_module':
        return <Zap className="w-4 h-4 text-emerald-800 shrink-0" />;
      case 'optimization':
        return <Activity className="w-4 h-4 text-teal-800 shrink-0" />;
      case 'output':
        return <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />;
      default:
        return <Cpu className="w-4 h-4 text-zinc-500 shrink-0" />;
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-200">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Interactive Visual Architecture
          </span>
          <h3 className="text-base font-bold text-zinc-900 mt-1 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-800" />
            Software Architecture Comparison
          </h3>
          <p className="text-xs text-zinc-500">
            Compare baseline data flow against new modular software enhancement layers
          </p>
        </div>
      </div>

      {/* Architecture Diagrams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Baseline Existing Architecture Flow */}
        <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
            <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-zinc-500" />
              1. Baseline Paper Architecture
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-200 text-zinc-700">
              Original Flow
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {data.existingFlow.map((node, idx) => (
              <React.Fragment key={node.id}>
                <div className="p-3 rounded-lg bg-white border border-zinc-200 flex items-center justify-between text-xs font-medium text-zinc-800 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    {renderNodeIcon(node.type)}
                    <span>{node.label}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">Step {idx + 1}</span>
                </div>

                {idx < data.existingFlow.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowRight className="w-4 h-4 text-zinc-300 rotate-90" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Enhanced Architecture Flow */}
        <div className="p-5 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-800" />
              2. Enhanced Architecture (IEEE InnovateX)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-800 text-white">
              Software-Only Optimization
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {data.enhancedFlow.map((node, idx) => {
              const isSelected = activeNode?.id === node.id;
              return (
                <React.Fragment key={node.id}>
                  <div
                    onClick={() => setActiveNode(isSelected ? null : node)}
                    className={`
                      p-3 rounded-lg border text-xs font-medium transition-all cursor-pointer flex items-center justify-between shadow-2xs
                      ${
                        node.isNew
                          ? isSelected
                            ? 'bg-emerald-800 text-white border-emerald-900 ring-2 ring-emerald-600'
                            : 'bg-white text-emerald-950 border-emerald-300 hover:border-emerald-500 font-bold'
                          : 'bg-white text-zinc-800 border-emerald-200'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      {renderNodeIcon(node.type, node.isNew)}
                      <span>{node.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {node.isNew && (
                        <span
                          className={`
                            px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider
                            ${isSelected ? 'bg-white text-emerald-900' : 'bg-emerald-100 text-emerald-900'}
                          `}
                        >
                          New Module
                        </span>
                      )}
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </div>

                  {idx < data.enhancedFlow.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <ArrowRight className="w-4 h-4 text-emerald-600 rotate-90" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Node Inspector Panel */}
      {activeNode && (
        <div className="p-4 rounded-xl bg-emerald-100/60 border border-emerald-300 text-xs text-emerald-950 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-800" />
              Module Details: {activeNode.label}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-800 text-white text-[10px]">
              {activeNode.type.toUpperCase()}
            </span>
          </div>
          {activeNode.linkedLimitation && (
            <p className="text-zinc-700 leading-relaxed">
              <strong>Mitigates Limitation:</strong> {activeNode.linkedLimitation}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
