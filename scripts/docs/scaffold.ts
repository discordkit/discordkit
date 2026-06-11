/**
 * Endpoint scaffolder.
 *
 * Given a parsed DocEndpoint, emit a first-draft `.ts` file matching the
 * repo's conventions. Output is meant to be **reviewed and hand-tuned**
 * before commit — automation gets us 80% of the way; the last 20% (return
 * type refs, schema field-level constraints, cross-folder imports) needs
 * human judgment.
 *
 * Usage:
 *   node --experimental-strip-types scripts/docs/scaffold.ts <folder> <endpoint-slug>
 *
 * Examples:
 *   scaffold user delete-current-user-application-role-connection
 *   scaffold sticker get-sticker-pack
 *
 * Writes to stdout by default. Pass `--write` to create the file under
 * `packages/client/src/<folder>/<filename>.ts` (errors if the file exists).
 *
 * Also emits a matching `__tests__/<filename>.spec.ts` to stdout, or
 * writes both with `--write`.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseResource,
  type DocEndpoint,
  type DocField,
  type DocFieldType
} from "./parse.ts";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), `../..`);
const DOCS_CACHE = join(PROJECT_ROOT, `.discord-docs`);
const CLIENT_SRC = join(PROJECT_ROOT, `packages/client/src`);

/** Folder → docs page mapping (mirrors audit.ts). */
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

const FOLDER_DOC_BASE: Record<string, string> = {
  application: `resources/application`,
  "application-commands": `interactions/application-commands`,
  "application-role-connection": `resources/application-role-connection-metadata`,
  "audit-log": `resources/audit-log`,
  "auto-moderation": `resources/auto-moderation`,
  channel: `resources/channel`,
  components: `components/reference`,
  emoji: `resources/emoji`,
  entitlements: `resources/entitlement`,
  event: `resources/guild-scheduled-event`,
  guild: `resources/guild`,
  interactions: `interactions/receiving-and-responding`,
  invite: `resources/invite`,
  lobby: `resources/lobby`,
  messages: `resources/message`,
  poll: `resources/poll`,
  sku: `resources/sku`,
  soundboard: `resources/soundboard`,
  stage: `resources/stage-instance`,
  sticker: `resources/sticker`,
  subscription: `resources/subscription`,
  template: `resources/guild-template`,
  user: `resources/user`,
  voice: `resources/voice`,
  webhook: `resources/webhook`
};

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

// ─── CLI ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith(`--`));
const write = args.includes(`--write`);

if (positional.length < 2) {
  console.error(
    `usage: node --experimental-strip-types scripts/docs/scaffold.ts <folder> <endpoint-slug> [--write]`
  );
  process.exit(1);
}

const [folder, slug] = positional;
main(folder, slug, write);

function main(folder: string, slug: string, write: boolean): void {
  const pages = FOLDER_MAP[folder];
  if (!pages) {
    console.error(`No doc mapping for folder '${folder}'.`);
    process.exit(1);
  }
  let endpoint: DocEndpoint | undefined;
  for (const page of pages) {
    const md = readFileSync(join(DOCS_CACHE, page), `utf8`);
    const r = parseResource(md);
    endpoint = r.endpoints.find((e) => e.slug === slug);
    if (endpoint) break;
  }
  if (!endpoint) {
    console.error(`Endpoint '${slug}' not found in ${folder}.`);
    process.exit(1);
  }

  const filename = toCamelCase(endpoint.name);
  const source = renderEndpoint(folder, filename, endpoint);
  const spec = renderSpec(folder, filename, endpoint);

  if (write) {
    const filePath = join(CLIENT_SRC, folder, `${filename}.ts`);
    const specPath = join(
      CLIENT_SRC,
      folder,
      `__tests__`,
      `${filename}.spec.ts`
    );
    if (existsSync(filePath)) {
      console.error(`Refusing to overwrite ${filePath}`);
      process.exit(1);
    }
    mkdirSync(dirname(specPath), { recursive: true });
    writeFileSync(filePath, source, `utf8`);
    writeFileSync(specPath, spec, `utf8`);
    console.log(`wrote ${filePath}`);
    console.log(`wrote ${specPath}`);
  } else {
    console.log(
      `// ── ${filename}.ts ───────────────────────────────────────────`
    );
    console.log(source);
    console.log(
      `// ── __tests__/${filename}.spec.ts ───────────────────────────`
    );
    console.log(spec);
  }
}

