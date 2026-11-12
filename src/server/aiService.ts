import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { GoogleGenAI, Type } from '@google/genai';
import { AIClassificationResult, AIClassificationSchema } from './types.ts';

// Server-side Gemini initialization per gemini-api skill instructions
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

export const DOCUMENT_CATEGORIES = [
  'Resume',
  'Invoice',
  'Contract',
  'Report',
  'Presentation',
  'Assignment',
  'Receipt',
  'Certificate',
  'Manual',
  'Form',
  'Other'
] as const;

export const IMAGE_CATEGORIES = [
  'Screenshot',
  'Photo',
  'Diagram',
  'Chart',
  'Document Scan',
  'Receipt',
  'ID Card',
  'Certificate',
  'Artwork',
  'Meme',
  'Social Media',
  'Other'
] as const;

/**
 * Extract readable text from uploaded file buffer/disk
 */
export async function extractTextContent(filePath: string, mimeType: string, extension: string): Promise<string> {
  try {
    if (!fs.existsSync(filePath)) return '';
    const ext = extension.toLowerCase();

    // Plain text formats
    if (['.txt', '.csv', '.json', '.md', '.log', '.xml', '.html', '.ts', '.js', '.py'].includes(ext)) {
      const buffer = fs.readFileSync(filePath);
      return buffer.toString('utf8', 0, Math.min(buffer.length, 12000));
    }

    // DOCX using Mammoth
    if (ext === '.docx' || mimeType.includes('wordprocessingml')) {
      const result = await mammoth.extractRawText({ path: filePath });
      return (result.value || '').substring(0, 12000);
    }

    // PDF extraction (Extract readable text fragments)
    if (ext === '.pdf' || mimeType === 'application/pdf') {
      const buffer = fs.readFileSync(filePath);
      const str = buffer.toString('latin1', 0, Math.min(buffer.length, 50000));
      // Extract text inside streams / parentheses or ascii tokens
      const textMatches = str.match(/\(([^()]{3,120})\)|\[([^\[\]]{3,120})\]/g);
      if (textMatches && textMatches.length > 5) {
        const cleaned = textMatches
          .map(m => m.replace(/[\(\)\[\]]/g, ' ').trim())
          .filter(t => t.length > 3 && /[a-zA-Z0-9]/.test(t))
          .join(' ');
        if (cleaned.length > 50) {
          return cleaned.substring(0, 10000);
        }
      }
      // Fallback: extract printable strings
      const printable = str.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      const words = printable.split(/\s+/).filter(w => w.length > 3 && /^[a-zA-Z0-9_\-\.]+$/.test(w));
      return words.slice(0, 500).join(' ');
    }

    return '';
  } catch (err) {
    console.error('Error extracting text content from file:', err);
    return '';
  }
}

/**
 * Intelligent Rule-Based Classification Fallback
 * Used when AI is disabled, offline, or external API is unavailable
 */
