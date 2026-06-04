/**
 * P2d: Schema JSDoc diff tool.
 *
 * Walks every `*.ts` file in a folder's `types/` directory (or the
 * folder itself, for things like `permissions/`), finds each exported
 * schema or enum, looks up the matching `DocObject` / `DocEnum` from the
 * parsed docs, and renders/diffs a canonical block JSDoc above it.
 *
 * Block-level only — field-level comments are intentionally untouched.
 *
 * Usage:
 *   node --experimental-strip-types scripts/docs/diff-schema-jsdoc.ts <folder> [--write]
 *
 * Behavior:
 *   - Reads the doc page(s) mapped to <folder> from `FOLDER_MAP`
 *     (shared with diff-jsdoc.ts).
 *   - For each `export const xxxSchema = v.object|v.picklist|v.enum_(...)`
 *     declaration, derives the doc-object name from the schema variable
 *     (`userSchema` → `User`) and tries to match it against the parsed
 *     docs (case-insensitive, with `Object`/`Structure`/`Enum` suffix
 *     stripping).
 *   - For each `export enum Xxx`, derives the doc-enum name from the
 *     enum identifier.
 *   - The rendered block goes above the schema/enum declaration.
 *     Existing top-of-export JSDoc (a `/** … *\/` immediately preceding
 *     `export const`/`export enum`) is replaced; if there's no existing
 *     block, the new block is inserted.
 */

import {
  readFileSync,
  readdirSync,
  existsSync,
  writeFileSync,
  statSync
} from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseResource,
  type DocObject,
  type DocEnum,
  type DocField,
  type DocFieldGroup,
  type DocEndpoint,
  type DocResource
} from "./parse.ts";
import {
  renderObjectJsDoc,
  renderEnumJsDoc,
  formatBlock
} from "./render-schema-jsdoc.ts";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), `../..`);
const DOCS_CACHE = join(PROJECT_ROOT, `.discord-docs`);
const CLIENT_SRC = join(PROJECT_ROOT, `packages/client/src`);
const DOCS_BASE_URL = `https://discord.com/developers/docs`;

/**
 * Per-folder name fudging. Two knobs:
 *
 * - prefix: the docs add this word(s) to the front of every type
 *   heading; the codebase identifier omits it. Example: docs say
 *   "Auto Moderation Rule Object" but our type is `ModerationRule`,
 *   so for `auto-moderation` the prefix is "Auto".
 *
 * - stripFromIdentifier: the codebase identifier adds these words
 *   that the docs heading omits. Example: docs say "Event Types" but
 *   our type is `ModerationEvent`, so for `auto-moderation` we strip
 *   "Moderation" before matching, giving us "Event" → matches
 *   "Event Types" via the plural-tolerance rule.
 */
const FOLDER_PREFIX: Record<string, string> = {
  "auto-moderation": `Auto`,
  event: `Guild`,
  // stage/ types are Stage / StagePrivacyLevel; docs say
  // "Stage Instance Object" / "Stage Instance Privacy Level".
  stage: ``
};

/**
 * Words appended to a stripped identifier before searching. Example:
 * for stage/, our `Stage` becomes `Stage Instance`. Different from
 * FOLDER_PREFIX (a leading word) — this is a trailing word inserted
 * after the FIRST identifier component.
 */
const FOLDER_INFIX: Record<string, string> = {
  stage: `Instance`
};

const FOLDER_STRIP_IDENT: Record<string, string[]> = {
  "auto-moderation": [`Moderation`],
  stage: [`Stage`]
};

/**
 * Folder → docs page(s). Mirrors `diff-jsdoc.ts` so schemas in
 * `user/types/` resolve to `resources/user.md`. Additional standalone
 * type-only folders (`permissions/`, `teams/`, etc.) get their own
 * entries here.
 */
const FOLDER_MAP: Record<string, string[]> = {
  application: [
    `resources/application.md`,
    `interactions/application-commands.md`
  ],
  "application-commands": [`interactions/application-commands.md`],
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
  permissions: [`topics/permissions.md`],
  poll: [`resources/poll.md`],
  sku: [`resources/sku.md`],
  soundboard: [`resources/soundboard.md`],
  stage: [`resources/stage-instance.md`],
  sticker: [`resources/sticker.md`],
  subscription: [`resources/subscription.md`],
  teams: [`topics/teams.md`],
  template: [`resources/guild-template.md`],
  user: [`resources/user.md`],
  voice: [`resources/voice.md`],
  webhook: [`resources/webhook.md`]
};

const args = process.argv.slice(2);
const folderArg = args.find((a) => !a.startsWith(`--`));
const writeMode = args.includes(`--write`);

