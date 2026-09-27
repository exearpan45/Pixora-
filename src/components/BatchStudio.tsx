import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { BatchItem, ExportFormat } from '../types';
import { Upload, Download, Check, X, RefreshCw, Layers, ShieldCheck, Zap, AlertCircle, Stamp } from 'lucide-react';
import { formatBytes, loadImage, renderWatermark, DEFAULT_WATERMARK } from '../utils/imageProcessing';
import { compressCanvasToBlob } from '../utils/compression';

interface BatchStudioProps {
  initialFiles?: File[];
  onOpenInWorkspace?: (file: File) => void;
}

export const BatchStudio: React.FC<BatchStudioProps> = ({ initialFiles = [], onOpenInWorkspace }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<BatchItem[]>(() => {
    return initialFiles.map((file, idx) => ({
      id: `batch_${Date.now()}_${idx}`,
      file,
      name: file.name,
      originalSizeBytes: file.size,
      originalWidth: 0,
      originalHeight: 0,
      status: 'idle',
      progress: 0,
    }));
  });

  const [operation, setOperation] = useState<'compress' | 'convert' | 'resize' | 'strip' | 'watermark'>('compress');
  const [compressQuality, setCompressQuality] = useState<number>(0.8);
  const [convertFormat, setConvertFormat] = useState<ExportFormat>('image/webp');
  const [maxDimension, setMaxDimension] = useState<number>(1920);
  const [batchWatermarkText, setBatchWatermarkText] = useState<string>('© 2026 Pixora');
  const [isProcessingAll, setIsProcessingAll] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const handleFilesAdded = (files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith('image/'));
    const newItems: BatchItem[] = valid.map((file, idx) => ({
      id: `batch_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 5)}`,
      file,
      name: file.name,
      originalSizeBytes: file.size,
      originalWidth: 0,
      originalHeight: 0,
      status: 'idle',
      progress: 0,
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setItems([]);
  };

  const processSingleItem = async (item: BatchItem): Promise<BatchItem> => {
    try {
      const imgUrl = URL.createObjectURL(item.file);
      const img = await loadImage(imgUrl);
      URL.revokeObjectURL(imgUrl);

      let w = img.width;
      let h = img.height;

      // Handle Resize
      if (operation === 'resize' && (w > maxDimension || h > maxDimension)) {
        if (w >= h) {
          h = Math.round((h * maxDimension) / w);
          w = maxDimension;
        } else {
          w = Math.round((w * maxDimension) / h);
          h = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      // Determine format & quality
      let fmt: ExportFormat = 'image/jpeg';
      let qual = 0.85;

      if (operation === 'convert') {
        fmt = convertFormat;
        qual = compressQuality;
      } else if (operation === 'compress') {
        fmt = (item.file.type as ExportFormat) || 'image/jpeg';
        if (fmt !== 'image/jpeg' && fmt !== 'image/webp') fmt = 'image/jpeg';
        qual = compressQuality;
      } else if (operation === 'strip') {
        fmt = (item.file.type as ExportFormat) || 'image/jpeg';
        qual = 0.95;
      } else if (operation === 'watermark') {
        fmt = (item.file.type as ExportFormat) || 'image/jpeg';
        qual = 0.9;
        await renderWatermark(
          ctx,
          {
            ...DEFAULT_WATERMARK,
            enabled: true,
            text: batchWatermarkText || 'Pixora',
            hasShadow: true,
          },
          w,
          h
        );
      }

      const blob = await compressCanvasToBlob(canvas, fmt, qual);
      const dataUrl = URL.createObjectURL(blob);

      return {
        ...item,
        status: 'done',
        progress: 100,
        originalWidth: img.width,
        originalHeight: img.height,
        processedResult: {
          blob,
          dataUrl,
          width: w,
          height: h,
          sizeBytes: blob.size,
          format: fmt,
        },
      };
    } catch (err: any) {
      return {
        ...item,
        status: 'error',
        progress: 0,
        errorMessage: err.message || 'Processing failed',
      };
    }
  };

  const handleProcessAll = async () => {
    if (items.length === 0 || isProcessingAll) return;
    setIsProcessingAll(true);

    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: 'processing', progress: 50 };
      setItems([...updated]);

      const processed = await processSingleItem(updated[i]);
      updated[i] = processed;
      setItems([...updated]);
    }

    setIsProcessingAll(false);
  };

  const handleDownloadZip = async () => {
    const doneItems = items.filter((i) => i.status === 'done' && i.processedResult);
    if (doneItems.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      doneItems.forEach((item) => {
        if (!item.processedResult) return;
        const ext =
          item.processedResult.format === 'image/webp'
            ? '.webp'
            : item.processedResult.format === 'image/png'
            ? '.png'
            : '.jpg';
        const rawName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
        zip.file(`${rawName}_pixora${ext}`, item.processedResult.blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = `pixora_batch_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsZipping(false);
    }
  };

  const doneCount = items.filter((i) => i.status === 'done').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Batch Studio</h2>
          <p className="text-sm text-slate-400 mt-1">
            Bulk compress, transcode, resize, and sanitize multiple images simultaneously with ZIP export
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) handleFilesAdded(Array.from(e.target.files));
              e.target.value = '';
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add More Images</span>
          </button>
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        /* Empty State */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-3xl p-16 text-center bg-[#0d1320] cursor-pointer transition space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <Layers className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No images in batch queue</h3>
            <p className="text-xs text-slate-400">
              Drag and drop multiple photos here or click to browse.
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Supports batch JPG, PNG, WebP, GIF
          </div>
        </div>
      ) : (
        /* Batch Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-1 space-y-5">
            <div className="p-5 rounded-2xl bg-[#0e1422] border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Batch Operation</h3>

              {/* Action selection */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'compress', label: 'Compress' },
                  { id: 'convert', label: 'Convert' },
                  { id: 'resize', label: 'Resize' },
                  { id: 'watermark', label: 'Watermark' },
                  { id: 'strip', label: 'Strip EXIF' },
                ].map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setOperation(op.id as any)}
                    className={`p-2.5 rounded-xl border text-center font-medium transition cursor-pointer ${
                      operation === op.id
                        ? 'bg-indigo-950/70 border-indigo-500 text-indigo-300 shadow-sm'
                        : 'bg-[#090d16] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>

              {/* Operation Specific parameters */}
              {operation === 'compress' && (
                <div className="space-y-2 p-3 rounded-xl bg-[#090d16] border border-slate-800 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Compression Quality</span>
                    <span className="font-mono text-white">{Math.round(compressQuality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="95"
                    value={Math.round(compressQuality * 100)}
                    onChange={(e) => setCompressQuality(parseInt(e.target.value) / 100)}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}

              {operation === 'convert' && (
                <div className="space-y-2 text-xs">
                  <label className="text-slate-400 block font-medium">Target Container</label>
                  <select
                    value={convertFormat}
                    onChange={(e) => setConvertFormat(e.target.value as ExportFormat)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  >
                    <option value="image/webp">WebP (High efficiency, lightweight)</option>
                    <option value="image/jpeg">JPEG (Universal compatibility)</option>
                    <option value="image/png">PNG (Lossless alpha)</option>
                  </select>
                </div>
              )}

              {operation === 'resize' && (
                <div className="space-y-2 p-3 rounded-xl bg-[#090d16] border border-slate-800 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Max Edge Bound</span>
                    <span className="font-mono text-white">{maxDimension}px</span>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="3840"
                    step="80"
                    value={maxDimension}
                    onChange={(e) => setMaxDimension(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Images exceeding this boundary will be proportionally downscaled.
                  </span>
                </div>
              )}

              {operation === 'strip' && (
                <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 text-xs text-slate-400 space-y-1">
                  <span className="text-white font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Zero EXIF Privacy Stripper
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Iteratively cleans camera maker tags, timestamps, lens info, and GPS coordinates from all selected assets.
                  </p>
                </div>
              )}

              {operation === 'watermark' && (
                <div className="space-y-2 p-3 rounded-xl bg-[#090d16] border border-slate-800 text-xs">
                  <label className="text-slate-300 font-medium block">Batch Watermark Stamp Text</label>
                  <input
                    type="text"
                    value={batchWatermarkText}
                    onChange={(e) => setBatchWatermarkText(e.target.value)}
                    placeholder="e.g. © 2026 Studio"
                    className="w-full bg-[#0d1322] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium text-xs focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">
                    Stamps high-contrast brand ownership across all {items.length} images.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleProcessAll}
                  disabled={isProcessingAll || items.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingAll ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing Queue...
                    </span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-cyan-300" />
                      <span>Apply to All ({items.length} Images)</span>
                    </>
                  )}
                </button>

                {doneCount > 0 && (
                  <button
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-200 bg-emerald-950/40 border border-emerald-800/80 hover:bg-emerald-900/40 transition active:scale-95 cursor-pointer"
                  >
                    {isZipping ? (
                      <span>Packaging ZIP...</span>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Download ZIP ({doneCount} Ready)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Queue List Column */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-400 pb-1">
              <span>{items.length} Files Selected</span>
              <span>
                {doneCount} of {items.length} Completed
              </span>
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0e1422] border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[11px] font-mono text-slate-500 w-5">{idx + 1}.</span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate max-w-xs">{item.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>{formatBytes(item.originalSizeBytes)}</span>
                        {item.processedResult && (
                          <>
                            <span>→</span>
                            <span className="text-cyan-300 font-semibold">
                              {formatBytes(item.processedResult.sizeBytes)}
                            </span>
                            <span className="text-emerald-400">
                              (
                              {Math.round(
                                ((item.originalSizeBytes - item.processedResult.sizeBytes) /
                                  item.originalSizeBytes) *
                                  100
                              )}
                              % saved)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    {item.status === 'idle' && (
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded">
                        Queued
                      </span>
                    )}
                    {item.status === 'processing' && (
                      <span className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-mono bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                        Working...
                      </span>
                    )}
                    {item.status === 'done' && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                        <Check className="w-3 h-3" />
                        Ready
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span className="flex items-center gap-1 text-[10px] text-rose-400 font-mono bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/40">
                        <AlertCircle className="w-3 h-3" />
                        Error
                      </span>
                    )}

                    {/* Download single button */}
                    {item.processedResult && (
                      <a
                        href={item.processedResult.dataUrl}
                        download={`pixora_${item.name}`}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                        title="Download single file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
