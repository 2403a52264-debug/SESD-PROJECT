import { z } from 'zod';

export const AIClassificationSchema = z.object({
  category: z.string().min(1),
  subcategory: z.string().min(1),
  confidence: z.number().min(0).max(1),
  suggested_folder: z.string().min(1),
  reasoning: z.string().min(1),
  tags: z.array(z.string()).default([]),
  language: z.string().default('English')
});

export type AIClassificationResult = z.infer<typeof AIClassificationSchema>;

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileRecord {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  hash: string; // SHA-256
  storagePath: string;
  folderId: string | null; // null represents unorganized / root
  folderPath: string; // e.g. "Root" or "Organized Files/Documents/Resume"
  category: string;
  subcategory: string;
  confidence: number;
  suggestedFolder?: string;
  reasoning?: string;
  tags: string[];
  language?: string;
  isDuplicate: boolean;
  duplicateGroupId?: string;
  previewText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIResult {
  id: string;
  fileId: string;
  category: string;
  subcategory: string;
  confidence: number;
  suggestedFolder: string;
  reasoning: string;
  tags: string[];
  language: string;
  modelUsed: string;
  createdAt: string;
}

export interface CustomRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  conditionField: 'extension' | 'filename' | 'category' | 'size';
  conditionOperator: 'equals' | 'contains' | 'greater_than' | 'ends_with';
  conditionValue: string;
  destinationFolder: string;
  createdAt: string;
}

export interface OrganizationOperation {
  id: string;
  operationType: 'ai_category' | 'extension' | 'date' | 'size' | 'custom_rules';
  status: 'applied' | 'reverted';
  filesMovedCount: number;
  description: string;
  timestamp: string;
  items: OrganizationItem[];
}

export interface OrganizationItem {
  id: string;
  operationId: string;
  fileId: string;
  fileName: string;
  originalFolderId: string | null;
  newFolderId: string | null;
  originalFolderPath: string;
  newFolderPath: string;
  reverted: boolean;
}

export interface ActivityHistory {
  id: string;
  action: string;
  details: string;
  type: 'upload' | 'classify' | 'organize' | 'undo' | 'delete' | 'duplicate_scan' | 'settings';
  timestamp: string;
  fileId?: string;
}

export interface UserSettings {
  aiEnabled: boolean;
  aiProvider: 'gemini' | 'openai' | 'rule_based';
  geminiModel: string;
  openaiModel: string;
  defaultOrganizeBy: 'ai_category' | 'extension' | 'date' | 'size' | 'custom_rules';
  maxUploadSizeMb: number;
  autoOrganizeOnUpload: boolean;
  ignoredExtensions: string[];
  theme: 'dark' | 'light';
  openaiApiKey?: string;
}

export interface DatabaseState {
  users: User[];
  folders: Folder[];
  files: FileRecord[];
  aiResults: AIResult[];
  customRules: CustomRule[];
  operations: OrganizationOperation[];
  activities: ActivityHistory[];
  settings: UserSettings;
}