if (!folderArg) {
  console.error(`Usage: diff-schema-jsdoc <folder> [--write]`);
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
  const { objects, enums, endpoints } = loadDocResources(docPages);
  // We scan two locations:
  //   1. `<folder>/types/*.ts` — type schemas (objects/enums). Block-
  //      level JSDoc + field-level comments refreshed.
  //   2. `<folder>/*.ts` — endpoint schemas. Block-level is owned by
  //      diff-jsdoc.ts. Field-level descriptions for nested body/params/
  //      form objects come from DocEndpoint.jsonParams/queryParams/
  //      formParams.
  const targets: { dir: string; isTypes: boolean }[] = [];
  const folderTypesPath = join(CLIENT_SRC, folder, `types`);
  if (existsSync(folderTypesPath) && statSync(folderTypesPath).isDirectory()) {
    targets.push({ dir: folderTypesPath, isTypes: true });
    targets.push({ dir: join(CLIENT_SRC, folder), isTypes: false });
  } else {
    // Type-only folders like permissions/: schemas are at the folder root.
    targets.push({ dir: join(CLIENT_SRC, folder), isTypes: true });
  }

  const files: { path: string; rel: string; isTypes: boolean }[] = [];
  for (const t of targets) {
    if (!existsSync(t.dir)) continue;
    for (const name of readdirSync(t.dir)) {
      if (!name.endsWith(`.ts`)) continue;
      if (name === `index.ts`) continue;
      if (name.endsWith(`.spec.ts`) || name.endsWith(`.test.ts`)) continue;
      const full = join(t.dir, name);
      // Skip the types subdirectory when iterating the root.
      if (statSync(full).isDirectory()) continue;
      files.push({
        path: full,
        rel: t.isTypes ? `types/${name}` : name,
        isTypes: t.isTypes
      });
    }
  }

  // The rendered page URL is fixed per page — for multi-page folders
  // (application/), the first matched object wins its origin page so
  // we use a per-object url() helper below.
  const pageUrlFor = (page: string): string => {
    const rel = page.replace(/\.md$/, ``);
    return `${DOCS_BASE_URL}/${rel}`;
  };

  let changed = 0;
  let skipped = 0;
  let unmatched = 0;
  for (const fileMeta of files) {
    const { path, rel, isTypes } = fileMeta;
    const file = rel;
    const source = readFileSync(path, `utf8`);

    // Endpoint files (NOT in types/) get only their body/params/form
    // sub-objects refreshed — the top-of-file endpoint JSDoc and
    // anything else belongs to diff-jsdoc.ts.
    if (!isTypes) {
      const updated = refreshEndpointParamSchemas(source, file, endpoints);
      if (updated === source) {
        skipped++;
        continue;
      }
      if (writeMode) writeFileSync(path, updated, `utf8`);
      else {
        const diff = quickDiff(
          `packages/client/src/${folder}/${file}`,
          source,
          updated
        );
        process.stdout.write(diff);
        process.stdout.write(`\n`);
      }
      changed++;
      continue;
    }

    const allExports = findSchemaExports(source);
    if (allExports.length === 0) {
      skipped++;
      continue;
    }
    // When a file has both `export enum Xxx` and `export const xxxSchema`,
    // emit a JSDoc block only on the FIRST occurrence (the enum, which
    // sits closer to the top of the file) — both refer to the same doc
    // anchor, so a second block on the schema is redundant noise.
    // Compare case-insensitively because the codebase mixes acronym
    // styles between the enum (`SKUFlags`) and the schema (`skuFlags`).
    const seenDisplayNames = new Set<string>();
    const exports = allExports.filter((e) => {
      const key = e.displayName.toLowerCase().replace(/\s+/g, ` `);
      if (seenDisplayNames.has(key)) return false;
      seenDisplayNames.add(key);
      return true;
    });
    let updated = source;
    let anyMatched = false;
    // Process in reverse line order so earlier line numbers don't shift
    // when we splice later ones.
    for (const exp of [...exports].reverse()) {
      const docName = exp.derivedDocName;
      let matchedPage: string | undefined;
      let body: string | undefined;
      // Try BOTH lists in turn: a `xxxSchema` export might be a v.object
      // (matches an object) OR a bitfield()/enum_(`...`) wrapper around
      // an enum (matches an enum). For `export enum`, only the enum
      // list is meaningful, but we still consult both so that custom
      // singular/plural fallbacks below get a chance.
      // Pull any existing block comment's description prose so we can
      // preserve it as a fallback when the docs side has empty
      // description (common for objects whose docs page only renders a
      // bare structure table).
      const existingDescription = extractExistingBlockDescription(updated, exp);

      const objMatch = findObjectByName(objects, docName, docPages);
      if (objMatch) {
        matchedPage = objMatch.page;
        // Prefer the doc's display name when it preserves an acronym
        // casing that the identifier-derived name would lose
        // (`skuSchema` → "Sku" via the camelCase splitter, but docs
        // heading is "SKU Object"). Trust the docs casing whenever it
        // contains any UPPERCASE acronym we'd otherwise mangle.
        const displayName =
          preferDocsDisplayName(stripSuffixes(objMatch.object.name)) ??
          exp.displayName;
        // Run the same docs→codebase transforms on the block description
        // (snake_case → camelCase inside backticks, internal markdown
        // links flattened) that field comments already get.
        const transformedObject = {
          ...objMatch.object,
          description: transformDocDescription(objMatch.object.description)
        };
        body = renderObjectJsDoc(transformedObject, {
          pageUrl: pageUrlFor(objMatch.page),
          displayName,
          existingDescription
        });
      } else {
        const enumMatch = findEnumByName(enums, docName, docPages);
        if (enumMatch) {
          matchedPage = enumMatch.page;
          const displayName =
            preferDocsDisplayName(stripSuffixes(enumMatch.enum.name)) ??
            exp.displayName;
          body = renderEnumJsDoc(enumMatch.enum, {
            pageUrl: pageUrlFor(enumMatch.page),
            displayName,
            existingDescription
          });
        }
      }
      if (!body || !matchedPage) {
        unmatched++;
        console.warn(
          `WARN: no doc match for ${file} :: ${exp.identifier} (looked for "${docName}")`
        );
        continue;
      }
      anyMatched = true;
      const newBlock = formatBlock(body);
      updated = spliceSchemaBlock(updated, exp, newBlock);

      // Field-level refresh. We re-read `updated` so the splice indices
      // line up after the block-level edit above.
      if (exp.kind === `object`) {
        const docFields =
          objMatch?.object.fields ?? // (already computed above)
          undefined;
        if (docFields) {
          updated = refreshSchemaFieldComments(updated, exp, docFields, file);
        }
      } else {
        const enumMatch = findEnumByName(enums, docName, docPages);
        if (enumMatch) {
          updated = refreshEnumMemberComments(
            updated,
            exp,
            enumMatch.enum,
            file
          );
        }
      }
    }
    if (!anyMatched) {
      skipped++;
      continue;
    }
    if (updated === source) continue;

    if (writeMode) {
      writeFileSync(path, updated, `utf8`);
    } else {
      // Quick character-level diff: just show file header + new content
      // for the changed exports. The full inline-splice machinery from
      // diff-jsdoc.ts is overkill here.
      const diff = quickDiff(
        `packages/client/src/${folder}/${file}`,
        source,
        updated
      );
      process.stdout.write(diff);
      process.stdout.write(`\n`);
    }
    changed++;
  }

  const verb = writeMode ? `changed` : `would change`;
  console.error(
    `\n${changed} file(s) ${verb}; ${skipped} skipped (no schemas / no match); ${unmatched} unmatched export(s).`
  );
}

