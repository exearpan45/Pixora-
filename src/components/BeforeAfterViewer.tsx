import React, { useRef, useState, useEffect, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface BeforeAfterViewerProps {
  originalSrc: string;
  processedSrc: string;
  originalLabel?: string;
  processedLabel?: string;
  aspectRatio?: number;
}

export const BeforeAfterViewer: React.FC<BeforeAfterViewerProps> = ({
  originalSrc,
  processedSrc,
  originalLabel = 'BEFORE (Original)',
  processedLabel = 'AFTER (Edited)',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percent = (clampedX / rect.width) * 100;
    setSliderPos(percent);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

  return (
    <div
      ref={containerRef}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      className="relative w-full h-full min-h-[380px] max-h-[720px] select-none overflow-hidden rounded-2xl bg-[#080d18] border border-slate-800 shadow-2xl flex items-center justify-center cursor-ew-resize"
    >
      {/* Background layer: Processed Image (Right / After) */}
      <img
        src={processedSrc}
        alt="After result"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />

      {/* Foreground clipped layer: Original Image (Left / Before) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img
          src={originalSrc}
          alt="Before original"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* Draggable Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)] pointer-events-none z-20"
        style={{ left: `${sliderPos}%` }}
      >
        {/* Circular grip badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-900 border-2 border-indigo-600">
          <MoveHorizontal className="w-4 h-4" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-30 pointer-events-none">
        <span className="text-[11px] font-mono font-medium text-slate-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
          {originalLabel}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-30 pointer-events-none">
        <span className="text-[11px] font-mono font-medium text-indigo-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
          {processedLabel}
        </span>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <span className="text-[10px] text-slate-400 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
          Drag horizontally to compare
        </span>
      </div>
    </div>
  );
};