export function ruleBasedClassification(
  fileName: string,
  extension: string,
  mimeType: string,
  size: number,
  extractedText: string
): AIClassificationResult {
  const nameLower = fileName.toLowerCase();
  const textLower = (extractedText || '').toLowerCase();
  const ext = extension.toLowerCase();
  const isImage = mimeType.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext);

  if (isImage) {
    if (nameLower.includes('screenshot') || nameLower.includes('screen_shot') || nameLower.includes('capture')) {
      return {
        category: 'Screenshot',
        subcategory: 'UI Screen Capture',
        confidence: 0.95,
        suggested_folder: 'Organized Files/Images/Screenshots',
        reasoning: 'Filename explicitly identifies this file as a screenshot image capture.',
        tags: ['screenshot', 'ui', 'display'],
        language: 'English'
      };
    }
    if (nameLower.includes('diagram') || nameLower.includes('flowchart') || nameLower.includes('arch') || nameLower.includes('uml')) {
      return {
        category: 'Diagram',
        subcategory: 'System Diagram',
        confidence: 0.92,
        suggested_folder: 'Organized Files/Images/Screenshots',
        reasoning: 'Identified as technical architectural diagram or flowchart.',
        tags: ['diagram', 'chart', 'architecture'],
        language: 'English'
      };
    }
    if (nameLower.includes('receipt') || textLower.includes('total') || textLower.includes('amount') || textLower.includes('order')) {
      return {
        category: 'Receipt',
        subcategory: 'Receipt Photo',
        confidence: 0.93,
        suggested_folder: 'Organized Files/Finance/Receipts',
        reasoning: 'Image contains transactional receipt markers and payment references.',
        tags: ['receipt', 'expense', 'finance'],
        language: 'English'
      };
    }
    if (nameLower.includes('id') || nameLower.includes('passport') || nameLower.includes('license')) {
      return {
        category: 'ID Card',
        subcategory: 'Identification Document',
        confidence: 0.90,
        suggested_folder: 'Organized Files/Documents',
        reasoning: 'Image identified as personal identity credential card.',
        tags: ['id-card', 'credential', 'official'],
        language: 'English'
      };
    }
    return {
      category: 'Photo',
      subcategory: 'Digital Photography',
      confidence: 0.88,
      suggested_folder: 'Organized Files/Images/Photos',
      reasoning: 'Standard digital photographic image asset.',
      tags: ['photo', 'media', 'image'],
      language: 'English'
    };
  }

  // Documents
  if (nameLower.includes('resume') || nameLower.includes('cv') || textLower.includes('curriculum vitae') || textLower.includes('work experience') || textLower.includes('education')) {
    return {
      category: 'Resume',
      subcategory: 'Professional Resume',
      confidence: 0.96,
      suggested_folder: 'Organized Files/Documents/Resume',
      reasoning: 'Document content contains candidate experience, education, skills, and contact details.',
      tags: ['resume', 'cv', 'career', 'employment'],
      language: 'English'
    };
  }

  if (nameLower.includes('invoice') || textLower.includes('invoice') || textLower.includes('bill to') || textLower.includes('due date') || textLower.includes('subtotal')) {
    return {
      category: 'Invoice',
      subcategory: 'Billing Invoice',
      confidence: 0.95,
      suggested_folder: 'Organized Files/Finance/Invoices',
      reasoning: 'Contains billing invoice numbers, itemized billing charges, and payable dates.',
      tags: ['invoice', 'billing', 'accounts-payable', 'finance'],
      language: 'English'
    };
  }

  if (nameLower.includes('receipt') || textLower.includes('receipt') || textLower.includes('payment received') || textLower.includes('total paid')) {
    return {
      category: 'Receipt',
      subcategory: 'Payment Receipt',
      confidence: 0.94,
      suggested_folder: 'Organized Files/Finance/Receipts',
      reasoning: 'Confirmed payment receipt with transaction record and currency amounts.',
      tags: ['receipt', 'payment', 'finance'],
      language: 'English'
    };
  }

  if (nameLower.includes('contract') || nameLower.includes('agreement') || textLower.includes('agreement') || textLower.includes('terms and conditions') || textLower.includes('parties agree')) {
    return {
      category: 'Contract',
      subcategory: 'Legal Agreement',
      confidence: 0.93,
      suggested_folder: 'Organized Files/Documents',
      reasoning: 'Legal document establishing binding terms between participating entities.',
      tags: ['contract', 'agreement', 'legal'],
      language: 'English'
    };
  }

  if (nameLower.includes('report') || textLower.includes('executive summary') || textLower.includes('findings') || textLower.includes('analysis')) {
    return {
      category: 'Report',
      subcategory: 'Analytical Report',
      confidence: 0.91,
      suggested_folder: 'Organized Files/Documents/Reports',
      reasoning: 'Structured multi-section report with analysis and key findings.',
      tags: ['report', 'analysis', 'research'],
      language: 'English'
    };
  }

  if (nameLower.includes('assignment') || nameLower.includes('homework') || textLower.includes('assignment') || textLower.includes('coursework') || textLower.includes('problem set')) {
    return {
      category: 'Assignment',
      subcategory: 'Academic Coursework',
      confidence: 0.92,
      suggested_folder: 'Organized Files/Documents',
      reasoning: 'Academic submission containing course work, questions, and problem answers.',
      tags: ['assignment', 'coursework', 'academic'],
      language: 'English'
    };
  }

  if (nameLower.includes('presentation') || ext === '.pptx' || ext === '.ppt') {
    return {
      category: 'Presentation',
      subcategory: 'Slide Deck',
      confidence: 0.94,
      suggested_folder: 'Organized Files/Documents',
      reasoning: 'Presentation slides containing topic summaries and visual slide sequence.',
      tags: ['presentation', 'slides', 'deck'],
      language: 'English'
    };
  }

  if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
    return {
      category: 'Report',
      subcategory: 'Spreadsheet Dataset',
      confidence: 0.90,
      suggested_folder: 'Organized Files/Documents',
      reasoning: 'Tabular numerical or categorical data ledger.',
      tags: ['spreadsheet', 'data', 'table'],
      language: 'English'
    };
  }

  return {
    category: 'Other',
    subcategory: 'General Document',
    confidence: 0.70,
    suggested_folder: 'Organized Files/Documents',
    reasoning: 'General document categorized by extension and standard metadata.',
    tags: [ext.replace('.', '') || 'document'],
    language: 'English'
  };
}

