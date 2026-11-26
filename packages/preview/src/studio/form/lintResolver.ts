import { isObject } from "@discordkit/core/utils/isObject";
import { set, type FieldErrors, type Resolver } from "react-hook-form";
import type { Finding, PathSegment } from "../../findings.js";
import { lint, type LintResult } from "../../lint/index.js";
import type { Scene } from "../../scene.js";
import { prune } from "../editor/prune.js";

let last: { key: string; result: LintResult } | undefined;

/**
 * `lint` for the form's current scene, computed once per distinct scene. The resolver and the findings panel both ask for it on every change, and the scene is the same for both.
 */
export const lintScene = (scene: Scene): LintResult => {
  const key = JSON.stringify(scene);
  if (last?.key !== key) last = { key, result: lint(scene) };
  return last.result;
};

/** One field's error: the most severe finding there decides `type`, and every finding there is kept in `types` by code. */
interface FindingError {
  type: Finding[`severity`];
  message: string;
  types: Record<string, string>;
}

const valueAt = (value: unknown, path: readonly PathSegment[]): unknown =>
  path.reduce<unknown>(
    (node, segment) =>
      Array.isArray(node)
        ? node[Number(segment)]
        : isObject(node)
          ? node[String(segment)]
          : undefined,
    value
  );

/**
 * Turns lint's findings into react-hook-form's nested errors object, keyed by the same scene paths the form's fields are registered at, so a finding lands on its field with no mapping table.
 *
 * - A finding on a field (a string, number or boolean in the scene) is that field's error.
 * - A finding on an object or array (a component, a list of components) is put under its `root` key, as react-hook-form does for field arrays, so it does not collide with its children's errors: `errors.messages[0].payload.components.root`.
 * - A finding about the whole input (an empty path) is `errors.root.lint`.
 *
 * `type` is the most severe finding's severity (`error` or `warning`) and `message` its message; `types` holds every finding at that path by code. Warnings are errors here too, since the form has nothing to submit and the fields show both.
 */
export const findingsToErrors = (
  findings: readonly Finding[],
  scene: Scene
): FieldErrors<Scene> => {
  const byPath = new Map<string, FindingError>();
  for (const finding of findings) {
    const target = valueAt(scene, finding.path);
    const path: PathSegment[] =
      finding.path.length === 0
        ? [`root`, `lint`]
        : typeof target === `object` && target !== null
          ? [...finding.path, `root`]
          : finding.path;
    const key = path.join(`.`);
    const existing = byPath.get(key);
    if (existing === undefined) {
      byPath.set(key, {
        type: finding.severity,
        message: finding.message,
        types: { [finding.code]: finding.message }
      });
    } else {
      existing.types[finding.code] = finding.message;
      if (existing.type === `warning` && finding.severity === `error`) {
        existing.type = `error`;
        existing.message = finding.message;
      }
    }
  }
  // react-hook-form's own `set`, so the nesting (arrays for numeric segments) is exactly what its `get` and `getFieldState` read back.
  const errors: FieldErrors<Scene> = {};
  for (const [key, error] of byPath) set(errors, key, error);
  return errors;
};

/**
 * The form's resolver: the package's own `lint`, so Studio can never disagree with the command line about what is wrong with a message. With no findings the values pass through unchanged, since the form holds the scene itself.
 */
export const lintResolver: Resolver<Scene> = (values) => {
  // Lint sees what is written: the form's cleared fields are absent, not `undefined`.
  const scene = prune(values);
  const { findings } = lintScene(scene);
  return findings.length === 0
    ? { values, errors: {} }
    : { values: {}, errors: findingsToErrors(findings, scene) };
};
