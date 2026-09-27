import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, isMaskable = false) {
  // Simple uncompressed or deflate PNG generator
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);

    // CRC32 calculation
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

  // Generate raw image pixels (RGBA) with scanline filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Calculate background or icon shape
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep dark sleek background (#0b0f17)
      let r = 11, g = 15, b = 23, a = 255;

      // Stylized 'P'
      // Stem: x in [0.28 * width, 0.42 * width], y in [0.24 * height, 0.76 * height]
      const inStem = (x >= width * 0.28 && x <= width * 0.42 && y >= height * 0.24 && y <= height * 0.76);
      
      // Upper loop: center (0.42*w, 0.40*h), radius outer 0.22*w, inner 0.09*w, x >= 0.42*w
      const loopDx = x - width * 0.42;
      const loopDy = y - height * 0.40;
      const loopDist = Math.sqrt(loopDx * loopDx + loopDy * loopDy);
      const inLoop = (loopDx >= -2 && loopDist <= width * 0.23 && loopDist >= width * 0.08);

      if (inStem || inLoop) {
        // Gradient from violet to cyan
        const t = (x + y) / (width + height);
        r = Math.round(139 * (1 - t) + 6 * t);
        g = Math.round(92 * (1 - t) + 182 * t);
        b = Math.round(246 * (1 - t) + 212 * t);
        a = 255;
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

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

fs.writeFileSync('./public/pwa-192x192.png', createPng(192, 192, false));
fs.writeFileSync('./public/pwa-512x512.png', createPng(512, 512, false));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createPng(512, 512, true));
fs.writeFileSync('./public/apple-touch-icon.png', createPng(180, 180, false));
fs.writeFileSync('./public/favicon.ico', createPng(32, 32, false));
console.log('PWA PNG icons generated successfully!');
