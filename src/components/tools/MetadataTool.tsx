import React, { useState } from 'react';
import { ExifData } from '../../types';
import { ShieldCheck, ShieldAlert, Trash2, Camera, Calendar, MapPin, Cpu, Check, Layers } from 'lucide-react';
import { formatBytes } from '../../utils/imageProcessing';

interface MetadataToolProps {
  fileName: string;
  fileSizeBytes: number;
  width: number;
  height: number;
  format: string;
  exif: ExifData;
  onStripMetadata: () => Promise<void>;
  isStripped: boolean;
}

export const MetadataTool: React.FC<MetadataToolProps> = ({
  fileName,
  fileSizeBytes,
  width,
  height,
  format,
  exif,
  onStripMetadata,
  isStripped,
}) => {
  const [isStripping, setIsStripping] = useState(false);

  const handleStrip = async () => {
    setIsStripping(true);
    try {
      await onStripMetadata();
    } finally {
      setIsStripping(false);
    }
  };

  const hasExif = exif.hasMetadata || !!exif.make || !!exif.model || !!exif.dateTime;

  return (
    <div className="space-y-5 text-xs text-slate-300">
      <div className="pb-3 border-b border-slate-800">
        <h4 className="text-sm font-semibold text-white">Metadata & Privacy Inspector</h4>
        <p className="text-[11px] text-slate-400">View and sanitize embedded EXIF tags and GPS telemetry</p>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Local Privacy Guarantee</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Digital photos often carry hardware serials, capture timestamps, lens specs, and GPS coordinates. Pixora parses this data completely in your browser without uploading to any remote server.
        </p>
      </div>

      {/* File & Dimension Specs */}
      <div className="space-y-2 p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          File Diagnostics
        </span>
        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Filename:</span>
            <span className="text-white truncate max-w-[180px]">{fileName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Mime Type:</span>
            <span className="text-white">{format}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Pixel Resolution:</span>
            <span className="text-white">{width} × {height}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Payload Size:</span>
            <span className="text-white">{formatBytes(fileSizeBytes)}</span>
          </div>
        </div>
      </div>

      {/* EXIF Data Grid */}
      <div className="space-y-2 p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Embedded EXIF Hardware Data
        </span>

        {isStripped ? (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>All EXIF & device identifiers have been stripped. Clean asset.</span>
          </div>
        ) : hasExif ? (
          <div className="space-y-2 font-mono text-[11px]">
            {exif.make && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-sans flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-indigo-400" /> Camera Make:
                </span>
                <span className="text-white">{exif.make}</span>
              </div>
            )}
            {exif.model && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-sans flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-indigo-400" /> Device Model:
                </span>
                <span className="text-white">{exif.model}</span>
              </div>
            )}
            {exif.dateTime && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-sans flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Capture Date:
                </span>
                <span className="text-white truncate max-w-[160px]">{exif.dateTime}</span>
              </div>
            )}
            {exif.software && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-sans flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Software:
                </span>
                <span className="text-white truncate max-w-[160px]">{exif.software}</span>
              </div>
            )}
            {exif.gpsLatitude && (
              <div className="flex justify-between items-center text-amber-300">
                <span className="font-sans flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> Geolocation:
                </span>
                <span>Coordinates Present</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-slate-500 text-xs py-2">
            No camera EXIF markers found in this image header.
          </div>
        )}
      </div>

      {/* Strip metadata action */}
      {!isStripped && (
        <button
          onClick={handleStrip}
          disabled={isStripping}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50"
        >
          {isStripping ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Stripping Headers...
            </span>
          ) : (
            <>
              <Trash2 className="w-4 h-4 text-rose-200" />
              <span>Strip All Metadata & Privacy Tags</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
