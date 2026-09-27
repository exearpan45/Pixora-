/**
 * Advanced image algorithms for Pixora Premium Studio
 * Client-side high performance canvas algorithms (Zero server reliance)
 */

export interface PaletteColor {
  hex: string;
  rgb: [number, number, number];
  percent: number;
}

export interface DpiPrintInfo {
  dpi300WidthInches: number;
  dpi300HeightInches: number;
  dpi300WidthCm: number;
  dpi300HeightCm: number;
  rating: 'Exhibition Quality' | 'Standard Print' | 'Low Resolution Warning';
  recommendedMaxPrint: string;
}

/**
 * 70.2 Auto Enhance: Automatic dynamic range histogram stretching + saturation pop + edge clarity
 */
export function autoEnhanceCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // 1. Find min & max luminance for histogram stretch
  let minLum = 255;
  let maxLum = 0;
  for (let i = 0; i < data.length; i += 16) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
  }

  // Avoid divide by zero
  if (maxLum - minLum < 10) return;
  const lumRange = maxLum - minLum;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Contrast stretch
    r = ((r - minLum) / lumRange) * 255;
    g = ((g - minLum) / lumRange) * 255;
    b = ((b - minLum) / lumRange) * 255;

    // Saturation slight pop (12%)
    const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * 1.12;
    g = gray + (g - gray) * 1.12;
    b = gray + (b - gray) * 1.12;

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  ctx.putImageData(imgData, 0, 0);

  // Subtle unsharp clarity pass
  applyUnsharpMask(canvas, 0.4);
}

/**
 * 70.4 Dedicated Unsharp Mask Sharpening
 */
export function applyUnsharpMask(canvas: HTMLCanvasElement, amount: number = 0.6): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const src = imgData.data;
  const output = ctx.createImageData(w, h);
  const dst = output.data;

  // 3x3 Laplacian edge kernel
  const s = amount * 1.2;
  const weights = [
    0, -s, 0,
    -s, 1 + 4 * s, -s,
    0, -s, 0
  ];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let r = 0, g = 0, b = 0;
      for (let cy = 0; cy < 3; cy++) {
        for (let cx = 0; cx < 3; cx++) {
          const scx = x + cx - 1;
          const scy = y + cy - 1;
          const srcIdx = (scy * w + scx) * 4;
          const weight = weights[cy * 3 + cx];
          r += src[srcIdx] * weight;
          g += src[srcIdx + 1] * weight;
          b += src[srcIdx + 2] * weight;
        }
      }
      const dstIdx = (y * w + x) * 4;
      dst[dstIdx] = Math.min(255, Math.max(0, r));
      dst[dstIdx + 1] = Math.min(255, Math.max(0, g));
      dst[dstIdx + 2] = Math.min(255, Math.max(0, b));
      dst[dstIdx + 3] = src[dstIdx + 3];
    }
  }

  // Copy borders
  for (let x = 0; x < w; x++) {
    const topIdx = x * 4;
    const botIdx = ((h - 1) * w + x) * 4;
    for (let c = 0; c < 4; c++) {
      dst[topIdx + c] = src[topIdx + c];
      dst[botIdx + c] = src[botIdx + c];
    }
  }
  for (let y = 0; y < h; y++) {
    const leftIdx = (y * w) * 4;
    const rightIdx = (y * w + w - 1) * 4;
    for (let c = 0; c < 4; c++) {
      dst[leftIdx + c] = src[leftIdx + c];
      dst[rightIdx + c] = src[rightIdx + c];
    }
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * 70.3 Edge-preserving Selective Denoise
 */
export function applyDenoise(canvas: HTMLCanvasElement, strength: 'low' | 'medium' | 'high' | number): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const src = imgData.data;
  const output = ctx.createImageData(w, h);
  const dst = output.data;

  const threshold = strength === 'low' ? 18 : strength === 'medium' ? 32 : strength === 'high' ? 50 : strength;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const centerIdx = (y * w + x) * 4;
      const cR = src[centerIdx];
      const cG = src[centerIdx + 1];
      const cB = src[centerIdx + 2];

      let totalR = 0, totalG = 0, totalB = 0;
      let count = 0;

      // 3x3 neighbor edge test
      for (let cy = -1; cy <= 1; cy++) {
        for (let cx = -1; cx <= 1; cx++) {
          const idx = ((y + cy) * w + (x + cx)) * 4;
          const r = src[idx];
          const g = src[idx + 1];
          const b = src[idx + 2];
          const diff = Math.abs(r - cR) + Math.abs(g - cG) + Math.abs(b - cB);

          // Only average with neighbors that don't cross a high-contrast edge
          if (diff <= threshold * 3) {
            totalR += r;
            totalG += g;
            totalB += b;
            count++;
          }
        }
      }

      dst[centerIdx] = count > 0 ? Math.round(totalR / count) : cR;
      dst[centerIdx + 1] = count > 0 ? Math.round(totalG / count) : cG;
      dst[centerIdx + 2] = count > 0 ? Math.round(totalB / count) : cB;
      dst[centerIdx + 3] = src[centerIdx + 3];
    }
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * 70.1 Image Upscaler (2x, 4x, custom) with bicubic sampling and edge restoration
 */
