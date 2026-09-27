import React, { useState } from 'react';
import { ActiveTool, ToolCategory } from '../types';
import {
  Crop,
  Maximize2,
  RotateCw,
  Sun,
  Palette,
  Zap,
  RefreshCw,
  Type,
  Square,
  Sparkles,
  Layers,
  ShieldCheck,
  Search,
  ArrowRight,
  EyeOff,
  Pipette,
  Wand2,
  Stamp,
} from 'lucide-react';

interface ToolItem {
  id: ActiveTool;
  category: ToolCategory;
  title: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
}

const TOOLS: ToolItem[] = [
  {
    id: 'crop',
    category: 'edit',
    title: 'Crop & Framing',
    description: 'Custom bounding box with 1:1, 16:9, 4:3, and social ratio framing presets.',
    icon: <Crop className="w-5 h-5 text-indigo-400" />,
    tags: ['aspect ratio', 'crop', 'square', 'cinematic'],
  },
  {
    id: 'resize',
    category: 'edit',
    title: 'Pixel Resize & Scale',
    description: 'Accurately scale dimensions by width, height, percentage, or social media presets.',
    icon: <Maximize2 className="w-5 h-5 text-indigo-400" />,
    tags: ['dimensions', 'scale', 'resolution', '1080p', '4k'],
  },
  {
    id: 'rotate',
    category: 'edit',
    title: 'Rotate, Flip & Borders',
    description: '90-degree steps, fine angle alignment, horizontal/vertical mirror, and frame borders.',
    icon: <RotateCw className="w-5 h-5 text-indigo-400" />,
    tags: ['rotation', 'mirror', 'border', 'rounded corners'],
  },
  {
    id: 'adjust',
    category: 'enhance',
    title: 'Studio Adjustments',
    description: 'Fine-tune exposure, brightness, contrast, saturation, temperature, tint, and convolution sharpness.',
    icon: <Sun className="w-5 h-5 text-amber-400" />,
    tags: ['exposure', 'brightness', 'contrast', 'sharpness', 'color'],
  },
  {
    id: 'enhance',
    category: 'enhance',
    title: 'Enhance & 4× Upscaler',
    description: '1-click dynamic range Auto Enhance, 2× and 4× progressive bicubic upscaler, and adaptive denoiser.',
    icon: <Wand2 className="w-5 h-5 text-indigo-400" />,
    tags: ['upscale', 'auto enhance', 'denoise', 'super resolution', 'sharpness'],
  },
  {
    id: 'censor',
    category: 'privacy',
    title: 'Pixelate & Redact',
    description: 'Permanent client-side redaction with pixelate blocks, smooth Gaussian blur, or solid blackout masks.',
    icon: <EyeOff className="w-5 h-5 text-emerald-400" />,
    tags: ['redact', 'censor', 'pixelate', 'blur', 'sensitive', 'privacy'],
  },
  {
    id: 'colors',
    category: 'design',
    title: 'Color Sampler & Palette',
    description: 'Inspect exact HEX, RGB, HSL and HSV coordinates, and extract prominent dominant palette tokens.',
    icon: <Pipette className="w-5 h-5 text-cyan-400" />,
    tags: ['eyedropper', 'palette', 'swatch', 'hex', 'color picker', 'css'],
  },
  {
    id: 'filters',
    category: 'enhance',
    title: 'Color Filter Presets',
    description: 'Curated natural, cinematic, vintage 70s, dramatic, and monochrome tonal grades.',
    icon: <Palette className="w-5 h-5 text-purple-400" />,
    tags: ['presets', 'vintage', 'monochrome', 'cinematic'],
  },
  {
    id: 'compress',
    category: 'compress',
    title: 'Smart Payload Compression',
    description: 'Shrink file bytes by up to 90% with target KB binary search and visual parity.',
    icon: <Zap className="w-5 h-5 text-cyan-400" />,
    tags: ['optimize', 'reduce size', 'target kb', 'web load'],
  },
  {
    id: 'convert',
    category: 'convert',
    title: 'Codec & Format Converter',
    description: 'Transcode between modern WebP, crisp transparent PNG, and universal JPEG.',
    icon: <RefreshCw className="w-5 h-5 text-emerald-400" />,
    tags: ['webp', 'png', 'jpg', 'jpeg', 'transcode'],
  },
  {
    id: 'text',
    category: 'design',
    title: 'Text & Typography',
    description: 'Overlay custom titles, subtitles, callouts, and watermarks with Google Fonts styling.',
    icon: <Type className="w-5 h-5 text-pink-400" />,
    tags: ['typography', 'caption', 'label', 'watermark'],
  },
  {
    id: 'shapes',
    category: 'design',
    title: 'Shapes & Annotations',
    description: 'Add boxes, highlighting circles, directional arrows, and markup badges.',
    icon: <Square className="w-5 h-5 text-indigo-400" />,
    tags: ['arrow', 'rectangle', 'circle', 'annotation'],
  },
  {
    id: 'watermark',
    category: 'design',
    title: 'Brand Watermark Stamp',
    description: 'Protect creative assets with customizable text or PNG logo pattern stamps.',
    icon: <Stamp className="w-5 h-5 text-amber-400" />,
    tags: ['copyright', 'logo', 'tile', 'stamp'],
  },
  {
    id: 'background',
    category: 'background',
    title: 'Background & Bokeh Studio',
    description: 'Extract subjects to transparent alpha, apply studio solid backdrops, or simulate depth blur.',
    icon: <Layers className="w-5 h-5 text-blue-400" />,
    tags: ['transparent', 'cutout', 'backdrop', 'bokeh'],
  },
  {
    id: 'metadata',
    category: 'privacy',
    title: 'Metadata Privacy Stripper',
    description: 'Inspect and purge camera hardware markers, lens details, timestamps, and GPS telemetry.',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    tags: ['exif', 'gps', 'privacy', 'camera info'],
  },
];

interface ToolsDirectoryProps {
  onSelectTool: (toolId: ActiveTool) => void;
}

export const ToolsDirectory: React.FC<ToolsDirectoryProps> = ({ onSelectTool }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'edit', label: 'Edit' },
    { id: 'enhance', label: 'Enhance' },
    { id: 'compress', label: 'Compress' },
    { id: 'convert', label: 'Convert' },
    { id: 'design', label: 'Design' },
    { id: 'background', label: 'Background' },
    { id: 'privacy', label: 'Privacy' },
  ];

  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      tool.title.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.tags.some((t) => t.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Tool Directory</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Explore Pixora's suite of professional browser-based image utilities. All operations process locally with zero server retention.
        </p>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Category tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0e1422] border border-slate-800 rounded-xl">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0e1422] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className="group p-5 rounded-2xl bg-[#0e1422] border border-slate-800/80 hover:border-indigo-500/50 hover:bg-[#12192c] transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                {tool.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tool.description}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 text-xs text-indigo-400 font-medium">
              <span>Open Tool</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
