/**
 * Discord Social SDK docs fetcher.
 *
 * Saves two corpora into `social-sdk-docs/` (gitignored), so we don't have to
 * web-fetch them on every session while designing the native bridge package:
 *
 *   1. Narrative guides   — the Mintlify markdown render of every
 *      `/developers/discord-social-sdk/**` page (sitemap-discovered, `.md`).
 *   2. C++ API reference  — the Doxygen class pages under
 *      `/docs/social-sdk/classdiscordpp_1_1*.html`. These have NO `.md`
 *      variant, so we fetch the HTML and strip it down to readable text.
 *
 * Usage:
 *   node --experimental-strip-types scripts/docs/fetch-social-sdk.ts          # incremental
 *   node --experimental-strip-types scripts/docs/fetch-social-sdk.ts --force  # re-fetch all
 *   node --experimental-strip-types scripts/docs/fetch-social-sdk.ts --list   # list URLs only
 *
 * Output:
 *   social-sdk-docs/guides/<page-path>.md   — narrative guides
 *   social-sdk-docs/api/<ClassName>.md      — flattened Doxygen class reference
 *   social-sdk-docs/_manifest.json          — fetch bookkeeping
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), `../..`);
const CACHE_DIR = join(PROJECT_ROOT, `social-sdk-docs`);
const MANIFEST_PATH = join(CACHE_DIR, `_manifest.json`);
const SITEMAP_URL = `https://docs.discord.com/sitemap.xml`;
const DOCS_BASE = `https://docs.discord.com`;
const GUIDE_PREFIX = `/developers/discord-social-sdk`;

/** Doxygen API reference lives on the main site, not docs.discord.com. */
const API_BASE = `https://discord.com/developers/docs/social-sdk`;
const API_ANNOTATED = `${API_BASE}/annotated.html`;

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
  console.error(`fetch-social-sdk failed:`, err);
  process.exit(1);
}

async function main(): Promise<void> {
  const guides = await discoverGuides();
  const apiPages = await discoverApiPages();

  if (LIST_ONLY) {
    console.log(`# Narrative guides (${guides.length})`);
    for (const g of guides) console.log(`  ${g.lastmod} ${g.url}`);
    console.log(`\n# Doxygen API pages (${apiPages.length})`);
    for (const a of apiPages) console.log(`  ${a}`);
    return;
  }

  await mkdir(CACHE_DIR, { recursive: true });
  const existing = await loadManifest();
  const byUrl = new Map(existing.entries.map((e) => [e.url, e]));
  const next: ManifestEntry[] = [];
  const stats = { fetched: 0, skipped: 0, errored: 0 };

  // 1. Narrative guides (markdown render).
  for (const g of guides) {
    const path = join(
      `guides`,
      g.url.replace(`${DOCS_BASE}${GUIDE_PREFIX}/`, ``) + `.md`
    );
    await fetchInto({
      url: g.url,
      path,
      lastmod: g.lastmod,
      prior: byUrl.get(g.url),
      load: async () => fetchGuideMarkdown(g.url),
      next,
      stats
    });
  }

  // 2. Doxygen API reference (HTML → text).
  for (const url of apiPages) {
    const className =
      /classdiscordpp_1_1(\w+)\.html/.exec(url)?.[1] ?? `unknown`;
    const path = join(`api`, `${className}.md`);
    await fetchInto({
      url,
      path,
      lastmod: ``, // Doxygen pages carry no lastmod; --force to refresh.
      prior: byUrl.get(url),
      load: async () => doxygenToMarkdown(await fetchText(url), className),
      next,
      stats
    });
  }

  await writeManifest({
    generatedAt: new Date().toISOString(),
    entries: next.sort((a, b) => a.path.localeCompare(b.path))
  });

  console.log(
    `\ndone — ${stats.fetched} fetched, ${stats.skipped} unchanged, ${stats.errored} errored`
  );
}

interface FetchIntoArgs {
  url: string;
  path: string;
  lastmod: string;
  prior: ManifestEntry | undefined;
  load: () => Promise<string>;
  next: ManifestEntry[];
  stats: { fetched: number; skipped: number; errored: number };
}

