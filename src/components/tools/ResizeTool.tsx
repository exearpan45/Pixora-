import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Check, Sparkles, Monitor, Smartphone, Globe, User } from 'lucide-react';

interface ResizeToolProps {
  originalWidth: number;
  originalHeight: number;
  onApplyResize: (targetWidth: number, targetHeight: number) => void;
}

interface DimensionPreset {
  label: string;
  category: string;
  width: number;
  height: number;
  icon: React.ReactNode;
}

const PRESETS: DimensionPreset[] = [
  { label: 'Full HD', category: 'Display', width: 1920, height: 1080, icon: <Monitor className="w-3.5 h-3.5" /> },
  { label: 'HD 720p', category: 'Display', width: 1280, height: 720, icon: <Monitor className="w-3.5 h-3.5" /> },
  { label: 'Instagram Post', category: 'Social', width: 1080, height: 1080, icon: <Smartphone className="w-3.5 h-3.5" /> },
  { label: 'Twitter / X Header', category: 'Social', width: 1500, height: 500, icon: <Smartphone className="w-3.5 h-3.5" /> },
  { label: 'Website Hero', category: 'Web', width: 1440, height: 810, icon: <Globe className="w-3.5 h-3.5" /> },
  { label: 'Profile Avatar', category: 'Avatar', width: 512, height: 512, icon: <User className="w-3.5 h-3.5" /> },
  { label: 'Thumbnail', category: 'Web', width: 320, height: 180, icon: <Monitor className="w-3.5 h-3.5" /> },
];

export const ResizeTool: React.FC<ResizeToolProps> = ({
  originalWidth,
  originalHeight,
  onApplyResize,
}) => {
  const [width, setWidth] = useState(originalWidth);
  const [height, setHeight] = useState(originalHeight);
  const [lockAspect, setLockAspect] = useState(true);
  const [percentage, setPercentage] = useState(100);

  const aspectRatio = originalWidth / originalHeight;

  useEffect(() => {
    setWidth(originalWidth);
    setHeight(originalHeight);
    setPercentage(100);
  }, [originalWidth, originalHeight]);

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && val > 0) {
      setHeight(Math.round(val / aspectRatio));
    }
    setPercentage(Math.round((val / originalWidth) * 100));
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && val > 0) {
      setWidth(Math.round(val * aspectRatio));
    }
    setPercentage(Math.round((val / originalHeight) * 100));
  };

  const handlePercentageChange = (pct: number) => {
    setPercentage(pct);
    const newW = Math.round((originalWidth * pct) / 100);
    const newH = Math.round((originalHeight * pct) / 100);
    setWidth(newW);
    setHeight(newH);
  };

  const handleSelectPreset = (preset: DimensionPreset) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setPercentage(Math.round((preset.width / originalWidth) * 100));
  };

  const handleApply = () => {
    if (width > 0 && height > 0) {
      onApplyResize(width, height);
    }
  };

  return (
    <div className="space-y-5 text-xs text-slate-300">
      <div className="pb-3 border-b border-slate-800">
        <h4 className="text-sm font-semibold text-white">Resize Dimensions</h4>
        <p className="text-[11px] text-slate-400">Scale image with aspect-ratio preservation</p>
      </div>

      {/* Manual Dimensions inputs */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 items-center">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Width (px)</label>
            <input
              type="number"
              min="1"
              max="16000"
              value={width}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Height (px)</label>
            <input
              type="number"
              min="1"
              max="16000"
              value={height}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Lock Aspect Ratio Toggle */}
        <button
          onClick={() => setLockAspect(!lockAspect)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border w-full transition cursor-pointer ${
            lockAspect
              ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300'
              : 'bg-[#090d16] border-slate-800 text-slate-400'
          }`}
        >
          {lockAspect ? <Lock className="w-3.5 h-3.5 text-indigo-400" /> : <Unlock className="w-3.5 h-3.5" />}
          <span>{lockAspect ? 'Aspect ratio locked' : 'Freeform scaling (unlocked)'}</span>
        </button>
      </div>

      {/* Percentage scale quick buttons */}
      <div className="space-y-2">
        <div className="flex justify-between text-slate-400 text-[11px]">
          <span>Quick Scale:</span>
          <span className="font-mono text-white">{percentage}%</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => handlePercentageChange(pct)}
              className={`py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer ${
                percentage === pct
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-[#090d16] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Preset dimension tiles */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Standard Presets
        </span>
        <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handleSelectPreset(p)}
              className="flex items-center justify-between p-2 rounded-xl bg-[#090d16] border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-indigo-400">{p.icon}</span>
                <span className="font-medium text-slate-200">{p.label}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                {p.width} × {p.height}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        disabled={width <= 0 || height <= 0}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
      >
        <Check className="w-4 h-4" />
        <span>Apply Resize ({width} × {height})</span>
      </button>
    </div>
  );
};
