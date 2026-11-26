import { isObject } from "@discordkit/core/utils/isObject";
import type { Scene } from "../../scene.js";
import { isScene } from "./paths.js";

/**
 * The scene as Discord and lint should see it: without the keys the form holds as `undefined`.
 *
 * Clearing an optional field in a form sets it to `undefined` rather than to an empty string, and react-hook-form keeps such a key in its values (it also adds one when a field is registered at a path that has no value yet, such as an embed's `author.name`). The client's schemas take an `undefined` key as present, and Discord takes an empty string or a `null` as a value, so either would make a cleared field an error. Pruning removes them, so a cleared field is a missing key.
 *
 * An object whose every key is pruned goes too (an embed's author with its name, link and icon all cleared), since an empty author is not the same as no author. An object that was empty to begin with stays, and arrays keep every item, so no index shifts under a person's selection.
 */
export const prune = (scene: Scene): Scene => {
  const pruned = pruneValue(scene);
  // Pruning keeps every array, so a scene's messages are always still there.
  return isScene(pruned) ? pruned : scene;
};

/** {@link prune} for one object, such as a button being given a new style. */
export const pruneRecord = (
  record: Record<string, unknown>
): Record<string, unknown> => {
  const pruned = pruneValue(record);
  return isObject(pruned) ? pruned : record;
};

const pruneValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(pruneValue);
  if (!isObject(value)) return value;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    const item = value[key];
    if (item === undefined) continue;
    if (typeof item === `number` && Number.isNaN(item)) continue;
    const pruned = pruneValue(item);
    if (
      isObject(item) &&
      Object.keys(item).length > 0 &&
      isObject(pruned) &&
      Object.keys(pruned).length === 0
    ) {
      continue;
    }
    Object.defineProperty(out, key, {
      value: pruned,
      enumerable: true,
      writable: true,
      configurable: true
    });
  }
  return out;
};

/** What a cleared optional text field becomes: no value at all, never an empty string. */
export const optionalText = (text: string): string | undefined =>
  text === `` ? undefined : text;
