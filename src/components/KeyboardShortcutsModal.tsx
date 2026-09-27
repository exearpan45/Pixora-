import React from 'react';
import { X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ / Ctrl + Z', desc: 'Undo previous modification' },
    { key: '⌘ / Ctrl + Shift + Z', desc: 'Redo previously undone change' },
    { key: '⌘ / Ctrl + S', desc: 'Open Export & Download dialog' },
    { key: '0', desc: 'Reset zoom to fit screen' },
    { key: '+ / -', desc: 'Zoom in / Zoom out canvas' },
    { key: 'Esc', desc: 'Close open dialogs or panels' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[#0e1422] border border-slate-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-xl bg-[#090d16] border border-slate-800/80"
            >
              <span className="text-slate-300">{sc.desc}</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px]">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