// ─── loaders ───────────────────────────────────────────────────────────────

interface PageObject {
  object: DocObject;
  page: string;
}
interface PageEnum {
  enum: DocEnum;
  page: string;
}

function loadDocResources(pages: string[]): {
  objects: PageObject[];
  enums: PageEnum[];
  endpoints: DocEndpoint[];
} {
  const objects: PageObject[] = [];
  const enums: PageEnum[] = [];
  const endpoints: DocEndpoint[] = [];
  for (const page of pages) {
    const filePath = join(DOCS_CACHE, page);
    if (!existsSync(filePath)) {
      console.warn(`WARN: doc page missing: ${page}`);
      continue;
    }
    const md = readFileSync(filePath, `utf8`);
    const r: DocResource = parseResource(md);
    for (const o of r.objects) objects.push({ object: o, page });
    for (const e of r.enums) enums.push({ enum: e, page });
    for (const ep of r.endpoints) endpoints.push(ep);
  }
  return { objects, enums, endpoints };
}

// ─── schema discovery ───────────────────────────────────────────────────────

interface SchemaExport {
  /** Identifier of the export (`userSchema` or `UserFlags`). */
  identifier: string;
  /** What kind of declaration this is. */
  kind: `object` | `enum`;
  /** Doc-object name we'll search for in the parsed docs. */
  derivedDocName: string;
  /** Display name to render in the heading (overrides docs name). */
  displayName: string;
  /** 0-based start line of the existing JSDoc block (or the export line if none). */
  blockStartLine: number;
  /** Number of lines the existing JSDoc block takes up (0 if none). */
  blockLineCount: number;
}

/**
 * Identify each `export const xxxSchema = v.object|...` and `export enum Xxx`
 * declaration in the source, along with any `/** … *\/` block immediately
 * above it (which we'll replace).
 */
function findSchemaExports(source: string): SchemaExport[] {
  const lines = source.split(/\r?\n/);
  const out: SchemaExport[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const objMatch = /^export\s+const\s+([a-zA-Z_$][\w$]*Schema)\s*=/.exec(
      line
    );
    const enumMatch = /^export\s+enum\s+([A-Z][\w$]*)/.exec(line);
    if (!objMatch && !enumMatch) continue;

    const identifier = (objMatch ?? enumMatch)![1];
    const kind: SchemaExport[`kind`] = objMatch ? `object` : `enum`;
    const { displayName, docName } = derivedNamesFor(identifier, kind);

    // Walk backwards to find a preceding `/** … *\/` block.
    let blockStart = i;
    let blockCount = 0;
    let j = i - 1;
    // Skip blank lines.
    while (j >= 0 && lines[j].trim().length === 0) j--;
    if (j >= 0 && /\*\//.test(lines[j])) {
      // Found end of a block — walk up to find its start.
      let k = j;
      while (k >= 0 && !/^\s*\/\*\*/.test(lines[k])) k--;
      if (k >= 0) {
        blockStart = k;
        blockCount = j - k + 1;
      }
    } else if (j >= 0 && /^\s*\/\/\s*https?:\/\//.test(lines[j])) {
      // Pre-existing single-line `// https://discord.com/...` URL comment
      // adjacent to the export. The new block-level JSDoc supersedes it,
      // so we treat it as the existing block and replace it.
      blockStart = j;
      blockCount = 1;
    }

    out.push({
      identifier,
      kind,
      derivedDocName: docName,
      displayName,
      blockStartLine: blockStart,
      blockLineCount: blockCount
    });
  }

  return out;
}

/**
 * Translate a schema/enum identifier to candidate doc-object names.
 *
 * Examples:
 *   userSchema             → "User"
 *   activityFlagsSchema    → "Activity Flags"
 *   userFlag (bitfield)    → "User Flags"
 *   PremiumType            → "Premium Type"
 *
 * The display name is the codebase's preferred spelling (PascalCase
 * words separated by spaces). The doc name passed to the matcher is the
 * same string; the matcher already tolerates "Object"/"Structure"/"Enum"
 * suffixes on the doc side.
 */
function derivedNamesFor(
  identifier: string,
  kind: SchemaExport[`kind`]
): { displayName: string; docName: string } {
  let stem = identifier;
  if (kind === `object`) {
    stem = stem.replace(/Schema$/, ``);
  }
  // Convert camelCase / PascalCase to space-separated PascalCase words.
  const display = stem
    .replace(/^[a-z]/, (c) => c.toUpperCase())
    .replace(/([a-z])([A-Z])/g, `$1 $2`)
    .replace(/([A-Z]+)([A-Z][a-z])/g, `$1 $2`)
    .replace(/\s+/g, ` `)
    .trim();
  return { displayName: display, docName: display };
}

// ─── doc lookup ────────────────────────────────────────────────────────────

function findObjectByName(
  objects: PageObject[],
  name: string,
  preferPagesInOrder: string[]
): { object: DocObject; page: string } | null {
  const variants = nameVariants(name);
  const candidates = objects.filter((o) => {
    const docName = normalizeName(stripSuffixes(o.object.name));
    return variants.includes(docName);
  });
  if (candidates.length === 0) return null;
  // Prefer the first page in preferPagesInOrder where we found a match.
  for (const page of preferPagesInOrder) {
    const c = candidates.find((x) => x.page === page);
    if (c) return c;
  }
  return candidates[0];
}

function findEnumByName(
  enums: PageEnum[],
  name: string,
  preferPagesInOrder: string[]
): { enum: DocEnum; page: string } | null {
  const variants = nameVariants(name);
  const candidates = enums.filter((e) => {
    const docName = normalizeName(stripSuffixes(e.enum.name));
    return variants.includes(docName);
  });
  if (candidates.length === 0) return null;
  for (const page of preferPagesInOrder) {
    const c = candidates.find((x) => x.page === page);
    if (c) return c;
  }
  return candidates[0];
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, ` `).trim();
}

