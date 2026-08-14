/**
 * Gateway-specific docs parser.
 *
 * `parse.ts` is **endpoint-and-object shaped**: it understands `<Route>`
 * components and `| Field | Type | Description |` Structure tables. That covers
 * the REST surface, and it extracts the Gateway's two REST endpoints cleanly.
 * The Gateway is **protocol shaped**, and three of its load-bearing constructs
 * do not fit that model:
 *
 * 1. **Opcodes** carry a `Client Action` column (Send / Receive / Send-Receive).
 *    `tableAsEnum` collapses every table to `(value, name, description)` and
 *    drops it — but direction is what decides whether an opcode is something we
 *    send or something we dispatch on.
 *
 * 2. **Close event codes** use `| Code | Description | Explanation | Reconnect |`
 *    — there is **no `Name` column**. `tableAsEnum`'s column heuristics slide by
 *    one and mis-assign every field (the numeric code lands in `name`, the prose
 *    in `value`). The `Reconnect` column is also dropped, and that boolean is
 *    exactly the resumability predicate the connection layer needs: reconnecting
 *    after `4004`/`4013`/`4014` is a broken-loop bug.
 *
 * 3. **The intent → event map** is a fenced **code block**, not a table:
 *
 *    ```
 *    GUILDS (1 << 0)
 *      - GUILD_CREATE
 *      - GUILD_UPDATE
 *    ```
 *
 *    Table-oriented parsing correctly ignores it. Events gated behind a
 *    *privileged* intent carry a trailing `*`.
 *
 * Rather than widen `parse.ts`'s generic shapes (which every REST folder depends
 * on) this reads the Gateway tables directly. `parse.ts` stays the authority for
 * everything it already handles.
 *
 * Usage as a library:
 *   import { parseGateway } from "./parse-gateway.ts";
 *
 * Usage as a CLI:
 *   node --experimental-strip-types scripts/docs/parse-gateway.ts
 *   node --experimental-strip-types scripts/docs/parse-gateway.ts --json
 */

import { readFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), `../..`);
const DOCS_CACHE = join(PROJECT_ROOT, `.discord-docs`);

const GATEWAY_PAGE = `events/gateway.md`;
const EVENTS_PAGE = `events/gateway-events.md`;
const OPCODES_PAGE = `topics/opcodes-and-status-codes.md`;

// ─── public types ─────────────────────────────────────────────────────────

/** Which side of the connection sends a given opcode. */
export type OpcodeDirection = `send` | `receive` | `both`;

export interface GatewayOpcode {
  code: number;
  /** Doc name, e.g. `Heartbeat ACK`. */
  name: string;
  direction: OpcodeDirection;
  description: string;
}

export interface GatewayCloseCode {
  code: number;
  /** Short label, e.g. `Unknown opcode`. */
  label: string;
  /** Prose explanation of what triggers the close. */
  explanation: string;
  /** Whether Discord says a reconnect should be attempted. */
  reconnect: boolean;
}

export interface GatewayIntent {
  name: string;
  /** The shift in `1 << n`, kept symbolic so codegen can emit `1 << 15`. */
  shift: number;
  value: number;
  /** Event names gated behind this intent. */
  events: string[];
  /**
   * Events the docs flag with a trailing `*` — gated behind a *privileged*
   * intent even though the parent intent is standard.
   */
  privilegedEvents: string[];
}

export interface GatewayEvent {
  /** Doc heading, e.g. `Message Create`. */
  name: string;
  /** Wire name used in a dispatch payload's `t`, e.g. `MESSAGE_CREATE`. */
  wireName: string;
  description: string;
  /** `send` for `## Send Events`, `receive` for `## Receive Events`. */
  direction: `send` | `receive`;
  /** The doc anchor slug, for building the JSDoc heading link. */
  anchor: string;
}

export interface GatewayDoc {
  opcodes: GatewayOpcode[];
  closeCodes: GatewayCloseCode[];
  intents: GatewayIntent[];
  events: GatewayEvent[];
}

// ─── table helpers ────────────────────────────────────────────────────────

/**
 * Split a markdown table row into trimmed cells.
 *
 * Cells may contain escaped pipes (`\|`) inside inline code or links, so split
 * on unescaped pipes only, then unescape.
 */
