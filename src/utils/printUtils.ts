import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * IEEE InnovateX — High Reliability PDF & Print Utility
 * Renders target HTML element into an A4 PDF document using jsPDF & html2canvas.
 * Robustly converts Tailwind v4 oklab(), oklch(), lab(), lch(), color-mix() and other
 * modern color functions into standard RGB/RGBA to prevent html2canvas parsing errors.
 */

const UNSUPPORTED_COLOR_REGEX = /(oklab|oklch|lab|lch|color-mix|color|hwb|light-dark)/i;
const COLOR_FN_REGEX = /(oklab|oklch|lab|lch|color-mix|color|hwb|light-dark)\s*\(/gi;

// Cache parsed colors for execution speed
const colorCache = new Map<string, string>();
let dummyCanvas: HTMLCanvasElement | null = null;

/**
 * Pure JS fallback for OKLCH -> RGB / RGBA conversion
 */
export function oklchToRgb(oklchStr: string): string {
  try {
    const contentMatch = oklchStr.match(/oklch\s*\(\s*([^)]+)\s*\)/i);
    if (!contentMatch) return oklchStr;

    const inner = contentMatch[1].trim();
    const parts = inner.split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return oklchStr;

    let L = parseFloat(parts[0]);
    if (parts[0].endsWith('%')) L /= 100;

    let C = parseFloat(parts[1]);

    let H = parseFloat(parts[2]);
    if (parts[2].endsWith('rad')) H = (H * 180) / Math.PI;
    else if (parts[2].endsWith('turn')) H = H * 360;

    let alpha = 1;
    if (parts.length >= 4) {
      const aStr = parts[3];
      if (aStr.endsWith('%')) alpha = parseFloat(aStr) / 100;
      else alpha = parseFloat(aStr);
    }

    const hRad = (H * Math.PI) / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);

    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const r_lin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const g_lin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const b_lin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

    const toGamma = (c: number) => {
      if (c <= 0) return 0;
      if (c >= 1) return 255;
      const g = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
      return Math.min(255, Math.max(0, Math.round(g * 255)));
    };

    const r = toGamma(r_lin);
    const g = toGamma(g_lin);
    const b_val = toGamma(b_lin);

    if (isNaN(r) || isNaN(g) || isNaN(b_val)) return oklchStr;

    if (alpha < 1) {
      return `rgba(${r}, ${g}, ${b_val}, ${Number(alpha.toFixed(3))})`;
    }
    return `rgb(${r}, ${g}, ${b_val})`;
  } catch {
    return oklchStr;
  }
}

/**
 * Pure JS fallback for OKLAB -> RGB / RGBA conversion
 */
export function oklabToRgb(oklabStr: string): string {
  try {
    const contentMatch = oklabStr.match(/oklab\s*\(\s*([^)]+)\s*\)/i);
    if (!contentMatch) return oklabStr;

    const inner = contentMatch[1].trim();
    const parts = inner.split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return oklabStr;

    let L = parseFloat(parts[0]);
    if (parts[0].endsWith('%')) L /= 100;

    let a = parseFloat(parts[1]);
    if (parts[1].endsWith('%')) a = (parseFloat(parts[1]) / 100) * 0.4;

    let b = parseFloat(parts[2]);
    if (parts[2].endsWith('%')) b = (parseFloat(parts[2]) / 100) * 0.4;

    let alpha = 1;
    if (parts.length >= 4) {
      const aStr = parts[3];
      if (aStr.endsWith('%')) alpha = parseFloat(aStr) / 100;
      else alpha = parseFloat(aStr);
    }

    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const r_lin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const g_lin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const b_lin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

    const toGamma = (c: number) => {
      if (c <= 0) return 0;
      if (c >= 1) return 255;
      const g = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
      return Math.min(255, Math.max(0, Math.round(g * 255)));
    };

    const r = toGamma(r_lin);
    const g = toGamma(g_lin);
    const b_val = toGamma(b_lin);

    if (isNaN(r) || isNaN(g) || isNaN(b_val)) return oklabStr;

    if (alpha < 1) {
      return `rgba(${r}, ${g}, ${b_val}, ${Number(alpha.toFixed(3))})`;
    }
    return `rgb(${r}, ${g}, ${b_val})`;
  } catch {
    return oklabStr;
  }
}

