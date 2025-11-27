import { createWorker } from 'tesseract.js';
import type { Worker } from 'tesseract.js';
import type { BoundingBox } from '../models/strokes';

export interface OCRResult {
  text: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
}

export interface OCRProgressData {
  status: string;
  progress: number;
}

let worker: Worker | null = null;


// Initialize the Tesseract worker (cached for performance)
export async function initializeOCRWorker(): Promise<Worker> {
  if (worker) {
    return worker;
  }

  worker = await createWorker('eng', 1, {
    logger: () => {
      // Silent in production - can enable for debugging
      // console.log('[OCR]', m);
    },
  });

  return worker;
}

// Terminate the OCR worker
export async function terminateOCRWorker(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

/**
 * Perform OCR on a canvas region
 * @param canvas - The canvas element
 * @param boundingBox - [minX, minY, maxX, maxY] defining the region
 * @param onProgress - Optional callback for progress updates
 * @returns Array of recognized text with positions
 */
/**
 * Perform OCR with timeout protection
 */
async function performOCRWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('OCR timeout - operation took too long')), timeoutMs)
    ),
  ]);
}

export async function performOCR(
  canvas: HTMLCanvasElement,
  boundingBox: BoundingBox,
  onProgress?: (progress: OCRProgressData) => void
): Promise<OCRResult[]> {
  const [minX, minY, maxX, maxY] = boundingBox;
  const width = maxX - minX;
  const height = maxY - minY;

  // Create a temporary canvas for the selected region
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx) {
    throw new Error('Could not get canvas context');
  }

  // Copy the selected region to temp canvas
  tempCtx.drawImage(
    canvas,
    minX, minY, width, height,
    0, 0, width, height
  );

  // Initialize worker if not already done
  const ocrWorker = await initializeOCRWorker();

  try {
    // Perform OCR recognition with timeout
    const { data } = await performOCRWithTimeout(
      ocrWorker.recognize(tempCanvas, {}, {
        text: true,
        blocks: true,
        hocr: false,
        tsv: false,
      })
    );

    if (onProgress) {
      onProgress({ status: 'Processing results', progress: 0.9 });
    }

    // Extract text blocks with their positions
    const results: OCRResult[] = [];

    if (data.blocks) {
      for (const block of data.blocks) {
        if (block.text.trim()) {
          results.push({
            text: block.text.trim(),
            confidence: block.confidence,
            bbox: {
              x: minX + block.bbox.x0,
              y: minY + block.bbox.y0,
              width: block.bbox.x1 - block.bbox.x0,
              height: block.bbox.y1 - block.bbox.y0,
            },
          });
        }
      }
    }

    if (onProgress) {
      onProgress({ status: 'Complete', progress: 1.0 });
    }

    return results;
  } catch (error) {
    console.error('OCR Error:', error);
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('OCR took too long - try a smaller selection');
      }
      throw new Error(`OCR failed: ${error.message}`);
    }
    throw new Error('OCR processing failed - please try again');
  }
}

// Quick OCR check to see if region contains readable text
export async function quickOCRCheck(
  canvas: HTMLCanvasElement,
  boundingBox: BoundingBox
): Promise<boolean> {
  try {
    const results = await performOCR(canvas, boundingBox);
    return results.length > 0 && results.some(r => r.confidence > 50);
  } catch {
    return false;
  }
}
