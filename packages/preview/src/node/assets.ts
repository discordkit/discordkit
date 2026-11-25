import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import type { Finding, FindingCode, Path } from "../findings.js";
import type { SceneContext } from "../scene.js";

/**
 * Loads every image a scene needs before the browser sees the page, so the browser itself never touches the network and a render does not depend on what a server answers at screenshot time.
 *
 * `attachment://name` is read from the file the scene's `context.attachments` names. Anything else is fetched by URL through a disk cache keyed by the URL: once an image is cached, it is never fetched again, so the same scene renders the same pixels for as long as the cache lives. An image that cannot be had becomes a finding, and the page draws a placeholder in its place.
 */

/** A finding about one image, which always says which. */
export type AssetFinding = Finding & { asset: string };

/** An image drawn as a placeholder: a warning, since the message itself may be fine. The path is filled in by the renderer, which knows the scene. */
export const placeholderFinding = (
  code: FindingCode,
  asset: string,
  message: string
): AssetFinding => ({ code, severity: `warning`, path: [], message, asset });

/** The path of the first place `root` holds the string `value`, searching depth first in key order, or the empty path when it holds none (an emoji's image is named by text, not written in the scene). */
export const locate = (root: unknown, value: string): Path => {
  const search = (node: unknown, path: Path): Path | undefined => {
    if (node === value) return path;
    if (typeof node !== `object` || node === null) return undefined;
    for (const [key, child] of Object.entries(node)) {
      const found = search(child, [
        ...path,
        Array.isArray(node) ? Number(key) : key
      ]);
      if (found) return found;
    }
    return undefined;
  };
  return search(root, []) ?? [];
};

export interface LoadedAsset {
  body: Buffer;
  contentType: string;
}

export interface LoadAssetsOptions {
  /** Where fetched images are kept between renders. */
  cacheDir: string;
  /** Use only what is cached: a cache miss becomes a finding instead of a fetch. */
  offline: boolean;
  attachments: SceneContext[`attachments`];
  fetch: typeof globalThis.fetch;
}

export interface LoadedAssets {
  /** Every image that loaded, by its reference. `data:` references are left out: the page uses them as written. */
  assets: Map<string, LoadedAsset>;
  /** One per image that did not load, in the order the references were given. */
  findings: AssetFinding[];
}

/** Where the cache lives unless a render names another: beside the project's other tool caches. */
export const defaultCacheDir = (): string =>
  resolve(`node_modules`, `.cache`, `@discordkit`, `preview`, `assets`);

const fetchTimeout = 15_000;

/** The image types an attachment can be, by file extension. Studio's file bridge serves attachments by the same list. */
export const imageTypes: Partial<Record<string, string>> = {
  ".avif": `image/avif`,
  ".gif": `image/gif`,
  ".jpeg": `image/jpeg`,
  ".jpg": `image/jpeg`,
  ".png": `image/png`,
  ".svg": `image/svg+xml`,
  ".webp": `image/webp`
};

const attachmentPrefix = `attachment://`;

const reasonOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const loadAttachment = async (
  reference: string,
  attachments: SceneContext[`attachments`]
): Promise<LoadedAsset | AssetFinding> => {
  const name = reference.slice(attachmentPrefix.length);
  const entry = attachments?.[name];
  if (!entry) {
    return placeholderFinding(
      `attachment-missing`,
      reference,
      `@discordkit/preview drew a placeholder for ${reference}, because the scene's \`context.attachments\` has no entry named ${JSON.stringify(name)}. An attachment reference is drawn from the file that entry points to. Add \`${JSON.stringify(name)}: { path: "<file on disk>" }\` to \`context.attachments\`.`
    );
  }
  const path = resolve(entry.path);
  const contentType = imageTypes[extname(path).toLowerCase()];
  if (contentType === undefined) {
    return placeholderFinding(
      `attachment-unreadable`,
      reference,
      `@discordkit/preview drew a placeholder for ${reference}, because its file ${path} does not have an image extension the renderer knows (${Object.keys(imageTypes).join(`, `)}). The extension sets the type the browser decodes it as. Point the attachment at an image file with one of those extensions.`
    );
  }
  try {
    return { body: await readFile(path), contentType };
  } catch (error) {
    return placeholderFinding(
      `attachment-unreadable`,
      reference,
      `@discordkit/preview drew a placeholder for ${reference}, because it could not read the file ${path}: ${reasonOf(error)}. Attachment paths are resolved against the working directory (${process.cwd()}). Check that the file exists there, or give an absolute path.`
    );
  }
};

interface CacheEntry {
  url: string;
  contentType: string;
}

const isCacheEntry = (value: unknown): value is CacheEntry =>
  typeof value === `object` &&
  value !== null &&
  `url` in value &&
  typeof value.url === `string` &&
  `contentType` in value &&
  typeof value.contentType === `string`;

const cacheKey = (url: string): string =>
  createHash(`sha256`).update(url).digest(`hex`);

