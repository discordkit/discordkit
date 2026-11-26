import { isObject } from "@discordkit/core/utils/isObject";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Path, PathSegment } from "../../findings.js";
import type { Scene } from "../../scene.js";
import { componentName } from "../../components.js";
import { isScene, isWithin, replaceAt, valueAt } from "./paths.js";
import type { ChildType } from "./tree.js";

/**
 * The tree's structural edits as pure functions of the scene: add, remove, duplicate and move. Each returns the new scene, the path to select afterwards, and how every other path moved, so the selection, expanded rows and focus follow the component they were on rather than staying at an index that now holds something else.
 */

export interface EditResult {
  scene: Scene;
  /** What to select after the edit. */
  selected: Path;
  /** Where a path from before the edit is now, or undefined when it was removed. */
  remap: (path: Path) => Path | undefined;
}

const unchanged = (path: Path): Path => path;

/** How a path into `list` moves when the item at `from` goes to `to` (both indexes into the list as it is after removal, as `Array.splice` counts them), or is removed (`to` undefined), or inserted (`from` undefined). */
const shift =
  (
    list: readonly PathSegment[],
    from: number | undefined,
    to: number | undefined
  ) =>
  (path: Path): Path | undefined => {
    if (!isWithin(path, list) || path.length === list.length) return path;
    const index = Number(path[list.length]);
    let next = index;
    if (from !== undefined) {
      if (index === from) {
        if (to === undefined) return undefined;
        next = to;
      } else {
        if (index > from) next--;
        if (to !== undefined && next >= to) next++;
      }
    } else if (to !== undefined && index >= to) {
      next++;
    }
    return [
      ...path.slice(0, list.length),
      next,
      ...path.slice(list.length + 1)
    ];
  };

const listAt = (scene: Scene, list: readonly PathSegment[]): unknown[] => {
  const value = valueAt(scene, list);
  // An action row's lone select as a bare object (#106) becomes the array Discord expects once it is edited.
  return Array.isArray(value) ? [...value] : isObject(value) ? [value] : [];
};

/** The scene with the value at `path` replaced. Replacing inside a message keeps it a scene, which the check confirms. */
const withValue = (
  scene: Scene,
  path: readonly PathSegment[],
  value: unknown
): Scene => {
  const next = replaceAt(scene, path, value);
  return isScene(next) ? next : scene;
};

const withList = (
  scene: Scene,
  list: readonly PathSegment[],
  items: unknown[]
): Scene => withValue(scene, list, items);

/** Every `customId` in the scene, to keep new ones unique. */
const customIds = (value: unknown, found = new Set<string>()): Set<string> => {
  if (Array.isArray(value)) {
    for (const item of value) customIds(item, found);
  } else if (isObject(value)) {
    if (typeof value.customId === `string`) found.add(value.customId);
    for (const item of Object.values(value)) customIds(item, found);
  }
  return found;
};

/** A `customId` no other component in the scene uses: `button-1`, `button-2`… */
export const uniqueCustomId = (scene: Scene, base: string): string => {
  const used = customIds(scene);
  let index = 1;
  while (used.has(`${base}-${String(index)}`)) index++;
  return `${base}-${String(index)}`;
};

const idBases: Partial<Record<ComponentType, string>> = {
  [ComponentType.Button]: `button`,
  [ComponentType.StringSelect]: `string-select`,
  [ComponentType.UserSelect]: `user-select`,
  [ComponentType.RoleSelect]: `role-select`,
  [ComponentType.MentionableSelect]: `mentionable-select`,
  [ComponentType.ChannelSelect]: `channel-select`
};

/**
 * A new component of a type, with what Discord requires and nothing more. Interactive components get a `customId` no other component has; text starts empty, so the person's first keystroke is their own and lint says what is missing until then.
 */
