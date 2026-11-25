import { deflateSync, inflateSync } from "node:zlib";

/**
 * A PNG reader and writer on Node's zlib, so comparing two images needs no browser and no dependency.
 *
 * The reader takes any PNG another tool might write: every colour type and bit depth, palettes, `tRNS` transparency and Adam7 interlacing. It reads sample values as stored and ignores colour-profile chunks (`gAMA`, `iCCP`, `sRGB`), as image-diff tools usually do. The writer writes 8-bit RGBA only.
 */

export interface Bitmap {
  width: number;
  height: number;
  /** 8-bit RGBA, row by row, four bytes a pixel. */
  data: Uint8Array;
}

const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Samples per pixel, by colour type: grey, RGB, palette index, grey and alpha, RGBA. */
const channels: Partial<Record<number, number>> = {
  0: 1,
  2: 3,
  3: 1,
  4: 2,
  6: 4
};

/** Adam7's seven passes: where each starts, and how far apart its pixels are. */
const adam7 = [
  [0, 0, 8, 8],
  [4, 0, 8, 8],
  [0, 4, 4, 8],
  [2, 0, 4, 4],
  [0, 2, 2, 4],
  [1, 0, 2, 2],
  [0, 1, 1, 2]
] as const;

const paeth = (left: number, up: number, upLeft: number): number => {
  const estimate = left + up - upLeft;
  const toLeft = Math.abs(estimate - left);
  const toUp = Math.abs(estimate - up);
  const toUpLeft = Math.abs(estimate - upLeft);
  if (toLeft <= toUp && toLeft <= toUpLeft) return left;
  return toUp <= toUpLeft ? up : upLeft;
};

/** Undoes each scanline's filter in place. `stride` is the bytes in a line, `step` the bytes in a pixel (at least one). */
const unfilter = (
  data: Buffer,
  offset: number,
  lines: number,
  stride: number,
  step: number
): Buffer => {
  const out = Buffer.alloc(lines * stride);
  for (let line = 0; line < lines; line++) {
    const filter = data[offset + line * (stride + 1)];
    const source = offset + line * (stride + 1) + 1;
    const row = line * stride;
    const previous = row - stride;
    for (let index = 0; index < stride; index++) {
      const value = data[source + index];
      const left = index >= step ? out[row + index - step] : 0;
      const up = line > 0 ? out[previous + index] : 0;
      const upLeft =
        line > 0 && index >= step ? out[previous + index - step] : 0;
      let decoded: number;
      switch (filter) {
        case 0:
          decoded = value;
          break;
        case 1:
          decoded = value + left;
          break;
        case 2:
          decoded = value + up;
          break;
        case 3:
          decoded = value + ((left + up) >> 1);
          break;
        case 4:
          decoded = value + paeth(left, up, upLeft);
          break;
        default:
          throw new Error(
            `it uses scanline filter ${String(filter)}, which PNG does not define`
          );
      }
      out[row + index] = decoded & 0xff;
    }
  }
  return out;
};

/**
 * Decodes a PNG to 8-bit RGBA. Throws an error whose message finishes the sentence "could not read the file as a PNG, because…".
 */
