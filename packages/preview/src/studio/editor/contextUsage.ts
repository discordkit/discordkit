import { isObject } from "@discordkit/core/utils/isObject";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Path } from "../../findings.js";
import type { MarkdownNode } from "../../markdown/ast.js";
import { parseMarkdown, type MarkdownContext } from "../../markdown/parse.js";
import type { Scene, SceneContext } from "../../scene.js";
import { pathKey } from "./paths.js";

/**
 * Where a scene uses each entry of its context (the users, roles, channels and custom emoji that mentions and authors resolve to, and the files `attachment://` names), and what it uses that the context does not define.
 *
 * A mention with no entry is drawn as Discord draws an unknown one, and a missing file as a placeholder, so these are how a person usually finds out the surroundings need describing. Mentions are found by parsing each text with the package's own markdown parser, in the context Discord renders it in, so a mention inside a code span is not one, exactly as the preview draws it.
 */

/** The parts of a scene's context Studio edits. (SKUs, which only a Premium button names, are left to the JSON pane.) */
export const contextKinds = [
  `users`,
  `roles`,
  `channels`,
  `emoji`,
  `attachments`
] as const;

export type ContextKind = (typeof contextKinds)[number];

/** How a place uses an entry. */
export type UseKind =
  | `author`
  | `mention`
  | `emoji`
  | `default value`
  | `image`
  | `avatar`;

export interface ContextUse {
  /** Where, as a scene path: the text, the component, the message, or the context entry that names a file. */
  path: Path;
  how: UseKind;
}

/** Something the scene uses that its context does not define. */
export interface UnknownReference {
  kind: ContextKind;
  /** The id, or for an attachment the file name. */
  key: string;
  /** For a custom emoji, the name the text gives it, to start its entry with. */
  name?: string;
  uses: ContextUse[];
}

export interface ContextReport {
  /** Every key the scene uses, by kind, with each place it is used, whether or not it is defined. */
  uses: Record<ContextKind, Map<string, ContextUse[]>>;
  /** What is used but not defined, in the order it is first used. */
  unknown: UnknownReference[];
}

const record = (value: unknown): Record<string, unknown> | undefined =>
  isObject(value) ? value : undefined;

const list = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : isObject(value) ? [value] : [];

/** Every node of a parsed text, depth first. */
const walk = (nodes: readonly MarkdownNode[]): MarkdownNode[] =>
  nodes.flatMap((node) => {
    const children: MarkdownNode[] = [];
    if (`content` in node && Array.isArray(node.content)) {
      children.push(...walk(node.content));
    }
    if (node.type === `list`) {
      for (const item of node.items) children.push(...walk(item));
    }
    return [node, ...children];
  });

