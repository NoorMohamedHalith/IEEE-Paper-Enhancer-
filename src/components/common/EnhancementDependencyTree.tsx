import React, { useState, useMemo, useRef, useEffect } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { EnhancementRecommendation } from '../../types';
import {
  GitMerge,
  Layers,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Info,
  SlidersHorizontal,
  Workflow,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  ListOrdered
} from 'lucide-react';

interface EnhancementDependencyTreeProps {
  paperId: string;
  recommendations: EnhancementRecommendation[];
  selectedIds: string[];
}

interface TreeLevel {
  levelIndex: number;
  title: string;
  description: string;
  nodes: EnhancementRecommendation[];
}

export const EnhancementDependencyTree: React.FC<EnhancementDependencyTreeProps> = ({
  paperId,
  recommendations,
  selectedIds,
}) => {
  const {
    toggleEnhancementSelection,
    updateEnhancementDependencies,
    reorderSelectedEnhancements,
  } = usePaperContext();

  const [showOnlySelected, setShowOnlySelected] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'roadmap'>('graph');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number; width: number; height: number }>>({});

  // Active pool of recommendations based on toggle
  const activeRecs = useMemo(() => {
    if (showOnlySelected && selectedIds.length > 0) {
      const selected = recommendations.filter((r) => selectedIds.includes(r.id));
      return selected.length > 0 ? selected : recommendations;
    }
    return recommendations;
  }, [showOnlySelected, selectedIds, recommendations]);

  // Helper to determine category tier level (0-indexed)
  const getCategoryTier = (category: string, title: string): number => {
    const text = (category + ' ' + title).toLowerCase();
    if (text.includes('edge') || text.includes('data') || text.includes('analytics') || text.includes('sensor') || text.includes('imputation')) {
      return 0; // Foundation Tier
    }
    if (text.includes('optimization') || text.includes('stream') || text.includes('performance') || text.includes('ring-buffer') || text.includes('fault')) {
      return 1; // Execution / Middleware Tier
    }
    if (text.includes('ai') || text.includes('machine learning') || text.includes('residual') || text.includes('predict') || text.includes('model')) {
      return 2; // AI Intelligence Tier
    }
    return 3; // Security & Final Governance Tier
  };

  // Build dependency graph and compute topological levels
  const { levels, nodeDepMap, topologicalOrder, dependencyEdges } = useMemo(() => {
    const depMap: Record<string, string[]> = {};
    const edges: { from: string; to: string }[] = [];

    // Initialize dependencies
    activeRecs.forEach((rec) => {
      let explicitDeps = rec.dependsOnIds || [];

      // If no explicit dependencies set, infer logical build-upon dependencies
      if (explicitDeps.length === 0) {
        const recTier = getCategoryTier(rec.category, rec.title);
        activeRecs.forEach((other) => {
          if (other.id !== rec.id) {
            const otherTier = getCategoryTier(other.category, other.title);
            if (otherTier < recTier && recTier - otherTier === 1) {
              if (!explicitDeps.includes(other.id)) {
                explicitDeps.push(other.id);
              }
            }
          }
        });
      }

      depMap[rec.id] = explicitDeps;
      explicitDeps.forEach((prereqId) => {
        if (activeRecs.some((r) => r.id === prereqId)) {
          edges.push({ from: prereqId, to: rec.id });
        }
      });
    });

    // Group nodes into topological tier levels
    const levelMap: Record<string, number> = {};
    activeRecs.forEach((rec) => {
      const calculateLevel = (id: string, visited = new Set<string>()): number => {
        if (visited.has(id)) return 0; // Prevent cycle loops
        visited.add(id);
        const prereqs = depMap[id] || [];
        if (prereqs.length === 0) return 0;
        let maxPrereqLevel = 0;
        prereqs.forEach((pId) => {
          if (activeRecs.some((r) => r.id === pId)) {
            maxPrereqLevel = Math.max(maxPrereqLevel, calculateLevel(pId, new Set(visited)) + 1);
          }
        });
        return maxPrereqLevel;
      };
      levelMap[rec.id] = calculateLevel(rec.id);
    });

    // Create levels list
    const maxLevel = Math.max(0, ...Object.values(levelMap));
    const levelTitles = [
      { title: 'Phase 1: Foundation Layer', desc: 'Core Data Ingestion, Hardware & Sensor Telemetry Prerequisites' },
      { title: 'Phase 2: Execution & Stream Optimization', desc: 'Asynchronous Ingestion, Ring-Buffers & State Managers' },
      { title: 'Phase 3: Intelligence & Algorithmic Modules', desc: 'AI Post-Processing, Residual Estimators & Analytics' },
      { title: 'Phase 4: Zero-Trust & Security Governance', desc: 'Cryptographic Wrappers, Token Access & Validation Layers' }
    ];

    const structuredLevels: TreeLevel[] = [];
    for (let lvl = 0; lvl <= Math.max(maxLevel, 2); lvl++) {
      const nodesAtLvl = activeRecs.filter((r) => levelMap[r.id] === lvl);
      if (nodesAtLvl.length > 0 || lvl < 3) {
        structuredLevels.push({
          levelIndex: lvl,
          title: levelTitles[lvl]?.title || `Phase ${lvl + 1}: Extension Layer`,
          description: levelTitles[lvl]?.desc || 'Advanced dependent software modules',
          nodes: nodesAtLvl,
        });
      }
    }

    // Topological order for implementation priority
    const topoOrder = [...activeRecs].sort((a, b) => {
      const lvlA = levelMap[a.id] || 0;
      const lvlB = levelMap[b.id] || 0;
      if (lvlA !== lvlB) return lvlA - lvlB;
      return b.relevanceScore - a.relevanceScore;
    }).map((r) => r.id);

    return {
      levels: structuredLevels,
      nodeDepMap: depMap,
      topologicalOrder: topoOrder,
      dependencyEdges: edges,
    };
  }, [activeRecs]);

  // Recalculate SVG connector node positions on mount/window resize
  const updateNodePositions = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newPositions: Record<string, { x: number; y: number; width: number; height: number }> = {};

    activeRecs.forEach((rec) => {
      const el = document.getElementById(`dep-node-${rec.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        newPositions[rec.id] = {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
        };
      }
    });
    setNodePositions(newPositions);
  };

  useEffect(() => {
    updateNodePositions();
    const timer = setTimeout(updateNodePositions, 200);
    window.addEventListener('resize', updateNodePositions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateNodePositions);
    };
  }, [activeRecs, showOnlySelected, viewMode]);

  const handleApplyTopologicalOrder = () => {
    // Reorder selected enhancement IDs matching dependency topology
    const orderedSelected = topologicalOrder.filter((id) => selectedIds.includes(id));
    reorderSelectedEnhancements(paperId, orderedSelected);
  };

  const handleAddPrerequisite = (nodeId: string, prereqId: string) => {
    if (nodeId === prereqId) return;
    const currentPrereqs = nodeDepMap[nodeId] || [];
    if (!currentPrereqs.includes(prereqId)) {
      const updated = [...currentPrereqs, prereqId];
      updateEnhancementDependencies(paperId, nodeId, updated);
    }
  };

  const handleRemovePrerequisite = (nodeId: string, prereqId: string) => {
    const currentPrereqs = nodeDepMap[nodeId] || [];
    const updated = currentPrereqs.filter((id) => id !== prereqId);
    updateEnhancementDependencies(paperId, nodeId, updated);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-800/20 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-6 transition-colors">
      {/* Control Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <GitMerge className="w-3 h-3" />
              <span>Dependency Architecture</span>
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {activeRecs.length} Modules Mapped
            </span>
          </div>

          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Workflow className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            Visual Enhancement Dependency Tree
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-2xl">
            Map prerequisite build-upon relationships between software modules to prioritize code execution, eliminate circular dependencies, and structure implementation roadmaps.
          </p>
        </div>

        {/* Toolbar controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Toggle Selected vs All */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setShowOnlySelected(true)}
              className={`px-3 py-1 rounded-lg transition-all ${
                showOnlySelected
                  ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Selected Queue ({selectedIds.length})
            </button>
            <button
              onClick={() => setShowOnlySelected(false)}
              className={`px-3 py-1 rounded-lg transition-all ${
                !showOnlySelected
                  ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              All Proposed ({recommendations.length})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                viewMode === 'graph'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Workflow className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Graph Tree</span>
            </button>
            <button
              onClick={() => setViewMode('roadmap')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                viewMode === 'roadmap'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Phase Roadmap</span>
            </button>
          </div>

          {/* Apply Topological Sort */}
          <button
            onClick={handleApplyTopologicalOrder}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-800 dark:bg-emerald-700 hover:bg-emerald-900 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Auto-sort queue by dependency topology"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply Topo Order</span>
          </button>
        </div>
      </div>

      {/* Main Visual Canvas Container */}
      <div ref={containerRef} className="relative min-h-[400px] space-y-6">
        {/* SVG Bezier Lines Connector Overlay (Visible in Graph Mode) */}
        {viewMode === 'graph' && Object.keys(nodePositions).length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#047857" />
              </marker>
              <marker
                id="arrowhead-highlight"
                markerWidth="10"
                markerHeight="8"
                refX="9"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 10 4, 0 8" fill="#10B981" />
              </marker>
            </defs>

            {dependencyEdges.map(({ from, to }) => {
              const posFrom = nodePositions[from];
              const posTo = nodePositions[to];
              if (!posFrom || !posTo) return null;

              const isHighlighted =
                selectedNodeId === from ||
                selectedNodeId === to ||
                (selectedNodeId && (nodeDepMap[selectedNodeId]?.includes(from) || nodeDepMap[to]?.includes(selectedNodeId)));

              // Curved Bezier calculation
              const deltaY = posTo.y - posFrom.y;
              const controlY = posFrom.y + deltaY * 0.5;

              const pathString = `M ${posFrom.x} ${posFrom.y + posFrom.height / 2 - 5} C ${posFrom.x} ${controlY}, ${posTo.x} ${controlY}, ${posTo.x} ${posTo.y - posTo.height / 2 + 5}`;

              return (
                <g key={`edge-${from}-${to}`}>
                  {/* Background glow line when highlighted */}
                  {isHighlighted && (
                    <path
                      d={pathString}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="6"
                      strokeOpacity="0.4"
                      className="animate-pulse"
                    />
                  )}
                  {/* Primary directed connector line */}
                  <path
                    d={pathString}
                    fill="none"
                    stroke={isHighlighted ? '#10B981' : '#059669'}
                    strokeWidth={isHighlighted ? '2.5' : '1.5'}
                    strokeDasharray={isHighlighted ? '6 3' : 'none'}
                    strokeOpacity={isHighlighted ? '1' : '0.45'}
                    markerEnd={isHighlighted ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)'}
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* VIEW 1: GRAPH TIER TREE */}
        {viewMode === 'graph' && (
          <div className="space-y-8 relative z-20">
            {levels.map((lvl) => (
              <div
                key={`level-${lvl.levelIndex}`}
                className="rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 p-4 space-y-3"
              >
                {/* Level Tier Header */}
                <div className="flex items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-700/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white font-mono text-xs font-bold flex items-center justify-center shadow-2xs">
                      L{lvl.levelIndex + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                        {lvl.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {lvl.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                    {lvl.nodes.length} {lvl.nodes.length === 1 ? 'Module' : 'Modules'}
                  </span>
                </div>

                {/* Level Node Cards Grid */}
                {lvl.nodes.length === 0 ? (
                  <div className="py-4 text-center text-xs text-zinc-400 italic">
                    No active enhancement modules at this dependency tier.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {lvl.nodes.map((node) => {
                      const isSelected = selectedIds.includes(node.id);
                      const isNodeActive = selectedNodeId === node.id;
                      const prereqIds = nodeDepMap[node.id] || [];
                      const prereqNodes = activeRecs.filter((r) => prereqIds.includes(r.id));
                      const topoRank = topologicalOrder.indexOf(node.id) + 1;

                      return (
                        <div
                          key={node.id}
                          id={`dep-node-${node.id}`}
                          onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
                          className={`
                            relative rounded-xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3
                            ${
                              isNodeActive
                                ? 'bg-white dark:bg-zinc-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md scale-[1.01]'
                                : isSelected
                                ? 'bg-white dark:bg-zinc-900 border-emerald-800/40 hover:border-emerald-500 shadow-2xs'
                                : 'bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 opacity-90'
                            }
                          `}
                        >
                          {/* Card Header & Checkbox */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  {node.category}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                  Order #{topoRank}
                                </span>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleEnhancementSelection(paperId, node.id);
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                                  isSelected
                                    ? 'bg-emerald-800 text-white dark:bg-emerald-700'
                                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-100'
                                }`}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{isSelected ? 'Selected' : 'Select'}</span>
                              </button>
                            </div>

                            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                              {node.title}
                            </h4>

                            <p className="text-[11px] font-mono text-emerald-800 dark:text-emerald-400 font-semibold truncate">
                              Module: {node.traceabilityLink?.newSoftwareModule || 'CustomEnhancement.ts'}
                            </p>
                          </div>

                          {/* Prerequisites List & Editor */}
                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                              <span className="flex items-center gap-1">
                                <LinkIcon className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                                Prerequisites ({prereqNodes.length}):
                              </span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingNodeId(editingNodeId === node.id ? null : node.id);
                                }}
                                className="text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-bold"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Link</span>
                              </button>
                            </div>

                            {/* Prerequisite Tags */}
                            <div className="flex flex-wrap gap-1">
                              {prereqNodes.length === 0 ? (
                                <span className="text-[10px] text-zinc-400 italic">None (Foundational Root)</span>
                              ) : (
                                prereqNodes.map((p) => (
                                  <span
                                    key={p.id}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                                  >
                                    <span className="truncate max-w-[120px]">{p.title}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemovePrerequisite(node.id, p.id);
                                      }}
                                      className="hover:text-rose-600 ml-0.5"
                                      title="Remove dependency link"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))
                              )}
                            </div>

                            {/* Prerequisite Dropdown Selector */}
                            {editingNodeId === node.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="mt-2 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 space-y-1"
                              >
                                <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                                  Select Module that "{node.title.slice(0, 20)}..." Builds Upon:
                                </p>
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleAddPrerequisite(node.id, e.target.value);
                                      setEditingNodeId(null);
                                    }
                                  }}
                                  className="w-full text-xs p-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                                  defaultValue=""
                                >
                                  <option value="" disabled>-- Choose Prerequisite --</option>
                                  {activeRecs
                                    .filter((r) => r.id !== node.id && !prereqIds.includes(r.id))
                                    .map((r) => (
                                      <option key={r.id} value={r.id}>
                                        {r.title} ({r.category})
                                      </option>
                                    ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: PHASE ROADMAP TIMELINE */}
        {viewMode === 'roadmap' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                Optimal Implementation Roadmap Execution Order
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Software modules are sequenced using topological sort. Foundational modules (Phase 1) should be implemented first to establish datastores and edge telemetry before compiling downstream AI models or security token wrappers.
              </p>
            </div>

            <div className="space-y-3 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-emerald-200 dark:before:bg-emerald-800">
              {topologicalOrder.map((nodeId, idx) => {
                const rec = activeRecs.find((r) => r.id === nodeId);
                if (!rec) return null;

                const prereqs = (nodeDepMap[nodeId] || [])
                  .map((pId) => activeRecs.find((r) => r.id === pId))
                  .filter((r): r is EnhancementRecommendation => r !== undefined);

                const isSelected = selectedIds.includes(rec.id);

                return (
                  <div
                    key={rec.id}
                    className="relative pl-12 pr-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Number Badge on Timeline */}
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-emerald-800 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                      #{idx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {rec.category}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                          Feasibility: {rec.feasibility} • Impact: {rec.impact}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {rec.title}
                      </h4>

                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Target Module: <code className="text-emerald-800 dark:text-emerald-400 font-bold">{rec.traceabilityLink?.newSoftwareModule || 'Module.ts'}</code>
                      </p>

                      {prereqs.length > 0 && (
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 pt-0.5">
                          Requires: {prereqs.map((p) => p.title).join(', ')}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => toggleEnhancementSelection(paperId, rec.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-emerald-800 text-white dark:bg-emerald-700'
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isSelected ? 'Selected' : 'Add to Queue'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0" />
          <span>
            Topological Sort ensures prerequisite software modules (data pipelines & simulators) precede AI models and security wrappers.
          </span>
        </div>

        <button
          onClick={handleApplyTopologicalOrder}
          className="text-emerald-800 dark:text-emerald-400 font-bold hover:underline shrink-0 flex items-center gap-1"
        >
          <span>Auto-Sort Selected Queue</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
