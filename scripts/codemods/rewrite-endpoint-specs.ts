/**
 * Phase 2 codemod: rewrite endpoint specs to drop redundant tRPC and react-query
 * tests while preserving the *Safe (input + output validation pipeline) test
 * via an inline toValidated() call.
 *
 * Targets: packages/client/src/** /__tests__ /*.spec.ts
 *
 * Per spec file:
 *   1. Drop imports of `*Safe`, `*Procedure`, `*Query` from the endpoint file.
 *   2. Drop imports of `runProcedure`, `runMutation`, `runQuery`, `waitFor`.
 *   3. Add `import { toValidated } from "@discordkit/core";`.
 *   4. Drop the `it("is tRPC compatible", ...)` and `it("is react-query compatible", ...)` blocks.
 *   5. Rewrite the `it("can be used standalone", ...)` block:
 *      - Rename label to `"validates input, fetches, and validates output"`.
 *      - Replace the inner `xxxSafe(...)` call with `toValidated(xxx, ...schemasFromMock)(...)`.
 *      - The schemas come from the mockUtils.request.METHOD(url, ...) call's 2nd and 3rd args.
 *
 * Skips files that don't match the expected shape (we log them and proceed).
 */

import { readFileSync, writeFileSync, globSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), `../..`);

const specs = (
  globSync(`packages/client/src/**/__tests__/*.spec.ts`, {
    cwd: projectRoot
  }) as string[]
).map((p) => resolve(projectRoot, p));

const DROPPED_TEST_HELPERS = new Set([
  `runProcedure`,
  `runMutation`,
  `runQuery`
]);

const REDUNDANT_TEST_LABELS = new Set([
  `is tRPC compatible`,
  `is react-query compatible`
]);

const STANDALONE_LABEL = `can be used standalone`;
const NEW_TEST_LABEL = `validates input, fetches, and validates output`;

interface Edit {
  start: number;
  end: number;
  replacement: string;
}

interface Stats {
  rewritten: number;
  skipped: number;
  notMatching: string[];
}

const stats: Stats = { rewritten: 0, skipped: 0, notMatching: [] };

for (const file of specs) {
  const source = readFileSync(file, `utf8`);
  const result = rewriteSpec(file, source);
  if (result.kind === `skip`) {
    stats.skipped++;
    continue;
  }
  if (result.kind === `no-match`) {
    stats.notMatching.push(
      file.replace(projectRoot + `\\`, ``).replace(/\\/g, `/`)
    );
    continue;
  }
  writeFileSync(file, result.next, `utf8`);
  stats.rewritten++;
}

console.log(
  `rewrite-endpoint-specs: ${stats.rewritten} rewritten, ${stats.skipped} skipped (already clean), ${stats.notMatching.length} not matching expected shape`
);
if (stats.notMatching.length > 0) {
  console.log(`\nFiles that didn't match expected shape (need manual review):`);
  for (const f of stats.notMatching.slice(0, 25)) console.log(`  - ${f}`);
  if (stats.notMatching.length > 25)
    console.log(`  ... and ${stats.notMatching.length - 25} more`);
}

type RewriteResult =
  | { kind: `rewritten`; next: string }
  | { kind: `skip` }
  | { kind: `no-match`; reason: string };

function rewriteSpec(filePath: string, source: string): RewriteResult {
  const sf = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  // Find the describe(...) call.
  const describeCall = findDescribeCall(sf);
  if (!describeCall) return { kind: `no-match`, reason: `no describe()` };

  const describeBody = getDescribeBody(describeCall);
  if (!describeBody)
    return { kind: `no-match`, reason: `describe body not a block` };

  // Find mockUtils.request.METHOD(url, ...) call to extract schemas.
  const mockCall = findMockRequestCall(describeBody);
  if (!mockCall)
    return { kind: `no-match`, reason: `no mockUtils.request.METHOD() call` };
  const schemas = extractSchemas(mockCall);

  // Find the it() blocks.
  const itBlocks = findItCalls(describeBody);
  const standalone = itBlocks.find((it) => getLabel(it) === STANDALONE_LABEL);
  const redundant = itBlocks.filter((it) => {
    const l = getLabel(it);
    return l !== null && REDUNDANT_TEST_LABELS.has(l);
  });

  // Already clean: standalone gone, no redundant. Skip.
  const newLabel = itBlocks.find((it) => getLabel(it) === NEW_TEST_LABEL);
  if (!standalone && redundant.length === 0 && newLabel) {
    return { kind: `skip` };
  }
  if (!standalone) return { kind: `no-match`, reason: `no standalone it()` };

  const edits: Edit[] = [];

  // Edit 1: drop redundant it() blocks.
  for (const it of redundant) {
    edits.push({
      start: it.getFullStart(),
      end: it.end + skipTrailingSemicolon(it.end, source),
      replacement: ``
    });
  }

  // Edit 2: rewrite the standalone it() call.
  const standaloneRewrite = buildStandaloneReplacement(
    standalone,
    schemas,
    source,
    sf
  );
  if (!standaloneRewrite)
    return { kind: `no-match`, reason: `standalone rewrite failed` };
  edits.push(standaloneRewrite);

  // Edit 3: clean imports — drop dropped names, add toValidated.
  const importEdits = computeImportEdits(sf, source);
  edits.push(...importEdits);

  const next = applyEdits(source, edits);
  return { kind: `rewritten`, next };
}