function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, ``).replace(/\|$/, ``);
  const cells: string[] = [];
  let current = ``;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === `\\` && trimmed[i + 1] === `|`) {
      current += `|`;
      i++;
      continue;
    }
    if (ch === `|`) {
      cells.push(current.trim());
      current = ``;
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

const isSeparatorRow = (line: string): boolean =>
  /^\|?[\s:|-]+\|[\s:|-]*$/.test(line.trim()) && line.includes(`-`);

/**
 * Read the markdown table that follows `heading`, returning its rows as
 * header-keyed records. Returns `[]` when the heading or table is missing so a
 * docs restructure surfaces as an empty extraction rather than a crash — the
 * caller decides whether that is fatal.
 */
function tableAfterHeading(
  markdown: string,
  heading: string
): Array<Record<string, string>> {
  const lines = markdown.split(/\r?\n/);
  const headingIdx = lines.findIndex(
    (l) =>
      l.trim().replace(/^#+\s*/, ``) === heading && l.trim().startsWith(`#`)
  );
  if (headingIdx === -1) return [];

  // Walk forward to the first table row, stopping if we hit the next heading.
  let i = headingIdx + 1;
  while (i < lines.length && !lines[i].trim().startsWith(`|`)) {
    if (lines[i].trim().startsWith(`#`)) return [];
    i++;
  }
  if (i >= lines.length) return [];

  const header = splitRow(lines[i]).map((c) => c.toLowerCase());
  i++;
  if (i < lines.length && isSeparatorRow(lines[i])) i++;

  const rows: Array<Record<string, string>> = [];
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith(`|`)) break;
    const cells = splitRow(line);
    const row: Record<string, string> = {};
    header.forEach((key, idx) => {
      row[key] = cells[idx] ?? ``;
    });
    rows.push(row);
  }
  return rows;
}

/** Strip markdown links/inline-code down to their display text. */
const plainText = (value: string): string =>
  value
    .replace(/\[([^\]]+)\]\([^)]*\)/g, `$1`)
    .replace(/\s+/g, ` `)
    .trim();

// ─── opcodes ──────────────────────────────────────────────────────────────

const parseDirection = (clientAction: string): OpcodeDirection => {
  const normalized = clientAction.toLowerCase();
  const send = normalized.includes(`send`);
  const receive = normalized.includes(`receive`);
  if (send && receive) return `both`;
  return send ? `send` : `receive`;
};

export function parseOpcodes(markdown: string): GatewayOpcode[] {
  return tableAfterHeading(markdown, `Gateway Opcodes`)
    .filter((row) => /^\d+$/.test(row.code ?? ``))
    .map((row) => ({
      code: Number(row.code),
      name: plainText(row.name ?? ``),
      direction: parseDirection(row[`client action`] ?? ``),
      description: plainText(row.description ?? ``)
    }));
}

// ─── close codes ──────────────────────────────────────────────────────────

export function parseCloseCodes(markdown: string): GatewayCloseCode[] {
  return tableAfterHeading(markdown, `Gateway Close Event Codes`)
    .filter((row) => /^\d+$/.test(row.code ?? ``))
    .map((row) => ({
      code: Number(row.code),
      label: plainText(row.description ?? ``),
      explanation: plainText(row.explanation ?? ``),
      // Anything not explicitly "true" is treated as non-reconnectable: the
      // failure mode of a wrongly-permitted reconnect is an infinite loop
      // against Discord, which is far worse than a conservative disconnect.
      reconnect: (row.reconnect ?? ``).trim().toLowerCase() === `true`
    }));
}

// ─── intents ──────────────────────────────────────────────────────────────

/**
 * The intent list is a fenced code block under `### List of Intents`, shaped:
 *
 * ```
 * GUILDS (1 << 0)
 *   - GUILD_CREATE
 *   - THREAD_MEMBERS_UPDATE *
 * ```
 *
 * A trailing `*` marks an event that additionally requires a privileged intent.
 */
export function parseIntents(markdown: string): GatewayIntent[] {
  // The fence info string is arbitrary text, not just a language tag —
  // Mintlify emits ```` ```json theme={"system"} ````. Consume to end of line
  // or the trailing attributes get captured as the block's first content line.
  const blocks = markdown.matchAll(/```[^\n]*\n([\s\S]*?)```/g);
  const intents: GatewayIntent[] = [];

  for (const [, body] of blocks) {
    // Only blocks whose first meaningful line looks like `NAME (1 << n)`.
    if (!/^\s*[A-Z_]+\s*\(1 <<\s*\d+\s*\)/m.test(body)) continue;

    let current: GatewayIntent | null = null;
    for (const line of body.split(/\r?\n/)) {
      const header = /^([A-Z_]+)\s*\(1 <<\s*(\d+)\s*\)/.exec(line.trim());
      if (header) {
        current = {
          name: header[1],
          shift: Number(header[2]),
          value: 1 << Number(header[2]),
          events: [],
          privilegedEvents: []
        };
        intents.push(current);
        continue;
      }
      const event = /^-\s*([A-Z_]+)(\s*\*)?/.exec(line.trim());
      if (event && current) {
        current.events.push(event[1]);
        if (event[2]) current.privilegedEvents.push(event[1]);
      }
    }
  }

  return intents;
}

