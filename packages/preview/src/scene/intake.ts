import * as v from "valibot";
import { isObject } from "@discordkit/core/utils/isObject";
import { createMessageSchema } from "@discordkit/client/messages/createMessage";
import { componentsV2Flag, isComponentsV2 } from "../components.js";
import type { Finding, PathSegment } from "../findings.js";
import { resolveClock } from "../format/timestamp.js";
import type { Scene } from "../scene.js";
import { issueFindings, type Translate } from "./issues.js";
import { camelise, toInputPath, type Origins } from "./normalise.js";

/** What the input turned out to be. `unknown` means none of the others, and comes with a finding saying so. */
export type InputKind =
  | `scene`
  | `message`
  | `components`
  | `component`
  | `unknown`;

export interface ReadSceneResult {
  kind: InputKind;
  /** The input as a scene in camelCase, ready for lint, codegen or the renderer. Absent only when the input could not be read as anything. Present but not to be trusted when `findings` holds errors. */
  scene?: Scene;
  /** What is wrong with the input, each with a path into the input as the caller wrote it. Empty when the payload is valid to send. */
  findings: Finding[];
}

/** `readScene` plus what lint and codegen need to point their own findings into the caller's input. */
export interface Intake extends ReadSceneResult {
  toInputPath: Translate;
}

/**
 * The body @discordkit/client validates for `createMessage`: `content`, `embeds`, `components`, `flags` and the rest. Validating against it means "valid here" is "valid to send".
 */
const messageBodySchema = createMessageSchema.entries.body;

/** Fields only a message body has, for telling a bare payload from a scene or a component. Checked before key conversion, so in both spellings. */
const payloadKeys = [
  `content`,
  `embeds`,
  `components`,
  `flags`,
  `attachments`,
  `tts`,
  `poll`,
  `allowed_mentions`,
  `allowedMentions`,
  `sticker_ids`,
  `stickerIds`,
  `message_reference`,
  `messageReference`
];

/** Scene context entries keyed by id or file name, whose keys are data and keep their spelling. */
const dataKeyedContext = new Set([
  `users`,
  `roles`,
  `channels`,
  `emoji`,
  `attachments`,
  `skus`
]);

const isDataKeyed = (path: readonly PathSegment[]): boolean =>
  path.length === 2 &&
  path[0] === `context` &&
  typeof path[1] === `string` &&
  dataKeyedContext.has(path[1]);

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/** Runs the renderer's own clock check, so a scene intake accepts is one the renderer can draw, and its error message becomes the finding's. */
const clockCheck = (
  field: `now` | `timeZone` | `locale`
): v.RawCheckAction<string> =>
  v.rawCheck<string>(({ dataset, addIssue }) => {
    if (!dataset.typed) return;
    try {
      resolveClock({ [field]: dataset.value });
    } catch (error) {
      addIssue({ message: errorMessage(error) });
    }
  });

const optionalString = v.exactOptional(v.string());
const optionalBoolean = v.exactOptional(v.boolean());

/** The scene around the payloads: what the renderer needs that a payload does not carry. Each payload is validated separately, against the client's schema. */
const sceneSchema = v.object({
  messages: v.pipe(
    v.array(
      v.object({
        payload: v.looseObject({}),
        author: optionalString,
        ephemeral: optionalBoolean,
        edited: optionalBoolean,
        timestamp: v.exactOptional(
          v.pipe(
            v.string(),
            v.check(
              (value) => !Number.isNaN(Date.parse(value)),
              `It is when the message was sent, which the header shows. Write it as an ISO 8601 date-time like "2026-11-25T16:05:00Z", or leave it out to use the scene's \`now\`.`
            )
          )
        ),
        openSelect: optionalString
      })
    ),
    v.minLength(1, `A scene needs at least one message to draw. Add one.`)
  ),
  context: v.exactOptional(
    v.object({
      users: v.exactOptional(
        v.record(
          v.string(),
          v.object({
            name: v.string(),
            avatar: optionalString,
            bot: optionalBoolean,
            verified: optionalBoolean
          })
        )
      ),
      roles: v.exactOptional(
        v.record(
          v.string(),
          v.object({ name: v.string(), color: v.exactOptional(v.number()) })
        )
      ),
      channels: v.exactOptional(
        v.record(
          v.string(),
          v.object({ name: v.string(), type: v.exactOptional(v.number()) })
        )
      ),
      emoji: v.exactOptional(
        v.record(
          v.string(),
          v.object({
            name: v.string(),
            url: v.string(),
            animated: optionalBoolean
          })
        )
      ),
      attachments: v.exactOptional(
        v.record(
          v.string(),
          v.object({ path: v.string(), size: v.exactOptional(v.number()) })
        )
      ),
      skus: v.exactOptional(
        v.record(
          v.string(),
          v.object({ name: v.string(), price: optionalString })
        )
      )
    })
  ),
  now: v.exactOptional(v.pipe(v.string(), clockCheck(`now`))),
  timeZone: v.exactOptional(v.pipe(v.string(), clockCheck(`timeZone`))),
  locale: v.exactOptional(v.pipe(v.string(), clockCheck(`locale`))),
  revealSpoilers: optionalBoolean,
  theme: v.exactOptional(v.picklist([`light`, `ash`, `dark`, `onyx`])),
  width: v.exactOptional(v.pipe(v.number(), v.integer(), v.minValue(1)))
});