export const decodePng = (file: Buffer): Bitmap => {
  if (file.length < 8 || !file.subarray(0, 8).equals(signature)) {
    throw new Error(`it does not start with the PNG signature`);
  }
  let header: Buffer | undefined;
  let palette: Buffer | undefined;
  let transparency: Buffer | undefined;
  const compressed: Buffer[] = [];
  let offset = 8;
  while (offset + 8 <= file.length) {
    const length = file.readUInt32BE(offset);
    const type = file.toString(`latin1`, offset + 4, offset + 8);
    const body = file.subarray(offset + 8, offset + 8 + length);
    if (type === `IHDR`) header = body;
    else if (type === `PLTE`) palette = body;
    else if (type === `tRNS`) transparency = body;
    else if (type === `IDAT`) compressed.push(body);
    else if (type === `IEND`) break;
    offset += 12 + length;
  }
  if (!header || header.length < 13) throw new Error(`it has no IHDR chunk`);
  const width = header.readUInt32BE(0);
  const height = header.readUInt32BE(4);
  const depth = header[8];
  const colour = header[9];
  const interlaced = header[12] === 1;
  const samples = channels[colour];
  if (samples === undefined) {
    throw new Error(
      `it uses colour type ${String(colour)}, which PNG does not define`
    );
  }
  if (![1, 2, 4, 8, 16].includes(depth)) {
    throw new Error(
      `it uses bit depth ${String(depth)}, which PNG does not define`
    );
  }
  if (colour === 3 && !palette)
    throw new Error(
      `it has a colour type that needs a palette, and no PLTE chunk`
    );
  if (compressed.length === 0) throw new Error(`it has no image data`);
  let raw: Buffer;
  try {
    raw = inflateSync(Buffer.concat(compressed));
  } catch (error) {
    throw new Error(
      `its image data does not decompress (${error instanceof Error ? error.message : String(error)})`,
      { cause: error }
    );
  }

  const data = new Uint8Array(width * height * 4);
  const bitsPerPixel = samples * depth;
  const step = Math.max(1, bitsPerPixel >> 3);
  const maxSample = 2 ** depth - 1;
  /** The sample at `index` in an unfiltered line, as stored. */
  const sampleAt = (line: Buffer, start: number, index: number): number => {
    if (depth === 8) return line[start + index];
    if (depth === 16) return line.readUInt16BE(start + index * 2);
    const bit = index * depth;
    return (line[start + (bit >> 3)] >> (8 - depth - (bit & 7))) & maxSample;
  };
  const to8 = (value: number): number =>
    depth === 16
      ? value >> 8
      : depth === 8
        ? value
        : Math.round((value * 255) / maxSample);
  const transparentKey =
    transparency && (colour === 0 || colour === 2)
      ? Array.from({ length: colour === 0 ? 1 : 3 }, (_, index) =>
          transparency.readUInt16BE(index * 2)
        )
      : undefined;

  const write = (
    line: Buffer,
    start: number,
    pixel: number,
    x: number,
    y: number
  ): void => {
    const target = (y * width + x) * 4;
    const sample = (index: number): number =>
      sampleAt(line, start, pixel * samples + index);
    if (colour === 3) {
      const entry = sample(0);
      data[target] = palette?.[entry * 3] ?? 0;
      data[target + 1] = palette?.[entry * 3 + 1] ?? 0;
      data[target + 2] = palette?.[entry * 3 + 2] ?? 0;
      data[target + 3] = transparency?.[entry] ?? 255;
      return;
    }
    const stored = Array.from({ length: samples }, (_, index) => sample(index));
    const grey = colour === 0 || colour === 4;
    const [r, g, b] = grey ? [stored[0], stored[0], stored[0]] : stored;
    data[target] = to8(r);
    data[target + 1] = to8(g);
    data[target + 2] = to8(b);
    data[target + 3] =
      colour === 4
        ? to8(stored[1])
        : colour === 6
          ? to8(stored[3])
          : transparentKey?.every((key, index) => key === stored[index])
            ? 0
            : 255;
  };

  const passes = interlaced ? adam7 : ([[0, 0, 1, 1]] as const);
  let cursor = 0;
  for (const [startX, startY, stepX, stepY] of passes) {
    const passWidth = Math.ceil((width - startX) / stepX);
    const passHeight = Math.ceil((height - startY) / stepY);
    if (passWidth <= 0 || passHeight <= 0) continue;
    const stride = Math.ceil((passWidth * bitsPerPixel) / 8);
    if (cursor + passHeight * (stride + 1) > raw.length) {
      throw new Error(`its image data is shorter than its size says`);
    }
    const lines = unfilter(raw, cursor, passHeight, stride, step);
    cursor += passHeight * (stride + 1);
    for (let y = 0; y < passHeight; y++) {
      for (let x = 0; x < passWidth; x++) {
        write(lines, y * stride, x, startX + x * stepX, startY + y * stepY);
      }
    }
  }
  return { width, height, data };
};

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

const crc32 = (bytes: Buffer): number => {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const chunk = (type: string, body: Buffer): Buffer => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(body.length);
  const typed = Buffer.concat([Buffer.from(type, `latin1`), body]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typed));
  return Buffer.concat([length, typed, crc]);
};

/** Encodes 8-bit RGBA as a PNG. The same pixels always give the same bytes. */
export const encodePng = ({ width, height, data }: Bitmap): Buffer => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const stride = width * 4;
  const lines = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    // Filter type 0 (none) on every line: simple, and the diff images this writes compress well enough.
    lines.set(
      data.subarray(y * stride, (y + 1) * stride),
      y * (stride + 1) + 1
    );
  }
  return Buffer.concat([
    signature,
    chunk(`IHDR`, header),
    chunk(`IDAT`, deflateSync(lines)),
    chunk(`IEND`, Buffer.alloc(0))
  ]);
};
