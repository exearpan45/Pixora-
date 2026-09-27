import React from 'react';
import { BackgroundSettings } from '../../types';
import { Sparkles, Droplets, Palette, Layers, RefreshCcw } from 'lucide-react';

interface BackgroundToolProps {
  settings: BackgroundSettings;
  onChange: (settings: BackgroundSettings) => void;
  onApply: () => void;
  onReset: () => void;
  isProcessing: boolean;
}

export const BackgroundTool: React.FC<BackgroundToolProps> = ({
  settings,
  onChange,
  onApply,
  onReset,
  isProcessing,
}) => {
  const update = (partial: Partial<BackgroundSettings>) => {
    onChange({
      ...settings,
      ...partial,
    });
  };

  const modes: { id: BackgroundSettings['mode']; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'original',
      label: 'Original',
      icon: <RefreshCcw className="w-3.5 h-3.5" />,
      desc: 'Keep original scene backdrop untouched',
    },
    {
      id: 'transparent',
      label: 'Transparent (Alpha)',
      icon: <Layers className="w-3.5 h-3.5" />,
      desc: 'Extract subject and export with transparent PNG alpha',
    },
    {
      id: 'color',
      label: 'Solid Color Fill',
      icon: <Palette className="w-3.5 h-3.5" />,
      desc: 'Replace background with custom studio tint or backdrop',
    },
    {
      id: 'blur',
      label: 'Depth Blur Bokeh',
      icon: <Droplets className="w-3.5 h-3.5" />,
      desc: 'Simulate DSLR lens aperture depth-of-field blur',
    },
  ];

  const studioColors = [
    '#ffffff',
    '#f8fafc',
    '#0f172a',
    '#312e81',
    '#1e293b',
    '#e2e8f0',
    '#fef3c7',
    '#e0e7ff',
  ];

  return (
    <div className="space-y-5 text-xs text-slate-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white">Background Tools</h4>
          <p className="text-[11px] text-slate-400">Subject extraction, studio backdrop, and bokeh</p>
        </div>
        {settings.mode !== 'original' && (
          <button
            onClick={onReset}
            className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 transition cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Mode Selector Cards */}
      <div className="space-y-2">
        {modes.map((m) => {
          const isSelected = settings.mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => update({ mode: m.id })}
              className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-sm'
                  : 'bg-[#090d16] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={isSelected ? 'text-indigo-400' : 'text-slate-400'}>{m.icon}</span>
                <span className={`font-semibold ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                  {m.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal pl-5">{m.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Mode specific settings */}
      {settings.mode === 'color' && (
        <div className="space-y-3 p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
          <label className="text-[11px] font-semibold text-slate-300 block">Studio Backdrop Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.color}
              onChange={(e) => update({ color: e.target.value })}
              className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
            <span className="font-mono text-xs text-white uppercase">{settings.color}</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {studioColors.map((hex) => (
              <button
                key={hex}
                onClick={() => update({ color: hex })}
                className="w-6 h-6 rounded-full border border-slate-700 hover:scale-110 transition shadow-sm cursor-pointer"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>
      )}

      {settings.mode === 'blur' && (
        <div className="space-y-2 p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-medium text-slate-300">Bokeh Blur Intensity</span>
            <span className="font-mono text-white text-xs">{settings.blurAmount}px</span>
          </div>
          <input
            type="range"
            min="4"
            max="40"
            value={settings.blurAmount}
            onChange={(e) => update({ blurAmount: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}

      {settings.mode !== 'original' && (
        <div className="space-y-2 p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-medium text-slate-300">Edge & Chroma Sensitivity</span>
            <span className="font-mono text-white text-xs">{settings.tolerance}</span>
          </div>
          <input
            type="range"
            min="10"
            max="70"
            value={settings.tolerance}
            onChange={(e) => update({ tolerance: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 block">
            Fine-tune threshold to separate foreground subject from backdrop.
          </span>
        </div>
      )}

      {/* Action Button */}
      {settings.mode !== 'original' && (
        <button
          onClick={onApply}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing Backdrop...
            </span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Apply Background Change</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
