import React, { useState } from 'react';
import {
  Sparkles,
  Archive,
  Eye,
  FileText,
  ChevronRight,
  Download
} from 'lucide-react';
import { FileItem } from '../types/index.ts';

interface AICategoriesViewProps {
  files: FileItem[];
  onOpenFilePreview: (file: FileItem) => void;
  onDownloadFile: (fileId: string) => void;
  onExportZip: (options: { category: string }) => void;
}

export const AICategoriesView: React.FC<AICategoriesViewProps> = ({
  files,
  onOpenFilePreview,
  onDownloadFile,
  onExportZip
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Group files by category
  const categoriesMap = new Map<string, FileItem[]>();
  for (const f of files) {
    const cat = f.category || 'Other';
    const list = categoriesMap.get(cat) || [];
    list.push(f);
    categoriesMap.set(cat, list);
  }

  const categoryEntries = Array.from(categoriesMap.entries()).map(([name, catFiles]) => {
    const avgConfidence = catFiles.reduce((acc, f) => acc + f.confidence, 0) / (catFiles.length || 1);
    const totalBytes = catFiles.reduce((acc, f) => acc + f.size, 0);
    return {
      name,
      files: catFiles,
      count: catFiles.length,
      avgConfidence,
      totalBytes
    };
  }).sort((a, b) => b.count - a.count);

  const activeCategoryData = selectedCategory
    ? categoryEntries.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase())
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          AI Categories & Predictive Clusters
        </h2>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
          <span>Multimodal Document & Vision Taxonomy</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-300">{categoryEntries.length} predicted categories</span>
          <span aria-hidden="true">·</span>
          <span>Automated Metadata Ingestion</span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryEntries.map(cat => (
          <div
            key={cat.name}
            onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
            className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedCategory === cat.name
                ? 'bg-indigo-950/30 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/40'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">{cat.name}</h3>
                    <p className="text-[11px] font-mono tabular-nums text-slate-400">
                      {cat.count} document{cat.count > 1 ? 's' : ''} ({(cat.totalBytes / 1024).toFixed(0)} KB)
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono tabular-nums text-emerald-400 font-medium">
                  {(cat.avgConfidence * 100).toFixed(0)}%
                </span>
              </div>

              {/* Sample files list preview */}
              <div className="mt-3 space-y-1.5 border-t border-slate-800/80 pt-2.5">
                {cat.files.slice(0, 3).map(f => (
                  <div key={f.id} className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </div>
                ))}
                {cat.count > 3 && (
                  <p className="text-[10px] text-slate-500 font-mono">
                    +{cat.count - 3} more files
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-indigo-400 flex items-center gap-1 font-medium">
                <span>{selectedCategory === cat.name ? 'Hide files' : 'View files'}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedCategory === cat.name ? 'rotate-90' : ''}`} />
              </span>

              <button
                onClick={e => {
                  e.stopPropagation();
                  onExportZip({ category: cat.name });
                }}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                title="Download this category as ZIP"
              >
                <Archive className="w-3 h-3 text-indigo-400" />
                <span>Export ZIP</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Category Files View */}
      {activeCategoryData && (
        <div className="p-5 rounded-xl bg-slate-900 border border-indigo-900/40 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Documents in Category: {activeCategoryData.name}
              </h3>
              <p className="text-xs text-slate-400">
                AI identified with {(activeCategoryData.avgConfidence * 100).toFixed(0)}% average model confidence
              </p>
            </div>

            <button
              onClick={() => onExportZip({ category: activeCategoryData.name })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors shrink-0"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Export {activeCategoryData.name} ZIP</span>
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {activeCategoryData.files.map(file => (
              <div key={file.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <p
                    onClick={() => onOpenFilePreview(file)}
                    className="font-medium text-slate-200 truncate cursor-pointer hover:text-indigo-400"
                  >
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>Subcategory: <strong className="text-slate-300">{file.subcategory}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{(file.size / 1024).toFixed(1)} KB</span>
                    <span aria-hidden="true">·</span>
                    <span>Reasoning: <span className="text-slate-400 italic truncate max-w-sm inline-block align-bottom">{file.reasoning}</span></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenFilePreview(file)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                    title="Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDownloadFile(file.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