// ─── rendering ────────────────────────────────────────────────────────────

function renderEndpoint(
  folder: string,
  filename: string,
  ep: DocEndpoint
): string {
  const docBase = FOLDER_DOC_BASE[folder];
  const fullDocUrl = `https://discord.com/developers/docs/${docBase}#${ep.slug}`;
  const methodFn = methodToFn(ep.method);

  // Path params extracted from `:param` markers in the path.
  const pathParams = extractPathParams(ep.path);

  // Combine all field sources into one schema.
  const jsonFields = ep.jsonParams.flatMap((g) => g.fields);
  const queryFields = ep.queryParams.flatMap((g) => g.fields);
  const formFields = ep.formParams.flatMap((g) => g.fields);

  // Collect imports needed.
  const coreImports = new Set<string>([methodFn, `type Fetcher`]);
  if (pathParams.length > 0) coreImports.add(`snowflake`);
  const valibotImports: string[] = [];

  // Build the schema body.
  const schemaName = `${filename}Schema`;
  const schemaParts: string[] = [];

  // Path params at top level.
  for (const p of pathParams) {
    schemaParts.push(`  ${p.name}: snowflake`);
  }

  // Body fields nested under `body`.
  if (jsonFields.length > 0) {
    coreImports.add(`snowflake`);
    const bodyLines = jsonFields.map((f) => renderFieldLine(f, coreImports));
    const allOptional = jsonFields.every((f) => f.optional);
    if (allOptional) {
      schemaParts.push(
        `  body: v.partial(\n    v.object({\n${bodyLines.join(`,\n`)}\n    })\n  )`
      );
    } else {
      schemaParts.push(`  body: v.object({\n${bodyLines.join(`,\n`)}\n  })`);
    }
  }

  // Query params under `params`, usually optional.
  if (queryFields.length > 0) {
    const paramLines = queryFields.map((f) => renderFieldLine(f, coreImports));
    schemaParts.push(
      `  params: v.exactOptional(\n    v.partial(\n      v.object({\n${paramLines
        .map((l) => `  ` + l)
        .join(`,\n`)}\n      })\n    )\n  )`
    );
  }

  // Form params (multipart) under `body` with attachments support — for now
  // treat like JSON params; the generated file will need hand-tuning.
  if (formFields.length > 0 && jsonFields.length === 0) {
    const lines = formFields.map((f) => renderFieldLine(f, coreImports));
    schemaParts.push(`  body: v.object({\n${lines.join(`,\n`)}\n  })`);
  }

  const hasInputs = schemaParts.length > 0;
  const hasParams =
    pathParams.length > 0 ||
    jsonFields.length > 0 ||
    queryFields.length > 0 ||
    formFields.length > 0;

  // Path expression — substitute :param with `${param}` template literals.
  let pathExpr = `\`${ep.path}\``;
  for (const p of pathParams) {
    pathExpr = pathExpr.replace(`:${p.name}`, `\${${p.name}}`);
  }

  // Argument destructuring for the Fetcher.
  const destructured: string[] = pathParams.map((p) => p.name);
  if (jsonFields.length > 0 || formFields.length > 0) destructured.push(`body`);
  if (queryFields.length > 0) destructured.push(`params`);

  // The call expression.
  const callArgs: string[] = [pathExpr];
  if (jsonFields.length > 0 || formFields.length > 0) callArgs.push(`body`);
  if (queryFields.length > 0) callArgs.push(`params`);

  // Return type — naive: needs hand-tuning. We emit `unknown` as a placeholder.
  const returnType = inferReturnType(ep);

  // Title-link JSDoc.
  const jsdocLines: string[] = [];
  jsdocLines.push(`/**`);
  jsdocLines.push(` * ### [${ep.name}](${fullDocUrl})`);
  jsdocLines.push(` *`);
  jsdocLines.push(` * **${ep.method}** \`${ep.path}\``);
  if (ep.description) {
    jsdocLines.push(` *`);
    for (const line of ep.description.split(/\n+/)) {
      jsdocLines.push(` * ${line}`);
    }
  }
  for (const note of ep.notes) {
    jsdocLines.push(` *`);
    const kind = note.kind === `Warn` ? `WARNING` : note.kind.toUpperCase();
    jsdocLines.push(` * > [!${kind}]`);
    jsdocLines.push(` * >`);
    jsdocLines.push(` * > ${note.content}`);
  }
  jsdocLines.push(` */`);

  // Import lines.
  const importLines: string[] = [];
  if (hasInputs || valibotImports.length > 0) {
    importLines.push(`import * as v from "valibot";`);
  }
  const coreList = [...coreImports].sort((a, b) => {
    // Put runtime helpers (post/get/etc.) first, then types, then primitives.
    const av = a.startsWith(`type `) ? 2 : a === methodFn ? 0 : 1;
    const bv = b.startsWith(`type `) ? 2 : b === methodFn ? 0 : 1;
    return av - bv;
  });
  importLines.push(
    `import { ${coreList.join(`, `)} } from "@discordkit/core";`
  );

  // Fetcher signature + body.
  const fetcherSignature = hasInputs
    ? `Fetcher<\n  typeof ${schemaName},\n  ${returnType}\n>`
    : `Fetcher<null, ${returnType}>`;
  const fetcherImpl = hasParams
    ? `async ({ ${destructured.join(`, `)} }) =>\n  ${methodFn}(${callArgs.join(`, `)})`
    : `async () => ${methodFn}(${callArgs.join(`, `)})`;

  const lines: string[] = [];
  lines.push(...importLines);
  lines.push(``);
  if (hasInputs) {
    lines.push(`export const ${schemaName} = v.object({`);
    lines.push(schemaParts.join(`,\n`));
    lines.push(`});`);
    lines.push(``);
  }
  lines.push(jsdocLines.join(`\n`));
  lines.push(`export const ${filename}: ${fetcherSignature} = ${fetcherImpl};`);
  lines.push(``);

  return lines.join(`\n`);
}

