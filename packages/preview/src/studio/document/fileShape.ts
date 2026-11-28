import { isObject } from "@discordkit/core/utils/isObject";
import { toCamelCase } from "@discordkit/core/utils/toCamelCase";
import { toSnakeCase } from "@discordkit/core/utils/toSnakeCase";
import { findOpenSelect } from "../../components.js";
import type { Path, PathSegment } from "../../findings.js";
import { isDataKeyed, type InputKind } from "../../scene/intake.js";
import type { Scene } from "../../scene.js";
import { preserveFormat } from "./preserveFormat.js";

/**
 * How a scene file is written, so that Studio saves it the way it found it: a snake_case component array stays a snake_case component array.
 *
 * Studio's form holds the normalised camelCase scene that `readScene` returns. Writing that back as it is would turn a bare payload into a scene and every `custom_id` into `customId`, which would rewrite the whole file on the first save and break whatever else reads it. So the file is written back through its shape.
 */
export interface FileShape {
  /** What the file holds. A message, components or a component is unwrapped from the scene again on save. */
  kind: Exclude<InputKind, `unknown`>;
  /** The key spelling for keys the file did not have yet. Keys it had keep their own spelling. */
  style: `snake` | `camel`;
  /** The file as parsed, for looking up each key's original spelling. */
  raw: unknown;
  /** Indentation per level, or `0` for a file written on one line. */
  indent: string | 0;
  finalNewline: boolean;
}

/** The scene fields that describe how the preview is drawn rather than what is sent: only a scene file has a place for them. */
export const viewFields = [
  `theme`,
  `width`,
  `now`,
  `timeZone`,
  `locale`,
  `revealSpoilers`
] as const;

/** Where the file's own value sits inside the scene `readScene` makes of it. */
const prefixes: Record<FileShape[`kind`], Path> = {
  scene: [],
  message: [`messages`, 0, `payload`],
  components: [`messages`, 0, `payload`, `components`],
  component: [`messages`, 0, `payload`, `components`, 0]
};

const countStyles = (
  value: unknown,
  path: PathSegment[],
  counts: { snake: number; camel: number }
): void => {
  if (Array.isArray(value)) {
    value.forEach((item: unknown, index) =>
      countStyles(item, [...path, index], counts)
    );
    return;
  }
  if (!isObject(value)) return;
  const dataKeyed = isDataKeyed(path);
  for (const [key, item] of Object.entries(value)) {
    if (!dataKeyed) {
      if (/[a-z0-9]_[a-z]/.test(key)) counts.snake++;
      else if (/[a-z0-9][A-Z]/.test(key)) counts.camel++;
    }
    countStyles(item, [...path, key], counts);
  }
};

/**
 * Reads a file's shape from its text and what `readScene` said it holds. Keys with one word (`type`, `content`) say nothing about style; a file with no others is taken as camelCase, discordkit's own spelling.
 */
export const readFileShape = (
  text: string,
  kind: FileShape[`kind`]
): FileShape => {
  const raw: unknown = JSON.parse(text);
  const counts = { snake: 0, camel: 0 };
  countStyles(raw, [...prefixes[kind]], counts);
  const indent = /\n([ \t]+)\S/.exec(text)?.[1] ?? 0;
  return {
    kind,
    style: counts.snake > counts.camel ? `snake` : `camel`,
    raw,
    indent,
    finalNewline: text.endsWith("\n")
  };
};

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

/** The file's own spelling for a camelCase key in the object `raw`: the key it already has, or the file's style for a new one. */
const spell = (
  key: string,
  raw: unknown,
  style: FileShape[`style`]
): string => {
  if (isObject(raw)) {
    const existing = Object.keys(raw).find(
      (candidate) => toCamelCase(candidate) === key
    );
    if (existing !== undefined) return existing;
  }
  return style === `snake` ? toSnakeCase(key) : key;
};

const respell = (
  value: unknown,
  raw: unknown,
  path: PathSegment[],
  style: FileShape[`style`]
): unknown => {
  if (Array.isArray(value)) {
    const rawItems: unknown[] = Array.isArray(raw) ? raw : [];
    return value.map((item: unknown, index) =>
      respell(item, rawItems[index], [...path, index], style)
    );
  }
  if (!isObject(value)) return value;
  const dataKeyed = isDataKeyed(path);
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    const name = dataKeyed ? key : spell(key, raw, style);
    Object.defineProperty(out, name, {
      value: respell(
        item,
        isObject(raw) ? raw[name] : undefined,
        [...path, key],
        style
      ),
      enumerable: true,
      writable: true,
      configurable: true
    });
  }
  return out;
};

/**
 * The value to write for a scene, in the file's shape and key style. For a file that is not a scene, only what it can hold is written: the first message's payload, its components, or its first component. The view settings and anything else a scene adds stay in Studio.
 */
export const toFileValue = (scene: Scene, shape: FileShape): unknown => {
  const prefix = prefixes[shape.kind];
  return respell(valueAt(scene, prefix), shape.raw, [...prefix], shape.style);
};

/** {@link toFileValue} as the file's text, indented as the file was, with line feeds. */
export const toFileText = (scene: Scene, shape: FileShape): string => {
  const text = JSON.stringify(toFileValue(scene, shape), null, shape.indent);
  return shape.finalNewline ? `${text}\n` : text;
};

/**
 * {@link toFileText} printed over the file's current text, so that only what changed is written differently: a hand-formatted file keeps its formatting through every form edit (see `preserveFormat.ts`).
 */
export const toFileTextOver = (
  oldText: string,
  scene: Scene,
  shape: FileShape
): string => preserveFormat(oldText, toFileValue(scene, shape), shape.indent);

/**
 * A path into the scene as a path into the file, spelled as the file spells it, so a finding can be shown where a person or agent will find it in the file. Undefined for a path outside what the file holds (a view setting on a bare payload).
 */
export const toFilePath = (
  scenePath: readonly PathSegment[],
  shape: FileShape
): Path | undefined => {
  const prefix = prefixes[shape.kind];
  if (prefix.some((segment, index) => scenePath[index] !== segment)) {
    return undefined;
  }
  const rest = scenePath.slice(prefix.length);
  const result: Path = [];
  let raw = shape.raw;
  rest.forEach((segment, index) => {
    const parent = [...prefix, ...rest.slice(0, index)];
    const name =
      typeof segment === `number` || isDataKeyed(parent)
        ? segment
        : spell(segment, raw, shape.style);
    result.push(name);
    raw = Array.isArray(raw)
      ? raw[Number(name)]
      : isObject(raw)
        ? raw[String(name)]
        : undefined;
  });
  return result;
};

/**
 * The scene a file's new content reads as, keeping the view settings the person chose when the file has no place for them. Without this, every change an agent made to a bare payload would put the preview back to the dark theme at 600 pixels.
 */
export const withViewSettings = (
  next: Scene,
  previous: Scene | undefined,
  kind: FileShape[`kind`]
): Scene => {
  if (kind === `scene` || previous === undefined) return next;
  const view = Object.fromEntries(
    viewFields
      .filter((field) => previous[field] !== undefined)
      .map((field) => [field, previous[field]])
  );
  const openSelect = previous.messages.at(0)?.openSelect;
  const first = next.messages.at(0);
  const others = next.messages.slice(1);
  // An open select the agent has since removed is dropped rather than carried into a scene that cannot draw it.
  const stillThere =
    first !== undefined &&
    openSelect !== undefined &&
    `select` in findOpenSelect(first.payload.components, openSelect);
  return {
    ...next,
    ...view,
    messages: stillThere ? [{ ...first, openSelect }, ...others] : next.messages
  };
};
