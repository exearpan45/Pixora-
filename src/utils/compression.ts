import { ExportFormat, ProcessedImageResult } from '../types';

export interface CompressionOptions {
  format?: ExportFormat;
  quality?: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  targetSizeKb?: number;
}

/**
 * Compresses an image canvas to a Blob with exact format and quality
 */
export async function compressCanvasToBlob(
  canvas: HTMLCanvasElement,
  format: ExportFormat = 'image/jpeg',
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to encode image canvas'));
      },
      format,
      quality
    );
  });
}

/**
 * Performs smart compression on an image.
 * If targetSizeKb is provided, it uses binary search over quality and scale
 * to find the highest possible fidelity below or closest to the target size!
 */
export async function smartCompress(
  sourceCanvas: HTMLCanvasElement,
  options: CompressionOptions = {}
): Promise<ProcessedImageResult> {
  const format: ExportFormat = options.format || 'image/jpeg';
  let targetQuality = options.quality !== undefined ? options.quality : 0.82;
  const targetSizeKb = options.targetSizeKb;

  let width = sourceCanvas.width;
  let height = sourceCanvas.height;

  // Max dimension scale down if requested
  if (options.maxWidth && width > options.maxWidth) {
    const ratio = options.maxWidth / width;
    width = options.maxWidth;
    height = Math.round(height * ratio);
  }
  if (options.maxHeight && height > options.maxHeight) {
    const ratio = options.maxHeight / height;
    height = options.maxHeight;
    width = Math.round(width * ratio);
  }

  // Create working canvas
  let workingCanvas = sourceCanvas;
  if (width !== sourceCanvas.width || height !== sourceCanvas.height) {
    workingCanvas = document.createElement('canvas');
    workingCanvas.width = width;
    workingCanvas.height = height;
    const ctx = workingCanvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(sourceCanvas, 0, 0, width, height);
    }
  }

  // If PNG format, quality parameter is ignored by browser canvas.toBlob.
  // For target size with PNG, we convert or downscale if targetSizeKb is set.
  if (targetSizeKb && targetSizeKb > 0) {
    const targetBytes = targetSizeKb * 1024;
    let minQuality = 0.15;
    let maxQuality = 0.98;
    let bestBlob: Blob | null = null;
    let bestDiff = Infinity;

    // Binary search over quality up to 6 iterations
    for (let iter = 0; iter < 6; iter++) {
      const midQuality = (minQuality + maxQuality) / 2;
      const testBlob = await compressCanvasToBlob(workingCanvas, format, midQuality);

      const diff = Math.abs(testBlob.size - targetBytes);
      if (diff < bestDiff || !bestBlob) {
        bestDiff = diff;
        bestBlob = testBlob;
      }

      if (testBlob.size > targetBytes) {
        maxQuality = midQuality;
      } else {
        minQuality = midQuality;
      }
    }

    // If even lowest quality is still > targetBytes, scale down dimension smoothly
    if (bestBlob && bestBlob.size > targetBytes * 1.15) {
      let scale = 0.85;
      for (let sIter = 0; sIter < 3; sIter++) {
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = Math.round(width * scale);
        scaledCanvas.height = Math.round(height * scale);
        const sCtx = scaledCanvas.getContext('2d');
        if (sCtx) {
          sCtx.imageSmoothingEnabled = true;
          sCtx.drawImage(workingCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
          const scaledBlob = await compressCanvasToBlob(scaledCanvas, format, 0.65);
          if (scaledBlob.size <= targetBytes * 1.05) {
            bestBlob = scaledBlob;
            width = scaledCanvas.width;
            height = scaledCanvas.height;
            workingCanvas = scaledCanvas;
            break;
          }
          scale *= 0.8;
        }
      }
    }

    if (!bestBlob) {
      bestBlob = await compressCanvasToBlob(workingCanvas, format, targetQuality);
    }

    return {
      blob: bestBlob,
      dataUrl: URL.createObjectURL(bestBlob),
      width,
      height,
      sizeBytes: bestBlob.size,
      format,
    };
  }

  // Standard preset / quality compression
  const blob = await compressCanvasToBlob(workingCanvas, format, targetQuality);
  return {
    blob,
    dataUrl: URL.createObjectURL(blob),
    width,
    height,
    sizeBytes: blob.size,
    format,
  };
}
