/**
 * Pure TypeScript QR Code generator (Model 2, Byte Mode, Error Correction Level M).
 *
 * Self-contained and dependency-free:
 * - Generates standard QR Code 2D matrix.
 * - Reed-Solomon Error Correction over GF(256).
 * - Automatic version selection (supports up to Version 10, sufficient for URLs and vCards).
 * - Outputs clean, scalable SVG paths with zero network dependencies.
 */

// Galois Field 256 math for Reed-Solomon
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    EXP_TABLE[i + 255] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
}

function polyMul(p1: Uint8Array, p2: Uint8Array): Uint8Array {
  const result = new Uint8Array(p1.length + p2.length - 1);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMul(p1[i], p2[j]);
    }
  }
  return result;
}

function getGeneratorPoly(degree: number): Uint8Array {
  let g: Uint8Array = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const factor = new Uint8Array([1, EXP_TABLE[i]]);
    g = new Uint8Array(polyMul(g, factor));
  }
  return g;
}

function computeReedSolomon(data: Uint8Array, ecCount: number): Uint8Array {
  const gen = getGeneratorPoly(ecCount);
  const remainder = new Uint8Array(ecCount);

  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    remainder.copyWithin(0, 1);
    remainder[remainder.length - 1] = 0;
    if (factor !== 0) {
      for (let j = 0; j < ecCount; j++) {
        remainder[j] ^= gfMul(gen[j + 1], factor);
      }
    }
  }
  return remainder;
}

// Version table for EC Level M (Data capacities and ECC codewords)
// [totalCodewords, dataCodewords, ecCodewords, ecBlocks]
const VERSION_SPECS: [number, number, number, number][] = [
  [0, 0, 0, 0], // index 0 unused
  [26, 16, 10, 1], // V1
  [44, 28, 16, 1], // V2
  [70, 44, 26, 1], // V3
  [100, 64, 36, 2], // V4
  [134, 86, 48, 2], // V5
  [172, 108, 64, 4], // V6
  [196, 124, 72, 4], // V7
  [242, 154, 88, 4], // V8
  [292, 182, 110, 5], // V9
  [346, 216, 130, 5], // V10
];

// Alignment pattern locations per version
const ALIGNMENT_PATTERN_POSITIONS: number[][] = [
  [],
  [], // V1
  [6, 18], // V2
  [6, 22], // V3
  [6, 26], // V4
  [6, 30], // V5
  [6, 34], // V6
  [6, 22, 38], // V7
  [6, 24, 42], // V8
  [6, 26, 46], // V9
  [6, 28, 50], // V10
];

function chooseVersion(dataLen: number): number {
  for (let v = 1; v <= 10; v++) {
    const capacity = VERSION_SPECS[v][1];
    // Byte mode overhead: 4 bits mode + 8 bits length indicator (16 bits for V10+)
    const overhead = v < 10 ? 2 : 3;
    if (dataLen + overhead <= capacity) return v;
  }
  return 10; // clamp to max supported
}

