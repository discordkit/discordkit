/**
 * T3: Audit reporter.
 *
 * Compares the parsed Discord docs (T2 output) against the current
 * `packages/client/src/<folder>` state and writes one Markdown report per
 * folder to `audit/<folder>.md` (gitignored).
 *
 * For each folder, the report covers:
 *   - Endpoints in docs but missing from the repo → ADD
 *   - Endpoints in the repo but missing from docs → REVIEW (deprecated? renamed?)
 *   - Endpoints whose filename doesn't match the docs heading slug → RENAME
 *   - Object/Enum names that exist in docs but not in `types/`
 *
 * Usage:
 *   node --experimental-strip-types scripts/docs/audit.ts           # audit all folders
 *   node --experimental-strip-types scripts/docs/audit.ts user      # audit a specific folder
 */

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  existsSync,
  statSync
} from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseResource, type DocResource, type DocEndpoint } from "./parse.ts";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), `../..`);
const DOCS_CACHE = join(PROJECT_ROOT, `.discord-docs`);
const CLIENT_SRC = join(PROJECT_ROOT, `packages/client/src`);
const REPORT_DIR = join(PROJECT_ROOT, `audit`);

/** Words that should be preserved in their original casing (e.g. "DM" stays "DM"). */
const PRESERVE_CASE = new Set([
  `DM`,
  `URL`,
  `URI`,
  `OAuth2`,
  `MFA`,
  `TTS`,
  `SKU`,
  `GIF`,
  `NSFW`,
  `API`,
  `GitHub`,
  `JSON`
]);

/**
 * Folder → docs page (relative path under `.discord-docs/`).
 * Multiple pages can feed one folder (e.g., `application/` pulls from both
 * `resources/application.md` and `interactions/application-commands.md`).
 */
const FOLDER_MAP: Record<string, string[]> = {
  application: [
    `resources/application.md`,
    `interactions/application-commands.md`
  ],
  // application-commands/ is a types-only folder; its endpoint files live in
  // application/. Handled via SPECIAL_FOLDERS below.
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
  // images: handled separately — see SPECIAL_FOLDERS
  interactions: [`interactions/receiving-and-responding.md`],
  invite: [`resources/invite.md`],
  lobby: [`resources/lobby.md`],
  messages: [`resources/message.md`],
  // permissions: handled separately
  poll: [`resources/poll.md`],
  sku: [`resources/sku.md`],
  soundboard: [`resources/soundboard.md`],
  stage: [`resources/stage-instance.md`],
  sticker: [`resources/sticker.md`],
  subscription: [`resources/subscription.md`],
  // teams: types-only — handled separately
  template: [`resources/guild-template.md`],
  user: [`resources/user.md`],
  voice: [`resources/voice.md`],
  webhook: [`resources/webhook.md`]
};

/**
 * Folders that don't follow the standard endpoint-per-file pattern.
 * They get a minimal report that just notes they need manual review.
 */
const SPECIAL_FOLDERS = new Set([
  `images`,
  `permissions`,
  `teams`,
  `application-commands`
]);

interface RepoEndpoint {
  filename: string;
  exportName: string;
  method: string | null;
  path: string | null;
  titleLink: string | null;
}

const args = process.argv.slice(2);
const targetFolder = args.find((a) => !a.startsWith(`--`));

mkdirSync(REPORT_DIR, { recursive: true });

const folders = targetFolder
  ? [targetFolder]
  : readdirSync(CLIENT_SRC).filter((entry) => {
      const fullPath = join(CLIENT_SRC, entry);
      return statSync(fullPath).isDirectory() && !entry.startsWith(`__`);
    });

let reportCount = 0;
for (const folder of folders) {
  if (SPECIAL_FOLDERS.has(folder)) {
    writeSpecialReport(folder);
    reportCount++;
    continue;
  }
  const docPages = FOLDER_MAP[folder];
  if (!docPages) {
    console.log(`SKIP ${folder} — no doc mapping configured`);
    continue;
  }
  writeFolderReport(folder, docPages);
  reportCount++;
}

