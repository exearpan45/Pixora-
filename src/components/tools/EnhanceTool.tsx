import React, { useState } from 'react';
import { Sparkles, Maximize2, Gauge, Check, RefreshCw, Wand2, Shield, Eye } from 'lucide-react';
import { ImageAdjustments } from '../../types';

interface EnhanceToolProps {
  adjustments: ImageAdjustments;
  originalWidth: number;
  originalHeight: number;
  onChangeAdjustments: (adj: ImageAdjustments) => void;
  onApplyAutoEnhance: () => void;
  onApplyDenoise: (intensity: 'low' | 'medium' | 'high') => void;
  onApplyUpscale: (scale: 2 | 4, sharpness: number) => Promise<void>;
  isProcessing?: boolean;
}

export const EnhanceTool: React.FC<EnhanceToolProps> = ({
  adjustments,
  originalWidth,
  originalHeight,
  onChangeAdjustments,
  onApplyAutoEnhance,
  onApplyDenoise,
  onApplyUpscale,
  isProcessing = false,
}) => {
  const [activeTab, setActiveTab] = useState<'enhance' | 'upscale' | 'denoise'>('enhance');
  const [upscaleFactor, setUpscaleFactor] = useState<2 | 4>(2);
  const [upscaleSharpness, setUpscaleSharpness] = useState<number>(35);
  const [isUpscaling, setIsUpscaling] = useState<boolean>(false);

  const handleUpscale = async () => {
    setIsUpscaling(true);
    try {
      await onApplyUpscale(upscaleFactor, upscaleSharpness);
    } finally {
      setIsUpscaling(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Enhance & Upscale</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Smart client-side algorithms for detail recovery, upscaling, and noise reduction.
        </p>
      </div>

      {/* Internal Subtabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium">
        <button
          onClick={() => setActiveTab('enhance')}
          className={`py-1.5 rounded-lg transition cursor-pointer ${
            activeTab === 'enhance' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Enhance
        </button>
        <button
          onClick={() => setActiveTab('upscale')}
          className={`py-1.5 rounded-lg transition cursor-pointer ${
            activeTab === 'upscale' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Upscale
        </button>
        <button
          onClick={() => setActiveTab('denoise')}
          className={`py-1.5 rounded-lg transition cursor-pointer ${
            activeTab === 'denoise' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Denoise
        </button>
      </div>

      {/* 70.2 QUALITY ENHANCER TAB */}
      {activeTab === 'enhance' && (
        <div className="space-y-5">
          {/* 1-Click Auto Enhance Button */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                1-Click Auto Enhance
              </span>
              <span className="text-[10px] text-indigo-300/80 bg-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
                Histogram Levels
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Dynamically stretches histogram range, boosts shadows, optimizes vibrance, and tightens micro-contrast.
            </p>
            <button
              onClick={onApplyAutoEnhance}
              disabled={isProcessing}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Auto Correction</span>
            </button>
          </div>

          {/* Granular Sliders */}
          <div className="space-y-4 pt-1">
            {/* Sharpness */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Sharpness</span>
                <span className="text-indigo-400 font-mono">{adjustments.sharpness}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.sharpness}
                onChange={(e) => onChangeAdjustments({ ...adjustments, sharpness: Number(e.target.value) })}
                className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Clarity & Contrast</span>
                <span className="text-indigo-400 font-mono">{adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="80"
                value={adjustments.contrast}
                onChange={(e) => onChangeAdjustments({ ...adjustments, contrast: Number(e.target.value) })}
                className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Brightness */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Luminance</span>
                <span className="text-indigo-400 font-mono">{adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={adjustments.brightness}
                onChange={(e) => onChangeAdjustments({ ...adjustments, brightness: Number(e.target.value) })}
                className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Vibrance / Saturation</span>
                <span className="text-indigo-400 font-mono">{adjustments.saturation > 0 ? `+${adjustments.saturation}` : adjustments.saturation}</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                value={adjustments.saturation}
                onChange={(e) => onChangeAdjustments({ ...adjustments, saturation: Number(e.target.value) })}
                className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* 70.1 IMAGE UPSCALER TAB */}
      {activeTab === 'upscale' && (
        <div className="space-y-5">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <span className="text-slate-400">Current Geometry:</span>
            <div className="font-mono text-white text-sm font-semibold">
              {originalWidth} × {originalHeight} px
            </div>
            <div className="text-[11px] text-slate-400">
              Target Dimensions:{' '}
              <span className="text-cyan-400 font-mono font-semibold">
                {originalWidth * upscaleFactor} × {originalHeight * upscaleFactor} px
              </span>{' '}
              ({upscaleFactor === 2 ? '4×' : '16×'} total pixels)
            </div>
          </div>

          {/* Scale selection */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium">Enlargement Scale</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUpscaleFactor(2)}
                className={`py-3 px-4 rounded-xl border text-center transition cursor-pointer ${
                  upscaleFactor === 2
                    ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-sm">2× Scale</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">High definition</div>
              </button>

              <button
                type="button"
                onClick={() => setUpscaleFactor(4)}
                className={`py-3 px-4 rounded-xl border text-center transition cursor-pointer ${
                  upscaleFactor === 4
                    ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-sm">4× Scale</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Ultra 4K/Print</div>
              </button>
            </div>
          </div>

          {/* Sharpness preservation */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Edge Sharpness</span>
              <span className="text-indigo-400 font-mono">{upscaleSharpness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={upscaleSharpness}
              onChange={(e) => setUpscaleSharpness(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl text-[11px] text-amber-300/80 leading-relaxed">
            Note: Client-side bicubic multi-step interpolation with edge preservation. Does not fabricate hallucinated AI textures.
          </div>

          <button
            onClick={handleUpscale}
            disabled={isUpscaling}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isUpscaling ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Interpolating pixels...</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Upscale to {originalWidth * upscaleFactor} × {originalHeight * upscaleFactor}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 70.3 IMAGE DENOISE TAB */}
      {activeTab === 'denoise' && (
        <div className="space-y-5">
          <p className="text-xs text-slate-400 leading-relaxed">
            Adaptive smoothing filter that removes camera sensor grain and JPEG compression artifacts while preserving high-contrast edge boundaries.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as const).map((intensity) => (
              <button
                key={intensity}
                onClick={() => onApplyDenoise(intensity)}
                disabled={isProcessing}
                className="py-3 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-center transition cursor-pointer text-xs group"
              >
                <div className="font-bold text-white capitalize group-hover:text-indigo-300">
                  {intensity}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {intensity === 'low' ? 'Subtle grain' : intensity === 'medium' ? 'Standard' : 'Aggressive'}
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 leading-relaxed">
            Tip: For photos taken in low-light with high ISO, apply <strong className="text-slate-200">Medium</strong> followed by subtle unsharp sharpening in the Adjust tab.
          </div>
        </div>
      )}
    </div>
  );
};
