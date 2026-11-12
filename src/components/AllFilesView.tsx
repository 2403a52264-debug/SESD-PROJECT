import React, { useState } from 'react';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Eye,
  Download,
  Trash2,
  Sparkles,
  ArrowUpDown,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileCode,
  File as FileIcon,
  Archive,
  Copy
} from 'lucide-react';
import { FileItem } from '../types/index.ts';

interface AllFilesViewProps {
  files: FileItem[];
  onOpenFilePreview: (file: FileItem) => void;
  onDownloadFile: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onReclassifyFile: (fileId: string) => void;
  onExportZip: (options: { category?: string; all?: boolean }) => void;
  onOpenOrganize: () => void;
}

export const AllFilesView: React.FC<AllFilesViewProps> = ({
  files,
  onOpenFilePreview,
  onDownloadFile,
  onDeleteFile,
  onReclassifyFile,
  onExportZip,
  onOpenOrganize
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'confidence'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  // Collect unique categories & extensions
  const categories = Array.from(new Set(files.map(f => f.category).filter(Boolean)));
  const extensions = Array.from(new Set(files.map(f => f.extension.toLowerCase().replace('.', '')).filter(Boolean)));

  // Filter and sort
  const filtered = files.filter(file => {
    if (duplicatesOnly && !file.isDuplicate) return false;
    if (selectedCategory !== 'all' && file.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (selectedType !== 'all' && !file.extension.toLowerCase().endsWith(selectedType.toLowerCase())) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = file.name.toLowerCase().includes(q);
      const matchCat = file.category.toLowerCase().includes(q);
      const matchTags = file.tags.some(t => t.toLowerCase().includes(q));
      const matchPath = file.folderPath.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchTags && !matchPath) return false;
    }
    return true;
  }).sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'date') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
    if (sortBy === 'size') cmp = a.size - b.size;
    if (sortBy === 'confidence') cmp = a.confidence - b.confidence;
    return sortOrder === 'desc' ? -cmp : cmp;
  });

  const getFileIcon = (mime: string, ext: string) => {
    if (mime.startsWith('image/')) return <FileImage className="w-4 h-4 text-pink-400 shrink-0" />;
    if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') return <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />;
    if (ext === '.pdf') return <FileText className="w-4 h-4 text-red-400 shrink-0" />;
    if (['.json', '.js', '.ts', '.py', '.html'].includes(ext)) return <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />;
    return <FileIcon className="w-4 h-4 text-blue-400 shrink-0" />;
  };

  const toggleSelectAll = () => {
    if (selectedFileIds.length === filtered.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(filtered.map(f => f.id));
    }
  };

  const toggleSelectFile = (id: string) => {
    setSelectedFileIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            All Files Catalog
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span className="font-mono tabular-nums text-slate-300">{filtered.length} files matching</span>
            <span aria-hidden="true">·</span>
            <span>Total Catalog: {files.length}</span>
            <span aria-hidden="true">·</span>
            <span>Multi-modal metadata inspection</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onExportZip({ all: true })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Archive className="w-3.5 h-3.5 text-indigo-400" />
            <span>Download All ZIP</span>
          </button>

          <button
            onClick={onOpenOrganize}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Organize Catalog</span>
          </button>
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative min-w-[180px] max-w-xs flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search file contents or tags..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-300 text-xs focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-300 text-xs focus:outline-none"
          >
            <option value="all">All Formats</option>
            {extensions.map(ext => (
              <option key={ext} value={ext}>.{ext.toUpperCase()}</option>
            ))}
          </select>

          {/* Duplicates Toggle Button */}
          <button
            onClick={() => setDuplicatesOnly(!duplicatesOnly)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs transition-colors ${
              duplicatesOnly
                ? 'bg-amber-950/60 border-amber-700 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicates</span>
          </button>
        </div>

        {/* Sorting & View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-slate-400">
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="confidence">AI Confidence</option>
            </select>
            <button
              onClick={() => setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))}
              className="text-slate-400 hover:text-slate-200 px-1 font-mono text-[10px]"
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-md p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <Filter className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No matching files found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria, category filters, or duplicate flag.
          </p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedType('all'); setDuplicatesOnly(false); }}
            className="px-3 py-1.5 text-xs text-indigo-400 hover:underline"
          >
            Reset all filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 w-8">
                    <input
                      type="checkbox"
                      checked={selectedFileIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                    />
                  </th>
                  <th className="py-2.5 px-4">File Name</th>
                  <th className="py-2.5 px-4">AI Category</th>
                  <th className="py-2.5 px-4">Folder Path</th>
                  <th className="py-2.5 px-4 text-right">Size</th>
                  <th className="py-2.5 px-4 text-right">Confidence</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filtered.map(file => (
                  <tr key={file.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedFileIds.includes(file.id)}
                        onChange={() => toggleSelectFile(file.id)}
                        className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5 max-w-xs sm:max-w-md">
                        {getFileIcon(file.mimeType, file.extension)}
                        <div className="min-w-0">
                          <p
                            onClick={() => onOpenFilePreview(file)}
                            className="font-medium text-slate-200 truncate hover:text-indigo-400 cursor-pointer"
                          >
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono text-slate-400">{file.extension.toUpperCase()}</span>
                            <span aria-hidden="true">·</span>
                            <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                            {file.isDuplicate && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-amber-400 font-medium">Duplicate</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-medium text-slate-200">{file.category}</span>
                        <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{file.subcategory}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-slate-400 truncate max-w-[160px] block">
                        {file.folderPath}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono tabular-nums text-emerald-400 font-medium">
                        {(file.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenFilePreview(file)}
                          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                          title="Preview document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onReclassifyFile(file.id)}
                          className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                          title="Re-run AI classification"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDownloadFile(file.id)}
                          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteFile(file.id)}
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filtered.map(file => (
            <div
              key={file.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    {getFileIcon(file.mimeType, file.extension)}
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono tabular-nums text-emerald-400 font-medium">
                      {(file.confidence * 100).toFixed(0)}%
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono">confidence</p>
                  </div>
                </div>

                <p
                  onClick={() => onOpenFilePreview(file)}
                  className="font-medium text-xs text-slate-200 truncate cursor-pointer hover:text-indigo-400"
                  title={file.name}
                >
                  {file.name}
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                  <span>{file.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{(file.size / 1024).toFixed(0)} KB</span>
                </div>

                <p className="text-[10px] font-mono text-slate-500 mt-2 truncate bg-slate-950 px-2 py-1 rounded">
                  {file.folderPath}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500">
                  {new Date(file.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenFilePreview(file)}
                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                    title="Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDownloadFile(file.id)}
                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