// ─── events ───────────────────────────────────────────────────────────────

/** `Message Create` → `MESSAGE_CREATE`. */
const toWireName = (name: string): string =>
  name
    .replace(/[^A-Za-z0-9]+/g, ` `)
    .trim()
    .split(/\s+/)
    .join(`_`)
    .toUpperCase();

/** `Message Create` → `message-create`. */
const toAnchor = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, `-`)
    .replace(/^-|-$/g, ``);

/**
 * Extract every event documented under `## Send Events` / `## Receive Events`.
 *
 * Each event is an `####` heading; the paragraph immediately after it is the
 * description. `###` headings inside `## Receive Events` are *category*
 * groupings (`Channels`, `Guilds`) and are deliberately skipped — collapsing
 * those into events is precisely how the generic parser produced 15 bogus
 * "objects" for ~84 real events.
 */
export function parseEvents(markdown: string): GatewayEvent[] {
  const lines = markdown.split(/\r?\n/);
  const events: GatewayEvent[] = [];
  let direction: `send` | `receive` | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h2 = /^##\s+(.+)$/.exec(line);
    if (h2) {
      const title = h2[1].trim();
      direction =
        title === `Send Events`
          ? `send`
          : title === `Receive Events`
            ? `receive`
            : null;
      continue;
    }
    if (direction === null) continue;

    const h4 = /^####\s+(.+)$/.exec(line);
    if (!h4) continue;
    const name = h4[1].trim();

    // First non-empty line after the heading that is prose (not another
    // heading, table, MDX component, or fence) is the description.
    let description = ``;
    for (let j = i + 1; j < lines.length; j++) {
      const candidate = lines[j].trim();
      if (candidate === ``) continue;
      if (
        candidate.startsWith(`#`) ||
        candidate.startsWith(`|`) ||
        candidate.startsWith(`<`) ||
        candidate.startsWith(`\`\`\``)
      ) {
        break;
      }
      description = plainText(candidate);
      break;
    }

    events.push({
      name,
      wireName: toWireName(name),
      description,
      direction,
      anchor: toAnchor(name)
    });
  }

  return events;
}

// ─── entrypoint ───────────────────────────────────────────────────────────

const readPage = (relativePath: string): string =>
  readFileSync(join(DOCS_CACHE, relativePath), `utf8`);

/** Parse every Gateway construct out of the cached docs. */
export function parseGateway(): GatewayDoc {
  const opcodesPage = readPage(OPCODES_PAGE);
  return {
    opcodes: parseOpcodes(opcodesPage),
    closeCodes: parseCloseCodes(opcodesPage),
    intents: parseIntents(readPage(GATEWAY_PAGE)),
    events: parseEvents(readPage(EVENTS_PAGE))
  };
}

// ─── CLI ──────────────────────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const doc = parseGateway();
  if (process.argv.includes(`--json`)) {
    console.log(JSON.stringify(doc, null, 2));
  } else {
    console.log(`Opcodes (${doc.opcodes.length}):`);
    for (const op of doc.opcodes) {
      console.log(
        `  ${String(op.code).padStart(2)} ${op.name.padEnd(24)} ${op.direction}`
      );
    }
    console.log(`\nClose codes (${doc.closeCodes.length}):`);
    for (const cc of doc.closeCodes) {
      console.log(
        `  ${cc.code} ${cc.label.padEnd(24)} reconnect=${cc.reconnect}`
      );
    }
    console.log(`\nIntents (${doc.intents.length}):`);
    for (const intent of doc.intents) {
      const privileged = intent.privilegedEvents.length
        ? ` (${intent.privilegedEvents.length} privileged)`
        : ``;
      console.log(
        `  1 << ${String(intent.shift).padStart(2)} ${intent.name.padEnd(32)} ${intent.events.length} events${privileged}`
      );
    }
    const send = doc.events.filter((e) => e.direction === `send`).length;
    const receive = doc.events.filter((e) => e.direction === `receive`).length;
    console.log(
      `\nEvents (${doc.events.length}): ${send} send, ${receive} receive`
    );
  }
}