export function encodeQrMatrix(text: string): boolean[][] {
  const utf8Data = Buffer.from(text, 'utf-8');
  const version = chooseVersion(utf8Data.length);
  const [, dataCodewordsCount, ecTotalCount, numBlocks] = VERSION_SPECS[version];

  // 1. Bit Buffer encoding (Mode 0100 for Byte mode)
  const bits: number[] = [];
  const appendBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  appendBits(0b0100, 4); // Byte mode indicator
  appendBits(utf8Data.length, version < 10 ? 8 : 16); // Character count

  for (const b of utf8Data) {
    appendBits(b, 8);
  }

  // Terminator
  const requiredBits = dataCodewordsCount * 8;
  const termBits = Math.min(4, requiredBits - bits.length);
  appendBits(0, termBits);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);

  // Pad bytes (0xEC, 0x11)
  const padPatterns = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < requiredBits) {
    appendBits(padPatterns[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to byte codewords
  const dataBytes = new Uint8Array(dataCodewordsCount);
  for (let i = 0; i < dataCodewordsCount; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      byte = (byte << 1) | bits[i * 8 + b];
    }
    dataBytes[i] = byte;
  }

  // 2. Error correction coding
  const ecPerBlock = ecTotalCount / numBlocks;
  const blockDataLen = Math.floor(dataCodewordsCount / numBlocks);

  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];

  for (let b = 0; b < numBlocks; b++) {
    const start = b * blockDataLen;
    const end = b === numBlocks - 1 ? dataCodewordsCount : start + blockDataLen;
    const slice = dataBytes.slice(start, end);
    dataBlocks.push(slice);
    ecBlocks.push(computeReedSolomon(slice, ecPerBlock));
  }

  // Interleave data and ec codewords
  const finalCodewords: number[] = [];
  const maxBlockLen = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxBlockLen; i++) {
    for (const b of dataBlocks) {
      if (i < b.length) finalCodewords.push(b[i]);
    }
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (const b of ecBlocks) {
      finalCodewords.push(b[i]);
    }
  }

  // 3. Matrix construction
  const size = version * 4 + 17;
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  );

  const placeFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        const isBorder = r === -1 || r === 7 || c === -1 || c === 7;
        const isRing = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[nr][nc] = !isBorder && (isRing || isCenter);
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  // Dark module
  matrix[size - 8][8] = true;

  // Alignment patterns
  const alignCoords = ALIGNMENT_PATTERN_POSITIONS[version];
  for (const r of alignCoords) {
    for (const c of alignCoords) {
      if (matrix[r][c] !== null) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const border = Math.max(Math.abs(dr), Math.abs(dc)) === 2;
          const center = dr === 0 && dc === 0;
          matrix[r + dr][c + dc] = border || center;
        }
      }
    }
  }

  // Reserved format info areas
  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
    if (matrix[size - 1 - i][8] === null) matrix[size - 1 - i][8] = false;
    if (matrix[8][size - 1 - i] === null) matrix[8][size - 1 - i] = false;
  }

  // 4. Place Data Codewords (zigzag)
  let row = size - 1;
  let col = size - 1;
  let dir = -1; // up

  const allBits: number[] = [];
  for (const byte of finalCodewords) {
    for (let b = 7; b >= 0; b--) {
      allBits.push((byte >> b) & 1);
    }
  }
  let bitPointer = 0;

  while (col > 0) {
    if (col === 6) col--; // skip vertical timing line
    for (let i = 0; i < size; i++) {
      const r = dir === -1 ? row - i : row + i;
      for (let c = 0; c < 2; c++) {
        const curCol = col - c;
        if (matrix[r][curCol] === null) {
          const bitVal = bitPointer < allBits.length ? allBits[bitPointer] === 1 : false;
          // Apply standard Mask 0: (row + col) % 2 === 0
          const mask = (r + curCol) % 2 === 0;
          matrix[r][curCol] = mask ? !bitVal : bitVal;
          bitPointer++;
        }
      }
    }
    row = dir === -1 ? 0 : size - 1;
    dir = -dir;
    col -= 2;
  }

  // Format info bits for Mask 0, EC Level M (BCH encoded 0x5412)
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[i] === 1;
  matrix[8][7] = formatBits[6] === 1;
  matrix[8][8] = formatBits[7] === 1;
  matrix[7][8] = formatBits[8] === 1;
  for (let i = 9; i < 15; i++) matrix[14 - i][8] = formatBits[i] === 1;

  for (let i = 0; i < 7; i++) matrix[size - 1 - i][8] = formatBits[i] === 1;
  for (let i = 7; i < 15; i++) matrix[8][size - 15 + i] = formatBits[i] === 1;

  return matrix.map((r) => r.map((cell) => cell ?? false));
}

/**
 * Renders an optimized SVG path string from a QR matrix.
 */
export function generateQrSvg(
  text: string,
  options: { size?: number; padding?: number } = {}
): string {
  const matrix = encodeQrMatrix(text);
  const count = matrix.length;
  const padding = options.padding ?? 4;
  const total = count + padding * 2;
  const size = options.size ?? 256;

  let pathData = '';
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (matrix[r][c]) {
        pathData += `M${c + padding},${r + padding}h1v1h-1z `;
      }
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" ` +
    `width="${size}" height="${size}" shape-rendering="crispEdges">` +
    `<rect width="100%" height="100%" fill="transparent" />` +
    `<path d="${pathData.trim()}" fill="currentColor" />` +
    `</svg>`
  );
}
