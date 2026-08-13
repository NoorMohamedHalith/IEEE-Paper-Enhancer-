import React, { useState } from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { ActivityActionType } from '../../types';
import {
  History,
  X,
  Upload,
  Sparkles,
  CheckCircle2,
  Settings,
  Trash2,
  Download,
  Search,
  Filter,
  FileText,
  ThumbsUp,
  Sliders,
  Database,
  Calendar,
  Clock
} from 'lucide-react';

export const AuditTrailModal: React.FC = () => {
  const { isAuditModalOpen, setIsAuditModalOpen, activityLogs, clearAuditLogs } = usePaperContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  if (!isAuditModalOpen) return null;

  const getActionBadge = (type: ActivityActionType) => {
    switch (type) {
      case 'upload':
        return {
          label: 'Upload',
          color: 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
          icon: Upload,
        };
      case 'analysis':
        return {
          label: 'AI Analysis',
          color: 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
          icon: Sparkles,
        };
      case 'enhancement_selection':
        return {
          label: 'Enhancement',
          color: 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
          icon: CheckCircle2,
        };
      case 'gap_approval':
        return {
          label: 'Gap Approval',
          color: 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
          icon: Sliders,
        };
      case 'validation':
        return {
          label: 'Validation',
          color: 'bg-teal-100 text-teal-900 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
          icon: CheckCircle2,
        };
      case 'feedback_submitted':
        return {
          label: 'Feedback',
          color: 'bg-sky-100 text-sky-900 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
          icon: ThumbsUp,
        };
      case 'settings_update':
        return {
          label: 'Settings',
          color: 'bg-zinc-100 text-zinc-900 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700',
          icon: Settings,
        };
      case 'clear_workspace':
        return {
          label: 'Clear Workspace',
          color: 'bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
          icon: Trash2,
        };
      default:
        return {
          label: 'System Action',
          color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
          icon: Database,
        };
    }
  };

  const filteredLogs = activityLogs.filter((log) => {
    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'upload' && log.actionType === 'upload') ||
      (selectedFilter === 'analysis' && log.actionType === 'analysis') ||
      (selectedFilter === 'enhancement' && (log.actionType === 'enhancement_selection' || log.actionType === 'gap_approval' || log.actionType === 'validation')) ||
      (selectedFilter === 'feedback' && log.actionType === 'feedback_submitted') ||
      (selectedFilter === 'settings' && (log.actionType === 'settings_update' || log.actionType === 'clear_workspace'));

    const matchesSearch =
      searchQuery.trim() === '' ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.paperTitle && log.paperTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.actionType.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleExportAuditLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activityLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `IEEE_InnovateX_AuditLogs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Internal Activity Audit Trail</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  {activityLogs.length} Records
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Database-persisted tracking of key user uploads, AI analyses, and enhancement actions
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuditModalOpen(false)}
            className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar: Search & Filters */}
        <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit trail by paper title, action details..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Action Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs shrink-0">
            {[
              { id: 'all', label: 'All Actions' },
              { id: 'upload', label: 'Uploads' },
              { id: 'analysis', label: 'Analyses' },
              { id: 'enhancement', label: 'Enhancements' },
              { id: 'feedback', label: 'Feedback' },
              { id: 'settings', label: 'System' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 transition-colors ${
                  selectedFilter === f.id
                    ? 'bg-emerald-800 text-white dark:bg-emerald-700'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Log List View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 dark:text-zinc-600 space-y-2">
              <History className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-xs font-medium">No activity audit logs found matching criteria.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badge = getActionBadge(log.actionType);
              const BadgeIcon = badge.icon;
              const dateObj = new Date(log.timestamp);
              const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const formattedDate = dateObj.toLocaleDateString();

              return (
                <div key={log.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${badge.color}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>

                      {log.paperTitle && (
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                          <span className="truncate max-w-xs">{log.paperTitle}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                      {log.details}
                    </p>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                        Metadata: {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-zinc-400 dark:text-zinc-500 font-mono shrink-0 flex flex-col items-end gap-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formattedTime}
                    </span>
                    <span className="text-[10px] opacity-75">{formattedDate}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAuditLogs}
              disabled={activityLogs.length === 0}
              className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Export Audit JSON</span>
            </button>

            <button
              onClick={clearAuditLogs}
              disabled={activityLogs.length === 0}
              className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          <button
            onClick={() => setIsAuditModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-emerald-800 dark:bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-900 dark:hover:bg-emerald-600 transition-colors"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
