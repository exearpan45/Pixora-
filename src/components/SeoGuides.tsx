import React, { useState } from 'react';
import { BookOpen, ArrowRight, Zap, Shield, HelpCircle, Check, Sparkles } from 'lucide-react';
import { ActiveTool } from '../types';

interface GuideItem {
  slug: string;
  toolId: ActiveTool;
  title: string;
  h1: string;
  description: string;
  details: string;
  bestPractices: string[];
  faqs: { q: string; a: string }[];
}

const GUIDES: GuideItem[] = [
  {
    slug: 'compress-image',
    toolId: 'compress',
    title: 'How to Compress Images for Web Without Quality Loss',
    h1: 'Smart Lossy & Lossless Image Compression Guide',
    description: 'Learn modern image compression techniques to reduce page weight by 80% while keeping sharp detail.',
    details:
      'Large uncompressed photos are the #1 cause of slow websites and high mobile bounce rates. Pixora uses perceptual quantization algorithms that prune imperceptible high-frequency color variations, shrinking files to target KB bounds without blurry artifacts.',
    bestPractices: [
      'Keep hero banners under 350 KB and content images under 150 KB.',
      'Always compress before uploading to CMS platforms or sending via email.',
      'Use target-size compression when platforms impose strict upload ceilings (e.g. 500 KB limit).',
    ],
    faqs: [
      {
        q: 'Will compression degrade visible sharpness on Retina displays?',
        a: 'No. Balanced compression targets high-frequency noise that the human eye cannot discern at 1x or 2x zoom.',
      },
      {
        q: 'Does Pixora upload my images to compress them?',
        a: 'No. Compression is computed entirely inside your browser using hardware-accelerated Canvas 2D encoders.',
      },
    ],
  },
  {
    slug: 'convert-webp-to-jpg',
    toolId: 'convert',
    title: 'Converting WebP to PNG & JPEG',
    h1: 'WebP Format Compatibility & Transcoding Guide',
    description: 'Convert between next-gen WebP formats and legacy JPEG/PNG containers for cross-device compatibility.',
    details:
      'WebP offers 25–34% better compression than JPEG, but older image viewers, design software, and office tools often demand standard JPEG or transparent PNG format.',
    bestPractices: [
      'Use WebP for online websites and web applications.',
      'Use PNG when transparent background alpha is strictly required for logos or graphics.',
      'Use JPEG when sending files to legacy printers or old desktop software.',
    ],
    faqs: [
      {
        q: 'Can WebP preserve transparent backgrounds when converted to PNG?',
        a: 'Yes! Pixora preserves the full 8-bit alpha channel during conversion between WebP and PNG.',
      },
    ],
  },
  {
    slug: 'remove-image-metadata',
    toolId: 'metadata',
    title: 'Removing EXIF Data & Geotags for Privacy',
    h1: 'Image Metadata Stripping & Privacy Guide',
    description: 'Safely purge GPS location coordinates, camera serial numbers, and device timestamps before publishing.',
    details:
      'Smartphones automatically embed sensitive metadata inside JPEG APP1 headers, including exact GPS latitude/longitude, capture timestamp, camera serial number, and exposure parameters. Pixora strips this data clean in one click.',
    bestPractices: [
      'Always strip EXIF metadata before sharing images on public forums or marketplaces.',
      'Sanitize product photos to remove camera serial identifiers.',
      'Stripping metadata also saves 5–15 KB of unnecessary header bloat per image.',
    ],
    faqs: [
      {
        q: 'Does removing EXIF change the image visual quality?',
        a: 'No. Stripping metadata only clears auxiliary text headers and does not alter the pixel raster data.',
      },
    ],
  },
  {
    slug: 'resize-for-web',
    toolId: 'resize',
    title: 'Optimal Image Dimensions for Social Media & Web',
    h1: 'Image Resizing & Aspect Ratio Standards',
    description: 'Preset guide for standard web resolutions, Instagram posts, Twitter headers, and display viewports.',
    details:
      'Modern smartphones capture photos at 4000x3000px (12–48 megapixels), which is 400% larger than most desktop displays. Resizing images to 1920x1080px or 1200x800px drastically improves loading speed.',
    bestPractices: [
      'Full HD (1920x1080) is optimal for landscape headers.',
      'Instagram feed posts require 1080x1080px (1:1) or 1080x1350px (4:5).',
      'Always lock aspect ratio to avoid distorted or stretched figures.',
    ],
    faqs: [
      {
        q: 'What is bicubic vs bilinear image scaling?',
        a: 'Pixora applies high-quality browser bicubic smoothing kernels during scale-down to prevent pixel aliasing.',
      },
    ],
  },
];

interface SeoGuidesProps {
  onOpenTool: (toolId: ActiveTool) => void;
}

export const SeoGuides: React.FC<SeoGuidesProps> = ({ onOpenTool }) => {
  const [selectedGuide, setSelectedGuide] = useState<GuideItem>(GUIDES[0]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Optimization & SEO Guides</h2>
        <p className="text-sm text-slate-400">
          Professional standards, format specifications, and privacy guidelines for web media.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation list */}
        <div className="lg:col-span-1 space-y-2">
          {GUIDES.map((g) => {
            const isSelected = selectedGuide.slug === g.slug;
            return (
              <button
                key={g.slug}
                onClick={() => setSelectedGuide(g)}
                className={`w-full p-3 rounded-xl border text-left transition cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-500 text-indigo-300 font-semibold shadow-sm'
                    : 'bg-[#0e1422] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {g.title}
              </button>
            );
          })}
        </div>

        {/* Selected Guide Details */}
        <div className="lg:col-span-3 p-6 sm:p-8 rounded-2xl bg-[#0e1422] border border-slate-800 space-y-6">
          <div className="space-y-3 pb-6 border-b border-slate-800">
            <span className="text-xs font-mono text-indigo-400 font-semibold tracking-wider uppercase">
              Guide & Best Practices
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{selectedGuide.h1}</h1>
            <p className="text-sm text-slate-300 leading-relaxed">{selectedGuide.description}</p>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
            <p>{selectedGuide.details}</p>
          </div>

          {/* Best Practices */}
          <div className="space-y-3 p-4 rounded-xl bg-[#090d16] border border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Recommended Practices</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {selectedGuide.bestPractices.map((bp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FAQs */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>Frequently Asked Questions</span>
            </h3>
            <div className="space-y-3">
              {selectedGuide.faqs.map((faq, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 space-y-1">
                  <span className="text-xs font-semibold text-white block">{faq.q}</span>
                  <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Open Tool Action */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Ready to optimize your images now?</span>
            <button
              onClick={() => onOpenTool(selectedGuide.toolId)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition cursor-pointer"
            >
              <span>Launch {selectedGuide.toolId.toUpperCase()} Tool</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
