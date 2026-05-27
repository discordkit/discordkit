/**
 * Phase 1c codemod: drop unused named imports left over from the convenience
 * export removal.
 *
 * After Phase 1, many endpoint files import schemas that were only used as
 * arguments to toValidated/toProcedure. Those values are now dead code.
 *
 * Approach: for each endpoint file, parse the AST, find each named import
 * specifier, and scan the rest of the file for identifier references. If a
 * specifier (value-only) isn't referenced anywhere outside its declaration,
 * drop it from the import. Type-only specifiers (`type Foo`) are kept if
 * Foo is referenced in any type position.
 *
 * Since TypeScript already conflates value/type usage at the syntax level
 * (an identifier reference doesn't distinguish), we use a simple rule:
 * if the bare identifier appears outside the import statement, the
 * specifier stays. Otherwise drop it. Whole-import drop if all specifiers
 * fall away.
 */

import { readFileSync, writeFileSync, globSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const allCandidates = globSync("packages/client/src/**/*.ts", {
  cwd: projectRoot
}) as string[];

const targetFiles = allCandidates
  .filter(
    (p) =>
      !/[\\/]__tests__[\\/]|[\\/]__mocks__[\\/]|[\\/]types[\\/]/.test(p)
  )
  .filter((p) => !/[\\/]index\.ts$|\.spec\.ts$|\.mock\.ts$/.test(p))
  .map((p) => resolve(projectRoot, p));

interface Edit {
  start: number;
  end: number;
  replacement: string;
}

let changed = 0;
let skipped = 0;

for (const file of targetFiles) {
  const source = readFileSync(file, "utf8");
  const edits = computeEdits(file, source);
  if (edits.length === 0) {
    skipped++;
    continue;
  }
  const next = applyEdits(source, edits);
  writeFileSync(file, next, "utf8");
  changed++;
}

console.log(
  `strip-unused-imports: ${changed} changed, ${skipped} unchanged (of ${targetFiles.length} total)`
);

function computeEdits(filePath: string, source: string): Edit[] {
  const sf = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const edits: Edit[] = [];

  // Collect all identifier references *outside* import declarations.
  const referenced = collectReferencedIdentifiers(sf);

  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt)) continue;
    const importClause = stmt.importClause;
    if (!importClause) continue;
    if (!importClause.namedBindings) continue;

    // Case A: namespace import — `import * as v from "..."`
    if (ts.isNamespaceImport(importClause.namedBindings)) {
      const ns = importClause.namedBindings.name.text;
      if (!referenced.has(ns) && !importClause.name) {
        edits.push({
          start: stmt.getFullStart(),
          end: stmt.end,
          replacement: ""
        });
      }
      continue;
    }

    // Case B: named imports — `import { a, b } from "..."`
    if (!ts.isNamedImports(importClause.namedBindings)) continue;

    const elements = importClause.namedBindings.elements;
    const kept = elements.filter((el) => {
      const name = el.name.text;
      return referenced.has(name);
    });

    if (kept.length === elements.length) continue;

    if (kept.length === 0 && !importClause.name) {
      // Drop the whole import.
      edits.push({ start: stmt.getFullStart(), end: stmt.end, replacement: "" });
      continue;
    }

    // Rewrite the named imports list.
    const named = importClause.namedBindings;
    const openBrace = named.getStart(undefined, false);
    const closeBrace = named.end;
    const original = source.slice(openBrace, closeBrace);
    const isMultiline = original.includes("\n");

    const renderedNames = kept.map((el) => el.getText());
    const rendered = isMultiline
      ? "{\n  " + renderedNames.join(",\n  ") + "\n}"
      : "{ " + renderedNames.join(", ") + " }";

    edits.push({ start: openBrace, end: closeBrace, replacement: rendered });
  }

  return edits;
}

function collectReferencedIdentifiers(sf: ts.SourceFile): Set<string> {
  const refs = new Set<string>();

  function visit(node: ts.Node, insideImport: boolean): void {
    if (ts.isImportDeclaration(node)) {
      // Skip the entire import declaration when collecting references.
      // (We don't want the import specifier itself to count as a reference.)
      return;
    }
    if (ts.isIdentifier(node)) {
      refs.add(node.text);
    }
    ts.forEachChild(node, (child) => visit(child, insideImport));
  }

  ts.forEachChild(sf, (child) => visit(child, false));
  return refs;
}

function applyEdits(source: string, edits: Edit[]): string {
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  let result = source;
  for (const e of sorted) {
    result = result.slice(0, e.start) + e.replacement + result.slice(e.end);
  }
  return result;
}
