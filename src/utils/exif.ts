import { ExifData } from '../types';

/**
 * Extracts basic EXIF tags from a JPEG / standard image buffer.
 */
export async function parseExifMetadata(file: File): Promise<ExifData> {
  const result: ExifData = {
    hasMetadata: false,
    rawTagsCount: 0,
  };

  try {
    const arrayBuffer = await file.slice(0, 128 * 1024).arrayBuffer();
    const view = new DataView(arrayBuffer);

    // Check if JPEG (starts with 0xFFD8)
    if (view.getUint16(0, false) === 0xffd8) {
      let offset = 2;
      const length = view.byteLength;

      while (offset < length - 4) {
        const marker = view.getUint16(offset, false);
        offset += 2;

        if (marker === 0xffe1) {
          // APP1 marker (EXIF)
          result.hasMetadata = true;
          const segmentLength = view.getUint16(offset, false);
          offset += 2;

          // Check for "Exif\0\0"
          const exifHeader =
            String.fromCharCode(view.getUint8(offset)) +
            String.fromCharCode(view.getUint8(offset + 1)) +
            String.fromCharCode(view.getUint8(offset + 2)) +
            String.fromCharCode(view.getUint8(offset + 3));

          if (exifHeader === 'Exif') {
            const tiffOffset = offset + 6;
            const bigEndian = view.getUint16(tiffOffset, false) === 0x4d4d;
            const ifdOffset = view.getUint32(tiffOffset + 4, !bigEndian);
            const numEntries = view.getUint16(tiffOffset + ifdOffset, !bigEndian);
            result.rawTagsCount = numEntries;

            let entryOffset = tiffOffset + ifdOffset + 2;
            for (let i = 0; i < Math.min(numEntries, 40); i++) {
              const tag = view.getUint16(entryOffset, !bigEndian);
              const type = view.getUint16(entryOffset + 2, !bigEndian);
              const count = view.getUint32(entryOffset + 4, !bigEndian);

              // Helper for reading ASCII
              const readAscii = (valOffset: number, len: number) => {
                let str = '';
                for (let j = 0; j < Math.min(len, 64); j++) {
                  const charCode = view.getUint8(valOffset + j);
                  if (charCode === 0) break;
                  str += String.fromCharCode(charCode);
                }
                return str.trim();
              };

              let valOffset = entryOffset + 8;
              if (count > 4) {
                valOffset = tiffOffset + view.getUint32(entryOffset + 8, !bigEndian);
              }

              // 0x010F: Make, 0x0110: Model, 0x0131: Software, 0x0132: DateTime
              if (tag === 0x010f && valOffset < length - 32) {
                result.make = readAscii(valOffset, count);
              } else if (tag === 0x0110 && valOffset < length - 32) {
                result.model = readAscii(valOffset, count);
              } else if (tag === 0x0131 && valOffset < length - 32) {
                result.software = readAscii(valOffset, count);
              } else if (tag === 0x0132 && valOffset < length - 32) {
                result.dateTime = readAscii(valOffset, count);
              }

              entryOffset += 12;
            }
          }
          break;
        } else if ((marker & 0xff00) === 0xff00) {
          const markerLen = view.getUint16(offset, false);
          offset += markerLen;
        } else {
          break;
        }
      }
    }
  } catch {
    // Graceful fallback for non-JPEG or truncated files
  }

  // Fallback defaults if file has size and type
  if (!result.dateTime && file.lastModified) {
    result.dateTime = new Date(file.lastModified).toLocaleString();
  }

  return result;
}

/**
 * Strips all metadata by decoding into a clean HTML5 canvas and re-encoding.
 * Canvas rendering inherently discards all EXIF, GPS, camera serials, and thumbnail data.
 */
export async function stripMetadata(
  imageSource: HTMLImageElement | ImageBitmap | HTMLCanvasElement,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality = 0.92
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = imageSource.width;
  canvas.height = imageSource.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  ctx.drawImage(imageSource, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create stripped image blob'));
      },
      format,
      quality
    );
  });
}
