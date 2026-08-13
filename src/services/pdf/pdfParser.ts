import * as pdfjsLib from 'pdfjs-dist';
import { sanitizePaperText } from '../../utils/textSanitizer';
import { PDFPageChunk } from '../../types';

// Set up worker source for browser environment safely
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

export interface ExtractedPDFResult {
  text: string;
  numPages: number;
  fileName: string;
  chunks: PDFPageChunk[];
  isScanned: boolean;
  isOcrProcessed: boolean;
  ocrEngine: 'gemini-vision' | 'tesseract' | 'none';
  detectionDetails: {
    totalCharsExtracted: number;
    avgCharsPerPage: number;
    reason: string;
  };
}

/**
 * Detects IEEE paper section headers from text lines.
 */
export function detectSectionHeader(line: string, currentSection: string): string {
  const cleanLine = line.trim();
  if (!cleanLine || cleanLine.length > 80) return currentSection;

  // IEEE Standard Section Numeral Patterns (e.g., "I. INTRODUCTION", "II. RELATED WORK", "III. METHODOLOGY")
  const ieeeRegex = /^(?:[IVXLCDM]+\.|[1-9]\d*\.)\s*([A-Z\s]{3,50})$/i;
  const wordHeaderRegex = /^(ABSTRACT|INTRODUCTION|RELATED WORK|SYSTEM MODEL|METHODOLOGY|PROPOSED METHOD|EXPERIMENTAL RESULTS|RESULTS AND DISCUSSION|EVALUATION|LIMITATIONS|CONCLUSION|REFERENCES)$/i;

  const match = cleanLine.match(ieeeRegex);
  if (match) {
    return cleanLine.toUpperCase();
  }

  if (wordHeaderRegex.test(cleanLine)) {
    return cleanLine.toUpperCase();
  }

  return currentSection;
}

/**
 * Reconstructs reading order for IEEE two-column PDF page layout.
 */
function reconstructTwoColumnText(items: any[], pageWidth: number): string {
  if (!items || items.length === 0) return '';

  const midX = pageWidth > 0 ? pageWidth / 2 : 300;

  // Separate header/footer items, left column, and right column
  const topHeaderItems: any[] = [];
  const leftColumnItems: any[] = [];
  const rightColumnItems: any[] = [];

  for (const item of items) {
    if (!item.str || item.str.trim() === '') continue;

    const x = item.transform ? item.transform[4] : 0;
    const y = item.transform ? item.transform[5] : 0;

    // Top 10% of page or span across full width is likely title/authors
    if (y > 720 || (x < midX - 100 && x + item.width > midX + 100)) {
      topHeaderItems.push({ ...item, x, y });
    } else if (x < midX) {
      leftColumnItems.push({ ...item, x, y });
    } else {
      rightColumnItems.push({ ...item, x, y });
    }
  }

  // Sort top-to-bottom (y descending) and left-to-right (x ascending)
  const sortByPosition = (a: any, b: any) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 6) return yDiff; // Lines with >6px difference
    return a.x - b.x;
  };

  topHeaderItems.sort(sortByPosition);
  leftColumnItems.sort(sortByPosition);
  rightColumnItems.sort(sortByPosition);

  const orderedItems = [...topHeaderItems, ...leftColumnItems, ...rightColumnItems];
  return orderedItems.map((item) => item.str).join(' ');
}

/**
 * Perform server-side or canvas Gemini OCR for a scanned PDF page.
 */
async function ocrPdfPage(page: pdfjsLib.PDFPageProxy, pageNum: number): Promise<string> {
  try {
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) return '';

    await page.render({ canvasContext: context, viewport, canvas } as any).promise;
    const base64Image = canvas.toDataURL('image/png');

    // Call server Gemini OCR endpoint
    const response = await fetch('/api/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Image,
        mimeType: 'image/png',
        pageNumber: pageNum,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.text || '';
    }
  } catch (err) {
    console.warn(`OCR fallback failed for page ${pageNum}:`, err);
  }
  return '';
}

