/**
 * What scene intake, lint, codegen and the Node renderer report, in one shape so a caller can print them together as JSON.
 */

/** `error`: Discord would refuse the message, or the preview cannot draw the scene as written. `warning`: it would send, but probably not look or behave as intended. */
export type Severity = `error` | `warning`;

export type PathSegment = string | number;

/** Where a finding points: keys and array indexes from the root of what the caller passed in, spelled as the caller spelled them (`custom_id` stays `custom_id` when the input was snake_case). An empty path is the input as a whole. */
export type Path = PathSegment[];

/** Intake: the input could not be read as a scene, a message payload or components. */
export type IntakeCode =
  | `input-json`
  | `input-unrecognised`
  | `duplicate-key`
  | `scene`
  | `schema`
  | `schema-position`;

/** Lint: a rule @discordkit/client's schemas do not enforce, or a limit worth seeing before it is hit. */
export type LintCode =
  | `message-empty`
  | `content-length`
  | `components-v2-flag-missing`
  | `components-v2-content`
  | `components-total`
  | `text-display-length`
  | `classic-action-rows`
  | `embed-count`
  | `embed-total-length`
  | `custom-id-duplicate`
  | `custom-id-length`
  | `action-row-size`
  | `action-row-mixed`
  | `button-style-fields`
  | `button-label-length`
  | `button-url-length`
  | `alt-text-length`
  | `section-component-count`
  | `select-option-count`
  | `select-option-label-length`
  | `select-option-value-length`
  | `select-option-description-length`
  | `select-placeholder-length`
  | `select-values-range`
  | `select-default-count`
  | `file-not-attachment`
  | `open-select-missing`
  | `attachment-missing`
  | `component-unsupported`
  | `component-modal-only`
  | `component-message-only`
  | `modal-component-position`
  | `modal-component-count`
  | `modal-title-length`
  | `modal-action-row`
  | `modal-disabled`
  | `modal-value-invalid`
  | `label-length`
  | `label-description-length`
  | `text-input-length-range`
  | `text-input-value-length`
  | `text-input-value-range`
  | `text-input-placeholder-length`
  | `text-input-label`
  | `text-input-legacy-row`
  | `select-required-in-message`
  | `min-values-required`
  | `group-option-count`
  | `group-option-length`
  | `radio-default-count`
  | `values-range`
  | `file-types`
  | `checkbox-required`
  | `subtext-missing-space`
  | `heading-missing-space`
  | `heading-not-at-line-start`
  | `heading-too-deep`
  | `markdown-unsupported-here`
  | `mention-literal`
  | `link-scheme`
  | `viewport-device-unknown`
  | `viewport-width-ignored`;

/** Rendering: an image the Node renderer drew as a placeholder (`attachment-missing` is lint's code, shared), or a scene it could not draw at all. */
export type RenderCode =
  | `asset-offline`
  | `asset-fetch-failed`
  | `asset-unsupported`
  | `asset-undecodable`
  | `attachment-unreadable`
  | `scene-undrawable`;

export type FindingCode = IntakeCode | LintCode | RenderCode;

export interface Finding {
  /** Stable identifier for the rule, for matching on in code. */
  code: FindingCode;
  severity: Severity;
  path: Path;
  /** What happened, why it matters, and what to change. */
  message: string;
  /** For a finding about an image: the image as the scene names it, a URL or `attachment://name`. An image named in text (a Unicode emoji) has an empty `path`, and this says which it was. */
  asset?: string;
}

const identifier = /^[A-Za-z_$][\w$]*$/;

/**
 * A path as one readable string, such as `messages[0].payload.components[2].content`. Keys that are not identifiers (an attachment's file name, say) are quoted: `context.attachments["card.png"]`. The empty path is the empty string.
 */
export const formatPath = (path: readonly PathSegment[]): string =>
  path
    .map((segment, index) =>
      typeof segment === `number`
        ? `[${String(segment)}]`
        : identifier.test(segment)
          ? `${index === 0 ? `` : `.`}${segment}`
          : `[${JSON.stringify(segment)}]`
    )
    .join(``);

/** Lint's codes for a component outside `supportedComponents` where it sits: a gap in the preview, or a modal's component in a message, a message's component in a modal, or a modal's component in the wrong place in it. The renderer throws for exactly these, reading the same list. */
export const placementCodes: ReadonlySet<FindingCode> = new Set<FindingCode>([
  `component-unsupported`,
  `component-modal-only`,
  `component-message-only`,
  `modal-component-position`
]);

/** Lint's codes for a scene the renderer refuses to draw: it throws for exactly these, a component outside `supportedComponents` where it sits (`placementCodes`) and an `openSelect` that names no String Select, reading the same lists lint does. Studio checks for them before drawing, so it never renders a scene that would throw. */
export const undrawableCodes: ReadonlySet<FindingCode> = new Set<FindingCode>([
  ...placementCodes,
  `open-select-missing`
]);

/** Whether any finding would stop the message being sent or the scene being drawn. */
export const hasErrors = (findings: readonly Finding[]): boolean =>
  findings.some((finding) => finding.severity === `error`);
