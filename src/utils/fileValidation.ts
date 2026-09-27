export interface ValidationResult {
  valid: boolean;
  errorMessage?: string;
  advice?: string;
  detectedType?: string;
}

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB maximum browser buffer limit

const SUPPORTED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']);

/**
 * Inspects file extension, magic bytes, and container trailers to ensure valid supported image.
 */
export async function validateImageFile(file: File): Promise<ValidationResult> {
  // 1. File size check
  if (file.size === 0) {
    return {
      valid: false,
      errorMessage: 'The selected file is empty (0 bytes).',
      advice: 'Please choose an image file with content.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      errorMessage: `This image (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the browser buffer limit of 50 MB.`,
      advice: 'Try resizing or downscaling it first before opening.',
    };
  }

  // 2. Extension check
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (ext && !SUPPORTED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      errorMessage: 'Unsupported file type.',
      advice: 'Please choose a supported image format: JPG, PNG, WebP, GIF, or SVG.',
    };
  }

  // 3. Inspect magic bytes
  try {
    const headerBuffer = await file.slice(0, 32).arrayBuffer();
    const bytes = new Uint8Array(headerBuffer);

    // JPEG: FF D8 FF
    const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    const isPng =
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a;

    // WebP: 'RIFF'....'WEBP'
    const isWebP =
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50;

    // GIF: 'GIF87a' or 'GIF89a'
    const isGif =
      bytes.length >= 6 &&
      bytes[0] === 0x47 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x38 &&
      (bytes[4] === 0x37 || bytes[4] === 0x39) &&
      bytes[5] === 0x61;

    // SVG: starts with '<svg' or '<?xml'
    const textStart = new TextDecoder().decode(bytes.slice(0, 16)).trim().toLowerCase();
    const isSvg = textStart.startsWith('<svg') || textStart.startsWith('<?xml');

    if (!isJpeg && !isPng && !isWebP && !isGif && !isSvg) {
      return {
        valid: false,
        errorMessage: 'Unsupported file type.',
        advice: 'Please choose a supported image format: JPG, PNG, WebP, GIF, or SVG.',
      };
    }

    // 4. Structural integrity checks
    if (file.size < 64) {
      return {
        valid: false,
        errorMessage: 'This image file appears to be damaged or truncated.',
        advice: 'The file is incomplete. Please try another image.',
      };
    }

    if (isJpeg) {
      // JPEG must end with 0xFF 0xD9 (EOI) within the last 128 bytes
      const trailerBuf = await file.slice(Math.max(0, file.size - 128)).arrayBuffer();
      const trailer = new Uint8Array(trailerBuf);
      let hasEoi = false;
      for (let i = 0; i < trailer.length - 1; i++) {
        if (trailer[i] === 0xff && trailer[i + 1] === 0xd9) {
          hasEoi = true;
          break;
        }
      }
      if (!hasEoi || file.size < 256) {
        return {
          valid: false,
          errorMessage: 'This JPEG file appears to be damaged or truncated.',
          advice: 'The image stream is missing its End-of-Image marker. Please re-export the image.',
        };
      }
      return { valid: true, detectedType: 'image/jpeg' };
    }

    if (isPng) {
      // PNG must contain IEND chunk in trailer
      const trailerBuf = await file.slice(Math.max(0, file.size - 64)).arrayBuffer();
      const trailer = new Uint8Array(trailerBuf);
      const trailerStr = new TextDecoder('latin1').decode(trailer);
      if (!trailerStr.includes('IEND') || file.size < 64) {
        return {
          valid: false,
          errorMessage: 'This PNG file appears to be damaged or corrupted.',
          advice: 'The PNG file is incomplete or missing valid chunk records.',
        };
      }
      return { valid: true, detectedType: 'image/png' };
    }

    if (isWebP) {
      const headerStr = new TextDecoder('latin1').decode(bytes.slice(12, 16));
      if (!['VP8 ', 'VP8L', 'VP8X'].includes(headerStr)) {
        return {
          valid: false,
          errorMessage: 'This WebP file contains an invalid or damaged payload.',
          advice: 'The WebP chunk header is malformed. Please choose another file.',
        };
      }
      if (headerStr === 'VP8 ') {
        const payloadStart = bytes.slice(20, 26);
        const hasSyncCode = payloadStart.some((b) => b === 0x9d);
        if (!hasSyncCode || file.size < 30) {
          return {
            valid: false,
            errorMessage: 'This WebP file contains an invalid or damaged payload.',
            advice: 'The WebP bitstream payload is corrupt. Please choose another file.',
          };
        }
      }
      return { valid: true, detectedType: 'image/webp' };
    }

    return {
      valid: true,
      detectedType: isGif ? 'image/gif' : 'image/svg+xml',
    };
  } catch {
    return {
      valid: false,
      errorMessage: 'Could not read image header.',
      advice: 'The file might be corrupted. Please try another image.',
    };
  }
}

/**
 * Sanitizes user-provided output filename to prevent path traversal or unsafe characters.
 */
export function sanitizeFilename(filename: string, defaultName = 'pixora_export'): string {
  if (!filename || typeof filename !== 'string') return defaultName;

  let clean = filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\.\.+/g, '.')
    .trim();

  if (!clean || clean === '.') {
    clean = defaultName;
  }

  if (clean.length > 120) {
    clean = clean.substring(0, 120);
  }

  return clean;
}