/**
 * Convert a single CSS color function string to rgb/rgba
 */
export const convertSingleColorToRgb = (colorStr: string): string => {
  if (!colorStr) return colorStr;
  const trimmed = colorStr.trim();
  if (colorCache.has(trimmed)) {
    return colorCache.get(trimmed)!;
  }

  // Pre-process: strip CSS variables var(--foo, fallback) -> fallback
  let cleanStr = trimmed.replace(/var\s*\(\s*--[^,\s)]+\s*,\s*([^)]+)\)/g, '$1');
  cleanStr = cleanStr.replace(/var\s*\(\s*--[^)]+\)/g, '1');

  // 1. Try Canvas2D first
  if (typeof document !== 'undefined') {
    if (!dummyCanvas) {
      dummyCanvas = document.createElement('canvas');
      dummyCanvas.width = 1;
      dummyCanvas.height = 1;
    }
    const ctx = dummyCanvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      try {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = '#123456';
        ctx.fillStyle = cleanStr;
        if (ctx.fillStyle !== '#123456') {
          ctx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
          const alpha = a / 255;
          const res =
            alpha < 1
              ? `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(3))})`
              : `rgb(${r}, ${g}, ${b})`;
          colorCache.set(trimmed, res);
          return res;
        }
      } catch {
        // Fall through to JS fallbacks
      }
    }
  }

  // 2. Pure JS fallbacks
  const lower = cleanStr.toLowerCase();
  let result = cleanStr;
  if (lower.includes('oklch')) {
    result = oklchToRgb(cleanStr);
  } else if (lower.includes('oklab')) {
    result = oklabToRgb(cleanStr);
  }

  // CRITICAL SAFETY CHECK: If result STILL contains unsupported color functions,
  // NEVER return it to html2canvas, or html2canvas WILL throw:
  // "Attempting to parse an unsupported color function..."
  if (UNSUPPORTED_COLOR_REGEX.test(result)) {
    if (result.includes('/ 0') || result.includes('/0')) {
      result = 'rgba(0, 0, 0, 0)';
    } else {
      result = 'rgb(0, 0, 0)';
    }
  }

  colorCache.set(trimmed, result);
  return result;
};

/**
 * Finds and replaces all nested oklab(...), oklch(...), color-mix(...) function calls in any CSS text
 * using balanced parentheses parsing.
 */
export const replaceColorFunctionsInText = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  if (!UNSUPPORTED_COLOR_REGEX.test(text)) return text;

  const fnRegex = new RegExp(COLOR_FN_REGEX.source, 'gi');
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fnRegex.exec(text)) !== null) {
    const startIndex = match.index;
    let parenCount = 1;
    let curr = startIndex + match[0].length;

    while (curr < text.length && parenCount > 0) {
      if (text[curr] === '(') parenCount++;
      else if (text[curr] === ')') parenCount--;
      curr++;
    }

    if (parenCount === 0) {
      result += text.slice(lastIndex, startIndex);
      const fullFnCall = text.slice(startIndex, curr);
      const converted = convertSingleColorToRgb(fullFnCall);
      result += converted;
      lastIndex = curr;
      fnRegex.lastIndex = curr;
    }
  }

  result += text.slice(lastIndex);

  // Absolute safety net: if any unsupported color function remains, replace with rgb(0,0,0) or rgba(0,0,0,0)
  if (UNSUPPORTED_COLOR_REGEX.test(result)) {
    result = result.replace(/(oklab|oklch|lab|lch|color-mix|hwb|light-dark)\s*\([^)]*\)/gi, 'rgb(0, 0, 0)');
  }

  return result;
};

