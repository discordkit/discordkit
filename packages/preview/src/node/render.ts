import type { Finding } from "../findings.js";
import { hasErrors } from "../findings.js";
import { lint, type Count } from "../lint/index.js";
import type { InputKind } from "../scene/intake.js";
import type { Scene } from "../scene.js";
import { locate } from "./assets.js";
import {
  renderScene,
  UndrawableSceneError,
  type RenderOptions,
  type RenderResult
} from "./renderScene.js";

/** Render options, plus scene settings that replace the input's own. */
export interface RenderInputOptions
  extends
    RenderOptions,
    Pick<Scene, `theme` | `width` | `now` | `timeZone` | `locale`> {}

export interface RenderInputResult {
  kind: InputKind;
  /** The input as a normalised scene with the given settings applied: what was drawn. Absent when the input could not be read at all. */
  scene?: Scene;
  /** Intake's, lint's and the renderer's findings in one list, each with a path into the input as the caller wrote it. A missing attachment is reported once, by lint. */
  findings: Finding[];
  /** How much of each of Discord's limits every message uses. */
  counts: Count[];
  /** No finding is an error: Discord would accept every message, and an image was drawn. */
  valid: boolean;
  /** The drawing, when there is one. Absent when the input could not be read or the scene cannot be drawn, and the findings say why. Present even when the findings hold errors, since seeing a broken message is often the point. */
  image?: Omit<RenderResult, `findings`>;
}

/**
 * Reads anything `readScene` accepts, lints it and draws it, in one call: what the `render` command runs for each input.
 *
 * A scene with a component the renderer cannot draw yet is not drawn: lint's `component-unsupported` finding is raised to an error here, since it means there is no image. Any other scene the components refuse becomes a `scene-undrawable` finding. Neither throws. A browser that cannot launch, a stylesheet that is missing (the package is not built) or a supplied font that cannot be read still throws, since those are about this machine, not the input.
 *
 * @example
 * const { valid, findings, image } = await render(payloadJson, { scale: 2, cjk: `noto-sans-jp` });
 * if (image) await writeFile(`preview.png`, image.png);
 */
export const render = async (
  input: unknown,
  { theme, width, now, timeZone, locale, ...options }: RenderInputOptions = {}
): Promise<RenderInputResult> => {
  const linted = lint(input);
  if (linted.scene === undefined) {
    return {
      kind: linted.kind,
      findings: linted.findings,
      counts: [],
      valid: false
    };
  }
  const settings = Object.fromEntries(
    Object.entries({ theme, width, now, timeZone, locale }).filter(
      ([, value]) => value !== undefined
    )
  );
  const scene: Scene = { ...linted.scene, ...settings };
  const findings = linted.findings.map((finding): Finding =>
    finding.code === `component-unsupported`
      ? { ...finding, severity: `error` }
      : finding
  );
  const unrendered = {
    kind: linted.kind,
    scene,
    counts: linted.counts,
    valid: false
  };
  if (findings.some((finding) => finding.code === `component-unsupported`)) {
    return { ...unrendered, findings };
  }

  let drawn: RenderResult;
  try {
    drawn = await renderScene(scene, options);
  } catch (error) {
    if (!(error instanceof UndrawableSceneError)) throw error;
    return {
      ...unrendered,
      findings: [
        ...findings,
        {
          code: `scene-undrawable`,
          severity: `error`,
          path: [],
          message: `No image was drawn. ${error.message} ${
            hasErrors(findings)
              ? `This usually follows from an error reported above; fix those first.`
              : `Nothing else was found wrong with the input, so this may be a bug in @discordkit/preview: report it with the input that caused it.`
          }`
        }
      ]
    };
  }

  // Intake parsed a string input without error to get this far, so this cannot throw.
  const raw: unknown = typeof input === `string` ? JSON.parse(input) : input;
  const reportedByLint = new Set(
    findings
      .filter((finding) => finding.code === `attachment-missing`)
      .map((finding) => finding.asset)
  );
  const all = [
    ...findings,
    ...drawn.findings
      .filter(
        (finding) =>
          finding.code !== `attachment-missing` ||
          !reportedByLint.has(finding.asset)
      )
      .map((finding) => ({ ...finding, path: locate(raw, finding.asset) }))
  ];
  const { findings: _, ...image } = drawn;
  return {
    kind: linted.kind,
    scene,
    findings: all,
    counts: linted.counts,
    valid: !hasErrors(all),
    image
  };
};
