/**
 * What scene intake, lint and codegen report, in one shape so a caller can print them together as JSON.
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
  | `attachment-missing`
  | `component-unsupported`
  | `subtext-missing-space`
  | `heading-missing-space`
  | `heading-not-at-line-start`
  | `heading-too-deep`
  | `markdown-unsupported-here`
  | `mention-literal`
  | `link-scheme`;

export type FindingCode = IntakeCode | LintCode;

export interface Finding {
  /** Stable identifier for the rule, for matching on in code. */
  code: FindingCode;
  severity: Severity;
  path: Path;
  /** What happened, why it matters, and what to change. */
  message: string;
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

/** Whether any finding would stop the message being sent or the scene being drawn. */
export const hasErrors = (findings: readonly Finding[]): boolean =>
  findings.some((finding) => finding.severity === `error`);
