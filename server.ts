import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import dotenv from 'dotenv';
import { db, UPLOADS_DIR } from './src/server/db.ts';
import { classifyFileWithAI, extractTextContent } from './src/server/aiService.ts';
import { organizationService } from './src/server/organizationService.ts';
import { FileRecord } from './src/server/types.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uniqueSuffix}_${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});

// ================= API ROUTES =================

// 1. Upload Files
app.post('/api/upload', upload.array('files', 20), async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const settings = db.getSettings();
    const createdRecords: FileRecord[] = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();

      // Check ignored extensions
      if (settings.ignoredExtensions.includes(ext)) {
        try { fs.unlinkSync(file.path); } catch { /* ignore */ }
        continue;
      }

      // Calculate SHA-256
      const fileBuffer = fs.readFileSync(file.path);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Quick extract preview text
      const previewText = await extractTextContent(file.path, file.mimetype, ext);

      // Perform AI or rule classification
      const { result, modelUsed } = await classifyFileWithAI(
        file.path,
        file.originalname,
        file.mimetype,
        ext,
        file.size
      );

      const recordId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const fileRecord: FileRecord = {
        id: recordId,
        name: file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        extension: ext,
        size: file.size,
        hash,
        storagePath: file.path,
        folderId: null,
        folderPath: 'Unorganized',
        category: result.category,
        subcategory: result.subcategory,
        confidence: result.confidence,
        suggestedFolder: result.suggested_folder,
        reasoning: result.reasoning,
        tags: result.tags,
        language: result.language,
        isDuplicate: false,
        previewText: previewText.substring(0, 500),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const saved = db.addFile(fileRecord);

      db.saveAIResult({
        id: `ai-${recordId}`,
        fileId: recordId,
        category: result.category,
        subcategory: result.subcategory,
        confidence: result.confidence,
        suggestedFolder: result.suggested_folder,
        reasoning: result.reasoning,
        tags: result.tags,
        language: result.language,
        modelUsed,
        createdAt: new Date().toISOString()
      });

      // Auto organize if enabled in settings
      if (settings.autoOrganizeOnUpload) {
        organizationService.applyOrganization(settings.defaultOrganizeBy, [saved.id]);
      }

      createdRecords.push(saved);
    }

    res.status(201).json({
      success: true,
      count: createdRecords.length,
      files: createdRecords
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

// 2. Classify Specific File
app.post('/api/classify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      res.status(400).json({ error: 'fileId is required' });
      return;
    }

    const file = db.getFileById(fileId);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const { result, modelUsed } = await classifyFileWithAI(
      file.storagePath,
      file.name,
      file.mimeType,
      file.extension,
      file.size
    );

    const updated = db.updateFile(file.id, {
      category: result.category,
      subcategory: result.subcategory,
      confidence: result.confidence,
      suggestedFolder: result.suggested_folder,
      reasoning: result.reasoning,
      tags: result.tags,
      language: result.language
    });

    db.saveAIResult({
      id: `ai-${file.id}`,
      fileId: file.id,
      category: result.category,
      subcategory: result.subcategory,
      confidence: result.confidence,
      suggestedFolder: result.suggested_folder,
      reasoning: result.reasoning,
      tags: result.tags,
      language: result.language,
      modelUsed,
      createdAt: new Date().toISOString()
    });

    db.addActivity({
      action: 'AI Re-Classification',
      details: `Re-classified "${file.name}" as ${result.category} (${Math.round(result.confidence * 100)}%) using ${modelUsed}`,
      type: 'classify',
      fileId: file.id
    });

    res.json({ success: true, result, modelUsed, file: updated });
  } catch (err: any) {
    console.error('Classification error:', err);
    res.status(500).json({ error: err.message || 'Classification failed' });
  }
});

// 3. File Operations: Preview & Apply
app.post('/api/organize/preview', (req: Request, res: Response) => {
  const { strategy = 'ai_category', fileIds } = req.body;
  const previews = organizationService.previewOrganization(strategy, fileIds);
  res.json({ success: true, count: previews.length, previews });
});

app.post('/api/organize', (req: Request, res: Response) => {
  const { strategy = 'ai_category', fileIds } = req.body;
  const op = organizationService.applyOrganization(strategy, fileIds);
  res.json({ success: true, operation: op });
});

