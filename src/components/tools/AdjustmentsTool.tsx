import React from 'react';
import { RotateCcw, Sun, Contrast, Droplets, Gauge, Thermometer, Sparkles, Eye, ShieldAlert } from 'lucide-react';
import { ImageAdjustments } from '../../types';
import { DEFAULT_ADJUSTMENTS } from '../../utils/imageProcessing';

interface AdjustmentsToolProps {
  adjustments: ImageAdjustments;
  onChange: (adj: ImageAdjustments) => void;
  onReset: () => void;
}

export const AdjustmentsTool: React.FC<AdjustmentsToolProps> = ({
  adjustments,
  onChange,
  onReset,
}) => {
  const updateField = (key: keyof ImageAdjustments, value: number) => {
    onChange({
      ...adjustments,
      [key]: value,
    });
  };

  const isModified = Object.keys(adjustments).some(
    (k) => adjustments[k as keyof ImageAdjustments] !== DEFAULT_ADJUSTMENTS[k as keyof ImageAdjustments]
  );

  return (
    <div className="space-y-5 text-xs text-slate-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white">Adjustments</h4>
          <p className="text-[11px] text-slate-400">Live studio color and exposure balancing</p>
        </div>
        {isModified && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-md transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Brightness */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Brightness
            </span>
            <span className="font-mono tabular-nums text-slate-400">
              {adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.brightness}
            onChange={(e) => updateField('brightness', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <Contrast className="w-3.5 h-3.5 text-indigo-400" />
              Contrast
            </span>
            <span className="font-mono tabular-nums text-slate-400">
              {adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.contrast}
            onChange={(e) => updateField('contrast', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Saturation */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Saturation
            </span>
            <span className="font-mono tabular-nums text-slate-400">
              {adjustments.saturation > 0 ? `+${adjustments.saturation}` : adjustments.saturation}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.saturation}
            onChange={(e) => updateField('saturation', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Exposure */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              Exposure
            </span>
            <span className="font-mono tabular-nums text-slate-400">
              {adjustments.exposure > 0 ? `+${adjustments.exposure}` : adjustments.exposure}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.exposure}
            onChange={(e) => updateField('exposure', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Temperature */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              Temperature (Cool / Warm)
            </span>
            <span className="font-mono tabular-nums text-slate-400">
              {adjustments.temperature > 0 ? `+${adjustments.temperature}` : adjustments.temperature}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.temperature}
            onChange={(e) => updateField('temperature', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Tint */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span>Tint (Green / Magenta)</span>
            <span className="font-mono tabular-nums text-slate-400">
              {adjustments.tint > 0 ? `+${adjustments.tint}` : adjustments.tint}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.tint}
            onChange={(e) => updateField('tint', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Sharpness */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Sharpness (Convolution)
            </span>
            <span className="font-mono tabular-nums text-slate-400">{adjustments.sharpness}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={adjustments.sharpness}
            onChange={(e) => updateField('sharpness', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Blur */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span>Soft Blur</span>
            <span className="font-mono tabular-nums text-slate-400">{adjustments.blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={adjustments.blur}
            onChange={(e) => updateField('blur', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Vignette */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span>Vignette Edge</span>
            <span className="font-mono tabular-nums text-slate-400">{adjustments.vignette}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={adjustments.vignette}
            onChange={(e) => updateField('vignette', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
