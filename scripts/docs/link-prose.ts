/**
 * P2b: Cross-reference linker.
 *
 * Scans every `*.ts` file under packages/client/src for unlinked
 * mentions of types we have schemas/interfaces for and wraps them as
 * `{@link Name | display}` JSDoc references.
 *
 * Approach: harvest the EXISTING `{@link Name | display}` corpus from
 * the codebase and use it as the registry of approved display phrases.
 * This is conservative — we only emit references the codebase already
 * endorses elsewhere, so the risk of false positives is low and we
 * don't need to invent phrase-mapping heuristics.
 *
 * Usage:
 *   node --experimental-strip-types scripts/docs/link-prose.ts [folder] [--write]
 *
 * Without a folder argument, runs across packages/client/src.
 *
 * Algorithm:
 *   1. Harvest registry: walk every existing `{@link Name | display}`
 *      reference. Group by normalized display key (lowercased, plural
 *      and "object"/"objects" suffix tolerated).
 *   2. For each `.ts` file, scan only the JSDoc comments and:
 *      a. Split lines into segments: protected (URLs, code spans,
 *         existing `{@link ...}`, the `### [Heading](url)` line of
 *         schema blocks) and editable.
 *      b. Within editable segments, find the longest registered
 *         display phrase that occurs, longest-first to avoid shadowing.
 *      c. Replace with `{@link Name | match}`. Skip the file's OWN
 *         declared type (don't self-link Member.ts to {@link Member}).
 *
 * The tool is line-oriented for diff stability and skip non-JSDoc
 * regions entirely — type annotations like `: Channel[]` shouldn't be
 * touched.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), `../..`);
const CLIENT_SRC = join(PROJECT_ROOT, `packages/client/src`);

const args = process.argv.slice(2);
const writeMode = args.includes(`--write`);
const folderArg = args.find((a) => !a.startsWith(`--`));

function main(): void {
  const allFiles = walkTsFiles(CLIENT_SRC);
  const registry = buildRegistry(allFiles);
  // Sort phrases longest-first so "guild member object" matches before
  // "guild member" / "member".
  const phrases = [...registry.keys()].sort((a, b) => b.length - a.length);

  const scope = folderArg
    ? join(CLIENT_SRC, folderArg)
    : CLIENT_SRC;
  const files = walkTsFiles(scope);

  let changed = 0;
  let skipped = 0;
  for (const file of files) {
    const source = readFileSync(file, `utf8`);
    const ownType = inferOwnType(file);
    const updated = linkProseInFile(source, registry, phrases, ownType);
    if (updated === source) {
      skipped++;
      continue;
    }
    if (writeMode) {
      writeFileSync(file, updated, `utf8`);
    } else {
      reportDiff(file, source, updated);
    }
    changed++;
  }

  const verb = writeMode ? `changed` : `would change`;
  console.error(
    `\n${changed} file(s) ${verb}; ${skipped} skipped; registry size = ${registry.size} phrases.`
  );
}

// ─── registry ──────────────────────────────────────────────────────────────

/**
 * Map from a normalized display phrase to the canonical type Name we
 * link it as. Phrases are lowercased, whitespace-collapsed, and any
 * trailing " object"/" objects" is stripped to consolidate variants.
 */
function buildRegistry(files: string[]): Map<string, string> {
  const counts = new Map<string, Map<string, number>>();
  const re = /\{@link\s+([A-Z][\w$]*)\s*\|\s*([^}]+?)\s*\}/g;
  for (const file of files) {
    const source = readFileSync(file, `utf8`);
    let m: RegExpExecArray | null;
    while ((m = re.exec(source)) !== null) {
      const name = m[1];
      const rawDisplay = m[2].trim();
      const key = normalizePhrase(rawDisplay);
      if (!key) continue;
      const byName = counts.get(key) ?? new Map<string, number>();
      byName.set(name, (byName.get(name) ?? 0) + 1);
      counts.set(key, byName);
    }
  }
  // For each phrase pick the most-frequent Name. Ties are rare but
  // resolved by alphabetical Name (deterministic).
  const registry = new Map<string, string>();
  for (const [phrase, byName] of counts) {
    const top = [...byName.entries()].sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })[0];
    registry.set(phrase, top[0]);
  }
  return registry;
}

