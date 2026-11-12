# SMART FILE ORGANIZER – AI-Powered Intelligent File Management System

> **College Capstone Project**: Software Engineering and Software Development (SESD)  
> **Student Lead**: Siddhartha Jakku  
> **Architecture**: Full-Stack React 19 + TypeScript + Node.js Express + Gemini 3.8 Flash AI Engine + Recharts + Mammoth + JSZip

---

## 1. Project Introduction & Problem Statement

Digital workspaces frequently become cluttered with unorganized documents, mixed invoices, duplicate downloads, screenshots, and coursework assignments. Manual triage is tedious, error-prone, and time-consuming.

**Smart File Organizer** is an intelligent, multi-modal file intake and organization system. It ingests batch files, extracts deep content (via Mammoth for Word, text parsers for PDFs, and vision for images), executes server-side AI classification using Google's **Gemini 3.8 Flash**, detects identical copies via **SHA-256 cryptographic hashing**, provides interactive **pre-movement previews with rollback safety (Undo)**, and packages structured archives via **JSZip**.

---

## 2. Key Features

- **Multimodal AI Classification**: Accurately classifies 11+ document categories (Resume, Invoice, Contract, Report, Presentation, Assignment, Receipt, Certificate, Manual, Form, Other) and 12+ image types (Screenshot, Photo, Diagram, Chart, Scan, ID Card, etc.) with validated Zod schemas.
- **Cryptographic Duplicate Detection**: Computes SHA-256 digests instantly upon upload. Groups identical files side-by-side with recoverable space calculations without automated deletion.
- **Preview & Reversible Movements (Undo)**: Generates a table of proposed file moves before executing, and records audit logs allowing 1-click restoration of original paths.
- **Custom Priority Rule Engine**: Configures conditional logic (`IF extension = .pdf`, `IF filename contains "resume"`, `IF size > threshold`) with priority ordering.
- **Interactive Analytics**: Real-time charts powered by Recharts (File Type Pie Chart, AI Category Bar Chart, Monthly Ingest Trendline, Average Confidence).
- **Hierarchical ZIP Exporter**: Exports entire organized structures, selected folders, or specific categories with folder paths preserved.
- **Developer Diagnostics Panel**: Live benchmark tester for AI latency, database connectivity, and filesystem sandbox checks.
- **Dual-Theme Support**: Dark and Light themes with WCAG AA compliance.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts |
| **Backend** | Node.js, Express, Multer, Mammoth (.docx parser), crypto (SHA-256) |
| **AI Engine** | `@google/genai` (Gemini 3.8 Flash server-side), Configurable OpenAI API fallback, Deterministic Rule Fallback |
| **Data Validation** | Zod v4 schemas |
| **Persistence** | Relational state manager (`.data/db.json`) + Production Prisma Schema (`prisma/schema.prisma`) |
| **Archival** | JSZip for streaming ZIP compilation |

---

## 4. Environment Variables (`.env.example`)

No API key is needed for a local demo. If `GEMINI_API_KEY` is unset or blank,
the app uses its built-in rule-based classifier. To enable Gemini later, add a
real key to your local `.env` file; `.env` is ignored by Git and should never
be committed.

```bash
# Optional: leave blank for keyless demo mode.
GEMINI_API_KEY=
PORT=3000
```

---

## 5. Quick Start & Execution

```bash
# 1. Install dependencies
npm install

# 2. Run the application (Starts Express backend + Vite dev server on port 3000)
npm run dev

# 3. Open your browser
# Visit http://localhost:3000
```

---

## 6. API Route Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/upload` | Multipart file upload, SHA-256 calculation & auto-classification |
| `POST` | `/api/classify` | AI classification on file ID using Gemini 3.8 Flash |
| `POST` | `/api/organize/preview` | Returns proposed file movements prior to user confirmation |
| `POST` | `/api/organize` | Applies target moves and commits undoable transaction |
| `POST` | `/api/undo` | Reverts organization operation by operationId |
| `GET` | `/api/files` | File query catalog with filters (category, type, duplicate) |
| `GET` | `/api/files/:id/preview` | Safe inline preview of file content or image |
| `GET` | `/api/files/:id/download` | Safe file download stream |
| `DELETE` | `/api/files/:id` | Deletes file record and file from disk |
| `GET` | `/api/folders` | Returns directory hierarchy tree |
| `POST` | `/api/folders` | Creates new directory |
| `GET` | `/api/duplicates` | Returns duplicate clusters grouped by SHA-256 hash |
| `GET` | `/api/analytics` | Returns aggregated metrics calculated from database |
| `POST` | `/api/export` | Packages and streams structured ZIP archive |
| `GET` | `/api/rules` | Custom priority rules list |
| `POST` | `/api/rules` | Creates custom routing rule |
| `GET` | `/api/debug/health` | Live system health and AI status |

---

## 7. College Defense & Verification Highlights

1. **Zero Mock Hardcoded Data**: Dashboard charts and counters update in real time when new files are uploaded.
2. **Offline Fallback Guarantee**: If the AI key is absent, the deterministic keyword and MIME parsing engine classifies files reliably.
3. **No Accidental Data Loss**: Duplicates are never deleted automatically; file movements can be completely reversed with the Undo button.
