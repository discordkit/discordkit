import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { deflateSync } from "node:zlib";
import { describe, expect, it } from "vite-plus/test";
import { readFontDescriptors } from "../fontFile.js";

/**
 * A supplied gg sans is declared to the browser with the weight and style each file says it has. If one were read wrong, bold text would be drawn from the regular file with a synthesised bold, or not at all, and the image would quietly stop matching Discord. Discord's own copies have hashed file names, so the file's contents are the only source.
 *
 * WOFF2 is checked on real files from the bundled fontsource packages. TrueType and WOFF are checked on minimal fonts built here, holding only the tables the reader looks at.
 */

const require = createRequire(import.meta.url);
const fontsource = async (name: string, file: string): Promise<Buffer> =>
  readFile(
    join(dirname(require.resolve(`${name}/package.json`)), `files`, file)
  );

const os2 = (weight: number, fsSelection: number): Buffer => {
  const table = Buffer.alloc(78);
  table.writeUInt16BE(weight, 4);
  table.writeUInt16BE(fsSelection, 62);
  return table;
};

const fvar = (min: number, max: number): Buffer => {
  const table = Buffer.alloc(16 + 20);
  table.writeUInt16BE(1, 0);
  table.writeUInt16BE(16, 4);
  table.writeUInt16BE(2, 6);
  table.writeUInt16BE(1, 8);
  table.writeUInt16BE(20, 10);
  table.write(`wght`, 16, `latin1`);
  table.writeInt32BE(min * 65536, 20);
  table.writeInt32BE(400 * 65536, 24);
  table.writeInt32BE(max * 65536, 28);
  return table;
};

/** A TrueType file holding only `tables`. */
const sfnt = (
  tables: Record<string, Buffer>,
  signature = 0x00010000
): Buffer => {
  const entries = Object.entries(tables);
  const header = Buffer.alloc(12 + entries.length * 16);
  header.writeUInt32BE(signature, 0);
  header.writeUInt16BE(entries.length, 4);
  let offset = header.length;
  const bodies: Buffer[] = [];
  entries.forEach(([tag, body], index) => {
    const entry = 12 + index * 16;
    header.write(tag, entry, `latin1`);
    header.writeUInt32BE(offset, entry + 8);
    header.writeUInt32BE(body.length, entry + 12);
    const padded = Buffer.alloc(Math.ceil(body.length / 4) * 4);
    body.copy(padded);
    bodies.push(padded);
    offset += padded.length;
  });
  return Buffer.concat([header, ...bodies]);
};

/** A WOFF file holding only `tables`, each compressed. */
const woff = (tables: Record<string, Buffer>): Buffer => {
  const entries = Object.entries(tables);
  const header = Buffer.alloc(44 + entries.length * 20);
  header.write(`wOFF`, 0, `latin1`);
  header.writeUInt32BE(0x00010000, 4);
  header.writeUInt16BE(entries.length, 12);
  let offset = header.length;
  const bodies: Buffer[] = [];
  entries.forEach(([tag, body], index) => {
    const entry = 44 + index * 20;
    const compressed = deflateSync(body);
    header.write(tag, entry, `latin1`);
    header.writeUInt32BE(offset, entry + 4);
    header.writeUInt32BE(compressed.length, entry + 8);
    header.writeUInt32BE(body.length, entry + 12);
    bodies.push(compressed);
    offset += compressed.length;
  });
  return Buffer.concat([header, ...bodies]);
};

describe(`readFontDescriptors`, () => {
  it(`reads a variable WOFF2 font's whole weight range, so one file serves every weight without synthesised bold`, async () => {
    await expect(
      fontsource(
        `@fontsource-variable/noto-sans`,
        `noto-sans-latin-wght-normal.woff2`
      ).then(readFontDescriptors)
    ).resolves.toStrictEqual({ weight: `100 900`, style: `normal` });
    await expect(
      fontsource(
        `@fontsource-variable/noto-sans-jp`,
        `noto-sans-jp-latin-wght-normal.woff2`
      ).then(readFontDescriptors)
    ).resolves.toStrictEqual({ weight: `100 900`, style: `normal` });
  });

  it(`reads an italic WOFF2 font as italic, so italic text uses it instead of a slanted upright`, async () => {
    await expect(
      fontsource(
        `@fontsource-variable/noto-sans`,
        `noto-sans-latin-wght-italic.woff2`
      ).then(readFontDescriptors)
    ).resolves.toStrictEqual({ weight: `100 900`, style: `italic` });
  });

  it(`reads a static TrueType font's weight and italic bit`, () => {
    expect(
      readFontDescriptors(sfnt({ "OS/2": os2(700, 0x0001) }))
    ).toStrictEqual({
      weight: `700`,
      style: `italic`
    });
    expect(
      readFontDescriptors(sfnt({ "OS/2": os2(500, 0x0040) }))
    ).toStrictEqual({
      weight: `500`,
      style: `normal`
    });
  });

  it(`reads an oblique font as the italic face, as browsers do`, () => {
    expect(readFontDescriptors(sfnt({ "OS/2": os2(400, 0x0200) })).style).toBe(
      `italic`
    );
  });

  it(`prefers a variable font's weight axis over its default weight class`, () => {
    expect(
      readFontDescriptors(sfnt({ "OS/2": os2(400, 0), fvar: fvar(300, 800) }))
        .weight
    ).toBe(`300 800`);
  });

  it(`reads WOFF, decompressing the tables it needs`, () => {
    expect(readFontDescriptors(woff({ "OS/2": os2(600, 0) }))).toStrictEqual({
      weight: `600`,
      style: `normal`
    });
  });

  it(`says why it cannot use a file that is not one font, to finish "could not read the font, because…"`, () => {
    expect(() =>
      readFontDescriptors(Buffer.from(`ttcf`.padEnd(16, `\0`), `latin1`))
    ).toThrow(/font collection/);
    expect(() =>
      readFontDescriptors(Buffer.from(`definitely not a font file`))
    ).toThrow(/does not start like a TrueType, OpenType, WOFF or WOFF2 font/);
    expect(() => readFontDescriptors(sfnt({ head: Buffer.alloc(54) }))).toThrow(
      /no OS\/2 table/
    );
  });
});
