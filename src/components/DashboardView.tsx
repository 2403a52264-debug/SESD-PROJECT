import React from 'react';
import {
  FileText,
  HardDrive,
  Sparkles,
  Copy,
  FolderTree,
  UploadCloud,
  ArrowUpRight,
  Eye,
  Download,
  FolderSync,
  Bot
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { AnalyticsData, FileItem, ViewTab } from '../types/index.ts';

interface DashboardViewProps {
  analytics: AnalyticsData | null;
  files: FileItem[];
  onSelectTab: (tab: ViewTab) => void;
  onOpenFilePreview: (file: FileItem) => void;
  onOpenOrganize: () => void;
  onDownloadFile: (fileId: string) => void;
}

const COLORS = ['#6366F1', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#8B5CF6', '#14B8A6'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  files,
  onSelectTab,
  onOpenFilePreview,
  onOpenOrganize,
  onDownloadFile
}) => {
  if (!analytics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading system metrics...</p>
        </div>
      </div>
    );
  }

  const recentFiles = files.slice(0, 5);
  const organizedFiles = files.filter(f => f.folderPath && f.folderPath !== 'Unorganized').slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            System Overview & Ingest Pipeline
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Production Build</span>
            <span aria-hidden="true">·</span>
            <span>Multimodal Vision & Document Engine</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-slate-300">{analytics.totalFiles} indexed records</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Classifier: <strong className="font-medium text-slate-200">Gemini 3.8 Flash</strong></span>
          </div>

          <button
            onClick={onOpenOrganize}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
          >
            <FolderSync className="w-3.5 h-3.5" />
            <span>Organize Now</span>
          </button>
        </div>
      </div>

      {/* 5 Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Files */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Files</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-100 font-mono tabular-nums">
              {analytics.totalFiles}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
              <span>Ingested & indexed</span>
            </div>
          </div>
        </div>

        {/* Total Storage Used */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Storage Used</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-100 font-mono tabular-nums">
              {analytics.totalStorageFormatted}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
              <span>Raw disk capacity</span>
            </div>
          </div>
        </div>

        {/* AI Classified Files */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">AI Classified</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-100 font-mono tabular-nums">
              {analytics.classifiedFiles}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1 font-mono tabular-nums">
              <span>{analytics.classificationRate}% classification rate</span>
            </div>
          </div>
        </div>

        {/* Duplicate Files */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Duplicate Files</span>
            <Copy className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-100 font-mono tabular-nums">
              {analytics.duplicateCount}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-1">
              <span>Identical SHA-256</span>
            </div>
          </div>
        </div>

        {/* Total Categories */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">AI Categories</span>
            <FolderTree className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-100 font-mono tabular-nums">
              {analytics.categoriesCount}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
              <span>Avg conf: {(analytics.averageConfidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* File Type Distribution (Pie Chart) */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-slate-200">
                File Type Distribution
              </h3>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">By Extension</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">Breakdown of uploaded media and document formats</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {analytics.fileTypeDistribution.length === 0 ? (
              <p className="text-xs text-slate-500">No file data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.fileTypeDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {analytics.fileTypeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs">
            {analytics.fileTypeDistribution.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="truncate text-slate-300 font-mono text-[11px]">.{item.name.toLowerCase()}</span>
                </div>
                <span className="font-mono text-[11px] tabular-nums text-slate-400">{item.count} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Category Distribution (Bar Chart) */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-slate-200">
                Category Distribution
              </h3>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">Taxonomy</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">Volume per recognized document and image category</p>
          </div>

          <div className="h-52 w-full">
            {analytics.categoryDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No categories available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryDistribution.slice(0, 5)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="category" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Primary Category: <strong className="text-slate-200">{analytics.categoryDistribution[0]?.category || 'None'}</strong></span>
            <button
              onClick={() => onSelectTab('categories')}
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Explore taxonomy</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Monthly Upload Activity (Line Chart) */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-slate-200">
                Monthly Ingest Cadence
              </h3>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">Timeline</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">Upload frequency and archive accumulation</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="uploads"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10B981' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Average monthly ingest: <strong className="text-slate-200 font-mono tabular-nums">
              {(analytics.monthlyActivity.reduce((acc, c) => acc + c.uploads, 0) / (analytics.monthlyActivity.length || 1)).toFixed(1)}
            </strong> files</span>
          </div>
        </div>
      </div>

      {/* Dual Table Section: Recently Uploaded Files & Recently Organized Files */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recently Uploaded Files */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">
                Recently Ingested Files
              </h3>
              <p className="text-[11px] text-slate-400">Latest files processed by upload pipeline</p>
            </div>
            <button
              onClick={() => onSelectTab('files')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View all ({files.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {recentFiles.map(file => (
              <div key={file.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-200 truncate">{file.name}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{file.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{(file.size / 1024).toFixed(0)} KB</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{(file.confidence * 100).toFixed(0)}% conf</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onOpenFilePreview(file)}
                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                    title="Preview file"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDownloadFile(file.id)}
                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Organized Files */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">
                Organized Files Location
              </h3>
              <p className="text-[11px] text-slate-400">Current folder routing and classification paths</p>
            </div>
            <button
              onClick={() => onSelectTab('folders')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Explore folders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {organizedFiles.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Files are currently in the root intake. Click "Organize Now" to route files into structured folders.
              </div>
            ) : (
              organizedFiles.map(file => (
                <div key={file.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-200 truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 truncate">
                      <span className="font-mono text-indigo-400">{file.folderPath}</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
                    {new Date(file.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Upload Callout Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-indigo-200">
            Intelligent File Intake Pipeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
            Supports multi-modal documents and images (PDF, DOCX, XLSX, PNG, JPG). Computes SHA-256 duplicate hashes, extracts text via OCR & Mammoth, and routes automatically using Gemini 3.8 Flash.
          </p>
        </div>
        <button
          onClick={() => onSelectTab('upload')}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Files Now</span>
        </button>
      </div>
    </div>
  );
};
