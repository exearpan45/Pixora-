import {
  BackgroundSettings,
  CensorArea,
  CropArea,
  FilterPreset,
  ImageAdjustments,
  ShapeLayer,
  TextLayer,
  WatermarkSettings,
} from '../types';

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  temperature: 0,
  tint: 0,
  sharpness: 0,
  blur: 0,
  vignette: 0,
  noiseReduction: 0,
};

export const DEFAULT_WATERMARK: WatermarkSettings = {
  enabled: false,
  type: 'text',
  text: 'Pixora',
  position: 'bottom-right',
  customX: 85,
  customY: 85,
  opacity: 0.75,
  size: 32,
  rotation: 0,
  color: '#ffffff',
  fontFamily: 'Plus Jakarta Sans',
  hasShadow: true,
  shadowColor: 'rgba(0, 0, 0, 0.8)',
  hasOutline: false,
  outlineColor: '#000000',
  hasPill: false,
  pillColor: 'rgba(0, 0, 0, 0.55)',
  style: 'shadow',
};

export const DEFAULT_BACKGROUND: BackgroundSettings = {
  mode: 'original',
  color: '#ffffff',
  blurAmount: 15,
  tolerance: 35,
  edgeSmoothing: 2,
};

/**
 * Format bytes to readable string (e.g. 1.2 MB, 450 KB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Load an image from URL or File/Blob safely.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image. Check format or file integrity.'));
    img.src = src;
  });
}

/**
 * Applies 3x3 convolution kernel (e.g. for Sharpness)
 */
function applyConvolution(ctx: CanvasRenderingContext2D, width: number, height: number, weights: number[]) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;

  const w = width;
  const h = height;

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
      dst[dstIdx + 3] = src[dstIdx + 3]; // Preserve alpha
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
 * Pixel-level manipulation for Color Adjustments & Filters
 */
export function applyPixelAdjustments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  adj: ImageAdjustments,
  filter: FilterPreset
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const len = data.length;

  const brightness = adj.brightness * 1.5; // -150 to 150
  const contrastFactor = (259 * (adj.contrast + 100)) / (100 * (259 - adj.contrast));
  const exposureMult = Math.pow(2, adj.exposure / 50); // exposure multiplier
  const saturationMult = 1 + adj.saturation / 100;
  const temp = adj.temperature; // -100 (cool) to 100 (warm)
  const tint = adj.tint; // -100 (green) to 100 (magenta)

  // Vignette pre-calc
  const cx = width / 2;
  const cy = height / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);
  const vignetteAmt = adj.vignette / 100;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Exposure
    if (adj.exposure !== 0) {
      r *= exposureMult;
      g *= exposureMult;
      b *= exposureMult;
    }

    // Brightness
    if (adj.brightness !== 0) {
      r += brightness;
      g += brightness;
      b += brightness;
    }

    // Contrast
    if (adj.contrast !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    // Temperature (Red/Blue balance) & Tint (Green/Magenta balance)
    if (temp !== 0) {
      r += temp * 0.6;
      b -= temp * 0.6;
    }
    if (tint !== 0) {
      g -= tint * 0.5;
      r += tint * 0.3;
      b += tint * 0.3;
    }

    // Saturation
    if (adj.saturation !== 0) {
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * saturationMult;
      g = gray + (g - gray) * saturationMult;
      b = gray + (b - gray) * saturationMult;
    }

    // Filter presets
    if (filter !== 'none') {
      if (filter === 'monochrome') {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray;
        g = gray;
        b = gray;
      } else if (filter === 'sepia') {
        const tr = 0.393 * r + 0.769 * g + 0.189 * b;
        const tg = 0.349 * r + 0.686 * g + 0.168 * b;
        const tb = 0.272 * r + 0.534 * g + 0.131 * b;
        r = tr;
        g = tg;
        b = tb;
      } else if (filter === 'warm_golden') {
        r *= 1.15;
        g *= 1.05;
        b *= 0.88;
      } else if (filter === 'cool_cyan') {
        r *= 0.88;
        g *= 1.05;
        b *= 1.2;
      } else if (filter === 'cinematic') {
        r = r * 1.1 - 10;
        b = b * 1.15;
        g = g * 0.98;
      } else if (filter === 'vintage') {
        r = r * 1.1 + 15;
        g = g * 0.95 + 10;
        b = b * 0.85 + 5;
      } else if (filter === 'dramatic') {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        r = lum > 128 ? r * 1.25 : r * 0.8;
        g = lum > 128 ? g * 1.25 : g * 0.8;
        b = lum > 128 ? b * 1.25 : b * 0.8;
      } else if (filter === 'emerald') {
        r *= 0.85;
        g *= 1.2;
        b *= 0.95;
      } else if (filter === 'high_contrast') {
        const f = 1.35;
        r = f * (r - 128) + 128;
        g = f * (g - 128) + 128;
        b = f * (b - 128) + 128;
      } else if (filter === 'natural') {
        r = r * 1.04;
        g = g * 1.04;
        b = b * 1.02;
      }
    }

    // Vignette
    if (vignetteAmt > 0) {
      const px = (i / 4) % width;
      const py = Math.floor(i / 4 / width);
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = 1 - Math.pow(dist / maxDist, 2) * vignetteAmt;
      r *= factor;
      g *= factor;
      b *= factor;
    }

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  ctx.putImageData(imgData, 0, 0);

  // Sharpness via convolution
  if (adj.sharpness > 0) {
    const s = (adj.sharpness / 100) * 1.5;
    const weights = [
      0, -s, 0,
      -s, 1 + 4 * s, -s,
      0, -s, 0,
    ];
    applyConvolution(ctx, width, height, weights);
  }
}

