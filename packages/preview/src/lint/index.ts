import type { Finding } from "../findings.js";
import { hasErrors } from "../findings.js";
import { intake, type InputKind } from "../scene/intake.js";
import type { Scene } from "../scene.js";
import { lintScene, type Count } from "./lintScene.js";

export * from "./limits.js";
export { lintScene } from "./lintScene.js";
export type { Count, CountMetric, LintSceneResult } from "./lintScene.js";
export { markdownFindings } from "./markdown.js";
export { formatPath, hasErrors } from "../findings.js";
export type {
  Finding,
  FindingCode,
  IntakeCode,
  LintCode,
  Path,
  PathSegment,
  Severity
} from "../findings.js";

export interface LintResult {
  kind: InputKind;
  /** The input as a normalised scene, as `readScene` returns it. */
  scene?: Scene;
  /** Intake's findings (the client schemas' verdict), then lint's, each with a path into the input as the caller wrote it. */
  findings: Finding[];
  /** How much of each of Discord's limits every message uses, with a path to the message's payload. */
  counts: Count[];
  /** No finding is an error: Discord would accept every message, and the preview can draw them. */
  valid: boolean;
}

const schemaCodes = new Set<string>([`schema`, `schema-position`]);

/**
 * Reads anything `readScene` accepts and lints it, in one call: the client schemas' findings, lint's findings and the counts behind each limit, all with paths into the input as the caller wrote it (snake_case stays snake_case).
 *
 * Where a lint rule and the client schema reject the same field, only lint's finding is kept, since it says more about why and what to do.
 *
 * @example
 * const { valid, findings, counts } = lint(JSON.parse(payloadJson));
 */
export const lint = (input: unknown): LintResult => {
  const read = intake(input);
  if (read.scene === undefined) {
    return {
      kind: read.kind,
      findings: read.findings,
      counts: [],
      valid: false
    };
  }
  const linted = lintScene(read.scene);
  const lintFindings = linted.findings.map((finding) => ({
    ...finding,
    path: read.toInputPath(finding.path)
  }));
  const covered = new Set(
    lintFindings
      .filter((finding) => finding.severity === `error`)
      .map((finding) => JSON.stringify(finding.path))
  );
  const findings = [
    ...read.findings.filter(
      (finding) =>
        !schemaCodes.has(finding.code) ||
        !covered.has(JSON.stringify(finding.path))
    ),
    ...lintFindings
  ];
  return {
    kind: read.kind,
    scene: read.scene,
    findings,
    counts: linted.counts.map((count) => ({
      ...count,
      path: read.toInputPath(count.path)
    })),
    valid: !hasErrors(findings)
  };
};