/**
 * Classify a file using Gemini 3.8 Flash (Server-Side) or fall back to Rule Engine
 */
export async function classifyFileWithAI(
  filePath: string,
  fileName: string,
  mimeType: string,
  extension: string,
  size: number
): Promise<{ result: AIClassificationResult; modelUsed: string }> {
  // First extract text if document
  const extractedText = await extractTextContent(filePath, mimeType, extension);
  const isImage = mimeType.startsWith('image/');
  const client = getGeminiClient();

  if (!client) {
    // Graceful fallback when no API key configured
    const ruleRes = ruleBasedClassification(fileName, extension, mimeType, size, extractedText);
    return { result: ruleRes, modelUsed: 'Rule-Based Engine (AI Offline)' };
  }

  try {
    const validCategories = isImage ? IMAGE_CATEGORIES.join(', ') : DOCUMENT_CATEGORIES.join(', ');

    const promptText = `
You are the AI core for a Smart File Organizer system.
Analyze the following file details and classify it accurately.

File Name: "${fileName}"
MIME Type: "${mimeType}"
Extension: "${extension}"
Size: ${size} bytes

${extractedText ? `Extracted Content Preview:\n${extractedText.substring(0, 4000)}` : '(No readable text extracted, rely on filename, MIME type, or vision)'}

Allowed Primary Categories: ${validCategories}.

Strict Rules:
1. Category MUST be one of the Allowed Primary Categories.
2. Suggested folder should be structured like:
   - For Resumes: "Organized Files/Documents/Resume"
   - For Invoices: "Organized Files/Finance/Invoices"
   - For Receipts: "Organized Files/Finance/Receipts"
   - For Reports: "Organized Files/Documents/Reports"
   - For Photos: "Organized Files/Images/Photos"
   - For Screenshots: "Organized Files/Images/Screenshots"
   - For Diagrams: "Organized Files/Images/Screenshots"
   - For general documents: "Organized Files/Documents"
3. Output MUST be valid JSON adhering exactly to this schema:
{
  "category": string,
  "subcategory": string,
  "confidence": number between 0.0 and 1.0,
  "suggested_folder": string,
  "reasoning": string,
  "tags": string[],
  "language": string
}
`;

    let response;

    if (isImage && fs.existsSync(filePath) && size < 10 * 1024 * 1024) {
      // Vision classification
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');
      const imageMime = mimeType || 'image/jpeg';

      response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: imageMime,
                  data: base64Data
                }
              },
              {
                text: promptText
              }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              subcategory: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              suggested_folder: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              language: { type: Type.STRING }
            },
            required: ['category', 'subcategory', 'confidence', 'suggested_folder', 'reasoning', 'tags', 'language']
          }
        }
      });
    } else {
      // Text / document classification
      response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              subcategory: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              suggested_folder: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              language: { type: Type.STRING }
            },
            required: ['category', 'subcategory', 'confidence', 'suggested_folder', 'reasoning', 'tags', 'language']
          }
        }
      });
    }

    const rawJson = response.text || '{}';
    const parsed = JSON.parse(rawJson);

    // Validate using Zod
    const validated = AIClassificationSchema.parse({
      category: parsed.category || 'Other',
      subcategory: parsed.subcategory || 'General',
      confidence: typeof parsed.confidence === 'number' ? Math.min(Math.max(parsed.confidence, 0.1), 0.99) : 0.85,
      suggested_folder: parsed.suggested_folder || 'Organized Files/Documents',
      reasoning: parsed.reasoning || 'Automated multi-modal analysis',
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['file'],
      language: parsed.language || 'English'
    });

    return { result: validated, modelUsed: 'Gemini 3.8 Flash' };
  } catch (error) {
    console.warn('Gemini classification error, using fallback:', error);
    const ruleRes = ruleBasedClassification(fileName, extension, mimeType, size, extractedText);
    return { result: ruleRes, modelUsed: 'Rule-Based Engine (Fallback)' };
  }
}
