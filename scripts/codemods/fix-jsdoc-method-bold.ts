/**
 * One-off cleanup: fix the `* **METHOD* ` JSDoc typo (missing trailing `**`).
 * Several endpoint files have this and it breaks the audit's regex-based
 * method+path extraction.
 *
 * Idempotent.
 */

import { readFileSync, writeFileSync, globSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), `../..`);

const targetFiles = globSync(`packages/client/src/**/*.ts`, {
  cwd: projectRoot
}) as string[];

let changed = 0;
for (const rel of targetFiles) {
  const file = resolve(projectRoot, rel);
  const source = readFileSync(file, `utf8`);
  // Match: leading `* ` indent (any spaces), `**`, METHOD, `*` (single), space, backtick.
  // Replace the trailing single `*` with `**`.
  const next = source.replace(
    /^(\s+\*\s+\*\*(?:GET|POST|PUT|PATCH|DELETE))\*(\s+`)/gm,
    `$1**$2`
  );
  if (next !== source) {
    writeFileSync(file, next, `utf8`);
    changed++;
  }
}
console.log(`fix-jsdoc-method-bold: ${changed} files updated`);