export function upscaleCanvas(sourceCanvas: HTMLCanvasElement, scale: number = 2): HTMLCanvasElement {
  const targetW = Math.round(sourceCanvas.width * scale);
  const targetH = Math.round(sourceCanvas.height * scale);

  const destCanvas = document.createElement('canvas');
  destCanvas.width = targetW;
  destCanvas.height = targetH;
  const ctx = destCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceCanvas, 0, 0, targetW, targetH);

  // Apply subtle clarity sharpening to prevent blurry interpolation
  applyUnsharpMask(destCanvas, 0.45);

  return destCanvas;
}

/**
 * 70.6 Pixelate / Censor Region (Privacy Redaction burned permanently into canvas)
 */
export function redactRegionOnCanvas(
  canvas: HTMLCanvasElement,
  region: { x: number; y: number; width: number; height: number },
  mode: 'pixelate' | 'blur' | 'black' | 'white' = 'pixelate',
  pixelSize: number = 16
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rx = Math.max(0, Math.round(region.x));
  const ry = Math.max(0, Math.round(region.y));
  const rw = Math.min(canvas.width - rx, Math.round(region.width));
  const rh = Math.min(canvas.height - ry, Math.round(region.height));

  if (rw <= 0 || rh <= 0) return;

  if (mode === 'black') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(rx, ry, rw, rh);
  } else if (mode === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rx, ry, rw, rh);
  } else if (mode === 'pixelate') {
    // Read sub-image
    const imgData = ctx.getImageData(rx, ry, rw, rh);
    const data = imgData.data;
    const pSize = Math.max(4, pixelSize);

    for (let py = 0; py < rh; py += pSize) {
      for (let px = 0; px < rw; px += pSize) {
        let r = 0, g = 0, b = 0, a = 0;
        let count = 0;

        for (let subY = 0; subY < pSize && py + subY < rh; subY++) {
          for (let subX = 0; subX < pSize && px + subX < rw; subX++) {
            const idx = ((py + subY) * rw + (px + subX)) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            a += data[idx + 3];
            count++;
          }
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        a = Math.round(a / count);

        for (let subY = 0; subY < pSize && py + subY < rh; subY++) {
          for (let subX = 0; subX < pSize && px + subX < rw; subX++) {
            const idx = ((py + subY) * rw + (px + subX)) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = a;
          }
        }
      }
    }
    ctx.putImageData(imgData, rx, ry);
  } else if (mode === 'blur') {
    // Regional heavy blur
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = rw;
    tempCanvas.height = rh;
    const tCtx = tempCanvas.getContext('2d');
    if (tCtx) {
      tCtx.drawImage(canvas, rx, ry, rw, rh, 0, 0, rw, rh);
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.filter = 'blur(16px)';
      ctx.drawImage(tempCanvas, rx, ry, rw, rh);
      ctx.restore();
    }
  }
}

/**
 * 70.8 Color Palette Extractor: extracts top 6 representative colors with prominence
 */
