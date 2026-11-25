import { brotliDecompressSync, inflateSync } from "node:zlib";

/**
 * Reads the weight and style a font file declares about itself, so a supplied gg sans can be declared to the browser with the right `@font-face` descriptors whatever its files are called. Discord's own copies of the font have hashed names, so the file name says nothing.
 *
 * Reads TrueType and OpenType (`.ttf`, `.otf`), WOFF and WOFF2. Only two tables are read: `OS/2` for the weight class and the italic bit, and `fvar` for a variable font's weight range.
 */

export interface FontDescriptors {
  /** A CSS `font-weight` descriptor: one weight such as `400`, or a variable font's range such as `100 900`. */
  weight: string;
  style: `normal` | `italic`;
}

/** WOFF2 names its common tables by an index into this list instead of spelling the tag; these are the ones this reader needs. https://www.w3.org/TR/WOFF2/#table_dir_format */
const woff2KnownTags: Partial<Record<number, string>> = {
  6: `OS/2`,
  10: `glyf`,
  11: `loca`,
  47: `fvar`
};

type Tables = Map<string, Buffer>;

const tag = (data: Buffer, offset: number): string =>
  data.toString(`latin1`, offset, offset + 4);

const sfntTables = (data: Buffer): Tables => {
  const tables: Tables = new Map();
  const count = data.readUInt16BE(4);
  for (let index = 0; index < count; index++) {
    const entry = 12 + index * 16;
    const offset = data.readUInt32BE(entry + 8);
    const length = data.readUInt32BE(entry + 12);
    tables.set(tag(data, entry), data.subarray(offset, offset + length));
  }
  return tables;
};

const woffTables = (data: Buffer): Tables => {
  const tables: Tables = new Map();
  const count = data.readUInt16BE(12);
  for (let index = 0; index < count; index++) {
    const entry = 44 + index * 20;
    const offset = data.readUInt32BE(entry + 4);
    const compressed = data.readUInt32BE(entry + 8);
    const original = data.readUInt32BE(entry + 12);
    const stored = data.subarray(offset, offset + compressed);
    tables.set(
      tag(data, entry),
      compressed < original ? inflateSync(stored) : stored
    );
  }
  return tables;
};

const woff2Tables = (data: Buffer): Tables => {
  if (tag(data, 4) === `ttcf`) {
    throw new Error(`it is a font collection, which holds several fonts`);
  }
  const count = data.readUInt16BE(12);
  const compressedLength = data.readUInt32BE(20);
  let cursor = 48;
  const base128 = (): number => {
    let value = 0;
    for (let index = 0; index < 5; index++) {
      const byte = data[cursor++];
      value = value * 128 + (byte & 0x7f);
      if ((byte & 0x80) === 0) return value;
    }
    throw new Error(`its table directory is malformed`);
  };
  const entries: Array<{ tag: string; length: number }> = [];
  for (let index = 0; index < count; index++) {
    const flags = data[cursor++];
    const known = flags & 0x3f;
    let name = woff2KnownTags[known] ?? `#${String(known)}`;
    if (known === 0x3f) {
      name = tag(data, cursor);
      cursor += 4;
    }
    const original = base128();
    const version = flags >> 6;
    // `glyf` and `loca` are transformed unless their version is 3; every other table is transformed unless its version is 0. A transformed table's stored length follows.
    const transformed =
      name === `glyf` || name === `loca` ? version !== 3 : version !== 0;
    entries.push({ tag: name, length: transformed ? base128() : original });
  }
  // Every table's data is in one Brotli stream after the directory, back to back in directory order.
  const stream = brotliDecompressSync(
    data.subarray(cursor, cursor + compressedLength)
  );
  const tables: Tables = new Map();
  let offset = 0;
  for (const entry of entries) {
    tables.set(entry.tag, stream.subarray(offset, offset + entry.length));
    offset += entry.length;
  }
  return tables;
};

const tablesOf = (data: Buffer): Tables => {
  if (data.length < 12) throw new Error(`it is too short to be a font`);
  const signature = tag(data, 0);
  if (signature === `wOF2`) return woff2Tables(data);
  if (signature === `wOFF`) return woffTables(data);
  if (signature === `ttcf`) {
    throw new Error(`it is a font collection, which holds several fonts`);
  }
  if (
    signature === `OTTO` ||
    signature === `true` ||
    data.readUInt32BE(0) === 0x00010000
  ) {
    return sfntTables(data);
  }
  throw new Error(
    `it does not start like a TrueType, OpenType, WOFF or WOFF2 font`
  );
};

/** A variable font's weight axis, as `min max`, or undefined when it has none. */
const weightRange = (fvar: Buffer | undefined): string | undefined => {
  if (!fvar) return undefined;
  const axesOffset = fvar.readUInt16BE(4);
  const axisCount = fvar.readUInt16BE(8);
  const axisSize = fvar.readUInt16BE(10);
  for (let index = 0; index < axisCount; index++) {
    const axis = axesOffset + index * axisSize;
    if (tag(fvar, axis) === `wght`) {
      const min = Math.round(fvar.readInt32BE(axis + 4) / 65536);
      const max = Math.round(fvar.readInt32BE(axis + 12) / 65536);
      return `${String(min)} ${String(max)}`;
    }
  }
  return undefined;
};

/**
 * The weight and style a font file declares. Throws an error whose message finishes the sentence "could not read the font file, because…" when the file is not a single font this can read.
 */
export const readFontDescriptors = (data: Buffer): FontDescriptors => {
  const tables = tablesOf(data);
  const os2 = tables.get(`OS/2`);
  if (!os2 || os2.length < 64) {
    throw new Error(
      `it has no OS/2 table, which is where a font says its weight and style`
    );
  }
  const fsSelection = os2.readUInt16BE(62);
  return {
    weight:
      weightRange(tables.get(`fvar`)) ?? String(os2.readUInt16BE(4) || 400),
    // Bit 0 is italic, bit 9 oblique; the browser treats both as the italic face.
    style: (fsSelection & 0x0201) === 0 ? `normal` : `italic`
  };
};
