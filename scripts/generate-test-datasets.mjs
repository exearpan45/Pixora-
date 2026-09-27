import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const BASE_DIR = './tests/pixora-test-data';

const SUBDIRS = [
  'jpg',
  'png',
  'webp',
  'transparency',
  'dimensions',
  'large-files',
  'metadata',
  'corrupted',
  'batch',
  'edge-cases',
];

SUBDIRS.forEach((dir) => {
  const fullPath = path.join(BASE_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Helper for PNG generation
function createValidPng(width, height, options = {}) {
  const { transparent = false, pattern = 'gradient' } = options;
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);

    let crc = -1;
    for (let i = 4; i < 8 + len; i++) {
      let byte = buf[i];
      crc = crc ^ byte;
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
      }
    }
    buf.writeInt32BE(~crc, 8 + len);
    return buf;
  }

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Generate pixels
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // None filter
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      let r = 24, g = 32, b = 48, a = 255;

      if (pattern === 'gradient') {
        const u = x / Math.max(1, width - 1);
        const v = y / Math.max(1, height - 1);
        r = Math.round(99 * u + 16 * (1 - v));
        g = Math.round(102 * v + 24 * (1 - u));
        b = Math.round(241 * (u * 0.5 + v * 0.5) + 32);
      } else if (pattern === 'checker') {
        const check = (Math.floor(x / 32) + Math.floor(y / 32)) % 2 === 0;
        r = check ? 220 : 40;
        g = check ? 220 : 40;
        b = check ? 220 : 40;
      } else if (pattern === 'master') {
        // High contrast + low contrast + geometric regions
        if (x < width * 0.5 && y < height * 0.5) {
          r = 239; g = 68; b = 68; // Vibrant Red
        } else if (x >= width * 0.5 && y < height * 0.5) {
          r = 59; g = 130; b = 246; // Vibrant Blue
        } else if (x < width * 0.5 && y >= height * 0.5) {
          r = 16; g = 185; b = 129; // Vibrant Emerald
        } else {
          r = 245; g = 158; b = 11; // Amber
        }
      }

      // Genuine transparent regions
      if (transparent) {
        const distFromCenter = Math.hypot(x - width / 2, y - height / 2);
        if (distFromCenter < Math.min(width, height) * 0.28) {
          a = 0; // 100% transparent cutout hole in center
          r = 0; g = 0; b = 0;
        } else if (distFromCenter < Math.min(width, height) * 0.35) {
          a = 128; // 50% semi-transparent gradient ring
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Minimal standard baseline JPEG encoder generator
function createValidJpeg(width, height, exifMetadata = null, targetSizeBytes = 0) {
  // We can write a valid baseline JPEG stream
  // Standard JFIF header
  const soi = Buffer.from([0xff, 0xd8]);
  const jfif = Buffer.from([
    0xff, 0xe0, 0x00, 0x10,
    0x4a, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
    0x01, 0x01, 0x01, // v1.1, units dots/inch
    0x00, 0x48, 0x00, 0x48, // 72 DPI
    0x00, 0x00 // no thumbnail
  ]);

  // Optional EXIF APP1 Segment
  let exifBuf = Buffer.alloc(0);
  if (exifMetadata) {
    const exifHeader = Buffer.from('Exif\0\0');
    // TIFF Header: 'II' (Little Endian), 0x002A, offset 8
    const tiffHeader = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00]);

    // Build IFD entries
    const entries = [];
    let currentDataOffset = 8 + 2 + 12 * 6 + 4; // after TIFF + numEntries + 6 IFDs + nextIFDOffset

    function addAsciiTag(tag, text) {
      const strBuf = Buffer.from(text + '\0');
      const entry = Buffer.alloc(12);
      entry.writeUInt16LE(tag, 0);
      entry.writeUInt16LE(2, 2); // ASCII type
      entry.writeUInt32LE(strBuf.length, 4); // count
      if (strBuf.length <= 4) {
        strBuf.copy(entry, 8);
      } else {
        entry.writeUInt32LE(currentDataOffset, 8);
        currentDataOffset += strBuf.length;
      }
      return { entry, data: strBuf.length > 4 ? strBuf : null };
    }

    const tagsToProcess = [];
    if (exifMetadata.make) tagsToProcess.push(addAsciiTag(0x010f, exifMetadata.make));
    if (exifMetadata.model) tagsToProcess.push(addAsciiTag(0x0110, exifMetadata.model));
    if (exifMetadata.software) tagsToProcess.push(addAsciiTag(0x0131, exifMetadata.software));
    if (exifMetadata.dateTime) tagsToProcess.push(addAsciiTag(0x0132, exifMetadata.dateTime));

    // Orientation tag (0x0112, SHORT, count 1)
    const orientEntry = Buffer.alloc(12);
    orientEntry.writeUInt16LE(0x0112, 0);
    orientEntry.writeUInt16LE(3, 2); // SHORT
    orientEntry.writeUInt32LE(1, 4);
    orientEntry.writeUInt16LE(1, 8); // Top-Left
    tagsToProcess.push({ entry: orientEntry, data: null });

    const numEntriesBuf = Buffer.alloc(2);
    numEntriesBuf.writeUInt16LE(tagsToProcess.length, 0);

    const ifdEntriesBuf = Buffer.concat(tagsToProcess.map(t => t.entry));
    const nextIfdBuf = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    const extraDataBuf = Buffer.concat(tagsToProcess.map(t => t.data).filter(Boolean));

    const tiffBody = Buffer.concat([tiffHeader, numEntriesBuf, ifdEntriesBuf, nextIfdBuf, extraDataBuf]);
    const app1Data = Buffer.concat([exifHeader, tiffBody]);
    const app1Len = app1Data.length + 2;

    const app1Header = Buffer.alloc(4);
    app1Header.writeUInt16BE(0xffe1, 0);
    app1Header.writeUInt16BE(app1Len, 2);

    exifBuf = Buffer.concat([app1Header, app1Data]);
  }

  // Quantization table DQT (Luminance)
  const dqt = Buffer.alloc(69);
  dqt[0] = 0xff; dqt[1] = 0xdb;
  dqt.writeUInt16BE(67, 2);
  dqt[4] = 0; // table 0 (8-bit)
  for (let i = 0; i < 64; i++) {
    dqt[5 + i] = 16; // constant quality quant
  }

  // Start of Frame SOF0 (Baseline DCT)
  const sof0 = Buffer.alloc(19);
  sof0[0] = 0xff; sof0[1] = 0xc0;
  sof0.writeUInt16BE(17, 2);
  sof0[4] = 8; // precision 8-bit
  sof0.writeUInt16BE(height, 5);
  sof0.writeUInt16BE(width, 7);
  sof0[9] = 3; // 3 components (Y, Cb, Cr)
  // Component 1: Y
  sof0[10] = 1; sof0[11] = 0x11; sof0[12] = 0;
  // Component 2: Cb
  sof0[13] = 2; sof0[14] = 0x11; sof0[15] = 0;
  // Component 3: Cr
  sof0[16] = 3; sof0[17] = 0x11; sof0[18] = 0;

  // Huffman Tables DHT (Minimal standard DC/AC tables)
  const dht = Buffer.from([
    0xff, 0xc4, 0x00, 0x1f,
    0x00, // DC table 0
    0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
    0xff, 0xc4, 0x00, 0x1f,
    0x10, // AC table 0
    0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b
  ]);

  // Start of Scan SOS
  const sos = Buffer.from([
    0xff, 0xda, 0x00, 0x0c,
    0x03, // 3 components
    0x01, 0x00, // Y uses DC 0, AC 0
    0x02, 0x00, // Cb uses DC 0, AC 0
    0x03, 0x00, // Cr uses DC 0, AC 0
    0x00, 0x3f, 0x00
  ]);

  // Scan payload (uncompressed DC stream with End of Block markers)
  // Calculate scan data size according to blocks
  const mcuX = Math.ceil(width / 8);
  const mcuY = Math.ceil(height / 8);
  const totalMcu = mcuX * mcuY;
  const scanDataSize = Math.max(128, Math.min(64 * 1024, totalMcu * 3));
  const scanData = Buffer.alloc(scanDataSize, 0x55);
  // Avoid 0xFF bytes in scan data without 0x00 escaping
  for (let i = 0; i < scanData.length; i++) {
    if (scanData[i] === 0xff) scanData[i] = 0xfe;
  }

  // End of Image EOI
  const eoi = Buffer.from([0xff, 0xd9]);

  let result = Buffer.concat([soi, jfif, exifBuf, dqt, sof0, dht, sos, scanData, eoi]);

  // Pad to target size if requested (e.g. for LARGE-01 or target-size tests) using COM comment markers
  if (targetSizeBytes > result.length) {
    const diff = targetSizeBytes - result.length;
    // Embed APP13 or COM segments of max 65530 bytes each
    const segments = [];
    let rem = diff;
    while (rem > 4) {
      const chunkSize = Math.min(65530, rem - 4);
      const com = Buffer.alloc(4 + chunkSize);
      com[0] = 0xff; com[1] = 0xfe; // COM marker
      com.writeUInt16BE(chunkSize + 2, 2);
      com.fill(0x20, 4); // filler spaces
      segments.push(com);
      rem -= (4 + chunkSize);
    }
    result = Buffer.concat([soi, jfif, exifBuf, Buffer.concat(segments), dqt, sof0, dht, sos, scanData, eoi]);
  }

  return result;
}

// Minimal standard WebP generator (VP8 container)
function createValidWebp(width, height, isTransparent = false) {
  const isLossless = isTransparent;
  if (!isLossless) {
    // VP8 lossy chunk
    const vp8Header = Buffer.from([
      0x9d, 0x01, 0x2a, // Start code
      width & 0xff, (width >> 8) & 0x3f,
      height & 0xff, (height >> 8) & 0x3f,
    ]);
    const vp8Data = Buffer.alloc(64, 0x42);
    const vp8Body = Buffer.concat([vp8Header, vp8Data]);
    const vp8ChunkSize = vp8Body.length;
    const vp8ChunkHeader = Buffer.alloc(8);
    vp8ChunkHeader.write('VP8 ', 0, 4, 'ascii');
    vp8ChunkHeader.writeUInt32LE(vp8ChunkSize, 4);

    const fileSize = 4 + 8 + vp8ChunkSize + (vp8ChunkSize % 2 === 1 ? 1 : 0);
    const riffHeader = Buffer.alloc(12);
    riffHeader.write('RIFF', 0, 4, 'ascii');
    riffHeader.writeUInt32LE(fileSize, 4);
    riffHeader.write('WEBP', 8, 4, 'ascii');

    return Buffer.concat([riffHeader, vp8ChunkHeader, vp8Body]);
  } else {
    // VP8L lossless chunk
    const vp8lData = Buffer.alloc(128, 0x00);
    vp8lData[0] = 0x2f; // signature
    // 14 bits width-1, 14 bits height-1, 1 bit alpha_is_used
    const w1 = (width - 1) & 0x3fff;
    const h1 = (height - 1) & 0x3fff;
    const packed = (w1) | (h1 << 14) | (1 << 28);
    vp8lData.writeUInt32LE(packed, 1);

    const vp8lChunkHeader = Buffer.alloc(8);
    vp8lChunkHeader.write('VP8L', 0, 4, 'ascii');
    vp8lChunkHeader.writeUInt32LE(vp8lData.length, 4);

    const fileSize = 4 + 8 + vp8lData.length;
    const riffHeader = Buffer.alloc(12);
    riffHeader.write('RIFF', 0, 4, 'ascii');
    riffHeader.writeUInt32LE(fileSize, 4);
    riffHeader.write('WEBP', 8, 4, 'ascii');

    return Buffer.concat([riffHeader, vp8lChunkHeader, vp8lData]);
  }
}

console.log('Generating Section 56 Test Datasets...');

// DATASET A — STANDARD JPEG (5 files)
fs.writeFileSync(`${BASE_DIR}/jpg/standard-landscape.jpg`, createValidJpeg(1920, 1080, null, 1.2 * 1024 * 1024));
fs.writeFileSync(`${BASE_DIR}/jpg/standard-portrait.jpg`, createValidJpeg(1080, 1920, null, 1.1 * 1024 * 1024));
fs.writeFileSync(`${BASE_DIR}/jpg/small-jpeg.jpg`, createValidJpeg(640, 480, null, 150 * 1024));
fs.writeFileSync(`${BASE_DIR}/jpg/square-jpeg.jpg`, createValidJpeg(1200, 1200, null, 750 * 1024));
fs.writeFileSync(`${BASE_DIR}/jpg/high-res-jpeg.jpg`, createValidJpeg(6000, 4000, null, 5.5 * 1024 * 1024));

// DATASET B — PNG (4 files)
fs.writeFileSync(`${BASE_DIR}/png/opaque-png.png`, createValidPng(1920, 1080, { transparent: false }));
fs.writeFileSync(`${BASE_DIR}/png/transparent-png.png`, createValidPng(1600, 1200, { transparent: true }));
fs.writeFileSync(`${BASE_DIR}/png/small-png.png`, createValidPng(400, 400, { transparent: false }));
fs.writeFileSync(`${BASE_DIR}/png/large-png.png`, createValidPng(4000, 3000, { transparent: false }));

// DATASET C — WEBP (3 files)
fs.writeFileSync(`${BASE_DIR}/webp/standard.webp`, createValidWebp(1920, 1080, false));
fs.writeFileSync(`${BASE_DIR}/webp/transparent.webp`, createValidWebp(1200, 1200, true));
fs.writeFileSync(`${BASE_DIR}/webp/small.webp`, createValidWebp(640, 480, false));

// DATASET D — DIFFERENT ASPECT RATIOS (6 files)
fs.writeFileSync(`${BASE_DIR}/dimensions/aspect-16x9.png`, createValidPng(1920, 1080));
fs.writeFileSync(`${BASE_DIR}/dimensions/aspect-4x3.png`, createValidPng(1600, 1200));
fs.writeFileSync(`${BASE_DIR}/dimensions/aspect-3x2.png`, createValidPng(1800, 1200));
fs.writeFileSync(`${BASE_DIR}/dimensions/aspect-1x1.png`, createValidPng(1200, 1200));
fs.writeFileSync(`${BASE_DIR}/dimensions/aspect-9x16.png`, createValidPng(1080, 1920));
fs.writeFileSync(`${BASE_DIR}/dimensions/aspect-ultrawide.png`, createValidPng(2560, 1080));

// DATASET E — LARGE FILES (3 files)
fs.writeFileSync(`${BASE_DIR}/large-files/LARGE-01.jpg`, createValidJpeg(6000, 4000, null, 6 * 1024 * 1024));
fs.writeFileSync(`${BASE_DIR}/large-files/LARGE-02.jpg`, createValidJpeg(8000, 6000, null, 11 * 1024 * 1024));
fs.writeFileSync(`${BASE_DIR}/large-files/LARGE-03.png`, createValidPng(4000, 4000));

// DATASET F — METADATA (3 files)
fs.writeFileSync(
  `${BASE_DIR}/metadata/META-01.jpg`,
  createValidJpeg(1920, 1080, {
    make: 'Sony',
    model: 'ILCE-7RM4',
    dateTime: '2026:09:27 02:12:00',
    software: 'Lightroom Classic',
  })
);
fs.writeFileSync(
  `${BASE_DIR}/metadata/META-02.jpg`,
  createValidJpeg(1920, 1080, {
    make: 'Apple',
    model: 'iPhone 15 Pro',
    dateTime: '2026:09:26 14:45:00',
    software: 'iOS 18.2',
  })
);
fs.writeFileSync(
  `${BASE_DIR}/metadata/META-03.jpg`,
  createValidJpeg(1200, 1200, {
    make: 'Canon',
    model: 'EOS R5',
    dateTime: '2026:08:15 10:30:00',
    software: 'Digital Photo Professional',
  })
);

// DATASET G — CORRUPTED / INVALID FILES (5 files)
fs.writeFileSync(`${BASE_DIR}/corrupted/invalid-extension.jpg`, Buffer.from('This is not a real JPEG image file. Just plain text.'));
fs.writeFileSync(`${BASE_DIR}/corrupted/truncated-jpeg.jpg`, createValidJpeg(1920, 1080).slice(0, 150));
fs.writeFileSync(`${BASE_DIR}/corrupted/invalid-png.png`, Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, 99, 99]));
fs.writeFileSync(`${BASE_DIR}/corrupted/empty-file.jpg`, Buffer.alloc(0));
fs.writeFileSync(`${BASE_DIR}/corrupted/random-data.webp`, Buffer.from('RIFF\x10\x00\x00\x00WEBPVP8 \x04\x00\x00\x00\xff\xff\xff\xff'));

