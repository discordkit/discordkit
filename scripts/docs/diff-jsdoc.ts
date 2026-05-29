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

import { readFileSync, readdirSync, existsSync } from "node:fs";
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

if (!folderArg) {
  console.error(`Usage: diff-jsdoc <folder>`);
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
    // Carry forward any trailing curated JSDoc directives (`@example`,
    // `@deprecated`, `@see`) that the old block had but the renderer didn't
    // produce. The docs themselves never emit these tags.
    const newBodyComplete = appendCuratedDirectives(
      oldBlock.text,
      newBodyLinked
    );
    const newBlock = formatBlock(newBodyComplete);
    if (oldBlock.text.trim() === newBlock.trim()) continue;
    const diff = unifiedDiff(
      `packages/client/src/${folder}/${file}`,
      oldBlock.text,
      newBlock,
      oldBlock.startLine
    );
    process.stdout.write(diff);
    process.stdout.write(`\n`);
    diffed++;
  }

  console.error(
    `\n${diffed} file(s) would change; ${skipped} skipped (no JSDoc / no doc match).`
  );
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
          startLine: blockStartIdx + 1
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
 * replacement. Multi-word display texts (e.g. `application command object`)
 * are checked before single-word ones so we don't munge nested matches.
 */
function preserveCrossRefs(oldBlock: string, newBody: string): string {
  // Capture: link-with-display `{@link Name | display}` (group1=Name, group2=display)
  //          link-bare        `{@link Name}` (group3=Name)
  const refs: { name: string; display: string }[] = [];
  const re = /\{@link\s+([^\s|}]+)(?:\s*\|\s*([^}]+))?\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(oldBlock)) !== null) {
    const name = m[1];
    const display = (m[2] ?? name).trim();
    refs.push({ name, display });
  }
  if (refs.length === 0) return newBody;

  // Apply longest-first so substrings don't shadow longer matches.
  refs.sort((a, b) => b.display.length - a.display.length);
  let out = newBody;
  for (const { name, display } of refs) {
    // Replace only the FIRST occurrence — avoids over-linking when the same
    // word appears in multiple paragraphs.
    const literal = display.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
    out = out.replace(new RegExp(literal), `{@link ${name} | ${display}}`);
  }
  return out;
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
  // begins with `@example`, `@deprecated`, or `@see`, and continues until
  // the next directive or the end of the block.
  const directives: string[] = [];
  let current: string[] | null = null;
  for (const line of rawLines) {
    if (/^(@example|@deprecated|@see)\b/.test(line)) {
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
  // The existing block always carries the heading link as the first line
  // of body: `### [<Title>](<URL>)`. Pull the title out and match by name.
  const m = /\*\s+###\s+\[([^\]]+)\]/.exec(oldBlockText);
  if (!m) return null;
  const title = m[1].trim();
  return candidates.find((ep) => ep.name === title) ?? null;
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