// 4. Files List
app.get('/api/files', (req: Request, res: Response) => {
  const { folderId, category, query, duplicatesOnly } = req.query;
  const files = db.getFiles({
    folderId: folderId ? String(folderId) : undefined,
    category: category ? String(category) : undefined,
    query: query ? String(query) : undefined,
    duplicatesOnly: duplicatesOnly === 'true'
  });
  res.json({ success: true, count: files.length, files });
});

// 5. Single File Details
app.get('/api/files/:id', (req: Request, res: Response): void => {
  const file = db.getFileById(req.params.id);
  if (!file) {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  const aiResult = db.getAIResultByFileId(file.id);
  res.json({ success: true, file, aiResult });
});

// 6. File Preview
app.get('/api/files/:id/preview', (req: Request, res: Response): void => {
  const file = db.getFileById(req.params.id);
  if (!file) {
    res.status(404).send('File not found');
    return;
  }

  if (file.storagePath && fs.existsSync(file.storagePath)) {
    // Send file with correct content type
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
    fs.createReadStream(file.storagePath).pipe(res);
  } else {
    // Fallback text preview
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(file.previewText || `Content preview for ${file.name}`);
  }
});

// 7. File Download
app.get('/api/files/:id/download', (req: Request, res: Response): void => {
  const file = db.getFileById(req.params.id);
  if (!file) {
    res.status(404).send('File not found');
    return;
  }

  if (file.storagePath && fs.existsSync(file.storagePath)) {
    res.download(file.storagePath, file.name);
  } else {
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(Buffer.from(file.previewText || `Sample file content for ${file.name}`));
  }
});

// 8. Delete File
app.delete('/api/files/:id', (req: Request, res: Response): void => {
  const success = db.deleteFile(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'File not found or already deleted' });
    return;
  }
  res.json({ success: true, message: 'File deleted' });
});

// 9. Folders
app.get('/api/folders', (_req: Request, res: Response) => {
  res.json({ success: true, folders: db.getFolders() });
});

app.post('/api/folders', (req: Request, res: Response): void => {
  const { name, parentId, color } = req.body;
  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'Folder name is required' });
    return;
  }
  const folder = db.createFolder(name.trim(), parentId || null, color);
  res.status(201).json({ success: true, folder });
});

app.put('/api/folders/:id', (req: Request, res: Response): void => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'New folder name is required' });
    return;
  }
  const updated = db.renameFolder(req.params.id, name.trim());
  if (!updated) {
    res.status(404).json({ error: 'Folder not found' });
    return;
  }
  res.json({ success: true, folder: updated });
});

app.delete('/api/folders/:id', (req: Request, res: Response): void => {
  const success = db.deleteFolder(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Folder not found' });
    return;
  }
  res.json({ success: true, message: 'Folder deleted' });
});

// 10. Duplicates Detection
app.get('/api/duplicates', (_req: Request, res: Response) => {
  const duplicates = db.getDuplicates();
  res.json({ success: true, count: duplicates.length, duplicates });
});

// 11. Undo Operation
app.post('/api/undo', (req: Request, res: Response): void => {
  const { operationId } = req.body;
  if (!operationId) {
    res.status(400).json({ error: 'operationId is required' });
    return;
  }
  const result = db.undoOperation(operationId);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }
  res.json(result);
});

// 12. Analytics
app.get('/api/analytics', (_req: Request, res: Response) => {
  const analytics = db.getAnalytics();
  res.json({ success: true, analytics });
});

// 13. ZIP Export (Organized files)
app.post('/api/export', async (req: Request, res: Response): Promise<void> => {
  try {
    const { folderId, category, all = true } = req.body;
    const { zipBuffer, filename } = await organizationService.exportAsZip({ folderId, category, all });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(zipBuffer);
  } catch (err: any) {
    console.error('Export error:', err);
    res.status(500).json({ error: err.message || 'Export failed' });
  }
});

