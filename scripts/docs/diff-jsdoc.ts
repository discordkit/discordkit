/**
 * P2a: JSDoc diff tool.
 *
 * Walks every endpoint file in a target folder, locates the top-of-file
 * JSDoc block, asks the renderer for a fresh version derived from the
 * parsed docs, and prints a unified diff. **Never writes** — reviewing
 * the diff is the point.
 *
 * The renderer is conservative: if it can't confidently match a file to
 * a parsed `DocEndpoint`, the file is skipped (no diff, no warning).
 * Once we trust the renderer, a follow-up `--write` mode can apply the
 * changes folder-by-folder.
 *
 * Usage:
 *   node --experimental-strip-types scripts/docs/diff-jsdoc.ts <folder>
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseResource, type DocEndpoint } from "./parse.ts";
import { renderEndpointJsDoc, formatBlock } from "./render-jsdoc.ts";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), `../..`);
const DOCS_CACHE = join(PROJECT_ROOT, `.discord-docs`);
const CLIENT_SRC = join(PROJECT_ROOT, `packages/client/src`);
const DOCS_BASE_URL = `https://discord.com/developers/docs`;

/**
 * Folder → docs page(s). Mirrors the audit.ts mapping. Duplicated here
 * (rather than imported) because the two tools have different exclude
 * lists and we want them to drift independently.
 */
const FOLDER_MAP: Record<string, string[]> = {
  application: [
    `resources/application.md`,
    `interactions/application-commands.md`
  ],
  "application-role-connection": [
    `resources/application-role-connection-metadata.md`
  ],
  "audit-log": [`resources/audit-log.md`],
  "auto-moderation": [`resources/auto-moderation.md`],
  channel: [`resources/channel.md`],
  components: [`components/reference.md`],
  emoji: [`resources/emoji.md`],
  entitlements: [`resources/entitlement.md`],
  event: [`resources/guild-scheduled-event.md`],
  guild: [`resources/guild.md`],
  interactions: [`interactions/receiving-and-responding.md`],
  invite: [`resources/invite.md`],
  lobby: [`resources/lobby.md`],
  messages: [`resources/message.md`],
  poll: [`resources/poll.md`],
  sku: [`resources/sku.md`],
  soundboard: [`resources/soundboard.md`],
  stage: [`resources/stage-instance.md`],
  sticker: [`resources/sticker.md`],
  subscription: [`resources/subscription.md`],
  template: [`resources/guild-template.md`],
  user: [`resources/user.md`],
  voice: [`resources/voice.md`],
  webhook: [`resources/webhook.md`]
};

const args = process.argv.slice(2);
const folderArg = args.find((a) => !a.startsWith(`--`));
const writeMode = args.includes(`--write`);

if (!folderArg) {
  console.error(`Usage: diff-jsdoc <folder> [--write]`);
  process.exit(1);
}

const folder: string = folderArg;
const docPages = FOLDER_MAP[folder];
if (!docPages) {
  console.error(`Unknown folder: ${folder}`);
  process.exit(1);
}

main();

