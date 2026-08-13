import React from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { NavigationTab } from '../../types';
import {
  LayoutDashboard,
  FileText,
  FileSearch,
  GitCompare,
  AlertCircle,
  Sparkles,
  CheckCircle,
  FolderGit2,
  X,
  ChevronRight,
  BookmarkCheck,
  History,
  Clock
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'papers', label: 'Papers', icon: FileText },
  { id: 'analysis', label: 'Paper Analysis', icon: FileSearch },
  { id: 'compare', label: 'Compare Papers', icon: GitCompare },
  { id: 'gaps', label: 'Research Gaps', icon: AlertCircle },
  { id: 'enhancements', label: 'Enhancements', icon: Sparkles },
  { id: 'validation', label: 'Validation', icon: CheckCircle },
  { id: 'project', label: 'Enhanced Project', icon: FolderGit2 },
];

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    activePaper,
    activePaperId,
    papers,
    recentPaperIds,
    selectActivePaper
  } = usePaperContext();

  const handleSelect = (tab: NavigationTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const handleQuickAccess = (id: string) => {
    selectActivePaper(id);
    setActiveTab('analysis');
    onCloseMobile();
  };

  const recentPapers = (recentPaperIds || [])
    .map((id) => papers.find((p) => p.id === id))
    .filter((p): p is typeof papers[0] => Boolean(p));

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:sticky top-0 lg:top-16 z-50 lg:z-10 h-[calc(100vh-4rem)]
          w-64 glass-panel border-r border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between
          transition-transform duration-300 ease-in-out backdrop-blur-xl shadow-lg
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
          
          {/* Mobile Header Inside Drawer */}
          <div className="flex items-center justify-between px-2 pb-3 border-b border-zinc-200 dark:border-zinc-800 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center font-extrabold text-xs shadow-md neon-glow-cyan">
                IX
              </div>
              <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">IEEE InnovateX</span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links Group */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-extrabold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
              Main Menu
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`
                      w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer
                      ${
                        isActive
                          ? 'bg-brand-light text-brand-primary border border-brand-primary shadow-sm neon-glow-brand hover:scale-[1.01]'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-800/60 hover:scale-[1.01]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-brand-primary' : 'text-zinc-400 dark:text-zinc-500'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-primary" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Active Paper Focus Card */}
          <div className="p-3.5 bg-white/60 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase mb-2">
              <BookmarkCheck className="w-3.5 h-3.5 text-cyan-500" />
              <span>Active Research Context</span>
            </div>
            {activePaper ? (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-snug">
                  {activePaper.title}
                </p>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      activePaper.status === 'Analyzed'
                        ? 'bg-lime-500 shadow-lime-500/50 shadow-xs'
                        : activePaper.status === 'Analyzing'
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-zinc-400'
                    }`}
                  />
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    {activePaper.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic">No active paper selected.</p>
            )}
          </div>

          {/* Recent Activity Panel */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase flex items-center gap-1.5">
                <History className="w-3 h-3 text-brand-primary" />
                <span>Recent Activity</span>
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Top {recentPapers.length}</span>
            </div>

            {recentPapers.length > 0 ? (
              <div className="space-y-1">
                {recentPapers.map((paper) => {
                  const isSelected = paper.id === activePaperId;
                  return (
                    <button
                      key={paper.id}
                      onClick={() => handleQuickAccess(paper.id)}
                      className={`
                        w-full text-left p-2 rounded-lg text-xs transition-all border cursor-pointer
                        ${
                          isSelected
                            ? 'bg-brand-light border-brand-primary text-brand-primary font-bold'
                            : 'bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-100 dark:border-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="line-clamp-1 font-semibold text-[11px]">
                          {paper.title}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                            paper.status === 'Analyzed'
                              ? 'bg-brand-badge'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          {paper.status === 'Analyzed' ? 'Analyzed' : 'Draft'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Year {paper.year}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-3 py-2 text-xs text-zinc-400 italic bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
                No recent activity yet
              </div>
            )}
          </div>

        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
          <span>IEEE Research Standards</span>
          <span className="font-semibold text-emerald-800 dark:text-emerald-400">v1.0.0</span>
        </div>
      </aside>
    </>
  );
};