const unrecognised = (detail: string): Finding => ({
  code: `input-unrecognised`,
  severity: `error`,
  path: [],
  message: `The input is ${detail}, which is not a scene, a message payload or components. Pass a scene (an object with \`messages\`), a message body (an object with \`content\`, \`embeds\`, \`components\` or \`flags\`), an array of components, or one component (an object with a numeric \`type\`), in snake_case or camelCase.`
});

const parseJson = (input: string): { value?: unknown; finding?: Finding } => {
  try {
    return { value: JSON.parse(input) as unknown };
  } catch (error) {
    return {
      finding: {
        code: `input-json`,
        severity: `error`,
        path: [],
        message: `The input is a string that is not valid JSON (${errorMessage(error)}), so it cannot be read as a scene or payload. Pass the parsed object, or fix the JSON.`
      }
    };
  }
};

const classify = (value: unknown): InputKind => {
  if (Array.isArray(value)) return `components`;
  if (!isObject(value)) return `unknown`;
  if (`messages` in value) return `scene`;
  // A component can have `components` too, but a message body never has a `type`.
  if (typeof value.type === `number`) return `component`;
  if (payloadKeys.some((key) => key in value)) return `message`;
  return `unknown`;
};

const describe = (value: unknown): string =>
  value === null
    ? `null`
    : Array.isArray(value)
      ? `an array`
      : typeof value === `object`
        ? `an object with none of the expected fields (it has ${
            Object.keys(value).length === 0
              ? `no keys`
              : Object.keys(value)
                  .map((key) => `\`${key}\``)
                  .join(`, `)
          })`
        : `a ${typeof value}`;

/** A payload made from bare components: the flag is added when they need it, as the renderer would assume. */
const componentsPayload = (components: unknown[]): Record<string, unknown> =>
  isComponentsV2({ components: components.filter(isObject) })
    ? { flags: componentsV2Flag, components }
    : { components };

const wrap = (kind: InputKind, value: unknown): unknown => {
  switch (kind) {
    case `message`:
      return { messages: [{ payload: value }] };
    case `components`:
      return {
        messages: [
          { payload: componentsPayload(Array.isArray(value) ? value : []) }
        ]
      };
    case `component`:
      return { messages: [{ payload: componentsPayload([value]) }] };
    case `scene`:
    case `unknown`:
      return value;
  }
};

/** A value shaped enough like a scene for lint, codegen and the renderer to walk. Whether its parts can be trusted is what the findings say. */
const isSceneShaped = (value: unknown): value is Scene =>
  isObject(value) && Array.isArray(value.messages);

/**
 * Reads whatever an agent hands over as a scene: a full scene, one message body, an array of components or one component, as an object or a JSON string, in Discord's snake_case or discordkit's camelCase or a mix. Keys are normalised to camelCase except where they are data (the ids and file names keying a scene's context).
 *
 * Every payload is validated with @discordkit/client's own schema for a message body, so a payload with no findings is one the client would send. Never throws: anything wrong with the input is a finding, with a path into the input as the caller wrote it.
 *
 * Bare components are wrapped in a message, with the `IS_COMPONENTS_V2` flag added when they hold a layout component.
 *
 * @example
 * const { kind, scene, findings } = readScene(`{"components":[{"type":17,"accent_color":3099502,"components":[]}],"flags":32768}`);
 */
export const intake = (input: unknown): Intake => {
  const identity: Translate = (path) => [...path];
  let raw = input;
  if (typeof input === `string`) {
    const parsed = parseJson(input);
    if (parsed.finding) {
      return {
        kind: `unknown`,
        findings: [parsed.finding],
        toInputPath: identity
      };
    }
    raw = parsed.value;
  }
  const kind = classify(raw);
  if (kind === `unknown`) {
    return {
      kind,
      findings: [unrecognised(describe(raw))],
      toInputPath: identity
    };
  }
  const camelised = camelise(raw, kind === `scene` ? isDataKeyed : undefined);
  const scene = wrap(kind, camelised.value);
  const origins: Origins = camelised.origins;
  const toInput: Translate = (path) => toInputPath(scene, path, origins);
  const findings = [...camelised.findings];
  const shape = v.safeParse(sceneSchema, scene);
  if (!shape.success) {
    findings.push(...issueFindings(shape.issues, [], toInput, `scene`));
  }
  if (isSceneShaped(scene)) {
    const messages: unknown[] = scene.messages;
    messages.forEach((message, index) => {
      const payload = isObject(message) ? message.payload : undefined;
      if (!isObject(payload)) return;
      const result = v.safeParse(messageBodySchema, payload);
      if (!result.success) {
        findings.push(
          ...issueFindings(
            result.issues,
            [`messages`, index, `payload`],
            toInput
          )
        );
      }
    });
  }
  return {
    kind,
    ...(isSceneShaped(scene) ? { scene } : {}),
    findings,
    toInputPath: toInput
  };
};

/** {@link intake} without the path translator, for printing as JSON. */
export const readScene = (input: unknown): ReadSceneResult => {
  const { kind, scene, findings } = intake(input);
  return scene === undefined ? { kind, findings } : { kind, scene, findings };
};
