import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ActiveTool,
  BackgroundSettings,
  CensorArea,
  ColorInfo,
  CropArea,
  ExifData,
  ExportFormat,
  FilterPreset,
  ImageAdjustments,
  ProcessedImageResult,
  ShapeLayer,
  TextLayer,
  WatermarkSettings,
} from '../types';
import {
  Undo,
  Redo,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  SplitSquareVertical,
  Download,
  Sparkles,
  Sliders,
  Crop,
  Layers,
  Sun,
  Palette,
  Zap,
  RefreshCw,
  Type,
  Square,
  ShieldCheck,
  RotateCw,
  X,
  Command,
  EyeOff,
  Pipette,
  Stamp,
  Copy,
  Check,
} from 'lucide-react';
import { copyCanvasToClipboard } from '../utils/advancedImageProcessing';
import {
  applyAutoEnhance,
  applyCensorRedactions,
  applyDenoise,
  applyPixelAdjustments,
  DEFAULT_ADJUSTMENTS,
  DEFAULT_BACKGROUND,
  DEFAULT_WATERMARK,
  extractDominantPalette,
  formatBytes,
  loadImage,
  processBackground,
  renderCanvasPipelineWithBuffer,
  renderShapeLayers,
  renderTextLayers,
  renderWatermark,
  samplePixelColor,
  upscaleImageCanvas,
} from '../utils/imageProcessing';
import { smartCompress } from '../utils/compression';
import { stripMetadata } from '../utils/exif';
import { saveRecentHistory } from '../utils/historyDb';
import { AdjustmentsTool } from './tools/AdjustmentsTool';
import { FiltersTool } from './tools/FiltersTool';
import { CropTool } from './tools/CropTool';
import { ResizeTool } from './tools/ResizeTool';
import { CompressTool } from './tools/CompressTool';
import { ConvertTool } from './tools/ConvertTool';
import { RotateTool } from './tools/RotateTool';
import { WatermarkTool } from './tools/WatermarkTool';
import { BackgroundTool } from './tools/BackgroundTool';
import { TextDesignTool } from './tools/TextDesignTool';
import { MetadataTool } from './tools/MetadataTool';
import { EnhanceTool } from './tools/EnhanceTool';
import { CensorTool } from './tools/CensorTool';
import { ColorTool } from './tools/ColorTool';
import { BeforeAfterViewer } from './BeforeAfterViewer';
import { ExportModal } from './ExportModal';
import { QuickFixPanel } from './QuickFixPanel';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';

interface WorkspaceState {
  adjustments: ImageAdjustments;
  filter: FilterPreset;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  watermark: WatermarkSettings;
  background: BackgroundSettings;
  textLayers: TextLayer[];
  shapeLayers: ShapeLayer[];
  censorAreas: CensorArea[];
  width: number;
  height: number;
}

interface ImageWorkspaceProps {
  initialFile?: File;
  initialSrc?: string;
  fileName: string;
  exif: ExifData;
  onStartNew: () => void;
  openQuickFixByDefault?: boolean;
  initialTool?: ActiveTool;
}

