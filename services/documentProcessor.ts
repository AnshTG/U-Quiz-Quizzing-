import * as pdfjsLib from 'pdfjs-dist';

// 20 MB Maximum Upload Boundary
export const MAX_FILE_UPLOAD_BYTES = 20 * 1024 * 1024; // 20 MB
export const MAX_FILE_UPLOAD_MB = 20;

// Safe payload threshold for Vercel Serverless Functions (Vercel edge limit is ~4.5 MB)
export const SAFE_PAYLOAD_MAX_BYTES = 2.5 * 1024 * 1024; // 2.5 MB binary (~3.3 MB Base64)

// Initialize PDF.js worker safely for Vite/browser environments
if (typeof window !== 'undefined') {
  try {
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      // Use standard modern worker cdn matching the installed version
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
    }
  } catch (e) {
    console.warn('PDF.js worker initialization notice:', e);
  }
}

export interface CompressedImageResult {
  base64: string;
  mimeType: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  isCompressed: boolean;
}

export interface ExtractedPdfResult {
  text: string;
  pageCount: number;
  wordCount: number;
  hasSelectableText: boolean;
}

/**
 * Format bytes into human-readable size
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * High-performance client-side image compression:
 * Accepts any image up to 20MB (phone photos, scans, screenshots)
 * and rescales/compresses it to fit safely under Vercel's 4.5MB gateway limit
 * while preserving 100% handwriting, math equations, and diagram readability.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 2400,
  quality = 0.90
): Promise<CompressedImageResult> {
  if (file.size > MAX_FILE_UPLOAD_BYTES) {
    throw new Error(`Image size (${formatBytes(file.size)}) exceeds the 20 MB maximum limit. Please select an image under 20 MB.`);
  }

  // If image is already lightweight (< 1.2 MB) and JPEG, read directly
  if (file.size <= 1.2 * 1024 * 1024 && file.type === 'image/jpeg') {
    const rawBase64 = await readFileAsBase64(file);
    return {
      base64: rawBase64,
      mimeType: file.type,
      originalSize: file.size,
      compressedSize: file.size,
      width: 0,
      height: 0,
      isCompressed: false,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file from disk.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image. Please ensure the file is a valid PNG, JPG, or WEBP image.'));
      img.onload = () => {
        try {
          let { width, height } = img;
          const origWidth = width;
          const origHeight = height;

          // Scale down if dimensions exceed maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d', { alpha: false });
          if (!ctx) {
            throw new Error('Canvas 2D context is not available for image compression.');
          }

          // Fill white background for transparent PNGs converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Enhance contrast subtly so cursive ligatures and faint pencil/pen strokes pop clearly
          try {
            ctx.filter = 'contrast(1.10) brightness(1.02)';
          } catch {
            // fallback if canvas filter not supported
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Render to JPEG with high fidelity
          let outputMime = 'image/jpeg';
          let outputQuality = quality;
          let dataUrl = canvas.toDataURL(outputMime, outputQuality);

          // Calculate approximate base64 payload size
          let approxBytes = Math.round((dataUrl.length - 22) * 0.75);

          // If still larger than 3MB (approaching Vercel edge boundary of 4.5MB), scale down smoothly
          if (approxBytes > 3 * 1024 * 1024) {
            outputQuality = 0.85;
            const smallerDim = 1920;
            const sCanvas = document.createElement('canvas');
            let sWidth = width;
            let sHeight = height;
            if (sWidth > smallerDim || sHeight > smallerDim) {
              if (sWidth > sHeight) {
                sHeight = Math.round((sHeight * smallerDim) / sWidth);
                sWidth = smallerDim;
              } else {
                sWidth = Math.round((sWidth * smallerDim) / sHeight);
                sHeight = smallerDim;
              }
            }
            sCanvas.width = sWidth;
            sCanvas.height = sHeight;
            const sCtx = sCanvas.getContext('2d', { alpha: false });
            if (sCtx) {
              sCtx.fillStyle = '#FFFFFF';
              sCtx.fillRect(0, 0, sWidth, sHeight);
              sCtx.imageSmoothingEnabled = true;
              sCtx.imageSmoothingQuality = 'high';
              sCtx.drawImage(canvas, 0, 0, sWidth, sHeight);
              dataUrl = sCanvas.toDataURL(outputMime, outputQuality);
              approxBytes = Math.round((dataUrl.length - 22) * 0.75);
              width = sWidth;
              height = sHeight;
            }
          }

          resolve({
            base64: dataUrl,
            mimeType: outputMime,
            originalSize: file.size,
            compressedSize: approxBytes,
            width,
            height,
            isCompressed: true,
          });
        } catch (err: any) {
          reject(new Error(`Image compression failed: ${err.message || err}`));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Extract academic text directly from PDF pages in the browser using PDF.js.
 * Handles textbooks, sample papers, notes up to 20MB.
 */
