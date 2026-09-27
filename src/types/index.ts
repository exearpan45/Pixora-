export type ToolCategory =
  | 'edit'
  | 'enhance'
  | 'compress'
  | 'convert'
  | 'design'
  | 'background'
  | 'privacy'
  | 'advanced';

export type ActiveTool =
  | 'overview'
  | 'crop'
  | 'resize'
  | 'rotate'
  | 'adjust'
  | 'enhance'
  | 'upscale'
  | 'filters'
  | 'compress'
  | 'convert'
  | 'censor'
  | 'colors'
  | 'frames'
  | 'analyzer'
  | 'pattern_split'
  | 'text'
  | 'shapes'
  | 'watermark'
  | 'background'
  | 'metadata';

export interface SnapshotItem {
  id: string;
  name: string;
  timestamp: number;
  dataUrl: string;
  width: number;
  height: number;
}

export interface CensorArea {
  id: string;
  type: 'pixelate' | 'blur' | 'blackout' | 'whiteout';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  blockSize: number; // 4 to 32 for pixelate, 2 to 25 for blur
}

export interface ColorInfo {
  hex: string;
  rgb: string;
  hsl: string;
  hsv?: string;
  r: number;
  g: number;
  b: number;
  prominence?: number; // %
}

export interface UpscaleOptions {
  scale: 2 | 4;
  sharpness: number;
  denoise: boolean;
}

export type ExportFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  exposure: number; // -100 to 100
  temperature: number; // -100 to 100 (warm vs cool)
  tint: number; // -100 to 100 (magenta vs green)
  sharpness: number; // 0 to 100
  blur: number; // 0 to 30
  vignette: number; // 0 to 100
  noiseReduction: number; // 0 to 100
}

export type FilterPreset =
  | 'none'
  | 'natural'
  | 'cinematic'
  | 'vintage'
  | 'monochrome'
  | 'warm_golden'
  | 'cool_cyan'
  | 'dramatic'
  | 'sepia'
  | 'emerald'
  | 'high_contrast';

export interface CropArea {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  aspectRatio?: number | null; // e.g. 1, 16/9, 4/3, null for freeform
}

export interface TextLayer {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number; // px relative to 1000px width
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | '600' | '800';
  textAlign: 'left' | 'center' | 'right';
  backgroundColor?: string;
  opacity: number; // 0 to 1
  hasShadow: boolean;
}

export interface ShapeLayer {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow' | 'line' | 'badge';
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
}

export interface WatermarkSettings {
  enabled: boolean;
  type: 'text' | 'image';
  text: string;
  imageUrl?: string;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom' | 'tile';
  customX: number; // %
  customY: number; // %
  opacity: number; // 0.1 to 1
  size: number; // 10 to 100
  rotation: number; // -180 to 180
  color: string;
  fontFamily: string;
  hasShadow?: boolean;
  shadowColor?: string;
  hasOutline?: boolean;
  outlineColor?: string;
  hasPill?: boolean;
  pillColor?: string;
  style?: 'shadow' | 'clean' | 'outline' | 'badge';
}

export interface BackgroundSettings {
  mode: 'original' | 'transparent' | 'color' | 'blur' | 'image';
  color: string;
  blurAmount: number; // 0 to 40
  replacementImageUrl?: string;
  tolerance: number; // 5 to 80 for removal
  edgeSmoothing: number; // 1 to 5
}

export interface ExifData {
  make?: string;
  model?: string;
  dateTime?: string;
  exposureTime?: string;
  fNumber?: string;
  isoSpeed?: string;
  focalLength?: string;
  software?: string;
  gpsLatitude?: string;
  gpsLongitude?: string;
  hasMetadata: boolean;
  rawTagsCount: number;
}

export interface ProcessedImageResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  format: string;
}

export interface BatchItem {
  id: string;
  file: File;
  name: string;
  originalSizeBytes: number;
  originalWidth: number;
  originalHeight: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  progress: number;
  errorMessage?: string;
  processedResult?: ProcessedImageResult;
}

export interface HistoryRecord {
  id: string;
  name: string;
  timestamp: number;
  originalSize: number;
  finalSize: number;
  dimensions: string;
  thumbnail: string;
}