async function fetchInto({
  url,
  path,
  lastmod,
  prior,
  load,
  next,
  stats
}: FetchIntoArgs): Promise<void> {
  // Skip only when we have a lastmod to trust AND the file is still present.
  if (
    !FORCE &&
    prior &&
    lastmod &&
    prior.lastmod === lastmod &&
    existsSync(join(CACHE_DIR, prior.path))
  ) {
    next.push(prior);
    stats.skipped++;
    return;
  }
  try {
    const body = await load();
    const filePath = join(CACHE_DIR, path);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, body, `utf8`);
    next.push({
      url,
      path,
      lastmod,
      fetchedAt: new Date().toISOString(),
      contentHash: hash(body)
    });
    stats.fetched++;
    console.log(`  fetched ${path}`);
  } catch (err) {
    stats.errored++;
    console.error(`  ✗ ${url}: ${(err as Error).message}`);
  }
}

async function discoverGuides(): Promise<
  Array<{ url: string; lastmod: string }>
> {
  const xml = await fetchText(SITEMAP_URL);
  const out: Array<{ url: string; lastmod: string }> = [];
  const re =
    /<url>\s*<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]+)<\/lastmod>\s*)?<\/url>/g;
  for (const m of xml.matchAll(re)) {
    if (m[1].includes(GUIDE_PREFIX))
      out.push({ url: m[1], lastmod: m[2] ?? `` });
  }
  return out.sort((a, b) => a.url.localeCompare(b.url));
}

async function discoverApiPages(): Promise<string[]> {
  const html = await fetchText(API_ANNOTATED);
  const pages = new Set<string>();
  for (const m of html.matchAll(/class(discordpp_1_1\w+)\.html/g)) {
    pages.add(`${API_BASE}/class${m[1]}.html`);
  }
  return [...pages].sort();
}

async function fetchGuideMarkdown(url: string): Promise<string> {
  const body = await fetchText(url.endsWith(`.md`) ? url : `${url}.md`, {
    Accept: `text/markdown,text/plain,*/*`
  });
  if (body.startsWith(`<!DOCTYPE html>`) || body.includes(`<html`)) {
    throw new Error(`got HTML instead of markdown`);
  }
  return body;
}

async function fetchText(
  url: string,
  headers?: Record<string, string>
): Promise<string> {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/**
 * Doxygen pages are dense HTML tables. We don't need pixel fidelity — we need
 * the class brief, the member function signatures, and their descriptions in a
 * grep-able form. This strips tags, decodes the common entities, and collapses
 * whitespace while preserving line structure around member rows.
 */
function doxygenToMarkdown(html: string, className: string): string {
  // Isolate the documentation body; Doxygen wraps it in <div class="contents">.
  const body =
    /<div class="contents">([\s\S]*?)<\/div>\s*<!-- contents -->/.exec(
      html
    )?.[1] ??
    /<div class="contents">([\s\S]*)/.exec(html)?.[1] ??
    html;

  const text = body
    .replace(/<\/(?:tr|div|p|h[1-6]|li|table)>/g, `\n`)
    .replace(/<h[1-6][^>]*>/g, `\n## `)
    .replace(/<td[^>]*>/g, ` | `)
    .replace(/<[^>]+>/g, ``)
    .replace(/&amp;/g, `&`)
    .replace(/&lt;/g, `<`)
    .replace(/&gt;/g, `>`)
    .replace(/&quot;/g, `"`)
    .replace(/&#39;/g, `'`)
    .replace(/&nbsp;|&#160;/g, ` `)
    .replace(/[ \t]+/g, ` `)
    .replace(/\n{3,}/g, `\n\n`)
    .split(`\n`)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join(`\n`);

  return `# discordpp::${className}\n\n> Source: ${API_BASE}/classdiscordpp_1_1${className}.html\n\n${text}\n`;
}

function hash(content: string): string {
  return createHash(`sha256`).update(content).digest(`hex`).slice(0, 16);
}

async function loadManifest(): Promise<Manifest> {
  if (!existsSync(MANIFEST_PATH))
    return { generatedAt: new Date().toISOString(), entries: [] };
  return JSON.parse(await readFile(MANIFEST_PATH, `utf8`)) as Manifest;
}

async function writeManifest(manifest: Manifest): Promise<void> {
  await writeFile(
    MANIFEST_PATH,
    `${JSON.stringify(manifest, null, 2)}\n`,
    `utf8`
  );
}
