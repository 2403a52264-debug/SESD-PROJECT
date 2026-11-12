import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  FolderOpen,
  Edit2,
  Trash2,
  Archive,
  Eye,
  Download,
  FileText,
  Search,
  ChevronRight,
  Move
} from 'lucide-react';
import { FileItem, FolderItem } from '../types/index.ts';

interface FoldersViewProps {
  folders: FolderItem[];
  files: FileItem[];
  onCreateFolder: (name: string, parentId?: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onOpenFilePreview: (file: FileItem) => void;
  onDownloadFile: (fileId: string) => void;
  onExportFolderZip: (folderId: string) => void;
}

export const FoldersView: React.FC<FoldersViewProps> = ({
  folders,
  files,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onOpenFilePreview,
  onDownloadFile,
  onExportFolderZip
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folders[0]?.id || null);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameTarget, setRenameTarget] = useState<FolderItem | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const activeFolder = folders.find(f => f.id === selectedFolderId);

  // Files in this folder or matching its path prefix
  const folderFiles = activeFolder
    ? files.filter(f => f.folderId === activeFolder.id || f.folderPath.startsWith(activeFolder.path))
    : [];

  const filteredFolders = folders.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.path.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim(), selectedFolderId);
    setNewFolderName('');
    setShowCreateModal(false);
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !renameValue.trim()) return;
    onRenameFolder(renameTarget.id, renameValue.trim());
    setRenameTarget(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            Intelligent Folder Hierarchy
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Dynamic Virtual & Storage Directory Tree</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-slate-300">{folders.length} active directories</span>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>New Folder</span>
        </button>
      </div>

      {/* Main 2-Column Split: Folder Directory on Left, File Listing on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Column: Folders Directory */}
        <div className="md:col-span-5 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Directories</span>
            <div className="relative w-36">
              <Search className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-6 pr-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {filteredFolders.map(folder => {
              const count = files.filter(f => f.folderId === folder.id || f.folderPath.startsWith(folder.path)).length;
              const isSelected = selectedFolderId === folder.id;

              return (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`group p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isSelected ? (
                      <FolderOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <Folder className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className="truncate">{folder.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-[10px] tabular-nums text-slate-500 bg-slate-950/60 px-1.5 py-0.5 rounded">
                      {count}
                    </span>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setRenameTarget(folder);
                        setRenameValue(folder.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-200 transition-opacity"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm(`Delete folder "${folder.name}"? Files will be unassigned to root.`)) {
                          onDeleteFolder(folder.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-opacity"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Files inside selected directory */}
        <div className="md:col-span-7 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          {activeFolder ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <FolderOpen className="w-4 h-4 text-indigo-400" />
                    <span>{activeFolder.name}</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">{activeFolder.path}</p>
                </div>

                <button
                  onClick={() => onExportFolderZip(activeFolder.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors shrink-0"
                >
                  <Archive className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download Folder ZIP</span>
                </button>
              </div>

              {folderFiles.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No files currently in this directory. Use the Organize tool or upload files to populate it.
                </div>
              ) : (
                <div className="divide-y divide-slate-800 max-h-[460px] overflow-y-auto pr-1">
                  {folderFiles.map(file => (
                    <div key={file.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <p
                          onClick={() => onOpenFilePreview(file)}
                          className="font-medium text-slate-200 truncate cursor-pointer hover:text-indigo-400"
                        >
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono">{file.extension.toUpperCase()}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{(file.size / 1024).toFixed(0)} KB</span>
                          <span aria-hidden="true">·</span>
                          <span>Category: <strong className="text-slate-400">{file.category}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              Select a directory on the left to inspect contents.
            </div>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Create New Folder</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Folder Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  placeholder="e.g. Legal_Agreements"
                  autoFocus
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {renameTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Rename Folder</h3>
            <form onSubmit={handleRename} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">New Folder Name</label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenameTarget(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md"
                >
                  Save Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
