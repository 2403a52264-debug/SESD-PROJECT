import {
  FileItem,
  FolderItem,
  CustomRuleItem,
  OrganizationOperationItem,
  ActivityItem,
  AnalyticsData,
  UserSettingsData,
  DuplicateGroup
} from '../types/index.ts';

export const api = {
  // Files
  async getFiles(params?: { folderId?: string; category?: string; query?: string; duplicatesOnly?: boolean }): Promise<FileItem[]> {
    const query = new URLSearchParams();
    if (params?.folderId) query.set('folderId', params.folderId);
    if (params?.category) query.set('category', params.category);
    if (params?.query) query.set('query', params.query);
    if (params?.duplicatesOnly) query.set('duplicatesOnly', 'true');

    const res = await fetch(`/api/files?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch files');
    const data = await res.json();
    return data.files || [];
  },

  async getFile(id: string): Promise<{ file: FileItem; aiResult?: any }> {
    const res = await fetch(`/api/files/${id}`);
    if (!res.ok) throw new Error('Failed to fetch file details');
    return res.json();
  },

  async deleteFile(id: string): Promise<void> {
    const res = await fetch(`/api/files/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete file');
  },

  async classifyFile(fileId: string): Promise<any> {
    const res = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId })
    });
    if (!res.ok) throw new Error('Failed to classify file');
    return res.json();
  },

  async uploadFiles(files: File[]): Promise<FileItem[]> {
    const formData = new FormData();
    for (const f of files) {
      formData.append('files', f);
    }
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload files');
    }
    const data = await res.json();
    return data.files || [];
  },

  // Folders
  async getFolders(): Promise<FolderItem[]> {
    const res = await fetch('/api/folders');
    if (!res.ok) throw new Error('Failed to fetch folders');
    const data = await res.json();
    return data.folders || [];
  },

  async createFolder(name: string, parentId: string | null = null, color?: string): Promise<FolderItem> {
    const res = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parentId, color })
    });
    if (!res.ok) throw new Error('Failed to create folder');
    const data = await res.json();
    return data.folder;
  },

  async renameFolder(id: string, name: string): Promise<FolderItem> {
    const res = await fetch(`/api/folders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error('Failed to rename folder');
    const data = await res.json();
    return data.folder;
  },

  async deleteFolder(id: string): Promise<void> {
    const res = await fetch(`/api/folders/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete folder');
  },

  // Duplicates
  async getDuplicates(): Promise<DuplicateGroup[]> {
    const res = await fetch('/api/duplicates');
    if (!res.ok) throw new Error('Failed to fetch duplicates');
    const data = await res.json();
    return data.duplicates || [];
  },

  // Organization
  async previewOrganization(strategy: string, fileIds?: string[]): Promise<any[]> {
    const res = await fetch('/api/organize/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy, fileIds })
    });
    if (!res.ok) throw new Error('Failed to preview organization');
    const data = await res.json();
    return data.previews || [];
  },

  async applyOrganization(strategy: string, fileIds?: string[]): Promise<OrganizationOperationItem> {
    const res = await fetch('/api/organize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy, fileIds })
    });
    if (!res.ok) throw new Error('Failed to apply organization');
    const data = await res.json();
    return data.operation;
  },

  async undoOperation(operationId: string): Promise<{ success: boolean; revertedCount: number }> {
    const res = await fetch('/api/undo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operationId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to undo operation');
    }
    return res.json();
  },

  async getOperations(): Promise<OrganizationOperationItem[]> {
    const res = await fetch('/api/operations');
    if (!res.ok) throw new Error('Failed to fetch operations');
    const data = await res.json();
    return data.operations || [];
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch('/api/analytics');
    if (!res.ok) throw new Error('Failed to fetch analytics');
    const data = await res.json();
    return data.analytics;
  },

  // Activities
  async getActivities(): Promise<ActivityItem[]> {
    const res = await fetch('/api/activities');
    if (!res.ok) throw new Error('Failed to fetch activities');
    const data = await res.json();
    return data.activities || [];
  },

  // Settings
  async getSettings(): Promise<UserSettingsData> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    const data = await res.json();
    return data.settings;
  },

  async updateSettings(settings: Partial<UserSettingsData>): Promise<UserSettingsData> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    const data = await res.json();
    return data.settings;
  },

  // Rules
  async getRules(): Promise<CustomRuleItem[]> {
    const res = await fetch('/api/rules');
    if (!res.ok) throw new Error('Failed to fetch rules');
    const data = await res.json();
    return data.rules || [];
  },

  async createRule(rule: Partial<CustomRuleItem>): Promise<CustomRuleItem> {
    const res = await fetch('/api/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    if (!res.ok) throw new Error('Failed to create rule');
    const data = await res.json();
    return data.rule;
  },

  async updateRule(id: string, rule: Partial<CustomRuleItem>): Promise<CustomRuleItem> {
    const res = await fetch(`/api/rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    if (!res.ok) throw new Error('Failed to update rule');
    const data = await res.json();
    return data.rule;
  },

  async deleteRule(id: string): Promise<void> {
    const res = await fetch(`/api/rules/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete rule');
  },

  // Export ZIP
  async exportZip(options: { folderId?: string; category?: string; all?: boolean }): Promise<void> {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_file_organizer_export_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // System Health & Debug
  async getHealth(): Promise<any> {
    const res = await fetch('/api/debug/health');
    if (!res.ok) throw new Error('Failed to get health status');
    return res.json();
  },

  async testAI(text?: string): Promise<any> {
    const res = await fetch('/api/debug/test-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('AI test failed');
    return res.json();
  },

  async reseedData(): Promise<void> {
    const res = await fetch('/api/seed', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset sample data');
  }
};
