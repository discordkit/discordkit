import { isObject } from "@discordkit/core/utils/isObject";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { MessagePayload } from "./scene.js";

/** `IS_COMPONENTS_V2`, the message flag that switches a message to Components V2. */
export const componentsV2Flag = 1 << 15;

/** Whether Discord draws the payload as Components V2: the flag is set, or it holds a component only V2 allows, which is anything but an action row. Takes components of any shape that have a `type`, so intake and lint can ask before a payload is known to be valid. */
export const isComponentsV2 = (
  payload: Omit<MessagePayload, `components`> & {
    components?: ReadonlyArray<{ type?: unknown }>;
  }
): boolean =>
  ((payload.flags ?? 0) & componentsV2Flag) !== 0 ||
  (payload.components ?? []).some(
    (component) => component.type !== ComponentType.ActionRow
  );

/** Where a component sits, as far as which types the renderer draws there: in a message, the top level, a container, an action row, a section's text, or a section's accessory; in a modal, the top level, a label's one component, or an action row (the older form of a modal, holding one text input). */
export type ComponentParent =
  | `message`
  | `container`
  | `actionRow`
  | `section`
  | `accessory`
  | `modal`
  | `label`
  | `modalActionRow`;

/** The positions inside a modal. The rest are inside a message. */
export const modalParents: readonly ComponentParent[] = [
  `modal`,
  `label`,
  `modalActionRow`
];

/** The five select menus, which sit in an action row. */
export const selectTypes: readonly ComponentType[] = [
  ComponentType.StringSelect,
  ComponentType.UserSelect,
  ComponentType.RoleSelect,
  ComponentType.MentionableSelect,
  ComponentType.ChannelSelect
];

/**
 * The component types the renderer draws, by where they sit. This is the one list: the React components throw for anything not in it, lint reports anything not in it (as `component-modal-only` or `component-message-only` when it belongs in the other kind of surface, and otherwise as `component-unsupported`), Studio's tree offers only what it lists, and a spec renders every component type in every position to prove they agree.
 *
 * Each list is also every type Discord's component reference allows in that position, so drawing and allowing are the same question here. A modal's top level holds Labels and Text Displays, and Action Rows only in the older form that wraps one Text Input, which Discord now calls deprecated; a select belongs in a Label there, not in an Action Row as in a message.
 */
export const supportedComponents: Readonly<
  Record<ComponentParent, readonly ComponentType[]>
> = {
  message: [
    ComponentType.Container,
    ComponentType.TextDisplay,
    ComponentType.Section,
    ComponentType.Separator,
    ComponentType.MediaGallery,
    ComponentType.File,
    ComponentType.ActionRow
  ],
  container: [
    ComponentType.TextDisplay,
    ComponentType.Section,
    ComponentType.Separator,
    ComponentType.MediaGallery,
    ComponentType.File,
    ComponentType.ActionRow
  ],
  actionRow: [ComponentType.Button, ...selectTypes],
  section: [ComponentType.TextDisplay],
  accessory: [ComponentType.Thumbnail, ComponentType.Button],
  modal: [
    ComponentType.Label,
    ComponentType.TextDisplay,
    ComponentType.ActionRow
  ],
  label: [
    ComponentType.TextInput,
    ...selectTypes,
    ComponentType.FileUpload,
    ComponentType.RadioGroup,
    ComponentType.CheckboxGroup,
    ComponentType.Checkbox
  ],
  modalActionRow: [ComponentType.TextInput]
};

const typesIn = (inModal: boolean): Set<unknown> =>
  new Set(
    Object.entries(supportedComponents)
      .filter(
        ([parent]) =>
          (modalParents as readonly string[]).includes(parent) === inModal
      )
      .flatMap(([, types]) => types)
  );

const inMessages = typesIn(false);
const inModals = typesIn(true);

/** Which kind of surface a component type belongs to, by the lists above: `message` for a type only a message holds (a button, a container), `modal` for one only a modal holds (a label, a text input), `both` (a select, a text display), or `neither` for a number Discord does not define. Lint reads it to say where a misplaced component belongs. */
export const componentSurface = (
  type: unknown
): `message` | `modal` | `both` | `neither` => {
  const message = inMessages.has(type);
  const modal = inModals.has(type);
  return message && modal
    ? `both`
    : message
      ? `message`
      : modal
        ? `modal`
        : `neither`;
};

/** What a message's `openSelect` names: the string select to draw open, or why there is none. */
export type OpenSelectLookup =
  | { select: Record<string, unknown> }
  | { problem: `missing` | `notStringSelect` };

/** Finds the first component in a message's tree with this `customId`, searching every `components` list (an action row's may be a bare object, as the client's schema has it), and says whether it is a string select, the only kind the preview can draw open. Shared by lint and the renderer, so they agree. */
export const findOpenSelect = (
  components: unknown,
  customId: string
): OpenSelectLookup => {
  const find = (items: unknown): Record<string, unknown> | undefined => {
    const list: unknown[] = Array.isArray(items)
      ? items
      : isObject(items)
        ? [items]
        : [];
    for (const item of list) {
      if (!isObject(item)) continue;
      if (item.customId === customId) return item;
      const found = find(item.components);
      if (found) return found;
    }
    return undefined;
  };
  const found = find(components);
  if (found === undefined) return { problem: `missing` };
  return found.type === ComponentType.StringSelect
    ? { select: found }
    : { problem: `notStringSelect` };
};

/** A component type's name as Discord's reference writes it, such as `Text Display`, or `type 99` for a number Discord does not define. */
export const componentName = (type: unknown): string => {
  const name: unknown =
    typeof type === `number` ? ComponentType[type] : undefined;
  return typeof name === `string`
    ? name.replace(/(?<=[a-z])(?=[A-Z])/g, ` `)
    : `type ${String(type)}`;
};
