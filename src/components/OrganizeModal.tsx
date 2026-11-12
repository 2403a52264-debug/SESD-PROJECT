import React, { useState, useEffect } from 'react';
import {
  FolderSync,
  X,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api.ts';

interface OrganizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrganizationApplied: () => void;
}

export const OrganizeModal: React.FC<OrganizeModalProps> = ({
  isOpen,
  onClose,
  onOrganizationApplied
}) => {
  const [strategy, setStrategy] = useState<'ai_category' | 'extension' | 'date' | 'size' | 'custom_rules'>('ai_category');
  const [previews, setPreviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPreview(strategy);
    }
  }, [isOpen, strategy]);

  const loadPreview = async (strat: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const items = await api.previewOrganization(strat);
      setPreviews(items);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to preview movements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (previews.length === 0) return;
    setIsApplying(true);
    setErrorMsg(null);
    try {
      await api.applyOrganization(strategy);
      onOrganizationApplied();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to apply organization');
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/15 border border-indigo-500/30 text-indigo-400">
              <FolderSync className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Automated File Organization Engine
              </h3>
              <p className="text-xs text-slate-400">
                Simulate and review file movements with rollback safety
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Strategy Selector */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/50 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Select Organization Strategy</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'ai_category', label: 'AI Category' },
              { id: 'custom_rules', label: 'Custom Rules' },
              { id: 'extension', label: 'File Extension' },
              { id: 'date', label: 'Year / Month' },
              { id: 'size', label: 'Size Tiers' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setStrategy(s.id as any)}
                className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                  strategy === s.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Previews */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>Simulating proposed file movements...</span>
            </div>
          ) : previews.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">All Files are Already Organized</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                No files need moving under the selected "{strategy}" strategy. All targets currently match existing folders.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  Proposed Movements ({previews.length} Files)
                </span>
                <span className="text-[11px] text-indigo-400 font-medium">User confirmation required</span>
              </div>

              <div className="rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase font-mono border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">File Name</th>
                      <th className="py-2 px-3">Current Location</th>
                      <th className="py-2 px-3">Target Location</th>
                      <th className="py-2 px-3">Rule / Strategy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {previews.map(item => (
                      <tr key={item.fileId} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-medium text-slate-200 truncate max-w-[180px]">
                          {item.fileName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] truncate max-w-[140px]">
                          {item.currentFolderPath}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-medium text-[11px] truncate max-w-[200px]">
                            <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{item.targetFolderPath}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {item.ruleMatched || item.category}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs bg-slate-950/40">
          <span className="text-[11px] text-slate-400">
            Original files are preserved safely. Actions can be undone from Activity History.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-slate-400 hover:text-slate-200 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isApplying || previews.length === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isApplying ? 'Moving files...' : `Confirm & Move ${previews.length} Files`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
