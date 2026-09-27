import React from 'react';
import { ShieldCheck, Cpu, Zap, Lock } from 'lucide-react';
import { ActiveTool } from '../types';

interface FooterProps {
  onNavigate: (tab: 'workspace' | 'tools' | 'batch' | 'recent' | 'guides' | 'about') => void;
  onSelectToolDirect?: (toolName: ActiveTool) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectToolDirect }) => {
  return (
    <footer className="w-full bg-[#080c14] border-t border-slate-800/80 mt-16 pt-12 pb-8 px-4 sm:px-6 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Brand & Mission */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-[#080c14] rounded-[5px] flex items-center justify-center">
                <span className="font-bold text-xs text-indigo-400">P</span>
              </div>
            </div>
            <span className="text-sm font-bold text-white tracking-tight">Pixora</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Every image. Every tool. One workspace. Professional image editing, compression, and format conversion right in your browser.
          </p>
          <div className="flex items-center gap-2 text-slate-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Private · Local in-browser processing</span>
          </div>
        </div>

        {/* Tools navigation */}
        <div>
          <h4 className="text-xs font-semibold text-slate-200 tracking-wider mb-3">Core Tools</h4>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => onNavigate('tools')}
                className="hover:text-white transition cursor-pointer"
              >
                Smart Compress & Size Target
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('tools')}
                className="hover:text-white transition cursor-pointer"
              >
                Pixel-Perfect Resize & Presets
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('tools')}
                className="hover:text-white transition cursor-pointer"
              >
                Crop, Rotate & Straighten
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('tools')}
                className="hover:text-white transition cursor-pointer"
              >
                Convert to WebP / PNG / JPG
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('tools')}
                className="hover:text-white transition cursor-pointer"
              >
                Studio Color & Filter Adjustments
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectToolDirect ? onSelectToolDirect('enhance') : onNavigate('tools')}
                className="hover:text-white transition cursor-pointer"
              >
                Auto Enhance & 4× Upscaler
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectToolDirect ? onSelectToolDirect('censor') : onNavigate('tools')}
                className="hover:text-white transition cursor-pointer"
              >
                Pixelate & Redact Sensitive Areas
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectToolDirect ? onSelectToolDirect('colors') : onNavigate('tools')}
                className="hover:text-white transition cursor-pointer"
              >
                Color Eyedropper & Palette Extractor
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('tools')}
                className="hover:text-white transition cursor-pointer"
              >
                Background Removal & Studio Fill
              </button>
            </li>
          </ul>
        </div>

        {/* Features & Guides */}
        <div>
          <h4 className="text-xs font-semibold text-slate-200 tracking-wider mb-3">Workspace</h4>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => onNavigate('batch')}
                className="hover:text-white transition cursor-pointer"
              >
                Batch Processing Studio (ZIP Export)
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('workspace')}
                className="hover:text-white transition cursor-pointer"
              >
                Interactive Before / After Split
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('workspace')}
                className="hover:text-white transition cursor-pointer"
              >
                EXIF Metadata Privacy Stripper
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('recent')}
                className="hover:text-white transition cursor-pointer"
              >
                Local History & Restores
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('guides')}
                className="hover:text-white transition cursor-pointer"
              >
                SEO & Format Optimization Guides
              </button>
            </li>
          </ul>
        </div>

        {/* Creator & Privacy */}
        <div>
          <h4 className="text-xs font-semibold text-slate-200 tracking-wider mb-3">About Pixora</h4>
          <p className="text-slate-400 mb-3 leading-relaxed">
            Engineered with zero tracking, zero server uploads, and high-performance Web APIs for creative professionals, developers, and photographers.
          </p>
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-slate-300 font-medium block">
              Created by <span className="text-indigo-300">Arpan Goswami</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
        <p>© 2026 Pixora. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('about')} className="hover:text-slate-300 transition cursor-pointer">
            About & Philosophy
          </button>
          <span>·</span>
          <span className="hover:text-slate-300 transition">Privacy-First Architecture</span>
          <span>·</span>
          <span className="hover:text-slate-300 transition">Offline PWA Ready</span>
        </div>
      </div>
    </footer>
  );
};