/**
 * Produce a set of name variants used for fuzzy matching against doc
 * headings: the original name plus singular/plural forms of the LAST
 * word, plus a folder-prefix variant (e.g. ModerationRule searched as
 * "Auto Moderation Rule" too when folder = "auto-moderation").
 */
function nameVariants(name: string): string[] {
  const variants = new Set<string>();
  const seeds = new Set<string>();
  seeds.add(name);
  // Strip a trailing " Type" suffix — codebase identifiers add it for
  // disambiguation (`ModerationActionType`, `ModerationEventType`) but
  // the doc heading is typically just "Action Types" / "Event Types".
  const noTypeSuffix = name.replace(/ Type$/, ``);
  if (noTypeSuffix !== name) seeds.add(noTypeSuffix);
  // Strip folder-specific identifier components ("Moderation" inside
  // auto-moderation, etc.) before the prefix step.
  // The `[...seeds]` spread is intentional throughout this function: we
  // mutate `seeds` inside each loop and need to iterate over a snapshot
  // so additions aren't re-processed.
  const stripList = FOLDER_STRIP_IDENT[folder] ?? [];
  /* oxlint-disable no-useless-spread */
  for (const s of [...seeds]) {
    for (const word of stripList) {
      const stripped = s
        .replace(new RegExp(`\\b${word}\\b`, `g`), ``)
        .replace(/\s+/g, ` `)
        .trim();
      if (stripped && stripped !== s) seeds.add(stripped);
    }
  }
  const prefix = FOLDER_PREFIX[folder];
  if (prefix) {
    for (const s of [...seeds]) {
      seeds.add(`${prefix} ${s}`);
    }
  }
  const infix = FOLDER_INFIX[folder];
  if (infix) {
    // Insert the infix word after the FIRST word of each seed.
    for (const s of [...seeds]) {
      const parts = s.split(/\s+/);
      if (parts.length === 1) {
        seeds.add(`${parts[0]} ${infix}`);
      } else {
        seeds.add([parts[0], infix, ...parts.slice(1)].join(` `));
      }
    }
  }
  // "Meta" ↔ "Metadata" tolerance.
  for (const s of [...seeds]) {
    if (s.endsWith(`Meta`)) seeds.add(s.replace(/Meta$/, `Metadata`));
  }
  // "Foo" → "Foo Types" / "Foo Type" — Discord's enum headings often
  // append a generic " Types" suffix that the codebase identifier
  // doesn't carry (especially after stripping a folder prefix).
  for (const s of [...seeds]) {
    seeds.add(`${s} Types`);
    seeds.add(`${s} Type`);
  }
  /* oxlint-enable no-useless-spread */

  for (const seed of seeds) {
    const base = normalizeName(seed);
    variants.add(base);
    const parts = base.split(` `);
    const last = parts[parts.length - 1];
    if (last.endsWith(`s`)) {
      parts[parts.length - 1] = last.slice(0, -1);
      variants.add(parts.join(` `));
    } else {
      parts[parts.length - 1] = `${last}s`;
      variants.add(parts.join(` `));
    }
    // `ies` ↔ `y` (e.g. "Activities" ↔ "Activity").
    const fresh = base.split(` `);
    const freshLast = fresh[fresh.length - 1];
    if (freshLast.endsWith(`ies`)) {
      fresh[fresh.length - 1] = `${freshLast.slice(0, -3)}y`;
      variants.add(fresh.join(` `));
    } else if (freshLast.endsWith(`y`)) {
      fresh[fresh.length - 1] = `${freshLast.slice(0, -1)}ies`;
      variants.add(fresh.join(` `));
    }
  }
  return [...variants];
}

function stripSuffixes(name: string): string {
  return name.replace(/\s+(Object|Structure|Enum)\s*$/i, ``).trim();
}

/**
 * Return the supplied docs-derived name if it carries an acronym
 * (any 2+-consecutive-uppercase-letter sequence) that the codebase
 * identifier would have lost in PascalCase splitting (`skuSchema` →
 * "Sku"). Otherwise return null so the caller falls back to the
 * identifier-derived display name.
 */
function preferDocsDisplayName(docsName: string): string | null {
  if (/[A-Z]{2,}/.test(docsName)) return docsName;
  return null;
}

// ─── splice ────────────────────────────────────────────────────────────────

function spliceSchemaBlock(
  source: string,
  exp: SchemaExport,
  newBlock: string
): string {
  const nl = source.includes(`\r\n`) ? `\r\n` : `\n`;
  const lines = source.split(/\r?\n/);
  const newLines = newBlock.split(`\n`);

  if (exp.blockLineCount > 0) {
    // Replace the existing block in place.
    const before = lines.slice(0, exp.blockStartLine);
    const after = lines.slice(exp.blockStartLine + exp.blockLineCount);
    return [...before, ...newLines, ...after].join(nl);
  }

  // Insert before the export line. Walk back past any leading blank lines
  // adjacent to the export so we don't double-pad.
  let insertAt = exp.blockStartLine;
  // Ensure there's a blank line BEFORE the inserted block when preceded
  // by other code.
  const before = lines.slice(0, insertAt);
  const after = lines.slice(insertAt);
  return [...before, ...newLines, ...after].join(nl);
}

/**
 * Pull the prose description out of the existing block JSDoc above an
 * export, if any. Skips an opening "### [Title](...)" heading and any
 * blank separator. Returns "" if there's no usable description.
 */
