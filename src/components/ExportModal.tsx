import React, { useState, useEffect } from 'react';
import { ExportFormat, ProcessedImageResult } from '../types';
import { Download, X, Check, Sparkles, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatBytes } from '../utils/imageProcessing';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalFileName: string;
  currentWidth: number;
  currentHeight: number;
  currentEstimatedSizeBytes?: number;
  onConfirmExport: (options: {
    format: ExportFormat;
    quality: number;
    fileName: string;
    stripMetadata: boolean;
  }) => Promise<ProcessedImageResult>;
  onStartNew: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  originalFileName,
  currentWidth,
  currentHeight,
  currentEstimatedSizeBytes,
  onConfirmExport,
  onStartNew,
}) => {
  const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;
  const [fileName, setFileName] = useState(`${baseName}_pixora`);
  const [format, setFormat] = useState<ExportFormat>('image/webp');
  const [quality, setQuality] = useState<number>(0.85);
  const [stripMetadata, setStripMetadata] = useState<boolean>(true);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedResult, setExportedResult] = useState<ProcessedImageResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      setExportedResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const ext = format === 'image/jpeg' ? '.jpg' : format === 'image/png' ? '.png' : '.webp';
      const fullFileName = fileName.endsWith(ext) ? fileName : `${fileName}${ext}`;
      const result = await onConfirmExport({
        format,
        quality,
        fileName: fullFileName,
        stripMetadata,
      });
      setExportedResult(result);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!exportedResult) return;
    const a = document.createElement('a');
    a.href = exportedResult.dataUrl;
    const ext = format === 'image/jpeg' ? '.jpg' : format === 'image/png' ? '.png' : '.webp';
    a.download = fileName.endsWith(ext) ? fileName : `${fileName}${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[#0e1422] border border-slate-800 p-6 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white tracking-tight">
            {exportedResult ? 'Export Complete' : 'Export & Save Image'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {exportedResult ? (
          /* Post-Export Success View */
          <div className="py-6 space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">Your Image is Ready</h4>
              <p className="text-xs text-slate-400">
                Processed locally with zero data leakage. Ready for web, print, or social.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 flex justify-around text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Format</span>
                <span className="text-white font-mono uppercase mt-0.5 block">
                  {exportedResult.format.replace('image/', '')}
                </span>
              </div>
              <div className="border-r border-slate-800" />
              <div>
                <span className="text-slate-400 block text-[10px]">Dimensions</span>
                <span className="text-white font-mono mt-0.5 block">
                  {exportedResult.width} × {exportedResult.height}
                </span>
              </div>
              <div className="border-r border-slate-800" />
              <div>
                <span className="text-slate-400 block text-[10px]">Final Size</span>
                <span className="text-cyan-300 font-mono font-bold mt-0.5 block">
                  {formatBytes(exportedResult.sizeBytes)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-500/25 active:scale-95 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Image</span>
              </button>
              <button
                onClick={onClose}
                className="py-3 px-4 rounded-xl font-semibold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                Edit Again
              </button>
              <button
                onClick={onStartNew}
                className="py-3 px-4 rounded-xl font-medium text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                Start New
              </button>
            </div>
          </div>
        ) : (
          /* Configuration View */
          <div className="space-y-4 py-4 text-xs">
            {/* Filename */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Output Filename</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Format Selector */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Export Codec / Container</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'image/webp', label: 'WebP', note: 'Recommended' },
                  { id: 'image/jpeg', label: 'JPEG', note: 'Universal' },
                  { id: 'image/png', label: 'PNG', note: 'Lossless' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id as ExportFormat)}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      format === f.id
                        ? 'bg-indigo-950/70 border-indigo-500 text-indigo-300 font-semibold'
                        : 'bg-[#090d16] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs text-white">{f.label}</span>
                    <span className="block text-[10px] text-slate-400">{f.note}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider */}
            {format !== 'image/png' && (
              <div className="space-y-2 p-3 rounded-xl bg-[#090d16] border border-slate-800">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Export Quality</span>
                  <span className="font-mono text-white text-xs">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={Math.round(quality * 100)}
                  onChange={(e) => setQuality(parseInt(e.target.value) / 100)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}

            {/* Metadata Stripper Toggle */}
            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#090d16] border border-slate-800 hover:border-slate-700 transition cursor-pointer">
              <input
                type="checkbox"
                checked={stripMetadata}
                onChange={(e) => setStripMetadata(e.target.checked)}
                className="accent-indigo-500"
              />
              <div className="text-xs">
                <span className="text-white font-medium block">Strip EXIF and Device Metadata</span>
                <span className="text-slate-400 text-[11px]">
                  Removes camera hardware ID, timestamp, and GPS tracking tags.
                </span>
              </div>
            </label>

            {/* Summary */}
            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Dimensions</span>
                <span className="text-white font-mono mt-0.5 block">{currentWidth} × {currentHeight}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Estimated Output</span>
                <span className="text-cyan-300 font-mono font-medium mt-0.5 block">
                  ~{formatBytes(currentEstimatedSizeBytes ? currentEstimatedSizeBytes * (format === 'image/webp' ? 0.6 : 0.8) : 420000)}
                </span>
              </div>
            </div>

            {/* Action */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/25 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Export...
                </span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Generate & Export Image</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
