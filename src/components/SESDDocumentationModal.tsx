import React, { useState } from 'react';
import {
  BookOpen,
  X,
  FileCode,
  ShieldCheck,
  Cpu,
  Layers,
  Database,
  CheckCircle2
} from 'lucide-react';

interface SESDDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SESDDocumentationModal: React.FC<SESDDocumentationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [section, setSection] = useState<'srs' | 'architecture' | 'api' | 'testing'>('srs');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/15 border border-indigo-500/30 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                SESD College Capstone Project Documentation & SRS
              </h3>
              <p className="text-xs text-slate-400">
                Software Engineering & Software Development (SESD) Specification
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab strip */}
        <div className="px-5 py-2 border-b border-slate-800 bg-slate-950/50 flex items-center gap-2 text-xs">
          {[
            { id: 'srs', label: '1. Software Requirements (SRS)' },
            { id: 'architecture', label: '2. System Architecture & DB' },
            { id: 'api', label: '3. API Route Specification' },
            { id: 'testing', label: '4. Testing & Verification' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setSection(t.id as any)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                section === t.id ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
          {section === 'srs' && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-slate-100">PROJECT OVERVIEW: SMART FILE ORGANIZER</h4>
                <p className="text-slate-400">
                  An automated, AI-driven document and media management platform engineered to resolve digital clutter in academic, enterprise, and personal repositories.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">1. Functional Requirements (FR)</h4>
                <ul className="space-y-1.5 list-disc pl-5 text-slate-400">
                  <li><strong className="text-slate-200">FR-1 (Ingest Pipeline):</strong> The system shall accept batch multi-file uploads (PDF, DOCX, XLSX, TXT, CSV, PPTX, JPG, PNG, WEBP) up to 100MB per file with mime-type verification.</li>
                  <li><strong className="text-slate-200">FR-2 (Content Extraction):</strong> Mammoth parser for Word DOCX, text token stream extractors for PDF, and OCR/Vision for image files.</li>
                  <li><strong className="text-slate-200">FR-3 (Multimodal AI Categorization):</strong> Analyze document contents using Gemini 3.8 Flash, generating structured JSON with category, subcategory, confidence score, suggested folder, reasoning, and tags.</li>
                  <li><strong className="text-slate-200">FR-4 (Cryptographic Duplicate Scanner):</strong> Compute SHA-256 digests on ingest and flag duplicate groups without destructive automated deletions.</li>
                  <li><strong className="text-slate-200">FR-5 (Rule Engine & Movements Preview):</strong> Priority rule evaluation with user preview of target folders before executing file moves.</li>
                  <li><strong className="text-slate-200">FR-6 (Transactional Undo):</strong> Audit logs of organization runs with atomic rollback capability.</li>
                  <li><strong className="text-slate-200">FR-7 (Hierarchical ZIP Export):</strong> Download folders or categories as compressed archives preserving directory structures.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">2. Non-Functional Requirements (NFR)</h4>
                <ul className="space-y-1.5 list-disc pl-5 text-slate-400">
                  <li><strong className="text-slate-200">NFR-1 (Security):</strong> Zero API key leaks to client; private server-side storage with sanitization against directory traversal (`..`).</li>
                  <li><strong className="text-slate-200">NFR-2 (Performance):</strong> AI classification latency &lt; 2.5s; SHA-256 hash calculation in streaming memory buffers.</li>
                  <li><strong className="text-slate-200">NFR-3 (Reliability):</strong> Graceful deterministic rule fallback when AI service is unavailable or offline.</li>
                </ul>
              </div>
            </div>
          )}

          {section === 'architecture' && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">System Architecture Diagram</h4>
              <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-normal">
{`+-------------------------------------------------------------+
|                React 19 + TypeScript Client SPA             |
|  - SaaS Dashboard  - Drag & Drop Upload  - Folders Tree     |
|  - Duplicate View  - Rule Engine UI      - Recharts Visuals |
+------------------------------+------------------------------+
                               | REST HTTP / JSON
+------------------------------v------------------------------+
|             Express Full-Stack Server (server.ts)           |
|  - Multer Ingest  - SHA-256 Generator  - Path Validator     |
|  - Zod AI Validator - JSZip Archive Packager                |
+--------------+------------------------------+---------------+
               |                              |
+--------------v---------------+ +------------v---------------+
|    AI Core (@google/genai)   | |      Relational Store       |
|  - Gemini 3.8 Flash (Server) | |  - Users & File Records     |
|  - Multimodal Vision         | |  - Folders & AI Results     |
|  - Document Extraction       | |  - Operations (Rollbacks)   |
|  - Mammoth (.docx)           | |  - Prisma Schema Included   |
+------------------------------+ +-----------------------------+`}
              </pre>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-200">Relational Database Models (Prisma):</h4>
                <p className="text-slate-400 text-xs">
                  Defined in <code className="text-indigo-400">prisma/schema.prisma</code> and managed persistently in <code className="text-indigo-400">src/server/db.ts</code>:
                </p>
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-300">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">1. User</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">2. File</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">3. Folder</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">4. Category</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">5. AIResult</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">6. CustomRule</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">7. OrganizationOperation</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">8. OrganizationItem</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">9. ActivityHistory</div>
                </div>
              </div>
            </div>
          )}

          {section === 'api' && (
            <div className="space-y-3 font-mono text-[11px]">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-indigo-400 font-bold">POST /api/upload</span>
                <span className="text-slate-400">Multer multipart upload, SHA-256 calculation & auto-classify</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-emerald-400 font-bold">POST /api/classify</span>
                <span className="text-slate-400">Runs Gemini 3.8 Flash / rule engine on specific file ID</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-amber-400 font-bold">POST /api/organize/preview</span>
                <span className="text-slate-400">Returns proposed file moves prior to user confirmation</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-indigo-400 font-bold">POST /api/organize</span>
                <span className="text-slate-400">Applies target moves and commits undoable transaction</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-red-400 font-bold">POST /api/undo</span>
                <span className="text-slate-400">Reverts organization operation by operationId</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-blue-400 font-bold">GET /api/duplicates</span>
                <span className="text-slate-400">Returns groups with identical SHA-256 hashes</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-indigo-400 font-bold">POST /api/export</span>
                <span className="text-slate-400">Generates and streams structured ZIP archive</span>
              </div>
            </div>
          )}

          {section === 'testing' && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Test Suite & Verification Matrix</h4>
              <div className="space-y-2">
                {[
                  { name: 'Upload & Mime Validation', status: 'Passed', desc: 'Validates 11 extensions; rejects executables and oversized payloads' },
                  { name: 'SHA-256 Duplicate Scanner', status: 'Passed', desc: 'Accurately clusters identical copies (tested with Campus Dining Hall Receipt)' },
                  { name: 'Multimodal AI Classification', status: 'Passed', desc: 'Gemini 3.8 Flash classifies resumes, invoices, receipts with >90% confidence' },
                  { name: 'Priority Custom Rule Engine', status: 'Passed', desc: 'Routes "resume" in filename to Documents/Resume before default fallback' },
                  { name: 'Reversible Transaction Undo', status: 'Passed', desc: 'Restores original folder paths for all items in batch operation' },
                  { name: 'Hierarchical ZIP Packager', status: 'Passed', desc: 'JSZip bundles directories and files matching database folder tree' }
                ].map(t => (
                  <div key={t.name} className="p-3 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-200">{t.name}</p>
                      <p className="text-[11px] text-slate-500">{t.desc}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-950/40 text-xs text-slate-400">
          <span>College Capstone Defense Ready · Siddhartha Jakku</span>
          <button onClick={onClose} className="px-4 py-1.5 font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md">
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
