import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vite-plus/test";
import { diffImages } from "../diff.js";
import { decodePng, encodePng, type Bitmap } from "../png.js";

/**
 * `diff` is how an agent checks that a change to a message moved only what it meant to move. So it must count exactly the pixels that changed, say where they are, ignore what cannot be seen, and draw them where a reader will spot them.
 */

/** A solid image, optionally with some pixels set to other colours. */
const image = (
  width: number,
  height: number,
  fill: [number, number, number, number],
  changes: {
    x: number;
    y: number;
    rgba: [number, number, number, number];
  }[] = []
): Buffer => {
  const data = new Uint8Array(width * height * 4);
  for (let offset = 0; offset < data.length; offset += 4)
    data.set(fill, offset);
  for (const { x, y, rgba } of changes) data.set(rgba, (y * width + x) * 4);
  return encodePng({ width, height, data });
};

const pixel = (bitmap: Bitmap, x: number, y: number): number[] => [
  ...bitmap.data.subarray(
    (y * bitmap.width + x) * 4,
    (y * bitmap.width + x) * 4 + 4
  )
];

const dark: [number, number, number, number] = [17, 18, 20, 255];
const red = [255, 0, 0, 255];

describe(`diffImages`, () => {
  it(`calls two equal images identical, with nothing to point at`, () => {
    const result = diffImages(image(8, 6, dark), image(8, 6, dark));
    expect(result).toMatchObject({
      identical: true,
      sameSize: true,
      differentPixels: 0,
      totalPixels: 48,
      ratio: 0,
      box: null
    });
  });

  it(`counts each changed pixel, boxes them, and paints them red in the diff image`, () => {
    const result = diffImages(
      image(10, 10, dark),
      image(10, 10, dark, [
        { x: 2, y: 3, rgba: [200, 18, 20, 255] },
        { x: 6, y: 7, rgba: [17, 18, 90, 255] }
      ])
    );
    expect(result).toMatchObject({
      identical: false,
      differentPixels: 2,
      ratio: 0.02,
      box: { x: 2, y: 3, width: 5, height: 5 }
    });
    const drawn = decodePng(result.diff);
    expect(pixel(drawn, 2, 3)).toStrictEqual(red);
    expect(pixel(drawn, 6, 7)).toStrictEqual(red);
    // Unchanged pixels are the first image faded towards white, so red stands out on a dark theme.
    const [grey] = pixel(drawn, 0, 0);
    expect(pixel(drawn, 0, 0)).toStrictEqual([grey, grey, grey, 255]);
    expect(grey).toBeGreaterThan(150);
  });

  it(`defaults to no tolerance, since the renderer's own output is byte-identical for the same input`, () => {
    const result = diffImages(
      image(4, 4, dark),
      image(4, 4, dark, [{ x: 1, y: 1, rgba: [18, 18, 20, 255] }])
    );
    expect(result.tolerance).toBe(0);
    expect(result.differentPixels).toBe(1);
  });

  it(`ignores channel differences up to the tolerance, for images from tools that round colours differently`, () => {
    const a = image(4, 4, dark);
    const b = image(4, 4, dark, [{ x: 1, y: 1, rgba: [22, 18, 20, 255] }]);
    expect(diffImages(a, b, { tolerance: 5 }).identical).toBe(true);
    expect(diffImages(a, b, { tolerance: 4 }).differentPixels).toBe(1);
  });

  it(`treats differently coloured fully transparent pixels as the same, since neither can be seen`, () => {
    const result = diffImages(
      image(3, 3, [255, 0, 0, 0]),
      image(3, 3, [0, 0, 255, 0])
    );
    expect(result.identical).toBe(true);
  });

  it(`reports a size mismatch, and counts every pixel only one image has as different`, () => {
    const result = diffImages(image(4, 3, dark), image(4, 5, dark));
    expect(result).toMatchObject({
      identical: false,
      sameSize: false,
      a: { width: 4, height: 3 },
      b: { width: 4, height: 5 },
      differentPixels: 8,
      totalPixels: 20,
      box: { x: 0, y: 3, width: 4, height: 2 }
    });
    expect(decodePng(result.diff)).toMatchObject({ width: 4, height: 5 });
  });

  it(`compares a PNG another tool wrote with the same pixels written by this package as identical, whatever their encodings`, async () => {
    // The test pictures are 8-bit RGB with no alpha; the package writes 8-bit RGBA.
    const original = await readFile(
      new URL(`../../__tests__/assets/answer-card.png`, import.meta.url)
    );
    const reencoded = encodePng(decodePng(original));
    expect(Buffer.compare(original, reencoded)).not.toBe(0);
    expect(diffImages(original, reencoded).identical).toBe(true);
  });

  it(`says which image is not a PNG, so the caller knows which path to fix`, () => {
    expect(() =>
      diffImages(image(2, 2, dark), Buffer.from(`not an image`))
    ).toThrow(
      /could not read the second image as a PNG, because it does not start with the PNG signature/
    );
  });

  it(`refuses a tolerance outside the 0 to 255 channel range instead of silently matching everything`, () => {
    expect(() =>
      diffImages(image(2, 2, dark), image(2, 2, dark), { tolerance: 300 })
    ).toThrow(/from 0 to 255/);
  });
});
