/**
 * Discord Social SDK docs fetcher.
 *
 * Saves two corpora into `social-sdk-docs/` (gitignored), so we don't have to
 * web-fetch them on every session while designing the native bridge package:
 *
 *   1. Narrative guides   — the Mintlify markdown render of every
 *      `/developers/discord-social-sdk/**` page (sitemap-discovered, `.md`).
 *   2. C++ API reference  — the Doxygen class pages under
 *      `/docs/social-sdk/classdiscordpp_1_1*.html`, plus the `discordpp`
 *      namespace page (free functions + enums + typedefs). These have NO `.md`
 *      variant, so we fetch the HTML and parse it into STRUCTURED markdown:
 *      one section per Doxygen group, each member with its reconstructed
 *      signature, faithful prose (sub-headings/lists/code/links/@deprecated),
 *      enum value tables, and a source backlink — so it can be pasted into
 *      JSDoc and surfaced in consumers' IDEs. Discord's Doxygen is prose-only
 *      (no `@param`/`@return` types), so each member is AUGMENTED with the exact
 *      C ABI signature parsed from the local SDK header (`cdiscord.h`) — typed
 *      params + return. Output is versioned (api/<sdkVersion>/) so SDK versions
 *      can coexist for audit diffing; the version is also in each file's
 *      frontmatter. The SDK is found via DISCORD_SDK_PATH or vendor/.
 *
 * Usage (run via `vp run scrape:sdk-docs`, or directly):
 *   node --experimental-strip-types scripts/docs/fetch-social-sdk.ts          # incremental
 *   node --experimental-strip-types scripts/docs/fetch-social-sdk.ts --force  # re-fetch all
 *   node --experimental-strip-types scripts/docs/fetch-social-sdk.ts --list   # list URLs only
 *
 * Output:
 *   social-sdk-docs/guides/<page-path>.md          — narrative guides
 *   social-sdk-docs/api/<version>/<ClassName>.md   — structured + C-ABI-augmented class reference
 *   social-sdk-docs/api/<version>/namespace.md     — free functions + enums + typedefs
 *   social-sdk-docs/_manifest.json                 — fetch bookkeeping
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Window } from "happy-dom";
import type { Element } from "happy-dom";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), `../..`);
const CACHE_DIR = join(PROJECT_ROOT, `social-sdk-docs`);
const MANIFEST_PATH = join(CACHE_DIR, `_manifest.json`);
const SITEMAP_URL = `https://docs.discord.com/sitemap.xml`;
const DOCS_BASE = `https://docs.discord.com`;
const GUIDE_PREFIX = `/developers/discord-social-sdk`;

/** Doxygen API reference lives on the main site, not docs.discord.com. */
const API_BASE = `https://discord.com/developers/docs/social-sdk`;
const API_ANNOTATED = `${API_BASE}/annotated.html`;

/** Local Social SDK install (BYO, gitignored). The version is the dir name. */
const VENDOR_DIR = join(PROJECT_ROOT, `vendor`, `discord-social-sdk`);

/** A C ABI function signature parsed from `cdiscord.h`. */
interface CSignature {
  name: string; // e.g. Discord_Activity_SetState
  returnType: string; // e.g. void, uint64_t, discordpp::UserHandle
  params: Array<{ type: string; name: string }>;
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

  // Augment the prose-only Doxygen docs with exact param/return types from the
  // local SDK header. The API output is versioned (api/<version>/) so multiple
  // SDK versions can coexist for audit diffing; the version is also stamped in
  // each file's frontmatter.
  const sdk = await findSdk();
  const cIndex = sdk
    ? await parseCHeader(sdk.header)
    : new Map<string, CSignature>();
  const version = sdk?.version ?? `unknown`;
  if (sdk) {
    console.log(
      `SDK ${version}: ${cIndex.size} C signatures from ${sdk.header}`
    );
  } else {
    console.warn(
      `no local SDK found (set DISCORD_SDK_PATH or populate vendor/); ` +
        `API docs will lack typed signatures.`
    );
  }

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