function extractExistingBlockDescription(
  source: string,
  exp: SchemaExport
): string {
  if (exp.blockLineCount === 0) return ``;
  const lines = source.split(/\r?\n/);
  const blockLines = lines.slice(
    exp.blockStartLine,
    exp.blockStartLine + exp.blockLineCount
  );
  // A single-line `// https://discord.com/...` URL comment carries no
  // description content — it's just a pointer to the docs that the new
  // block link supersedes. Skip extraction.
  if (blockLines.length === 1 && /^\s*\/\/\s*https?:\/\//.test(blockLines[0])) {
    return ``;
  }
  // Preserve paragraph breaks: a line of just ` *` is a paragraph separator.
  const stripped = blockLines.map((line) => {
    // Single-line block /** … */
    const single = /\/\*\*\s*(.*?)\s*\*\//.exec(line);
    if (single) return single[1];
    // Opening /** or closing */
    if (/^\s*\/\*\*\s*$/.test(line)) return null;
    if (/^\s*\*\/\s*$/.test(line)) return null;
    // Interior ` * text` or ` *` (blank)
    const interior = /^\s*\*\s?(.*?)\s*$/.exec(line);
    if (interior) return interior[1];
    return line.trim();
  });
  const paragraphs: string[] = [];
  let current: string[] = [];
  let mode: `prose` | `list` | `quote` = `prose`;
  const flushCurrent = (): void => {
    if (current.length) {
      // List items and blockquote lines each render on their own JSDoc
      // line; prose paragraphs collapse to a single line.
      const joiner = mode === `prose` ? ` ` : `\n`;
      paragraphs.push(current.join(joiner));
      current = [];
      mode = `prose`;
    }
  };
  for (const piece of stripped) {
    if (piece === null) continue;
    if (piece === ``) {
      flushCurrent();
      continue;
    }
    const isListItem = /^\s*[-*]\s+/.test(piece);
    const isBlockquote = /^\s*>/.test(piece);
    const lineMode: `prose` | `list` | `quote` = isBlockquote
      ? `quote`
      : isListItem
        ? `list`
        : `prose`;
    if (lineMode !== mode) {
      flushCurrent();
      mode = lineMode;
    }
    current.push(piece);
  }
  flushCurrent();
  const joined = paragraphs.join(`\n\n`).trim();
  if (!joined) return ``;
  // Strip a leading "### [Title](url)" heading if present.
  return joined.replace(/^###\s+\[[^\]]+\]\([^)]+\)\s*/, ``).trim();
}

// ─── field-level comment refresh ───────────────────────────────────────────

/**
 * Walk an object-schema's body in the source and refresh each field's
 * preceding JSDoc comment from the doc field description.
 *
 * Merge rules (CAREFUL MERGE — biased toward preserving human edits):
 *   - Field has NO existing comment → add one with the doc description.
 *   - Comment is the *literal* doc description (with our standard
 *     transforms applied) → no change.
 *   - Comment is "the X" / "the X (max N characters)" style that's
 *     just a verbose restatement of the doc text → no change.
 *   - Comment carries directives we can't fabricate (deprecated, see,
 *     example, remarks, default, or a code-formatted value placeholder)
 *     → no change.
 *   - Comment differs meaningfully from the doc → WARN and do nothing
 *     (don't clobber a curated comment).
 *
 * Transforms applied to doc descriptions before comparison/emission:
 *   - snake_case identifiers inside backticks are camelCased to match
 *     our codebase. UPPER_CASE constants and paths are left alone.
 *   - Internal links to /developers/... are flattened to their display
 *     text. External links are preserved.
 *
 * Returns the possibly modified source.
 */
function refreshSchemaFieldComments(
  source: string,
  exp: SchemaExport,
  docFields: DocField[],
  file: string
): string {
  const lines = source.split(/\r?\n/);
  const nl = source.includes(`\r\n`) ? `\r\n` : `\n`;
  // Find the export line again (it may have shifted by the block splice).
  const exportRe = new RegExp(
    `^export\\s+const\\s+` + exp.identifier + `\\s*=`
  );
  const exportLineIdx = lines.findIndex((l) => exportRe.test(l));
  if (exportLineIdx < 0) return source;

  // Walk the v.object(...) body. We treat each field as either:
  //   - existing JSDoc lines (single- or multi-line block comment above)
  //   - a field declaration line: fieldName: ... at object depth 1
  //     (one indent in from the column of the export). We use brace
  //     depth to track scope precisely.
  let braceDepth = 0;
  let parenDepth = 0;
  let inObject = false;
  // The first `v.object({` starts the schema body.
  const fieldByName = new Map<string, DocField>();
  for (const f of docFields) fieldByName.set(f.name, f);

  const updates: { line: number; newComment: string[] }[] = [];

  for (let i = exportLineIdx; i < lines.length; i++) {
    const line = lines[i];
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === `{`) braceDepth++;
      else if (ch === `}`) braceDepth--;
      else if (ch === `(`) parenDepth++;
      else if (ch === `)`) parenDepth--;
    }
    if (!inObject) {
      // First time we encounter brace depth ≥ 1 we're inside the body.
      if (braceDepth >= 1) inObject = true;
      else continue;
    }
    if (braceDepth === 0) break; // closing brace of v.object body
    // Only consider lines AT the immediate object depth (braceDepth 1
    // when we're scanning, since the line was already counted). Anything
    // deeper is a nested object/array.
    if (braceDepth !== 1) continue;

    // A field declaration line at depth 1 looks like `  fieldName: ...`
    // or `  fieldName?: ...`. There may be inline `/** ... */` on the
    // same line preceding the field.
    const inlineMatch =
      /^(\s*)(?:\/\*\*\s*(.*?)\s*\*\/\s*)?([a-zA-Z_$][\w$]*)\s*:/.exec(line);
    if (!inlineMatch) continue;
    const fieldName = inlineMatch[3];
    const docField = fieldByName.get(fieldName);
    if (!docField) continue;

    // Find existing comment for this field: either an inline `/** */` on
    // the same line, or a multi-line block on preceding lines.
    let existingComment: string | null = null;
    let existingLineStart = i;
    let existingLineCount = 0;

    if (inlineMatch[2] !== undefined) {
      // Single-line inline block: `  /** text */ fieldName: ...`
      existingComment = inlineMatch[2];
      // We won't rewrite same-line inline comments — they're idiomatic
      // and rare. If we need to update, leave a TODO for the human.
      // Skip the no-op update path; only emit when meaningfully different.
    } else {
      // Walk backwards for a preceding `/** */` block.
      let j = i - 1;
      while (j >= 0 && lines[j].trim().length === 0) j--;
      if (j >= 0 && /\*\//.test(lines[j])) {
        let k = j;
        while (k >= 0 && !/^\s*\/\*\*/.test(lines[k])) k--;
        if (k >= 0) {
          const blockLines = lines.slice(k, j + 1);
          existingComment = extractCommentText(blockLines);
          existingLineStart = k;
          existingLineCount = j - k + 1;
        }
      }
    }

    const desired = transformDocDescription(docField.description);
    if (!desired) continue;

    const decision = decideMerge(existingComment, desired);
    if (decision.kind === `skip`) continue;
    if (decision.kind === `conflict`) {
      console.warn(
        `WARN ${file}::${exp.identifier}.${fieldName}: existing comment conflicts with doc — kept yours.\n  yours: ${JSON.stringify(existingComment)}\n  docs:  ${JSON.stringify(desired)}`
      );
      continue;
    }

    // decision.kind === "replace" or "add"
    const indent = inlineMatch[1];
    const newComment = renderFieldComment(desired, indent);
    if (existingLineCount > 0) {
      updates.push({
        line: existingLineStart,
        newComment
      });
      // We'll replace existingLineCount lines starting at existingLineStart.
      // Encode that by also tracking lineCount on the update entry.
      (updates[updates.length - 1] as { lineCount?: number }).lineCount =
        existingLineCount;
    } else {
      // No existing comment — insert at the field's line.
      updates.push({ line: i, newComment });
      (updates[updates.length - 1] as { lineCount?: number }).lineCount = 0;
    }
  }

  if (updates.length === 0) return source;

  // Apply updates in reverse so earlier line numbers stay valid.
  updates.sort((a, b) => b.line - a.line);
  let newLines = [...lines];
  for (const u of updates) {
    const lineCount = (u as { lineCount?: number }).lineCount ?? 0;
    const before = newLines.slice(0, u.line);
    const after = newLines.slice(u.line + lineCount);
    newLines = [...before, ...u.newComment, ...after];
  }
  return newLines.join(nl);
}