function renderSpec(folder: string, filename: string, ep: DocEndpoint): string {
  const schemaName = `${filename}Schema`;
  const hasInputs =
    ep.jsonParams.length > 0 ||
    ep.queryParams.length > 0 ||
    ep.formParams.length > 0 ||
    extractPathParams(ep.path).length > 0;

  const method = ep.method.toLowerCase();
  const mockArgs: string[] = [`\`${ep.path}\``];
  if (hasInputs) mockArgs.push(schemaName);
  // TODO: response schema goes as 3rd arg if available
  mockArgs.push(`/* TODO: response schema */ null`);

  const importedNames = hasInputs ? `${filename}, ${schemaName}` : filename;

  const lines: string[] = [];
  lines.push(`import { toValidated } from "@discordkit/core";`);
  lines.push(``);
  lines.push(`import { mockUtils } from "#mocks";`);
  lines.push(`import { ${importedNames} } from "../${filename}.js";`);
  lines.push(``);
  lines.push(`describe(\`${filename}\`, { repeats: 5 }, () => {`);
  lines.push(`  const { config, expected } = mockUtils.request.${method}(`);
  lines.push(`    ${mockArgs.join(`,\n    `)}`);
  lines.push(`  );`);
  lines.push(``);
  lines.push(
    `  it(\`validates input, fetches, and validates output\`, async () => {`
  );
  if (hasInputs) {
    lines.push(`    await expect(`);
    lines.push(
      `      toValidated(${filename}, ${schemaName}, /* TODO: response schema */)(config)`
    );
    lines.push(`    ).resolves.toEqual(expected);`);
  } else {
    lines.push(`    await expect(`);
    lines.push(
      `      toValidated(${filename}, null, /* TODO: response schema */)()`
    );
    lines.push(`    ).resolves.toEqual(expected);`);
  }
  lines.push(`  });`);
  lines.push(`});`);
  lines.push(``);
  return lines.join(`\n`);
}

// ─── field rendering ──────────────────────────────────────────────────────

function renderFieldLine(field: DocField, coreImports: Set<string>): string {
  const comment = field.description
    ? `    /** ${field.description.replace(/\s+/g, ` `).trim()} */\n`
    : ``;
  const value = renderFieldType(field.type, coreImports);
  const wrapped = field.optional ? `v.exactOptional(${value})` : value;
  // partial() at the parent level handles optional, but only when ALL fields are optional.
  // For mixed schemas, callers should wrap each entry individually.
  return `${comment}    ${field.name}: ${wrapped}`;
}

