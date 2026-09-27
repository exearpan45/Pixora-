import React from 'react';
import { ShieldCheck, Cpu, Zap, Lock, Sparkles, Heart } from 'lucide-react';

export const AboutModal: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10 animate-in fade-in">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Product Philosophy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Image editing should be simple.
        </h1>
        <p className="text-base text-slate-400 leading-relaxed">
          Pixora was designed to unify fragmented image utilities into one fast, private, and beautifully crafted workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#0e1422] border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Private By Default</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your images never leave your computer. Every pixel transformation, compression pass, and metadata strip executes directly in your browser session using HTML5 Canvas & Web APIs.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e1422] border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Zero Clutter & Ads</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Unlike legacy online tools, Pixora has no deceptive download buttons, popups, or quality traps. Clean typography and progressive disclosure keep your workflow fast and uninterrupted.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e1422] border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Studio Precision</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Iterative binary search algorithms target exact kilobyte boundaries while maintaining high-dynamic range color fidelity, 9-point aspect ratio crops, and custom watermarking.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-[#0e1422] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Engineered by Arpan Goswami</h3>
          <p className="text-xs text-slate-400">
            Built with modern React, TypeScript, Tailwind CSS, and HTML5 Web APIs for designers, photographers, developers, and students worldwide.
          </p>
        </div>

        <div className="flex-shrink-0 text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
          Version 1.0.0 · © 2026 Pixora
        </div>
      </div>
    </div>
  );
};