console.log(
  `\nWrote ${reportCount} report(s) to ${REPORT_DIR.replace(PROJECT_ROOT + `\\`, ``)}`
);

// ─── per-folder reporting ──────────────────────────────────────────────────

function writeFolderReport(folder: string, docPages: string[]): void {
  // Aggregate docs from all relevant pages.
  const docEndpoints: DocEndpoint[] = [];
  const docObjects: DocResource[`objects`] = [];
  const docEnums: DocResource[`enums`] = [];
  const pageTitles: string[] = [];
  for (const page of docPages) {
    const filePath = join(DOCS_CACHE, page);
    if (!existsSync(filePath)) {
      console.warn(
        `  WARN: doc page missing: ${page} (run scripts/docs/fetch.ts)`
      );
      continue;
    }
    const md = readFileSync(filePath, `utf8`);
    const r = parseResource(md);
    pageTitles.push(r.title);
    docEndpoints.push(...r.endpoints);
    docObjects.push(...r.objects);
    docEnums.push(...r.enums);
  }

  // For folders that pull from multiple docs pages (e.g., `application/`),
  // some endpoints in those pages don't belong to this folder. Filter by the
  // repo's existing path-prefix heuristic.
  const filteredDocEndpoints =
    docPages.length > 1
      ? filterEndpointsForFolder(folder, docEndpoints)
      : docEndpoints;

  // Filter out doc "objects" that are actually endpoint response-shape
  // descriptors. They share their name with an endpoint heading and don't
  // need a separate type file.
  const endpointNames = new Set(filteredDocEndpoints.map((e) => e.name));
  const filteredObjects = docObjects.filter((o) => !endpointNames.has(o.name));

  const repoEndpoints = listRepoEndpoints(folder);
  const repoTypes = listRepoTypes(folder);

  const findings = compare(
    filteredDocEndpoints,
    filteredObjects,
    docEnums,
    repoEndpoints,
    repoTypes
  );

  const lines: string[] = [];
  lines.push(`# Audit: \`packages/client/src/${folder}\``);
  lines.push(``);
  lines.push(`> Sourced from: ${pageTitles.map((t) => `*${t}*`).join(`, `)}`);
  lines.push(``);
  lines.push(`## Summary`);
  lines.push(``);
  lines.push(`| Finding | Count |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Endpoints in docs | ${filteredDocEndpoints.length} |`);
  lines.push(`| Endpoints in repo | ${repoEndpoints.length} |`);
  lines.push(`| **ADD** — missing from repo | ${findings.toAdd.length} |`);
  lines.push(
    `| **REMOVE/REVIEW** — missing from docs | ${findings.toReview.length} |`
  );
  lines.push(`| **RENAME** — filename drift | ${findings.toRename.length} |`);
  lines.push(
    `| **TYPE_ADD** — object/enum types missing | ${findings.typesToAdd.length} |`
  );
  lines.push(``);

  if (findings.toAdd.length > 0) {
    lines.push(`## Endpoints to Add`);
    lines.push(``);
    for (const ep of findings.toAdd) {
      lines.push(`### ${ep.method} ${ep.path}`);
      lines.push(``);
      lines.push(`- **Doc heading:** ${ep.name}`);
      lines.push(`- **Suggested filename:** \`${toCamelCase(ep.name)}.ts\``);
      const paramSummary = paramsSummary(ep);
      if (paramSummary) lines.push(`- **Params:** ${paramSummary}`);
      if (ep.description)
        lines.push(`- **Description:** ${truncate(ep.description, 200)}`);
      lines.push(``);
    }
  }

  if (findings.toReview.length > 0) {
    lines.push(`## Endpoints to Review (in repo, not in current docs)`);
    lines.push(``);
    for (const re of findings.toReview) {
      lines.push(
        `- \`${re.filename}\` — ${re.method ?? `?`} \`${re.path ?? `?`}\``
      );
    }
    lines.push(``);
  }

  if (findings.toRename.length > 0) {
    lines.push(`## Endpoints to Rename`);
    lines.push(``);
    for (const { repo, doc } of findings.toRename) {
      lines.push(
        `- \`${repo.filename}\` → \`${toCamelCase(doc.name)}.ts\` (doc heading: *${doc.name}*)`
      );
    }
    lines.push(``);
  }

  if (findings.typesToAdd.length > 0) {
    lines.push(`## Types to Add`);
    lines.push(``);
    for (const t of findings.typesToAdd) {
      lines.push(
        `- **${t.kind}**: \`${t.name}\` (suggested file: \`types/${pascalCase(t.name)}.ts\`)`
      );
    }
    lines.push(``);
  }

  if (
    findings.toAdd.length === 0 &&
    findings.toReview.length === 0 &&
    findings.toRename.length === 0 &&
    findings.typesToAdd.length === 0
  ) {
    lines.push(`✅ No drift detected — repo matches the docs as-parsed.`);
    lines.push(``);
    lines.push(
      `_(Note: this audit only checks endpoint name/method/path and the presence of object/enum types. Field-level drift is not yet detected.)_`
    );
    lines.push(``);
  }

  const reportPath = join(REPORT_DIR, `${folder}.md`);
  writeFileSync(reportPath, lines.join(`\n`), `utf8`);
  console.log(
    `${folder}: ADD=${findings.toAdd.length} REVIEW=${findings.toReview.length} RENAME=${findings.toRename.length} TYPES=${findings.typesToAdd.length}`
  );
}

