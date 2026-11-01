import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Function to generate a valid PNG buffer programmatically without external libraries
function createPng(width, height, drawFn) {
  // RGBA buffer: (width * 4 + 1) * height bytes (1 filter byte per scanline)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // Compress data with zlib deflate
  const compressed = zlib.deflateSync(rawData);

  // CRC32 implementation
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const typeAndData = Buffer.concat([typeBuf, data]);

    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(typeAndData), 0);

    return Buffer.concat([len, typeAndData, crcBuf]);
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression: deflate
  ihdrData[11] = 0; // Filter: standard
  ihdrData[12] = 0; // Interlace: none

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Store Icon Drawing logic (matches app colors: Dark Slate, Amber, Orange, Emerald, Sky)
function storeIconDrawer(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const r = w / 2;

  // Background: Deep dark slate with subtle radial highlight
  const dist = Math.hypot(x - cx, y - cy);
  let bgR = 15, bgG = 23, bgB = 42; // #0f172a
  if (dist < r) {
    const factor = (r - dist) / r;
    bgR = Math.min(255, Math.floor(15 + 20 * factor));
    bgG = Math.min(255, Math.floor(23 + 25 * factor));
    bgB = Math.min(255, Math.floor(42 + 35 * factor));
  }

  // Corner rounding for standard (non-maskable) icons
  if (!isMaskable) {
    const cornerR = w * 0.22;
    const inCornerX = x < cornerR || x > w - cornerR;
    const inCornerY = y < cornerR || y > h - cornerR;
    if (inCornerX && inCornerY) {
      const cxCorner = x < cornerR ? cornerR : w - cornerR;
      const cyCorner = y < cornerR ? cornerR : h - cornerR;
      if (Math.hypot(x - cxCorner, y - cyCorner) > cornerR) {
        return [0, 0, 0, 0]; // Transparent outside rounded corner
      }
    }
  }

  // Safe inner zone
  const scale = w / 512;
  const px = x / scale;
  const py = y / scale;

  // Store Awning / Canopy Roof (120 to 200)
  if (py >= 120 && py <= 200 && px >= 96 && px <= 416) {
    // Awning slope
    const topSlope = 120 + ((px < 256 ? 256 - px : px - 256) / 160) * 0;
    if (py >= topSlope) {
      // Amber to Orange Gradient
      const gradT = (px - 96) / 320;
      const awR = Math.floor(245 + (249 - 245) * gradT);
      const awG = Math.floor(158 + (115 - 158) * gradT);
      const awB = Math.floor(11 + (22 - 11) * gradT);

      // White stripes
      if ((px > 150 && px < 180) || (px > 230 && px < 260) || (px > 310 && px < 340)) {
        return [255, 255, 255, 230];
      }
      return [awR, awG, awB, 255];
    }
  }

  // Store Front Frame (200 to 392)
  if (px >= 116 && px <= 396 && py >= 200 && py <= 392) {
    // Outline border
    if (px <= 124 || px >= 388 || py <= 206 || py >= 386) {
      return [71, 85, 105, 255]; // #475569
    }

    // Shelves (lines at py=264 and py=328)
    if ((py >= 262 && py <= 268) || (py >= 326 && py <= 332)) {
      if (px >= 140 && px <= 372) {
        return [148, 163, 184, 255]; // Shelf line
      }
    }

    // Product Boxes on Shelf 1 (Amber, Sky, Emerald)
    if (py >= 224 && py <= 262) {
      if (px >= 156 && px <= 204) return [245, 158, 11, 255]; // Amber box
      if (px >= 216 && px <= 272) return [14, 165, 233, 255]; // Sky box
      if (px >= 284 && px <= 332) return [16, 185, 129, 255]; // Emerald box
    }

    // Product Boxes on Shelf 2 (Pink, Violet, Orange)
    if (py >= 284 && py <= 326) {
      if (px >= 156 && px <= 220) return [236, 72, 153, 255]; // Pink box
      if (px >= 236 && px <= 288) return [139, 92, 246, 255]; // Violet box
      if (px >= 300 && px <= 360) return [249, 115, 22, 255]; // Orange box
    }

    // Shelf background
    return [30, 41, 59, 255]; // #1e293b
  }

  // AI Scanner Target Ring in center
  const distScan = Math.hypot(px - 256, py - 272);
  if (Math.abs(distScan - 72) < 4) {
    // Dashed ring
    const angle = Math.atan2(py - 272, px - 256);
    if (Math.sin(angle * 8) > 0) {
      return [56, 189, 248, 255]; // Cyan ring
    }
  }

  // Badge Camera / AI Pin at bottom right
  const distPin = Math.hypot(px - 396, py - 380);
  if (distPin <= 44) {
    if (distPin <= 12) return [56, 189, 248, 255];
    if (distPin <= 20) return [15, 23, 42, 255];
    return [16, 185, 129, 255]; // Emerald camera badge
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. pwa-192x192.png
const pwa192 = createPng(192, 192, (x, y, w, h) => storeIconDrawer(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);
console.log('Generated public/pwa-192x192.png');

// 2. pwa-512x512.png
const pwa512 = createPng(512, 512, (x, y, w, h) => storeIconDrawer(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);
console.log('Generated public/pwa-512x512.png');

// 3. pwa-maskable-512x512.png (full bleed safe zone)
const pwaMaskable = createPng(512, 512, (x, y, w, h) => storeIconDrawer(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable);
console.log('Generated public/pwa-maskable-512x512.png');

// 4. apple-touch-icon.png (180x180)
const appleIcon = createPng(180, 180, (x, y, w, h) => storeIconDrawer(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
console.log('Generated public/apple-touch-icon.png');

// 5. favicon.ico (fallback 32x32 PNG inside)
const favicon = createPng(32, 32, (x, y, w, h) => storeIconDrawer(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);
console.log('Generated public/favicon.ico');
