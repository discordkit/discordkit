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

/** Where a component sits, as far as which types the renderer draws there. */
export type ComponentParent = `message` | `container` | `actionRow`;

/**
 * The component types the renderer draws, by where they sit. This is the one list: the React components throw for anything not in it, lint reports anything not in it as `component-unsupported`, and a spec renders every component type in every position to prove the two agree.
 *
 * A section, thumbnail, file or select menu is in none of the lists yet, so a message holding one is reported by lint before a render would throw.
 */
export const supportedComponents: Readonly<
  Record<ComponentParent, readonly ComponentType[]>
> = {
  message: [
    ComponentType.Container,
    ComponentType.TextDisplay,
    ComponentType.Separator,
    ComponentType.MediaGallery,
    ComponentType.ActionRow
  ],
  container: [
    ComponentType.TextDisplay,
    ComponentType.Separator,
    ComponentType.MediaGallery,
    ComponentType.ActionRow
  ],
  actionRow: [ComponentType.Button]
};

/** A component type's name as Discord's reference writes it, such as `Text Display`, or `type 99` for a number Discord does not define. */
export const componentName = (type: unknown): string => {
  const name: unknown =
    typeof type === `number` ? ComponentType[type] : undefined;
  return typeof name === `string`
    ? name.replace(/(?<=[a-z])(?=[A-Z])/g, ` `)
    : `type ${String(type)}`;
};
