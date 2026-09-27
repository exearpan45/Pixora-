import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Shield, ArrowRight, Layers, Zap, AlertTriangle, X } from 'lucide-react';
import { SAMPLE_IMAGES, SampleItem } from '../constants/samples';
import { validateImageFile } from '../utils/fileValidation';

interface UploadZoneProps {
  onImageSelected: (file: File) => void;
  onSampleSelected: (sample: SampleItem) => void;
  onBatchSelected?: (files: File[]) => void;
  onOpenTestSuite?: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onImageSelected,
  onSampleSelected,
  onBatchSelected,
  onOpenTestSuite,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{ message: string; advice?: string } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleIncomingFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null);

    if (files.length === 1) {
      const file = files[0];
      const validation = await validateImageFile(file);
      if (!validation.valid) {
        setErrorMessage({
          message: validation.errorMessage || 'Unsupported file format.',
          advice: validation.advice || 'Please choose a standard JPG, PNG, or WebP image.',
        });
        return;
      }
      onImageSelected(file);
    } else if (onBatchSelected) {
      // Filter valid files for batch
      const validFiles: File[] = [];
      let rejectedCount = 0;
      for (const f of files) {
        const v = await validateImageFile(f);
        if (v.valid) validFiles.push(f);
        else rejectedCount++;
      }
      if (validFiles.length > 0) {
        onBatchSelected(validFiles);
      } else if (rejectedCount > 0) {
        setErrorMessage({
          message: 'No valid image files found in selection.',
          advice: 'Please choose supported image formats (JPG, PNG, WebP).',
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleIncomingFiles(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    handleIncomingFiles(files);
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      {/* Brand Hero Heading */}
      <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white" style={{ textWrap: 'balance' }}>
          Every image. Every tool.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
            One workspace.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed" style={{ textWrap: 'balance' }}>
          Edit, resize, compress, convert, enhance, and optimize your images directly in your browser with private, zero-upload processing.
        </p>
      </div>

      {/* User-facing Friendly Error Alert (Section 51.M & 56.8) */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 flex items-start justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-200 block text-sm">{errorMessage.message}</span>
              {errorMessage.advice && <p className="text-slate-300 mt-0.5">{errorMessage.advice}</p>}
            </div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Drag & Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden p-8 sm:p-14 text-center ${
          isDragging
            ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01] shadow-2xl shadow-indigo-500/20'
            : 'border-slate-800 hover:border-slate-700 bg-[#0e1422]/90 hover:bg-[#111827]/90 shadow-xl'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Ambient subtle backglow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/15 transition-all" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center group-hover:scale-105 group-hover:border-indigo-400/50 transition-all shadow-inner">
            <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Drop an image here
            </h2>
            <p className="text-sm text-slate-400">
              or <span className="text-indigo-400 font-semibold group-hover:underline">browse files</span> from your computer
            </p>
          </div>

          <div className="pt-2 text-xs font-mono text-slate-400 tracking-wider">
            JPG · PNG · WEBP · JPEG · GIF · BMP · SVG
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              100% Private (Runs locally)
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              High Performance Web APIs
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Supports Batch Processing
            </span>
          </div>
        </div>
      </div>

      {/* Try with sample images */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Or test with high-resolution samples:
          </div>
          <span className="text-xs text-slate-400">Instant one-click load</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={(e) => {
                e.stopPropagation();
                onSampleSelected(sample);
              }}
              className="group relative flex items-center gap-3.5 p-3 rounded-2xl bg-[#0f1523] border border-slate-800/80 hover:border-indigo-500/50 hover:bg-[#141b2c] transition-all text-left cursor-pointer active:scale-98"
            >
              <img
                src={sample.src}
                alt={sample.title}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border border-slate-700/60 group-hover:scale-105 transition-transform"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-indigo-400 font-medium">{sample.category}</div>
                <div className="text-sm font-semibold text-white truncate">{sample.title}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{sample.dimensions}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
