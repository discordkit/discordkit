import { readdir, readFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import { chromium, type Browser } from "playwright";
import { decodePng, encodePng, type Bitmap } from "../png.js";

/**
 * `diff` has to read PNGs that other tools wrote, such as a screenshot of the Discord client, and those use every colour type, bit depth and interlacing PNG allows. So the decoder is checked against Chromium's own: every image here is decoded by both, and must come out the same.
 *
 * The images are built by a small encoder in this file that covers what the package's writer does not: palettes, transparency keys, sub-byte and 16-bit samples, all five scanline filters, and Adam7 interlacing.
 */

// Launching a browser is the slow part of this spec, and on a cold two-core CI runner it has taken longer than Vitest's default 10 second hook limit.
const launchTimeout = 60_000;

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

const chunk = (type: string, body: Buffer): Buffer => {
  const typed = Buffer.concat([Buffer.from(type, `latin1`), body]);
  let crc = 0xffffffff;
  for (const byte of typed) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  const out = Buffer.alloc(typed.length + 8);
  out.writeUInt32BE(body.length, 0);
  typed.copy(out, 4);
  out.writeUInt32BE((crc ^ 0xffffffff) >>> 0, typed.length + 4);
  return out;
};

interface Spec {
  width: number;
  height: number;
  colour: 0 | 2 | 3 | 4 | 6;
  depth: 1 | 2 | 4 | 8 | 16;
  interlace?: boolean;
  /** The stored samples of the pixel at x, y. */
  samples: (x: number, y: number) => number[];
  palette?: [number, number, number][];
  transparency?: Buffer;
}

const adam7 = [
  [0, 0, 8, 8],
  [4, 0, 8, 8],
  [0, 4, 4, 8],
  [2, 0, 4, 4],
  [0, 2, 2, 4],
  [1, 0, 2, 2],
  [0, 1, 1, 2]
] as const;

const paeth = (a: number, b: number, c: number): number => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

/** Writes `spec` as a PNG, cycling through all five filters line by line. */
const build = (spec: Spec): Buffer => {
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[spec.colour];
  const bits = channels * spec.depth;
  const step = Math.max(1, bits >> 3);
  const passes = spec.interlace ? adam7 : ([[0, 0, 1, 1]] as const);
  const lines: Buffer[] = [];
  let filter = 0;
  for (const [x0, y0, dx, dy] of passes) {
    const width = Math.ceil((spec.width - x0) / dx);
    const height = Math.ceil((spec.height - y0) / dy);
    if (width <= 0 || height <= 0) continue;
    const stride = Math.ceil((width * bits) / 8);
    let previous = Buffer.alloc(stride);
    for (let y = 0; y < height; y++) {
      const raw = Buffer.alloc(stride);
      let bit = 0;
      for (let x = 0; x < width; x++) {
        for (const sample of spec.samples(x0 + x * dx, y0 + y * dy)) {
          if (spec.depth === 16) raw.writeUInt16BE(sample, bit >> 3);
          else if (spec.depth === 8) raw[bit >> 3] = sample;
          else raw[bit >> 3] |= sample << (8 - spec.depth - (bit & 7));
          bit += spec.depth;
        }
      }
      const type = filter++ % 5;
      const line = Buffer.alloc(stride + 1);
      line[0] = type;
      for (let index = 0; index < stride; index++) {
        const left = index >= step ? raw[index - step] : 0;
        const up = y > 0 ? previous[index] : 0;
        const upLeft = y > 0 && index >= step ? previous[index - step] : 0;
        const predicted = [
          0,
          left,
          up,
          (left + up) >> 1,
          paeth(left, up, upLeft)
        ][type];
        line[index + 1] = (raw[index] - predicted) & 0xff;
      }
      lines.push(line);
      previous = raw;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(spec.width, 0);
  header.writeUInt32BE(spec.height, 4);
  header[8] = spec.depth;
  header[9] = spec.colour;
  header[12] = spec.interlace ? 1 : 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk(`IHDR`, header),
    ...(spec.palette ? [chunk(`PLTE`, Buffer.from(spec.palette.flat()))] : []),
    ...(spec.transparency ? [chunk(`tRNS`, spec.transparency)] : []),
    chunk(`IDAT`, deflateSync(Buffer.concat(lines))),
    chunk(`IEND`, Buffer.alloc(0))
  ]);
};

/** A deterministic pattern of values below `limit`, so neighbouring pixels differ and every filter has work to do. */
const pattern = (
  x: number,
  y: number,
  channel: number,
  limit: number
): number => (x * 7 + y * 13 + channel * 29 + x * y) % limit;

const sixteen = (spec: Omit<Spec, `samples`>, channels: number): Spec => ({
  ...spec,
  samples: (x, y) =>
    Array.from({ length: channels }, (_, channel) =>
      spec.depth === 16
        ? pattern(x, y, channel, 256) * 257
        : pattern(x, y, channel, 2 ** spec.depth)
    )
});

const palette = Array.from(
  { length: 256 },
  (_, index): [number, number, number] => [
    index,
    255 - index,
    (index * 37) % 256
  ]
);

const cases: Record<string, Spec> = {
  "grey, 1 bit": sixteen({ width: 13, height: 5, colour: 0, depth: 1 }, 1),
  "grey, 2 bits": sixteen({ width: 13, height: 5, colour: 0, depth: 2 }, 1),
  "grey, 4 bits": sixteen({ width: 13, height: 5, colour: 0, depth: 4 }, 1),
  "grey, 8 bits": sixteen({ width: 13, height: 5, colour: 0, depth: 8 }, 1),
  "grey, 16 bits": sixteen({ width: 13, height: 5, colour: 0, depth: 16 }, 1),
  "grey with a transparent value": {
    ...sixteen({ width: 9, height: 4, colour: 0, depth: 8 }, 1),
    transparency: Buffer.from([0, 7])
  },
  "RGB, 8 bits": sixteen({ width: 11, height: 7, colour: 2, depth: 8 }, 3),
  "RGB, 16 bits": sixteen({ width: 11, height: 7, colour: 2, depth: 16 }, 3),
  "RGB, 16 bits, with low bytes that need rounding": {
    width: 11,
    height: 7,
    colour: 2,
    depth: 16,
    samples: (x, y) =>
      [0, 1, 2].map(
        (channel) => (pattern(x, y, channel, 256) * 251 + x * 97) % 65536
      )
  },
  "RGB with a transparent colour": {
    ...sixteen({ width: 11, height: 7, colour: 2, depth: 8 }, 3),
    transparency: Buffer.from([0, 0, 0, 29, 0, 58])
  },
  "palette, 1 bit": {
    ...sixteen({ width: 13, height: 5, colour: 3, depth: 1 }, 1),
    palette: palette.slice(0, 2)
  },
  "palette, 4 bits, with transparent entries": {
    ...sixteen({ width: 13, height: 5, colour: 3, depth: 4 }, 1),
    palette: palette.slice(0, 16),
    transparency: Buffer.from([0, 255, 255, 0])
  },
  "palette, 8 bits": {
    ...sixteen({ width: 13, height: 5, colour: 3, depth: 8 }, 1),
    palette
  },
  "grey and alpha, 8 bits": {
    width: 9,
    height: 4,
    colour: 4,
    depth: 8,
    samples: (x, y) => [pattern(x, y, 0, 256), (x + y) % 2 === 0 ? 255 : 0]
  },
  "RGBA, 8 bits": {
    width: 9,
    height: 4,
    colour: 6,
    depth: 8,
    samples: (x, y) => [
      pattern(x, y, 0, 256),
      pattern(x, y, 1, 256),
      pattern(x, y, 2, 256),
      (x + y) % 3 === 0 ? 0 : 255
    ]
  },
  "RGBA, 16 bits": {
    width: 9,
    height: 4,
    colour: 6,
    depth: 16,
    samples: (x, y) => [
      pattern(x, y, 0, 256) * 257,
      pattern(x, y, 1, 256) * 257,
      pattern(x, y, 2, 256) * 257,
      65535
    ]
  },
  "RGBA, interlaced": {
    ...sixteen({ width: 13, height: 11, colour: 6, depth: 8 }, 4),
    samples: (x, y) => [
      pattern(x, y, 0, 256),
      pattern(x, y, 1, 256),
      pattern(x, y, 2, 256),
      255
    ],
    interlace: true
  },
  "palette, 2 bits, interlaced": {
    ...sixteen({ width: 13, height: 11, colour: 3, depth: 2 }, 1),
    palette: palette.slice(0, 4),
    interlace: true
  },
  "grey, 1 bit, interlaced, smaller than some passes": {
    ...sixteen({ width: 3, height: 2, colour: 0, depth: 1 }, 1),
    interlace: true
  }
};

describe(`decodePng`, () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch(
      process.env.CI ? { channel: `chrome` } : {}
    );
  }, launchTimeout);

  afterAll(async () => {
    await browser.close();
  });

  /** The image as Chromium decodes it, with no colour conversion and no premultiplying. */
  const chromiumDecode = async (png: Buffer): Promise<Bitmap> => {
    const page = await browser.newPage();
    try {
      const { width, height, data } = await page.evaluate(async (base64) => {
        const bytes = Uint8Array.from(atob(base64), (char) =>
          char.charCodeAt(0)
        );
        const bitmap = await createImageBitmap(
          new Blob([bytes], { type: `image/png` }),
          {
            premultiplyAlpha: `none`,
            colorSpaceConversion: `none`
          }
        );
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const context = canvas.getContext(`2d`);
        if (!context) throw new Error(`no 2d context`);
        context.drawImage(bitmap, 0, 0);
        // Back as base64: a large picture as a JSON array of numbers takes seconds to cross over.
        const pixelBytes = context.getImageData(
          0,
          0,
          bitmap.width,
          bitmap.height
        ).data;
        let binary = ``;
        for (let offset = 0; offset < pixelBytes.length; offset += 0x8000) {
          binary += String.fromCharCode(
            ...pixelBytes.subarray(offset, offset + 0x8000)
          );
        }
        return {
          width: bitmap.width,
          height: bitmap.height,
          data: btoa(binary)
        };
      }, png.toString(`base64`));
      return {
        width,
        height,
        data: Uint8Array.from(Buffer.from(data, `base64`))
      };
    } finally {
      await page.close();
    }
  };

  /** The pixels with colour cleared under full transparency, where a canvas keeps none, so two decodes compare byte for byte. */
  const pixels = ({ data }: Bitmap): Buffer => {
    const out = Buffer.from(data);
    for (let offset = 0; offset < out.length; offset += 4) {
      if (out[offset + 3] === 0) out.fill(0, offset, offset + 3);
    }
    return out;
  };

  it.each(Object.entries(cases))(
    `reads %s the way Chromium does`,
    async (_, spec) => {
      const png = build(spec);
      const ours = decodePng(png);
      const theirs = await chromiumDecode(png);
      expect({ width: ours.width, height: ours.height }).toStrictEqual({
        width: spec.width,
        height: spec.height
      });
      expect(pixels(ours)).toStrictEqual(pixels(theirs));
    }
  );

  it(`reads the test pictures, which were written by another tool, the way Chromium does`, async () => {
    const directory = new URL(`../../__tests__/assets/`, import.meta.url);
    const files = (await readdir(directory)).filter((file) =>
      file.endsWith(`.png`)
    );
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const png = await readFile(new URL(file, directory));
      const same = pixels(decodePng(png)).equals(
        pixels(await chromiumDecode(png))
      );
      expect({ file, same }).toStrictEqual({ file, same: true });
    }
  });

  it(`reads a screenshot Chromium itself wrote`, async () => {
    const page = await browser.newPage({ viewport: { width: 40, height: 30 } });
    try {
      await page.setContent(
        `<body style="margin:0;background:linear-gradient(90deg,#5865f2,#d22d39)">Aa</body>`
      );
      const png = await page.screenshot();
      expect(
        pixels(decodePng(png)).equals(pixels(await chromiumDecode(png)))
      ).toBe(true);
    } finally {
      await page.close();
    }
  });

  it(`explains why a file is not a PNG it can read, so the caller knows which file to fix`, () => {
    expect(() => decodePng(Buffer.from(`GIF89a`))).toThrow(
      /does not start with the PNG signature/
    );
    const truncated = build(cases[`RGB, 8 bits`]).subarray(0, 40);
    expect(() => decodePng(truncated)).toThrow(/no image data|IHDR/);
  });
});

describe(`encodePng`, () => {
  it(`writes pixels that read back unchanged, transparency included, so a diff image shows exactly what was compared`, () => {
    const data = Uint8Array.from(
      { length: 5 * 3 * 4 },
      (_, index) => (index * 53) % 256
    );
    const png = encodePng({ width: 5, height: 3, data });
    expect(decodePng(png)).toStrictEqual({ width: 5, height: 3, data });
  });

  it(`writes the same bytes for the same pixels, so diff images are reproducible`, () => {
    const data = Uint8Array.from({ length: 4 * 4 * 4 }, (_, index) => index);
    expect(encodePng({ width: 4, height: 4, data })).toStrictEqual(
      encodePng({ width: 4, height: 4, data })
    );
  });
});