export function extractColorPalette(canvas: HTMLCanvasElement): PaletteColor[] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Quantize RGB into 4-bit buckets
  const colorBuckets: { [key: string]: { r: number; g: number; b: number; count: number } } = {};
  let totalSampled = 0;

  // Sample every 8th pixel
  for (let i = 0; i < data.length; i += 32) {
    const a = data[i + 3];
    if (a < 50) continue; // skip transparent pixels

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const qr = Math.floor(r / 32) * 32;
    const qg = Math.floor(g / 32) * 32;
    const qb = Math.floor(b / 32) * 32;
    const key = `${qr}_${qg}_${qb}`;

    if (!colorBuckets[key]) {
      colorBuckets[key] = { r: qr, g: qg, b: qb, count: 0 };
    }
    colorBuckets[key].count++;
    totalSampled++;
  }

  const sorted = Object.values(colorBuckets)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return sorted.map((c) => {
    const hex =
      '#' +
      [c.r, c.g, c.b]
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('');
    return {
      hex,
      rgb: [c.r, c.g, c.b],
      percent: Math.max(1, Math.round((c.count / Math.max(1, totalSampled)) * 100)),
    };
  });
}

/**
 * 70.9 Image Color Replacer
 */
export function replaceColorOnCanvas(
  canvas: HTMLCanvasElement,
  sourceRgb: [number, number, number],
  targetRgb: [number, number, number],
  tolerance: number = 30
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  const tolSquared = tolerance * tolerance * 3;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const distSq = (r - sourceRgb[0]) ** 2 + (g - sourceRgb[1]) ** 2 + (b - sourceRgb[2]) ** 2;
    if (distSq <= tolSquared) {
      // Smooth blend factor towards edges of tolerance
      const factor = 1 - Math.sqrt(distSq) / (tolerance * Math.sqrt(3));
      data[i] = Math.round(r * (1 - factor) + targetRgb[0] * factor);
      data[i + 1] = Math.round(g * (1 - factor) + targetRgb[1] * factor);
      data[i + 2] = Math.round(b * (1 - factor) + targetRgb[2] * factor);
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * 70.27 Print Preparation Calculator
 */
export function calculatePrintInfo(width: number, height: number): DpiPrintInfo {
  const dpi300W = +(width / 300).toFixed(1);
  const dpi300H = +(height / 300).toFixed(1);
  const dpi300Wcm = +(dpi300W * 2.54).toFixed(1);
  const dpi300Hcm = +(dpi300H * 2.54).toFixed(1);

  let rating: DpiPrintInfo['rating'] = 'Exhibition Quality';
  if (width < 1200 || height < 800) {
    rating = 'Low Resolution Warning';
  } else if (width < 2400 || height < 1600) {
    rating = 'Standard Print';
  }

  const recommendedMaxPrint = `${dpi300W}" × ${dpi300H}" (${dpi300Wcm} × ${dpi300Hcm} cm)`;

  return {
    dpi300WidthInches: dpi300W,
    dpi300HeightInches: dpi300H,
    dpi300WidthCm: dpi300Wcm,
    dpi300HeightCm: dpi300Hcm,
    rating,
    recommendedMaxPrint,
  };
}

/**
 * 70.28 Perceptual Image Fingerprint (dHash) for Duplicate Detection
 */
export function computePerceptualHash(canvas: HTMLCanvasElement): string {
  const smallCanvas = document.createElement('canvas');
  smallCanvas.width = 9;
  smallCanvas.height = 8;
  const sCtx = smallCanvas.getContext('2d');
  if (!sCtx) return '0000000000000000';

  sCtx.drawImage(canvas, 0, 0, 9, 8);
  const imgData = sCtx.getImageData(0, 0, 9, 8).data;

  let hash = '';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const leftIdx = (row * 9 + col) * 4;
      const rightIdx = (row * 9 + col + 1) * 4;

      const leftLum = 0.299 * imgData[leftIdx] + 0.587 * imgData[leftIdx + 1] + 0.114 * imgData[leftIdx + 2];
      const rightLum = 0.299 * imgData[rightIdx] + 0.587 * imgData[rightIdx + 1] + 0.114 * imgData[rightIdx + 2];

      hash += leftLum > rightLum ? '1' : '0';
    }
  }

  return hash;
}

/**
 * Calculate Hamming Distance between two 64-bit dHash strings (≤10 = likely duplicate)
 */
export function isDuplicateHash(hashA: string, hashB: string, threshold = 8): boolean {
  if (hashA.length !== hashB.length) return false;
  let dist = 0;
  for (let i = 0; i < hashA.length; i++) {
    if (hashA[i] !== hashB[i]) dist++;
  }
  return dist <= threshold;
}

/**
 * 70.31 Copy Canvas to Clipboard with automatic fallback
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return resolve(false);
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          resolve(true);
        } else {
          resolve(false);
        }
      } catch {
        resolve(false);
      }
    }, 'image/png');
  });
}
