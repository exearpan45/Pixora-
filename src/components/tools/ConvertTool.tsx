import React, { useState } from 'react';
import { ExportFormat } from '../../types';
import { RefreshCw, Check, FileType, Sparkles } from 'lucide-react';

interface ConvertToolProps {
  currentFormat: string;
  onApplyConvert: (targetFormat: ExportFormat, quality: number) => Promise<void>;
  isProcessing: boolean;
}

export const ConvertTool: React.FC<ConvertToolProps> = ({
  currentFormat,
  onApplyConvert,
  isProcessing,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('image/webp');
  const [quality, setQuality] = useState<number>(0.85);

  const formats: { id: ExportFormat; label: string; badge: string; desc: string }[] = [
    {
      id: 'image/webp',
      label: 'WebP Format',
      badge: 'Recommended',
      desc: 'Next-gen web format offering 30%+ smaller file size with full alpha transparency support.',
    },
    {
      id: 'image/jpeg',
      label: 'JPEG / JPG',
      badge: 'Universal',
      desc: 'Maximum compatibility across all browsers, smartphones, legacy software, and print.',
    },
    {
      id: 'image/png',
      label: 'PNG Lossless',
      badge: 'Crisp & Alpha',
      desc: 'Pixel-perfect lossless compression with crisp typography, lines, and transparency.',
    },
  ];

  const handleApply = async () => {
    await onApplyConvert(selectedFormat, quality);
  };

  return (
    <div className="space-y-5 text-xs text-slate-300">
      <div className="pb-3 border-b border-slate-800">
        <h4 className="text-sm font-semibold text-white">Convert Image Format</h4>
        <p className="text-[11px] text-slate-400">Re-encode container between modern and standard codecs</p>
      </div>

      {/* Format Selection Cards */}
      <div className="space-y-2.5">
        {formats.map((f) => {
          const isSelected = selectedFormat === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFormat(f.id)}
              className={`w-full p-3 rounded-xl border text-left transition cursor-pointer ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-sm'
                  : 'bg-[#090d16] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`font-semibold text-xs ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                  {f.label}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {f.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">{f.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Quality slider for WebP and JPEG */}
      {selectedFormat !== 'image/png' && (
        <div className="space-y-2 p-3 rounded-xl bg-[#090d16] border border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-medium text-slate-300">Encoding Quality</span>
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

      {/* Action Button */}
      <button
        onClick={handleApply}
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Transcoding...
          </span>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 text-cyan-300" />
            <span>Convert to {selectedFormat.replace('image/', '').toUpperCase()}</span>
          </>
        )}
      </button>
    </div>
  );
};
