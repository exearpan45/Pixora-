import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, ShieldAlert, Image as ImageIcon, Sliders, X } from 'lucide-react';
import { ExifData } from '../types';
import { formatBytes } from '../utils/imageProcessing';

interface QuickFixPanelProps {
  fileName: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  format: string;
  exif: ExifData;
  onApplyOptimization: (options: {
    compress: boolean;
    targetKb?: number;
    resizeWeb: boolean;
    maxDim?: number;
    stripMetadata: boolean;
  }) => Promise<void>;
  onClose?: () => void;
}

export const QuickFixPanel: React.FC<QuickFixPanelProps> = ({
  fileName,
  width,
  height,
  fileSizeBytes,
  format,
  exif,
  onApplyOptimization,
  onClose,
}) => {
  const isLargeSize = fileSizeBytes > 1.2 * 1024 * 1024; // > 1.2MB
  const isHighRes = width > 2400 || height > 2400;
  const hasMetadata = exif.hasMetadata || !!exif.make || !!exif.model;

  const [optCompress, setOptCompress] = useState(isLargeSize || fileSizeBytes > 800 * 1024);
  const [optResize, setOptResize] = useState(isHighRes);
  const [optStripMeta, setOptStripMeta] = useState(hasMetadata);
  const [isApplying, setIsApplying] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApplyOptimization({
        compress: optCompress,
        targetKb: optCompress ? 450 : undefined,
        resizeWeb: optResize,
        maxDim: optResize ? 1920 : undefined,
        stripMetadata: optStripMeta,
      });
      setIsDone(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1400);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[#0e1422] border border-indigo-500/30 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px] flex items-center justify-center">
            <div className="w-full h-full bg-[#0e1422] rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Quick Fix & Optimizer</h3>
            <p className="text-xs text-slate-400">Intelligent one-click diagnostic and asset normalization</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Diagnostics summary */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">File</span>
          <span className="text-xs text-white font-medium truncate block mt-0.5" title={fileName}>
            {fileName}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Resolution</span>
          <span className="text-xs text-white font-mono font-medium block mt-0.5">
            {width} × {height}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Original Size</span>
          <span className="text-xs text-white font-mono font-medium block mt-0.5">
            {formatBytes(fileSizeBytes)}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Privacy & EXIF</span>
          <span className="text-xs font-medium block mt-0.5 text-amber-400">
            {hasMetadata ? 'Detected tags' : 'Clean'}
          </span>
        </div>
      </div>

      {/* Recommended actions checklist */}
      <div className="mt-5 space-y-2.5">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Recommended Optimizations:
        </div>

        <label className="flex items-start gap-3 p-3 rounded-xl bg-[#090d16]/70 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer">
          <input
            type="checkbox"
            checked={optCompress}
            onChange={(e) => setOptCompress(e.target.checked)}
            className="mt-0.5 accent-indigo-500 rounded cursor-pointer"
          />
          <div className="text-xs">
            <span className="font-semibold text-white block">Reduce file size (Smart Compression)</span>
            <span className="text-slate-400">
              Preserve visual crispness while compressing to web-ready ~450 KB (est. ~{Math.max(40, Math.round((1 - 450000 / Math.max(fileSizeBytes, 500000)) * 100))}% reduction).
            </span>
          </div>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-xl bg-[#090d16]/70 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer">
          <input
            type="checkbox"
            checked={optResize}
            onChange={(e) => setOptResize(e.target.checked)}
            className="mt-0.5 accent-indigo-500 rounded cursor-pointer"
          />
          <div className="text-xs">
            <span className="font-semibold text-white block">Scale for web & display (Max 1920px)</span>
            <span className="text-slate-400">
              Downsamples oversized camera resolution to Full HD 1920px bounds for lightning page loads.
            </span>
          </div>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-xl bg-[#090d16]/70 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer">
          <input
            type="checkbox"
            checked={optStripMeta}
            onChange={(e) => setOptStripMeta(e.target.checked)}
            className="mt-0.5 accent-indigo-500 rounded cursor-pointer"
          />
          <div className="text-xs">
            <span className="font-semibold text-white block">Strip metadata & EXIF privacy traces</span>
            <span className="text-slate-400">
              Removes camera serial, date/time, lens specs, and GPS geolocation coordinates.
            </span>
          </div>
        </label>
      </div>

      {/* Action button */}
      <div className="mt-5 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        {isDone ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-4 py-2 rounded-xl">
            <Check className="w-4 h-4" />
            <span>Image Optimized Successfully</span>
          </div>
        ) : (
          <button
            onClick={handleApply}
            disabled={isApplying || (!optCompress && !optResize && !optStripMeta)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Optimizing...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Optimize Image (1-Click)</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
