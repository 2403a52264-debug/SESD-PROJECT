import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  File,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { FileItem } from '../types/index.ts';

interface UploadViewProps {
  onUploadSuccess: (newFiles: FileItem[]) => void;
  onSelectTab: (tab: any) => void;
  maxUploadSizeMb: number;
}

const SUPPORTED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx', '.pptx', '.jpg', '.jpeg', '.png', '.webp'
];

export const UploadView: React.FC<UploadViewProps> = ({
  onUploadSuccess,
  onSelectTab,
  maxUploadSizeMb
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedResults, setUploadedResults] = useState<FileItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (incoming: File[]) => {
    setErrorMsg(null);
    const valid: File[] = [];
    const maxBytes = maxUploadSizeMb * 1024 * 1024;

    for (const f of incoming) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        setErrorMsg(`"${f.name}" has an unsupported format. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`);
        return;
      }
      if (f.size > maxBytes) {
        setErrorMsg(`"${f.name}" exceeds the maximum configured size limit of ${maxUploadSizeMb} MB`);
        return;
      }
      valid.push(f);
    }

    setSelectedFiles(prev => [...prev, ...valid]);
  };

  const removeSelectedFile = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const startUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(15);
    setErrorMsg(null);

    const interval = setInterval(() => {
      setUploadProgress(p => (p < 85 ? p + 15 : p));
    }, 200);

    try {
      const formData = new FormData();
      selectedFiles.forEach(f => formData.append('files', f));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      const created = data.files || [];
      setUploadedResults(created);
      setSelectedFiles([]);
      onUploadSuccess(created);
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err.message || 'An error occurred during file ingestion');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          Upload & Intelligent Intake
        </h2>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
          <span>Multi-file Upload</span>
          <span aria-hidden="true">·</span>
          <span>Automatic SHA-256 Duplicate Check</span>
          <span aria-hidden="true">·</span>
          <span>Instant AI Taxonomy Extraction</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-red-950/50 border border-red-800 text-xs text-red-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
          isDragging
            ? 'border-indigo-500 bg-indigo-950/20'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept={SUPPORTED_EXTENSIONS.join(',')}
        />

        <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h3 className="text-sm font-semibold text-slate-200 mb-1">
          Drop your files here, or <span className="text-indigo-400 hover:underline">browse files</span>
        </h3>
        <p className="text-xs text-slate-400 max-w-md mb-3">
          Supports PDF, DOCX, XLSX, TXT, CSV, PPTX, JPG, PNG, WEBP (Max {maxUploadSizeMb} MB per file).
        </p>

        <div className="flex flex-wrap justify-center gap-1.5 text-[11px] text-slate-500">
          {SUPPORTED_EXTENSIONS.map(ext => (
            <span key={ext} className="font-mono text-slate-400">{ext}</span>
          ))}
        </div>
      </div>

      {/* Selected Files Staging Queue */}
      {selectedFiles.length > 0 && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-200">
              Staged Files ({selectedFiles.length})
            </div>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Clear all
            </button>
          </div>

          <div className="divide-y divide-slate-800 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <File className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-200 truncate">{file.name}</span>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); removeSelectedFile(idx); }}
                  className="p-1 text-slate-500 hover:text-slate-300 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Processing file ingest & AI categorization...</span>
                <span className="font-mono tabular-nums">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={startUpload}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading & Classifying...' : `Upload & Classify ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Uploaded Results Summary Banner */}
      {uploadedResults.length > 0 && (
        <div className="p-5 rounded-xl bg-slate-900 border border-emerald-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <FileCheck className="w-4 h-4" />
              <span>Successfully Ingested {uploadedResults.length} File{uploadedResults.length > 1 ? 's' : ''}</span>
            </div>
            <button
              onClick={() => onSelectTab('files')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View in All Files</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {uploadedResults.map(res => (
              <div key={res.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-200 truncate">{res.name}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>Category: <strong className="text-indigo-400">{res.category}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{(res.confidence * 100).toFixed(0)}% confidence</span>
                    <span aria-hidden="true">·</span>
                    <span>Route: <code className="text-slate-300 font-mono text-[10px]">{res.suggestedFolder || 'Documents'}</code></span>
                  </div>
                </div>
                {res.isDuplicate && (
                  <span className="text-[10px] font-medium text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 shrink-0">
                    Duplicate Detected
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
