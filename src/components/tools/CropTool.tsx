import React from 'react';
import { CropArea } from '../../types';
import { Crop, Check, RotateCcw, Square, RectangleHorizontal, RectangleVertical } from 'lucide-react';

interface CropToolProps {
  currentCrop: CropArea;
  imageWidth: number;
  imageHeight: number;
  onChangeCrop: (crop: CropArea) => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
}

interface RatioPreset {
  label: string;
  ratio: number | null;
  icon: React.ReactNode;
}

const RATIO_PRESETS: RatioPreset[] = [
  { label: 'Freeform', ratio: null, icon: <Crop className="w-3.5 h-3.5" /> },
  { label: '1:1 Square', ratio: 1, icon: <Square className="w-3.5 h-3.5" /> },
  { label: '16:9 Cinema', ratio: 16 / 9, icon: <RectangleHorizontal className="w-3.5 h-3.5" /> },
  { label: '4:3 Standard', ratio: 4 / 3, icon: <RectangleHorizontal className="w-3.5 h-3.5" /> },
  { label: '9:16 Story', ratio: 9 / 16, icon: <RectangleVertical className="w-3.5 h-3.5" /> },
  { label: '3:2 Photo', ratio: 3 / 2, icon: <RectangleHorizontal className="w-3.5 h-3.5" /> },
];

export const CropTool: React.FC<CropToolProps> = ({
  currentCrop,
  imageWidth,
  imageHeight,
  onChangeCrop,
  onApplyCrop,
  onCancelCrop,
}) => {
  const handleSelectRatio = (ratio: number | null) => {
    let newWidth = 80;
    let newHeight = 80;

    if (ratio !== null) {
      const imgAspect = imageWidth / imageHeight;
      if (ratio > imgAspect) {
        newWidth = 90;
        newHeight = (newWidth / ratio) * imgAspect;
      } else {
        newHeight = 90;
        newWidth = (newHeight * ratio) / imgAspect;
      }
    }

    const newX = (100 - newWidth) / 2;
    const newY = (100 - newHeight) / 2;

    onChangeCrop({
      x: Math.max(0, newX),
      y: Math.max(0, newY),
      width: Math.min(100, newWidth),
      height: Math.min(100, newHeight),
      aspectRatio: ratio,
    });
  };

  const cropPixelWidth = Math.round((currentCrop.width / 100) * imageWidth);
  const cropPixelHeight = Math.round((currentCrop.height / 100) * imageHeight);

  return (
    <div className="space-y-5 text-xs text-slate-300">
      <div className="pb-3 border-b border-slate-800">
        <h4 className="text-sm font-semibold text-white">Crop & Framing</h4>
        <p className="text-[11px] text-slate-400">Drag bounding box on canvas to frame selection</p>
      </div>

      {/* Aspect Ratio Presets */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Aspect Ratio
        </span>
        <div className="grid grid-cols-2 gap-2">
          {RATIO_PRESETS.map((preset) => {
            const isSelected = currentCrop.aspectRatio === preset.ratio;
            return (
              <button
                key={preset.label}
                onClick={() => handleSelectRatio(preset.ratio)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-500 text-indigo-300 font-semibold shadow-sm'
                    : 'bg-[#090d16] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {preset.icon}
                <span className="truncate">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Output Dimensions Info */}
      <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-slate-400">
          <span>Target Crop Size:</span>
          <span className="text-white font-mono font-medium">
            {cropPixelWidth} × {cropPixelHeight} px
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Source Canvas:</span>
          <span className="font-mono text-slate-500">
            {imageWidth} × {imageHeight} px
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex items-center gap-2.5">
        <button
          onClick={onApplyCrop}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Apply Crop</span>
        </button>
        <button
          onClick={onCancelCrop}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-medium text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