export async function extractTextFromPDF(file: File): Promise<ExtractedPDFResult> {
  let chunks: PDFPageChunk[] = [];
  let fullText = '';
  let totalChars = 0;
  let numPages = 1;
  let isScanned = false;
  let isOcrProcessed = false;
  let ocrEngine: 'gemini-vision' | 'tesseract' | 'none' = 'none';

  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    numPages = pdf.numPages;

    const maxPages = Math.min(pdf.numPages, 30);
    const pageTexts: { pageNum: number; text: string }[] = [];

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const textContent = await page.getTextContent();

      let pageText = reconstructTwoColumnText(textContent.items, viewport.width);
      if (!pageText || pageText.trim().length === 0) {
        pageText = textContent.items.map((item: any) => item.str).join(' ');
      }

      const cleanPageText = sanitizePaperText(pageText);
      totalChars += cleanPageText.length;
      pageTexts.push({ pageNum, text: cleanPageText });
    }

    const avgCharsPerPage = maxPages > 0 ? totalChars / maxPages : 0;

    // Detect Scanned PDF (< 40 avg chars/page or total chars < 120 across multiple pages)
    if (avgCharsPerPage < 40 || totalChars < 120) {
      isScanned = true;
      ocrEngine = 'gemini-vision';

      // Attempt OCR for scanned pages
      let ocrTotalText = '';
      for (let pageNum = 1; pageNum <= Math.min(maxPages, 10); pageNum++) {
        const page = await pdf.getPage(pageNum);
        const ocrText = await ocrPdfPage(page, pageNum);
        if (ocrText && ocrText.trim().length > 0) {
          isOcrProcessed = true;
          pageTexts[pageNum - 1] = { pageNum, text: sanitizePaperText(ocrText) };
          ocrTotalText += `\n--- Page ${pageNum} (OCR) ---\n` + ocrText;
        }
      }

      if (isOcrProcessed) {
        totalChars = ocrTotalText.length;
      }
    }

    // Build Evidence Chunks with section tracking
    let currentSection = 'ABSTRACT & OVERVIEW';
    let globalChunkIdx = 1;

    for (const pt of pageTexts) {
      const pageNum = pt.pageNum;
      const lines = pt.text.split(/(?:\r?\n)+|(?<=\.)\s+/);
      let paragraphBuf = '';
      let paragraphIdx = 1;

      fullText += `\n--- Page ${pageNum} ---\n`;

      for (const line of lines) {
        currentSection = detectSectionHeader(line, currentSection);
        paragraphBuf += line + ' ';

        if (paragraphBuf.length >= 400 || line.endsWith('.')) {
          const chunkText = paragraphBuf.trim();
          if (chunkText.length > 20) {
            const chunkId = `p${pageNum}-s${paragraphIdx}-c${globalChunkIdx}`;
            chunks.push({
              chunkId,
              pageNum,
              section: currentSection,
              paragraphIndex: paragraphIdx,
              text: chunkText,
              sourceLocation: `Page ${pageNum}, Section: ${currentSection}`,
            });
            fullText += chunkText + '\n\n';
            globalChunkIdx++;
            paragraphIdx++;
          }
          paragraphBuf = '';
        }
      }

      if (paragraphBuf.trim().length > 20) {
        const chunkId = `p${pageNum}-s${paragraphIdx}-c${globalChunkIdx}`;
        chunks.push({
          chunkId,
          pageNum,
          section: currentSection,
          paragraphIndex: paragraphIdx,
          text: paragraphBuf.trim(),
          sourceLocation: `Page ${pageNum}, Section: ${currentSection}`,
        });
        fullText += paragraphBuf.trim() + '\n\n';
        globalChunkIdx++;
      }
    }

    const cleanFullText = sanitizePaperText(fullText);

    return {
      text: cleanFullText || `Research paper content extracted for ${file.name.replace(/\.pdf$/i, '')}.`,
      numPages,
      fileName: file.name,
      chunks,
      isScanned,
      isOcrProcessed,
      ocrEngine: isOcrProcessed ? 'gemini-vision' : 'none',
      detectionDetails: {
        totalCharsExtracted: totalChars,
        avgCharsPerPage: Math.round(avgCharsPerPage),
        reason: isScanned
          ? 'Extracted text layer below threshold (<40 chars/page). Scanned document flagged.'
          : 'High-density native text layer extracted successfully.',
      },
    };
  } catch (error) {
    console.warn('PDF parsing fallback to FileReader text extraction:', error);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = (e.target?.result as string) || '';
        const clean = sanitizePaperText(raw);
        const chunk: PDFPageChunk = {
          chunkId: 'p1-s1-c1',
          pageNum: 1,
          section: 'MAIN TEXT',
          paragraphIndex: 1,
          text: clean || `Research paper content extracted for ${file.name.replace(/\.pdf$/i, '')}.`,
          sourceLocation: 'Page 1, Main Section',
        };
        resolve({
          text: clean || `Research paper content extracted for ${file.name.replace(/\.pdf$/i, '')}.`,
          numPages: 1,
          fileName: file.name,
          chunks: [chunk],
          isScanned: false,
          isOcrProcessed: false,
          ocrEngine: 'none',
          detectionDetails: {
            totalCharsExtracted: clean.length,
            avgCharsPerPage: clean.length,
            reason: 'Fallback plain text reader',
          },
        });
      };
      reader.onerror = () => {
        resolve({
          text: `Research paper content extracted for ${file.name.replace(/\.pdf$/i, '')}.`,
          numPages: 1,
          fileName: file.name,
          chunks: [],
          isScanned: false,
          isOcrProcessed: false,
          ocrEngine: 'none',
          detectionDetails: {
            totalCharsExtracted: 0,
            avgCharsPerPage: 0,
            reason: 'Parse error fallback',
          },
        });
      };
      reader.readAsText(file);
    });
  }
}