/**
 * Strip "object"/"objects" suffix (tolerating singular and plural)
 * and lowercase/whitespace-normalize. Returns "" if the phrase looks
 * uninformative (e.g. just "object", a single-letter, or carrying
 * code spans we'd want to keep verbatim).
 */
const BLOCKLIST = new Set<string>([
  `level`,
  `flags`,
  `application`,
  `id`,
  `name`,
  `type`,
  `data`,
  `widget`,
  // too easy to match in prose like "every member of"; require longer
  // multi-word phrases for these
  `member`
]);

function normalizePhrase(display: string): string {
  let p = display.trim().toLowerCase().replace(/\s+/g, ` `);
  // Strip trailing " object" / " objects" so "channel" and "channel
  // object" register as the same phrase.
  p = p.replace(/\s+objects?$/, ``).trim();
  if (!p) return ``;
  if (p.length < 3) return ``;
  // Avoid phrases that include inline code or markdown links — they
  // are too template-y to match anywhere else.
  if (p.includes(`\``) || p.includes(`[`)) return ``;
  // Avoid linking generic English words.
  if (BLOCKLIST.has(p)) return ``;
  // CONSERVATIVE: only register multi-word phrases. Single-word
  // mentions like "guild" or "user" are too easily confused with
  // natural English, possessive forms, or protocol/event names
  // ("Guild Member Add Gateway event"). We can revisit case-by-case
  // later if a particular single-word type is worth linking.
  if (!p.includes(` `)) return ``;
  return p;
}

// ─── per-file rewrite ──────────────────────────────────────────────────────

/**
 * Walk JSDoc blocks in `source`. Within each block, split each line
 * into protected and editable segments and replace longest-first
 * matches of registry phrases.
 */
function linkProseInFile(
  source: string,
  registry: Map<string, string>,
  phrases: string[],
  ownType: string | null
): string {
  const lines = source.split(/\r?\n/);
  const nl = source.includes(`\r\n`) ? `\r\n` : `\n`;
  let inJsDoc = false;
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedStart = line.trimStart();
    if (!inJsDoc) {
      if (/^\/\*\*/.test(trimmedStart)) {
        // Single-line block.
        if (/\*\//.test(trimmedStart.slice(3))) {
          const replaced = rewriteJsDocLine(line, registry, phrases, ownType);
          if (replaced !== line) {
            lines[i] = replaced;
            changed = true;
          }
        } else {
          inJsDoc = true;
        }
      }
      continue;
    }
    // We're inside a multi-line JSDoc block.
    if (/\*\//.test(trimmedStart)) {
      inJsDoc = false;
      continue;
    }
    const replaced = rewriteJsDocLine(line, registry, phrases, ownType);
    if (replaced !== line) {
      lines[i] = replaced;
      changed = true;
    }
  }
  return changed ? lines.join(nl) : source;
}

/**
 * Rewrite a single JSDoc line, leaving protected regions (URLs, code
 * spans, existing `{@link ...}`, the `### [Heading](url)` markdown
 * link) untouched and replacing registered display phrases inside
 * the editable text.
 */
