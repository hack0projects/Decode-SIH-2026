// =============================================================================
// fileProcessor.js -- Universal File Text Extractor
// Supports: .pptx / .ppt  |  .pdf  |  .txt / .md
// =============================================================================

import fs           from 'fs/promises';
import path         from 'path';
import { createRequire } from 'module';
import officeParser from 'officeparser';

// pdf-parse does not expose subpaths in ESM -- use createRequire as workaround
const require  = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export async function extractText(filePath, mimeType, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  console.log(`   Extracting from: ${originalName} (${ext})`);

  if (['.pptx', '.ppt', '.odp'].includes(ext)) return extractFromPowerPoint(filePath);
  if (ext === '.pdf' || mimeType === 'application/pdf') return extractFromPdf(filePath);
  if (['.txt', '.md', '.text'].includes(ext) || mimeType?.startsWith('text/')) return extractFromText(filePath);

  throw new Error(`Unsupported type: "${ext}". Allowed: .pptx .ppt .pdf .txt .md`);
}

async function extractFromPowerPoint(filePath) {
  return new Promise((resolve, reject) => {
    officeParser.parseOffice(filePath, (text, err) => {
      if (err) return reject(new Error(`PPTX extraction failed: ${err.message ?? err}`));
      if (!text?.trim()) return reject(new Error('PPTX has no readable text.'));
      const cleaned = cleanText(text);
      console.log(`   PPTX: ${cleaned.length} chars extracted`);
      resolve(cleaned);
    });
  });
}

async function extractFromPdf(filePath) {
  const buffer = await fs.readFile(filePath);
  const data   = await pdfParse(buffer);
  if (!data.text?.trim()) throw new Error('PDF is image-only or scanned -- no extractable text.');
  const cleaned = cleanText(data.text);
  console.log(`   PDF: ${cleaned.length} chars across ${data.numpages} pages`);
  return cleaned;
}

async function extractFromText(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  if (!text?.trim()) throw new Error('Text file is empty.');
  const cleaned = cleanText(text);
  console.log(`   TXT: ${cleaned.length} chars extracted`);
  return cleaned;
}

function cleanText(raw) {
  return raw
    .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    .replace(/[^\x09\x0A\x20-\x7E\u00A0-\uFFFF]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}