function main(): void {
  const docEndpoints = loadDocEndpoints(docPages);
  const folderPath = join(CLIENT_SRC, folder);
  if (!existsSync(folderPath)) {
    console.error(`Folder not found: ${folderPath}`);
    process.exit(1);
  }
  const files = readdirSync(folderPath).filter(
    (f) =>
      f.endsWith(`.ts`) &&
      f !== `index.ts` &&
      !f.endsWith(`.spec.ts`) &&
      !f.endsWith(`.test.ts`)
  );

  let diffed = 0;
  let skipped = 0;
  for (const file of files) {
    const path = join(folderPath, file);
    const source = readFileSync(path, `utf8`);
    const oldBlock = extractTopJsDoc(source);
    if (!oldBlock) {
      skipped++;
      continue;
    }
    const match = matchEndpoint(oldBlock.text, docEndpoints);
    if (!match) {
      skipped++;
      continue;
    }
    const pageUrl = pageUrlFor(match, docPages);
    const newBody = renderEndpointJsDoc(match, { pageUrl });
    // Reapply any `{@link X | display}` cross-refs the existing block carried.
    // The renderer can't fabricate these on its own — it doesn't know which
    // local types exist — so we preserve them verbatim from the old prose.
    const newBodyLinked = preserveCrossRefs(oldBlock.text, newBody);
    // Realign the rendered URL placeholders with whatever names the
    // existing JSDoc block used. The JSDoc URL string is informational
    // only; it should track the schema field names the fetcher actually
    // destructures, not the docs' verbatim placeholder text (which may
    // differ — e.g. `:guild_scheduled_event` from docs vs `:event` in
    // the schema).
    const newBodyAligned = preserveUrlPlaceholders(
      oldBlock.text,
      newBodyLinked
    );
    // Carry forward any trailing curated JSDoc directives (`@example`,
    // `@deprecated`, `@see`, `@remarks`) that the old block had but the
    // renderer didn't produce. The docs themselves never emit these tags.
    // `@remarks` is the recommended carrier for hand-added prose that
    // augments doc-derived content (e.g. "Returns a {@link Foo}" when the
    // docs don't name the response type).
    const newBodyComplete = appendCuratedDirectives(
      oldBlock.text,
      newBodyAligned
    );
    const newBlock = formatBlock(newBodyComplete);
    if (oldBlock.text.trim() === newBlock.trim()) continue;

    if (writeMode) {
      writeFileSync(path, spliceBlock(source, oldBlock, newBlock), `utf8`);
    } else {
      const diff = unifiedDiff(
        `packages/client/src/${folder}/${file}`,
        oldBlock.text,
        newBlock,
        oldBlock.startLine
      );
      process.stdout.write(diff);
      process.stdout.write(`\n`);
    }
    diffed++;
  }

  const verb = writeMode ? `changed` : `would change`;
  console.error(
    `\n${diffed} file(s) ${verb}; ${skipped} skipped (no JSDoc / no doc match).`
  );
}

/**
 * Replace the old JSDoc block (delimited by `oldBlock.startLine` and
 * `oldBlock.lineCount`) with `newBlock`, preserving the file's existing
 * newline convention (LF vs CRLF). Returns the full file source.
 */
function spliceBlock(
  source: string,
  oldBlock: ExistingBlock,
  newBlock: string
): string {
  const nl = source.includes(`\r\n`) ? `\r\n` : `\n`;
  const lines = source.split(/\r?\n/);
  const before = lines.slice(0, oldBlock.startLine - 1);
  const after = lines.slice(oldBlock.startLine - 1 + oldBlock.lineCount);
  const newLines = newBlock.split(`\n`);
  return [...before, ...newLines, ...after].join(nl);
}

// ─── loaders ───────────────────────────────────────────────────────────────

function loadDocEndpoints(pages: string[]): DocEndpoint[] {
  const out: DocEndpoint[] = [];
  for (const page of pages) {
    const filePath = join(DOCS_CACHE, page);
    if (!existsSync(filePath)) {
      console.warn(`WARN: doc page missing: ${page}`);
      continue;
    }
    const md = readFileSync(filePath, `utf8`);
    const r = parseResource(md);
    for (const ep of r.endpoints) {
      out.push({ ...ep, _page: page } as DocEndpoint & { _page: string });
    }
  }
  return out;
}

function pageUrlFor(endpoint: DocEndpoint, pages: string[]): string {
  const pageWithSuffix = (endpoint as DocEndpoint & { _page?: string })._page;
  const page = pageWithSuffix ?? pages[0];
  // `.discord-docs/resources/user.md` → `/developers/docs/resources/user`
  const rel = page.replace(/\.md$/, ``);
  return `${DOCS_BASE_URL}/${rel}`;
}

// ─── existing-JSDoc extraction ─────────────────────────────────────────────

