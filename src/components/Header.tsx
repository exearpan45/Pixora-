import React from 'react';
import { Upload, Sparkles, SlidersHorizontal, Layers, Clock, Info, BookOpen } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentTab: 'workspace' | 'tools' | 'batch' | 'recent' | 'guides' | 'about';
  onSelectTab: (tab: 'workspace' | 'tools' | 'batch' | 'recent' | 'guides' | 'about') => void;
  onUploadClick: () => void;
  hasActiveImage: boolean;
  onOpenQuickFix?: () => void;
  onOpenScorecard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onUploadClick,
  hasActiveImage,
  onOpenQuickFix,
  onOpenScorecard,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0f17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('workspace')}
          className="group flex items-center gap-2.5 text-left cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1.5px] shadow-sm shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition">
            <div className="w-full h-full bg-[#0b0f17] rounded-[7px] flex items-center justify-center">
              <span className="font-extrabold text-sm bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">
                P
              </span>
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-slate-100 transition">
            Pixora
          </span>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onSelectTab('workspace')}
            className={`cursor-pointer transition-colors py-1 relative ${
              currentTab === 'workspace'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-indigo-500 after:to-cyan-400'
                : 'hover:text-white text-slate-400'
            }`}
          >
            Workspace
          </button>
          <button
            onClick={() => onSelectTab('tools')}
            className={`cursor-pointer transition-colors py-1 relative ${
              currentTab === 'tools'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-indigo-500 after:to-cyan-400'
                : 'hover:text-white text-slate-400'
            }`}
          >
            Tools
          </button>
          <button
            onClick={() => onSelectTab('batch')}
            className={`cursor-pointer transition-colors py-1 relative ${
              currentTab === 'batch'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-indigo-500 after:to-cyan-400'
                : 'hover:text-white text-slate-400'
            }`}
          >
            Batch Studio
          </button>
          <button
            onClick={() => onSelectTab('recent')}
            className={`cursor-pointer transition-colors py-1 relative ${
              currentTab === 'recent'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-indigo-500 after:to-cyan-400'
                : 'hover:text-white text-slate-400'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => onSelectTab('guides')}
            className={`cursor-pointer transition-colors py-1 relative ${
              currentTab === 'guides'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-indigo-500 after:to-cyan-400'
                : 'hover:text-white text-slate-400'
            }`}
          >
            Guides
          </button>
          <button
            onClick={() => onSelectTab('about')}
            className={`cursor-pointer transition-colors py-1 relative ${
              currentTab === 'about'
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-indigo-500 after:to-cyan-400'
                : 'hover:text-white text-slate-400'
            }`}
          >
            About
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <PWAInstallButton />

          {onOpenScorecard && (
            <button
              onClick={onOpenScorecard}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-lg hover:bg-emerald-900/40 transition cursor-pointer"
              title="View Launch Acceptance Criteria & Scorecard"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Launch Suite (54/54)</span>
            </button>
          )}

          {hasActiveImage && onOpenQuickFix && (
            <button
              onClick={onOpenQuickFix}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 rounded-lg hover:bg-cyan-900/40 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quick Fix</span>
            </button>
          )}

          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg shadow-sm shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{hasActiveImage ? 'New Image' : 'Upload Image'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