export const downloadElementAsPDF = async (
  elementId: string,
  filename: string = 'IEEE_InnovateX_Report.pdf',
  onProgress?: (status: string) => void
): Promise<boolean> => {
  try {
    onProgress?.('Generating PDF...');
    const targetElement = document.getElementById(elementId);

    if (!targetElement) {
      console.warn(`[IEEE InnovateX] Element #${elementId} not found for PDF export.`);
      triggerPrint(elementId, filename);
      return false;
    }

    const originalStyle = targetElement.style.cssText;
    targetElement.classList.add('pdf-render-mode');

    // High quality canvas capture
    const canvas = await html2canvas(targetElement, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      ignoreElements: (element) => {
        return element.classList.contains('no-print');
      },
      onclone: (clonedDoc, clonedElement) => {
        // 0. Force Light Theme for publication-grade PDF export
        if (clonedDoc.documentElement) {
          clonedDoc.documentElement.classList.remove('dark');
        }
        if (clonedDoc.body) {
          clonedDoc.body.classList.remove('dark');
          clonedDoc.body.style.backgroundColor = '#ffffff';
          clonedDoc.body.style.color = '#09090b';
        }

        // Expand target element and all parent/child scrollable elements so full process flow is captured
        if (clonedElement) {
          clonedElement.classList.remove('dark');
          clonedElement.style.maxHeight = 'none';
          clonedElement.style.height = 'auto';
          clonedElement.style.overflow = 'visible';
          clonedElement.style.position = 'static';
          clonedElement.style.backgroundColor = '#ffffff';
          clonedElement.style.color = '#09090b';
        }

        const scrollables = Array.from(clonedDoc.querySelectorAll<HTMLElement>('*'));
        scrollables.forEach((el) => {
          if (el.classList.contains('no-print')) return;
          const style = clonedDoc.defaultView?.getComputedStyle(el);
          if (style && (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.maxHeight !== 'none')) {
            el.style.maxHeight = 'none';
            el.style.overflow = 'visible';
            el.style.height = 'auto';
          }
        });

        // 1. Sanitize all <style> tags in cloned document
        const styleTags = clonedDoc.querySelectorAll('style');
        styleTags.forEach((styleTag) => {
          if (
            styleTag.textContent &&
            UNSUPPORTED_COLOR_REGEX.test(styleTag.textContent)
          ) {
            styleTag.textContent = replaceColorFunctionsInText(styleTag.textContent);
          }
        });

        // 2. Sanitize stylesheet rules in cloned document
        try {
          Array.from(clonedDoc.styleSheets).forEach((sheet) => {
            try {
              const rules = Array.from(sheet.cssRules || []);
              rules.forEach((rule) => {
                if (rule.cssText && UNSUPPORTED_COLOR_REGEX.test(rule.cssText)) {
                  if ('style' in rule && rule.style) {
                    const styleObj = (rule as CSSStyleRule).style;
                    for (let i = 0; i < styleObj.length; i++) {
                      const prop = styleObj[i];
                      const val = styleObj.getPropertyValue(prop);
                      if (val && UNSUPPORTED_COLOR_REGEX.test(val)) {
                        styleObj.setProperty(
                          prop,
                          replaceColorFunctionsInText(val),
                          styleObj.getPropertyPriority(prop)
                        );
                      }
                    }
                  }
                }
              });
            } catch {
              // Ignore cross-origin stylesheet errors
            }
          });
        } catch {
          // Ignore
        }

        // 3. Directly convert computed styles containing oklab/oklch into inline !important RGB styles
        const defaultView = clonedDoc.defaultView || window;
        const allElements = Array.from(clonedDoc.querySelectorAll<HTMLElement>('*'));
        if (clonedElement) allElements.push(clonedElement);

        allElements.forEach((el) => {
          // Sanitize inline style attributes first
          const styleAttr = el.getAttribute('style');
          if (styleAttr && UNSUPPORTED_COLOR_REGEX.test(styleAttr)) {
            el.setAttribute('style', replaceColorFunctionsInText(styleAttr));
          }

          // Reset text distortion properties for html2canvas crisp font rasterization
          el.style.letterSpacing = 'normal';
          el.style.wordSpacing = 'normal';
          if (el.classList.contains('truncate') || el.classList.contains('line-clamp-1') || el.classList.contains('line-clamp-2') || el.classList.contains('line-clamp-3')) {
            el.style.whiteSpace = 'normal';
            el.style.overflow = 'visible';
            el.style.textOverflow = 'clip';
          }

          // Fix badge / pill text squishing in html2canvas
          if (el.classList.contains('bg-emerald-800') || el.classList.contains('bg-emerald-700') || el.classList.contains('bg-emerald-900')) {
            el.style.display = 'inline-flex';
            el.style.alignItems = 'center';
            el.style.padding = '4px 10px';
            el.style.lineHeight = '1.2';
            el.style.letterSpacing = '0.03em';
            el.style.backgroundColor = '#065f46';
            el.style.color = '#ffffff';
            el.style.borderRadius = '6px';
            el.style.fontWeight = '800';
            el.style.boxSizing = 'border-box';
          }

          // Evaluate computed styles and lock down sanitized RGB values onto the cloned node
          try {
            const computed = defaultView.getComputedStyle(el);
            if (computed) {
              for (let i = 0; i < computed.length; i++) {
                const prop = computed[i];
                const val = computed.getPropertyValue(prop);
                if (val && UNSUPPORTED_COLOR_REGEX.test(val)) {
                  const sanitizedVal = replaceColorFunctionsInText(val);
                  el.style.setProperty(prop, sanitizedVal, 'important');
                }
              }
            }
          } catch {
            // Ignore non-stylable elements
          }
        });
      }
    });

    // Revert target styling
    targetElement.style.cssText = originalStyle;
    targetElement.classList.remove('pdf-render-mode');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidthMM = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeightMM = pdf.internal.pageSize.getHeight(); // 297mm
    const marginMM = 10;
    const contentWidthMM = pdfWidthMM - marginMM * 2; // 190mm
    const contentHeightMM = pdfHeightMM - marginMM * 2; // 277mm

    // Calculate millimeter-to-pixel ratio based on captured canvas width
    const mmPerPx = contentWidthMM / canvas.width;
    const sliceHeightPx = Math.floor(contentHeightMM / mmPerPx);

    let currentY = 0;
    let pageIndex = 0;

    while (currentY < canvas.height) {
      const sliceHeight = Math.min(sliceHeightPx, canvas.height - currentY);

      // Offscreen canvas for page slice
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;
      const ctx = sliceCanvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          currentY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );

        const sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.95);
        const sliceHeightMM = sliceHeight * mmPerPx;

        if (pageIndex > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          sliceImgData,
          'JPEG',
          marginMM,
          marginMM,
          contentWidthMM,
          sliceHeightMM
        );
      }

      currentY += sliceHeight;
      pageIndex++;
    }

    const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(safeFilename);
    onProgress?.('PDF Downloaded!');
    return true;
  } catch (err) {
    console.error('[IEEE InnovateX] PDF Generation Error, falling back to window.print():', err);
    triggerPrint(elementId, filename);
    return false;
  }
};