export const newChild = (
  scene: Scene,
  type: ChildType
): Record<string, unknown> => {
  if (type === `embed`) return { description: `` };
  const id = (): string => uniqueCustomId(scene, idBases[type] ?? `component`);
  switch (type) {
    case ComponentType.Container:
    case ComponentType.ActionRow:
      return { type, components: [] };
    case ComponentType.TextDisplay:
      return { type, content: `` };
    case ComponentType.Section:
      return {
        type,
        components: [{ type: ComponentType.TextDisplay, content: `` }],
        accessory: {
          type: ComponentType.Button,
          style: ButtonStyle.Secondary,
          label: `Button`,
          customId: uniqueCustomId(scene, `button`)
        }
      };
    case ComponentType.Separator:
      return { type };
    case ComponentType.MediaGallery:
      return { type, items: [{ media: { url: `` } }] };
    case ComponentType.File:
      return { type, file: { url: `` } };
    case ComponentType.Thumbnail:
      return { type, media: { url: `` } };
    case ComponentType.Button:
      return {
        type,
        style: ButtonStyle.Secondary,
        label: `Button`,
        customId: id()
      };
    case ComponentType.StringSelect:
      return {
        type,
        customId: id(),
        options: [{ label: `Option 1`, value: `option-1` }]
      };
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect:
      return { type, customId: id() };
    // Only a modal holds these, and the add menu never offers them (see `supportedComponents`).
    case ComponentType.TextInput:
    case ComponentType.Label:
    case ComponentType.FileUpload:
    case ComponentType.RadioGroup:
    case ComponentType.CheckboxGroup:
    case ComponentType.Checkbox:
      throw new Error(
        `Studio cannot add a ${componentName(type)} to a message: it belongs in a modal, which Studio does not edit yet. This is a bug in Studio, since the add menu offers only what a message can hold.`
      );
  }
};

/** Adds an item to a list at `index` (its end by default) and selects it. */
export const insertChild = (
  scene: Scene,
  list: Path,
  item: unknown,
  index?: number
): EditResult => {
  const items = listAt(scene, list);
  const at = index ?? items.length;
  items.splice(at, 0, item);
  return {
    scene: withList(scene, list, items),
    selected: [...list, at],
    remap: (path) => shift(list, undefined, at)(path)
  };
};

/** Removes the item at `path` and selects the one that took its place, the one before it, or its parent. */
export const removeAt = (scene: Scene, path: Path): EditResult => {
  const list = path.slice(0, -1);
  const index = Number(path.at(-1));
  const items = listAt(scene, list);
  items.splice(index, 1);
  const owner =
    list.at(-1) === `components` || list.at(-1) === `embeds`
      ? list.slice(0, -1)
      : list;
  const parent = owner.at(-1) === `payload` ? owner.slice(0, -1) : owner;
  const selected: Path =
    items.length === 0 ? parent : [...list, Math.min(index, items.length - 1)];
  return {
    scene: withList(scene, list, items),
    selected,
    remap: shift(list, index, undefined)
  };
};

/** Copies the item at `path` to just after it, exactly, and selects the copy. A copied `customId` stays as it was: lint reports the duplicate at once, which tells the person what to change rather than changing it behind their back. */
export const duplicateAt = (scene: Scene, path: Path): EditResult => {
  const item: unknown = structuredClone(valueAt(scene, path));
  return insertChild(scene, path.slice(0, -1), item, Number(path.at(-1)) + 1);
};

/** Moves the item at `path` to `to` within the same list, and keeps it selected. */
export const moveTo = (scene: Scene, path: Path, to: number): EditResult => {
  const list = path.slice(0, -1);
  const from = Number(path.at(-1));
  const items = listAt(scene, list);
  const target = Math.max(0, Math.min(to, items.length - 1));
  const [item] = items.splice(from, 1);
  items.splice(target, 0, item);
  return {
    scene: withList(scene, list, items),
    selected: [...list, target],
    remap: shift(list, from, target)
  };
};

/** Moves the item at `path` one place up (`-1`) or down (`1`) in its list. */
export const moveBy = (scene: Scene, path: Path, delta: -1 | 1): EditResult =>
  moveTo(scene, path, Number(path.at(-1)) + delta);

/** Whether the item at `path` can move one place that way. */
export const canMove = (scene: Scene, path: Path, delta: -1 | 1): boolean => {
  if (typeof path.at(-1) !== `number`) return false;
  const target = Number(path.at(-1)) + delta;
  return target >= 0 && target < listAt(scene, path.slice(0, -1)).length;
};

/**
 * Replaces the value at `path` whole, or removes its key when `value` is undefined, keeping `selected` selected. For a change that is more than one field's: a button's fields when its style changes, a message's payload when it changes kind, a bit of its flags.
 */
export const setValueAt = (
  scene: Scene,
  path: Path,
  value: unknown,
  selected: Path
): EditResult => ({
  scene: withValue(scene, path, value),
  selected,
  remap: unchanged
});

/** Replaces a section's accessory with a new one of the other kind, a thumbnail or a button. */
export const setAccessory = (
  scene: Scene,
  sectionPath: Path,
  type: ComponentType.Thumbnail | ComponentType.Button
): EditResult => {
  const path: Path = [...sectionPath, `accessory`];
  return {
    scene: withValue(scene, path, newChild(scene, type)),
    selected: path,
    remap: unchanged
  };
};