function findDescribeCall(sf: ts.SourceFile): ts.CallExpression | undefined {
  for (const stmt of sf.statements) {
    if (
      ts.isExpressionStatement(stmt) &&
      ts.isCallExpression(stmt.expression)
    ) {
      const call = stmt.expression;
      if (
        ts.isIdentifier(call.expression) &&
        call.expression.text === `describe`
      ) {
        return call;
      }
    }
  }
  return undefined;
}

function getDescribeBody(call: ts.CallExpression): ts.Block | undefined {
  // describe(label, options?, body) — body is the last argument and an arrow function.
  const lastArg = call.arguments[call.arguments.length - 1];
  if (!lastArg) return undefined;
  if (ts.isArrowFunction(lastArg) || ts.isFunctionExpression(lastArg)) {
    if (lastArg.body && ts.isBlock(lastArg.body)) return lastArg.body;
  }
  return undefined;
}

function findMockRequestCall(block: ts.Block): ts.CallExpression | undefined {
  let found: ts.CallExpression | undefined;
  function visit(node: ts.Node): void {
    if (found) return;
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isPropertyAccessExpression(node.expression.expression) &&
      ts.isIdentifier(node.expression.expression.expression) &&
      node.expression.expression.expression.text === `mockUtils` &&
      node.expression.expression.name.text === `request`
    ) {
      found = node;
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(block);
  return found;
}

function extractSchemas(mockCall: ts.CallExpression): {
  input: string | null;
  output: string | null;
} {
  // mockUtils.request.METHOD(url, input?, output?)
  // arguments[0] is url; we only care about [1] and [2].
  const args = mockCall.arguments;
  const inputExpr = args[1];
  const outputExpr = args[2];
  return {
    input: inputExpr ? inputExpr.getText() : null,
    output: outputExpr ? outputExpr.getText() : null
  };
}

function findItCalls(block: ts.Block): ts.CallExpression[] {
  const results: ts.CallExpression[] = [];
  for (const stmt of block.statements) {
    if (
      ts.isExpressionStatement(stmt) &&
      ts.isCallExpression(stmt.expression) &&
      ts.isIdentifier(stmt.expression.expression) &&
      stmt.expression.expression.text === `it`
    ) {
      results.push(stmt.expression);
    }
  }
  return results;
}

function getLabel(itCall: ts.CallExpression): string | null {
  const first = itCall.arguments[0];
  if (!first) return null;
  if (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first)) {
    return first.text;
  }
  return null;
}

function skipTrailingSemicolon(pos: number, source: string): number {
  return source[pos] === `;` ? 1 : 0;
}

/**
 * Replace the `*Safe(...)` call inside `it("can be used standalone", ...)`
 * with `toValidated(fn, inputSchema, outputSchema)(...)`. Rename the label.
 */
