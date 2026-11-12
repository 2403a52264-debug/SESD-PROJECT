import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DatabaseState, FileRecord, Folder, CustomRule, OrganizationOperation, ActivityHistory, UserSettings, AIResult } from './types.ts';

const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.join('/tmp', '.data') : path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
export const UPLOADS_DIR = isVercel ? path.join('/tmp', 'uploads') : path.resolve(process.cwd(), 'uploads');

// Ensure directories exist
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Directory creation warning:', e);
}

const defaultSettings: UserSettings = {
  aiEnabled: true,
  aiProvider: 'gemini',
  geminiModel: 'gemini-3.8-flash',
  openaiModel: 'gpt-4o-mini',
  defaultOrganizeBy: 'ai_category',
  maxUploadSizeMb: 50,
  autoOrganizeOnUpload: false,
  ignoredExtensions: ['.tmp', '.ds_store', '.crdownload'],
  theme: 'dark'
};

const initialFolders: Folder[] = [
  { id: 'f-docs', name: 'Documents', path: 'Organized Files/Documents', parentId: null, color: '#3B82F6', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'f-resumes', name: 'Resumes', path: 'Organized Files/Documents/Resume', parentId: 'f-docs', color: '#6366F1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'f-reports', name: 'Reports', path: 'Organized Files/Documents/Reports', parentId: 'f-docs', color: '#8B5CF6', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'f-finance', name: 'Finance', path: 'Organized Files/Finance', parentId: null, color: '#10B981', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'f-receipts', name: 'Receipts', path: 'Organized Files/Finance/Receipts', parentId: 'f-finance', color: '#059669', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'f-invoices', name: 'Invoices', path: 'Organized Files/Finance/Invoices', parentId: 'f-finance', color: '#047857', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'f-images', name: 'Images', path: 'Organized Files/Images', parentId: null, color: '#EC4899', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'f-photos', name: 'Photos', path: 'Organized Files/Images/Photos', parentId: 'f-images', color: '#DB2777', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'f-screenshots', name: 'Screenshots', path: 'Organized Files/Images/Screenshots', parentId: 'f-images', color: '#BE185D', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const initialRules: CustomRule[] = [
  {
    id: 'rule-1',
    name: 'Auto-route Resumes',
    enabled: true,
    priority: 1,
    conditionField: 'filename',
    conditionOperator: 'contains',
    conditionValue: 'resume',
    destinationFolder: 'Organized Files/Documents/Resume',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rule-2',
    name: 'Finance Receipts Router',
    enabled: true,
    priority: 2,
    conditionField: 'category',
    conditionOperator: 'equals',
    conditionValue: 'Receipt',
    destinationFolder: 'Organized Files/Finance/Receipts',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rule-3',
    name: 'Invoices Router',
    enabled: true,
    priority: 3,
    conditionField: 'category',
    conditionOperator: 'equals',
    conditionValue: 'Invoice',
    destinationFolder: 'Organized Files/Finance/Invoices',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rule-4',
    name: 'Route PDF Documents',
    enabled: false,
    priority: 4,
    conditionField: 'extension',
    conditionOperator: 'equals',
    conditionValue: '.pdf',
    destinationFolder: 'Organized Files/Documents',
    createdAt: new Date().toISOString()
  }
];

// Helper to seed realistic college-project sample files
function createSeedFiles(): FileRecord[] {
  const seedFilesData = [
    {
      name: 'Software_Engineer_Resume_Alex_Chen.pdf',
      originalName: 'Software_Engineer_Resume_Alex_Chen.pdf',
      mimeType: 'application/pdf',
      extension: '.pdf',
      size: 142850,
      category: 'Resume',
      subcategory: 'Engineering Resume',
      confidence: 0.98,
      suggestedFolder: 'Organized Files/Documents/Resume',
      reasoning: 'Contains work experience, technical skills in React and Node.js, education history.',
      tags: ['resume', 'career', 'engineering', 'curriculum-vitae'],
      previewText: 'Alex Chen\nSenior Full-Stack Engineer\nExperience: 5 years in TypeScript, Next.js, Cloud Architectures\nEducation: B.S. Computer Science',
      folderPath: 'Organized Files/Documents/Resume',
      folderId: 'f-resumes',
      content: 'Alex Chen - Senior Full-Stack Engineer. Experienced in React, Node.js, Distributed Systems.'
    },
    {
      name: 'AWS_Cloud_Invoice_Oct_2026.pdf',
      originalName: 'AWS_Cloud_Invoice_Oct_2026.pdf',
      mimeType: 'application/pdf',
      extension: '.pdf',
      size: 89400,
      category: 'Invoice',
      subcategory: 'Cloud Hosting Invoice',
      confidence: 0.96,
      suggestedFolder: 'Organized Files/Finance/Invoices',
      reasoning: 'Features billing line items, invoice ID #INV-92819, due date and total amount of $248.50.',
      tags: ['invoice', 'aws', 'billing', 'finance'],
      previewText: 'Amazon Web Services, Inc. Invoice #INV-92819\nBilling Period: Oct 1 - Oct 31, 2026\nTotal Amount Due: $248.50 USD',
      folderPath: 'Organized Files/Finance/Invoices',
      folderId: 'f-invoices',
      content: 'Amazon Web Services Invoice #INV-92819. Total Due: $248.50. Cloud Compute & Storage.'
    },
    {
      name: 'Quarterly_Research_Report_Q3.docx',
      originalName: 'Quarterly_Research_Report_Q3.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: '.docx',
      size: 345000,
      category: 'Report',
      subcategory: 'Research Analysis',
      confidence: 0.92,
      suggestedFolder: 'Organized Files/Documents/Reports',
      reasoning: 'Document includes an executive summary, methodology, performance benchmarks, and conclusion.',
      tags: ['report', 'research', 'analysis', 'q3'],
      previewText: 'Executive Summary: Distributed File Organization Performance\nBenchmarking classification throughput across multi-modal document structures.',
      folderPath: 'Organized Files/Documents/Reports',
      folderId: 'f-reports',
      content: 'Quarterly Research Report on AI file systems and vector indexing performance benchmarks.'
    },
    {
      name: 'Campus_Dining_Hall_Receipt.jpg',
      originalName: 'Campus_Dining_Hall_Receipt.jpg',
      mimeType: 'image/jpeg',
      extension: '.jpg',
      size: 52400,
      category: 'Receipt',
      subcategory: 'Food Receipt',
      confidence: 0.94,
      suggestedFolder: 'Organized Files/Finance/Receipts',
      reasoning: 'Thermal printed receipt layout showing itemized food order, subtotal, tax, and card auth.',
      tags: ['receipt', 'food', 'dining', 'expense'],
      previewText: 'Campus Dining Commons\nOrder #4092\n2x Espresso - $8.00\n1x Panini - $9.50\nTotal: $17.50 PAID',
      folderPath: 'Organized Files/Finance/Receipts',
      folderId: 'f-receipts',
      content: 'Receipt for Campus Dining Commons. Order #4092. Total $17.50 paid via Visa.'
    },
    {
      name: 'Campus_Dining_Hall_Receipt_Copy.jpg',
      originalName: 'Campus_Dining_Hall_Receipt_Copy.jpg',
      mimeType: 'image/jpeg',
      extension: '.jpg',
      size: 52400,
      category: 'Receipt',
      subcategory: 'Food Receipt',
      confidence: 0.94,
      suggestedFolder: 'Organized Files/Finance/Receipts',
      reasoning: 'Identical thermal printed receipt layout showing itemized food order.',
      tags: ['receipt', 'duplicate', 'expense'],
      previewText: 'Campus Dining Commons\nOrder #4092\n2x Espresso - $8.00\n1x Panini - $9.50\nTotal: $17.50 PAID',
      folderPath: 'Organized Files/Finance/Receipts',
      folderId: 'f-receipts',
      content: 'Receipt for Campus Dining Commons. Order #4092. Total $17.50 paid via Visa.' // Identical content -> identical SHA-256 for duplicate detection!
    },
    {
      name: 'System_Architecture_Diagram.png',
      originalName: 'System_Architecture_Diagram.png',
      mimeType: 'image/png',
      extension: '.png',
      size: 218900,
      category: 'Diagram',
      subcategory: 'Software Architecture',
      confidence: 0.97,
      suggestedFolder: 'Organized Files/Images/Screenshots',
      reasoning: 'Diagram showing microservice boundaries, API gateway, AI classification pipeline and storage layers.',
      tags: ['diagram', 'architecture', 'system-design', 'flowchart'],
      previewText: '[Visual Architectural Diagram: Client -> Express Gateway -> AI Classifier -> Storage & DB]',
      folderPath: 'Unorganized',
      folderId: null,
      content: 'Diagram illustrating Client, API gateway, classification worker, and filesystem storage.'
    },
    {
      name: 'CS_491_Final_Assignment_Submission.pdf',
      originalName: 'CS_491_Final_Assignment_Submission.pdf',
      mimeType: 'application/pdf',
      extension: '.pdf',
      size: 198000,
      category: 'Assignment',
      subcategory: 'Academic Coursework',
      confidence: 0.95,
      suggestedFolder: 'Organized Files/Documents',
      reasoning: 'College assignment header with course code CS-491, student ID, rubric problem solutions.',
      tags: ['assignment', 'college', 'coursework', 'cs491'],
      previewText: 'Course CS-491: Advanced Software Engineering\nAssignment 4: Distributed File System Consistency & Invalidation Algorithms',
      folderPath: 'Unorganized',
      folderId: null,
      content: 'CS-491 Assignment: Distributed File System Consistency algorithms and evaluation.'
    }
  ];

  return seedFilesData.map((item, idx) => {
    const fileId = `file-${idx + 1}`;
    const storagePath = path.join(UPLOADS_DIR, `${fileId}_${item.name}`);
    
    // Write sample file on disk so previews, download and export work immediately!
    try {
      if (!fs.existsSync(storagePath)) {
        fs.writeFileSync(storagePath, item.content, 'utf8');
      }
    } catch {
      // ignore
    }

    const hash = crypto.createHash('sha256').update(item.content).digest('hex');

    return {
      id: fileId,
      name: item.name,
      originalName: item.originalName,
      mimeType: item.mimeType,
      extension: item.extension,
      size: item.size,
      hash,
      storagePath,
      folderId: item.folderId,
      folderPath: item.folderPath,
      category: item.category,
      subcategory: item.subcategory,
      confidence: item.confidence,
      suggestedFolder: item.suggestedFolder,
      reasoning: item.reasoning,
      tags: item.tags,
      language: 'English',
      isDuplicate: false, // will be evaluated by hash scanner
      duplicateGroupId: undefined,
      previewText: item.previewText,
      createdAt: new Date(Date.now() - (idx * 3600000 * 5)).toISOString(),
      updatedAt: new Date(Date.now() - (idx * 3600000 * 2)).toISOString()
    };
  });
}

function getInitialState(): DatabaseState {
  const seedFiles = createSeedFiles();
  
  // Mark duplicates
  const hashGroups = new Map<string, string[]>();
  seedFiles.forEach(f => {
    const list = hashGroups.get(f.hash) || [];
    list.push(f.id);
    hashGroups.set(f.hash, list);
  });

  hashGroups.forEach((ids, hash) => {
    if (ids.length > 1) {
      seedFiles.forEach(f => {
        if (ids.includes(f.id)) {
          f.isDuplicate = true;
          f.duplicateGroupId = hash;
        }
      });
    }
  });

  const aiResults: AIResult[] = seedFiles.map(f => ({
    id: `ai-${f.id}`,
    fileId: f.id,
    category: f.category,
    subcategory: f.subcategory,
    confidence: f.confidence,
    suggestedFolder: f.suggestedFolder || 'Organized Files/Documents',
    reasoning: f.reasoning || 'Automated analysis',
    tags: f.tags,
    language: f.language || 'English',
    modelUsed: 'gemini-3.8-flash',
    createdAt: f.createdAt
  }));

  const initialActivities: ActivityHistory[] = [
    { id: 'act-1', type: 'upload', action: 'Uploaded 7 files', details: 'Initial repository ingest with SHA-256 validation', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 'act-2', type: 'classify', action: 'AI Classified 7 files', details: 'High-confidence categorization using Gemini Flash', timestamp: new Date(Date.now() - 72000000).toISOString() },
    { id: 'act-3', type: 'duplicate_scan', action: 'Duplicate Detected', details: 'Identified matching SHA-256 for Campus Dining Hall Receipt', timestamp: new Date(Date.now() - 60000000).toISOString() },
    { id: 'act-4', type: 'organize', action: 'Organized 5 files', details: 'Moved matching documents into Finance and Resumes folders', timestamp: new Date(Date.now() - 36000000).toISOString() }
  ];

  return {
    users: [
      {
        id: 'u-1',
        name: 'Siddhartha Jakku',
        email: 'siddhartha.jakku04@gmail.com',
        role: 'Student / Lead Engineer',
        createdAt: new Date().toISOString()
      }
    ],
    folders: initialFolders,
    files: seedFiles,
    aiResults,
    customRules: initialRules,
    operations: [
      {
        id: 'op-init',
        operationType: 'ai_category',
        status: 'applied',
        filesMovedCount: 4,
        description: 'Auto-organized verified finance and resume documents',
        timestamp: new Date(Date.now() - 36000000).toISOString(),
        items: []
      }
    ],
    activities: initialActivities,
    settings: defaultSettings
  };
}

class Database {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading db.json, creating initial state', e);
    }
    const init = getInitialState();
    this.persist(init);
    return init;
  }

  private persist(data: DatabaseState) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write db.json', err);
    }
  }

  private save() {
    this.persist(this.state);
  }

  // --- Files ---
  getFiles(options?: { folderId?: string | null; category?: string; query?: string; duplicatesOnly?: boolean }): FileRecord[] {
    let result = [...this.state.files];
    if (options?.folderId !== undefined) {
      result = result.filter(f => f.folderId === options.folderId);
    }
    if (options?.category) {
      result = result.filter(f => f.category.toLowerCase() === options.category!.toLowerCase());
    }
    if (options?.duplicatesOnly) {
      result = result.filter(f => f.isDuplicate);
    }
    if (options?.query) {
      const q = options.query.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.tags.some(t => t.toLowerCase().includes(q)) ||
        (f.previewText && f.previewText.toLowerCase().includes(q))
      );
    }
    return result;
  }

  getFileById(id: string): FileRecord | undefined {
    return this.state.files.find(f => f.id === id);
  }

  addFile(file: FileRecord): FileRecord {
    // Check duplicates by hash
    const matching = this.state.files.filter(f => f.hash === file.hash);
    if (matching.length > 0) {
      file.isDuplicate = true;
      file.duplicateGroupId = file.hash;
      matching.forEach(m => {
        m.isDuplicate = true;
        m.duplicateGroupId = file.hash;
      });
      this.addActivity({
        action: 'Duplicate File Detected',
        details: `"${file.name}" has identical SHA-256 hash as "${matching[0].name}"`,
        type: 'duplicate_scan',
        fileId: file.id
      });
    }

    this.state.files.unshift(file);
    this.addActivity({
      action: 'File Uploaded',
      details: `Uploaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`,
      type: 'upload',
      fileId: file.id
    });
    this.save();
    return file;
  }

  updateFile(id: string, updates: Partial<FileRecord>): FileRecord | null {
    const idx = this.state.files.findIndex(f => f.id === id);
    if (idx === -1) return null;
    this.state.files[idx] = { ...this.state.files[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.state.files[idx];
  }

  deleteFile(id: string): boolean {
    const file = this.getFileById(id);
    if (!file) return false;

    // Remove file on disk if exists
    try {
      if (file.storagePath && fs.existsSync(file.storagePath)) {
        fs.unlinkSync(file.storagePath);
      }
    } catch (e) {
      console.warn('Could not remove file on disk:', e);
    }

    this.state.files = this.state.files.filter(f => f.id !== id);
    this.state.aiResults = this.state.aiResults.filter(a => a.fileId !== id);

    // Recompute duplicate flags for remaining files
    const remainingWithHash = this.state.files.filter(f => f.hash === file.hash);
    if (remainingWithHash.length <= 1) {
      remainingWithHash.forEach(r => {
        r.isDuplicate = false;
        r.duplicateGroupId = undefined;
      });
    }

    this.addActivity({
      action: 'File Deleted',
      details: `Deleted "${file.name}"`,
      type: 'delete'
    });
    this.save();
    return true;
  }

  // --- Folders ---
  getFolders(): Folder[] {
    return this.state.folders;
  }

  getFolderById(id: string): Folder | undefined {
    return this.state.folders.find(f => f.id === id);
  }

  getFolderByPath(folderPath: string): Folder | undefined {
    return this.state.folders.find(f => f.path.toLowerCase() === folderPath.toLowerCase());
  }

  createFolder(name: string, parentId: string | null = null, color?: string): Folder {
    let fullPath = name;
    if (parentId) {
      const parent = this.getFolderById(parentId);
      if (parent) {
        fullPath = `${parent.path}/${name}`;
      }
    } else {
      fullPath = `Organized Files/${name}`;
    }

    // Check if already exists
    const existing = this.state.folders.find(f => f.path.toLowerCase() === fullPath.toLowerCase());
    if (existing) return existing;

    const newFolder: Folder = {
      id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      path: fullPath,
      parentId,
      color: color || '#6366F1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.folders.push(newFolder);
    this.save();
    return newFolder;
  }

  renameFolder(id: string, newName: string): Folder | null {
    const folder = this.getFolderById(id);
    if (!folder) return null;
    const oldPath = folder.path;
    folder.name = newName;
    const parts = oldPath.split('/');
    parts[parts.length - 1] = newName;
    folder.path = parts.join('/');
    folder.updatedAt = new Date().toISOString();

    // Update child folders
    this.state.folders.forEach(f => {
      if (f.path.startsWith(oldPath + '/')) {
        f.path = f.path.replace(oldPath, folder.path);
      }
    });

    // Update files in this folder
    this.state.files.forEach(f => {
      if (f.folderPath.startsWith(oldPath)) {
        f.folderPath = f.folderPath.replace(oldPath, folder.path);
      }
    });

    this.save();
    return folder;
  }

  deleteFolder(id: string): boolean {
    const folder = this.getFolderById(id);
    if (!folder) return false;

    // Move all files in this folder and its subfolders to unorganized
    this.state.files.forEach(f => {
      if (f.folderId === id || f.folderPath.startsWith(folder.path)) {
        f.folderId = null;
        f.folderPath = 'Unorganized';
      }
    });

    // Remove folder and subfolders
    this.state.folders = this.state.folders.filter(f => f.id !== id && !f.path.startsWith(folder.path + '/'));
    this.save();
    return true;
  }

  // --- Duplicate Detection ---
  getDuplicates(): { hash: string; size: number; files: FileRecord[] }[] {
    const groups = new Map<string, FileRecord[]>();
    for (const file of this.state.files) {
      const list = groups.get(file.hash) || [];
      list.push(file);
      groups.set(file.hash, list);
    }

    const duplicates: { hash: string; size: number; files: FileRecord[] }[] = [];
    groups.forEach((files, hash) => {
      if (files.length > 1) {
        duplicates.push({
          hash,
          size: files[0].size,
          files
        });
      }
    });

    return duplicates;
  }

  // --- AI Results ---
  saveAIResult(result: AIResult) {
    this.state.aiResults = this.state.aiResults.filter(r => r.fileId !== result.fileId);
    this.state.aiResults.push(result);
    this.save();
  }

  getAIResultByFileId(fileId: string): AIResult | undefined {
    return this.state.aiResults.find(r => r.fileId === fileId);
  }

  // --- Operations & Undo ---
  recordOperation(op: OrganizationOperation): OrganizationOperation {
    this.state.operations.unshift(op);
    this.addActivity({
      action: 'Organized Files',
      details: op.description,
      type: 'organize'
    });
    this.save();
    return op;
  }

  getOperations(): OrganizationOperation[] {
    return this.state.operations;
  }

  getOperationById(id: string): OrganizationOperation | undefined {
    return this.state.operations.find(o => o.id === id);
  }

  undoOperation(operationId: string): { success: boolean; message: string; revertedCount: number } {
    const op = this.getOperationById(operationId);
    if (!op) {
      return { success: false, message: 'Operation not found', revertedCount: 0 };
    }
    if (op.status === 'reverted') {
      return { success: false, message: 'Operation has already been undone', revertedCount: 0 };
    }

    let revertedCount = 0;
    for (const item of op.items) {
      const file = this.getFileById(item.fileId);
      if (file) {
        file.folderId = item.originalFolderId;
        file.folderPath = item.originalFolderPath;
        item.reverted = true;
        revertedCount++;
      }
    }

    op.status = 'reverted';
    this.addActivity({
      action: 'Undid File Organization',
      details: `Reverted ${revertedCount} files back to original locations from operation "${op.description}"`,
      type: 'undo'
    });
    this.save();
    return { success: true, message: `Successfully reverted ${revertedCount} files`, revertedCount };
  }

  // --- Custom Rules ---
  getRules(): CustomRule[] {
    return [...this.state.customRules].sort((a, b) => a.priority - b.priority);
  }

  addRule(rule: Omit<CustomRule, 'id' | 'createdAt'>): CustomRule {
    const newRule: CustomRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.state.customRules.push(newRule);
    this.addActivity({
      action: 'Created Custom Rule',
      details: `Created rule "${newRule.name}" routing to ${newRule.destinationFolder}`,
      type: 'settings'
    });
    this.save();
    return newRule;
  }

  updateRule(id: string, updates: Partial<CustomRule>): CustomRule | null {
    const idx = this.state.customRules.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.state.customRules[idx] = { ...this.state.customRules[idx], ...updates };
    this.save();
    return this.state.customRules[idx];
  }

  deleteRule(id: string): boolean {
    const initialLen = this.state.customRules.length;
    this.state.customRules = this.state.customRules.filter(r => r.id !== id);
    if (this.state.customRules.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Activities ---
  getActivities(limit: number = 30): ActivityHistory[] {
    return this.state.activities.slice(0, limit);
  }

  addActivity(act: Omit<ActivityHistory, 'id' | 'timestamp'>) {
    const newAct: ActivityHistory = {
      ...act,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    this.state.activities.unshift(newAct);
    if (this.state.activities.length > 200) {
      this.state.activities.pop();
    }
  }

  // --- Settings ---
  getSettings(): UserSettings {
    return this.state.settings;
  }

  updateSettings(updates: Partial<UserSettings>): UserSettings {
    this.state.settings = { ...this.state.settings, ...updates };
    this.addActivity({
      action: 'Settings Updated',
      details: 'User configuration updated',
      type: 'settings'
    });
    this.save();
    return this.state.settings;
  }

  // --- Analytics ---
  getAnalytics() {
    const files = this.state.files;
    const totalFiles = files.length;
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    const classifiedFiles = files.filter(f => f.category && f.category !== 'Other' && f.category !== 'Unknown').length;
    const duplicates = this.getDuplicates();
    const duplicateFilesCount = duplicates.reduce((acc, d) => acc + d.files.length - 1, 0);

    // Extension breakdown
    const extCount: Record<string, number> = {};
    files.forEach(f => {
      const ext = f.extension.toLowerCase() || 'unknown';
      extCount[ext] = (extCount[ext] || 0) + 1;
    });

    const fileTypeDistribution = Object.entries(extCount).map(([name, count]) => ({
      name: name.toUpperCase().replace('.', ''),
      count,
      percentage: totalFiles > 0 ? Math.round((count / totalFiles) * 100) : 0
    }));

    // Category breakdown
    const catCount: Record<string, number> = {};
    files.forEach(f => {
      const cat = f.category || 'Unclassified';
      catCount[cat] = (catCount[cat] || 0) + 1;
    });

    const categoryDistribution = Object.entries(catCount).map(([category, count]) => ({
      category,
      count
    })).sort((a, b) => b.count - a.count);

    // Monthly uploads
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = new Map<string, number>();

    // Seed past 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyMap.set(key, 0);
    }

    files.forEach(f => {
      const d = new Date(f.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (monthlyMap.has(key)) {
        monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
      }
    });

    const monthlyActivity = Array.from(monthlyMap.entries()).map(([month, uploads]) => ({
      month,
      uploads
    }));

    // Confidence
    const confidences = files.map(f => f.confidence).filter(c => typeof c === 'number' && c > 0);
    const avgConfidence = confidences.length > 0 ? (confidences.reduce((a, b) => a + b, 0) / confidences.length) : 0;

    return {
      totalFiles,
      totalStorageBytes: totalSize,
      totalStorageFormatted: (totalSize / (1024 * 1024)).toFixed(2) + ' MB',
      classifiedFiles,
      classificationRate: totalFiles > 0 ? Math.round((classifiedFiles / totalFiles) * 100) : 0,
      duplicateCount: duplicateFilesCount,
      categoriesCount: Object.keys(catCount).length,
      averageConfidence: Math.round(avgConfidence * 100) / 100,
      fileTypeDistribution,
      categoryDistribution,
      monthlyActivity
    };
  }

  // Reset/reseed for demo
  reseed() {
    this.state = getInitialState();
    this.save();
    return true;
  }
}

export const db = new Database();