const readCache = async (
  cacheDir: string,
  url: string
): Promise<LoadedAsset | undefined> => {
  const key = cacheKey(url);
  try {
    const entry: unknown = JSON.parse(
      await readFile(join(cacheDir, `${key}.json`), `utf8`)
    );
    // An entry for a different URL (a hash collision) or one this code did not write is a miss, not an image.
    if (!isCacheEntry(entry) || entry.url !== url) return undefined;
    return {
      body: await readFile(join(cacheDir, key)),
      contentType: entry.contentType
    };
  } catch {
    return undefined;
  }
};

/** Writes the image before its entry, each through a temporary file, so a crashed or concurrent render never leaves an entry pointing at half an image. */
const writeCache = async (
  cacheDir: string,
  url: string,
  asset: LoadedAsset
): Promise<void> => {
  const key = cacheKey(url);
  await mkdir(cacheDir, { recursive: true });
  const write = async (file: string, data: Buffer | string): Promise<void> => {
    const temporary = join(cacheDir, `${file}.${randomUUID()}.tmp`);
    await writeFile(temporary, data);
    await rename(temporary, join(cacheDir, file));
  };
  await write(key, asset.body);
  const entry: CacheEntry = { url, contentType: asset.contentType };
  await write(`${key}.json`, JSON.stringify(entry));
};

const fetchFailed = (url: string, reason: string): AssetFinding =>
  placeholderFinding(
    `asset-fetch-failed`,
    url,
    `@discordkit/preview drew a placeholder for ${url}, because fetching it failed: ${reason}. An image is drawn only once it has been fetched or is in the asset cache. Check that the URL is right and reachable from this machine; once one render fetches it, later renders use the cached copy.`
  );

const loadUrl = async (
  url: string,
  { cacheDir, offline, fetch }: LoadAssetsOptions
): Promise<LoadedAsset | AssetFinding> => {
  const cached = await readCache(cacheDir, url);
  if (cached) return cached;
  if (offline) {
    return placeholderFinding(
      `asset-offline`,
      url,
      `@discordkit/preview drew a placeholder for ${url}, because the render is offline and that image is not in the asset cache at ${cacheDir}. Offline renders draw only what an earlier render cached. Render once with network access (without \`offline\`) to cache it, or point \`cacheDir\` at a cache that has it.`
    );
  }
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(fetchTimeout) });
  } catch (error) {
    return fetchFailed(url, reasonOf(error));
  }
  if (!response.ok) {
    return fetchFailed(
      url,
      `the server answered ${String(response.status)} ${response.statusText}`.trim()
    );
  }
  const contentType = (response.headers.get(`content-type`) ?? ``)
    .split(`;`)[0]
    .trim()
    .toLowerCase();
  if (!contentType.startsWith(`image/`)) {
    return fetchFailed(
      url,
      `the response was ${contentType === `` ? `untyped` : contentType}, not an image`
    );
  }
  let asset: LoadedAsset;
  try {
    asset = { body: Buffer.from(await response.arrayBuffer()), contentType };
  } catch (error) {
    return fetchFailed(url, `the download broke off: ${reasonOf(error)}`);
  }
  try {
    await writeCache(cacheDir, url, asset);
  } catch (error) {
    throw new Error(
      `@discordkit/preview fetched ${url} but could not save it to the asset cache at ${cacheDir}: ${reasonOf(error)}. Without the cache, the next render would fetch the image again and could draw something different. Make that directory writable, or pass a writable \`cacheDir\` to renderScene.`,
      { cause: error }
    );
  }
  return asset;
};

const load = async (
  reference: string,
  options: LoadAssetsOptions
): Promise<LoadedAsset | AssetFinding> => {
  if (reference.startsWith(attachmentPrefix)) {
    return loadAttachment(reference, options.attachments);
  }
  if (/^https?:\/\//i.test(reference)) return loadUrl(reference, options);
  return placeholderFinding(
    `asset-unsupported`,
    reference,
    `@discordkit/preview drew a placeholder for ${JSON.stringify(reference)}, because it is neither an http(s) URL, a data: URL nor an attachment:// reference, and those are the only images a render can load. Give the image as one of those.`
  );
};

const isFinding = (
  result: LoadedAsset | AssetFinding
): result is AssetFinding => `code` in result;

/** Loads each distinct reference once, all at the same time. */
export const loadAssets = async (
  references: readonly string[],
  options: LoadAssetsOptions
): Promise<LoadedAssets> => {
  const distinct = [...new Set(references)].filter(
    (reference) => !reference.startsWith(`data:`)
  );
  const results = await Promise.all(
    distinct.map(async (reference) => load(reference, options))
  );
  const assets = new Map<string, LoadedAsset>();
  const findings: AssetFinding[] = [];
  results.forEach((result, index) => {
    if (isFinding(result)) findings.push(result);
    else assets.set(distinct[index], result);
  });
  return { assets, findings };
};
