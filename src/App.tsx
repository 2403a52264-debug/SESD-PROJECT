import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { UploadView } from './components/UploadView.tsx';
import { AllFilesView } from './components/AllFilesView.tsx';
import { AICategoriesView } from './components/AICategoriesView.tsx';
import { FoldersView } from './components/FoldersView.tsx';
import { DuplicatesView } from './components/DuplicatesView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { ActivityHistoryView } from './components/ActivityHistoryView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { FilePreviewModal } from './components/FilePreviewModal.tsx';
import { OrganizeModal } from './components/OrganizeModal.tsx';
import { DebugModal } from './components/DebugModal.tsx';
import { SESDDocumentationModal } from './components/SESDDocumentationModal.tsx';
import { api } from './services/api.ts';
import {
  FileItem,
  FolderItem,
  CustomRuleItem,
  OrganizationOperationItem,
  ActivityItem,
  AnalyticsData,
  UserSettingsData,
  DuplicateGroup,
  ViewTab
} from './types/index.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [operations, setOperations] = useState<OrganizationOperationItem[]>([]);
  const [rules, setRules] = useState<CustomRuleItem[]>([]);
  const [settings, setSettings] = useState<UserSettingsData>({
    aiEnabled: true,
    aiProvider: 'gemini',
    geminiModel: 'gemini-3.8-flash',
    openaiModel: 'gpt-4o-mini',
    defaultOrganizeBy: 'ai_category',
    maxUploadSizeMb: 50,
    autoOrganizeOnUpload: false,
    ignoredExtensions: ['.tmp', '.ds_store'],
    theme: 'dark'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modals state
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isOrganizeOpen, setIsOrganizeOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Load all data
  const refreshAll = useCallback(async () => {
    try {
      const [filesData, foldersData, dupesData, analyticsData, actsData, opsData, rulesData, settData] = await Promise.all([
        api.getFiles(),
        api.getFolders(),
        api.getDuplicates(),
        api.getAnalytics(),
        api.getActivities(),
        api.getOperations(),
        api.getRules(),
        api.getSettings()
      ]);

      setFiles(filesData);
      setFolders(foldersData);
      setDuplicates(dupesData);
      setAnalytics(analyticsData);
      setActivities(actsData);
      setOperations(opsData);
      setRules(rulesData);
      setSettings(settData);
      if (settData.theme) {
        setTheme(settData.theme);
      }
    } catch (err) {
      console.error('Error refreshing system data:', err);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Sync theme class with documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    api.updateSettings({ theme: nextTheme }).catch(console.error);
  };

  // File Handlers
  const handleDeleteFile = async (id: string) => {
    try {
      await api.deleteFile(id);
      await refreshAll();
      if (previewFile?.id === id) {
        setPreviewFile(null);
      }
    } catch (e) {
      console.error('Delete file error:', e);
    }
  };

  const handleReclassifyFile = async (id: string) => {
    try {
      const res = await api.classifyFile(id);
      await refreshAll();
      if (previewFile?.id === id && res.file) {
        setPreviewFile(res.file);
      }
    } catch (e) {
      console.error('Reclassify error:', e);
    }
  };

  const handleDownloadFile = (id: string) => {
    window.location.href = `/api/files/${id}/download`;
  };

  const handleExportZip = async (options: { folderId?: string; category?: string; all?: boolean }) => {
    try {
      await api.exportZip(options);
    } catch (e) {
      console.error('Export error:', e);
    }
  };

  // Folder Handlers
  const handleCreateFolder = async (name: string, parentId?: string | null) => {
    try {
      await api.createFolder(name, parentId);
      await refreshAll();
    } catch (e) {
      console.error('Create folder error:', e);
    }
  };

  const handleRenameFolder = async (id: string, name: string) => {
    try {
      await api.renameFolder(id, name);
      await refreshAll();
    } catch (e) {
      console.error('Rename folder error:', e);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await api.deleteFolder(id);
      await refreshAll();
    } catch (e) {
      console.error('Delete folder error:', e);
    }
  };

  // Organization & Undo Handlers
  const handleUndoOperation = async (opId: string) => {
    try {
      await api.undoOperation(opId);
      await refreshAll();
    } catch (e) {
      console.error('Undo error:', e);
    }
  };

  // Custom Rules Handlers
  const handleCreateRule = async (rule: Partial<CustomRuleItem>) => {
    try {
      await api.createRule(rule);
      await refreshAll();
    } catch (e) {
      console.error('Create rule error:', e);
    }
  };

  const handleUpdateRule = async (id: string, rule: Partial<CustomRuleItem>) => {
    try {
      await api.updateRule(id, rule);
      await refreshAll();
    } catch (e) {
      console.error('Update rule error:', e);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await api.deleteRule(id);
      await refreshAll();
    } catch (e) {
      console.error('Delete rule error:', e);
    }
  };

  // Settings Handler
  const handleUpdateSettings = async (updates: Partial<UserSettingsData>) => {
    try {
      const updated = await api.updateSettings(updates);
      setSettings(updated);
      await refreshAll();
    } catch (e) {
      console.error('Update settings error:', e);
    }
  };

  const handleReseed = async () => {
    try {
      await api.reseedData();
      await refreshAll();
    } catch (e) {
      console.error('Reseed error:', e);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenDebug={() => setIsDebugOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        fileCount={files.length}
        duplicateCount={duplicates.length}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={q => {
            setSearchQuery(q);
            if (q && currentTab !== 'files') {
              setCurrentTab('files');
            }
          }}
          onOpenUpload={() => setCurrentTab('upload')}
          onOpenOrganize={() => setIsOrganizeOpen(true)}
          activities={activities}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-950">
          {currentTab === 'dashboard' && (
            <DashboardView
              analytics={analytics}
              files={files}
              onSelectTab={setCurrentTab}
              onOpenFilePreview={setPreviewFile}
              onOpenOrganize={() => setIsOrganizeOpen(true)}
              onDownloadFile={handleDownloadFile}
            />
          )}

          {currentTab === 'upload' && (
            <UploadView
              onUploadSuccess={async () => {
                await refreshAll();
              }}
              onSelectTab={setCurrentTab}
              maxUploadSizeMb={settings.maxUploadSizeMb}
            />
          )}

          {currentTab === 'files' && (
            <AllFilesView
              files={files}
              onOpenFilePreview={setPreviewFile}
              onDownloadFile={handleDownloadFile}
              onDeleteFile={handleDeleteFile}
              onReclassifyFile={handleReclassifyFile}
              onExportZip={handleExportZip}
              onOpenOrganize={() => setIsOrganizeOpen(true)}
            />
          )}

          {currentTab === 'categories' && (
            <AICategoriesView
              files={files}
              onOpenFilePreview={setPreviewFile}
              onDownloadFile={handleDownloadFile}
              onExportZip={options => handleExportZip(options)}
            />
          )}

          {currentTab === 'folders' && (
            <FoldersView
              folders={folders}
              files={files}
              onCreateFolder={handleCreateFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              onOpenFilePreview={setPreviewFile}
              onDownloadFile={handleDownloadFile}
              onExportFolderZip={folderId => handleExportZip({ folderId })}
            />
          )}

          {currentTab === 'duplicates' && (
            <DuplicatesView
              duplicates={duplicates}
              onOpenFilePreview={setPreviewFile}
              onDeleteFile={handleDeleteFile}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView analytics={analytics} />
          )}

          {currentTab === 'history' && (
            <ActivityHistoryView
              activities={activities}
              operations={operations}
              onUndoOperation={handleUndoOperation}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              rules={rules}
              onUpdateSettings={handleUpdateSettings}
              onCreateRule={handleCreateRule}
              onUpdateRule={handleUpdateRule}
              onDeleteRule={handleDeleteRule}
              onReseedData={handleReseed}
            />
          )}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={handleDownloadFile}
        onReclassify={handleReclassifyFile}
      />

      <OrganizeModal
        isOpen={isOrganizeOpen}
        onClose={() => setIsOrganizeOpen(false)}
        onOrganizationApplied={refreshAll}
      />

      <DebugModal
        isOpen={isDebugOpen}
        onClose={() => setIsDebugOpen(false)}
      />

      <SESDDocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
