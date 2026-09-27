import React from 'react';
import { EyeOff, ShieldAlert, Plus, Trash2, Check, Lock, ShieldCheck } from 'lucide-react';
import { CensorArea } from '../../types';

interface CensorToolProps {
  areas: CensorArea[];
  onAddArea: (type: CensorArea['type']) => void;
  onUpdateArea: (id: string, partial: Partial<CensorArea>) => void;
  onRemoveArea: (id: string) => void;
  onApplyBurnIn: () => void;
  onClearAll: () => void;
  isProcessing?: boolean;
}

export const CensorTool: React.FC<CensorToolProps> = ({
  areas,
  onAddArea,
  onUpdateArea,
  onRemoveArea,
  onApplyBurnIn,
  onClearAll,
  isProcessing = false,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Title */}
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-emerald-400" />
          <span>Pixelate & Redact</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Permanent client-side redaction for sensitive info, faces, documents, and credentials.
        </p>
      </div>

      {/* Add New Redaction Buttons */}
      <div className="space-y-2">
        <label className="text-xs text-slate-300 font-medium">Add Redaction Zone</label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => onAddArea('pixelate')}
            className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-200 font-medium flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pixelate</span>
          </button>
          <button
            onClick={() => onAddArea('blur')}
            className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-200 font-medium flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gaussian Blur</span>
          </button>
          <button
            onClick={() => onAddArea('blackout')}
            className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-200 font-medium flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>Blackout Box</span>
          </button>
          <button
            onClick={() => onAddArea('whiteout')}
            className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-200 font-medium flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>Whiteout Box</span>
          </button>
        </div>
      </div>

      {/* Active Zones List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">Active Zones ({areas.length})</span>
          {areas.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-rose-400 hover:text-rose-300 transition text-[11px] cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {areas.length === 0 ? (
          <div className="p-5 border border-dashed border-slate-800 rounded-xl text-center space-y-1">
            <Lock className="w-5 h-5 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No redaction zones placed yet.</p>
            <p className="text-[11px] text-slate-500">
              Click a button above to place a movable censor box onto your image.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {areas.map((area, idx) => (
              <div
                key={area.id}
                className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 capitalize flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Zone #{idx + 1} ({area.type})
                  </span>
                  <button
                    onClick={() => onRemoveArea(area.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    title="Remove Zone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Type select */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Mode:</span>
                  <select
                    value={area.type}
                    onChange={(e) =>
                      onUpdateArea(area.id, { type: e.target.value as CensorArea['type'] })
                    }
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="pixelate">Pixelate Blocks</option>
                    <option value="blur">Smooth Blur</option>
                    <option value="blackout">Solid Blackout</option>
                    <option value="whiteout">Solid Whiteout</option>
                  </select>
                </div>

                {/* Intensity / Block Size Slider */}
                {(area.type === 'pixelate' || area.type === 'blur') && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{area.type === 'pixelate' ? 'Block Size' : 'Blur Strength'}</span>
                      <span className="font-mono text-emerald-400">{area.blockSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={area.type === 'pixelate' ? 6 : 4}
                      max={area.type === 'pixelate' ? 32 : 24}
                      value={area.blockSize}
                      onChange={(e) =>
                        onUpdateArea(area.id, { blockSize: Number(e.target.value) })
                      }
                      className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permanence Notice */}
      <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-[11px] text-emerald-300/80 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Permanent redaction: pixels under the censor zones are completely rewritten and overwritten in the canvas export, ensuring data cannot be uncovered.
        </p>
      </div>

      {/* Apply / Burn In Button */}
      {areas.length > 0 && (
        <button
          onClick={onApplyBurnIn}
          disabled={isProcessing}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply Redaction to Image</span>
        </button>
      )}
    </div>
  );
};