// 13b. Full Project Source Code ZIP Download (For College Submission)
app.get('/api/project-zip', async (_req: Request, res: Response): Promise<void> => {
  try {
    const zipPath = path.resolve(process.cwd(), 'smart-file-organizer-project.zip');
    if (fs.existsSync(zipPath)) {
      res.download(zipPath, 'smart-file-organizer-college-project.zip');
      return;
    }

    // Generate on the fly
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const rootDir = process.cwd();
    const ignoreDirs = ['node_modules', '.git', 'dist', '.data', 'uploads', '.aistudio', '.cache'];
    const ignoreFiles = ['.DS_Store', 'bun.lock'];

    function addDir(currentDir: string, zipFolder: any) {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (ignoreDirs.includes(entry.name)) continue;
          const sub = zipFolder.folder(entry.name);
          if (sub) addDir(path.join(currentDir, entry.name), sub);
        } else {
          if (ignoreFiles.includes(entry.name) || entry.name.endsWith('.tmp') || entry.name.endsWith('.zip')) continue;
          const content = fs.readFileSync(path.join(currentDir, entry.name));
          zipFolder.file(entry.name, content);
        }
      }
    }

    addDir(rootDir, zip);
    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    fs.writeFileSync(zipPath, buffer);
    res.download(zipPath, 'smart-file-organizer-college-project.zip');
  } catch (err: any) {
    console.error('Project zip error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate project ZIP' });
  }
});

// 14. Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({ success: true, settings: db.getSettings() });
});

app.put('/api/settings', (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

// 15. Custom Rules
app.get('/api/rules', (_req: Request, res: Response) => {
  res.json({ success: true, rules: db.getRules() });
});

app.post('/api/rules', (req: Request, res: Response): void => {
  const { name, conditionField, conditionOperator, conditionValue, destinationFolder, priority = 1, enabled = true } = req.body;
  if (!name || !conditionField || !conditionValue || !destinationFolder) {
    res.status(400).json({ error: 'Missing required rule fields' });
    return;
  }
  const rule = db.addRule({
    name,
    conditionField,
    conditionOperator: conditionOperator || 'contains',
    conditionValue,
    destinationFolder,
    priority: Number(priority),
    enabled: Boolean(enabled)
  });
  res.status(201).json({ success: true, rule });
});

app.put('/api/rules/:id', (req: Request, res: Response): void => {
  const updated = db.updateRule(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Rule not found' });
    return;
  }
  res.json({ success: true, rule: updated });
});

app.delete('/api/rules/:id', (req: Request, res: Response): void => {
  const success = db.deleteRule(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Rule not found' });
    return;
  }
  res.json({ success: true, message: 'Rule deleted' });
});

// 16. Activity History & Operations History
app.get('/api/activities', (_req: Request, res: Response) => {
  res.json({ success: true, activities: db.getActivities(50) });
});

app.get('/api/operations', (_req: Request, res: Response) => {
  res.json({ success: true, operations: db.getOperations() });
});

// 17. Debug & System Health
app.get('/api/debug/health', (_req: Request, res: Response) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const settings = db.getSettings();
  const files = db.getFiles();

  res.json({
    success: true,
    system: {
      status: 'operational',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      uptimeSeconds: Math.round(process.uptime()),
      database: {
        status: 'connected',
        fileCount: files.length,
        folderCount: db.getFolders().length,
        rulesCount: db.getRules().length
      },
      aiEngine: {
        configured: hasGeminiKey,
        provider: settings.aiProvider,
        activeModel: settings.geminiModel,
        fallbackModeAvailable: true
      },
      storage: {
        uploadsDirectory: UPLOADS_DIR,
        uploadsWritable: fs.existsSync(UPLOADS_DIR)
      }
    }
  });
});

app.post('/api/debug/test-ai', async (req: Request, res: Response): Promise<void> => {
  const sampleText = req.body.text || 'Invoice #99401 for Software Consulting. Due: 15 Nov 2026. Total Amount: $1,250.00';
  const dummyFile = path.join(UPLOADS_DIR, 'test_sample.txt');
  fs.writeFileSync(dummyFile, sampleText, 'utf8');

  try {
    const start = Date.now();
    const { result, modelUsed } = await classifyFileWithAI(dummyFile, 'Consulting_Invoice.txt', 'text/plain', '.txt', sampleText.length);
    const latencyMs = Date.now() - start;

    res.json({
      success: true,
      latencyMs,
      modelUsed,
      result
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    try { fs.unlinkSync(dummyFile); } catch { /* ignore */ }
  }
});

// Reseed demo data
app.post('/api/seed', (_req: Request, res: Response) => {
  db.reseed();
  res.json({ success: true, message: 'Database reset and re-seeded with realistic SESD sample files' });
});

// Start Express and mount Vite
async function startServer() {
  if (!isProd && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Smart File Organizer server running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