/**
 * Smart Background processing (Chroma/Tolerance keying, Color fill, or Blur)
 */
export function processBackground(
  canvas: HTMLCanvasElement,
  settings: BackgroundSettings
) {
  if (settings.mode === 'original') return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const width = canvas.width;
  const height = canvas.height;

  // For transparent / color / blur background removal:
  // Detect corner samples as dominant background seed (top-left, top-right, bottom-left, bottom-right)
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample corner colors
  const samplePoints = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];

  let bgR = 0, bgG = 0, bgB = 0;
  samplePoints.forEach(([x, y]) => {
    const idx = (y * width + x) * 4;
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
  });
  bgR /= samplePoints.length;
  bgG /= samplePoints.length;
  bgB /= samplePoints.length;

  const tol = settings.tolerance * 2.5;

  // Create mask
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const diff = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
    if (diff < tol) {
      mask[i / 4] = 0; // Background
    } else {
      mask[i / 4] = 255; // Foreground
    }
  }

  if (settings.mode === 'transparent') {
    for (let i = 0; i < data.length; i += 4) {
      if (mask[i / 4] === 0) {
        data[i + 3] = 0; // Alpha 0
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } else if (settings.mode === 'color') {
    // Fill background with chosen hex color
    const hex = settings.color.replace('#', '');
    const fillR = parseInt(hex.substring(0, 2), 16) || 255;
    const fillG = parseInt(hex.substring(2, 4), 16) || 255;
    const fillB = parseInt(hex.substring(4, 6), 16) || 255;

    for (let i = 0; i < data.length; i += 4) {
      if (mask[i / 4] === 0) {
        data[i] = fillR;
        data[i + 1] = fillG;
        data[i + 2] = fillB;
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } else if (settings.mode === 'blur') {
    // Create blurred copy and composite masked foreground
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.filter = `blur(${Math.max(4, settings.blurAmount)}px)`;
    tempCtx.drawImage(canvas, 0, 0);

    const blurredData = tempCtx.getImageData(0, 0, width, height).data;
    for (let i = 0; i < data.length; i += 4) {
      if (mask[i / 4] === 0) {
        data[i] = blurredData[i];
        data[i + 1] = blurredData[i + 1];
        data[i + 2] = blurredData[i + 2];
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }
}

/**
 * Render text layers onto canvas
 */
export function renderTextLayers(
  ctx: CanvasRenderingContext2D,
  layers: TextLayer[],
  width: number,
  height: number
) {
  layers.forEach((layer) => {
    ctx.save();
    const x = (layer.x / 100) * width;
    const y = (layer.y / 100) * height;
    const scaleFactor = width / 1000;
    const fontSize = Math.max(12, Math.round(layer.fontSize * scaleFactor));

    ctx.font = `${layer.fontWeight === '800' ? '800' : layer.fontWeight === '600' ? '600' : 'normal'} ${fontSize}px ${layer.fontFamily}, sans-serif`;
    ctx.fillStyle = layer.color;
    ctx.textAlign = layer.textAlign;
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = layer.opacity;

    if (layer.hasShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 8 * scaleFactor;
      ctx.shadowOffsetX = 2 * scaleFactor;
      ctx.shadowOffsetY = 3 * scaleFactor;
    }

    if (layer.backgroundColor) {
      const metrics = ctx.measureText(layer.text);
      const textWidth = metrics.width;
      const textHeight = fontSize * 1.2;
      let bgX = x;
      if (layer.textAlign === 'center') bgX = x - textWidth / 2;
      else if (layer.textAlign === 'right') bgX = x - textWidth;

      ctx.fillStyle = layer.backgroundColor;
      ctx.fillRect(bgX - 8, y - textHeight / 2, textWidth + 16, textHeight);
      ctx.fillStyle = layer.color;
    }

    ctx.fillText(layer.text, x, y);
    ctx.restore();
  });
}

/**
 * Render shape layers onto canvas
 */
export function renderShapeLayers(
  ctx: CanvasRenderingContext2D,
  shapes: ShapeLayer[],
  width: number,
  height: number
) {
  shapes.forEach((shape) => {
    ctx.save();
    const x = (shape.x / 100) * width;
    const y = (shape.y / 100) * height;
    const w = (shape.width / 100) * width;
    const h = (shape.height / 100) * height;

    ctx.globalAlpha = shape.opacity;
    ctx.fillStyle = shape.fillColor;
    ctx.strokeStyle = shape.strokeColor;
    ctx.lineWidth = shape.strokeWidth;

    if (shape.type === 'rectangle') {
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, w, h, 8) : ctx.rect(x, y, w, h);
      ctx.fill();
      if (shape.strokeWidth > 0) ctx.stroke();
    } else if (shape.type === 'circle') {
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 2 * Math.PI);
      ctx.fill();
      if (shape.strokeWidth > 0) ctx.stroke();
    } else if (shape.type === 'arrow' || shape.type === 'line') {
      ctx.beginPath();
      ctx.moveTo(x, y + h / 2);
      ctx.lineTo(x + w, y + h / 2);
      ctx.stroke();
      if (shape.type === 'arrow') {
        const headlen = 16;
        const angle = 0;
        ctx.beginPath();
        ctx.moveTo(x + w, y + h / 2);
        ctx.lineTo(x + w - headlen * Math.cos(angle - Math.PI / 6), y + h / 2 - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x + w - headlen * Math.cos(angle + Math.PI / 6), y + h / 2 - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = shape.strokeColor;
        ctx.fill();
      }
    }
    ctx.restore();
  });
}

// In-memory cache for watermark logo images to avoid repeated network/blob decoding
const watermarkImageCache = new Map<string, HTMLImageElement>();

export async function getWatermarkImage(src: string): Promise<HTMLImageElement> {
  const cached = watermarkImageCache.get(src);
  if (cached && cached.complete && (cached.naturalWidth > 0 || cached.width > 0)) {
    return cached;
  }
  const img = await loadImage(src);
  watermarkImageCache.set(src, img);
  return img;
}

/**
 * Render Watermark onto canvas with high contrast, crisp font metrics, shadow & tiling
 */
export async function renderWatermark(
  ctx: CanvasRenderingContext2D,
  watermark: WatermarkSettings,
  width: number,
  height: number
) {
  if (!watermark.enabled) return;

  ctx.save();
  ctx.globalAlpha = Math.max(0.05, Math.min(1, watermark.opacity));

  const scaleFactor = Math.max(0.4, Math.min(width, height) / 900);
  const fontSize = Math.max(16, Math.round(watermark.size * scaleFactor * 1.25));
  const fontFam = watermark.fontFamily || 'Plus Jakarta Sans';
  const padding = Math.max(16, Math.round(24 * scaleFactor));

  if (watermark.type === 'text') {
    const text = watermark.text || 'Pixora';
    ctx.font = `600 ${fontSize}px "${fontFam}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize;

    let x = width / 2;
    let y = height / 2;
    let align: CanvasTextAlign = 'center';
    let baseline: CanvasTextBaseline = 'middle';

    if (watermark.position === 'top-left') {
      x = padding;
      y = padding;
      align = 'left';
      baseline = 'top';
    } else if (watermark.position === 'top-right') {
      x = width - padding;
      y = padding;
      align = 'right';
      baseline = 'top';
    } else if (watermark.position === 'bottom-left') {
      x = padding;
      y = height - padding;
      align = 'left';
      baseline = 'bottom';
    } else if (watermark.position === 'bottom-right') {
      x = width - padding;
      y = height - padding;
      align = 'right';
      baseline = 'bottom';
    } else if (watermark.position === 'custom') {
      x = (Math.max(0, Math.min(100, watermark.customX)) / 100) * width;
      y = (Math.max(0, Math.min(100, watermark.customY)) / 100) * height;
      align = 'center';
      baseline = 'middle';
    } else if (watermark.position === 'center') {
      x = width / 2;
      y = height / 2;
      align = 'center';
      baseline = 'middle';
    }

    const drawSingleText = (drawX: number, drawY: number, drawAlign: CanvasTextAlign, drawBaseline: CanvasTextBaseline) => {
      ctx.textAlign = drawAlign;
      ctx.textBaseline = drawBaseline;

      // Draw Badge Pill Background if enabled
      if (watermark.hasPill || watermark.style === 'badge') {
        ctx.save();
        ctx.fillStyle = watermark.pillColor || 'rgba(0, 0, 0, 0.6)';
        const padX = Math.round(12 * scaleFactor);
        const padY = Math.round(6 * scaleFactor);
        const pillW = textWidth + padX * 2;
        const pillH = textHeight + padY * 2;
        let pillX = drawX - padX;
        let pillY = drawY - padY;

        if (drawAlign === 'center') pillX = drawX - pillW / 2;
        else if (drawAlign === 'right') pillX = drawX - textWidth - padX;

        if (drawBaseline === 'middle') pillY = drawY - pillH / 2;
        else if (drawBaseline === 'bottom') pillY = drawY - textHeight - padY;

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(pillX, pillY, pillW, pillH, Math.round(8 * scaleFactor));
        } else {
          ctx.rect(pillX, pillY, pillW, pillH);
        }
        ctx.fill();
        ctx.restore();
      }

      // Drop shadow for crisp contrast on bright/textured photos
      const useShadow = watermark.hasShadow ?? true;
      if (useShadow) {
        ctx.shadowColor = watermark.shadowColor || 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = Math.max(3, Math.round(4 * scaleFactor));
        ctx.shadowOffsetX = Math.max(1, Math.round(1.5 * scaleFactor));
        ctx.shadowOffsetY = Math.max(1, Math.round(1.5 * scaleFactor));
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      // Optional text outline
      if (watermark.hasOutline || watermark.style === 'outline') {
        ctx.strokeStyle = watermark.outlineColor || 'rgba(0, 0, 0, 0.9)';
        ctx.lineWidth = Math.max(2, Math.round(3 * scaleFactor));
        ctx.strokeText(text, drawX, drawY);
      }

      ctx.fillStyle = watermark.color || '#ffffff';
      ctx.fillText(text, drawX, drawY);
    };

    if (watermark.position === 'tile') {
      const stepX = Math.max(160, Math.round((textWidth + 80) * 1.2));
      const stepY = Math.max(100, Math.round(textHeight * 3.5 + 40));
      const angle = (watermark.rotation !== 0 ? watermark.rotation : -25) * (Math.PI / 180);

      for (let tx = -stepX; tx <= width + stepX * 2; tx += stepX) {
        for (let ty = -stepY; ty <= height + stepY * 2; ty += stepY) {
          ctx.save();
          ctx.translate(tx, ty);
          ctx.rotate(angle);
          drawSingleText(0, 0, 'center', 'middle');
          ctx.restore();
        }
      }
    } else {
      ctx.save();
      ctx.translate(x, y);
      if (watermark.rotation !== 0) {
        ctx.rotate((watermark.rotation * Math.PI) / 180);
      }
      drawSingleText(0, 0, align, baseline);
      ctx.restore();
    }
  } else if (watermark.type === 'image' && watermark.imageUrl) {
    try {
      const wmImg = await getWatermarkImage(watermark.imageUrl);
      const imgNaturalW = wmImg.naturalWidth || wmImg.width || 100;
      const imgNaturalH = wmImg.naturalHeight || wmImg.height || 100;
      const aspect = imgNaturalW / imgNaturalH;

      // Scale proportionally relative to canvas short edge
      const targetSize = (Math.min(width, height) * (watermark.size / 100));
      let wmWidth = targetSize;
      let wmHeight = targetSize / aspect;
      if (aspect < 1) {
        wmHeight = targetSize;
        wmWidth = targetSize * aspect;
      }

      let cx = width / 2;
      let cy = height / 2;

      if (watermark.position === 'top-left') {
        cx = padding + wmWidth / 2;
        cy = padding + wmHeight / 2;
      } else if (watermark.position === 'top-right') {
        cx = width - padding - wmWidth / 2;
        cy = padding + wmHeight / 2;
      } else if (watermark.position === 'bottom-left') {
        cx = padding + wmWidth / 2;
        cy = height - padding - wmHeight / 2;
      } else if (watermark.position === 'bottom-right') {
        cx = width - padding - wmWidth / 2;
        cy = height - padding - wmHeight / 2;
      } else if (watermark.position === 'custom') {
        cx = (Math.max(0, Math.min(100, watermark.customX)) / 100) * width;
        cy = (Math.max(0, Math.min(100, watermark.customY)) / 100) * height;
      } else if (watermark.position === 'center') {
        cx = width / 2;
        cy = height / 2;
      }

      const drawSingleImage = (dx: number, dy: number) => {
        ctx.save();
        ctx.translate(dx, dy);
        if (watermark.rotation !== 0) {
          ctx.rotate((watermark.rotation * Math.PI) / 180);
        }
        if (watermark.hasShadow ?? true) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = Math.max(4, Math.round(6 * scaleFactor));
          ctx.shadowOffsetX = Math.max(1, Math.round(2 * scaleFactor));
          ctx.shadowOffsetY = Math.max(1, Math.round(2 * scaleFactor));
        }
        ctx.drawImage(wmImg, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
        ctx.restore();
      };

      if (watermark.position === 'tile') {
        const stepX = Math.max(140, Math.round(wmWidth * 1.8));
        const stepY = Math.max(120, Math.round(wmHeight * 1.8));
        for (let tx = -stepX; tx <= width + stepX * 2; tx += stepX) {
          for (let ty = -stepY; ty <= height + stepY * 2; ty += stepY) {
            drawSingleImage(tx, ty);
          }
        }
      } else {
        drawSingleImage(cx, cy);
      }
    } catch (err) {
      console.warn('Watermark image failed to render:', err);
    }
  }

  ctx.restore();
}

/**
 * 70.2 AUTO ENHANCE: Real histogram equalization, contrast stretch, and subtle vibrance
 */
export function applyAutoEnhance(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;
  const totalPixels = width * height;

  // Build luminance histogram
  const hist = new Uint32Array(256);
  for (let i = 0; i < d.length; i += 4) {
    const lum = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    hist[lum]++;
  }

  // Find 1% low and 99% high thresholds to avoid outliers/noise
  const lowClip = Math.floor(totalPixels * 0.015);
  const highClip = Math.floor(totalPixels * 0.985);

  let cum = 0;
  let minLum = 0;
  let maxLum = 255;

  for (let i = 0; i < 256; i++) {
    cum += hist[i];
    if (cum >= lowClip && minLum === 0) {
      minLum = i;
    }
    if (cum >= highClip) {
      maxLum = i;
      break;
    }
  }

  if (maxLum <= minLum) {
    maxLum = 255;
    minLum = 0;
  }

  const range = maxLum - minLum;
  const stretchFactor = 255 / (range || 1);

  // Apply contrast stretch and slight vibrance boost
  for (let i = 0; i < d.length; i += 4) {
    let r = (d[i] - minLum) * stretchFactor;
    let g = (d[i + 1] - minLum) * stretchFactor;
    let b = (d[i + 2] - minLum) * stretchFactor;

    // Vibrance / mild saturation
    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    const sat = (maxVal - minVal) / (maxVal || 1);
    const vibranceAmount = (1 - sat) * 0.18; // Boost lower-saturated colors more

    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = r + (r - gray) * vibranceAmount;
    g = g + (g - gray) * vibranceAmount;
    b = b + (b - gray) * vibranceAmount;

    d[i] = Math.min(255, Math.max(0, r));
    d[i + 1] = Math.min(255, Math.max(0, g));
    d[i + 2] = Math.min(255, Math.max(0, b));
  }

  ctx.putImageData(imgData, 0, 0);

  // Subtle edge sharpening pass (unsharp mask)
  const sharpenWeights = [
    0, -0.25, 0,
    -0.25, 2.0, -0.25,
    0, -0.25, 0,
  ];
  applyConvolution(ctx, width, height, sharpenWeights);
}

/**
 * 70.3 DENOISE: Edge-preserving adaptive smoothing
 */
export function applyDenoise(ctx: CanvasRenderingContext2D, width: number, height: number, intensity: 'low' | 'medium' | 'high' | number) {
  const threshold = typeof intensity === 'number'
    ? intensity
    : intensity === 'low' ? 18 : intensity === 'medium' ? 32 : 55;

  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const centerR = src[idx];
      const centerG = src[idx + 1];
      const centerB = src[idx + 2];

      let sumR = centerR;
      let sumG = centerG;
      let sumB = centerB;
      let count = 1;

      // 3x3 neighborhood with edge preservation threshold
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          const nr = src[nIdx];
          const ng = src[nIdx + 1];
          const nb = src[nIdx + 2];

          const diff = Math.abs(nr - centerR) + Math.abs(ng - centerG) + Math.abs(nb - centerB);
          if (diff <= threshold * 3) {
            sumR += nr;
            sumG += ng;
            sumB += nb;
            count++;
          }
        }
      }

      dst[idx] = Math.round(sumR / count);
      dst[idx + 1] = Math.round(sumG / count);
      dst[idx + 2] = Math.round(sumB / count);
      dst[idx + 3] = src[idx + 3];
    }
  }

  // Copy borders
  for (let x = 0; x < width; x++) {
    const topIdx = x * 4;
    const botIdx = ((height - 1) * width + x) * 4;
    for (let c = 0; c < 4; c++) {
      dst[topIdx + c] = src[topIdx + c];
      dst[botIdx + c] = src[botIdx + c];
    }
  }
  for (let y = 0; y < height; y++) {
    const leftIdx = (y * width) * 4;
    const rightIdx = (y * width + width - 1) * 4;
    for (let c = 0; c < 4; c++) {
      dst[leftIdx + c] = src[leftIdx + c];
      dst[rightIdx + c] = src[rightIdx + c];
    }
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * 70.4 SHARPENER: Tunable unsharp mask with Amount, Radius, and Threshold
 */
export function applyTunableSharpen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number, // 0 to 100
  threshold = 5 // 0 to 50
) {
  if (amount <= 0) return;
  const s = (amount / 100) * 1.8;
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const centerR = src[idx];
      const centerG = src[idx + 1];
      const centerB = src[idx + 2];

      const upIdx = ((y - 1) * width + x) * 4;
      const downIdx = ((y + 1) * width + x) * 4;
      const leftIdx = (y * width + (x - 1)) * 4;
      const rightIdx = (y * width + (x + 1)) * 4;

      const avgR = (src[upIdx] + src[downIdx] + src[leftIdx] + src[rightIdx]) / 4;
      const avgG = (src[upIdx + 1] + src[downIdx + 1] + src[leftIdx + 1] + src[rightIdx + 1]) / 4;
      const avgB = (src[upIdx + 2] + src[downIdx + 2] + src[leftIdx + 2] + src[rightIdx + 2]) / 4;

      const diffR = centerR - avgR;
      const diffG = centerG - avgG;
      const diffB = centerB - avgB;

      if (Math.abs(diffR) > threshold) {
        dst[idx] = Math.min(255, Math.max(0, centerR + diffR * s));
      } else {
        dst[idx] = centerR;
      }

      if (Math.abs(diffG) > threshold) {
        dst[idx + 1] = Math.min(255, Math.max(0, centerG + diffG * s));
      } else {
        dst[idx + 1] = centerG;
      }

      if (Math.abs(diffB) > threshold) {
        dst[idx + 2] = Math.min(255, Math.max(0, centerB + diffB * s));
      } else {
        dst[idx + 2] = centerB;
      }

      dst[idx + 3] = src[idx + 3];
    }
  }

  // Copy borders
  for (let x = 0; x < width; x++) {
    const topIdx = x * 4;
    const botIdx = ((height - 1) * width + x) * 4;
    for (let c = 0; c < 4; c++) {
      dst[topIdx + c] = src[topIdx + c];
      dst[botIdx + c] = src[botIdx + c];
    }
  }
  for (let y = 0; y < height; y++) {
    const leftIdx = (y * width) * 4;
    const rightIdx = (y * width + width - 1) * 4;
    for (let c = 0; c < 4; c++) {
      dst[leftIdx + c] = src[leftIdx + c];
      dst[rightIdx + c] = src[rightIdx + c];
    }
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * 70.6 CENSOR & REDACTION: Permanent Pixelate, Blur, and Solid Blackout/Whiteout
 */
export function applyCensorRedactions(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  areas: Array<{
    type: 'pixelate' | 'blur' | 'blackout' | 'whiteout';
    x: number; // %
    y: number; // %
    width: number; // %
    height: number; // %
    blockSize: number;
  }>
) {
  if (!areas || areas.length === 0) return;

  for (const area of areas) {
    const startX = Math.max(0, Math.floor((area.x / 100) * width));
    const startY = Math.max(0, Math.floor((area.y / 100) * height));
    const rectW = Math.min(width - startX, Math.ceil((area.width / 100) * width));
    const rectH = Math.min(height - startY, Math.ceil((area.height / 100) * height));

    if (rectW <= 0 || rectH <= 0) continue;

    if (area.type === 'blackout') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(startX, startY, rectW, rectH);
    } else if (area.type === 'whiteout') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(startX, startY, rectW, rectH);
    } else if (area.type === 'pixelate') {
      const blockSize = Math.max(4, area.blockSize || 16);
      const imgData = ctx.getImageData(startX, startY, rectW, rectH);
      const data = imgData.data;

      for (let by = 0; by < rectH; by += blockSize) {
        for (let bx = 0; bx < rectW; bx += blockSize) {
          const bw = Math.min(blockSize, rectW - bx);
          const bh = Math.min(blockSize, rectH - by);

          let totalR = 0, totalG = 0, totalB = 0, count = 0;
          for (let py = 0; py < bh; py++) {
            for (let px = 0; px < bw; px++) {
              const idx = ((by + py) * rectW + (bx + px)) * 4;
              totalR += data[idx];
              totalG += data[idx + 1];
              totalB += data[idx + 2];
              count++;
            }
          }

          const avgR = Math.round(totalR / count);
          const avgG = Math.round(totalG / count);
          const avgB = Math.round(totalB / count);

          for (let py = 0; py < bh; py++) {
            for (let px = 0; px < bw; px++) {
              const idx = ((by + py) * rectW + (bx + px)) * 4;
              data[idx] = avgR;
              data[idx + 1] = avgG;
              data[idx + 2] = avgB;
            }
          }
        }
      }
      ctx.putImageData(imgData, startX, startY);
    } else if (area.type === 'blur') {
      // Fast repeated box-blur
      const passes = 3;
      const radius = Math.max(3, Math.min(25, area.blockSize || 12));
      const imgData = ctx.getImageData(startX, startY, rectW, rectH);
      const data = imgData.data;

      for (let p = 0; p < passes; p++) {
        for (let y = 0; y < rectH; y++) {
          for (let x = 0; x < rectW; x++) {
            let r = 0, g = 0, b = 0, c = 0;
            for (let dx = -radius; dx <= radius; dx += 2) {
              const nx = Math.min(rectW - 1, Math.max(0, x + dx));
              const idx = (y * rectW + nx) * 4;
              r += data[idx];
              g += data[idx + 1];
              b += data[idx + 2];
              c++;
            }
            const oIdx = (y * rectW + x) * 4;
            data[oIdx] = Math.round(r / c);
            data[oIdx + 1] = Math.round(g / c);
            data[oIdx + 2] = Math.round(b / c);
          }
        }
      }
      ctx.putImageData(imgData, startX, startY);
    }
  }
}

/**
 * 70.1 IMAGE UPSCALER: High-fidelity bicubic interpolation with detail preservation
 */
export async function upscaleImageCanvas(
  sourceCanvas: HTMLCanvasElement,
  scale: 2 | 4,
  sharpness = 35
): Promise<HTMLCanvasElement> {
  const srcW = sourceCanvas.width;
  const srcH = sourceCanvas.height;
  const targetW = srcW * scale;
  const targetH = srcH * scale;

  const destCanvas = document.createElement('canvas');
  destCanvas.width = targetW;
  destCanvas.height = targetH;
  const destCtx = destCanvas.getContext('2d', { willReadFrequently: true });
  if (!destCtx) throw new Error('Could not create upscaled canvas context');

  // Multi-step progressive upscaling for smoother gradients and edge integrity
  destCtx.imageSmoothingEnabled = true;
  destCtx.imageSmoothingQuality = 'high';

  if (scale === 4) {
    // 2-step upscale: 1x -> 2x -> 4x
    const intermediateCanvas = document.createElement('canvas');
    intermediateCanvas.width = srcW * 2;
    intermediateCanvas.height = srcH * 2;
    const interCtx = intermediateCanvas.getContext('2d');
    if (interCtx) {
      interCtx.imageSmoothingEnabled = true;
      interCtx.imageSmoothingQuality = 'high';
      interCtx.drawImage(sourceCanvas, 0, 0, srcW * 2, srcH * 2);
      destCtx.drawImage(intermediateCanvas, 0, 0, targetW, targetH);
    } else {
      destCtx.drawImage(sourceCanvas, 0, 0, targetW, targetH);
    }
  } else {
    destCtx.drawImage(sourceCanvas, 0, 0, targetW, targetH);
  }

  // Detail sharpening pass to preserve perceived edge sharpness
  if (sharpness > 0) {
    applyTunableSharpen(destCtx, targetW, targetH, sharpness, 4);
  }

  return destCanvas;
}

/**
 * 70.7 & 70.8 COLOR SAMPLER & PALETTE EXTRACTOR
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.min(255, Math.max(0, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl(r: number, g: number, b: number): string {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export function rgbToHsv(r: number, g: number, b: number): string {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `hsv(${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`;
}

export function samplePixelColor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): { hex: string; rgb: string; hsl: string; hsv: string; r: number; g: number; b: number } {
  const pixel = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
  const r = pixel[0];
  const g = pixel[1];
  const b = pixel[2];

  return {
    r,
    g,
    b,
    hex: rgbToHex(r, g, b),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: rgbToHsl(r, g, b),
    hsv: rgbToHsv(r, g, b),
  };
}

export function extractDominantPalette(
  canvas: HTMLCanvasElement,
  colorCount = 6
): Array<{ hex: string; rgb: string; hsl: string; hsv: string; r: number; g: number; b: number; prominence: number }> {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  // Downsample to 120x120 for fast clustering
  const sampleW = 120;
  const sampleH = Math.round((canvas.height / canvas.width) * 120) || 120;
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = sampleW;
  sampleCanvas.height = sampleH;
  const sCtx = sampleCanvas.getContext('2d');
  if (!sCtx) return [];
  sCtx.drawImage(canvas, 0, 0, sampleW, sampleH);

  const imgData = sCtx.getImageData(0, 0, sampleW, sampleH).data;
  const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  let totalSampled = 0;

  // Quantize colors into 16-level buckets
  for (let i = 0; i < imgData.length; i += 4) {
    const a = imgData[i + 3];
    if (a < 128) continue; // Skip transparency

    // Quantize by step 24
    const qr = Math.round(imgData[i] / 24) * 24;
    const qg = Math.round(imgData[i + 1] / 24) * 24;
    const qb = Math.round(imgData[i + 2] / 24) * 24;
    const key = `${qr}_${qg}_${qb}`;

    const existing = colorBuckets.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorBuckets.set(key, { r: qr, g: qg, b: qb, count: 1 });
    }
    totalSampled++;
  }

  // Sort by count descending
  const sorted = Array.from(colorBuckets.values()).sort((a, b) => b.count - a.count);

  // Pick diverse distinct colors
  const selected: Array<{ hex: string; rgb: string; hsl: string; hsv: string; r: number; g: number; b: number; prominence: number }> = [];

  for (const item of sorted) {
    if (selected.length >= colorCount) break;

    // Check Euclidean color distance to already selected colors to ensure variety
    const isTooClose = selected.some((s) => {
      const dr = s.r - item.r;
      const dg = s.g - item.g;
      const db = s.b - item.b;
      return Math.sqrt(dr * dr + dg * dg + db * db) < 36;
    });

    if (!isTooClose || selected.length < 3) {
      const prominence = Math.round((item.count / (totalSampled || 1)) * 100);
      selected.push({
        r: item.r,
        g: item.g,
        b: item.b,
        hex: rgbToHex(item.r, item.g, item.b),
        rgb: `rgb(${item.r}, ${item.g}, ${item.b})`,
        hsl: rgbToHsl(item.r, item.g, item.b),
        hsv: rgbToHsv(item.r, item.g, item.b),
        prominence: Math.max(1, prominence),
      });
    }
  }

  return selected;
}

export interface PipelineRenderParams {
  targetW: number;
  targetH: number;
  drawW: number;
  drawH: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  adjustments: ImageAdjustments;
  filter: FilterPreset;
  background: BackgroundSettings;
  censorAreas: CensorArea[];
  watermark: WatermarkSettings;
  textLayers: TextLayer[];
  shapeLayers: ShapeLayer[];
}

/**
 * Canvas-First Pipeline Rendering:
 * Renders base image and applies watermark directly to the image data buffer FIRST,
 * before applying any geometric transformations, borders, filters, backgrounds, or overlays.
 * This guarantees watermark presence in exported files and preserves layering integrity.
 */
export async function renderCanvasPipelineWithBuffer(
  targetCanvas: HTMLCanvasElement,
  baseImg: HTMLImageElement,
  params: PipelineRenderParams
): Promise<void> {
  // 1. Prepare Primary Image Data Buffer at intrinsic un-transformed resolution
  const imageBuffer = document.createElement('canvas');
  imageBuffer.width = params.drawW;
  imageBuffer.height = params.drawH;
  const bufCtx = imageBuffer.getContext('2d', { willReadFrequently: true });
  if (!bufCtx) return;

  // Draw base image onto buffer
  bufCtx.drawImage(baseImg, 0, 0, params.drawW, params.drawH);

  // 2. CANVAS-FIRST WATERMARK:
  // Apply watermark layers directly to the image data buffer BEFORE any subsequent transformations
  if (params.watermark.enabled) {
    await renderWatermark(bufCtx, params.watermark, params.drawW, params.drawH);
  }

  // 3. Setup Target Canvas Dimensions & Clear
  targetCanvas.width = params.targetW;
  targetCanvas.height = params.targetH;
  const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  ctx.save();
  ctx.clearRect(0, 0, params.targetW, params.targetH);

  // Apply Geometric Transformations (Rotation & Flip) to the watermarked image data buffer
  ctx.translate(params.targetW / 2, params.targetH / 2);
  if (params.rotation !== 0) {
    ctx.rotate((params.rotation * Math.PI) / 180);
  }
  ctx.scale(params.flipH ? -1 : 1, params.flipV ? -1 : 1);
  ctx.drawImage(imageBuffer, -params.drawW / 2, -params.drawH / 2, params.drawW, params.drawH);
  ctx.restore();

  // 4. Rounded Corners & Border Framing
  if (params.borderRadius > 0 || params.borderWidth > 0) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = params.targetW;
    tempCanvas.height = params.targetH;
    const tCtx = tempCanvas.getContext('2d');
    if (tCtx) {
      tCtx.drawImage(targetCanvas, 0, 0);

      ctx.clearRect(0, 0, params.targetW, params.targetH);
      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(
          params.borderWidth,
          params.borderWidth,
          params.targetW - params.borderWidth * 2,
          params.targetH - params.borderWidth * 2,
          params.borderRadius
        );
      } else {
        ctx.rect(
          params.borderWidth,
          params.borderWidth,
          params.targetW - params.borderWidth * 2,
          params.targetH - params.borderWidth * 2
        );
      }
      ctx.clip();
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.restore();

      if (params.borderWidth > 0) {
        ctx.save();
        ctx.strokeStyle = params.borderColor;
        ctx.lineWidth = params.borderWidth;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(
            params.borderWidth / 2,
            params.borderWidth / 2,
            params.targetW - params.borderWidth,
            params.targetH - params.borderWidth,
            params.borderRadius
          );
        } else {
          ctx.rect(
            params.borderWidth / 2,
            params.borderWidth / 2,
            params.targetW - params.borderWidth,
            params.targetH - params.borderWidth
          );
        }
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  // 5. Apply Pixel Adjustments & Filters
  applyPixelAdjustments(ctx, params.targetW, params.targetH, params.adjustments, params.filter);

  // 6. Apply Background manipulation
  if (params.background.mode !== 'original') {
    processBackground(targetCanvas, params.background);
  }

  // 7. Apply Censor & Redaction areas
  if (params.censorAreas.length > 0) {
    applyCensorRedactions(ctx, params.targetW, params.targetH, params.censorAreas);
  }

  // 8. Apply Text & Shapes
  if (params.textLayers.length > 0) {
    renderTextLayers(ctx, params.textLayers, params.targetW, params.targetH);
  }
  if (params.shapeLayers.length > 0) {
    renderShapeLayers(ctx, params.shapeLayers, params.targetW, params.targetH);
  }
}