/**
 * Walk an export-enum body and refresh each member's preceding JSDoc
 * comment from the doc enum's row descriptions.
 *
 * Merge rules: same as for object fields. Mapping member → row is by
 * normalized name (UPPER_SNAKE ↔ "Upper Snake" tolerant). We also try
 * exact name match first since some doc tables use the wire-format
 * UPPER_SNAKE_CASE in the Name column.
 */
function refreshEnumMemberComments(
  source: string,
  exp: SchemaExport,
  docEnum: DocEnum,
  file: string
): string {
  const lines = source.split(/\r?\n/);
  const nl = source.includes(`\r\n`) ? `\r\n` : `\n`;
  const exportRe = new RegExp(`^export\\s+enum\\s+` + exp.identifier + `\\b`);
  const exportLineIdx = lines.findIndex((l) => exportRe.test(l));
  if (exportLineIdx < 0) return source;

  // Build a lookup by normalized member name.
  const rowByName = new Map<string, string>();
  for (const r of docEnum.rows) {
    if (!r.description) continue;
    const desc = r.description.trim();
    if (!desc) continue;
    // Try several key forms.
    rowByName.set(normalizeEnumMember(r.name), desc);
    rowByName.set(normalizeEnumMember(r.value), desc);
  }
  if (rowByName.size === 0) return source;

  const updates: { line: number; newComment: string[]; lineCount: number }[] =
    [];

  let braceDepth = 0;
  let inEnum = false;
  for (let i = exportLineIdx; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === `{`) braceDepth++;
      else if (ch === `}`) braceDepth--;
    }
    if (!inEnum) {
      if (braceDepth >= 1) inEnum = true;
      else continue;
    }
    if (braceDepth === 0) break;
    if (braceDepth !== 1) continue;

    const memberMatch = /^(\s*)([A-Z][\w$]*)\s*=/.exec(line);
    if (!memberMatch) continue;
    const memberName = memberMatch[2];
    const desc =
      rowByName.get(normalizeEnumMember(memberName)) ??
      rowByName.get(memberName);
    if (!desc) continue;

    // Find existing comment immediately above.
    let existingComment: string | null = null;
    let existingLineStart = i;
    let existingLineCount = 0;
    let j = i - 1;
    while (j >= 0 && lines[j].trim().length === 0) j--;
    if (j >= 0 && /\*\//.test(lines[j])) {
      let k = j;
      while (k >= 0 && !/^\s*\/\*\*/.test(lines[k])) k--;
      if (k >= 0) {
        const blockLines = lines.slice(k, j + 1);
        existingComment = extractCommentText(blockLines);
        existingLineStart = k;
        existingLineCount = j - k + 1;
      }
    }

    const desired = transformDocDescription(desc);
    if (!desired) continue;
    const decision = decideMerge(existingComment, desired);
    if (decision.kind === `skip`) continue;
    if (decision.kind === `conflict`) {
      console.warn(
        `WARN ${file}::${exp.identifier}.${memberName}: existing comment conflicts with doc — kept yours.\n  yours: ${JSON.stringify(existingComment)}\n  docs:  ${JSON.stringify(desired)}`
      );
      continue;
    }
    const indent = memberMatch[1];
    const newComment = renderFieldComment(desired, indent);
    updates.push({
      line: existingLineCount > 0 ? existingLineStart : i,
      newComment,
      lineCount: existingLineCount
    });
  }

  if (updates.length === 0) return source;
  updates.sort((a, b) => b.line - a.line);
  let newLines = [...lines];
  for (const u of updates) {
    const before = newLines.slice(0, u.line);
    const after = newLines.slice(u.line + u.lineCount);
    newLines = [...before, ...u.newComment, ...after];
  }
  return newLines.join(nl);
}

/**
 * Extract the prose text from a JSDoc block. Multi-line blocks have a
 * leading asterisk on each interior line; single-line blocks fit on one
 * row. Returns the joined prose with whitespace collapsed.
 */
