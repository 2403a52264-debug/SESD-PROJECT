import { db } from './db.ts';
import { FileRecord, Folder, OrganizationOperation, OrganizationItem, CustomRule } from './types.ts';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

export interface ProposedMovement {
  fileId: string;
  fileName: string;
  currentFolderPath: string;
  targetFolderPath: string;
  ruleMatched?: string;
  category: string;
}

export class OrganizationService {
  /**
   * Determine target folder for a file based on organization strategy
   */
  public determineTargetFolder(
    file: FileRecord,
    strategy: 'ai_category' | 'extension' | 'date' | 'size' | 'custom_rules',
    rules: CustomRule[]
  ): { targetPath: string; ruleMatched?: string } {
    // 1. Check custom rules first if enabled or if strategy is custom_rules
    const sortedRules = [...rules].filter(r => r.enabled).sort((a, b) => a.priority - b.priority);

    if (strategy === 'custom_rules' || sortedRules.length > 0) {
      for (const rule of sortedRules) {
        let matches = false;
        const fn = file.name.toLowerCase();
        const ext = file.extension.toLowerCase();
        const cat = (file.category || '').toLowerCase();
        const val = rule.conditionValue.toLowerCase().trim();

        if (rule.conditionField === 'filename') {
          if (rule.conditionOperator === 'contains' && fn.includes(val)) matches = true;
          if (rule.conditionOperator === 'equals' && fn === val) matches = true;
          if (rule.conditionOperator === 'ends_with' && fn.endsWith(val)) matches = true;
        } else if (rule.conditionField === 'extension') {
          const cleanExt = val.startsWith('.') ? val : `.${val}`;
          if (ext === cleanExt) matches = true;
        } else if (rule.conditionField === 'category') {
          if (cat === val || cat.includes(val)) matches = true;
        } else if (rule.conditionField === 'size') {
          const thresholdBytes = parseFloat(val) * 1024 * 1024; // MB
          if (rule.conditionOperator === 'greater_than' && file.size > thresholdBytes) matches = true;
        }

        if (matches) {
          return { targetPath: rule.destinationFolder, ruleMatched: rule.name };
        }
      }
    }

    if (strategy === 'custom_rules') {
      // If none matched, keep in Documents or Current
      return { targetPath: file.suggestedFolder || 'Organized Files/Documents', ruleMatched: 'Default Fallback' };
    }

    // 2. AI Category strategy
    if (strategy === 'ai_category') {
      if (file.suggestedFolder) {
        return { targetPath: file.suggestedFolder, ruleMatched: 'AI Classification' };
      }
      const cat = file.category || 'Documents';
      return { targetPath: `Organized Files/${cat}`, ruleMatched: 'Category Mapping' };
    }

    // 3. Extension strategy
    if (strategy === 'extension') {
      const extName = file.extension.replace('.', '').toUpperCase() || 'OTHER';
      return { targetPath: `Organized Files/By Extension/${extName}`, ruleMatched: `Extension .${extName}` };
    }

    // 4. Date strategy (Year/Month)
    if (strategy === 'date') {
      const d = new Date(file.createdAt);
      const year = d.getFullYear();
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const month = monthNames[d.getMonth()];
      return { targetPath: `Organized Files/${year}/${month}`, ruleMatched: `${month} ${year}` };
    }

    // 5. Size strategy
    if (strategy === 'size') {
      const mb = file.size / (1024 * 1024);
      if (mb < 1) {
        return { targetPath: 'Organized Files/By Size/Small (< 1MB)', ruleMatched: 'Small File' };
      } else if (mb <= 10) {
        return { targetPath: 'Organized Files/By Size/Medium (1MB - 10MB)', ruleMatched: 'Medium File' };
      } else {
        return { targetPath: 'Organized Files/By Size/Large (> 10MB)', ruleMatched: 'Large File' };
      }
    }

    return { targetPath: 'Organized Files/Documents' };
  }