function renderFieldType(t: DocFieldType, coreImports: Set<string>): string {
  switch (t.kind) {
    case `primitive`: {
      const base = primitiveToValibot(t.name, coreImports);
      return t.nullable ? `v.nullable(${base})` : base;
    }
    case `ref`: {
      // Best-effort: derive a likely schema name from refName ("user" → userSchema).
      // The scaffolder doesn't know which folder the ref lives in — flagged
      // as TODO for the human.
      const refSchema = `/* TODO: ${t.refName}Schema */ v.unknown()`;
      return t.nullable ? `v.nullable(${refSchema})` : refSchema;
    }
    case `array`: {
      const inner = renderFieldType(t.element, coreImports);
      const arr = `v.array(${inner})`;
      return t.nullable ? `v.nullable(${arr})` : arr;
    }
    case `raw`: {
      return `/* TODO: ${t.raw} */ v.unknown()`;
    }
  }
}

function primitiveToValibot(name: string, coreImports: Set<string>): string {
  switch (name) {
    case `snowflake`:
      coreImports.add(`snowflake`);
      return `snowflake`;
    case `string`:
      return `v.string()`;
    case `integer`:
      return `v.pipe(v.number(), v.integer())`;
    case `number`:
    case `float`:
      return `v.number()`;
    case `boolean`:
    case `bool`:
      return `v.boolean()`;
    case `iso8601 timestamp`:
      return `v.pipe(v.string(), v.isoTimestamp())`;
    case `object`:
    case `dict`:
      return `v.record(v.string(), v.unknown())`;
    case `any`:
    case `mixed`:
      return `v.unknown()`;
    case `binary`:
    case `file contents`:
      return `v.unknown() /* TODO: file/binary type */`;
    case `null`:
      return `v.null_()`;
    default:
      return `v.unknown() /* TODO: ${name} */`;
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────

function extractPathParams(path: string): Array<{ name: string }> {
  const out: Array<{ name: string }> = [];
  const regex = /:([a-zA-Z_]\w*)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(path)) !== null) {
    out.push({ name: m[1] });
  }
  return out;
}

function methodToFn(method: string): string {
  switch (method.toUpperCase()) {
    case `GET`:
      return `get`;
    case `POST`:
      return `post`;
    case `PUT`:
      return `put`;
    case `PATCH`:
      return `patch`;
    case `DELETE`:
      return `remove`;
    default:
      return `get`;
  }
}

function inferReturnType(ep: DocEndpoint): string {
  // Best-effort: scan the description for "Returns a [Foo](url)" or
  // "Returns a list of [Foo](url)".
  const desc = ep.description;
  if (!desc) return `void`;

  const arrayMatch = /Returns a list of(?:\s+partial)?\s+\[([^\]]+)\]/i.exec(
    desc
  );
  if (arrayMatch) {
    return `${pascalCase(arrayMatch[1])}[] /* TODO: confirm type */`;
  }
  const singleMatch = /Returns(?:\s+a|\s+the|\s+an)?\s+\[([^\]]+)\]/i.exec(
    desc
  );
  if (singleMatch) {
    return `${pascalCase(singleMatch[1])} /* TODO: confirm type */`;
  }
  if (/Returns a 204|empty response|no content/i.test(desc)) return `void`;
  return `unknown /* TODO: infer return type */`;
}

function toCamelCase(heading: string): string {
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

function pascalCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, ` `)
    .trim()
    .split(/\s+/)
    .map((w) => {
      const preserved = matchPreserved(w);
      if (preserved) return preserved;
      return w[0].toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(``);
}

function matchPreserved(word: string): string | null {
  const upper = word.toUpperCase();
  const direct = [...PRESERVE_CASE].find((p) => p.toUpperCase() === upper);
  if (direct) return direct;
  if (word.length > 1 && word.endsWith(`s`)) {
    const stem = word.slice(0, -1).toUpperCase();
    const stemMatch = [...PRESERVE_CASE].find((p) => p.toUpperCase() === stem);
    if (stemMatch) return `${stemMatch}s`;
  }
  return null;
}
