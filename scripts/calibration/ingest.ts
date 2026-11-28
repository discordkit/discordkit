/**
 * Files a folder of screenshots into the ignored reference folder, with an index of each file's size and pixel dimensions and empty places for what it shows. Matching a screenshot to its fixture is a judgment made by looking, so nothing here attempts it.
 */
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from "node:fs";
import { extname, join, parse, resolve } from "node:path";
import { requireIgnored } from "./local.ts";

export type ImageFormat = `png` | `jpeg` | `heic` | `webp`;

const formats: Record<string, ImageFormat> = {
  ".png": `png`,
  ".jpg": `jpeg`,
  ".jpeg": `jpeg`,
  ".heic": `heic`,
  ".webp": `webp`
};

export interface IndexEntry {
  /** The file's name in the destination. */
  file: string;
  /** Its name in the folder it came from, and that folder. */
  original: string;
  from: string;
  bytes: number;
  sha256: string;
  format: ImageFormat;
  /** Pixel size, read from the file's header; null where the kit cannot read it (HEIC, WebP). */
  width: number | null;
  height: number | null;
  ingestedAt: string;
  /** For whoever matches it: which platform, which fixture or step (`F07`, or the step's title), and image pixels per CSS pixel or point. */
  platform: `desktop` | `ios` | null;
  fixture: string | null;
  scale: number | null;
  notes: string;
}

export interface CaptureIndex {
  version: 1;
  /** How to fill in the empty fields. */
  about: string;
  entries: IndexEntry[];
}

const about = `Written by \`vp run calibration:ingest\`. Each entry's platform, fixture and scale are left empty for whoever matches the screenshot to its fixture by looking at it: the fixture's code (F07) is in the grey label line above it, or in the case number (M012) for a markdown case. Scale is image pixels per CSS pixel on desktop (a button is 32 tall) or per point on iPhone (3 on an iPhone 14 Pro screenshot at native size).`;

/** Pixel size from a PNG's header. */
const pngSize = (bytes: Buffer): { width: number; height: number } | null =>
  bytes.length >= 24 &&
  bytes.readUInt32BE(0) === 0x89_50_4e_47 &&
  bytes.toString(`latin1`, 12, 16) === `IHDR`
    ? { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
    : null;

/** Pixel size from a JPEG's first start-of-frame marker. */
const jpegSize = (bytes: Buffer): { width: number; height: number } | null => {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let at = 2;
  while (at + 9 < bytes.length) {
    if (bytes[at] !== 0xff) return null;
    const marker = bytes[at + 1];
    const length = bytes.readUInt16BE(at + 2);
    const isFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;
    if (isFrame) {
      return {
        height: bytes.readUInt16BE(at + 5),
        width: bytes.readUInt16BE(at + 7)
      };
    }
    at += 2 + length;
  }
  return null;
};

export const imageSize = (
  bytes: Buffer,
  format: ImageFormat
): { width: number; height: number } | null =>
  format === `png`
    ? pngSize(bytes)
    : format === `jpeg`
      ? jpegSize(bytes)
      : null;

export interface IngestOptions {
  /** The folder the screenshots are in. Only its own files are read, not its subfolders. */
  source: string;
  /** Where to file them. Must be ignored by git. */
  dest: string;
  now?: () => Date;
  log?: (line: string) => void;
}

export interface IngestResult {
  indexPath: string;
  added: IndexEntry[];
  /** Files that were already filed (same content), and files that are not images. */
  skipped: Array<{ file: string; reason: string }>;
}

const readIndex = (path: string): CaptureIndex => {
  if (!existsSync(path)) return { version: 1, about, entries: [] };
  const parsed = JSON.parse(
    readFileSync(path, `utf8`)
  ) as Partial<CaptureIndex>;
  if (parsed.version !== 1 || !Array.isArray(parsed.entries)) {
    throw new Error(
      `${path} exists but is not an index the calibration kit wrote, so the kit will not add to it. Move it aside, or choose another destination with --dest.`
    );
  }
  return { version: 1, about, entries: parsed.entries };
};

/** A name in `dest` that no other file has: the original, or the original with `-2`, `-3` and so on before its extension. */
const freeName = (dest: string, name: string): string => {
  const { name: stem, ext } = parse(name);
  let candidate = name;
  for (let count = 2; existsSync(join(dest, candidate)); count += 1) {
    candidate = `${stem}-${String(count)}${ext}`;
  }
  return candidate;
};

/**
 * Copies every image in `source` into `dest` and adds it to `dest/index.json`. Refuses, before touching anything, when git does not ignore `dest`. A file whose content is already in the index is not copied again, so running it twice on the same folder adds nothing. Never moves or changes the originals.
 */
export const ingestScreenshots = (options: IngestOptions): IngestResult => {
  const source = resolve(options.source);
  const dest = resolve(options.dest);
  const log = options.log ?? ((): void => undefined);
  const now = options.now ?? ((): Date => new Date());
  if (!existsSync(source) || !statSync(source).isDirectory()) {
    throw new Error(
      `${source} is not a folder, so there are no screenshots to file. Pass the folder you saved them to, such as \`vp run calibration:ingest "$HOME\\Pictures\\calibration-desktop"\`.`
    );
  }
  if (source === dest) {
    throw new Error(
      `The source and destination are the same folder (${dest}), so there is nothing to copy. Pass the folder the screenshots were saved to.`
    );
  }
  requireIgnored(join(dest, `index.json`), `screenshots`);
  mkdirSync(dest, { recursive: true });

  const indexPath = join(dest, `index.json`);
  const index = readIndex(indexPath);
  const known = new Set(index.entries.map((entry) => entry.sha256));
  const added: IndexEntry[] = [];
  const skipped: IngestResult[`skipped`] = [];

  const names = readdirSync(source, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
  for (const name of names) {
    const format = formats[extname(name).toLowerCase()] as
      | ImageFormat
      | undefined;
    if (!format) {
      skipped.push({
        file: name,
        reason: `not an image the kit files (PNG, JPEG, HEIC or WebP)`
      });
      continue;
    }
    const bytes = readFileSync(join(source, name));
    const sha256 = createHash(`sha256`).update(bytes).digest(`hex`);
    if (known.has(sha256)) {
      skipped.push({ file: name, reason: `already filed` });
      continue;
    }
    const file = freeName(dest, name);
    requireIgnored(join(dest, file), `screenshots`);
    copyFileSync(join(source, name), join(dest, file));
    const size = imageSize(bytes, format);
    const entry: IndexEntry = {
      file,
      original: name,
      from: source,
      bytes: bytes.length,
      sha256,
      format,
      width: size?.width ?? null,
      height: size?.height ?? null,
      ingestedAt: now().toISOString(),
      platform: null,
      fixture: null,
      scale: null,
      notes:
        format === `png`
          ? ``
          : `Not a PNG: ${format === `jpeg` ? `JPEG is lossy, so colours and edges may be off by a little` : `the kit cannot read its size; convert it to PNG`}.`
    };
    index.entries.push(entry);
    known.add(sha256);
    added.push(entry);
    log(
      `${name} → ${file} (${entry.width === null ? `size unknown` : `${String(entry.width)} × ${String(entry.height)}`})`
    );
  }
  writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
  return { indexPath, added, skipped };
};