  /**
   * Preview proposed file movements before applying
   */
  public previewOrganization(
    strategy: 'ai_category' | 'extension' | 'date' | 'size' | 'custom_rules',
    fileIds?: string[]
  ): ProposedMovement[] {
    const allFiles = db.getFiles();
    const targetFiles = fileIds && fileIds.length > 0 ? allFiles.filter(f => fileIds.includes(f.id)) : allFiles;
    const rules = db.getRules();

    const movements: ProposedMovement[] = [];

    for (const file of targetFiles) {
      const { targetPath, ruleMatched } = this.determineTargetFolder(file, strategy, rules);
      const current = file.folderPath || 'Unorganized';

      // Propose if different from current
      if (current.toLowerCase() !== targetPath.toLowerCase()) {
        movements.push({
          fileId: file.id,
          fileName: file.name,
          currentFolderPath: current,
          targetFolderPath: targetPath,
          ruleMatched,
          category: file.category
        });
      }
    }

    return movements;
  }

  /**
   * Apply organization operation with rollback history
   */
  public applyOrganization(
    strategy: 'ai_category' | 'extension' | 'date' | 'size' | 'custom_rules',
    fileIds?: string[]
  ): OrganizationOperation {
    const previews = this.previewOrganization(strategy, fileIds);
    const opId = `op-${Date.now()}`;
    const items: OrganizationItem[] = [];

    for (const move of previews) {
      const file = db.getFileById(move.fileId);
      if (!file) continue;

      // Ensure target folder exists in DB
      let folder = db.getFolderByPath(move.targetFolderPath);
      if (!folder) {
        // create parent hierarchy if needed
        const parts = move.targetFolderPath.split('/');
        const folderName = parts[parts.length - 1];
        folder = db.createFolder(folderName, null);
        folder.path = move.targetFolderPath;
      }

      const originalFolderId = file.folderId;
      const originalFolderPath = file.folderPath || 'Unorganized';

      // Update file location
      db.updateFile(file.id, {
        folderId: folder.id,
        folderPath: move.targetFolderPath
      });

      items.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        operationId: opId,
        fileId: file.id,
        fileName: file.name,
        originalFolderId,
        newFolderId: folder.id,
        originalFolderPath,
        newFolderPath: move.targetFolderPath,
        reverted: false
      });
    }

    const strategyLabels: Record<string, string> = {
      ai_category: 'AI Category Organization',
      extension: 'File Extension Grouping',
      date: 'Timeline Date Hierarchy',
      size: 'File Size Thresholds',
      custom_rules: 'Custom Priority Rules'
    };

    const operation: OrganizationOperation = {
      id: opId,
      operationType: strategy,
      status: 'applied',
      filesMovedCount: items.length,
      description: `${strategyLabels[strategy] || 'Organization'} applied to ${items.length} files`,
      timestamp: new Date().toISOString(),
      items
    };

    return db.recordOperation(operation);
  }

  /**
   * Export organized files as structured ZIP preserving folder hierarchy
   */
  public async exportAsZip(options: {
    folderId?: string;
    category?: string;
    all?: boolean;
  }): Promise<{ zipBuffer: Buffer; filename: string }> {
    const zip = new JSZip();
    let files = db.getFiles();

    let exportName = 'organized_files';

    if (options.folderId) {
      const folder = db.getFolderById(options.folderId);
      if (folder) {
        exportName = `${folder.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_export`;
        files = files.filter(f => f.folderId === folder.id || f.folderPath.startsWith(folder.path));
      }
    } else if (options.category) {
      exportName = `${options.category.toLowerCase()}_documents_export`;
      files = files.filter(f => f.category.toLowerCase() === options.category!.toLowerCase());
    }

    for (const file of files) {
      let fileContent: Buffer;
      if (file.storagePath && fs.existsSync(file.storagePath)) {
        fileContent = fs.readFileSync(file.storagePath);
      } else {
        fileContent = Buffer.from(file.previewText || `Placeholder content for ${file.name}`);
      }

      // Preserve relative path
      const folderPath = file.folderPath && file.folderPath !== 'Unorganized'
        ? file.folderPath.replace(/^Organized Files\/?/, '')
        : 'Unorganized';

      const zipEntryPath = folderPath ? `${folderPath}/${file.name}` : file.name;
      zip.file(zipEntryPath, fileContent);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    return {
      zipBuffer,
      filename: `${exportName}_${new Date().toISOString().slice(0, 10)}.zip`
    };
  }
}

export const organizationService = new OrganizationService();
