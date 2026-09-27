import React, { useState } from 'react';
import { Pipette, Palette, Copy, Check, Download, Code, Sparkles } from 'lucide-react';
import { ColorInfo } from '../../types';

interface ColorToolProps {
  sampledColor: ColorInfo | null;
  recentColors: ColorInfo[];
  palette: ColorInfo[];
  onExtractPalette: () => void;
  isPickingMode: boolean;
  onTogglePickingMode: (enabled: boolean) => void;
}

export const ColorTool: React.FC<ColorToolProps> = ({
  sampledColor,
  recentColors,
  palette,
  onExtractPalette,
  isPickingMode,
  onTogglePickingMode,
}) => {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(label);
    setTimeout(() => setCopiedValue(null), 1800);
  };

  const handleCopyCSS = () => {
    const cssVars = palette
      .map((c, i) => `  --color-brand-${i + 1}: ${c.hex};`)
      .join('\n');
    const fullCSS = `:root {\n${cssVars}\n}`;
    copyToClipboard(fullCSS, 'CSS Variables');
  };

  const handleCopyJSON = () => {
    const jsonStr = JSON.stringify(
      palette.map((c) => ({ hex: c.hex, rgb: c.rgb, hsl: c.hsl, prominence: c.prominence })),
      null,
      2
    );
    copyToClipboard(jsonStr, 'JSON Array');
  };

  const handleDownloadSwatch = () => {
    if (palette.length === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = palette.length * 120;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    palette.forEach((color, i) => {
      ctx.fillStyle = color.hex;
      ctx.fillRect(i * 120, 0, 120, 110);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(i * 120, 110, 120, 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(color.hex.toUpperCase(), i * 120 + 60, 132);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${color.prominence}%`, i * 120 + 60, 148);
    });

    const a = document.createElement('a');
    a.download = 'pixora-color-palette.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Title */}
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Pipette className="w-4 h-4 text-cyan-400" />
          <span>Color Sampler & Palette</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Sample pixel coordinates and extract dominant color palettes with exportable CSS & JSON tokens.
        </p>
      </div>

      {/* 70.7 IMAGE COLOR PICKER MODE */}
      <div className="space-y-3">
        <button
          onClick={() => onTogglePickingMode(!isPickingMode)}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition cursor-pointer ${
            isPickingMode
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md ring-2 ring-cyan-500/30'
              : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800'
          }`}
        >
          <Pipette className={`w-4 h-4 ${isPickingMode ? 'animate-bounce text-cyan-400' : ''}`} />
          <span>{isPickingMode ? 'Click Anywhere on Image to Sample' : 'Activate Eyedropper'}</span>
        </button>

        {/* Sampled Color Card */}
        {sampledColor ? (
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl border border-white/20 shadow-md shrink-0"
                style={{ backgroundColor: sampledColor.hex }}
              />
              <div className="min-w-0 flex-1">
                <div className="font-mono text-white font-bold text-sm">
                  {sampledColor.hex.toUpperCase()}
                </div>
                <div className="font-mono text-[11px] text-slate-400 truncate">
                  {sampledColor.rgb}
                </div>
                <div className="font-mono text-[10px] text-slate-500 truncate">
                  {sampledColor.hsl}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => copyToClipboard(sampledColor.hex, 'HEX')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copiedValue === 'HEX' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy HEX</span>
              </button>

              <button
                onClick={() => copyToClipboard(sampledColor.rgb, 'RGB')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copiedValue === 'RGB' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy RGB</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-center text-xs text-slate-400">
            Click on the image canvas above to inspect precise HEX, RGB, HSL and HSV color values.
          </div>
        )}

        {/* Recent sampled swatches */}
        {recentColors.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Recent Samples:</span>
            <div className="flex flex-wrap gap-1.5">
              {recentColors.map((rc, idx) => (
                <button
                  key={idx}
                  onClick={() => copyToClipboard(rc.hex, rc.hex)}
                  title={`${rc.hex} (${rc.rgb})`}
                  className="w-7 h-7 rounded-lg border border-white/20 shadow-sm transition hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: rc.hex }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-[1px] bg-slate-800 my-2" />

      {/* 70.8 COLOR PALETTE EXTRACTOR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>Extracted Harmony Palette</span>
          </label>
          <button
            onClick={onExtractPalette}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 cursor-pointer font-medium"
          >
            <Sparkles className="w-3 h-3" />
            <span>Rescan</span>
          </button>
        </div>

        {palette.length === 0 ? (
          <button
            onClick={onExtractPalette}
            className="w-full py-3 border border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl text-xs text-slate-400 hover:text-white transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Generate Dominant Palette</span>
          </button>
        ) : (
          <div className="space-y-2.5">
            {/* Visual Bar */}
            <div className="h-6 rounded-xl overflow-hidden flex shadow-inner border border-slate-800">
              {palette.map((col, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: col.hex,
                    width: `${col.prominence || 16}%`,
                  }}
                  title={`${col.hex} (${col.prominence}%)`}
                  className="h-full transition-all hover:opacity-90"
                />
              ))}
            </div>

            {/* List with Prominence */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {palette.map((col, i) => (
                <div
                  key={i}
                  onClick={() => copyToClipboard(col.hex, col.hex)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 transition cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-5 h-5 rounded-md border border-white/20 shrink-0"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span className="font-mono text-slate-200 font-semibold">{col.hex.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>{col.prominence}%</span>
                    <Copy className="w-3 h-3 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>

            {/* Export Palette Actions */}
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px]">
              <button
                onClick={handleCopyCSS}
                className="py-2 px-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-medium flex flex-col items-center justify-center gap-1 transition cursor-pointer"
                title="Copy CSS variables"
              >
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>CSS Vars</span>
              </button>

              <button
                onClick={handleCopyJSON}
                className="py-2 px-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-medium flex flex-col items-center justify-center gap-1 transition cursor-pointer"
                title="Copy JSON tokens"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>JSON</span>
              </button>

              <button
                onClick={handleDownloadSwatch}
                className="py-2 px-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-medium flex flex-col items-center justify-center gap-1 transition cursor-pointer"
                title="Download PNG color swatch strip"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>PNG Swatch</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {copiedValue && (
        <div className="p-2 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-center text-xs text-emerald-300 font-medium animate-in fade-in">
          Copied {copiedValue} to clipboard!
        </div>
      )}
    </div>
  );
};