function rewriteJsDocLine(
  line: string,
  registry: Map<string, string>,
  phrases: string[],
  ownType: string | null
): string {
  // Split into segments — same idea as Pass 2a's `preserveCrossRefs`
  // segment-split fix. Also protect Gateway-event-name phrases like
  // "Thread Members Update Gateway event" — those are protocol names,
  // not type references.
  // Protected segments are:
  //   - existing {@link ...}
  //   - inline code spans `...`
  //   - markdown bold spans **...** (we don't want to break a bolded
  //     sub-heading like **Example Activity Instance** by linking the
  //     phrase inside it)
  //   - markdown link URLs ](...) / [text](url)
  //   - Gateway event names: any Title-Case run leading up to "Gateway
  //     event(s)". Discord's event names are sequences of capitalized
  //     words ("Thread Members Update Gateway event"). To catch ones
  //     with intervening short connectives ("Thread Members Update and
  //     a Thread Create Gateway event"), we protect everything from
  //     the FIRST Title-Case-Word back-to-back run up to "Gateway
  //     event" within a generous window.
  const protectedRe = /\{@link[^}]*\}|`[^`]*`|\*\*[^*]+\*\*|\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|(?:[A-Z][A-Za-z]+\s+){1,8}(?:[a-z]+\s+){0,4}(?:[A-Z][A-Za-z]+\s+){0,5}Gateway\s+events?/g;
  const segments: { text: string; protect: boolean }[] = [];
  let lastIdx = 0;
  let pm: RegExpExecArray | null;
  while ((pm = protectedRe.exec(line)) !== null) {
    if (pm.index > lastIdx) {
      segments.push({ text: line.slice(lastIdx, pm.index), protect: false });
    }
    segments.push({ text: pm[0], protect: true });
    lastIdx = pm.index + pm[0].length;
  }
  if (lastIdx < line.length) {
    segments.push({ text: line.slice(lastIdx), protect: false });
  }
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].protect) continue;
    segments[i].text = rewriteSegment(
      segments[i].text,
      registry,
      phrases,
      ownType
    );
  }
  return segments.map((s) => s.text).join(``);
}

/**
 * For one editable segment, scan for longest-first phrase matches and
 * wrap them in `{@link Name | match}`. Each input position can match
 * at most one phrase (no overlapping rewrites).
 */
function rewriteSegment(
  text: string,
  registry: Map<string, string>,
  phrases: string[],
  ownType: string | null
): string {
  // We do a simple sliding scan: at each position, try each registry
  // phrase longest-first against the lowercased view of the segment.
  // When a match is found, emit the `{@link}` and skip past it.
  const lower = text.toLowerCase();
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    // Word boundary on the left: previous char must be non-word or
    // start of string.
    const prev = i === 0 ? `` : text[i - 1];
    const atWordStart = i === 0 || !/[A-Za-z0-9]/.test(prev);
    let matched = false;
    if (atWordStart) {
      for (const phrase of phrases) {
        if (i + phrase.length > text.length) continue;
        if (lower.slice(i, i + phrase.length) !== phrase) continue;
        // Word boundary on the right.
        const nextIdx = i + phrase.length;
        if (
          nextIdx < text.length &&
          /[A-Za-z0-9]/.test(text[nextIdx])
        ) {
          continue;
        }
        const name = registry.get(phrase)!;
        if (ownType && name === ownType) continue;
        // Use the original text (preserves case) as the display.
        let display = text.slice(i, i + phrase.length);
        // If the next text continues with " object" or " objects",
        // absorb that into the display so "guild member object" links
        // as a single unit instead of "guild member" + " object" tail.
        const tailMatch = /^\s+objects?\b/i.exec(text.slice(nextIdx));
        if (tailMatch) {
          display = text.slice(i, nextIdx + tailMatch[0].length);
        }
        out.push(`{@link ${name} | ${display}}`);
        i += display.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out.push(text[i]);
      i++;
    }
  }
  return out.join(``);
}

// ─── helpers ───────────────────────────────────────────────────────────────

function walkTsFiles(root: string): string[] {
  const out: string[] = [];
  const visit = (path: string): void => {
    const stat = statSync(path);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(path)) {
        if (entry === `__mocks__` || entry === `__tests__`) continue;
        visit(join(path, entry));
      }
      return;
    }
    if (!path.endsWith(`.ts`)) return;
    if (path.endsWith(`.spec.ts`) || path.endsWith(`.test.ts`)) return;
    if (basename(path) === `index.ts`) return;
    out.push(path);
  };
  visit(root);
  return out;
}

/**
 * Guess the canonical type name this file declares so we don't
 * self-link inside the file's own JSDoc. We use the basename minus
 * extension; "Member.ts" → "Member".
 */
function inferOwnType(file: string): string | null {
  const base = basename(file, `.ts`);
  if (/^[A-Z]/.test(base)) return base;
  return null;
}

function reportDiff(file: string, oldText: string, newText: string): void {
  const rel = file.replace(`${PROJECT_ROOT}\\`, ``).replace(`${PROJECT_ROOT}/`, ``);
  const oldLines = oldText.split(/\r?\n/);
  const newLines = newText.split(/\r?\n/);
  process.stdout.write(`--- a/${rel}\n+++ b/${rel}\n`);
  for (let i = 0; i < oldLines.length; i++) {
    if (oldLines[i] !== newLines[i]) {
      process.stdout.write(`@@ -${i + 1} +${i + 1} @@\n`);
      process.stdout.write(`-${oldLines[i]}\n`);
      process.stdout.write(`+${newLines[i]}\n`);
    }
  }
  process.stdout.write(`\n`);
}

main();
