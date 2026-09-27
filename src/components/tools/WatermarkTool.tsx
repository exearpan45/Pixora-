import React, { useRef } from 'react';
import { WatermarkSettings } from '../../types';
import {
  Type,
  Image as ImageIcon,
  Grid,
  Check,
  ShieldCheck,
  Upload,
  RotateCcw,
  Sparkles,
  Layers,
  MapPin,
  Eye,
  EyeOff,
  SunMedium,
  Square,
  Maximize2
} from 'lucide-react';

interface WatermarkToolProps {
  watermark: WatermarkSettings;
  onChange: (wm: WatermarkSettings) => void;
  onCommit?: () => void;
}

const PRESET_LOGOS = [
  {
    id: 'verified',
    name: 'Verified Shield',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="70" viewBox="0 0 240 70"><rect width="240" height="70" rx="14" fill="%230f172a" fill-opacity="0.85" stroke="%2338bdf8" stroke-width="2"/><path d="M30 22 L45 28 L45 42 Q45 52 30 58 Q15 52 15 42 L15 28 Z" fill="%230284c7" stroke="%2338bdf8" stroke-width="2"/><path d="M24 39 L28 44 L37 32" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/><text x="60" y="34" fill="white" font-family="system-ui, sans-serif" font-size="14" font-weight="700" letter-spacing="1">VERIFIED ASSET</text><text x="60" y="50" fill="%2394a3b8" font-family="system-ui, sans-serif" font-size="10" font-weight="500">© 2026 ALL RIGHTS RESERVED</text></svg>`,
  },
  {
    id: 'copyright',
    name: 'Copyright Seal',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><rect width="200" height="60" rx="30" fill="%2318181b" fill-opacity="0.9" stroke="%23f59e0b" stroke-width="2"/><circle cx="32" cy="30" r="16" fill="%23f59e0b"/><text x="32" y="36" fill="%2318181b" font-family="system-ui, sans-serif" font-size="18" font-weight="900" text-anchor="middle">©</text><text x="58" y="31" fill="%23ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="800" letter-spacing="0.5">COPYRIGHT</text><text x="58" y="45" fill="%23f59e0b" font-family="system-ui, sans-serif" font-size="9" font-weight="700" letter-spacing="1">DO NOT DISTRIBUTE</text></svg>`,
  },
  {
    id: 'draft',
    name: 'Confidential Draft',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60" viewBox="0 0 220 60"><rect width="220" height="60" rx="8" fill="%23991b1b" fill-opacity="0.85" stroke="%23f87171" stroke-width="2" stroke-dasharray="6,4"/><text x="110" y="34" fill="white" font-family="Impact, system-ui, sans-serif" font-size="20" font-weight="900" letter-spacing="3" text-anchor="middle">CONFIDENTIAL</text><text x="110" y="49" fill="%23fecaca" font-family="system-ui, sans-serif" font-size="9" font-weight="700" letter-spacing="1.5" text-anchor="middle">PROOF ONLY • NOT FINAL</text></svg>`,
  },
  {
    id: 'pixora',
    name: 'Pixora Monogram',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="54" viewBox="0 0 180 54"><rect width="180" height="54" rx="12" fill="%23090d16" fill-opacity="0.9" stroke="%236366f1" stroke-width="1.5"/><circle cx="28" cy="27" r="14" fill="%234f46e5"/><polygon points="28,17 37,32 19,32" fill="white"/><text x="50" y="34" fill="white" font-family="system-ui, sans-serif" font-size="16" font-weight="800" letter-spacing="0.5">PIXORA</text></svg>`,
  },
];

const TEXT_PRESETS = [
  '© 2026 Studio',
  'Pixora Workspace',
  'CONFIDENTIAL',
  'SAMPLE PROOF',
  'DO NOT COPY',
  'ORIGINAL PHOTO',
];

const COLOR_SWATCHES = [
  { label: 'White', hex: '#ffffff' },
  { label: 'Black', hex: '#000000' },
  { label: 'Gold', hex: '#f59e0b' },
  { label: 'Yellow', hex: '#eab308' },
  { label: 'Cyan', hex: '#06b6d4' },
  { label: 'Rose', hex: '#f43f5e' },
];

const FONT_OPTIONS = [
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta (Modern)' },
  { id: 'Inter', label: 'Inter (Clean Neutral)' },
  { id: 'Roboto', label: 'Roboto (Standard)' },
  { id: 'Playfair Display', label: 'Playfair (Editorial Serif)' },
  { id: 'Space Mono', label: 'Space Mono (Technical)' },
  { id: 'Impact', label: 'Impact (Bold Stamp)' },
];

export const WatermarkTool: React.FC<WatermarkToolProps> = ({
  watermark,
  onChange,
  onCommit,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const update = (partial: Partial<WatermarkSettings>) => {
    onChange({
      ...watermark,
      ...partial,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        update({
          type: 'image',
          imageUrl: event.target.result as string,
          enabled: true,
        });
        if (onCommit) onCommit();
      }
    };
    reader.readAsDataURL(file);
  };

  const positions: { id: WatermarkSettings['position']; label: string }[] = [
    { id: 'top-left', label: 'Top Left' },
    { id: 'top-right', label: 'Top Right' },
    { id: 'center', label: 'Center' },
    { id: 'bottom-left', label: 'Bottom Left' },
    { id: 'bottom-right', label: 'Bottom Right' },
    { id: 'tile', label: 'Tiled Pattern' },
  ];

  return (
    <div className="space-y-4 text-xs text-slate-300">
      {/* Header & Master Toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#090d16] border border-slate-800">
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-semibold text-white">Watermark Stamp</h4>
            <span
              className={`w-2 h-2 rounded-full ${
                watermark.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            {watermark.enabled ? 'Active on canvas & export' : 'Watermark is disabled'}
          </p>
        </div>
        <button
          onClick={() => {
            update({ enabled: !watermark.enabled });
            if (onCommit) onCommit();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            watermark.enabled
              ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-500'
              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
        >
          {watermark.enabled ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Enabled</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Enable Now</span>
            </>
          )}
        </button>
      </div>

      {/* Main Controls */}
      <div className="space-y-4">
        {/* Type Selector (Text vs Logo Image) */}
        <div className="flex rounded-xl bg-[#090d16] p-1 border border-slate-800">
          <button
            onClick={() => {
              update({ type: 'text', enabled: true });
              if (onCommit) onCommit();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              watermark.type === 'text'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Text Stamp</span>
          </button>
          <button
            onClick={() => {
              update({
                type: 'image',
                enabled: true,
                // Default to first preset if imageUrl is not set yet
                imageUrl: watermark.imageUrl || PRESET_LOGOS[0].dataUrl,
              });
              if (onCommit) onCommit();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              watermark.type === 'image'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Logo Image</span>
          </button>
        </div>

        {/* Text Mode Settings */}
        {watermark.type === 'text' ? (
          <div className="space-y-3 p-3 rounded-xl bg-[#090d16] border border-slate-800">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-slate-300">Watermark Text</label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {(watermark.text || '').length} chars
                </span>
              </div>
              <input
                type="text"
                value={watermark.text}
                onChange={(e) => update({ text: e.target.value, enabled: true })}
                onBlur={onCommit}
                placeholder="e.g. © 2026 Your Studio"
                className="w-full bg-[#0d1322] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-indigo-500 focus:outline-none placeholder:text-slate-600 font-medium"
              />
            </div>

            {/* Quick Text Preset Chips */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Quick Presets:</span>
              <div className="flex flex-wrap gap-1">
                {TEXT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      update({ text: preset, enabled: true });
                      if (onCommit) onCommit();
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer border ${
                      watermark.text === preset
                        ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Font */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-400">Typography Font</label>
              <select
                value={watermark.fontFamily || 'Plus Jakarta Sans'}
                onChange={(e) => {
                  update({ fontFamily: e.target.value, enabled: true });
                  if (onCommit) onCommit();
                }}
                className="w-full bg-[#0d1322] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Styling Mode (High Contrast Shadow / Badge Pill / Outline / Clean) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400">Visibility Style</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    update({
                      hasShadow: true,
                      hasOutline: false,
                      hasPill: false,
                      style: 'shadow',
                      enabled: true,
                    });
                    if (onCommit) onCommit();
                  }}
                  className={`p-1.5 rounded-lg border text-center text-[11px] transition cursor-pointer ${
                    (watermark.hasShadow ?? true) && !watermark.hasPill && !watermark.hasOutline
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-medium'
                      : 'bg-[#0d1322] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Drop Shadow (Crisp)
                </button>
                <button
                  onClick={() => {
                    update({
                      hasPill: true,
                      hasShadow: false,
                      hasOutline: false,
                      style: 'badge',
                      enabled: true,
                    });
                    if (onCommit) onCommit();
                  }}
                  className={`p-1.5 rounded-lg border text-center text-[11px] transition cursor-pointer ${
                    watermark.hasPill
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-medium'
                      : 'bg-[#0d1322] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Badge Pill Backdrop
                </button>
                <button
                  onClick={() => {
                    update({
                      hasOutline: true,
                      hasShadow: false,
                      hasPill: false,
                      style: 'outline',
                      enabled: true,
                    });
                    if (onCommit) onCommit();
                  }}
                  className={`p-1.5 rounded-lg border text-center text-[11px] transition cursor-pointer ${
                    watermark.hasOutline
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-medium'
                      : 'bg-[#0d1322] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Contrasting Outline
                </button>
                <button
                  onClick={() => {
                    update({
                      hasShadow: false,
                      hasOutline: false,
                      hasPill: false,
                      style: 'clean',
                      enabled: true,
                    });
                    if (onCommit) onCommit();
                  }}
                  className={`p-1.5 rounded-lg border text-center text-[11px] transition cursor-pointer ${
                    !watermark.hasShadow && !watermark.hasPill && !watermark.hasOutline
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-medium'
                      : 'bg-[#0d1322] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Minimal (Clean)
                </button>
              </div>
            </div>

            {/* Color Swatches & Picker */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400">Text Color</label>
              <div className="flex items-center gap-1.5">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.hex}
                    onClick={() => {
                      update({ color: swatch.hex, enabled: true });
                      if (onCommit) onCommit();
                    }}
                    style={{ backgroundColor: swatch.hex }}
                    className={`w-6 h-6 rounded-full border-2 transition cursor-pointer flex items-center justify-center ${
                      watermark.color.toLowerCase() === swatch.hex.toLowerCase()
                        ? 'border-indigo-400 scale-110 shadow-sm'
                        : 'border-slate-700 hover:scale-105'
                    }`}
                    title={swatch.label}
                  >
                    {watermark.color.toLowerCase() === swatch.hex.toLowerCase() && (
                      <Check
                        className={`w-3 h-3 ${
                          swatch.hex === '#ffffff' || swatch.hex === '#f59e0b' || swatch.hex === '#eab308' || swatch.hex === '#06b6d4'
                            ? 'text-black'
                            : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                ))}
                <div className="relative ml-auto flex items-center gap-1">
                  <input
                    type="color"
                    value={watermark.color}
                    onChange={(e) => update({ color: e.target.value, enabled: true })}
                    onBlur={onCommit}
                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-[10px] text-slate-400 uppercase">
                    {watermark.color}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Logo Image Mode Settings */
          <div className="space-y-3 p-3 rounded-xl bg-[#090d16] border border-slate-800">
            {/* 1-Click Preset Stamps */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-300">
                1-Click Logo Preset Stamps
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_LOGOS.map((logo) => (
                  <button
                    key={logo.id}
                    onClick={() => {
                      update({ imageUrl: logo.dataUrl, enabled: true });
                      if (onCommit) onCommit();
                    }}
                    className={`p-2 rounded-lg border text-left flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                      watermark.imageUrl === logo.dataUrl
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-medium'
                        : 'bg-[#0d1322] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="h-6 flex items-center justify-center overflow-hidden">
                      <img src={logo.dataUrl} alt={logo.name} className="max-h-6 object-contain" />
                    </div>
                    <span className="text-[10px] text-slate-300 font-medium">{logo.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Custom Logo Button */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <label className="text-[11px] font-medium text-slate-400">Or Upload Custom Brand PNG / SVG</label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/svg+xml,image/jpeg,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                onClick={() => logoInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-[#0d1322] text-slate-300 hover:text-white transition cursor-pointer"
              >
                <Upload className="w-4 h-4 text-indigo-400" />
                <span className="text-xs">
                  {watermark.imageUrl && !PRESET_LOGOS.some((l) => l.dataUrl === watermark.imageUrl)
                    ? 'Change Uploaded Logo'
                    : 'Choose Custom File...'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Placement Presets */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Placement Position
            </label>
            {watermark.position === 'custom' && (
              <span className="text-[10px] text-cyan-400 flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3" />
                Custom ({watermark.customX}%, {watermark.customY}%)
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {positions.map((pos) => (
              <button
                key={pos.id}
                onClick={() => {
                  update({ position: pos.id, enabled: true });
                  if (onCommit) onCommit();
                }}
                className={`p-2 rounded-lg border text-center text-[11px] transition cursor-pointer ${
                  watermark.position === pos.id
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 font-medium shadow-sm'
                    : 'bg-[#090d16] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>Click anywhere on the preview image to set a custom pin position.</span>
          </p>
        </div>

        {/* Scale / Size Slider */}
        <div className="space-y-1.5 p-3 rounded-xl bg-[#090d16] border border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-medium text-slate-300">Scale / Size</span>
            <span className="font-mono text-white text-xs">{watermark.size}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            value={watermark.size}
            onChange={(e) => update({ size: parseInt(e.target.value), enabled: true })}
            onPointerUp={onCommit}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Opacity Slider */}
        <div className="space-y-1.5 p-3 rounded-xl bg-[#090d16] border border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-medium text-slate-300">Opacity</span>
            <span className="font-mono text-white text-xs">
              {Math.round(watermark.opacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={Math.round(watermark.opacity * 100)}
            onChange={(e) => update({ opacity: parseInt(e.target.value) / 100, enabled: true })}
            onPointerUp={onCommit}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Rotation Slider */}
        {watermark.position !== 'tile' && (
          <div className="space-y-1.5 p-3 rounded-xl bg-[#090d16] border border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-medium text-slate-300">Angle Rotation</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-white text-xs">{watermark.rotation}°</span>
                {watermark.rotation !== 0 && (
                  <button
                    onClick={() => {
                      update({ rotation: 0 });
                      if (onCommit) onCommit();
                    }}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    title="Reset to 0°"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={watermark.rotation}
              onChange={(e) => update({ rotation: parseInt(e.target.value), enabled: true })}
              onPointerUp={onCommit}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        )}

        {/* Quick Reset Button */}
        <button
          onClick={() => {
            update({
              enabled: true,
              type: 'text',
              text: 'Pixora',
              position: 'bottom-right',
              size: 32,
              opacity: 0.75,
              rotation: 0,
              color: '#ffffff',
              hasShadow: true,
              hasOutline: false,
              hasPill: false,
              fontFamily: 'Plus Jakarta Sans',
            });
            if (onCommit) onCommit();
          }}
          className="w-full py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 bg-[#090d16] text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Watermark Defaults</span>
        </button>
      </div>
    </div>
  );
};
