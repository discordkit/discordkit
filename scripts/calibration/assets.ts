/**
 * The files the capture set attaches: the preview package's own test pictures and files, which its scenes name by path, and pictures drawn here at sizes those do not have (large squares, a run of distinct small wide pictures, large wide and tall pictures).
 *
 * Drawn pictures are made in memory rather than committed: each is a flat colour inside a lighter border one thirty-second of its width, so a screenshot shows whether Discord cropped it (the border missing on a side), and each picture in a set has its own hue, so the order of tiles in a gallery can be read. The same bytes are uploaded when posting and written beside a scene file when rendering, so both sides draw the same picture.
 */
import { readFileSync } from "node:fs";
import { crc32, deflateSync } from "node:zlib";
import type { Scene } from "../../packages/preview/src/scene.ts";

/** A picture this module draws, by its pixel size and colour. */
export interface DrawnPicture {
  width: number;
  height: number;
  /** The fill, as `[red, green, blue]`. */
  fill: readonly [number, number, number];
}

/** A file a capture fixture attaches, wherever it comes from. */
export interface AttachableFile {
  name: string;
  bytes: Buffer;
}

/** Ten hues, far enough apart to tell tiles apart at a glance. */
const hues: ReadonlyArray<readonly [number, number, number]> = [
  [0xc8, 0x49, 0x2b],
  [0x2f, 0x7d, 0xc1],
  [0x4a, 0x9b, 0x45],
  [0xb5, 0x8b, 0x1c],
  [0x8e, 0x4c, 0xb8],
  [0x1f, 0x9a, 0x9a],
  [0xc2, 0x3f, 0x7a],
  [0x6b, 0x6f, 0x1e],
  [0x3b, 0x4f, 0xa8],
  [0x9c, 0x5a, 0x33]
];

const ten = Array.from({ length: 10 }, (_, index) => index);

/** Every picture this module draws, by file name. */
export const drawnPictures: Readonly<Record<string, DrawnPicture>> = {
  ...Object.fromEntries(
    ten.map((index) => [
      `large-square-${String(index + 1)}.png`,
      { width: 1024, height: 1024, fill: hues[index] }
    ])
  ),
  ...Object.fromEntries(
    ten.map((index) => [
      `small-wide-${String(index + 1)}.png`,
      { width: 256, height: 144, fill: hues[index] }
    ])
  ),
  "large-wide.png": { width: 1600, height: 900, fill: hues[0] },
  "large-3x2.png": { width: 1500, height: 1000, fill: hues[6] },
  "large-tall.png": { width: 900, height: 1600, fill: hues[1] },
  "large-panorama.png": { width: 2100, height: 900, fill: hues[2] },
  "small-tall.png": { width: 144, height: 256, fill: hues[3] },
  "small-square.png": { width: 128, height: 128, fill: hues[4] },
  "tiny-square.png": { width: 32, height: 32, fill: hues[5] }
};

const pngSignature = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
]);

const chunk = (type: string, data: Buffer): Buffer => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, `latin1`), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};

/** Draws a picture as an 8-bit RGB PNG: its fill, inside a border halfway to white. */
export const drawPicture = ({ width, height, fill }: DrawnPicture): Buffer => {
  const border = Math.max(1, Math.round(width / 32));
  const edge = fill.map((channel) => Math.round(channel + (255 - channel) / 2));
  const rowBytes = 1 + width * 3;
  const raw = Buffer.alloc(rowBytes * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * rowBytes;
    // Each row starts with its filter type: 0, none.
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const onEdge =
        x < border || y < border || x >= width - border || y >= height - border;
      const colour = onEdge ? edge : fill;
      const at = row + 1 + x * 3;
      raw[at] = colour[0];
      raw[at + 1] = colour[1];
      raw[at + 2] = colour[2];
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  // Bit depth 8, colour type 2 (RGB), then the only compression, filter and (no) interlace methods.
  header.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([
    pngSignature,
    chunk(`IHDR`, header),
    chunk(`IDAT`, deflateSync(raw, { level: 9 })),
    chunk(`IEND`, Buffer.alloc(0))
  ]);
};

const drawn = new Map<string, Buffer>();

/** A drawn picture's bytes, drawn once per run. */
export const drawnBytes = (name: string): Buffer | undefined => {
  const picture = drawnPictures[name] as DrawnPicture | undefined;
  if (!picture) return undefined;
  const cached = drawn.get(name);
  if (cached) return cached;
  const bytes = drawPicture(picture);
  drawn.set(name, bytes);
  return bytes;
};

/**
 * The file a fixture names with `attachment://name`: a picture drawn here, or the file the scene's `context.attachments` points at. Throws for a name that is neither, since posting it would fail at Discord with a less useful message.
 */
export const attachableFile = (name: string, scene: Scene): AttachableFile => {
  const bytes = drawnBytes(name);
  if (bytes) return { name, bytes };
  const attachment = scene.context?.attachments?.[name];
  if (attachment) return { name, bytes: readFileSync(attachment.path) };
  throw new Error(
    `A capture fixture names \`attachment://${name}\`, but the calibration kit has no such file: it is neither a picture scripts/calibration/assets.ts draws nor an entry in the fixture scene's \`context.attachments\`. Add the file to the scene's attachments, or correct the name in the fixture.`
  );
};
