import type { Finding } from "../findings.js";
import { hasErrors } from "../findings.js";
import { lint, type Count } from "../lint/index.js";
import type { InputKind } from "../scene/intake.js";
import type { Scene } from "../scene.js";
import {
  resolveViewport,
  sceneViewports,
  type ResolvedViewport,
  type SceneViewport
} from "../viewport.js";
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
    Omit<RenderOptions, `viewports` | `scale`>,
    Pick<Scene, `theme` | `width` | `now` | `timeZone` | `locale`> {
  /** The views to draw, replacing the scene's own `viewports` and `width`. Without it, the scene's are drawn, or one 600-pixel column when it names none. `width` alone is the same as `[{ width }]`. */
  viewports?: readonly SceneViewport[];
  /** Device pixels per CSS pixel, up to 4, or `device` for each device's own pixel density, so a phone's image is as wide as a screenshot taken on it (a free width counts as 1). One image holding several viewports takes one scale, so `device` there needs every viewport to have the same density. Defaults to 1. */
  scale?: number | `device`;
  /** Draw each viewport to its own image (`images`) instead of all of them side by side in one (`image`). Defaults to false. */
  separate?: boolean;
}

/** An image, without the renderer's findings, which are merged into the result's. */
export type RenderedImage = Omit<RenderResult, `findings`>;

export interface RenderInputResult {
  kind: InputKind;
  /** The input as a normalised scene with the given settings applied: what was drawn. Absent when the input could not be read at all. */
  scene?: Scene;
  /** Intake's, lint's and the renderer's findings in one list, each with a path into the input as the caller wrote it. A missing attachment is reported once, by lint. They are about the message, so they are the same whichever viewports it is drawn in. */
  findings: Finding[];
  /** How much of each of Discord's limits every message uses. */
  counts: Count[];
  /** No finding is an error: Discord would accept every message, and an image was drawn. */
  valid: boolean;
  /** The views drawn, in order, each with its device, layout and chat column. Empty when nothing could be drawn. */
  viewports: ResolvedViewport[];
  /** The drawing, with every viewport side by side, when there is one and `separate` was not asked for. Absent when the input could not be read or the scene cannot be drawn, and the findings say why. Present even when the findings hold errors, since seeing a broken message is often the point. */
  image?: RenderedImage;
  /** With `separate`: one image per viewport, in the order of `viewports`. */
  images?: RenderedImage[];
}

/** The scale every image is drawn at, or a message saying why the asked-for one cannot be used. */
const scaleFor = (
  scale: number | `device`,
  viewports: readonly ResolvedViewport[]
): number => {
  if (scale !== `device`) return scale;
  const ratios = [...new Set(viewports.map((viewport) => viewport.pixelRatio))];
  if (ratios.length > 1) {
    throw new Error(
      `@discordkit/preview/node cannot draw ${viewports.map((viewport) => `${viewport.name} (${String(viewport.pixelRatio)}x)`).join(`, `)} side by side at each device's own pixel density, because one image has one scale. Give a number for the scale, or draw each viewport to its own image (\`separate: true\`, \`--separate\` on the command line), which can use each device's density.`
    );
  }
  return ratios[0] ?? 1;
};

/**
 * Reads anything `readScene` accepts, lints it and draws it, in one call: what the `render` command runs for each input.
 *
 * A scene with a component the renderer cannot draw yet is not drawn: lint's `component-unsupported` finding is raised to an error here, since it means there is no image. So is a scene naming a device the registry does not have (`viewport-device-unknown`). Any other scene the components refuse becomes a `scene-undrawable` finding. None of these throw. A browser that cannot launch, a stylesheet that is missing (the package is not built), a supplied font that cannot be read, or options that cannot be used together still throw, since those are about the call, not the input.
 *
 * @example
 * const { valid, findings, image } = await render(payloadJson, { scale: 2, cjk: `noto-sans-jp` });
 * if (image) await writeFile(`preview.png`, image.png);
 */
export const render = async (
  input: unknown,
  {
    theme,
    width,
    now,
    timeZone,
    locale,
    viewports: givenViewports,
    scale = 1,
    separate = false,
    ...options
  }: RenderInputOptions = {}
): Promise<RenderInputResult> => {
  // An unknown device passed by the caller is a mistake in the call, so it throws here, before anything is read.
  const asked =
    givenViewports?.map(resolveViewport) ??
    (width === undefined ? undefined : [resolveViewport({ width })]);
  const linted = lint(input);
  if (linted.scene === undefined) {
    return {
      kind: linted.kind,
      findings: linted.findings,
      counts: [],
      valid: false,
      viewports: []
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
    valid: false,
    viewports: []
  };
  if (findings.some((finding) => finding.code === `component-unsupported`)) {
    return { ...unrendered, findings };
  }
  if (
    asked === undefined &&
    findings.some((finding) => finding.code === `viewport-device-unknown`)
  ) {
    return { ...unrendered, findings };
  }
  const viewports = asked ?? sceneViewports(linted.scene).map(resolveViewport);
  const shared = scaleFor(scale, separate ? [] : viewports);

  let drawn: RenderResult[];
  try {
    drawn = separate
      ? await viewports.reduce<Promise<RenderResult[]>>(
          async (done, viewport) => [
            ...(await done),
            await renderScene(scene, {
              ...options,
              viewports: [viewport],
              scale: scale === `device` ? viewport.pixelRatio : scale
            })
          ],
          Promise.resolve([])
        )
      : [await renderScene(scene, { ...options, viewports, scale: shared })];
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
  // Each image draws the same message, so a placeholder is reported once however many images show it.
  const seen = new Set<string>();
  const drawnFindings = drawn
    .flatMap((image) => image.findings)
    .filter((finding) => {
      const key = `${finding.code}|${finding.asset}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const all = [
    ...findings,
    ...drawnFindings
      .filter(
        (finding) =>
          finding.code !== `attachment-missing` ||
          !reportedByLint.has(finding.asset)
      )
      .map((finding) => ({ ...finding, path: locate(raw, finding.asset) }))
  ];
  const images = drawn.map(({ findings: _, ...image }) => image);
  return {
    kind: linted.kind,
    scene,
    findings: all,
    counts: linted.counts,
    valid: !hasErrors(all),
    viewports,
    ...(separate ? { images } : { image: images[0] })
  };
};
