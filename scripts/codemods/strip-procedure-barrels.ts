/**
 * Phase 1b codemod: remove procedure barrel files and the namespace re-exports
 * that reference them.
 *
 * Targets:
 *   - All `packages/client/src/**\/procedures.ts` (24 subdir + 1 root) → delete.
 *   - All `export * as <name>Procedures from "./procedures.js"` lines in any
 *     `index.ts` under packages/client/src → remove the line.
 */

import { readFileSync, writeFileSync, rmSync, globSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), `../..`);

const proceduresFiles = globSync(`packages/client/src/**/procedures.ts`, {
  cwd: projectRoot
}).map((p) => resolve(projectRoot, p));

let deletedFiles = 0;
for (const file of proceduresFiles) {
  rmSync(file);
  deletedFiles++;
}

const barrelFiles = globSync(`packages/client/src/**/index.ts`, {
  cwd: projectRoot
}).map((p) => resolve(projectRoot, p));

const reExportRegex =
  /^\s*export\s+\*\s+as\s+\w+\s+from\s+["']\.\/procedures\.js["'];?\s*$/gm;

let changedBarrels = 0;
let unchangedBarrels = 0;

for (const file of barrelFiles) {
  const original = readFileSync(file, `utf8`);
  const next = original.replace(reExportRegex, ``);
  if (next === original) {
    unchangedBarrels++;
    continue;
  }
  // Collapse any leftover blank-line runs (3+ newlines → 2).
  const collapsed = next.replace(/\n{3,}/g, `\n\n`);
  writeFileSync(file, collapsed, `utf8`);
  changedBarrels++;
}

console.log(
  `strip-procedure-barrels: deleted ${deletedFiles} procedures.ts files; cleaned ${changedBarrels} barrels (${unchangedBarrels} unchanged) of ${barrelFiles.length} total`
);
