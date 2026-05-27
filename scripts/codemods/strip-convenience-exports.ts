/**
 * Phase 1 codemod: strip *Safe / *Procedure / *Query exports from endpoint files.
 *
 * Targets: packages/client/src/**\/*.ts (excluding __tests__, __mocks__, types/, index.ts, *.spec.ts, *.mock.ts).
 *
 * For each file:
 *   - Drop `toValidated`, `toProcedure`, `toQuery` named specifiers from any @discordkit/core import.
 *     If that empties the import, drop the entire import statement.
 *   - Drop top-level `export const x = toValidated(...)` / `toProcedure(...)` / `toQuery(...)` statements.
 *
 * Approach: surgical string edits at AST node positions. Preserves all surrounding
 * whitespace, comments, and JSDoc.
 *
 * Idempotent: running again on already-trimmed files is a no-op.
 */

import { readFileSync, writeFileSync, globSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const HELPER_NAMES = new Set(["toValidated", "toProcedure", "toQuery"]);
const CORE_MODULE = "@discordkit/core";

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
  `strip-convenience-exports: ${changed} changed, ${skipped} unchanged (of ${targetFiles.length} total)`
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

  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt)) {
      collectImportEdit(stmt, source, edits);
      continue;
    }
    if (ts.isVariableStatement(stmt)) {
      collectExportEdit(stmt, source, edits);
      continue;
    }
  }

  return edits;
}

function collectImportEdit(
  decl: ts.ImportDeclaration,
  source: string,
  edits: Edit[]
): void {
  if (!ts.isStringLiteral(decl.moduleSpecifier)) return;
  if (decl.moduleSpecifier.text !== CORE_MODULE) return;
  const importClause = decl.importClause;
  if (!importClause || !importClause.namedBindings) return;
  if (!ts.isNamedImports(importClause.namedBindings)) return;

  const elements = importClause.namedBindings.elements;
  const toDrop = elements.filter((el) => HELPER_NAMES.has(el.name.text));
  if (toDrop.length === 0) return;

  const kept = elements.filter((el) => !HELPER_NAMES.has(el.name.text));

  // Whole import drained → drop the entire statement (including trailing newline).
  if (kept.length === 0 && !importClause.name) {
    edits.push(extendToTrailingNewline(decl.getFullStart(), decl.end, source));
    return;
  }

  // Rewrite just the named imports list, preserving surrounding original.
  // Find `{` and `}` positions in the named imports.
  const named = importClause.namedBindings;
  const openBrace = named.getStart(undefined, false);
  const closeBrace = named.end;

  // Reproduce the original style: detect if multi-line.
  const original = source.slice(openBrace, closeBrace);
  const isMultiline = original.includes("\n");

  const renderedNames = kept.map((el) => el.getText());
  let rendered: string;
  if (isMultiline) {
    rendered = "{\n  " + renderedNames.join(",\n  ") + "\n}";
  } else {
    rendered = "{ " + renderedNames.join(", ") + " }";
  }

  edits.push({ start: openBrace, end: closeBrace, replacement: rendered });
}

function collectExportEdit(
  stmt: ts.VariableStatement,
  source: string,
  edits: Edit[]
): void {
  const isExported = stmt.modifiers?.some(
    (m) => m.kind === ts.SyntaxKind.ExportKeyword
  );
  if (!isExported) return;
  if (stmt.declarationList.declarations.length !== 1) return;
  const decl = stmt.declarationList.declarations[0];
  if (!decl.initializer) return;
  if (!ts.isCallExpression(decl.initializer)) return;
  const callee = decl.initializer.expression;
  if (!ts.isIdentifier(callee)) return;
  if (!HELPER_NAMES.has(callee.text)) return;

  // Drop the entire statement plus its leading blank line and trailing newline.
  // getFullStart() includes leading whitespace/trivia.
  edits.push(extendToTrailingNewline(stmt.getFullStart(), stmt.end, source));
}

function extendToTrailingNewline(
  start: number,
  _end: number,
  _source: string
): Edit {
  // Note: `start` is getFullStart(), which includes leading whitespace/trivia
  // (the blank line before the export). We delete from there through the
  // statement's end. We do NOT eat a trailing newline — that creates
  // overlapping-edit hazards when multiple consecutive exports are dropped.
  // The post-process formatter (vp fmt) will collapse any blank-line runs.
  return { start, end: _end, replacement: "" };
}

function applyEdits(source: string, edits: Edit[]): string {
  // Apply from end to start so indices stay valid.
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  let result = source;
  for (const e of sorted) {
    result = result.slice(0, e.start) + e.replacement + result.slice(e.end);
  }
  return result;
}
