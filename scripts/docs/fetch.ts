/**
 * T1: Discord docs fetcher.
 *
 * Pulls the Mintlify markdown render of every relevant Discord docs page
 * into `.discord-docs/` (gitignored). Uses sitemap.xml for URL discovery
 * and lastmod tracking for incremental re-fetches.
 *
 * Usage:
 *   node --experimental-strip-types scripts/docs/fetch.ts          # incremental
 *   node --experimental-strip-types scripts/docs/fetch.ts --force  # re-fetch all
 *   node --experimental-strip-types scripts/docs/fetch.ts --list   # list URLs without fetching
 *
 * Output:
 *   .discord-docs/<page-path>.md   — raw markdown
 *   .discord-docs/_manifest.json   — { url, path, lastmod, fetchedAt, contentHash }[]
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), `../..`);
const CACHE_DIR = join(PROJECT_ROOT, `.discord-docs`);
const MANIFEST_PATH = join(CACHE_DIR, `_manifest.json`);
const SITEMAP_URL = `https://docs.discord.com/sitemap.xml`;
const BASE_URL = `https://docs.discord.com`;

/**
 * URL path patterns we care about for the audit.
 * Anything under these prefixes gets cached; everything else is skipped.
 */
const INCLUDE_PREFIXES = [
  `/developers/reference`,
  `/developers/change-log`,
  `/developers/resources/`,
  `/developers/interactions/`,
  `/developers/components/`,
  `/developers/events/`,
  `/developers/topics/`
];

/**
 * URL paths to exclude even if they match a prefix above.
 * Tutorials/guides aren't useful for schema/endpoint extraction.
 */
const EXCLUDE_EXACT = new Set<string>([
  `/developers/interactions/overview`,
  `/developers/components/overview`,
  `/developers/components/using-message-components`,
  `/developers/components/using-modal-components`,
  `/developers/events/overview`
]);

interface SitemapEntry {
  url: string;
  lastmod: string;
}

interface ManifestEntry {
  url: string;
  path: string;
  lastmod: string;
  fetchedAt: string;
  contentHash: string;
}

interface Manifest {
  generatedAt: string;
  entries: ManifestEntry[];
}

const args = new Set(process.argv.slice(2));
const FORCE = args.has(`--force`);
const LIST_ONLY = args.has(`--list`);

try {
  await main();
} catch (err: unknown) {
  console.error(`fetch failed:`, err);
  process.exit(1);
}

async function main(): Promise<void> {
  const sitemap = await fetchSitemap();
  const relevant = sitemap.filter((e) => isRelevant(e.url));

  if (LIST_ONLY) {
    for (const e of relevant) console.log(`${e.lastmod} ${e.url}`);
    console.log(`\n${relevant.length} relevant pages`);
    return;
  }

  await mkdir(CACHE_DIR, { recursive: true });
  const existing = await loadManifest();
  const byUrl = new Map(existing.entries.map((e) => [e.url, e]));

  const newEntries: ManifestEntry[] = [];
  let fetched = 0;
  let skipped = 0;
  let errored = 0;

  for (const entry of relevant) {
    const prior = byUrl.get(entry.url);
    if (!FORCE && prior && prior.lastmod === entry.lastmod) {
      // Confirm file still exists, then keep prior manifest entry.
      const filePath = join(CACHE_DIR, prior.path);
      if (existsSync(filePath)) {
        newEntries.push(prior);
        skipped++;
        continue;
      }
    }

    try {
      const markdown = await fetchMarkdown(entry.url);
      const path = urlToCachePath(entry.url);
      const filePath = join(CACHE_DIR, path);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, markdown, `utf8`);
      newEntries.push({
        url: entry.url,
        path,
        lastmod: entry.lastmod,
        fetchedAt: new Date().toISOString(),
        contentHash: hashContent(markdown)
      });
      fetched++;
      console.log(`  fetched ${path}`);
    } catch (err) {
      errored++;
      console.error(`  ✗ ${entry.url}: ${(err as Error).message}`);
    }
  }

  await writeManifest({
    generatedAt: new Date().toISOString(),
    entries: newEntries.sort((a, b) => a.path.localeCompare(b.path))
  });

  console.log(
    `\ndone — ${fetched} fetched, ${skipped} unchanged, ${errored} errored (of ${relevant.length} total)`
  );
}

function isRelevant(url: string): boolean {
  const path = url.replace(BASE_URL, ``);
  if (EXCLUDE_EXACT.has(path)) return false;
  return INCLUDE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

async function fetchSitemap(): Promise<SitemapEntry[]> {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  const entries: SitemapEntry[] = [];
  const urlRegex =
    /<url>\s*<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]+)<\/lastmod>\s*)?<\/url>/g;
  for (const match of xml.matchAll(urlRegex)) {
    entries.push({ url: match[1], lastmod: match[2] ?? `` });
  }
  return entries;
}

async function fetchMarkdown(url: string): Promise<string> {
  const mdUrl = url.endsWith(`.md`) ? url : `${url}.md`;
  const res = await fetch(mdUrl, {
    headers: { Accept: `text/markdown,text/plain,*/*` }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.text();
  if (body.startsWith(`<!DOCTYPE html>`) || body.includes(`<html`)) {
    throw new Error(`got HTML instead of markdown (page may not exist as .md)`);
  }
  return body;
}

function urlToCachePath(url: string): string {
  const path = url.replace(BASE_URL, ``).replace(/^\/developers\//, ``);
  return `${path}.md`;
}

function hashContent(content: string): string {
  return createHash(`sha256`).update(content).digest(`hex`).slice(0, 16);
}

async function loadManifest(): Promise<Manifest> {
  if (!existsSync(MANIFEST_PATH)) {
    return { generatedAt: new Date().toISOString(), entries: [] };
  }
  const raw = await readFile(MANIFEST_PATH, `utf8`);
  return JSON.parse(raw) as Manifest;
}

async function writeManifest(manifest: Manifest): Promise<void> {
  await writeFile(
    MANIFEST_PATH,
    `${JSON.stringify(manifest, null, 2)}\n`,
    `utf8`
  );
}