interface ExistingBlock {
  /** The raw `/** … *\/` block including the leading whitespace. */
  text: string;
  /** 1-based line number where the block starts. */
  startLine: number;
  /** Inclusive number of source lines the block occupies. */
  lineCount: number;
}

function extractTopJsDoc(source: string): ExistingBlock | null {
  // We want the JSDoc that documents the exported fetcher / object — the
  // last `/** … *\/` block that appears immediately above an `export`.
  //
  // The scan handles three shapes:
  //   1. Multi-line block:           `/**`, body lines, `*\/`
  //   2. Single-line block on one row: `/** description *\/`
  //   3. Nested-looking single-liners inside schemas (e.g.
  //      `/** the recipient ... *\/` next to `recipientId: snowflake`).
  //      These are rejected by the "must be followed by export" rule.
  const lines = source.split(/\r?\n/);
  let inBlock = false;
  let blockStart = -1;
  let block: string[] = [];
  let lastBlock: ExistingBlock | null = null;

  const considerSave = (i: number, blockStartIdx: number): void => {
    for (let j = i + 1; j < lines.length; j++) {
      const next = lines[j];
      if (next.trim().length === 0) continue;
      if (/^export\b/.test(next)) {
        lastBlock = {
          text: block.join(`\n`),
          startLine: blockStartIdx + 1,
          lineCount: block.length
        };
      }
      return;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inBlock) {
      if (/^\s*\/\*\*/.test(line)) {
        // Single-line block: `/** … *\/` lives on one row.
        if (/\*\//.test(line)) {
          block = [line];
          considerSave(i, i);
          continue;
        }
        inBlock = true;
        blockStart = i;
        block = [line];
      }
      continue;
    }
    block.push(line);
    if (/\*\//.test(line)) {
      inBlock = false;
      considerSave(i, blockStart);
    }
  }
  return lastBlock;
}

// ─── cross-ref preservation ────────────────────────────────────────────────

/**
 * Pull every `{@link Name | display text}` and `{@link Name}` reference out
 * of the existing JSDoc block and re-apply them onto a freshly-rendered
 * body. Match purely by display text — exact, case-sensitive substring
 * replacement.
 *
 * If the same `Name | display` reference appeared N times in the old
 * block, we re-link the first N occurrences in the new body. This handles
 * the common pattern where a long description mentions the same type in
 * multiple paragraphs (e.g. "Returns a {@link Message | message object} …
 * the {@link Message | message object} contains …").
 *
 * Multi-word display texts (e.g. `application command object`) are
 * checked before single-word ones so we don't munge nested matches.
 */