export async function extractTextFromPdf(file: File): Promise<ExtractedPdfResult> {
  if (file.size > MAX_FILE_UPLOAD_BYTES) {
    throw new Error(`Document size (${formatBytes(file.size)}) exceeds the 20 MB maximum limit. Please upload a PDF under 20 MB.`);
  }

  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      stopAtErrors: false,
    });

    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;
    const extractedPages: string[] = [];

    // Extract up to 40 pages (sufficient for full chapters and assessment question generation)
    const maxPagesToScan = Math.min(pageCount, 40);

    for (let pageNum = 1; pageNum <= maxPagesToScan; pageNum++) {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        let lastY: number | null = null;
        let pageLines: string[] = [];
        let currentLine = '';

        for (const item of textContent.items as any[]) {
          if (!item.str) continue;
          
          // Detect line breaks based on vertical Y position differences
          const currentY = item.transform ? item.transform[5] : null;
          if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 8) {
            if (currentLine.trim()) {
              pageLines.push(currentLine.trim());
            }
            currentLine = item.str;
          } else {
            currentLine += (currentLine ? ' ' : '') + item.str;
          }
          lastY = currentY;
        }

        if (currentLine.trim()) {
          pageLines.push(currentLine.trim());
        }

        const pageCleanText = pageLines.join('\n').trim();
        if (pageCleanText) {
          extractedPages.push(`[PAGE ${pageNum}]\n${pageCleanText}`);
        }
      } catch (pageErr) {
        console.warn(`Could not extract page ${pageNum}:`, pageErr);
      }
    }

    const fullText = extractedPages.join('\n\n').trim();
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;
    const hasSelectableText = wordCount > 30;

    return {
      text: fullText,
      pageCount,
      wordCount,
      hasSelectableText,
    };
  } catch (pdfErr: any) {
    console.warn('PDF.js parsing notice, attempting direct stream text recovery:', pdfErr);

    // Secondary fallback: Extract text streams directly from raw PDF bytes
    const fallbackText = extractTextFromPdfBytesFallback(arrayBuffer);
    const wordCount = fallbackText.split(/\s+/).filter(Boolean).length;

    return {
      text: fallbackText,
      pageCount: 1,
      wordCount,
      hasSelectableText: wordCount > 20,
    };
  }
}

/**
 * Lightweight fallback text recovery from PDF stream bytes
 */
function extractTextFromPdfBytesFallback(buffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(buffer);
    let rawStr = '';
    // Sample first 5MB of buffer if gigantic
    const maxScanBytes = Math.min(bytes.length, 5 * 1024 * 1024);
    for (let i = 0; i < maxScanBytes; i++) {
      const code = bytes[i];
      if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) {
        rawStr += String.fromCharCode(code);
      }
    }

    // Extract text in parentheses (PDF string literals: (text))
    const matches = rawStr.match(/\(([^()]{3,})\)/g) || [];
    const extractedWords = matches
      .map(m => m.slice(1, -1).replace(/\\[nrtbf\\()]/g, ' ').trim())
      .filter(w => w.length > 2 && /[a-zA-Z0-9]/.test(w));

    return extractedWords.join(' ').slice(0, 30000);
  } catch {
    return '';
  }
}

/**
 * Helper to convert file to data URL base64
 */
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