export const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({
  initialFile,
  initialSrc,
  fileName,
  exif,
  onStartNew,
  openQuickFixByDefault = false,
  initialTool = 'adjust',
}) => {
  // Canvas elements
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const baseImageRef = useRef<HTMLImageElement | null>(null);

  // Active Tool state
  const [activeTool, setActiveTool] = useState<ActiveTool>(initialTool);
  const [showQuickFix, setShowQuickFix] = useState(openQuickFixByDefault);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [copiedImageSuccess, setCopiedImageSuccess] = useState(false);

  // Sync initialTool prop when navigating from Tools Directory or Footer
  useEffect(() => {
    if (initialTool) {
      setActiveTool(initialTool);
      if (initialTool === 'watermark') {
        setWatermark((prev) => ({ ...prev, enabled: true }));
      }
    }
  }, [initialTool]);

  // Image Geometry and Source
  const [imageSrc, setImageSrc] = useState<string>(initialSrc || '');
  const [originalSrc, setOriginalSrc] = useState<string>(initialSrc || '');
  const [originalWidth, setOriginalWidth] = useState<number>(1920);
  const [originalHeight, setOriginalHeight] = useState<number>(1080);
  const [currentWidth, setCurrentWidth] = useState<number>(1920);
  const [currentHeight, setCurrentHeight] = useState<number>(1080);
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(initialFile?.size || 1500000);
  const [compressedSizeBytes, setCompressedSizeBytes] = useState<number | undefined>(undefined);
  const [isStripped, setIsStripped] = useState<boolean>(false);

  // Zoom & Pan state
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Editor configuration state
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [filter, setFilter] = useState<FilterPreset>('none');
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [borderRadius, setBorderRadius] = useState<number>(0);
  const [borderWidth, setBorderWidth] = useState<number>(0);
  const [borderColor, setBorderColor] = useState<string>('#6366f1');
  const [watermark, setWatermark] = useState<WatermarkSettings>(DEFAULT_WATERMARK);
  const [background, setBackground] = useState<BackgroundSettings>(DEFAULT_BACKGROUND);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [shapeLayers, setShapeLayers] = useState<ShapeLayer[]>([]);
  const [censorAreas, setCensorAreas] = useState<CensorArea[]>([]);

  // Color picker & palette state
  const [sampledColor, setSampledColor] = useState<ColorInfo | null>(null);
  const [recentColors, setRecentColors] = useState<ColorInfo[]>([]);
  const [palette, setPalette] = useState<ColorInfo[]>([]);
  const [isPickingMode, setIsPickingMode] = useState<boolean>(false);

  // Crop State
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 10,
    y: 10,
    width: 80,
    height: 80,
    aspectRatio: null,
  });

  // Loading & Processing
  const [isRendering, setIsRendering] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Undo / Redo history
  const [historyStack, setHistoryStack] = useState<WorkspaceState[]>([]);
  const [redoStack, setRedoStack] = useState<WorkspaceState[]>([]);

  // Initialize Base Image
  useEffect(() => {
    let active = true;
    const initImg = async () => {
      let srcToUse = initialSrc;
      if (initialFile && !srcToUse) {
        srcToUse = URL.createObjectURL(initialFile);
      }
      if (!srcToUse) return;

      try {
        const img = await loadImage(srcToUse);
        if (!active) return;
        baseImageRef.current = img;
        setImageSrc(srcToUse);
        setOriginalSrc(srcToUse);
        setOriginalWidth(img.naturalWidth || img.width);
        setOriginalHeight(img.naturalHeight || img.height);
        setCurrentWidth(img.naturalWidth || img.width);
        setCurrentHeight(img.naturalHeight || img.height);
      } catch {
        // error handling
      }
    };

    initImg();
    return () => {
      active = false;
    };
  }, [initialFile, initialSrc]);

  // Current State Snapshot for Undo
  const getCurrentState = useCallback((): WorkspaceState => {
    return {
      adjustments: { ...adjustments },
      filter,
      rotation,
      flipH,
      flipV,
      borderRadius,
      borderWidth,
      borderColor,
      watermark: { ...watermark },
      background: { ...background },
      textLayers: [...textLayers],
      shapeLayers: [...shapeLayers],
      censorAreas: [...censorAreas],
      width: currentWidth,
      height: currentHeight,
    };
  }, [
    adjustments,
    filter,
    rotation,
    flipH,
    flipV,
    borderRadius,
    borderWidth,
    borderColor,
    watermark,
    background,
    textLayers,
    shapeLayers,
    censorAreas,
    currentWidth,
    currentHeight,
  ]);

  const pushHistory = useCallback(() => {
    const state = getCurrentState();
    setHistoryStack((prev) => [...prev.slice(-20), state]);
    setRedoStack([]);
  }, [getCurrentState]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyStack.length === 0) return;
    const currentState = getCurrentState();
    const prev = historyStack[historyStack.length - 1];
    setHistoryStack((h) => h.slice(0, -1));
    setRedoStack((r) => [currentState, ...r]);

    // Restore
    setAdjustments(prev.adjustments);
    setFilter(prev.filter);
    setRotation(prev.rotation);
    setFlipH(prev.flipH);
    setFlipV(prev.flipV);
    setBorderRadius(prev.borderRadius);
    setBorderWidth(prev.borderWidth);
    setBorderColor(prev.borderColor);
    setWatermark(prev.watermark);
    setBackground(prev.background);
    setTextLayers(prev.textLayers);
    setShapeLayers(prev.shapeLayers);
    setCensorAreas(prev.censorAreas || []);
    setCurrentWidth(prev.width);
    setCurrentHeight(prev.height);
  }, [historyStack, getCurrentState]);

  // Redo
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    const currentState = getCurrentState();
    setRedoStack((r) => r.slice(1));
    setHistoryStack((h) => [...h, currentState]);

    // Restore
    setAdjustments(next.adjustments);
    setFilter(next.filter);
    setRotation(next.rotation);
    setFlipH(next.flipH);
    setFlipV(next.flipV);
    setBorderRadius(next.borderRadius);
    setBorderWidth(next.borderWidth);
    setBorderColor(next.borderColor);
    setWatermark(next.watermark);
    setBackground(next.background);
    setTextLayers(next.textLayers);
    setShapeLayers(next.shapeLayers);
    setCensorAreas(next.censorAreas || []);
    setCurrentWidth(next.width);
    setCurrentHeight(next.height);
  }, [redoStack, getCurrentState]);

  // Reset to original
  const handleResetAll = useCallback(() => {
    pushHistory();
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setFilter('none');
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setBorderRadius(0);
    setBorderWidth(0);
    setWatermark(DEFAULT_WATERMARK);
    setBackground(DEFAULT_BACKGROUND);
    setTextLayers([]);
    setShapeLayers([]);
    setCensorAreas([]);
    setCurrentWidth(originalWidth);
    setCurrentHeight(originalHeight);
  }, [originalWidth, originalHeight, pushHistory]);

  // Redraw Canvas Pipeline (Canvas-First Watermark Rendering)
  const redrawCanvas = useCallback(async () => {
    const canvas = mainCanvasRef.current;
    const baseImg = baseImageRef.current;
    if (!canvas || !baseImg) return;

    setIsRendering(true);
    try {
      // Check if swap dimensions for 90/270deg rotation
      const isRotated90 = Math.abs(rotation % 180) === 90;
      const targetW = isRotated90 ? currentHeight : currentWidth;
      const targetH = isRotated90 ? currentWidth : currentHeight;
      const drawW = isRotated90 ? targetH : targetW;
      const drawH = isRotated90 ? targetW : targetH;

      // CANVAS-FIRST: Apply watermark directly to image data buffer before any transformations
      await renderCanvasPipelineWithBuffer(canvas, baseImg, {
        targetW,
        targetH,
        drawW,
        drawH,
        rotation,
        flipH,
        flipV,
        borderRadius,
        borderWidth,
        borderColor,
        adjustments,
        filter,
        background,
        censorAreas,
        watermark,
        textLayers,
        shapeLayers,
      });
    } finally {
      setIsRendering(false);
    }
  }, [
    adjustments,
    filter,
    rotation,
    flipH,
    flipV,
    borderRadius,
    borderWidth,
    borderColor,
    watermark,
    background,
    textLayers,
    shapeLayers,
    censorAreas,
    currentWidth,
    currentHeight,
  ]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if (isCmdOrCtrl && e.key === 's') {
        e.preventDefault();
        setShowExportModal(true);
      } else if (e.key === 'Escape') {
        setShowExportModal(false);
        setShowShortcuts(false);
        setShowQuickFix(false);
      } else if (e.key === '0') {
        setZoomScale(1);
      } else if (e.key === '+' || e.key === '=') {
        setZoomScale((z) => Math.min(3, z + 0.15));
      } else if (e.key === '-') {
        setZoomScale((z) => Math.max(0.2, z - 0.15));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Crop Action
  const handleApplyCrop = async () => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;

    pushHistory();
    const cropX = Math.round((cropArea.x / 100) * canvas.width);
    const cropY = Math.round((cropArea.y / 100) * canvas.height);
    const cropW = Math.max(10, Math.round((cropArea.width / 100) * canvas.width));
    const cropH = Math.max(10, Math.round((cropArea.height / 100) * canvas.height));

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropW;
    croppedCanvas.height = cropH;
    const cCtx = croppedCanvas.getContext('2d');
    if (!cCtx) return;

    cCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    const newSrc = croppedCanvas.toDataURL('image/png');
    const newImg = await loadImage(newSrc);

    baseImageRef.current = newImg;
    setCurrentWidth(cropW);
    setCurrentHeight(cropH);
    setCropArea({ x: 10, y: 10, width: 80, height: 80, aspectRatio: null });
    setActiveTool('overview');
  };

  // Resize Action
  const handleApplyResize = (targetW: number, targetH: number) => {
    pushHistory();
    setCurrentWidth(targetW);
    setCurrentHeight(targetH);
    setActiveTool('overview');
  };

  // Compression Action
  const handleApplyCompression = async (options: {
    mode: 'preset' | 'target' | 'custom';
    presetQuality?: number;
    targetKb?: number;
  }) => {
    const canvas = mainCanvasRef.current;
    const baseImg = baseImageRef.current;
    if (!canvas || !baseImg) return;

    setIsProcessingAction(true);
    try {
      const isRotated90 = Math.abs(rotation % 180) === 90;
      const targetW = isRotated90 ? currentHeight : currentWidth;
      const targetH = isRotated90 ? currentWidth : currentHeight;
      const drawW = isRotated90 ? targetH : targetW;
      const drawH = isRotated90 ? targetW : targetH;

      // Canvas-First: Ensure watermarked buffer is freshly rendered
      await renderCanvasPipelineWithBuffer(canvas, baseImg, {
        targetW,
        targetH,
        drawW,
        drawH,
        rotation,
        flipH,
        flipV,
        borderRadius,
        borderWidth,
        borderColor,
        adjustments,
        filter,
        background,
        censorAreas,
        watermark,
        textLayers,
        shapeLayers,
      });

      const res = await smartCompress(canvas, {
        quality: options.presetQuality,
        targetSizeKb: options.targetKb,
      });
      setCompressedSizeBytes(res.sizeBytes);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Convert Action
  const handleApplyConvert = async (targetFormat: ExportFormat, quality: number) => {
    const canvas = mainCanvasRef.current;
    const baseImg = baseImageRef.current;
    if (!canvas || !baseImg) return;

    setIsProcessingAction(true);
    try {
      const isRotated90 = Math.abs(rotation % 180) === 90;
      const targetW = isRotated90 ? currentHeight : currentWidth;
      const targetH = isRotated90 ? currentWidth : currentHeight;
      const drawW = isRotated90 ? targetH : targetW;
      const drawH = isRotated90 ? targetW : targetH;

      // Canvas-First: Ensure watermarked buffer is freshly rendered
      await renderCanvasPipelineWithBuffer(canvas, baseImg, {
        targetW,
        targetH,
        drawW,
        drawH,
        rotation,
        flipH,
        flipV,
        borderRadius,
        borderWidth,
        borderColor,
        adjustments,
        filter,
        background,
        censorAreas,
        watermark,
        textLayers,
        shapeLayers,
      });

      const res = await smartCompress(canvas, {
        format: targetFormat,
        quality,
      });
      setCompressedSizeBytes(res.sizeBytes);
      setShowExportModal(true);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Strip Metadata Action
  const handleStripMetadata = async () => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;

    setIsProcessingAction(true);
    try {
      const strippedBlob = await stripMetadata(canvas, 'image/jpeg', 0.95);
      setIsStripped(true);
      setCompressedSizeBytes(strippedBlob.size);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Quick Fix 1-Click Optimizer
  const handleApplyQuickFix = async (options: {
    compress: boolean;
    targetKb?: number;
    resizeWeb: boolean;
    maxDim?: number;
    stripMetadata: boolean;
  }) => {
    pushHistory();
    const canvas = mainCanvasRef.current;
    if (!canvas) return;

    let targetW = currentWidth;
    let targetH = currentHeight;

    if (options.resizeWeb && options.maxDim && (targetW > options.maxDim || targetH > options.maxDim)) {
      if (targetW >= targetH) {
        targetH = Math.round((targetH * options.maxDim) / targetW);
        targetW = options.maxDim;
      } else {
        targetW = Math.round((targetW * options.maxDim) / targetH);
        targetH = options.maxDim;
      }
      setCurrentWidth(targetW);
      setCurrentHeight(targetH);
    }

    if (options.stripMetadata) {
      setIsStripped(true);
    }

    if (options.compress) {
      await handleApplyCompression({
        mode: 'target',
        targetKb: options.targetKb || 450,
      });
    }
  };

  // Export Confirmation (Canvas-First Watermark Rendering)
  const handleConfirmExport = async (options: {
    format: ExportFormat;
    quality: number;
    fileName: string;
    stripMetadata: boolean;
  }): Promise<ProcessedImageResult> => {
    const canvas = mainCanvasRef.current;
    const baseImg = baseImageRef.current;
    if (!canvas || !baseImg) throw new Error('Canvas not found');

    const isRotated90 = Math.abs(rotation % 180) === 90;
    const targetW = isRotated90 ? currentHeight : currentWidth;
    const targetH = isRotated90 ? currentWidth : currentHeight;
    const drawW = isRotated90 ? targetH : targetW;
    const drawH = isRotated90 ? targetW : targetH;

    // Canvas-First: Apply watermark directly to image data buffer before any subsequent transformations for export
    await renderCanvasPipelineWithBuffer(canvas, baseImg, {
      targetW,
      targetH,
      drawW,
      drawH,
      rotation,
      flipH,
      flipV,
      borderRadius,
      borderWidth,
      borderColor,
      adjustments,
      filter,
      background,
      censorAreas,
      watermark,
      textLayers,
      shapeLayers,
    });

    const res = await smartCompress(canvas, {
      format: options.format,
      quality: options.quality,
    });

    // Save into local history
    saveRecentHistory({
      name: options.fileName,
      originalSize: fileSizeBytes,
      finalSize: res.sizeBytes,
      dimensions: `${res.width} × ${res.height}`,
      thumbnail: res.dataUrl,
    });

    return res;
  };

  // 70.31 Copy Watermarked Image to Clipboard
  const handleCopyImageToClipboard = async () => {
    const canvas = mainCanvasRef.current;
    const baseImg = baseImageRef.current;
    if (!canvas || !baseImg) return;

    const isRotated90 = Math.abs(rotation % 180) === 90;
    const targetW = isRotated90 ? currentHeight : currentWidth;
    const targetH = isRotated90 ? currentWidth : currentHeight;
    const drawW = isRotated90 ? targetH : targetW;
    const drawH = isRotated90 ? targetW : targetH;

    await renderCanvasPipelineWithBuffer(canvas, baseImg, {
      targetW,
      targetH,
      drawW,
      drawH,
      rotation,
      flipH,
      flipV,
      borderRadius,
      borderWidth,
      borderColor,
      adjustments,
      filter,
      background,
      censorAreas,
      watermark,
      textLayers,
      shapeLayers,
    });

    const success = await copyCanvasToClipboard(canvas);
    if (success) {
      setCopiedImageSuccess(true);
      setTimeout(() => setCopiedImageSuccess(false), 2200);
    }
  };

  // Text Layer Helpers
  const handleAddText = () => {
    pushHistory();
    const newLayer: TextLayer = {
      id: 'txt_' + Date.now(),
      text: 'Double click to edit',
      x: 50,
      y: 50,
      fontSize: 48,
      fontFamily: 'Plus Jakarta Sans',
      color: '#ffffff',
      fontWeight: '600',
      textAlign: 'center',
      opacity: 1,
      hasShadow: true,
    };
    setTextLayers((prev) => [...prev, newLayer]);
  };

  const handleUpdateText = (id: string, partial: Partial<TextLayer>) => {
    setTextLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, ...partial } : layer))
    );
  };

  const handleRemoveText = (id: string) => {
    pushHistory();
    setTextLayers((prev) => prev.filter((layer) => layer.id !== id));
  };

  // Shape Layer Helpers
  const handleAddShape = (type: ShapeLayer['type']) => {
    pushHistory();
    const newShape: ShapeLayer = {
      id: 'shp_' + Date.now(),
      type,
      x: 35,
      y: 35,
      width: 30,
      height: 30,
      fillColor: type === 'arrow' || type === 'line' ? 'transparent' : 'rgba(99, 102, 241, 0.25)',
      strokeColor: '#6366f1',
      strokeWidth: 4,
      opacity: 1,
    };
    setShapeLayers((prev) => [...prev, newShape]);
  };

  const handleUpdateShape = (id: string, partial: Partial<ShapeLayer>) => {
    setShapeLayers((prev) =>
      prev.map((shape) => (shape.id === id ? { ...shape, ...partial } : shape))
    );
  };

  const handleRemoveShape = (id: string) => {
    pushHistory();
    setShapeLayers((prev) => prev.filter((shape) => shape.id !== id));
  };

  // Censor & Redaction Helpers
  const handleAddCensorArea = (type: CensorArea['type']) => {
    pushHistory();
    const newArea: CensorArea = {
      id: 'censor_' + Date.now(),
      type,
      x: 30,
      y: 30,
      width: 40,
      height: 25,
      blockSize: type === 'pixelate' ? 16 : 10,
    };
    setCensorAreas((prev) => [...prev, newArea]);
  };

  const handleUpdateCensorArea = (id: string, partial: Partial<CensorArea>) => {
    setCensorAreas((prev) =>
      prev.map((area) => (area.id === id ? { ...area, ...partial } : area))
    );
  };

  const handleRemoveCensorArea = (id: string) => {
    pushHistory();
    setCensorAreas((prev) => prev.filter((a) => a.id !== id));
  };

  const handleBurnInRedaction = async () => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    pushHistory();
    const newSrc = canvas.toDataURL('image/png');
    const newImg = await loadImage(newSrc);
    baseImageRef.current = newImg;
    setCensorAreas([]);
  };

  // Auto Enhance Action
  const handleApplyAutoEnhance = async () => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    pushHistory();
    setIsProcessingAction(true);
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      applyAutoEnhance(ctx, canvas.width, canvas.height);
      const newSrc = canvas.toDataURL('image/png');
      const newImg = await loadImage(newSrc);
      baseImageRef.current = newImg;
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Denoise Action
  const handleApplyDenoise = async (intensity: 'low' | 'medium' | 'high') => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    pushHistory();
    setIsProcessingAction(true);
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      applyDenoise(ctx, canvas.width, canvas.height, intensity);
      const newSrc = canvas.toDataURL('image/png');
      const newImg = await loadImage(newSrc);
      baseImageRef.current = newImg;
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Upscale Action
  const handleApplyUpscale = async (scale: 2 | 4, sharpness: number) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    pushHistory();
    setIsProcessingAction(true);
    try {
      const upscaledCanvas = await upscaleImageCanvas(canvas, scale, sharpness);
      const newSrc = upscaledCanvas.toDataURL('image/png');
      const newImg = await loadImage(newSrc);
      baseImageRef.current = newImg;
      setCurrentWidth(upscaledCanvas.width);
      setCurrentHeight(upscaledCanvas.height);
      setCompressedSizeBytes(Math.round(fileSizeBytes * (scale === 2 ? 2.5 : 6)));
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Canvas interaction (Eyedropper Color Picker & Watermark Pinning)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    if (isPickingMode) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      const sampled = samplePixelColor(ctx, clickX, clickY);
      setSampledColor(sampled);
      setRecentColors((prev) => [sampled, ...prev.filter((c) => c.hex !== sampled.hex)].slice(0, 10));
    } else if (activeTool === 'watermark') {
      const pinX = Math.round(Math.max(2, Math.min(98, (clickX / canvas.width) * 100)));
      const pinY = Math.round(Math.max(2, Math.min(98, (clickY / canvas.height) * 100)));
      pushHistory();
      setWatermark((prev) => ({
        ...prev,
        enabled: true,
        position: 'custom',
        customX: pinX,
        customY: pinY,
      }));
    }
  };

  // Color Palette Extraction
  const handleExtractPalette = () => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const colors = extractDominantPalette(canvas, 6);
    setPalette(colors);
  };

  // Tools list for left sidebar
  const TOOL_BUTTONS: { id: ActiveTool; label: string; icon: React.ReactNode }[] = [
    { id: 'adjust', label: 'Adjust', icon: <Sun className="w-4 h-4" /> },
    { id: 'enhance', label: 'Enhance', icon: <Sparkles className="w-4 h-4 text-indigo-400" /> },
    { id: 'filters', label: 'Filters', icon: <Palette className="w-4 h-4" /> },
    { id: 'crop', label: 'Crop', icon: <Crop className="w-4 h-4" /> },
    { id: 'resize', label: 'Resize', icon: <Maximize2 className="w-4 h-4" /> },
    { id: 'censor', label: 'Redact', icon: <EyeOff className="w-4 h-4 text-emerald-400" /> },
    { id: 'colors', label: 'Colors', icon: <Pipette className="w-4 h-4 text-cyan-400" /> },
    { id: 'compress', label: 'Compress', icon: <Zap className="w-4 h-4" /> },
    { id: 'convert', label: 'Convert', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'rotate', label: 'Rotate', icon: <RotateCw className="w-4 h-4" /> },
    { id: 'background', label: 'Backdrop', icon: <Layers className="w-4 h-4" /> },
    { id: 'watermark', label: 'Watermark', icon: <Stamp className="w-4 h-4 text-amber-400" /> },
    { id: 'text', label: 'Design', icon: <Type className="w-4 h-4" /> },
    { id: 'metadata', label: 'Privacy', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-61px)] min-h-[640px] bg-[#080d16] select-none overflow-hidden">
      {/* Top Workspace Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0e1422] border-b border-slate-800 text-xs">
        {/* Left: File metadata specs */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-semibold text-white truncate max-w-[200px]" title={fileName}>
            {fileName}
          </span>
          <span className="text-slate-400 font-mono hidden sm:inline">
            {currentWidth} × {currentHeight}
          </span>
          <span className="text-slate-400 font-mono hidden sm:inline">·</span>
          <span className="text-cyan-300 font-mono font-medium hidden sm:inline">
            {formatBytes(compressedSizeBytes || fileSizeBytes)}
          </span>
          {compressedSizeBytes && (
            <span className="text-emerald-400 font-mono text-[10px] hidden md:inline">
              ({Math.round(((fileSizeBytes - compressedSizeBytes) / fileSizeBytes) * 100)}% optimized)
            </span>
          )}
        </div>

        {/* Center: Undo / Redo / Reset / Shortcuts */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={historyStack.length === 0}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetAll}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Reset All Adjustments"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-slate-800 mx-1" />
          <button
            onClick={() => setShowShortcuts(true)}
            className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition cursor-pointer"
          >
            <Command className="w-3.5 h-3.5" />
            <span>Shortcuts</span>
          </button>
        </div>

        {/* Right: Copy Image / Quick Fix / Before-After / Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyImageToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Copy watermarked image to clipboard"
          >
            {copiedImageSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Copy Image</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowBeforeAfter(!showBeforeAfter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition cursor-pointer ${
              showBeforeAfter
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Before / After</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-md shadow-indigo-600/20 active:scale-95 transition cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANEL: Tool Selector Sidebar */}
        <aside className="w-16 sm:w-20 bg-[#0c111d] border-r border-slate-800 flex flex-col items-center py-3 gap-1 overflow-y-auto z-10">
          {TOOL_BUTTONS.map((t) => {
            const isActive = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTool(t.id);
                  if (t.id === 'watermark') {
                    setWatermark((w) => ({ ...w, enabled: true }));
                  }
                  if (showBeforeAfter) setShowBeforeAfter(false);
                }}
                className={`w-12 sm:w-16 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-300 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title={t.label}
              >
                {t.icon}
                <span className="text-[10px] font-medium tracking-tight truncate w-full text-center">
                  {t.label}
                </span>
              </button>
            );
          })}
        </aside>

        {/* CENTER PANEL: Main Interactive Canvas Viewport */}
        <main className="flex-1 relative bg-[#080d16] bg-transparency-grid overflow-hidden flex items-center justify-center p-4">
          {/* Zoom controls floating bar */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-lg text-slate-300">
            <button
              onClick={() => setZoomScale((z) => Math.max(0.2, z - 0.15))}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono w-12 text-center select-none font-medium">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale((z) => Math.min(3, z + 0.15))}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-[1px] bg-slate-800 mx-1" />
            <button
              onClick={() => setZoomScale(1)}
              className="px-2 py-1 text-[11px] hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer font-medium"
              title="Fit to Screen (0)"
            >
              Fit
            </button>
          </div>

          {/* Quick Fix Floating Prompt Banner if available and not dismissed */}
          {showQuickFix && (
            <div className="absolute top-4 left-4 right-4 z-30 max-w-2xl mx-auto animate-in slide-in-from-top-4">
              <QuickFixPanel
                fileName={fileName}
                width={currentWidth}
                height={currentHeight}
                fileSizeBytes={fileSizeBytes}
                format={initialFile?.type || 'image/jpeg'}
                exif={exif}
                onApplyOptimization={handleApplyQuickFix}
                onClose={() => setShowQuickFix(false)}
              />
            </div>
          )}

          {/* Canvas or Before/After Split */}
          {showBeforeAfter && mainCanvasRef.current ? (
            <div className="w-full h-full max-w-4xl max-h-[85vh] flex items-center justify-center p-2">
              <BeforeAfterViewer
                originalSrc={originalSrc}
                processedSrc={mainCanvasRef.current.toDataURL('image/jpeg', 0.9)}
                originalLabel="ORIGINAL"
                processedLabel="EDITED RESULT"
              />
            </div>
          ) : (
            <div
              className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-150 ease-out"
              style={{ transform: `scale(${zoomScale})` }}
            >
              <canvas
                ref={mainCanvasRef}
                onClick={handleCanvasClick}
                style={{
                  cursor: isPickingMode
                    ? 'crosshair'
                    : activeTool === 'censor'
                    ? 'crosshair'
                    : activeTool === 'watermark'
                    ? 'crosshair'
                    : 'default',
                }}
                className="max-w-[85vw] max-h-[75vh] object-contain shadow-2xl rounded-sm"
              />

              {/* Watermark position placement hint */}
              {activeTool === 'watermark' && (
                <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-lg shadow-lg pointer-events-none text-[11px] text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Click canvas to position watermark pin</span>
                </div>
              )}

              {/* Eyedropper indicator tooltip */}
              {isPickingMode && sampledColor && (
                <div className="absolute top-2 left-2 z-30 flex items-center gap-2 bg-slate-900/95 border border-slate-700 px-3 py-1.5 rounded-xl shadow-lg pointer-events-none">
                  <div className="w-4 h-4 rounded-full border border-white/40" style={{ backgroundColor: sampledColor.hex }} />
                  <span className="font-mono text-xs text-white font-bold">{sampledColor.hex}</span>
                </div>
              )}

              {/* Censor interactive boxes overlay */}
              {activeTool === 'censor' &&
                censorAreas.map((area, idx) => (
                  <div
                    key={area.id}
                    className="absolute border border-dashed border-emerald-400/80 bg-emerald-500/10 flex items-start justify-between p-1 group pointer-events-auto"
                    style={{
                      left: `${area.x}%`,
                      top: `${area.y}%`,
                      width: `${area.width}%`,
                      height: `${area.height}%`,
                    }}
                  >
                    <span className="text-[10px] font-mono text-emerald-300 bg-slate-900/80 px-1 rounded">
                      #{idx + 1} {area.type}
                    </span>
                    <button
                      onClick={() => handleRemoveCensorArea(area.id)}
                      className="w-4 h-4 rounded bg-rose-600/80 text-white flex items-center justify-center text-[10px] hover:bg-rose-500 transition cursor-pointer"
                      title="Remove zone"
                    >
                      ×
                    </button>
                  </div>
                ))}

              {/* Crop interactive rectangle overlay when Crop tool is active */}
              {activeTool === 'crop' && (
                <div
                  className="absolute border-2 border-indigo-400 bg-indigo-500/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] cursor-move"
                  style={{
                    left: `${cropArea.x}%`,
                    top: `${cropArea.y}%`,
                    width: `${cropArea.width}%`,
                    height: `${cropArea.height}%`,
                  }}
                >
                  {/* Visual grid guides */}
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none">
                    <div className="border-r border-b border-white/20" />
                    <div className="border-r border-b border-white/20" />
                    <div className="border-b border-white/20" />
                    <div className="border-r border-b border-white/20" />
                    <div className="border-r border-b border-white/20" />
                    <div className="border-b border-white/20" />
                    <div className="border-r border-white/20" />
                    <div className="border-r border-white/20" />
                    <div />
                  </div>

                  {/* Handles */}
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-indigo-600 rounded-sm" />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-indigo-600 rounded-sm" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-indigo-600 rounded-sm" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-indigo-600 rounded-sm" />
                </div>
              )}
            </div>
          )}
        </main>

        {/* RIGHT PANEL: Tool Settings & Controls */}
        <aside className="w-72 sm:w-80 bg-[#0e1422] border-l border-slate-800 p-4 sm:p-5 overflow-y-auto z-10">
          {activeTool === 'adjust' && (
            <AdjustmentsTool
              adjustments={adjustments}
              onChange={(adj) => {
                setAdjustments(adj);
              }}
              onReset={() => {
                pushHistory();
                setAdjustments(DEFAULT_ADJUSTMENTS);
              }}
            />
          )}

          {activeTool === 'enhance' && (
            <EnhanceTool
              adjustments={adjustments}
              originalWidth={currentWidth}
              originalHeight={currentHeight}
              onChangeAdjustments={(adj) => setAdjustments(adj)}
              onApplyAutoEnhance={handleApplyAutoEnhance}
              onApplyDenoise={handleApplyDenoise}
              onApplyUpscale={handleApplyUpscale}
              isProcessing={isProcessingAction}
            />
          )}

          {activeTool === 'censor' && (
            <CensorTool
              areas={censorAreas}
              onAddArea={handleAddCensorArea}
              onUpdateArea={handleUpdateCensorArea}
              onRemoveArea={handleRemoveCensorArea}
              onApplyBurnIn={handleBurnInRedaction}
              onClearAll={() => setCensorAreas([])}
              isProcessing={isProcessingAction}
            />
          )}

          {activeTool === 'colors' && (
            <ColorTool
              sampledColor={sampledColor}
              recentColors={recentColors}
              palette={palette}
              onExtractPalette={handleExtractPalette}
              isPickingMode={isPickingMode}
              onTogglePickingMode={setIsPickingMode}
            />
          )}

          {activeTool === 'filters' && (
            <FiltersTool
              currentFilter={filter}
              onSelectFilter={(f) => {
                pushHistory();
                setFilter(f);
              }}
              thumbnailSrc={originalSrc}
            />
          )}

          {activeTool === 'crop' && (
            <CropTool
              currentCrop={cropArea}
              imageWidth={currentWidth}
              imageHeight={currentHeight}
              onChangeCrop={setCropArea}
              onApplyCrop={handleApplyCrop}
              onCancelCrop={() => setCropArea({ x: 10, y: 10, width: 80, height: 80, aspectRatio: null })}
            />
          )}

          {activeTool === 'resize' && (
            <ResizeTool
              originalWidth={currentWidth}
              originalHeight={currentHeight}
              onApplyResize={handleApplyResize}
            />
          )}

          {activeTool === 'compress' && (
            <CompressTool
              originalSizeBytes={fileSizeBytes}
              currentSizeBytes={compressedSizeBytes}
              onApplyCompression={handleApplyCompression}
              isProcessing={isProcessingAction}
            />
          )}

          {activeTool === 'convert' && (
            <ConvertTool
              currentFormat={initialFile?.type || 'image/jpeg'}
              onApplyConvert={handleApplyConvert}
              isProcessing={isProcessingAction}
            />
          )}

          {activeTool === 'rotate' && (
            <RotateTool
              rotation={rotation}
              flipH={flipH}
              flipV={flipV}
              borderRadius={borderRadius}
              borderWidth={borderWidth}
              borderColor={borderColor}
              onRotateCW={() => {
                pushHistory();
                setRotation((r) => (r + 90) % 360);
              }}
              onRotateCCW={() => {
                pushHistory();
                setRotation((r) => (r - 90) % 360);
              }}
              onRotate180={() => {
                pushHistory();
                setRotation((r) => (r + 180) % 360);
              }}
              onAngleChange={(angle) => setRotation(angle)}
              onToggleFlipH={() => {
                pushHistory();
                setFlipH((f) => !f);
              }}
              onToggleFlipV={() => {
                pushHistory();
                setFlipV((f) => !f);
              }}
              onBorderRadiusChange={setBorderRadius}
              onBorderWidthChange={setBorderWidth}
              onBorderColorChange={setBorderColor}
              onReset={() => {
                pushHistory();
                setRotation(0);
                setFlipH(false);
                setFlipV(false);
                setBorderRadius(0);
                setBorderWidth(0);
              }}
            />
          )}

          {activeTool === 'watermark' && (
            <WatermarkTool
              watermark={watermark}
              onChange={(wm) => {
                setWatermark(wm);
              }}
              onCommit={() => {
                pushHistory();
              }}
            />
          )}

          {activeTool === 'background' && (
            <BackgroundTool
              settings={background}
              onChange={(bg) => {
                pushHistory();
                setBackground(bg);
              }}
              onApply={() => redrawCanvas()}
              onReset={() => {
                pushHistory();
                setBackground(DEFAULT_BACKGROUND);
              }}
              isProcessing={isRendering}
            />
          )}

          {activeTool === 'text' && (
            <TextDesignTool
              textLayers={textLayers}
              shapeLayers={shapeLayers}
              onAddText={handleAddText}
              onUpdateText={handleUpdateText}
              onRemoveText={handleRemoveText}
              onAddShape={handleAddShape}
              onUpdateShape={handleUpdateShape}
              onRemoveShape={handleRemoveShape}
            />
          )}

          {activeTool === 'metadata' && (
            <MetadataTool
              fileName={fileName}
              fileSizeBytes={compressedSizeBytes || fileSizeBytes}
              width={currentWidth}
              height={currentHeight}
              format={initialFile?.type || 'image/jpeg'}
              exif={exif}
              onStripMetadata={handleStripMetadata}
              isStripped={isStripped}
            />
          )}
        </aside>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        originalFileName={fileName}
        currentWidth={currentWidth}
        currentHeight={currentHeight}
        currentEstimatedSizeBytes={compressedSizeBytes || fileSizeBytes}
        onConfirmExport={handleConfirmExport}
        onStartNew={onStartNew}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
};
