import { isObject } from "@discordkit/core/utils/isObject";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import {
  componentName,
  isComponentsV2,
  selectTypes,
  supportedComponents
} from "../../components.js";
import type { Path, PathSegment } from "../../findings.js";
import { colorToHex } from "../../format/color.js";
import {
  maxActionRowButtons,
  maxClassicActionRows,
  maxEmbeds,
  maxModalComponents,
  maxSectionComponents
} from "../../lint/limits.js";
import type { Scene, SceneMessage } from "../../scene.js";
import { pathKey, valueAt } from "./paths.js";

/**
 * The scene as the editor's component tree sees it: every message, embed and component, nested as the payload nests them, each with a short summary of what it holds, and for each one the children Discord allows inside it.
 *
 * Which component types may sit where comes from `supportedComponents` in `components.ts`, the one list the renderer and lint already share. This file adds only Discord's counting rules (five buttons to a row, one select to a row and nothing beside it, three text displays to a section, five rows and ten embeds on a classic message), each from `lint/limits.ts`.
 */

/** What can be added to a list: a component type, or an embed on a classic message. */
export type ChildType = ComponentType | `embed`;

export type NodeKind =
  | `message`
  | `modal`
  | `component`
  | `embed`
  | `accessory`;

export interface TreeNode {
  /** The node's path as a field name, also its id in the tree. */
  id: string;
  path: Path;
  kind: NodeKind;
  /** The component's type, for a component or accessory. */
  type?: ComponentType;
  /** What it is: "Text Display", "Embed", "Message 1". */
  name: string;
  /** What it holds, in a few words: a text's first line, a button's label. */
  summary: string;
  children: TreeNode[];
}

