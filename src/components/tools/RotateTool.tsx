import React from 'react';
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Square, Shield } from 'lucide-react';

interface RotateToolProps {
  rotation: number; // degrees
  flipH: boolean;
  flipV: boolean;
  borderRadius: number; // 0 to 100
  borderWidth: number; // 0 to 40
  borderColor: string;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onRotate180: () => void;
  onAngleChange: (angle: number) => void;
  onToggleFlipH: () => void;
  onToggleFlipV: () => void;
  onBorderRadiusChange: (radius: number) => void;
  onBorderWidthChange: (width: number) => void;
  onBorderColorChange: (color: string) => void;
  onReset: () => void;
}

export const RotateTool: React.FC<RotateToolProps> = ({
  rotation,
  flipH,
  flipV,
  borderRadius,
  borderWidth,
  borderColor,
  onRotateCW,
  onRotateCCW,
  onRotate180,
  onAngleChange,
  onToggleFlipH,
  onToggleFlipV,
  onBorderRadiusChange,
  onBorderWidthChange,
  onBorderColorChange,
  onReset,
}) => {
  return (
    <div className="space-y-5 text-xs text-slate-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white">Rotate, Flip & Borders</h4>
          <p className="text-[11px] text-slate-400">Orientation, geometry, and border styling</p>
        </div>
        <button
          onClick={onReset}
          className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 transition cursor-pointer"
        >
          Reset
        </button>
      </div>

      {/* 90-degree quick buttons */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Quick Rotation
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onRotateCCW}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#090d16] border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition text-slate-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>-90°</span>
          </button>
          <button
            onClick={onRotate180}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#090d16] border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition text-slate-200 cursor-pointer"
          >
            <span>180°</span>
          </button>
          <button
            onClick={onRotateCW}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#090d16] border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition text-slate-200 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>+90°</span>
          </button>
        </div>
      </div>

      {/* Free angle slider */}
      <div className="space-y-2 p-3 rounded-xl bg-[#090d16] border border-slate-800">
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-[11px] font-medium">Freeform Angle</span>
          <span className="font-mono text-white text-xs">{rotation}°</span>
        </div>
        <input
          type="range"
          min="-180"
          max="180"
          value={rotation}
          onChange={(e) => onAngleChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>-180°</span>
          <span>0°</span>
          <span>+180°</span>
        </div>
      </div>

      {/* Flip toggles */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Mirror & Flip
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onToggleFlipH}
            className={`flex items-center justify-center gap-2 p-2 rounded-xl border transition cursor-pointer ${
              flipH
                ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-medium'
                : 'bg-[#090d16] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Flip Horizontal</span>
          </button>
          <button
            onClick={onToggleFlipV}
            className={`flex items-center justify-center gap-2 p-2 rounded-xl border transition cursor-pointer ${
              flipV
                ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-medium'
                : 'bg-[#090d16] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <FlipVertical className="w-3.5 h-3.5 text-indigo-400" />
            <span>Flip Vertical</span>
          </button>
        </div>
      </div>

      {/* Rounded Corners & Borders */}
      <div className="space-y-3 p-3 rounded-xl bg-[#090d16] border border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Corners & Frame
        </span>

        {/* Corner Radius */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-300">
            <span>Corner Radius</span>
            <span className="font-mono text-white text-[11px]">{borderRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            value={borderRadius}
            onChange={(e) => onBorderRadiusChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Border Width */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-300">
            <span>Border Width</span>
            <span className="font-mono text-white text-[11px]">{borderWidth}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={borderWidth}
            onChange={(e) => onBorderWidthChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Border Color */}
        {borderWidth > 0 && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-300">Border Color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={borderColor}
                onChange={(e) => onBorderColorChange(e.target.value)}
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <span className="font-mono text-[11px] text-slate-400">{borderColor}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
