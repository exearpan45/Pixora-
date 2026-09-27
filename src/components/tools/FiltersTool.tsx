import React from 'react';
import { FilterPreset } from '../../types';

interface FiltersToolProps {
  currentFilter: FilterPreset;
  onSelectFilter: (filter: FilterPreset) => void;
  thumbnailSrc?: string;
}

interface FilterOption {
  id: FilterPreset;
  label: string;
  category: string;
  cssStyle: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'none', label: 'Original', category: 'Standard', cssStyle: 'none' },
  { id: 'natural', label: 'Natural', category: 'Subtle', cssStyle: 'contrast(1.05) saturate(1.08)' },
  { id: 'cinematic', label: 'Cinematic', category: 'Atmospheric', cssStyle: 'contrast(1.15) saturate(0.95) hue-rotate(-5deg)' },
  { id: 'vintage', label: 'Vintage 70s', category: 'Analog', cssStyle: 'sepia(0.35) contrast(1.1) brightness(1.05)' },
  { id: 'monochrome', label: 'B&W Classic', category: 'Monochrome', cssStyle: 'grayscale(1) contrast(1.2)' },
  { id: 'warm_golden', label: 'Warm Golden', category: 'Golden Hour', cssStyle: 'sepia(0.2) saturate(1.2) hue-rotate(-10deg)' },
  { id: 'cool_cyan', label: 'Cool Cyan', category: 'Nordic', cssStyle: 'saturate(1.1) hue-rotate(15deg) brightness(1.02)' },
  { id: 'dramatic', label: 'Dramatic Dark', category: 'Moody', cssStyle: 'contrast(1.35) saturate(1.15) brightness(0.92)' },
  { id: 'sepia', label: 'Sepia Memory', category: 'Analog', cssStyle: 'sepia(0.85) contrast(1.1)' },
  { id: 'emerald', label: 'Emerald Deep', category: 'Tonal', cssStyle: 'hue-rotate(50deg) saturate(1.1)' },
  { id: 'high_contrast', label: 'High Impact', category: 'Punchy', cssStyle: 'contrast(1.4) saturate(1.2)' },
];

export const FiltersTool: React.FC<FiltersToolProps> = ({
  currentFilter,
  onSelectFilter,
  thumbnailSrc,
}) => {
  return (
    <div className="space-y-4 text-xs text-slate-300">
      <div className="pb-3 border-b border-slate-800">
        <h4 className="text-sm font-semibold text-white">Color Filters</h4>
        <p className="text-[11px] text-slate-400">Curated studio presets with balanced color tones</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = currentFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelectFilter(opt.id)}
              className={`group flex flex-col items-center p-2 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-500/20'
                  : 'bg-[#090d16] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {/* Preview Thumbnail */}
              <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-950 mb-2 border border-slate-800 relative">
                {thumbnailSrc ? (
                  <img
                    src={thumbnailSrc}
                    alt={opt.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    style={{ filter: opt.cssStyle }}
                  />
                ) : (
                  <div
                    className="w-full h-full bg-gradient-to-tr from-slate-800 via-indigo-950 to-slate-700"
                    style={{ filter: opt.cssStyle }}
                  />
                )}
                {isActive && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-400 ring-2 ring-indigo-950" />
                )}
              </div>

              <div className="w-full">
                <span className={`font-semibold block truncate ${isActive ? 'text-indigo-300' : 'text-slate-200'}`}>
                  {opt.label}
                </span>
                <span className="text-[10px] text-slate-400 block">{opt.category}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
