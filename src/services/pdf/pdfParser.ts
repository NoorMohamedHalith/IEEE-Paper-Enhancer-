import * as pdfjsLib from 'pdfjs-dist';

// Set up worker source for browser environment safely
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

export interface ExtractedPDFResult {
  text: string;
  numPages: number;
  fileName: string;
}

export async function extractTextFromPDF(file: File): Promise<ExtractedPDFResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';
    const maxPages = Math.min(pdf.numPages, 30); // Read up to 30 pages

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += `\n--- Page ${pageNum} ---\n` + pageText;
    }

    return {
      text: fullText.trim(),
      numPages: pdf.numPages,
      fileName: file.name
    };
  } catch (error) {
    console.warn('PDF parsing fallback to FileReader text extraction:', error);
    // Fallback: try reading raw text if text file / simple PDF
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          text: (e.target?.result as string) || '',
          numPages: 1,
          fileName: file.name
        });
      };
      reader.onerror = () => reject(new Error('Failed to read file content'));
      reader.readAsText(file);
    });
  }
}