function extractCommentText(blockLines: string[]): string {
  if (blockLines.length === 1) {
    const single = /\/\*\*\s*(.*?)\s*\*\//.exec(blockLines[0]);
    return single ? single[1].trim() : ``;
  }
  const parts: string[] = [];
  for (const line of blockLines) {
    const m = /^\s*\*?\/?\*?\*?\s?(.*?)\s*$/.exec(line);
    if (!m) continue;
    let text = m[1];
    // Strip leading ` * `.
    text = text.replace(/^\*\s?/, ``);
    if (text === `/`) continue; // closing `*/`
    if (/^\/\*\*\s*$/.test(line.trim())) continue; // opening `/**`
    parts.push(text);
  }
  return parts.join(` `).replace(/\s+/g, ` `).trim();
}

/**
 * Apply transforms to a doc-derived field description to align with
 * codebase conventions before comparison/emission:
 *   - Snake-case identifiers in `inlineCode` get camel-cased
 *     (`approximate_member_count` → `approximateMemberCount`),
 *     BUT only when they look like JS identifiers (no slashes, dots,
 *     spaces, or upper-case letters that suggest a constant or path).
 *   - Internal `/developers/...` markdown links are flattened to their
 *     display text — those are docs-only cross-references we'd otherwise
 *     turn into Pass 2b cross-refs.
 *   - Whitespace is collapsed.
 */
function transformDocDescription(input: string): string {
  let out = input.trim();
  // Flatten internal markdown links: [text](/developers/...) → text
  out = out.replace(
    /\[([^\]]+)\]\(\/developers\/[^)]+\)/g,
    (_, text: string) => text
  );
  // CamelCase snake_case identifiers inside backticks.
  out = out.replace(/`([a-z][a-z0-9_]+)`/g, (m, ident: string) => {
    if (!ident.includes(`_`)) return m;
    const camel = ident.replace(/_([a-z0-9])/g, (_, c: string) =>
      c.toUpperCase()
    );
    return `\`${camel}\``;
  });
  return out.replace(/\s+/g, ` `).trim();
}

type MergeDecision = { kind: `skip` | `conflict` | `replace` | `add` };

/**
 * Decide whether to replace `existing` with `desired`, leave it alone,
 * or warn the human. The bias is *strongly* toward preserving existing
 * comments — we only rewrite when they're obviously stale (literally
 * empty) or when the docs version differs only cosmetically.
 */
function decideMerge(existing: string | null, desired: string): MergeDecision {
  if (!existing) return { kind: `add` };
  const e = normalizeCompare(existing);
  const d = normalizeCompare(desired);
  if (e === d) return { kind: `skip` };
  // If existing carries JSDoc directives, don't touch it — that prose
  // was hand-curated.
  if (
    /@(deprecated|see|example|remarks|default|param|returns)/i.test(existing)
  ) {
    return { kind: `skip` };
  }
  // If existing is a strict superset (contains the desired text), it was
  // augmented intentionally — keep it.
  if (e.includes(d)) return { kind: `skip` };
  // Treat everything else as a conflict — let the human resolve.
  return { kind: `conflict` };
}

function normalizeCompare(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\s.,]+/g, ` `)
    .trim();
}

function normalizeEnumMember(name: string): string {
  return name
    .toUpperCase()
    .replace(/[\s-]+/g, `_`)
    .replace(/[^A-Z0-9_]/g, ``)
    .trim();
}

function renderFieldComment(text: string, indent: string): string[] {
  // For short comments (under ~80 chars including indent), emit a single
  // line. Otherwise emit a multi-line block.
  const oneLine = `${indent}/** ${text} */`;
  if (oneLine.length <= 100 && !text.includes(`\n`)) return [oneLine];
  // Multi-line.
  const wrapped = text.split(/\n/).flatMap((para) => {
    // Soft-wrap at ~80 chars while preserving sentence boundaries — but
    // since the description is typically short, just emit each paragraph
    // as a single line.
    return [`${indent} * ${para}`];
  });
  return [`${indent}/**`, ...wrapped, `${indent} */`];
}

// ─── endpoint param schema refresh ─────────────────────────────────────────

/**
 * For endpoint files at the folder root, look for an exported
 * `xxxSchema = v.object({ body|params|form: ... })` and refresh the
 * field-level JSDoc inside each of those nested sub-objects against
 * the matching DocEndpoint's jsonParams/queryParams/formParams.
 */