function buildStandaloneReplacement(
  itCall: ts.CallExpression,
  schemas: { input: string | null; output: string | null },
  source: string,
  sf: ts.SourceFile
): Edit | undefined {
  const labelArg = itCall.arguments[0];
  const bodyArg = itCall.arguments[itCall.arguments.length - 1];
  if (!labelArg || !bodyArg) return undefined;
  if (!ts.isArrowFunction(bodyArg) && !ts.isFunctionExpression(bodyArg))
    return undefined;
  if (!bodyArg.body) return undefined;
  if (!ts.isBlock(bodyArg.body)) return undefined;

  // Find the *Safe call in the body. It's the innermost call to an identifier
  // ending in "Safe".
  let safeCall: ts.CallExpression | undefined;
  let safeIdentifier: string | undefined;
  function visit(node: ts.Node): void {
    if (safeCall) return;
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text.endsWith(`Safe`)
    ) {
      safeCall = node;
      safeIdentifier = node.expression.text;
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(bodyArg.body);

  if (!safeCall || !safeIdentifier) return undefined;

  const fetcherName = safeIdentifier.slice(0, -`Safe`.length);
  const argsText = safeCall.arguments.map((a) => a.getText()).join(`, `);

  // Build the toValidated args. Always pass (fn, inputSchema, outputSchema)
  // with `null` for any missing one — but trim trailing nulls for readability.
  const validatedArgs: string[] = [fetcherName];
  if (schemas.input !== null || schemas.output !== null) {
    validatedArgs.push(schemas.input ?? `null`);
  }
  if (schemas.output !== null) {
    validatedArgs.push(schemas.output);
  }

  const newCall = `toValidated(${validatedArgs.join(`, `)})(${argsText})`;

  // Replace just the *Safe(...) call expression, not the whole it() block.
  const safeCallStart = safeCall.getStart(sf, false);
  const safeCallEnd = safeCall.end;

  // Also rename the label.
  const labelStart = labelArg.getStart(sf, false);
  const labelEnd = labelArg.end;
  const quote = source[labelStart];
  const newLabel = `${quote}${NEW_TEST_LABEL}${quote}`;

  // Two edits combined into the it() block range.
  // Simplest: replace the whole it() expression with a printed version. But
  // since we're doing surgical edits, return separate edits via a synthetic
  // boundary. Easiest path: build a single replacement covering the full
  // expression statement.
  const enclosingStmt = findEnclosingStatement(itCall, sf);
  if (!enclosingStmt) return undefined;

  // Take the original text and apply two sub-edits to get the new content.
  const fullStart = enclosingStmt.getStart(sf, false);
  const fullEnd = enclosingStmt.end;
  const original = source.slice(fullStart, fullEnd);

  // Translate positions to be relative to `original`.
  const offset = fullStart;
  const subEdits: Array<{ s: number; e: number; r: string }> = [
    { s: labelStart - offset, e: labelEnd - offset, r: newLabel },
    { s: safeCallStart - offset, e: safeCallEnd - offset, r: newCall }
  ].sort((a, b) => b.s - a.s);

  let updated = original;
  for (const se of subEdits) {
    updated = updated.slice(0, se.s) + se.r + updated.slice(se.e);
  }

  return { start: fullStart, end: fullEnd, replacement: updated };
}

function findEnclosingStatement(
  node: ts.Node,
  sf: ts.SourceFile
): ts.Statement | undefined {
  let current: ts.Node | undefined = node;
  while (current && current !== sf) {
    if (ts.isExpressionStatement(current)) return current;
    current = current.parent;
  }
  return undefined;
}

function computeImportEdits(sf: ts.SourceFile, source: string): Edit[] {
  const edits: Edit[] = [];
  let coreImport: ts.ImportDeclaration | undefined;
  let hasToValidated = false;

  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt)) continue;
    if (!ts.isStringLiteral(stmt.moduleSpecifier)) continue;
    const moduleName = stmt.moduleSpecifier.text;
    const ic = stmt.importClause;
    if (!ic || !ic.namedBindings) continue;
    if (!ts.isNamedImports(ic.namedBindings)) continue;

    const elements = ic.namedBindings.elements;

    if (moduleName === `@discordkit/core`) {
      coreImport = stmt;
      for (const el of elements) {
        if (el.name.text === `toValidated`) hasToValidated = true;
      }
    }

    // Drop *Safe / *Procedure / *Query from any endpoint import (relative path
    // ending in .js). Also drop runProcedure/runMutation/runQuery from
    // #test-utils and waitFor from @testing-library/*.
    const isEndpointImport =
      moduleName.startsWith(`../`) || moduleName.startsWith(`./`);
    const droppedNames: string[] = [];
    const kept = elements.filter((el) => {
      const n = el.name.text;
      if (
        isEndpointImport &&
        (n.endsWith(`Safe`) || n.endsWith(`Procedure`) || n.endsWith(`Query`))
      ) {
        droppedNames.push(n);
        return false;
      }
      if (moduleName === `#test-utils` && DROPPED_TEST_HELPERS.has(n)) {
        return false;
      }
      if (moduleName.startsWith(`@testing-library/`) && n === `waitFor`) {
        return false;
      }
      return true;
    });

    // If this is an endpoint import and we dropped *Safe (the canonical
    // suffix the rewritten test uses), make sure the bare Fetcher name
    // is in the kept list so the spec can still reference it.
    if (isEndpointImport && droppedNames.length > 0) {
      // Derive Fetcher name from any dropped specifier.
      const safeName = droppedNames.find((n) => n.endsWith(`Safe`));
      const fetcherName = safeName
        ? safeName.slice(0, -`Safe`.length)
        : droppedNames[0].endsWith(`Procedure`)
          ? droppedNames[0].slice(0, -`Procedure`.length)
          : droppedNames[0].slice(0, -`Query`.length);

      const alreadyImported = kept.some((el) => el.name.text === fetcherName);
      if (!alreadyImported) {
        kept.push(
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier(fetcherName)
          )
        );
      }
    }

    if (kept.length === elements.length) continue;

    if (kept.length === 0 && !ic.name) {
      edits.push({
        start: stmt.getFullStart(),
        end: stmt.end,
        replacement: ``
      });
      continue;
    }

    const openBrace = ic.namedBindings.getStart(sf, false);
    const closeBrace = ic.namedBindings.end;
    const original = source.slice(openBrace, closeBrace);
    const isMultiline = original.includes(`\n`);
    const renderedNames = kept.map((el) =>
      // Synthetic specifiers don't have positions; use the identifier text directly.
      el.pos === -1 ? el.name.text : el.getText()
    );
    const rendered = isMultiline
      ? `{\n  ` + renderedNames.join(`,\n  `) + `\n}`
      : `{ ` + renderedNames.join(`, `) + ` }`;
    edits.push({ start: openBrace, end: closeBrace, replacement: rendered });
  }

  // Add toValidated to the core import (or insert a new import).
  if (!hasToValidated) {
    if (coreImport) {
      // Append to the existing core import's named imports list.
      const ic = coreImport.importClause!;
      if (ic.namedBindings && ts.isNamedImports(ic.namedBindings)) {
        const elements = ic.namedBindings.elements;
        const keptAfter = elements.filter((el) => {
          // After applying drop logic above, we know what'll remain.
          // For this synthesis, just retain everything that wouldn't be dropped.
          return true; // We trust the prior edit already dropped what's needed.
        });
        // The simplest approach: replace the existing edit (if any) that targeted
        // this import, OR if no edit existed, just insert toValidated.
        // For safety, we re-build the named imports list from scratch including
        // toValidated, and emit a single edit replacing the named imports range.
        const openBrace = ic.namedBindings.getStart(sf, false);
        const closeBrace = ic.namedBindings.end;
        const namesAfterDrops = elements
          .filter((el) => {
            const n = el.name.text;
            return !(
              n.endsWith(`Safe`) ||
              n.endsWith(`Procedure`) ||
              n.endsWith(`Query`)
            );
          })
          .map((el) => el.getText());
        if (!namesAfterDrops.some((n) => n === `toValidated`))
          namesAfterDrops.push(`toValidated`);

        const original = source.slice(openBrace, closeBrace);
        const isMultiline = original.includes(`\n`);
        const rendered = isMultiline
          ? `{\n  ` + namesAfterDrops.join(`,\n  `) + `\n}`
          : `{ ` + namesAfterDrops.join(`, `) + ` }`;

        // Remove any previously-queued edit covering this range, then add ours.
        const filteredEdits = edits.filter(
          (e) => !(e.start === openBrace && e.end === closeBrace)
        );
        edits.length = 0;
        edits.push(...filteredEdits, {
          start: openBrace,
          end: closeBrace,
          replacement: rendered
        });
      }
    } else {
      // No existing @discordkit/core import — insert one at the top.
      const firstImport = sf.statements.find((s) => ts.isImportDeclaration(s));
      const insertPos = firstImport ? firstImport.getStart(sf, false) : 0;
      edits.push({
        start: insertPos,
        end: insertPos,
        replacement: `import { toValidated } from "@discordkit/core";\n`
      });
    }
  }

  return edits;
}

function applyEdits(source: string, edits: Edit[]): string {
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  let result = source;
  for (const e of sorted) {
    result = result.slice(0, e.start) + e.replacement + result.slice(e.end);
  }
  return result;
}
