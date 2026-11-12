import React, { useState } from 'react';
import {
  X,
  Download,
  Sparkles,
  FileText,
  FileImage,
  Hash,
  ShieldCheck,
  Tag,
  Copy,
  Calendar,
  HardDrive
} from 'lucide-react';
import { FileItem } from '../types/index.ts';

interface FilePreviewModalProps {
  file: FileItem | null;
  onClose: () => void;
  onDownload: (fileId: string) => void;
  onReclassify: (fileId: string) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  onClose,
  onDownload,
  onReclassify
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'ai' | 'hash'>('preview');
  const [copiedHash, setCopiedHash] = useState(false);

  if (!file) return null;

  const isImage = file.mimeType.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(file.extension.toLowerCase());

  const handleCopyHash = () => {
    navigator.clipboard.writeText(file.hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-indigo-400 shrink-0">
              {isImage ? <FileImage className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-100 truncate">{file.name}</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {file.folderPath} · {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onDownload(file.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={() => onReclassify(file.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Re-Classify</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/50 flex items-center gap-1 text-xs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'preview' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            File Content Preview
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'ai' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Classification Analysis
          </button>
          <button
            onClick={() => setActiveTab('hash')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'hash' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Security & Cryptographic Hash
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'preview' && (
            <div className="space-y-4">
              {isImage ? (
                <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-lg border border-slate-800">
                  <img
                    src={`/api/files/${file.id}/preview`}
                    alt={file.name}
                    className="max-h-80 max-w-full rounded object-contain"
                    onError={(e) => {
                      // Fallback image display
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <p className="text-[11px] text-slate-500 mt-2 font-mono">
                    {file.mimeType} · {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto text-[11px]">
                  {file.previewText || 'No readable plain-text could be extracted. Use Download to inspect full binary file.'}
                </div>
              )}

              {/* Quick Metadata Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Category</span>
                  <span className="font-semibold text-slate-200">{file.category}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Model Confidence</span>
                  <span className="font-semibold text-emerald-400 font-mono tabular-nums">
                    {(file.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Size</span>
                  <span className="font-semibold text-slate-200 font-mono tabular-nums">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Ingested</span>
                  <span className="font-semibold text-slate-200">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-300">Classification Rationale</span>
                  <span className="text-emerald-400 font-mono tabular-nums font-semibold">
                    {(file.confidence * 100).toFixed(1)}% Confidence
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {file.reasoning || 'Automated multi-modal analysis based on document semantics and content headers.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500">Predicted Subcategory</span>
                  <p className="font-medium text-slate-200">{file.subcategory}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500">AI Suggested Folder</span>
                  <p className="font-mono text-indigo-400 text-[11px] truncate">{file.suggestedFolder}</p>
                </div>
              </div>

              {file.tags && file.tags.length > 0 && (
                <div>
                  <span className="text-xs text-slate-400 block mb-1.5">Extracted Tags & Tokens</span>
                  <div className="flex flex-wrap gap-1.5">
                    {file.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hash' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Cryptographic SHA-256 Digest</span>
                  <button
                    onClick={handleCopyHash}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedHash ? 'Copied!' : 'Copy Hash'}</span>
                  </button>
                </div>
                <p className="font-mono text-[11px] text-emerald-400 break-all bg-slate-900 p-2.5 rounded border border-slate-800">
                  {file.hash}
                </p>
                <p className="text-[11px] text-slate-500">
                  Computed instantly upon ingest to guarantee bit-level duplicate detection and integrity verification.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-300 block">Duplicate Status</span>
                  <span className="text-[11px] text-slate-400">
                    {file.isDuplicate ? 'Identical matching copies found in repository' : 'Unique file in system'}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded text-[11px] font-mono ${
                  file.isDuplicate ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                }`}>
                  {file.isDuplicate ? 'Duplicate Flagged' : 'Unique Fingerprint'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
