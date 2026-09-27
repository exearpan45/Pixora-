import React, { useState } from 'react';
import { TextLayer, ShapeLayer } from '../../types';
import { Plus, Type, Square, Circle, ArrowRight, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface TextDesignToolProps {
  textLayers: TextLayer[];
  shapeLayers: ShapeLayer[];
  onAddText: () => void;
  onUpdateText: (id: string, partial: Partial<TextLayer>) => void;
  onRemoveText: (id: string) => void;
  onAddShape: (type: ShapeLayer['type']) => void;
  onUpdateShape: (id: string, partial: Partial<ShapeLayer>) => void;
  onRemoveShape: (id: string) => void;
}

export const TextDesignTool: React.FC<TextDesignToolProps> = ({
  textLayers,
  shapeLayers,
  onAddText,
  onUpdateText,
  onRemoveText,
  onAddShape,
  onUpdateShape,
  onRemoveShape,
}) => {
  const [tab, setTab] = useState<'text' | 'shapes'>('text');

  return (
    <div className="space-y-5 text-xs text-slate-300">
      <div className="pb-3 border-b border-slate-800">
        <h4 className="text-sm font-semibold text-white">Text & Design Elements</h4>
        <p className="text-[11px] text-slate-400">Add callouts, annotations, overlays, and labels</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex rounded-xl bg-[#090d16] p-1 border border-slate-800">
        <button
          onClick={() => setTab('text')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            tab === 'text' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Text Layers ({textLayers.length})</span>
        </button>
        <button
          onClick={() => setTab('shapes')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            tab === 'shapes' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Square className="w-3.5 h-3.5" />
          <span>Shapes ({shapeLayers.length})</span>
        </button>
      </div>

      {/* Text tab */}
      {tab === 'text' && (
        <div className="space-y-4">
          <button
            onClick={onAddText}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-sm cursor-pointer transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Text Layer</span>
          </button>

          {textLayers.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No text layers added yet. Click above to place text.
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {textLayers.map((layer, idx) => (
                <div key={layer.id} className="p-3 rounded-xl bg-[#090d16] border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-indigo-300">Layer {idx + 1}</span>
                    <button
                      onClick={() => onRemoveText(layer.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={layer.text}
                    onChange={(e) => onUpdateText(layer.id, { text: e.target.value })}
                    className="w-full bg-[#0b0f17] border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />

                  {/* Size & Weight */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Font Size</span>
                      <input
                        type="range"
                        min="16"
                        max="120"
                        value={layer.fontSize}
                        onChange={(e) => onUpdateText(layer.id, { fontSize: parseInt(e.target.value) })}
                        className="w-full h-1 bg-slate-800 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Weight</span>
                      <select
                        value={layer.fontWeight}
                        onChange={(e) => onUpdateText(layer.id, { fontWeight: e.target.value as any })}
                        className="w-full bg-[#0b0f17] border border-slate-800 rounded px-2 py-1 text-[11px] text-white"
                      >
                        <option value="normal">Regular</option>
                        <option value="600">Semibold</option>
                        <option value="800">Bold Black</option>
                      </select>
                    </div>
                  </div>

                  {/* Color & Shadow */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Color</span>
                      <input
                        type="color"
                        value={layer.color}
                        onChange={(e) => onUpdateText(layer.id, { color: e.target.value })}
                        className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                    </div>
                    <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={layer.hasShadow}
                        onChange={(e) => onUpdateText(layer.id, { hasShadow: e.target.checked })}
                        className="accent-indigo-500"
                      />
                      <span>Drop Shadow</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Shapes tab */}
      {tab === 'shapes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onAddShape('rectangle')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#090d16] border border-slate-800 hover:border-indigo-500 hover:text-white transition text-slate-300 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 text-indigo-400" />
              <span>Box</span>
            </button>
            <button
              onClick={() => onAddShape('circle')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#090d16] border border-slate-800 hover:border-indigo-500 hover:text-white transition text-slate-300 cursor-pointer"
            >
              <Circle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Circle</span>
            </button>
            <button
              onClick={() => onAddShape('arrow')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#090d16] border border-slate-800 hover:border-indigo-500 hover:text-white transition text-slate-300 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
              <span>Arrow</span>
            </button>
          </div>

          {shapeLayers.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No shapes added yet. Click above to place an annotation shape.
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {shapeLayers.map((shape, idx) => (
                <div key={shape.id} className="p-3 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-indigo-300">
                      Shape {idx + 1} ({shape.type})
                    </span>
                    <button
                      onClick={() => onRemoveShape(shape.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Fill</span>
                      <input
                        type="color"
                        value={shape.fillColor}
                        onChange={(e) => onUpdateShape(shape.id, { fillColor: e.target.value })}
                        className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Border</span>
                      <input
                        type="color"
                        value={shape.strokeColor}
                        onChange={(e) => onUpdateShape(shape.id, { strokeColor: e.target.value })}
                        className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
