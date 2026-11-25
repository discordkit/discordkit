import { decodePng, encodePng, type Bitmap } from "./png.js";

export interface DiffOptions {
  /**
   * How far apart two pixels' channels may be and still count as the same, from 0 to 255, compared after each colour is multiplied by its alpha (so two fully transparent pixels always match). Defaults to 0: this package draws the same scene to the same bytes, so between two of its renders any difference is a real change. Raise it (8 is a reasonable start) when one image comes from another tool that may round colours differently, such as a screenshot that went through a colour profile.
   */
  tolerance?: number;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiffResult {
  /** The same size, and no pixel differs by more than the tolerance. */
  identical: boolean;
  sameSize: boolean;
  a: { width: number; height: number };
  b: { width: number; height: number };
  /** Pixels that differ, counting every pixel that only one image has. */
  differentPixels: number;
  /** Pixels compared: the larger width times the larger height. */
  totalPixels: number;
  /** `differentPixels / totalPixels`, from 0 to 1. */
  ratio: number;
  /** The smallest rectangle holding every differing pixel, in pixels from the top left, or null when none differ. */
  box: Box | null;
  tolerance: number;
  /** A PNG the size of the larger image: the first image faded to light grey, with every differing pixel in solid red. */
  diff: Buffer;
}

export const defaultTolerance = 0;

/** A pixel's channels multiplied by its alpha, so colour under full transparency does not count. */
const premultiplied = (bitmap: Bitmap, x: number, y: number): number[] => {
  const offset = (y * bitmap.width + x) * 4;
  const alpha = bitmap.data[offset + 3];
  return [
    Math.round((bitmap.data[offset] * alpha) / 255),
    Math.round((bitmap.data[offset + 1] * alpha) / 255),
    Math.round((bitmap.data[offset + 2] * alpha) / 255),
    alpha
  ];
};

const inside = (bitmap: Bitmap, x: number, y: number): boolean =>
  x < bitmap.width && y < bitmap.height;

/**
 * Compares two PNGs pixel by pixel, aligned at their top-left corners, and draws where they differ. Takes any PNG, not only this package's renders: a screenshot of the Discord client taken by another tool compares the same way. Throws when either is not a PNG, with a message that says which.
 *
 * @example
 * const result = diffImages(await readFile(`before.png`), await readFile(`after.png`));
 * if (!result.identical) await writeFile(`diff.png`, result.diff);
 */
export const diffImages = (
  a: Buffer,
  b: Buffer,
  { tolerance = defaultTolerance }: DiffOptions = {}
): DiffResult => {
  if (!Number.isFinite(tolerance) || tolerance < 0 || tolerance > 255) {
    throw new RangeError(
      `@discordkit/preview cannot compare with a tolerance of ${String(tolerance)}. The tolerance is how far apart two pixels' colour channels may be and still match, on the 0 to 255 scale of an 8-bit channel. Give a number from 0 to 255, such as 8.`
    );
  }
  const decode = (file: Buffer, which: string): Bitmap => {
    try {
      return decodePng(file);
    } catch (error) {
      throw new Error(
        `@discordkit/preview could not read the ${which} image as a PNG, because ${error instanceof Error ? error.message : String(error)}. Both images must be PNG files. Check that the right file was given; an image in another format has to be converted to PNG first.`,
        { cause: error }
      );
    }
  };
  const first = decode(a, `first`);
  const second = decode(b, `second`);
  const width = Math.max(first.width, second.width);
  const height = Math.max(first.height, second.height);
  const out = new Uint8Array(width * height * 4);
  let differentPixels = 0;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inFirst = inside(first, x, y);
      const inSecond = inside(second, x, y);
      let differs = inFirst !== inSecond;
      if (inFirst && inSecond) {
        const p = premultiplied(first, x, y);
        const q = premultiplied(second, x, y);
        differs = p.some(
          (channel, index) => Math.abs(channel - q[index]) > tolerance
        );
      }
      const offset = (y * width + x) * 4;
      if (differs) {
        differentPixels++;
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
        out.set([255, 0, 0, 255], offset);
      } else {
        // The first image's luminance over white, faded towards white so red stands out on light and dark themes alike.
        const [r, g, b, alpha] = inFirst
          ? premultiplied(first, x, y)
          : [0, 0, 0, 0];
        const grey = 0.299 * r + 0.587 * g + 0.114 * b + (255 - alpha);
        const faded = Math.round(255 - (255 - grey) * 0.25);
        out.set([faded, faded, faded, 255], offset);
      }
    }
  }
  const sameSize =
    first.width === second.width && first.height === second.height;
  return {
    identical: sameSize && differentPixels === 0,
    sameSize,
    a: { width: first.width, height: first.height },
    b: { width: second.width, height: second.height },
    differentPixels,
    totalPixels: width * height,
    ratio: width * height === 0 ? 0 : differentPixels / (width * height),
    box:
      right < 0
        ? null
        : {
            x: left,
            y: top,
            width: right - left + 1,
            height: bottom - top + 1
          },
    tolerance,
    diff: encodePng({ width, height, data: out })
  };
};
