import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vite-plus/test";
import { loadAssets, type LoadAssetsOptions } from "../assets.js";

/**
 * The loader is what keeps a render off the network at screenshot time and the same from run to run. These specs stub `fetch`, so they can count exactly when the network would have been used.
 */

const svg = async (): Promise<Response> =>
  Promise.resolve(
    new Response(`<svg xmlns="http://www.w3.org/2000/svg"/>`, {
      headers: { "content-type": `image/svg+xml; charset=utf-8` }
    })
  );

const avatar = `https://cdn.example/avatar.png`;
const emoji = `https://cdn.example/emoji.svg`;

let cacheDir: string;
let fetch: ReturnType<typeof vi.fn<typeof globalThis.fetch>>;

const options = (
  overrides: Partial<LoadAssetsOptions> = {}
): LoadAssetsOptions => ({
  cacheDir,
  offline: false,
  attachments: undefined,
  fetch,
  ...overrides
});

describe(`loadAssets`, () => {
  beforeEach(async () => {
    cacheDir = await mkdtemp(join(tmpdir(), `discordkit-preview-assets-`));
    fetch = vi.fn<typeof globalThis.fetch>(svg);
  });

  afterEach(async () => {
    await rm(cacheDir, { recursive: true, force: true });
  });

  it(`fetches an image once and serves it from the disk cache after, so a second render never touches the network`, async () => {
    const first = await loadAssets([emoji], options());
    const second = await loadAssets([emoji], options());
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(second.assets.get(emoji)).toStrictEqual(first.assets.get(emoji));
    // The parameter is dropped: the browser is told the bare type.
    expect(second.assets.get(emoji)?.contentType).toBe(`image/svg+xml`);
    expect(second.findings).toStrictEqual([]);
  });

  it(`fetches a reference the scene uses many times only once`, async () => {
    await loadAssets([emoji, avatar, emoji, emoji], options());
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it(`turns a cache miss into a finding instead of a fetch when offline`, async () => {
    const { assets, findings } = await loadAssets(
      [emoji],
      options({ offline: true })
    );
    expect(fetch).not.toHaveBeenCalled();
    expect(assets.size).toBe(0);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ code: `asset-offline`, asset: emoji });
    expect(findings[0]?.message).toMatch(/not in the asset cache/);
  });

  it(`still draws what is cached when offline`, async () => {
    await loadAssets([emoji], options());
    const offline = await loadAssets([emoji], options({ offline: true }));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(offline.assets.has(emoji)).toBe(true);
    expect(offline.findings).toStrictEqual([]);
  });

  it.each([
    [
      `the server refuses`,
      async (): Promise<Response> =>
        Promise.resolve(
          new Response(`gone`, { status: 404, statusText: `Not Found` })
        ),
      /answered 404 Not Found/
    ],
    [
      `the response is not an image`,
      async (): Promise<Response> =>
        Promise.resolve(
          new Response(`<html>`, { headers: { "content-type": `text/html` } })
        ),
      /was text\/html, not an image/
    ],
    [
      `the network fails`,
      async (): Promise<Response> =>
        Promise.reject(new TypeError(`fetch failed`)),
      /fetch failed/
    ]
  ])(
    `reports a finding and caches nothing when %s`,
    async (_, answer, reason) => {
      fetch.mockImplementation(answer);
      const { assets, findings } = await loadAssets([avatar], options());
      expect(assets.size).toBe(0);
      expect(findings[0]).toMatchObject({
        code: `asset-fetch-failed`,
        asset: avatar
      });
      expect(findings[0]?.message).toMatch(reason);
      // A failure is not cached, so the next render tries again rather than drawing a placeholder forever.
      fetch.mockImplementation(svg);
      expect((await loadAssets([avatar], options())).assets.has(avatar)).toBe(
        true
      );
    }
  );

  it(`does not treat a cache entry written for another URL as a hit`, async () => {
    await loadAssets([emoji], options());
    const other = `${emoji}?v=2`;
    await loadAssets([other], options());
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it(`leaves data: URLs alone, since the page can show them without loading anything`, async () => {
    const { assets, findings } = await loadAssets(
      [`data:image/gif;base64,R0lGODlhAQABAAAAACw=`],
      options()
    );
    expect(fetch).not.toHaveBeenCalled();
    expect(assets.size).toBe(0);
    expect(findings).toStrictEqual([]);
  });

  it(`reports a reference it has no way to load`, async () => {
    const { findings } = await loadAssets([`file:///etc/passwd`], options());
    expect(fetch).not.toHaveBeenCalled();
    expect(findings[0]?.code).toBe(`asset-unsupported`);
  });

  describe(`attachment:// references`, () => {
    it(`reads the file the scene's attachment entry names, without fetching or caching it`, async () => {
      const path = join(cacheDir, `card.png`);
      await writeFile(path, Buffer.from([0x89, 0x50, 0x4e, 0x47]));
      const { assets } = await loadAssets(
        [`attachment://card.png`],
        options({ attachments: { "card.png": { path } } })
      );
      expect(fetch).not.toHaveBeenCalled();
      expect(assets.get(`attachment://card.png`)).toStrictEqual({
        body: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
        contentType: `image/png`
      });
    });

    it(`reports an attachment the scene does not list, with the entry to add`, async () => {
      const { findings } = await loadAssets(
        [`attachment://card.png`],
        options()
      );
      expect(findings[0]?.code).toBe(`attachment-missing`);
      expect(findings[0]?.message).toMatch(/"card\.png": \{ path:/);
    });

    it(`reports an attachment whose file cannot be read`, async () => {
      const { findings } = await loadAssets(
        [`attachment://card.png`],
        options({
          attachments: { "card.png": { path: join(cacheDir, `missing.png`) } }
        })
      );
      expect(findings[0]?.code).toBe(`attachment-unreadable`);
    });

    it(`reports an attachment that is not an image file it can type`, async () => {
      const { findings } = await loadAssets(
        [`attachment://notes.txt`],
        options({
          attachments: { "notes.txt": { path: join(cacheDir, `notes.txt`) } }
        })
      );
      expect(findings[0]?.code).toBe(`attachment-unreadable`);
      expect(findings[0]?.message).toMatch(/image extension/);
    });
  });

  it(`lists findings in the order the scene uses the images, so a report is the same on every run`, async () => {
    const { findings } = await loadAssets(
      [`attachment://b.png`, `attachment://a.png`],
      options()
    );
    expect(findings.map(({ asset }) => asset)).toStrictEqual([
      `attachment://b.png`,
      `attachment://a.png`
    ]);
  });
});