function writeSpecialReport(folder: string): void {
  const lines: string[] = [
    `# Audit: \`packages/client/src/${folder}\``,
    ``,
    `> **Special folder** — does not follow the standard endpoint-per-file pattern.`,
    ``,
    "Needs manual review against the corresponding docs section. See `docs/discord-api-audit.md` for guidance on this folder's exception status.",
    ``
  ];
  writeFileSync(join(REPORT_DIR, `${folder}.md`), lines.join(`\n`), `utf8`);
  console.log(`${folder}: (special — needs manual review)`);
}

// ─── repo introspection ────────────────────────────────────────────────────

function listRepoEndpoints(folder: string): RepoEndpoint[] {
  const folderPath = join(CLIENT_SRC, folder);
  if (!existsSync(folderPath)) return [];
  const files = readdirSync(folderPath).filter(
    (f) =>
      f.endsWith(`.ts`) &&
      f !== `index.ts` &&
      !f.endsWith(`.spec.ts`) &&
      !f.endsWith(`.mock.ts`)
  );
  const endpoints: RepoEndpoint[] = [];
  for (const filename of files) {
    const content = readFileSync(join(folderPath, filename), `utf8`);
    const route = extractRouteFromJsdoc(content);
    const exportName = filename.replace(/\.ts$/, ``);
    const titleLink = extractTitleLink(content);
    endpoints.push({
      filename,
      exportName,
      method: route?.method ?? null,
      path: route?.path ?? null,
      titleLink
    });
  }
  return endpoints;
}

