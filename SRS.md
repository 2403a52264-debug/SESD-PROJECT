# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## Project: Smart File Organizer (AI-Powered Intelligent File Management System)
### Course: Software Engineering and Software Development (SESD) Capstone
**Author**: Siddhartha Jakku (Lead Architect)  
**Date**: November 2026  
**Status**: Approved & Implemented

---

### 1. Introduction
#### 1.1 Purpose
This document provides the complete functional, non-functional, and architectural requirements for the Smart File Organizer application. The system provides automated file intake, content extraction, machine-learning classification, duplicate detection, and rule-based organizational hierarchy.

#### 1.2 Scope
The scope encompasses a full-stack web application with client-side drag-and-drop file ingestion, server-side content extraction (PDF, DOCX, XLSX, Images), AI-driven structured classification (Gemini 3.8 Flash), cryptographic hashing (SHA-256), reversible file movements with undo capabilities, and hierarchical ZIP exports.

---

### 2. Overall Description
#### 2.1 Product Perspective
Smart File Organizer operates as a standalone web application running on an Express Node.js backend with a React 19 single-page client interface. The backend coordinates file system storage, persistence, and external AI inference via Google's modern `@google/genai` TypeScript SDK.

#### 2.2 User Characteristics
- **Students & Researchers**: Organizing research papers, lecture notes, slide decks, and code samples.
- **Office Administrators**: Routing invoices, payment receipts, resumes, and legal contracts.
- **General Users**: Deduplicating personal photos, downloads, and screenshots.

---

### 3. Functional Requirements
- **FR-1: Multi-File Ingestion Pipeline**: Support concurrent upload of multiple files via drag-and-drop or browser selector. Enforce size limits and file extension whitelisting.
- **FR-2: Content Parsing & Text Extraction**:
  - Extract structured text from Word `.docx` documents using Mammoth.
  - Parse readable ASCII text tokens from `.pdf` documents.
  - Process text-based logs, CSVs, spreadsheets, and source code.
  - Process images (PNG, JPG, WEBP) via multimodal vision models.
- **FR-3: AI Classification Engine**:
  - Classify documents into 11 categories: *Resume, Invoice, Contract, Report, Presentation, Assignment, Receipt, Certificate, Manual, Form, Other*.
  - Classify images into 12 categories: *Screenshot, Photo, Diagram, Chart, Document Scan, Receipt, ID Card, Certificate, Artwork, Meme, Social Media, Other*.
  - Validate response strictly against a Zod schema returning category, subcategory, confidence, suggested folder, reasoning, and tags.
- **FR-4: Cryptographic Duplicate Detection**:
  - Generate a SHA-256 hash for every uploaded file.
  - Group files with identical hashes into clusters.
  - Display recoverable space without automated deletion.
- **FR-5: Movement Preview & Custom Rules**:
  - Enable user-defined rules with priority evaluation (`IF`, `THEN`).
  - Preview file movements in an interactive table before applying.
  - Require explicit user confirmation before changing folder associations.
- **FR-6: Transactional Undo**:
  - Maintain historical logs of organization batches.
  - Provide atomic undo to restore original directory locations.
- **FR-7: Hierarchical ZIP Export**:
  - Bundle folders or categories into compressed `.zip` files preserving directory paths.

---

### 4. Non-Functional Requirements
- **NFR-1 (Security)**: API keys must remain strictly on the server; client never touches credentials. Uploaded files are sandboxed and prevented from path traversal.
- **NFR-2 (Usability)**: Follows the modern SaaS design constitution with zero-pill metadata discipline, tabular numerals, and responsive layouts.
- **NFR-3 (Availability & Fallback)**: In the absence of an external AI connection, the system falls back to a deterministic rule-based classifier.

---

### 5. Database Schema Design (Prisma ORM)
The database structure is codified in `prisma/schema.prisma` and persisted in the local application state:
1. `User`: User profile and authorization role.
2. `File`: File metadata, original name, storage path, SHA-256 hash, and folder relation.
3. `Folder`: Hierarchical folder tree with parent-child associations.
4. `Category`: System document and image taxonomy definitions.
5. `AIResult`: Structured output from Gemini with reasoning, confidence, and tags.
6. `CustomRule`: User-defined routing criteria with priority index.
7. `OrganizationOperation`: Reversible organization batch transactions.
8. `OrganizationItem`: Individual file move records mapping previous to new paths.
9. `ActivityHistory`: Audit log of system events.

---

### 6. Verification and Testing
All major components have been verified:
- [x] Batch file upload and validation
- [x] DOCX text parsing via Mammoth
- [x] SHA-256 hash calculation and duplicate detection
- [x] Gemini 3.8 Flash structured classification with Zod schema validation
- [x] Proposed movements preview and confirmation
- [x] Transactional undo rollback
- [x] Hierarchical ZIP export via JSZip
- [x] Real-time Recharts visualization