function preserveCrossRefs(oldBlock: string, newBody: string): string {
  // Capture: link-with-display `{@link Name | display}` (group1=Name, group2=display)
  //          link-bare        `{@link Name}` (group3=Name)
  const counts = new Map<string, { name: string; count: number }>();
  const re = /\{@link\s+([^\s|}]+)(?:\s*\|\s*([^}]+))?\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(oldBlock)) !== null) {
    const name = m[1];
    const display = (m[2] ?? name).trim();
    const key = `${name}|${display}`;
    const entry = counts.get(key);
    if (entry) entry.count++;
    else counts.set(key, { name, count: 1 });
  }
  if (counts.size === 0) return newBody;

  // Apply longest-first so substrings don't shadow longer matches
  // (`message object` before `object`, `application command` before
  // `command`, etc.).
  const refs = [...counts.entries()]
    .map(([key, { name, count }]) => {
      const display = key.slice(name.length + 1);
      return { name, display, count };
    })
    .sort((a, b) => b.display.length - a.display.length);

  // For each phrase, walk the body looking for matches OUTSIDE protected
  // regions (URLs, code spans, existing `{@link …}` blocks). The protected
  // regions are recomputed for every phrase because earlier phrases turn
  // plain text into new `{@link …}` blocks — a stale split would let a
  // later short phrase like "DM channel" leak into a newly-created
  // `{@link Channel | DM channel object}` and produce
  // `{@link Channel | {@link Channel | DM channel} object}`.
  //
  // Protection rules:
  //   - markdown link URLs:        `[text](url)` — only the `(url)` part
  //   - inline code spans:         `` `…` ``
  //   - existing JSDoc references: `{@link …}`
  //   - heading-link target:       the URL inside `### [Title](URL)`
  const protectedRe = /\{@link[^}]*\}|`[^`]*`|\]\([^)]+\)/g;
  let body = newBody;
  for (const { name, display } of refs) {
    body = replaceOutsideProtected(body, protectedRe, display, name);
  }
  return body;
}

/**
 * Replace every occurrence of `display` (as a whole substring) in `text`
 * with `{@link name | display}`, skipping any match that overlaps a
 * region matched by `protectedRe`.
 *
 * Implemented as a single left-to-right scan so we don't have to redo the
 * protection check after each substitution.
 */
function replaceOutsideProtected(
  text: string,
  protectedRe: RegExp,
  display: string,
  name: string
): string {
  // Compute the protected ranges once per phrase.
  const ranges: [number, number][] = [];
  let pm: RegExpExecArray | null;
  const re = new RegExp(protectedRe.source, `g`);
  while ((pm = re.exec(text)) !== null) {
    ranges.push([pm.index, pm.index + pm[0].length]);
  }
  const inProtected = (i: number): boolean =>
    ranges.some(([s, e]) => i >= s && i < e);

  const literal = display.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  const matchRe = new RegExp(literal, `g`);
  let out = ``;
  let last = 0;
  let mm: RegExpExecArray | null;
  while ((mm = matchRe.exec(text)) !== null) {
    if (inProtected(mm.index)) continue;
    out += text.slice(last, mm.index);
    out += `{@link ${name} | ${display}}`;
    last = mm.index + mm[0].length;
  }
  out += text.slice(last);
  return out;
}

// ─── URL placeholder preservation ──────────────────────────────────────────

/**
 * Pull the `**METHOD** \`/path\`` line out of the existing JSDoc block,
 * walk its placeholders (`:foo`), and substitute them positionally into
 * the freshly-rendered URL. Preserves the codebase's convention that the
 * JSDoc URL placeholder name matches the schema field the fetcher
 * destructures (which may differ from the docs verbatim — e.g. our
 * `event` field maps to the doc's `:guild_scheduled_event`).
 *
 * If the placeholder counts differ between old and new (e.g. the docs
 * added or removed a path segment), the rendered URL wins so the diff
 * makes the structural change visible.
 */
function preserveUrlPlaceholders(oldBlock: string, newBody: string): string {
  const oldLine = /\*\*[A-Z]+\*\*\s+`([^`]+)`/.exec(oldBlock);
  const newLine = /\*\*[A-Z]+\*\*\s+`([^`]+)`/.exec(newBody);
  if (!oldLine || !newLine) return newBody;

  const oldNames = [...oldLine[1].matchAll(/:([a-zA-Z_][a-zA-Z0-9_]*)/g)].map(
    (m) => m[1]
  );
  const newPath = newLine[1];
  const newNames = [...newPath.matchAll(/:([a-zA-Z_][a-zA-Z0-9_]*)/g)].map(
    (m) => m[1]
  );
  if (oldNames.length !== newNames.length) return newBody;

  let i = 0;
  const rewrittenPath = newPath.replace(
    /:([a-zA-Z_][a-zA-Z0-9_]*)/g,
    () => `:${oldNames[i++]}`
  );
  return newBody.replace(
    newLine[0],
    newLine[0].replace(newPath, rewrittenPath)
  );
}

// ─── curated-directive preservation ────────────────────────────────────────

/**
 * Discord's docs never emit JSDoc directives like `@example`, `@deprecated`,
 * or `@see`. When a hand-tuned endpoint comment carries them, the renderer
 * would otherwise drop them. This helper strips the comment wrapper from
 * the old block, walks for those directives, and appends each captured
 * block to the freshly-rendered body.
 */
function appendCuratedDirectives(oldBlock: string, newBody: string): string {
  // Strip ` * ` prefixes from the old block to recover the raw prose.
  const rawLines = oldBlock
    .split(`\n`)
    .filter((l) => !/^\s*\/\*\*\s*$/.test(l) && !/^\s*\*\/\s*$/.test(l))
    .map((l) => l.replace(/^\s*\*\s?/, ``));

  // Find ranges of directive blocks. A directive starts on a line that
  // begins with `@example`, `@deprecated`, `@see`, or `@remarks`, and
  // continues until the next directive or the end of the block.
  const directives: string[] = [];
  let current: string[] | null = null;
  for (const line of rawLines) {
    if (/^(@example|@deprecated|@see|@remarks)\b/.test(line)) {
      if (current) directives.push(current.join(`\n`).trimEnd());
      current = [line];
    } else if (current) {
      current.push(line);
    }
  }
  if (current) directives.push(current.join(`\n`).trimEnd());
  if (directives.length === 0) return newBody;

  return [newBody, ``, ...directives].join(`\n`);
}

// ─── doc-endpoint matching ─────────────────────────────────────────────────

function matchEndpoint(
  oldBlockText: string,
  candidates: DocEndpoint[]
): DocEndpoint | null {
  // The existing block always carries:
  //   ### [<Title>](<URL>)
  //   **<METHOD>** `<path>`
  //
  // Match on title first. If the title matches but the (method, path) of
  // the candidate doesn't match what's in the existing block, the existing
  // JSDoc was probably hand-written with a copy-pasted heading from a
  // similar endpoint (e.g. getChannelPins.ts carrying "Get Channel
  // Messages" as its title). Refuse to refresh in that case — better to
  // skip and let a human fix the mismatch than silently replace the file
  // with content for the wrong endpoint.
  const titleMatch = /\*\s+###\s+\[([^\]]+)\]/.exec(oldBlockText);
  if (!titleMatch) return null;
  const title = titleMatch[1].trim();
  const byTitle = candidates.find((ep) => ep.name === title);
  if (!byTitle) return null;

  const methodPathMatch = /\*\s+\*\*([A-Z]+)\*\*\s+`([^`]+)`/.exec(
    oldBlockText
  );
  if (methodPathMatch) {
    const [, method, oldPath] = methodPathMatch;
    if (
      byTitle.method !== method ||
      !pathsAreCompatible(oldPath, byTitle.path)
    ) {
      console.warn(
        `WARN: title "${title}" matched, but ${method} ${oldPath} != ${byTitle.method} ${byTitle.path} — skipping (likely a stale or copy-pasted heading)`
      );
      return null;
    }
  }
  return byTitle;
}

/**
 * Compare two route paths ignoring the specific param names (so `:event`
 * matches `:guild_scheduled_event`). Both sides are split on `/`, each
 * segment starting with `:` is treated as a wildcard.
 */
function pathsAreCompatible(oldPath: string, newPath: string): boolean {
  const oldParts = oldPath.split(`/`);
  const newParts = newPath.split(`/`);
  if (oldParts.length !== newParts.length) return false;
  for (let i = 0; i < oldParts.length; i++) {
    const o = oldParts[i];
    const n = newParts[i];
    if (o.startsWith(`:`) && n.startsWith(`:`)) continue;
    if (o !== n) return false;
  }
  return true;
}

// ─── unified diff (minimal implementation) ─────────────────────────────────

function unifiedDiff(
  filePath: string,
  oldText: string,
  newText: string,
  startLine: number
): string {
  const oldLines = oldText.split(`\n`);
  const newLines = newText.split(`\n`);

  const header = [
    `--- a/${filePath}`,
    `+++ b/${filePath}`,
    `@@ -${startLine},${oldLines.length} +${startLine},${newLines.length} @@`
  ];
  const body: string[] = [];
  for (const line of oldLines) body.push(`-${line}`);
  for (const line of newLines) body.push(`+${line}`);
  return [...header, ...body].join(`\n`);
}