function extractRouteFromJsdoc(
  source: string
): { method: string; path: string } | null {
  // Matches lines like:
  //   * **GET** `/users/@me`
  const m = /\*\s+\*\*([A-Z]+)\*\*\s+`([^`]+)`/.exec(source);
  if (!m) return null;
  return { method: m[1], path: m[2] };
}

function extractTitleLink(source: string): string | null {
  // Matches lines like:
  //   * ### [Get Current User](https://...)
  const m = /\*\s+###\s+\[([^\]]+)\]/.exec(source);
  return m ? m[1].trim() : null;
}

function listRepoTypes(folder: string): Set<string> {
  const typesDir = join(CLIENT_SRC, folder, `types`);
  if (!existsSync(typesDir)) return new Set();
  const files = readdirSync(typesDir).filter(
    (f) => f.endsWith(`.ts`) && f !== `index.ts`
  );
  return new Set(files.map((f) => f.replace(/\.ts$/, ``)));
}

// ─── comparison ────────────────────────────────────────────────────────────

interface Findings {
  toAdd: DocEndpoint[];
  toReview: RepoEndpoint[];
  toRename: { repo: RepoEndpoint; doc: DocEndpoint }[];
  typesToAdd: { kind: `Object` | `Enum`; name: string }[];
}

function compare(
  docEndpoints: DocEndpoint[],
  docObjects: DocResource[`objects`],
  docEnums: DocResource[`enums`],
  repoEndpoints: RepoEndpoint[],
  repoTypes: Set<string>
): Findings {
  const toAdd: DocEndpoint[] = [];
  const toReview: RepoEndpoint[] = [];
  const toRename: { repo: RepoEndpoint; doc: DocEndpoint }[] = [];

  // Index repo by (method, normalizedPath) — multiple endpoints may share a
  // method+path (Create DM and Create Group DM both POST /users/@me/channels),
  // so collect into arrays and disambiguate by filename.
  const repoByKey = new Map<string, RepoEndpoint[]>();
  for (const re of repoEndpoints) {
    if (re.method && re.path) {
      const key = `${re.method}::${normalizeRepoPath(re.path)}`;
      const arr = repoByKey.get(key) ?? [];
      arr.push(re);
      repoByKey.set(key, arr);
    }
  }

  // Also build a filename-based index for fallback matching when paths drift
  // (e.g., repo uses `:template` while docs use `:code` for the same endpoint).
  const repoByFilename = new Map<string, RepoEndpoint>();
  for (const re of repoEndpoints) {
    repoByFilename.set(re.filename, re);
  }

  const consumed = new Set<RepoEndpoint>();
  for (const ep of docEndpoints) {
    const expectedFilename = `${toCamelCase(ep.name)}.ts`;
    const pathKey = `${ep.method}::${ep.path}`;
    const candidates = repoByKey.get(pathKey);
    let match: RepoEndpoint | undefined;
    if (candidates && candidates.length > 0) {
      const exact = candidates.find(
        (c) => c.filename === expectedFilename && !consumed.has(c)
      );
      match = exact ?? candidates.find((c) => !consumed.has(c));
    }
    // Fallback: same method + same filename, ignoring path differences.
    if (!match) {
      const byName = repoByFilename.get(expectedFilename);
      if (byName && !consumed.has(byName) && byName.method === ep.method) {
        match = byName;
      }
    }
    // Last-ditch: same method + same "stem" (filename without trailing case) +
    // exact title-link prose match.
    if (!match && ep.name) {
      const byTitle = repoEndpoints.find(
        (c) =>
          !consumed.has(c) &&
          c.method === ep.method &&
          (c.titleLink === ep.name || c.exportName === toCamelCase(ep.name))
      );
      if (byTitle) match = byTitle;
    }
    if (!match) {
      toAdd.push(ep);
      continue;
    }
    consumed.add(match);
    if (match.filename !== expectedFilename) {
      toRename.push({ repo: match, doc: ep });
    }
  }

  for (const re of repoEndpoints) {
    if (!consumed.has(re) && re.method && re.path) {
      toReview.push(re);
    }
  }

  // Types: check object & enum names against repoTypes.
  // Map doc names to a normalized PascalCase form to compare against type filenames.
  const typesToAdd: { kind: `Object` | `Enum`; name: string }[] = [];
  for (const obj of docObjects) {
    const base = pascalCase(
      obj.name.replace(/\sObject$/i, ``).replace(/\sStructure$/i, ``)
    );
    if (!matchesAnyRepoType(base, repoTypes)) {
      typesToAdd.push({ kind: `Object`, name: obj.name });
    }
  }
  for (const en of docEnums) {
    const base = pascalCase(en.name);
    if (!matchesAnyRepoType(base, repoTypes)) {
      typesToAdd.push({ kind: `Enum`, name: en.name });
    }
  }

  return { toAdd, toReview, toRename, typesToAdd };
}

/**
 * Loose match between a doc-derived PascalCase name and the repo's type files.
 * Tolerates singular/plural drift (`PremiumTypes` vs `PremiumType`) and the
 * trailing `Object`/`Flags`/`Flag` suffixes the repo uses.
 */
function matchesAnyRepoType(base: string, repoTypes: Set<string>): boolean {
  const candidates = [
    base,
    `${base}Object`,
    base.endsWith(`s`) ? base.slice(0, -1) : `${base}s`,
    base.endsWith(`Types`) ? base.slice(0, -1) : null,
    base.endsWith(`Flags`) ? `${base.slice(0, -1)}` : null
  ].filter((c): c is string => c !== null);
  return candidates.some((c) => repoTypes.has(c));
}

function normalizeRepoPath(p: string): string {
  // Repo uses :param syntax in JSDoc too, so they should align.
  return p.trim();
}

// ─── filtering for multi-source folders ────────────────────────────────────

/**
 * When a folder draws from multiple doc pages, filter endpoints by the path
 * patterns the repo's existing files use as a proxy.
 */
function filterEndpointsForFolder(
  folder: string,
  endpoints: DocEndpoint[]
): DocEndpoint[] {
  if (folder === `application`) {
    // application/ in the repo contains *both* `Get/Edit Current Application` (path /applications/@me)
    // AND the application-commands endpoints (path /applications/:application/commands/...).
    return endpoints.filter(
      (ep) =>
        ep.path === `/applications/@me` ||
        ep.path.startsWith(`/applications/:application/activity-instances`) ||
        ep.path.startsWith(`/applications/:application/commands`) ||
        ep.path.startsWith(
          `/applications/:application/guilds/:guild/commands`
        ) ||
        ep.path.startsWith(`/applications/:application/guilds/:guild/commands/`)
    );
  }
  return endpoints;
}

// ─── string helpers ────────────────────────────────────────────────────────

function toCamelCase(heading: string): string {
  // "Get Current User" → "getCurrentUser"
  // "Create DM" → "createDM"  (DM stays uppercase)
  // "List SKUs" → "listSKUs"  (preserved plural)
  // "Delete/Close Channel" → "deleteCloseChannel"
  // "Modify Webhook with Token" → "modifyWebhookWithToken"
  const words = heading
    .replace(/[/-]/g, ` `)
    .replace(/[^a-zA-Z0-9\s]/g, ``)
    .trim()
    .split(/\s+/);
  return words
    .map((w, i) => {
      const preserved = matchPreserved(w);
      if (preserved) return preserved;
      if (i === 0) return w.toLowerCase();
      return w[0].toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(``);
}

function matchPreserved(word: string): string | null {
  // Direct match (case-insensitive against the canonical preserve-case entry).
  const upper = word.toUpperCase();
  const direct = [...PRESERVE_CASE].find((p) => p.toUpperCase() === upper);
  if (direct) return direct;
  // Trailing `s` plural — e.g. "SKUs" → preserve "SKU" + "s".
  if (word.length > 1 && word.endsWith(`s`)) {
    const stem = word.slice(0, -1).toUpperCase();
    const stemMatch = [...PRESERVE_CASE].find((p) => p.toUpperCase() === stem);
    if (stemMatch) return `${stemMatch}s`;
  }
  return null;
}

function pascalCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, ` `)
    .trim()
    .split(/\s+/)
    .map((w) => {
      const upper = w.toUpperCase();
      if (PRESERVE_CASE.has(upper)) {
        const match = [...PRESERVE_CASE].find((p) => p.toUpperCase() === upper);
        return match ?? upper;
      }
      return w[0].toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(``);
}

function paramsSummary(ep: DocEndpoint): string {
  const parts: string[] = [];
  if (ep.jsonParams.length)
    parts.push(
      `JSON × ${ep.jsonParams.reduce((s, g) => s + g.fields.length, 0)}`
    );
  if (ep.queryParams.length)
    parts.push(
      `Query × ${ep.queryParams.reduce((s, g) => s + g.fields.length, 0)}`
    );
  if (ep.formParams.length)
    parts.push(
      `Form × ${ep.formParams.reduce((s, g) => s + g.fields.length, 0)}`
    );
  return parts.join(`, `);
}

function truncate(s: string, max: number): string {
  const cleaned = s.replace(/\s+/g, ` `).trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}