// DATASET H — UNSUPPORTED FILES (5 files)
fs.writeFileSync(`${BASE_DIR}/edge-cases/test.pdf`, Buffer.from('%PDF-1.4\n%EOF'));
fs.writeFileSync(`${BASE_DIR}/edge-cases/test.txt`, Buffer.from('Plain text documentation file'));
fs.writeFileSync(`${BASE_DIR}/edge-cases/test.zip`, Buffer.from('PK\x05\x06\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'));
fs.writeFileSync(`${BASE_DIR}/edge-cases/test.mp4`, Buffer.from('\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42isom'));
fs.writeFileSync(`${BASE_DIR}/edge-cases/test.exe`, Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00'));

// DATASET I — BATCH TEST (20 files: 5 JPG, 5 PNG, 5 WebP, 5 mixed)
for (let i = 1; i <= 5; i++) {
  fs.writeFileSync(`${BASE_DIR}/batch/batch-jpg-${String(i).padStart(2, '0')}.jpg`, createValidJpeg(800 + i * 100, 600 + i * 50));
  fs.writeFileSync(`${BASE_DIR}/batch/batch-png-${String(i).padStart(2, '0')}.png`, createValidPng(600 + i * 80, 600 + i * 80));
  fs.writeFileSync(`${BASE_DIR}/batch/batch-webp-${String(i).padStart(2, '0')}.webp`, createValidWebp(700 + i * 50, 500 + i * 50));
  fs.writeFileSync(`${BASE_DIR}/batch/batch-mixed-${String(i).padStart(2, '0')}.png`, createValidPng(500 + i * 150, 400 + i * 100));
}

// DATASET J — EDITOR MASTER (2400x1600 PNG)
fs.writeFileSync(`${BASE_DIR}/edge-cases/editor-master.png`, createValidPng(2400, 1600, { pattern: 'master', transparent: true }));

// DATASET K — WATERMARK LOGO (512x512 transparent PNG)
fs.writeFileSync(`${BASE_DIR}/edge-cases/watermark-logo.png`, createValidPng(512, 512, { pattern: 'checker', transparent: true }));

// DATASET L — TARGET-SIZE SOURCE (4000x3000 JPEG, ~3.5 MB)
fs.writeFileSync(`${BASE_DIR}/edge-cases/target-size-source.jpg`, createValidJpeg(4000, 3000, null, 3.5 * 1024 * 1024));

console.log('All 56+ standardized test files generated successfully in /tests/pixora-test-data/ !');