export const triggerPrint = (elementId?: string, documentTitle: string = 'IEEE InnovateX Research Report') => {
  try {
    if (elementId) {
      const targetElement = document.getElementById(elementId);
      if (targetElement) {
        const iframe = document.createElement('iframe');
        iframe.name = 'print_iframe';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.opacity = '0';

        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc) {
          const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map((style) => style.outerHTML)
            .join('\n');

          iframeDoc.open();
          iframeDoc.write(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8" />
                <title>${documentTitle}</title>
                ${styleTags}
                <style>
                  @page {
                    size: A4 portrait;
                    margin: 10mm 12mm;
                  }
                  body {
                    background: #ffffff !important;
                    color: #000000 !important;
                    padding: 16px !important;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  .no-print {
                    display: none !important;
                  }
                  * {
                    box-shadow: none !important;
                  }
                </style>
              </head>
              <body>
                <div class="printable-content">
                  ${targetElement.innerHTML}
                </div>
                <script>
                  window.onload = function() {
                    setTimeout(function() {
                      window.focus();
                      window.print();
                      setTimeout(function() {
                        if (window.frameElement) {
                          window.frameElement.remove();
                        }
                      }, 1000);
                    }, 300);
                  };
                </script>
              </body>
            </html>
          `);
          iframeDoc.close();
          return;
        }
      }
    }

    window.focus();
    window.print();
  } catch (err) {
    console.warn('[IEEE InnovateX] Print fallback:', err);
    window.focus();
    window.print();
  }
};
