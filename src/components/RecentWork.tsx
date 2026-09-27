import React, { useState, useEffect } from 'react';
import { HistoryRecord } from '../types';
import { getRecentHistory, clearRecentHistory } from '../utils/historyDb';
import { Clock, Trash2, ArrowUpRight, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { formatBytes } from '../utils/imageProcessing';

interface RecentWorkProps {
  onLoadRecentItem?: (dataUrl: string, name: string) => void;
}

export const RecentWork: React.FC<RecentWorkProps> = ({ onLoadRecentItem }) => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    setHistory(getRecentHistory());
  }, []);

  const handleClear = () => {
    clearRecentHistory();
    setHistory([]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Recent Sessions</h2>
          <p className="text-xs text-slate-400 mt-1">
            Local browser records of processed images. Preserved purely on your device.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-rose-950/40 hover:border-rose-800/60 text-slate-400 hover:text-rose-300 text-xs transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0e1422] border border-slate-800 space-y-3">
          <Clock className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No local history yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When you export images or process batch items, local session snapshots will appear here for fast access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="group p-4 rounded-2xl bg-[#0e1422] border border-slate-800/80 hover:border-indigo-500/40 hover:bg-[#12192c] transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-200 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded">
                    {item.dimensions}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-white truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                    <span>{formatBytes(item.finalSize)}</span>
                    <span>·</span>
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {onLoadRecentItem && (
                <button
                  onClick={() => onLoadRecentItem(item.thumbnail, item.name)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800/70 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
                >
                  <span>Re-open in Workspace</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