  // 2. Doxygen API reference (HTML → structured markdown). One file per class,
  //    plus the namespace page (free functions + enums + typedefs). Output is
  //    versioned: api/<version>/<name>.md.
  for (const url of apiPages) {
    const name = pageName(url);
    const path = join(`api`, version, `${name}.md`);
    await fetchInto({
      url,
      path,
      lastmod: ``, // Doxygen pages carry no lastmod; --force to refresh.
      prior: byUrl.get(url),
      load: async () =>
        doxygenToMarkdown(await fetchText(url), url, { cIndex, version }),
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
  // The namespace page holds the free functions, enums, and typedefs that don't
  // belong to any class — the enums especially matter (their int32 values are
  // what the FFI bindings encode).
  pages.add(`${API_BASE}/namespacediscordpp.html`);
  return [...pages].sort();
}

/** Output file stem for a Doxygen page URL (class name, or `namespace`). */
function pageName(url: string): string {
  if (url.includes(`namespacediscordpp`)) return `namespace`;
  return /classdiscordpp_1_1(\w+)\.html/.exec(url)?.[1] ?? `unknown`;
}

/**
 * Locate the installed SDK and its version. The Doxygen docs are prose-only (no `@param`/`@return` types); the C header `cdiscord.h` carries the exact signatures, so we parse it to augment the docs. Resolution: `DISCORD_SDK_PATH` (a root dir or the lib file's dir) if set, else the single `vendor/discord-social-sdk/<version>/` directory. Returns `undefined` if no install is found (the scrape still works, just without typed signatures).
 */
async function findSdk(): Promise<
  { version: string; header: string } | undefined
> {
  const candidates: string[] = [];
  const envPath = process.env.DISCORD_SDK_PATH;
  if (envPath) candidates.push(envPath);
  if (existsSync(VENDOR_DIR)) {
    const { readdir } = await import(`node:fs/promises`);
    for (const dir of await readdir(VENDOR_DIR))
      candidates.push(join(VENDOR_DIR, dir));
  }
  for (const base of candidates) {
    // base may be the version dir, the SDK root, or point near the lib file.
    for (const header of [
      join(base, `include`, `cdiscord.h`),
      join(base, `cdiscord.h`)
    ]) {
      if (existsSync(header)) {
        // Version = the path segment that looks like a semver-ish build id.
        const version =
          /discord-social-sdk[/\\]([^/\\]+)/.exec(header)?.[1] ??
          /(\d+\.\d+\.\d+)/.exec(header)?.[1] ??
          `unknown`;
        return { version, header };
      }
    }
  }
  return undefined;
}

/**
 * Parse `cdiscord.h` into a lookup of C ABI signatures keyed by function name. Declarations look like `<ret> DISCORD_API <Name>(<params>);` and may wrap across lines; params split on top-level commas.
 */
async function parseCHeader(
  headerPath: string
): Promise<Map<string, CSignature>> {
  const src = (await readFile(headerPath, `utf8`))
    .replace(/\/\*[\s\S]*?\*\//g, ``)
    .replace(/\/\/[^\n]*/g, ``);
  const index = new Map<string, CSignature>();
  const re =
    /([A-Za-z_][\w:<>,\s*]*?)\s+DISCORD_API\s+(Discord_\w+)\s*\(([\s\S]*?)\)\s*;/g;
  for (const m of src.matchAll(re)) {
    const returnType = m[1].replace(/\s+/g, ` `).trim();
    const name = m[2];
    const params = splitParams(m[3]).map(parseParam);
    index.set(name, { name, returnType, params });
  }
  return index;
}

/** Split a C parameter list on top-level commas (none nest in this header). */
function splitParams(raw: string): string[] {
  return raw
    .replace(/\s+/g, ` `)
    .split(`,`)
    .map((p) => p.trim())
    .filter((p) => p && p !== `void`);
}

/** Split a C parameter into its type and name (name = last identifier). */
function parseParam(param: string): { type: string; name: string } {
  const m = /^(.*?)([A-Za-z_]\w*)$/.exec(param.replace(/\*/g, `* `).trim());
  if (!m) return { type: param, name: `` };
  return { type: m[1].replace(/\s+/g, ` `).trim(), name: m[2] };
}

/**
 * The C name for a Doxygen C++ member: `<Class>::<Method>` → `Discord_<Class>_<Method>`. (The C `self` first-param is the C++ `this`.) Returns the candidate name to look up in the C-header index.
 */
function cNameFor(className: string, method: string): string {
  return `Discord_${className}_${method}`;
}

/**
 * Format a parsed C signature as a typed reference block — the param/return types the prose-only Doxygen docs omit. Renders the full C declaration plus a params list so it's both copy-pasteable and skimmable.
 */
function formatCSignature(sig: CSignature): string {
  const paramList = sig.params
    .map((p) => `${p.type} ${p.name}`.trim())
    .join(`, `);
  const decl = `${sig.returnType} ${sig.name}(${paramList});`;
  const lines = [`**C ABI:**`, ``, `\`\`\`c`, decl, `\`\`\``];
  if (sig.params.length) {
    lines.push(``, `**Parameters:**`, ``);
    for (const p of sig.params) lines.push(`- \`${p.name}\` — \`${p.type}\``);
  }
  lines.push(``, `**Returns:** \`${sig.returnType}\``);
  return lines.join(`\n`);
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
 * Convert a Doxygen page (a `discordpp` class, or the namespace page) into a structured, full-fidelity markdown reference: the page brief, then one section per Doxygen group ("Member Function Documentation", "Member Enumeration Documentation", …), each member rendered with its reconstructed signature, faithful prose (paragraphs, sub-headings, lists, code blocks, links, `@deprecated`), enumerator value tables, and a source backlink.
 *
 * Why a real DOM parse (happy-dom) and not a regex tag-strip: Discord's Doxygen config emits NO `@param`/`@return` tables — all the useful detail is rich prose inside `.memdoc` (sub-headings, `<ul>`, `<pre>` code). A naive tag-strip flattens that to meaningless line noise; we want it preserved so it can later be pasted into JSDoc and surfaced in consumers' IDEs.
 */
interface ApiContext {
  cIndex: Map<string, CSignature>;
  version: string;
}

function doxygenToMarkdown(html: string, url: string, ctx: ApiContext): string {
  const window = new Window({ url });
  window.document.body.innerHTML = html;
  const doc = window.document;

  const title =
    doc.querySelector(`.title`)?.textContent?.trim() ?? pageName(url);
  // The C++ class name for this page (used to map members to C ABI signatures).
  // The namespace page's free functions are keyed `Discord_<Method>` directly.
  const className = pageName(url) === `namespace` ? `` : pageName(url);
  // Prefer the prose description; fall through to the directory desc only when
  // the prose is EMPTY (not nullish) — so `||` is intentional here, not `??`.
  const brief =
    htmlToMarkdown(doc.querySelector(`.textblock`)) ||
    (doc.querySelector(`table.directory tr td.desc`)?.textContent?.trim() ??
      ``);

  // YAML frontmatter stamps the SDK version (machine-readable; the api/<version>/
  // path also carries it) + the source URL.
  const out: string[] = [
    `---`,
    `sdkVersion: ${ctx.version}`,
    `source: ${url}`,
    `---`,
    ``,
    `# ${title}`,
    ``
  ];
  if (brief) out.push(brief, ``);

  // Each "Member * Documentation" group header is followed by alternating
  // anchor <a id> + .memitem blocks. Walk the contents in document order so
  // members land under their section heading.
  const contents = doc.querySelector(`div.contents`) ?? doc.body;
  let currentSection = ``;
  for (const node of [...contents.children] as Element[]) {
    if (node.matches(`h2.groupheader`)) {
      const heading = node.textContent?.trim() ?? ``;
      // Skip the decl tables / detailed-description heading; we render the
      // "* Documentation" groups (the ones with full prose), which is where the
      // value is. The brief above already covers Detailed Description.
      currentSection = heading.endsWith("Documentation") ? heading : ``;
      if (currentSection) out.push(`## ${currentSection}`, ``);
      continue;
    }
    if (!currentSection || !node.matches(`.memitem`)) continue;
    const member = renderMember(node, className, ctx.cIndex);
    if (member) out.push(member, ``);
  }

  return (
    out
      .join(`\n`)
      .replace(/\n{3,}/g, `\n\n`)
      .trimEnd() + `\n`
  );
}

/** Render one `.memitem` (a function, typedef, enum, or data member). Each is
 * preceded by an `<h2 class="memtitle">` (a clean "Name()" label) and, before
 * that, an `<a id>` anchor — we use the memtitle as the heading and the
 * reconstructed signature as a code line. When the matching C ABI signature is
 * found in `cIndex`, its exact param/return types (which the prose-only docs
 * omit) are appended as a typed block. */
function renderMember(
  item: Element,
  className: string,
  cIndex: Map<string, CSignature>
): string {
  // The member's short title + anchor live in the preceding siblings:
  //   <a id="…"></a> <h2 class="memtitle">◆ Name()</h2> <div class="memitem">
  const memtitleEl = item.previousElementSibling;
  const title =
    inlineText(memtitleEl).replace(/^◆\s*/, ``) || reconstructSignature(item);
  let anchorEl = memtitleEl?.previousElementSibling;
  while (anchorEl && !anchorEl.getAttribute?.(`id`)) {
    anchorEl = anchorEl.previousElementSibling;
  }
  const anchor = anchorEl?.getAttribute?.(`id`) ?? ``;

  const signature = reconstructSignature(item);
  const lines: string[] = [`### ${title}`, ``];
  lines.push(`\`\`\`cpp`, signature, `\`\`\``, ``);
  if (anchor) lines.push(`<sub>\`#${anchor}\`</sub>`, ``);

  // Augment with the exact C ABI signature (typed params + return) from the
  // header. The C name is Discord_<Class>_<Method>; for namespace free functions
  // it's Discord_<Method>. Method = the memtitle minus "()" decoration.
  const method = title.replace(/\(.*$/, ``).trim();
  if (method) {
    const cName = className ? cNameFor(className, method) : `Discord_${method}`;
    const sig = cIndex.get(cName);
    if (sig) lines.push(formatCSignature(sig), ``);
  }

  const memdoc = item.querySelector(`.memdoc`);
  // Enumerators live in a table.fieldtable; render them as a list, then drop the
  // table so the prose conversion doesn't double-render it.
  const fieldtable = memdoc?.querySelector(`table.fieldtable`);
  let enumValues = ``;
  if (fieldtable) {
    const rows = [...fieldtable.querySelectorAll(`tr`)]
      .map((tr) => {
        const name = tr.querySelector(`.fieldname`)?.textContent?.trim();
        const desc = inlineText(tr.querySelector(`.fielddoc`));
        return name ? `- \`${name}\`${desc ? ` — ${desc}` : ``}` : ``;
      })
      .filter(Boolean);
    if (rows.length) enumValues = [`**Values:**`, ``, ...rows].join(`\n`);
    fieldtable.remove();
  }

  const prose = htmlToMarkdown(memdoc);
  if (prose) lines.push(prose);
  if (enumValues) lines.push(``, enumValues);

  return lines.join(`\n`).trimEnd();
}

/**
 * Reconstruct a readable one-line signature from a `.memproto`. Doxygen splits the return type / name into a `td.memname` and each argument into `td.paramtype` + `td.paramname` rows; the names carry trailing `,`/`)` punctuation we strip.
 */
function reconstructSignature(item: Element): string {
  const memname = inlineText(item.querySelector(`td.memname`));
  const params = [...item.querySelectorAll(`td.paramtype`)]
    .map((typeCell, i) => {
      const type = inlineText(typeCell).trim();
      const nameCell = item.querySelectorAll(`td.paramname`)[i];
      const name = inlineText(nameCell)
        .replace(/[,)]\s*$/, ``)
        .trim();
      return [type, name].filter(Boolean).join(` `);
    })
    .filter(Boolean);

  // memname is e.g. "void discordpp::Client::Authorize"; if there are params,
  // append them, else fall back to the whole proto's flattened text.
  if (memname) {
    return params.length ? `${memname}(${params.join(`, `)})` : memname;
  }
  return inlineText(item.querySelector(`.memname`)) || `(member)`;
}

/** Collapse an element's text to a single trimmed line. */
function inlineText(el: Element | null | undefined): string {
  return (el?.textContent ?? ``).replace(/\s+/g, ` `).trim();
}

/**
 * Faithful (but small) HTML→markdown for Doxygen prose blocks. Handles the tags Discord's docs actually use: paragraphs, headings, lists, code spans + `<pre>` blocks, links, bold/italic, and `dl.deprecated`/`dl.note`/`dl.see` sections. Block structure (paragraph + list breaks) is preserved; everything else collapses to readable inline markdown.
 */
function htmlToMarkdown(root: Element | null | undefined): string {
  if (!root) return ``;
  const blocks: string[] = [];

  const renderInline = (el: Element): string => {
    let s = ``;
    for (const node of el.childNodes) {
      if (node.nodeType === 3) {
        s += (node.textContent ?? ``).replace(/\s+/g, ` `);
        continue;
      }
      if (node.nodeType !== 1) continue;
      const e = node as unknown as Element;
      const tag = e.tagName.toLowerCase();
      const inner = renderInline(e);
      if (tag === `a`) {
        const href = e.getAttribute(`href`) ?? ``;
        // Relative Doxygen links (other class pages, anchors) — keep the text,
        // append the target so cross-refs are still discoverable.
        s += href.startsWith(`http`) ? `[${inner}](${href})` : inner;
      } else if (tag === `code` || tag === `tt` || tag === `computeroutput`) {
        s += `\`${inner}\``;
      } else if (tag === `b` || tag === `strong`) {
        s += `**${inner}**`;
      } else if (tag === `em` || tag === `i`) {
        s += `_${inner}_`;
      } else if (tag === `br`) {
        s += ` `;
      } else {
        s += inner;
      }
    }
    return s;
  };

  const walkBlocks = (el: Element): void => {
    for (const node of el.childNodes) {
      if (node.nodeType === 3) {
        const t = (node.textContent ?? ``).trim();
        if (t) blocks.push(t.replace(/\s+/g, ` `));
        continue;
      }
      if (node.nodeType !== 1) continue;
      const e = node as unknown as Element;
      const tag = e.tagName.toLowerCase();
      if (tag === `p`) {
        const t = renderInline(e).trim();
        if (t) blocks.push(t);
      } else if (/^h[1-6]$/.test(tag)) {
        const t = renderInline(e).trim();
        if (t) blocks.push(`#### ${t}`);
      } else if (tag === `ul` || tag === `ol`) {
        const items = [...e.querySelectorAll(`:scope > li`)].map((li, i) => {
          const marker = tag === `ol` ? `${i + 1}.` : `-`;
          return `${marker} ${renderInline(li as unknown as Element).trim()}`;
        });
        if (items.length) blocks.push(items.join(`\n`));
      } else if (tag === `pre`) {
        blocks.push(`\`\`\`\n${(e.textContent ?? ``).trimEnd()}\n\`\`\``);
      } else if (
        tag === `div` &&
        (e.getAttribute(`class`) ?? ``).includes(`fragment`)
      ) {
        // Doxygen code examples: a div.fragment of many div.line spans. Render
        // the whole thing as one code block instead of recursing (which would
        // explode each line into its own paragraph).
        const code = [...e.querySelectorAll(`.line`)]
          .map((line) => (line.textContent ?? ``).replace(/ /g, ` `))
          .join(`\n`)
          .replace(/\n{2,}/g, `\n`)
          .trimEnd();
        if (code) blocks.push(`\`\`\`cpp\n${code}\n\`\`\``);
      } else if (tag === `dl`) {
        const cls = e.getAttribute(`class`) ?? ``;
        const label = inlineText(e.querySelector(`dt`)) || `Note`;
        const bodyText = [...e.querySelectorAll(`dd`)]
          .map((dd) => renderInline(dd as unknown as Element).trim())
          .filter(Boolean)
          .join(` `);
        if (cls.includes(`deprecated`)) {
          blocks.push(`> **⚠️ Deprecated.** ${bodyText}`);
        } else if (bodyText) {
          blocks.push(`> **${label}:** ${bodyText}`);
        }
      } else if (tag === `div`) {
        // Recurse into wrapper divs (e.g. fragment/code containers).
        walkBlocks(e);
      } else {
        const t = renderInline(e).trim();
        if (t) blocks.push(t);
      }
    }
  };

  walkBlocks(root);
  return blocks.join(`\n\n`).trim();
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