/** A place a new child can go, and whether it can go there now. */
export interface ChildSlot {
  type: ChildType;
  /** The list the child is added to. */
  list: Path;
  /** Why it cannot be added here now, when it cannot. */
  unavailable?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  isObject(value);

/** Whether a component type is one of the five select menus. */
export const isSelectType = (type: unknown): boolean =>
  selectTypes.some((select) => select === type);

/** A list of child components as an array, accepting the bare object the client's action-row schema allows (#106). */
export const asList = (value: unknown): Array<Record<string, unknown>> =>
  (Array.isArray(value) ? value : isRecord(value) ? [value] : []).filter(
    isRecord
  );

const stringAt = (value: Record<string, unknown>, key: string): string =>
  typeof value[key] === `string` ? value[key] : ``;

/** The last part of a URL or `attachment://` reference: what a person recognises a file by. */
export const fileName = (url: string): string =>
  url.startsWith(`attachment://`)
    ? url.slice(`attachment://`.length)
    : (url.split(/[?#]/)[0].split(`/`).at(-1) ?? url);

const shorten = (text: string, max = 44): string =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

/** A markdown text's first line that says something, without the markers that only style it. */
export const firstLine = (text: string): string => {
  const line =
    text
      .split(`\n`)
      .map((candidate) =>
        candidate
          .replace(/^\s*(?:-#|#{1,3}|>{1,3}|[-*]|\d+\.)\s+/, ``)
          .replace(/(\*\*|__|~~|\|\||\*|_|`)/g, ``)
          .trim()
      )
      .find((candidate) => candidate !== ``) ?? ``;
  return shorten(line);
};

const plural = (count: number, one: string, many = `${one}s`): string =>
  `${String(count)} ${count === 1 ? one : many}`;

export const buttonStyleName = (style: unknown): string =>
  typeof style === `number` && typeof ButtonStyle[style] === `string`
    ? ButtonStyle[style]
    : `style ${String(style)}`;

/** What a component holds, in a few words. */
export const summarise = (component: Record<string, unknown>): string => {
  switch (component.type) {
    case ComponentType.TextDisplay:
      return firstLine(stringAt(component, `content`)) || `(empty)`;
    case ComponentType.Container: {
      const parts = [plural(asList(component.components).length, `item`)];
      if (typeof component.accentColor === `number`) {
        try {
          parts.push(colorToHex(component.accentColor));
        } catch {
          parts.push(`bad colour`);
        }
      }
      if (component.spoiler === true) parts.push(`spoiler`);
      return parts.join(` · `);
    }
    case ComponentType.Section: {
      const first = asList(component.components).at(0);
      return first === undefined
        ? `(no text)`
        : firstLine(stringAt(first, `content`)) || `(empty)`;
    }
    case ComponentType.Separator:
      return `${component.divider === false ? `space only` : `divider`}, ${component.spacing === 2 ? `large` : `small`}`;
    case ComponentType.MediaGallery:
      return plural(
        Array.isArray(component.items) ? component.items.length : 0,
        `picture`
      );
    case ComponentType.File:
    case ComponentType.Thumbnail: {
      const media = component.type === ComponentType.File ? `file` : `media`;
      const holder = component[media];
      const url = isRecord(holder) ? stringAt(holder, `url`) : ``;
      const description = stringAt(component, `description`);
      return shorten(description || fileName(url)) || `(no file)`;
    }
    case ComponentType.ActionRow: {
      const children = asList(component.components);
      const select = children.find((child) => isSelectType(child.type));
      return select === undefined
        ? plural(children.length, `button`)
        : componentName(select.type);
    }
    case ComponentType.Button: {
      const label = stringAt(component, `label`);
      const emoji = isRecord(component.emoji)
        ? stringAt(component.emoji, `name`)
        : ``;
      const text = [emoji, label].filter(Boolean).join(` `);
      return `${shorten(text) || `(no label)`} · ${buttonStyleName(component.style)}`;
    }
    case ComponentType.Label:
      return shorten(stringAt(component, `label`)) || `(no label)`;
    case ComponentType.TextInput:
      return `${shorten(stringAt(component, `placeholder`) || stringAt(component, `label`) || stringAt(component, `customId`)) || `(no id)`} · ${component.style === 2 ? `paragraph` : `short`}`;
    case ComponentType.RadioGroup:
    case ComponentType.CheckboxGroup:
      return plural(
        Array.isArray(component.options) ? component.options.length : 0,
        `option`
      );
    case ComponentType.FileUpload:
    case ComponentType.Checkbox:
      return shorten(stringAt(component, `customId`)) || `(no id)`;
    default:
      if (isSelectType(component.type)) {
        return (
          shorten(
            stringAt(component, `placeholder`) ||
              stringAt(component, `customId`)
          ) || `(no id)`
        );
      }
      return ``;
  }
};

const embedSummary = (embed: Record<string, unknown>): string =>
  shorten(
    stringAt(embed, `title`) ||
      firstLine(stringAt(embed, `description`)) ||
      (isRecord(embed.author) ? stringAt(embed.author, `name`) : ``)
  ) || `(empty)`;

const componentNode = (
  component: Record<string, unknown>,
  path: Path,
  kind: NodeKind = `component`
): TreeNode => {
  const children: TreeNode[] = [];
  if (
    component.type === ComponentType.Container ||
    component.type === ComponentType.ActionRow ||
    component.type === ComponentType.Section
  ) {
    asList(component.components).forEach((child, index) =>
      children.push(componentNode(child, [...path, `components`, index]))
    );
  }
  if (
    component.type === ComponentType.Section &&
    isRecord(component.accessory)
  ) {
    children.push(
      componentNode(component.accessory, [...path, `accessory`], `accessory`)
    );
  }
  // A Label holds one component, at `component` rather than in a list.
  if (component.type === ComponentType.Label && isRecord(component.component)) {
    children.push(componentNode(component.component, [...path, `component`]));
  }
  return {
    id: pathKey(path),
    path,
    kind,
    ...(typeof component.type === `number` ? { type: component.type } : {}),
    name:
      kind === `accessory`
        ? `${componentName(component.type)} (accessory)`
        : componentName(component.type),
    summary: summarise(component),
    children
  };
};

/** Whether the message at this index is drawn as Components V2. */
export const isV2 = (message: SceneMessage | undefined): boolean =>
  message !== undefined && isComponentsV2(message.payload);

/** The scene's modal as a tree node, with its components under it, or none. */
const modalNode = (scene: Scene): TreeNode[] => {
  const modal = scene.modal;
  if (modal === undefined || !isRecord(modal.payload)) return [];
  const path: Path = [`modal`];
  return [
    {
      id: pathKey(path),
      path,
      kind: `modal`,
      name: `Modal`,
      summary:
        shorten(
          typeof modal.payload.title === `string` ? modal.payload.title : ``
        ) || `(no title)`,
      children: asList(modal.payload.components).map((component, position) =>
        componentNode(component, [...path, `payload`, `components`, position])
      )
    }
  ];
};

/** The editor's tree: one node per message, with its embeds and components under it, then the modal open over them, if any. */
export const buildTree = (scene: Scene): TreeNode[] => [
  ...scene.messages.map((message, index): TreeNode => {
    const path: Path = [`messages`, index];
    const payload = isRecord(message.payload) ? message.payload : {};
    const v2 = isV2(message);
    const children: TreeNode[] = [];
    if (!v2 && Array.isArray(payload.embeds)) {
      payload.embeds.forEach((embed: unknown, position) => {
        if (!isRecord(embed)) return;
        const embedPath: Path = [...path, `payload`, `embeds`, position];
        children.push({
          id: pathKey(embedPath),
          path: embedPath,
          kind: `embed`,
          name: `Embed`,
          summary: embedSummary(embed),
          children: []
        });
      });
    }
    asList(payload.components).forEach((component, position) =>
      children.push(
        componentNode(component, [...path, `payload`, `components`, position])
      )
    );
    const author =
      message.author === undefined
        ? undefined
        : scene.context?.users?.[message.author]?.name;
    return {
      id: pathKey(path),
      path,
      kind: `message`,
      name:
        scene.messages.length === 1
          ? `Message`
          : `Message ${String(index + 1)}`,
      // What tells one message of a sequence from the next: who sent it, and whether it is drawn edited or ephemeral.
      summary: [
        v2 ? `Components V2` : `Classic`,
        author,
        message.edited === true ? `edited` : undefined,
        message.ephemeral === true ? `ephemeral` : undefined
      ]
        .filter(Boolean)
        .join(` · `),
      children
    };
  }),
  ...modalNode(scene)
];

/** Every node of the tree, depth first, for lookups. */
export const flatten = (nodes: readonly TreeNode[]): TreeNode[] =>
  nodes.flatMap((node) => [node, ...flatten(node.children)]);

/** The deepest node at or above a path: the node a finding at that path belongs to. */
export const nodeFor = (
  nodes: readonly TreeNode[],
  path: readonly PathSegment[]
): TreeNode | undefined => {
  let found: TreeNode | undefined;
  for (const node of flatten(nodes)) {
    if (
      node.path.length <= path.length &&
      node.path.every((segment, index) => path[index] === segment) &&
      (found === undefined || node.path.length > found.path.length)
    ) {
      found = node;
    }
  }
  return found;
};

const v2OnlyReason = `Only a Components V2 message can hold this. Switch the message to Components V2 first, in the message's form.`;

/** The children a list accepts, each with why it cannot take one now, if it cannot. */
const slotsFor = (
  owner: Record<string, unknown>,
  list: Path,
  kind: `v2Message` | `classicMessage` | `modal` | `component`,
  inModal = false
): ChildSlot[] => {
  if (kind === `v2Message`) {
    return supportedComponents.message.map((type) => ({ type, list }));
  }
  if (kind === `modal`) {
    const full = asList(owner.components).length >= maxModalComponents;
    return supportedComponents.modal.map((type) =>
      full
        ? {
            type,
            list,
            unavailable: `A modal holds at most ${String(maxModalComponents)} components at its top level.`
          }
        : type === ComponentType.ActionRow
          ? {
              type,
              list,
              unavailable: `An action row in a modal is the older way to hold a text input, which Discord calls deprecated. Add a Label instead.`
            }
          : { type, list }
    );
  }
  if (inModal && owner.type === ComponentType.ActionRow) {
    const full = asList(owner.components).length > 0;
    return supportedComponents.modalActionRow.map((type) =>
      full
        ? {
            type,
            list,
            unavailable: `An action row in a modal holds one text input.`
          }
        : { type, list }
    );
  }
  if (kind === `classicMessage`) {
    const rows = asList(owner.components).length;
    // A classic message keeps only action rows; anything else would make it V2.
    return supportedComponents.message.map((type) =>
      type === ComponentType.ActionRow
        ? rows >= maxClassicActionRows
          ? {
              type,
              list,
              unavailable: `A classic message holds at most ${String(maxClassicActionRows)} action rows.`
            }
          : { type, list }
        : { type, list, unavailable: v2OnlyReason }
    );
  }
  switch (owner.type) {
    case ComponentType.Container:
      return supportedComponents.container.map((type) => ({ type, list }));
    case ComponentType.Section: {
      const full = asList(owner.components).length >= maxSectionComponents;
      return supportedComponents.section.map((type) =>
        full
          ? {
              type,
              list,
              unavailable: `A section holds at most ${String(maxSectionComponents)} text displays.`
            }
          : { type, list }
      );
    }
    case ComponentType.ActionRow: {
      const children = asList(owner.components);
      const hasSelect = children.some((child) => isSelectType(child.type));
      return supportedComponents.actionRow.map((type) => {
        if (hasSelect) {
          return {
            type,
            list,
            unavailable: `This row holds a select menu, which takes a row to itself.`
          };
        }
        if (type !== ComponentType.Button && children.length > 0) {
          return {
            type,
            list,
            unavailable: `A select menu takes a row to itself, and this row has buttons. Add a new action row for it.`
          };
        }
        if (children.length >= maxActionRowButtons) {
          return {
            type,
            list,
            unavailable: `An action row holds at most ${String(maxActionRowButtons)} buttons.`
          };
        }
        return { type, list };
      });
    }
    default:
      return [];
  }
};

/** What can be added inside a node: a message's components (and embeds, for a classic one), a container's, a section's text or an action row's buttons and selects. Empty for anything that holds no children. */
export const childSlots = (
  scene: Scene,
  path: readonly PathSegment[]
): ChildSlot[] => {
  const node = valueAt(scene, path);
  if (!isRecord(node)) return [];
  if (path.length === 1 && path[0] === `modal`) {
    const payload = isRecord(node.payload) ? node.payload : {};
    return slotsFor(payload, [...path, `payload`, `components`], `modal`);
  }
  if (path[0] === `modal`) {
    return slotsFor(node, [...path, `components`], `component`, true);
  }
  if (path.length === 2 && path[0] === `messages`) {
    const payload = isRecord(node.payload) ? node.payload : {};
    const list: Path = [...path, `payload`, `components`];
    if (isComponentsV2(payload)) return slotsFor(payload, list, `v2Message`);
    const embeds = Array.isArray(payload.embeds) ? payload.embeds.length : 0;
    return [
      ...slotsFor(payload, list, `classicMessage`),
      {
        type: `embed`,
        list: [...path, `payload`, `embeds`],
        ...(embeds >= maxEmbeds
          ? {
              unavailable: `A message holds at most ${String(maxEmbeds)} embeds.`
            }
          : {})
      }
    ];
  }
  if (path.at(-1) === `accessory` || path.at(-2) === `embeds`) return [];
  return slotsFor(node, [...path, `components`], `component`);
};

/** What can be added beside a node, after it in the same list. Empty for a message, an accessory, or anything at the root. */
export const siblingSlots = (
  scene: Scene,
  path: readonly PathSegment[]
): ChildSlot[] => {
  if (typeof path.at(-1) !== `number` || path.length <= 2) return [];
  const list = path.slice(0, -1);
  const ownerPath = list.slice(0, -1);
  // An embed's siblings are the message's embeds.
  if (list.at(-1) === `embeds`) {
    return childSlots(scene, ownerPath.slice(0, -1)).filter(
      (slot) => slot.type === `embed`
    );
  }
  // A message's top-level components: the owner is the payload, so ask the message.
  if (ownerPath.at(-1) === `payload`) {
    return childSlots(scene, ownerPath.slice(0, -1)).filter(
      (slot) => slot.type !== `embed`
    );
  }
  return childSlots(scene, ownerPath);
};

/** A child type's name, for menus: "Text Display", "Embed". */
export const childTypeName = (type: ChildType): string =>
  type === `embed` ? `Embed` : componentName(type);