function refreshEndpointParamSchemas(
  source: string,
  file: string,
  endpoints: DocEndpoint[]
): string {
  const lines = source.split(/\r?\n/);

  // Identify the endpoint by the top JSDoc heading title (same trick as
  // diff-jsdoc.ts). We tolerate the case where there's no JSDoc match —
  // a file without a recognizable heading is left untouched.
  const topHeadingMatch = source.match(/\*\s+###\s+\[([^\]]+)\]/);
  if (!topHeadingMatch) return source;
  const title = topHeadingMatch[1].trim();
  const endpoint = endpoints.find((ep) => ep.name === title);
  if (!endpoint) return source;

  // Find the exported schema object. Endpoint files typically have
  // exactly one `export const xxxSchema = v.object({` line; we operate
  // on that.
  const schemaLineIdx = lines.findIndex((l) =>
    /^export\s+const\s+[a-zA-Z_$][\w$]*Schema\s*=/.test(l)
  );
  if (schemaLineIdx < 0) return source;

  // Walk into the v.object body. We track brace depth and look for
  // top-level field keys: body|params|form. For each, find the inner
  // v.object body that holds the actual field declarations.
  const sections: {
    fieldKey: `body` | `params` | `form`;
    innerOpenLine: number;
    innerCloseLine: number;
  }[] = [];

  let braceDepth = 0;
  let inSchemaBody = false;
  let pendingFieldKey: `body` | `params` | `form` | null = null;
  let pendingDepth = -1;

  for (let i = schemaLineIdx; i < lines.length; i++) {
    const line = lines[i];

    // Detect a top-level field key on this line before consuming braces.
    if (inSchemaBody && braceDepth === 1) {
      const keyMatch = /^\s*(body|params|form)\s*:/.exec(line);
      if (keyMatch) {
        pendingFieldKey = keyMatch[1] as `body` | `params` | `form`;
        pendingDepth = braceDepth;
      }
    }

    for (const ch of line) {
      if (ch === `{`) {
        braceDepth++;
        if (
          inSchemaBody &&
          pendingFieldKey &&
          braceDepth > pendingDepth + 1 &&
          !sections.some((s) => s.fieldKey === pendingFieldKey)
        ) {
          // Hit the INNER `v.object({` for this field key.
          sections.push({
            fieldKey: pendingFieldKey,
            innerOpenLine: i,
            innerCloseLine: -1
          });
        }
      } else if (ch === `}`) {
        braceDepth--;
        // Close out the matching inner brace if any.
        for (const s of sections) {
          if (s.innerCloseLine === -1 && braceDepth === pendingDepth + 1) {
            s.innerCloseLine = i;
            pendingFieldKey = null;
          }
        }
      }
    }
    if (!inSchemaBody) {
      if (braceDepth >= 1) inSchemaBody = true;
    } else if (braceDepth === 0) break;
  }

  if (sections.length === 0) return source;

  // For each section, build a SchemaExport-shaped object and reuse the
  // existing field-refresh logic. We need a DocField[] for each section.
  let updated = source;
  for (const sec of sections) {
    const groups: DocFieldGroup[] =
      sec.fieldKey === `body`
        ? endpoint.jsonParams
        : sec.fieldKey === `params`
          ? endpoint.queryParams
          : endpoint.formParams;
    if (!groups || groups.length === 0) continue;
    // Use the first (variant-less) group. Endpoint variants are rare
    // and not common in this codebase.
    const docFields = groups[0].fields;

    // Build a synthetic SchemaExport for refreshSchemaFieldComments.
    // The function only uses `identifier` (regex anchor) and `kind`
    // ("object"). The block start/count are unused for field refresh.
    // We need to scope the walk to the inner range, so we pass a custom
    // anchor by temporarily replacing the slice we care about.
    updated = refreshNestedFieldComments(
      updated,
      sec.innerOpenLine,
      sec.innerCloseLine,
      docFields,
      `${file}#${sec.fieldKey}`
    );
  }
  return updated;
}

/**
 * Variant of refreshSchemaFieldComments that operates on a known
 * line range (inner v.object body), instead of locating it by export
 * identifier. Used for nested body/params/form sub-schemas.
 */
function refreshNestedFieldComments(
  source: string,
  innerOpenLine: number,
  innerCloseLine: number,
  docFields: DocField[],
  ctx: string
): string {
  const lines = source.split(/\r?\n/);
  const nl = source.includes(`\r\n`) ? `\r\n` : `\n`;

  if (innerCloseLine < 0 || innerOpenLine < 0) return source;

  const fieldByName = new Map<string, DocField>();
  for (const f of docFields) fieldByName.set(f.name, f);

  const updates: { line: number; newComment: string[]; lineCount: number }[] =
    [];

  // Walk inside the inner v.object body — between innerOpenLine and
  // innerCloseLine. Field declarations sit at brace-depth 1 RELATIVE to
  // the inner open brace.
  let braceDepth = 0;
  for (let i = innerOpenLine; i <= innerCloseLine; i++) {
    const line = lines[i];

    // Track depth before considering this line as a field declaration.
    const beforeDepth = braceDepth;
    for (const ch of line) {
      if (ch === `{`) braceDepth++;
      else if (ch === `}`) braceDepth--;
    }

    if (i === innerOpenLine) continue; // skip the opening brace line itself
    if (i === innerCloseLine) continue;
    if (beforeDepth !== 1) continue; // only direct fields

    const inlineMatch =
      /^(\s*)(?:\/\*\*\s*(.*?)\s*\*\/\s*)?([a-zA-Z_$][\w$]*)\s*:/.exec(line);
    if (!inlineMatch) continue;
    const fieldName = inlineMatch[3];
    const docField = fieldByName.get(fieldName);
    if (!docField) continue;

    let existingComment: string | null = null;
    let existingLineStart = i;
    let existingLineCount = 0;

    if (inlineMatch[2] !== undefined) {
      existingComment = inlineMatch[2];
    } else {
      let j = i - 1;
      while (j >= 0 && lines[j].trim().length === 0) j--;
      if (j >= 0 && /\*\//.test(lines[j])) {
        let k = j;
        while (k >= 0 && !/^\s*\/\*\*/.test(lines[k])) k--;
        if (k >= 0) {
          const blockLines = lines.slice(k, j + 1);
          existingComment = extractCommentText(blockLines);
          existingLineStart = k;
          existingLineCount = j - k + 1;
        }
      }
    }

    const desired = transformDocDescription(docField.description);
    if (!desired) continue;
    const decision = decideMerge(existingComment, desired);
    if (decision.kind === `skip`) continue;
    if (decision.kind === `conflict`) {
      console.warn(
        `WARN ${ctx}.${fieldName}: existing comment conflicts with doc — kept yours.\n  yours: ${JSON.stringify(existingComment)}\n  docs:  ${JSON.stringify(desired)}`
      );
      continue;
    }
    const indent = inlineMatch[1];
    const newComment = renderFieldComment(desired, indent);
    updates.push({
      line: existingLineCount > 0 ? existingLineStart : i,
      newComment,
      lineCount: existingLineCount
    });
  }

  if (updates.length === 0) return source;
  updates.sort((a, b) => b.line - a.line);
  let newLines = [...lines];
  for (const u of updates) {
    const before = newLines.slice(0, u.line);
    const after = newLines.slice(u.line + u.lineCount);
    newLines = [...before, ...u.newComment, ...after];
  }
  return newLines.join(nl);
}

// ─── diff (minimal) ───────────────────────────────────────────────────────

function quickDiff(path: string, oldText: string, newText: string): string {
  // We don't need a real LCS diff — just show the new text alongside the
  // file header so the reviewer can eyeball what changed. The volume of
  // schemas is large enough that a per-export summary is more useful
  // than a full unified diff.
  const oldLen = oldText.split(/\r?\n/).length;
  const newLen = newText.split(/\r?\n/).length;
  return [
    `--- a/${path} (${oldLen} lines)`,
    `+++ b/${path} (${newLen} lines)`,
    `@@ schema block(s) replaced @@`
  ].join(`\n`);
}
