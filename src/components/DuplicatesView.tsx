import React, { useState } from 'react';
import {
  Copy,
  Trash2,
  Eye,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { DuplicateGroup, FileItem } from '../types/index.ts';

interface DuplicatesViewProps {
  duplicates: DuplicateGroup[];
  onOpenFilePreview: (file: FileItem) => void;
  onDeleteFile: (fileId: string) => void;
}

export const DuplicatesView: React.FC<DuplicatesViewProps> = ({
  duplicates,
  onOpenFilePreview,
  onDeleteFile
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalWasteBytes = duplicates.reduce((acc, group) => {
    return acc + (group.files.length - 1) * group.size;
  }, 0);

  const handleDelete = async (fileId: string, name: string) => {
    if (confirm(`Are you sure you want to delete duplicate copy "${name}"? The other copy will remain intact.`)) {
      setDeletingId(fileId);
      try {
        await onDeleteFile(fileId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            SHA-256 Duplicate File Verification
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Cryptographic Content Hash Comparison</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-slate-300">{duplicates.length} duplicate clusters detected</span>
            <span aria-hidden="true">·</span>
            <span>Zero automated deletions</span>
          </div>
        </div>

        {totalWasteBytes > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Recoverable space: <strong className="font-mono tabular-nums">{(totalWasteBytes / 1024).toFixed(1)} KB</strong></span>
          </div>
        )}
      </div>

      {duplicates.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Repository is Clean</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All files possess unique cryptographic SHA-256 hashes. No redundant storage duplication found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {duplicates.map((group, gIdx) => (
            <div key={group.hash} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded bg-amber-950/60 border border-amber-800/80 text-amber-400">
                    <Copy className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-slate-200">
                      Cluster {gIdx + 1} ({group.files.length} Identical Copies)
                    </h3>
                    <p className="text-[10px] font-mono text-slate-500 truncate">
                      SHA-256: {group.hash}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono tabular-nums text-slate-400 self-start sm:self-auto">
                  {(group.size / 1024).toFixed(1)} KB each
                </span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {group.files.map((file, fIdx) => (
                  <div key={file.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200 truncate">{file.name}</span>
                        {fIdx === 0 ? (
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-800/40 shrink-0">
                            Primary
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/40 shrink-0">
                            Duplicate Copy
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono text-slate-400">{file.folderPath}</span>
                        <span aria-hidden="true">·</span>
                        <span>Ingested: {new Date(file.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onOpenFilePreview(file)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(file.id, file.name)}
                        disabled={deletingId === file.id}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/60 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete this copy</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