/** Works out where a scene uses its context. */
export const contextUsage = (scene: Scene): ContextReport => {
  const uses: ContextReport[`uses`] = {
    users: new Map(),
    roles: new Map(),
    channels: new Map(),
    emoji: new Map(),
    attachments: new Map()
  };
  const emojiNames = new Map<string, string>();
  const note = (
    kind: ContextKind,
    key: string,
    path: Path,
    how: UseKind
  ): void => {
    uses[kind].set(key, [...(uses[kind].get(key) ?? []), { path, how }]);
  };

  const text = (value: unknown, path: Path, context: MarkdownContext): void => {
    if (typeof value !== `string` || value === ``) return;
    for (const node of walk(parseMarkdown(value, context))) {
      if (node.type === `userMention`) {
        note(`users`, node.id, path, `mention`);
      } else if (node.type === `roleMention`) {
        note(`roles`, node.id, path, `mention`);
      } else if (node.type === `channelMention`) {
        note(`channels`, node.id, path, `mention`);
      } else if (node.type === `customEmoji`) {
        note(`emoji`, node.id, path, `emoji`);
        if (!emojiNames.has(node.id)) emojiNames.set(node.id, node.name);
      }
    }
  };

  /** Every `attachment://` string under a value, as a use of that file. */
  const files = (value: unknown, path: Path, how: UseKind): void => {
    if (typeof value === `string`) {
      if (value.startsWith(`attachment://`)) {
        note(`attachments`, value.slice(`attachment://`.length), path, how);
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item: unknown, index) =>
        files(item, [...path, index], how)
      );
      return;
    }
    const object = record(value);
    if (object === undefined) return;
    for (const [key, item] of Object.entries(object)) {
      files(item, [...path, key], how);
    }
  };

  const partialEmoji = (value: unknown, path: Path): void => {
    const emoji = record(value);
    if (typeof emoji?.id === `string` && emoji.id !== ``) {
      note(`emoji`, emoji.id, path, `emoji`);
      if (typeof emoji.name === `string` && !emojiNames.has(emoji.id)) {
        emojiNames.set(emoji.id, emoji.name);
      }
    }
  };

  const component = (value: unknown, path: Path): void => {
    const node = record(value);
    if (node === undefined) return;
    switch (node.type) {
      case ComponentType.TextDisplay:
        text(node.content, [...path, `content`], `textDisplay`);
        break;
      case ComponentType.Button:
        partialEmoji(node.emoji, [...path, `emoji`]);
        break;
      case ComponentType.StringSelect:
        list(node.options).forEach((option, index) =>
          partialEmoji(record(option)?.emoji, [
            ...path,
            `options`,
            index,
            `emoji`
          ])
        );
        break;
      case ComponentType.UserSelect:
      case ComponentType.RoleSelect:
      case ComponentType.ChannelSelect:
      case ComponentType.MentionableSelect:
        list(node.defaultValues).forEach((entry, index) => {
          const chosen = record(entry);
          if (typeof chosen?.id !== `string`) return;
          const kind: ContextKind =
            chosen.type === `role`
              ? `roles`
              : chosen.type === `channel`
                ? `channels`
                : `users`;
          note(
            kind,
            chosen.id,
            [...path, `defaultValues`, index],
            `default value`
          );
        });
        break;
      default:
        break;
    }
    list(node.components).forEach((child, index) =>
      component(child, [...path, `components`, index])
    );
    if (node.accessory !== undefined) {
      component(node.accessory, [...path, `accessory`]);
    }
  };

  scene.messages.forEach((message, index) => {
    const base: Path = [`messages`, index];
    if (message.author !== undefined) {
      note(`users`, message.author, [...base, `author`], `author`);
    }
    const payload = record(message.payload) ?? {};
    const at: Path = [...base, `payload`];
    text(payload.content, [...at, `content`], `message`);
    list(payload.embeds).forEach((value, embedIndex) => {
      const embed = record(value);
      if (embed === undefined) return;
      const embedPath: Path = [...at, `embeds`, embedIndex];
      text(
        embed.description,
        [...embedPath, `description`],
        `embedDescription`
      );
      list(embed.fields).forEach((field, fieldIndex) =>
        text(
          record(field)?.value,
          [...embedPath, `fields`, fieldIndex, `value`],
          `embedFieldValue`
        )
      );
    });
    list(payload.components).forEach((value, position) =>
      component(value, [...at, `components`, position])
    );
    files(payload, at, `image`);
  });

  // A user's avatar or an emoji's image can be a file too.
  const context = scene.context;
  for (const [id, user] of Object.entries(context?.users ?? {})) {
    files(user.avatar, [`context`, `users`, id, `avatar`], `avatar`);
  }
  for (const [id, emoji] of Object.entries(context?.emoji ?? {})) {
    files(emoji.url, [`context`, `emoji`, id, `url`], `image`);
  }

  const unknown: UnknownReference[] = [];
  for (const kind of contextKinds) {
    const defined = record(context?.[kind]) ?? {};
    for (const [key, places] of uses[kind]) {
      if (Object.hasOwn(defined, key)) continue;
      unknown.push({
        kind,
        key,
        ...(kind === `emoji` && emojiNames.has(key)
          ? { name: emojiNames.get(key) }
          : {}),
        uses: places
      });
    }
  }
  return { uses, unknown };
};

/** The places an entry is used, or an empty list for one nothing uses. */
export const usesOf = (
  report: ContextReport,
  kind: ContextKind,
  key: string
): ContextUse[] => report.uses[kind].get(key) ?? [];

/** The unknown references used at one scene path (a field's name), for showing under that field. */
export const unknownAt = (
  report: ContextReport,
  name: string
): UnknownReference[] =>
  report.unknown.filter((reference) =>
    reference.uses.some((place) => pathKey(place.path) === name)
  );

/**
 * The context with one entry set, replaced or (for `undefined`) removed, keeping every other entry in its place, so a change to one field is a change to one line of the file. A group left empty is removed, and so is a context left empty.
 */
export const withEntry = (
  context: SceneContext | undefined,
  kind: ContextKind,
  key: string,
  entry: Record<string, unknown> | undefined
): SceneContext | undefined => {
  const group = setKey(record(context?.[kind]) ?? {}, key, entry);
  const result = setKey(
    record(context) ?? {},
    kind,
    Object.keys(group).length === 0 ? undefined : group
  );
  // Rebuilt from the scene's own context, one group at a time, each still an object of entries keyed by id or file name.
  return Object.keys(result).length === 0 ? undefined : result;
};

/** An object with one key set in its place (or added last), or removed when `value` is undefined. Built from entries, so a key such as `__proto__` is an ordinary key. */
const setKey = (
  object: Record<string, unknown>,
  key: string,
  value: unknown
): Record<string, unknown> => {
  const entries = Object.entries(object);
  const next: Array<[string, unknown]> = entries.some(([name]) => name === key)
    ? entries.map(([name, old]) => [name, name === key ? value : old])
    : [...entries, [key, value]];
  return Object.fromEntries(next.filter(([, item]) => item !== undefined));
};

/** An entry with one field set in its place, or removed when `value` is undefined. */
export const withField = (
  entry: Record<string, unknown>,
  field: string,
  value: unknown
): Record<string, unknown> => setKey(entry, field, value);

/** What a new entry for an unknown reference starts as: the id it is for, and an empty name for the person to type, or for an emoji the name the text already gives it. */
export const newEntry = (
  reference: Pick<UnknownReference, `kind` | `name`>
): Record<string, unknown> => {
  switch (reference.kind) {
    case `attachments`:
      return { path: `` };
    case `emoji`:
      return { name: reference.name ?? ``, url: `` };
    case `users`:
    case `roles`:
    case `channels`:
      return { name: `` };
  }
};
