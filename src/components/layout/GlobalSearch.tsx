import React, { useState, useEffect, useRef } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { NavigationTab, WorkflowStepId } from '../../types';
import { Search, X, FileText, AlertCircle, Sparkles, HelpCircle, ArrowRight, CornerDownLeft } from 'lucide-react';

interface SearchResultItem {
  id: string;
  paperId: string;
  paperTitle: string;
  type: 'paper' | 'limitation' | 'gap' | 'enhancement';
  title: string;
  subtitle: string;
  badge?: string;
  tab: NavigationTab;
  step: WorkflowStepId;
}

export const GlobalSearch: React.FC = () => {
  const { papers, selectActivePaper, setActiveTab, setActiveStep } = usePaperContext();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate Search Results
  const getSearchResults = (): SearchResultItem[] => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const results: SearchResultItem[] = [];

    papers.forEach((paper) => {
      // 1. Search Paper Title & Authors & Year
      const titleMatch = paper.title.toLowerCase().includes(q);
      const authorMatch = paper.authors.some((a) => a.toLowerCase().includes(q));
      const yearMatch = paper.year.includes(q);
      const summaryMatch = paper.analysis?.paperSummary?.toLowerCase().includes(q);

      if (titleMatch || authorMatch || yearMatch || summaryMatch) {
        results.push({
          id: `paper-${paper.id}`,
          paperId: paper.id,
          paperTitle: paper.title,
          type: 'paper',
          title: paper.title,
          subtitle: `Authors: ${paper.authors.join(', ')} (${paper.year})`,
          badge: paper.status,
          tab: 'papers',
          step: 1,
        });
      }

      // 2. Search Limitations
      if (paper.analysis?.limitations) {
        paper.analysis.limitations.forEach((lim) => {
          if (
            lim.title.toLowerCase().includes(q) ||
            lim.explanation.toLowerCase().includes(q) ||
            lim.type.toLowerCase().includes(q)
          ) {
            results.push({
              id: `lim-${lim.id}`,
              paperId: paper.id,
              paperTitle: paper.title,
              type: 'limitation',
              title: lim.title,
              subtitle: lim.explanation,
              badge: `${lim.type} (${lim.confidence} Confidence)`,
              tab: 'analysis',
              step: 2,
            });
          }
        });
      }

      // 3. Search Research Gaps
      if (paper.analysis?.researchGaps) {
        paper.analysis.researchGaps.forEach((gap) => {
          if (
            gap.title.toLowerCase().includes(q) ||
            gap.explanation.toLowerCase().includes(q) ||
            gap.gapType.toLowerCase().includes(q)
          ) {
            results.push({
              id: `gap-${gap.id}`,
              paperId: paper.id,
              paperTitle: paper.title,
              type: 'gap',
              title: gap.title,
              subtitle: gap.explanation,
              badge: gap.gapType,
              tab: 'gaps',
              step: 3,
            });
          }
        });
      }

      // 4. Search Recommendations / Enhancements
      if (paper.analysis?.recommendations) {
        paper.analysis.recommendations.forEach((rec) => {
          const isSelected = paper.selectedEnhancementIds?.includes(rec.id);
          if (
            rec.title.toLowerCase().includes(q) ||
            rec.category.toLowerCase().includes(q) ||
            rec.rationale.toLowerCase().includes(q) ||
            rec.implementationApproach.toLowerCase().includes(q) ||
            (rec.traceabilityLink?.newSoftwareModule && rec.traceabilityLink.newSoftwareModule.toLowerCase().includes(q))
          ) {
            results.push({
              id: `rec-${rec.id}`,
              paperId: paper.id,
              paperTitle: paper.title,
              type: 'enhancement',
              title: rec.title,
              subtitle: rec.rationale,
              badge: isSelected ? 'Selected Module' : rec.category,
              tab: 'enhancements',
              step: 4,
            });
          }
        });
      }
    });

    return results.slice(0, 12); // Limit to top 12 matches for performance
  };

  const results = getSearchResults();

  const handleSelectResult = (item: SearchResultItem) => {
    selectActivePaper(item.paperId);
    setActiveStep(item.step);
    setActiveTab(item.tab);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelectResult(results[selectedIndex]);
      }
    }
  };

  const getTypeIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'paper':
        return <FileText className="w-4 h-4 text-emerald-800" />;
      case 'limitation':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'gap':
        return <HelpCircle className="w-4 h-4 text-blue-600" />;
      case 'enhancement':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
    }
  };

  const getTypeLabel = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'paper':
        return 'Paper';
      case 'limitation':
        return 'Limitation';
      case 'gap':
        return 'Research Gap';
      case 'enhancement':
        return 'Enhancement';
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Search Bar Input */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3 text-zinc-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDownInput}
          placeholder="Search papers, limitations, enhancements... (⌘K)"
          className="w-full pl-9 pr-16 py-1.5 bg-zinc-100/80 hover:bg-zinc-100 focus:bg-white border border-zinc-200 focus:border-emerald-800 rounded-xl text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 transition-all shadow-2xs"
        />
        
        {query ? (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute right-2.5 px-1.5 py-0.5 rounded border border-zinc-300 bg-white text-[10px] font-semibold text-zinc-400 shadow-2xs pointer-events-none">
            <span className="text-[9px]">⌘</span>K
          </kbd>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-zinc-200 shadow-2xl z-50 overflow-hidden max-h-[28rem] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3.5 py-2 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
            <span>
              Search Results ({results.length} found)
            </span>
            <span className="flex items-center gap-1 text-[10px] text-zinc-400">
              <CornerDownLeft className="w-3 h-3" /> Press Enter to jump
            </span>
          </div>

          <div className="overflow-y-auto p-1.5 divide-y divide-zinc-100">
            {results.length === 0 ? (
              <div className="p-8 text-center space-y-1">
                <p className="text-xs font-semibold text-zinc-700">No matching items found</p>
                <p className="text-[11px] text-zinc-400">
                  Try searching for keywords like "latency", "algorithm", "limitation", or paper titles.
                </p>
              </div>
            ) : (
              results.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`
                      p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 text-xs
                      ${
                        isSelected
                          ? 'bg-emerald-50/80 border border-emerald-200 text-zinc-900'
                          : 'hover:bg-zinc-50 text-zinc-700 border border-transparent'
                      }
                    `}
                  >
                    <div className="p-2 rounded-lg bg-white border border-zinc-200 shrink-0 mt-0.5">
                      {getTypeIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                          {getTypeLabel(item.type)}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded truncate max-w-[120px]">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-zinc-900 line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-zinc-500 line-clamp-1">{item.subtitle}</p>

                      <p className="text-[10px] text-zinc-400 font-medium pt-0.5">
                        Paper: {item.paperTitle.slice(0, 40)}...
                      </p>
                    </div>

                    <ArrowRight className={`w-4 h-4 shrink-0 self-center transition-transform ${isSelected ? 'text-emerald-800 translate-x-0.5' : 'text-zinc-300'}`} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
