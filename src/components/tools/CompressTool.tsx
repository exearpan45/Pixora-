import React, { useState } from 'react';
import { Sparkles, Gauge, ArrowDown, Check, Zap, Percent } from 'lucide-react';
import { formatBytes } from '../../utils/imageProcessing';

interface CompressToolProps {
  originalSizeBytes: number;
  currentSizeBytes?: number;
  onApplyCompression: (options: {
    mode: 'preset' | 'target' | 'custom';
    presetQuality?: number;
    targetKb?: number;
  }) => Promise<void>;
  isProcessing: boolean;
}

export const CompressTool: React.FC<CompressToolProps> = ({
  originalSizeBytes,
  currentSizeBytes,
  onApplyCompression,
  isProcessing,
}) => {
  const [mode, setMode] = useState<'preset' | 'target' | 'custom'>('preset');
  const [selectedQuality, setSelectedQuality] = useState<number>(0.8);
  const [targetKb, setTargetKb] = useState<number>(Math.max(100, Math.round(originalSizeBytes / (1024 * 3))));
  const [customQuality, setCustomQuality] = useState<number>(75);

  const presets = [
    { label: 'Maximum Quality', quality: 0.92, desc: 'Indistinguishable from original, light compression' },
    { label: 'Balanced', quality: 0.8, desc: 'Recommended balance of visual crispness and size' },
    { label: 'Web Optimized', quality: 0.65, desc: 'Optimized for fast web page loading & mobile networks' },
    { label: 'Smallest File', quality: 0.42, desc: 'High compression for messaging and low-bandwidth use' },
  ];

  const handleApply = async () => {
    if (mode === 'preset') {
      await onApplyCompression({ mode: 'preset', presetQuality: selectedQuality });
    } else if (mode === 'target') {
      await onApplyCompression({ mode: 'target', targetKb });
    } else {
      await onApplyCompression({ mode: 'custom', presetQuality: customQuality / 100 });
    }
  };

  const savedBytes = currentSizeBytes ? Math.max(0, originalSizeBytes - currentSizeBytes) : 0;
  const savedPercent = currentSizeBytes
    ? Math.max(0, Math.round(((originalSizeBytes - currentSizeBytes) / originalSizeBytes) * 100))
    : 0;

  return (
    <div className="space-y-5 text-xs text-slate-300">
      <div className="pb-3 border-b border-slate-800">
        <h4 className="text-sm font-semibold text-white">Smart Compression</h4>
        <p className="text-[11px] text-slate-400">Reduce payload bytes while preserving high optical fidelity</p>
      </div>

      {/* Before / After Stats Card */}
      {currentSizeBytes !== undefined && currentSizeBytes > 0 && (
        <div className="p-3.5 rounded-2xl bg-[#090d16] border border-slate-800 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block">Original</span>
              <span className="text-xs font-mono font-semibold text-white block mt-0.5">
                {formatBytes(originalSizeBytes)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Compressed</span>
              <span className="text-xs font-mono font-semibold text-cyan-300 block mt-0.5">
                {formatBytes(currentSizeBytes)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Saved</span>
              <span className="text-xs font-mono font-bold text-emerald-400 block mt-0.5">
                {savedPercent}%
              </span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.min(100, savedPercent)}%` }}
            />
          </div>
        </div>
      )}

      {/* Mode Switcher */}
      <div className="flex rounded-xl bg-[#090d16] p-1 border border-slate-800">
        <button
          onClick={() => setMode('preset')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            mode === 'preset' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Presets
        </button>
        <button
          onClick={() => setMode('target')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            mode === 'target' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Target Size
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            mode === 'custom' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Custom %
        </button>
      </div>

      {/* Preset List */}
      {mode === 'preset' && (
        <div className="space-y-2">
          {presets.map((p) => {
            const isSelected = selectedQuality === p.quality;
            return (
              <button
                key={p.label}
                onClick={() => setSelectedQuality(p.quality)}
                className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 shadow-sm'
                    : 'bg-[#090d16] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`font-semibold ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                    {p.label}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">{Math.round(p.quality * 100)}%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">{p.desc}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Target Size mode */}
      {mode === 'target' && (
        <div className="space-y-3 p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
          <label className="text-[11px] font-medium text-slate-300 block">
            Desired File Target (KB)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="20"
              max="50000"
              value={targetKb}
              onChange={(e) => setTargetKb(parseInt(e.target.value) || 100)}
              className="flex-1 bg-[#0b0f17] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-slate-400 font-mono text-xs">KB</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Pixora performs iterative binary search across quantization curves to achieve this exact file target.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[200, 400, 600, 1000].map((presetKb) => (
              <button
                key={presetKb}
                onClick={() => setTargetKb(presetKb)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition cursor-pointer"
              >
                {presetKb} KB
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Quality Slider */}
      {mode === 'custom' && (
        <div className="space-y-3 p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-medium text-slate-300">Quantization Quality</span>
            <span className="font-mono text-white text-xs">{customQuality}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={customQuality}
            onChange={(e) => setCustomQuality(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Aggressive (10%)</span>
            <span>Lossless (100%)</span>
          </div>
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
            Optimizing Pixels...
          </span>
        ) : (
          <>
            <Zap className="w-4 h-4 text-cyan-300" />
            <span>Process Compression</span>
          </>
        )}
      </button>
    </div>
  );
};
