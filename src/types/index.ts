export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  hash: string;
  storagePath: string;
  folderId: string | null;
  folderPath: string;
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

export interface FolderItem {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomRuleItem {
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

export interface OrganizationOperationItem {
  id: string;
  operationType: 'ai_category' | 'extension' | 'date' | 'size' | 'custom_rules';
  status: 'applied' | 'reverted';
  filesMovedCount: number;
  description: string;
  timestamp: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  details: string;
  type: 'upload' | 'classify' | 'organize' | 'undo' | 'delete' | 'duplicate_scan' | 'settings';
  timestamp: string;
  fileId?: string;
}

export interface AnalyticsData {
  totalFiles: number;
  totalStorageBytes: number;
  totalStorageFormatted: string;
  classifiedFiles: number;
  classificationRate: number;
  duplicateCount: number;
  categoriesCount: number;
  averageConfidence: number;
  fileTypeDistribution: { name: string; count: number; percentage: number }[];
  categoryDistribution: { category: string; count: number }[];
  monthlyActivity: { month: string; uploads: number }[];
}

export interface UserSettingsData {
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

export interface DuplicateGroup {
  hash: string;
  size: number;
  files: FileItem[];
}

export type ViewTab =
  | 'dashboard'
  | 'upload'
  | 'files'
  | 'categories'
  | 'folders'
  | 'duplicates'
  | 'analytics'
  | 'history'
  | 'settings';
