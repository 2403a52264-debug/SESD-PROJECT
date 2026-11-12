import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FolderSync,
  UploadCloud,
  Trash2,
  Copy,
  Settings,
  Sparkles
} from 'lucide-react';
import { ActivityItem, OrganizationOperationItem } from '../types/index.ts';

interface ActivityHistoryViewProps {
  activities: ActivityItem[];
  operations: OrganizationOperationItem[];
  onUndoOperation: (operationId: string) => void;
}

export const ActivityHistoryView: React.FC<ActivityHistoryViewProps> = ({
  activities,
  operations,
  onUndoOperation
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [undoingId, setUndoingId] = useState<string | null>(null);

  const filteredActivities = filterType === 'all'
    ? activities
    : activities.filter(a => a.type === filterType);

  const handleUndo = async (opId: string) => {
    setUndoingId(opId);
    try {
      await onUndoOperation(opId);
    } finally {
      setUndoingId(null);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <UploadCloud className="w-3.5 h-3.5 text-blue-400" />;
      case 'classify':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
      case 'organize':
        return <FolderSync className="w-3.5 h-3.5 text-purple-400" />;
      case 'undo':
        return <RotateCcw className="w-3.5 h-3.5 text-amber-400" />;
      case 'duplicate_scan':
        return <Copy className="w-3.5 h-3.5 text-yellow-400" />;
      case 'delete':
        return <Trash2 className="w-3.5 h-3.5 text-red-400" />;
      case 'settings':
        return <Settings className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <History className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          Activity Audit & Organization History
        </h2>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
          <span>Comprehensive System Audit Trail</span>
          <span aria-hidden="true">·</span>
          <span>Reversible File Transactions</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-300">{activities.length} logged events</span>
        </div>
      </div>

      {/* Organization Operations Table (With Undo Actions) */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-semibold text-slate-200">
              Batch Organization Transactions
            </h3>
            <p className="text-[11px] text-slate-400">Reversible file movements with state tracking</p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
            {operations.length} recorded runs
          </span>
        </div>

        {operations.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No organization operations recorded yet. Use the "Organize" tool in the header to run your first batch move.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {operations.map(op => {
              const isReverted = op.status === 'reverted';
              return (
                <div key={op.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{op.description}</span>
                      {isReverted ? (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          Reverted
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span>Strategy: <strong className="text-slate-400">{op.operationType}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{op.filesMovedCount} files moved</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(op.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  {!isReverted && op.filesMovedCount > 0 && (
                    <button
                      onClick={() => handleUndo(op.id)}
                      disabled={undoingId === op.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/60 rounded-md transition-colors disabled:opacity-50 shrink-0"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${undoingId === op.id ? 'animate-spin' : ''}`} />
                      <span>{undoingId === op.id ? 'Reverting...' : 'Undo Organization'}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity Log Stream */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-semibold text-slate-200">System Activity Stream</h3>
            <p className="text-[11px] text-slate-400">Chronological ledger of user interactions and AI triggers</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-md p-1 text-xs">
            {['all', 'upload', 'classify', 'organize', 'duplicate_scan', 'undo'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded capitalize text-[11px] transition-colors ${
                  filterType === type
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto pr-1">
          {filteredActivities.map(act => (
            <div key={act.id} className="py-2.5 flex items-start gap-3 text-xs">
              <div className="p-1.5 rounded bg-slate-950 border border-slate-800 mt-0.5 shrink-0">
                {getActivityIcon(act.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-200">{act.action}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{act.details}</p>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0">
                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
