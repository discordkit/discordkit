import { isObject } from "@discordkit/core/utils/isObject";
import type { FieldArrayPath, FieldPath } from "react-hook-form";
import type { Path, PathSegment } from "../../findings.js";
import type { Scene } from "../../scene.js";

/**
 * Paths into the scene, which are at once the form's field names, lint's finding paths and the tree's node ids. One value, three uses: that is what lets a finding land on its field and its tree node with no mapping table.
 */

/** A field name starts at a message's path or at the scene's modal; the editor builds every field name it uses from a tree node's path. */
const messagePath = /^(?:messages\.\d+|modal)(\.[\w$]+)*$/;

const isFieldPath = (name: string): name is FieldPath<Scene> =>
  messagePath.test(name);

const isFieldArrayPath = (name: string): name is FieldArrayPath<Scene> =>
  messagePath.test(name);

const notAPath = (name: string): Error =>
  new Error(
    `Studio's editor was asked for the field "${name}", which is not a path into a scene's messages or its modal, so the form has no such field. This is a bug in Studio: field names are built from a tree node's path, such as "messages.0.payload.components.2.content".`
  );

/**
 * A field name the editor built at run time (`messages.0.payload.components.2.label`) as react-hook-form's path type for the scene. The type cannot follow a path through the client's component unions from a plain string, so this checks it is a message path and says so to the type system.
 */
export const fieldPath = (name: string): FieldPath<Scene> => {
  if (isFieldPath(name)) return name;
  throw notAPath(name);
};

/** {@link fieldPath} for a list the form edits as a field array: a select's options, an embed's fields. */
export const fieldArrayPath = (name: string): FieldArrayPath<Scene> => {
  if (isFieldArrayPath(name)) return name;
  throw notAPath(name);
};

/** Whether a value is shaped as a scene: an object with a list of messages. What the editor's edits and pruning return, checked rather than assumed. */
export const isScene = (value: unknown): value is Scene =>
  isObject(value) && Array.isArray(value.messages);

/** A path as react-hook-form spells a field name: `messages.0.payload.components.2.content`. Also the tree's node id. */
export const pathKey = (path: readonly PathSegment[]): string => path.join(`.`);

/** The path a {@link pathKey} spells, with numeric segments back as numbers. */
export const parsePathKey = (key: string): Path =>
  key === ``
    ? []
    : key
        .split(`.`)
        .map((segment) => (/^\d+$/.test(segment) ? Number(segment) : segment));

/** Whether `path` is `prefix` or lies under it. */
export const isWithin = (
  path: readonly PathSegment[],
  prefix: readonly PathSegment[]
): boolean =>
  path.length >= prefix.length &&
  prefix.every((segment, index) => path[index] === segment);

/** The value at a path, or undefined where the path leads nowhere. */
export const valueAt = (
  value: unknown,
  path: readonly PathSegment[]
): unknown =>
  path.reduce<unknown>(
    (node, segment) =>
      Array.isArray(node)
        ? node[Number(segment)]
        : isObject(node)
          ? node[String(segment)]
          : undefined,
    value
  );

/** `value` with the value at `path` replaced, copying only the objects and arrays on the way down, so everything beside the path keeps its identity. */
export const replaceAt = (
  value: unknown,
  path: readonly PathSegment[],
  replacement: unknown
): unknown => {
  if (path.length === 0) return replacement;
  const [head, ...rest] = path;
  if (Array.isArray(value)) {
    const copy: unknown[] = [...value];
    copy[Number(head)] = replaceAt(copy[Number(head)], rest, replacement);
    return copy;
  }
  const record: Record<string, unknown> = isObject(value) ? { ...value } : {};
  Object.defineProperty(record, String(head), {
    value: replaceAt(record[String(head)], rest, replacement),
    enumerable: true,
    writable: true,
    configurable: true
  });
  return record;
};
