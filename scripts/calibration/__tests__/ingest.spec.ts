import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import { drawPicture } from "../assets.ts";
import { imageSize, ingestScreenshots, type CaptureIndex } from "../ingest.ts";
import { isIgnored } from "../local.ts";

/**
 * Screenshots of the real client show the owner's servers, channels and names, so the one thing filing them must never do is put one where git would commit it. These specs run in a throwaway repository with its own ignore file.
 */

/** A minimal JPEG header: start of image, then a baseline start-of-frame giving 1179 × 2556. */
const jpegHeader = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08,
  0x09, 0xfc, 0x04, 0x9b, 0x03
]);

describe(`filing screenshots`, { timeout: 30_000 }, () => {
  let repo: string;
  let source: string;

  beforeEach(() => {
    repo = mkdtempSync(join(tmpdir(), `calibration-ingest-`));
    execFileSync(`git`, [`init`, `--quiet`], { cwd: repo });
    writeFileSync(join(repo, `.gitignore`), `.discord-reference/\n`);
    source = join(repo, `incoming`);
    mkdirSync(source);
    writeFileSync(
      join(source, `Screenshot 1.png`),
      drawPicture({ width: 1179, height: 40, fill: [10, 20, 30] })
    );
    writeFileSync(join(source, `IMG_0001.jpg`), jpegHeader);
    writeFileSync(join(source, `notes.txt`), `not a picture`);
  });

  afterEach(() => {
    rmSync(repo, { recursive: true, force: true });
  });

  it(`copies each picture into an ignored folder with an index of its size, leaving what it shows for a person to fill in`, () => {
    const dest = join(repo, `.discord-reference`, `captures`, `calibration`);
    const result = ingestScreenshots({
      source,
      dest,
      now: () => new Date(`2026-11-27T20:00:00.000Z`)
    });

    expect(readdirSync(dest).sort()).toEqual([
      `IMG_0001.jpg`,
      `Screenshot 1.png`,
      `index.json`
    ]);
    const index = JSON.parse(
      readFileSync(result.indexPath, `utf8`)
    ) as CaptureIndex;
    expect(
      index.entries.map(
        ({ file, format, width, height, platform, fixture, scale }) => ({
          file,
          format,
          width,
          height,
          platform,
          fixture,
          scale
        })
      )
    ).toEqual([
      {
        file: `IMG_0001.jpg`,
        format: `jpeg`,
        width: 1179,
        height: 2556,
        platform: null,
        fixture: null,
        scale: null
      },
      {
        file: `Screenshot 1.png`,
        format: `png`,
        width: 1179,
        height: 40,
        platform: null,
        fixture: null,
        scale: null
      }
    ]);
    expect(result.skipped).toEqual([
      {
        file: `notes.txt`,
        reason: `not an image the kit files (PNG, JPEG, HEIC or WebP)`
      }
    ]);
    // The originals stay where they were.
    expect(readdirSync(source).sort()).toEqual([
      `IMG_0001.jpg`,
      `Screenshot 1.png`,
      `notes.txt`
    ]);
  });

  it(`refuses a destination git does not ignore, before copying anything`, () => {
    const dest = join(repo, `screenshots`);
    expect(isIgnored(dest)).toBe(false);
    expect(() => ingestScreenshots({ source, dest })).toThrow(
      /git does not ignore that path/
    );
    expect(existsSync(dest)).toBe(false);
  });

  it(`refuses a destination outside any repository, since nothing vouches it is not committed`, () => {
    const outside = mkdtempSync(join(tmpdir(), `calibration-outside-`));
    try {
      expect(() =>
        ingestScreenshots({ source, dest: join(outside, `captures`) })
      ).toThrow(/git does not ignore/);
    } finally {
      rmSync(outside, { recursive: true, force: true });
    }
  });

  it(`adds nothing the second time it is run on the same folder, and keeps a different file with the same name`, () => {
    const dest = join(repo, `.discord-reference`, `captures`, `calibration`);
    ingestScreenshots({ source, dest });
    const again = ingestScreenshots({ source, dest });
    expect(again.added).toEqual([]);

    writeFileSync(
      join(source, `Screenshot 1.png`),
      drawPicture({ width: 8, height: 8, fill: [1, 2, 3] })
    );
    const third = ingestScreenshots({ source, dest });
    expect(third.added.map((entry) => entry.file)).toEqual([
      `Screenshot 1-2.png`
    ]);
    const index = JSON.parse(
      readFileSync(join(dest, `index.json`), `utf8`)
    ) as CaptureIndex;
    expect(index.entries).toHaveLength(3);
  });
});

describe(`reading a picture's size from its header`, () => {
  it(`reads a PNG's and a JPEG's, and says it cannot for a HEIC`, () => {
    expect(
      imageSize(drawPicture({ width: 3, height: 5, fill: [0, 0, 0] }), `png`)
    ).toEqual({ width: 3, height: 5 });
    expect(imageSize(jpegHeader, `jpeg`)).toEqual({
      width: 1179,
      height: 2556
    });
    expect(imageSize(Buffer.from(`ftypheic`), `heic`)).toBeNull();
  });
});
