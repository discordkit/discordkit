/**
 * One-shot codemod: apply the `schema<T>()` type-erasure pattern to
 * type-defining schema files.
 *
 * For each file under `packages/client/src/**` matching the canonical
 * shape:
 *
 *     /// some leading doc comments + imports
 *     export const xxxSchema = v.object({ ... });
 *     export interface X extends v.InferOutput<typeof xxxSchema> {}
 *
 * the codemod rewrites to:
 *
 *     /// some leading doc comments + imports
 *     /// (schema added to the @discordkit/core import)
 *     const _xxxSchema = v.object({ ... });
 *     export interface X extends v.InferOutput<typeof _xxxSchema> {}
 *
 *     /// (moved jsdoc block)
 *     export const xxxSchema = schema<X>(_xxxSchema);
 *
 * Files that don't match the canonical shape exactly (multiple schemas
 * per file, exotic wrappers, etc.) are skipped with a warning so a
 * human can do them by hand.
 *
 * Usage:
 *   npx tsx scripts/type-erase-schemas.ts          # dry-run (default)
 *   npx tsx scripts/type-erase-schemas.ts --write  # apply changes
 *   npx tsx scripts/type-erase-schemas.ts <file>   # run on one file
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), `..`);
const CLIENT_SRC = join(PROJECT_ROOT, `packages/client/src`);

const args = process.argv.slice(2);
const writeMode = args.includes(`--write`);
const fileArg = args.find((a) => !a.startsWith(`--`));

const targets = fileArg
  ? [resolve(fileArg)]
  : walkTsFiles(CLIENT_SRC).filter((p) => !p.endsWith(`.spec.ts`));

let changed = 0;
let skipped = 0;
let alreadyDone = 0;

for (const path of targets) {
  const source = readFileSync(path, `utf8`);

  // Already done — has a `schema<` call.
  if (/\b_[a-z][a-zA-Z]*Schema\b/.test(source) || /\bschema</.test(source)) {
    alreadyDone++;
    continue;
  }

  const result = transform(source);
  if (!result) {
    continue;
  }
  if (result.warnings.length > 0) {
    for (const w of result.warnings) {
      console.warn(`  ${relative(PROJECT_ROOT, path)}: ${w}`);
    }
    skipped++;
    continue;
  }

  if (writeMode) {
    writeFileSync(path, result.output, `utf8`);
  } else {
    console.log(`would change: ${relative(PROJECT_ROOT, path)}`);
  }
  changed++;
}

console.log(
  `\n${changed} file(s) ${writeMode ? `changed` : `would change`}; ${skipped} skipped; ${alreadyDone} already done`
);

interface TransformResult {
  output: string;
  warnings: string[];
}

function transform(source: string): TransformResult | null {
  // Look for exactly one canonical pair.
  // 1. `export const xxxSchema = v.object({ ... });` (possibly multiline)
  // 2. `export interface X extends v.InferOutput<typeof xxxSchema> {}`
  //
  // Optional JSDoc block immediately above `export const xxxSchema`.

  const interfaceRe =
    /export interface ([A-Z]\w*) extends v\.InferOutput<\s*typeof (\w+Schema)\s*>\s*\{\}/g;
  const interfaceMatches = [...source.matchAll(interfaceRe)];
  if (interfaceMatches.length !== 1) return null;
  const [, ifaceName, schemaName] = interfaceMatches[0];

  // Find the schema declaration. We allow either `v.object({...})`,
  // `v.partial(v.object({...}))`, or `v.union([...])` at the top level.
  // The simplest test: line starts with `export const <schemaName> =`.
  const lines = source.split(/\r?\n/);
  let exportLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (new RegExp(`^export const ${schemaName}\\s*=`).test(lines[i])) {
      exportLine = i;
      break;
    }
  }
  if (exportLine < 0) return null;

  // Find preceding JSDoc block (immediately above, optionally separated
  // by blank lines). We look for `/**` ... `*/`.
  let docStart = -1;
  let docEnd = -1;
  for (let i = exportLine - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.trim() === ``) continue;
    if (/\*\/\s*$/.test(line)) {
      docEnd = i;
      for (let j = i; j >= 0; j--) {
        if (/^\s*\/\*\*/.test(lines[j])) {
          docStart = j;
          break;
        }
      }
    }
    break;
  }

  const warnings: string[] = [];

  // Rename the schema in the export line and remove `export `.
  lines[exportLine] = lines[exportLine].replace(
    new RegExp(`^export const ${schemaName}\\s*=`),
    `const _${schemaName} =`
  );

  // Rename in the interface.
  const interfaceLine = lines.findIndex((l) =>
    new RegExp(
      `export interface ${ifaceName} extends v\\.InferOutput<\\s*typeof ${schemaName}\\s*>\\s*\\{\\}`
    ).test(l)
  );
  if (interfaceLine < 0) {
    warnings.push(`could not find interface line`);
    return { output: source, warnings };
  }
  lines[interfaceLine] = lines[interfaceLine].replace(
    new RegExp(`typeof ${schemaName}`),
    `typeof _${schemaName}`
  );

  // Build the inserted JSDoc + new export. The JSDoc, if present, was
  // removed from above the schema declaration and re-inserted above the
  // public alias.
  let docBlock = ``;
  if (docStart >= 0 && docEnd >= 0) {
    docBlock = `${lines.slice(docStart, docEnd + 1).join(`\n`)}\n`;
    lines.splice(docStart, docEnd - docStart + 1);
    // Adjust interfaceLine downward.
  }

  // Re-locate the interface line after the splice.
  const interfaceLine2 = lines.findIndex((l) =>
    l.includes(
      `export interface ${ifaceName} extends v.InferOutput<typeof _${schemaName}>`
    )
  );
  if (interfaceLine2 < 0) {
    warnings.push(`lost interface line after splice`);
    return { output: source, warnings };
  }
  // Insert blank line, doc block, alias declaration after the interface
  // declaration.
  let insertText: string[] = [``];
  if (docBlock) insertText = insertText.concat(docBlock.trimEnd().split(`\n`));
  insertText.push(
    `export const ${schemaName} = schema<${ifaceName}>(_${schemaName});`
  );

  // Insert after the interface line (lines after).
  lines.splice(interfaceLine2 + 1, 0, ...insertText);

  // Add `schema` to the @discordkit/core import.
  let output = lines.join(`\n`);
  const coreImportRe =
    /import\s*\{([^}]+)\}\s*from\s*["']@discordkit\/core["']/;
  const m = coreImportRe.exec(output);
  if (m) {
    const importBody = m[1];
    if (!/\bschema\b/.test(importBody)) {
      const newBody = importBody.includes(`\n`)
        ? `${importBody.replace(/^\s*\n/, ``).trimEnd()},\n  schema\n`
        : `${importBody.replace(/\s+$/, ``)}, schema`;
      output = output.replace(
        m[0],
        `import { ${newBody.trim()} } from "@discordkit/core"`
      );
    }
  } else {
    // No @discordkit/core import — insert one.
    const valibotImport = /import \* as v from ["']valibot["'];?/;
    output = output.replace(
      valibotImport,
      (s) => `${s}\nimport { schema } from "@discordkit/core";`
    );
  }

  return { output, warnings };
}

function walkTsFiles(root: string): string[] {
  const out: string[] = [];
  const visit = (path: string): void => {
    const stat = statSync(path);
    if (stat.isDirectory()) {
      for (const e of readdirSync(path)) {
        if (e === `__mocks__` || e === `__tests__`) continue;
        visit(join(path, e));
      }
      return;
    }
    if (!path.endsWith(`.ts`)) return;
    if (path.endsWith(`.spec.ts`) || path.endsWith(`.test.ts`)) return;
    out.push(path);
  };
  visit(root);
  return out;
}
