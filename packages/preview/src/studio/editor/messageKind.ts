import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { componentName, componentsV2Flag } from "../../components.js";
import { characters } from "../../lint/limits.js";
import type { MessagePayload } from "../../scene.js";
import { asList } from "./tree.js";

type TopLevel = NonNullable<MessagePayload[`components`]>[number];

const isActionRow = (
  component: TopLevel
): component is Extract<TopLevel, { type: ComponentType.ActionRow }> =>
  component.type === ComponentType.ActionRow;

/**
 * Switching a message between classic and Components V2. The two hold different things, and Discord refuses a message that mixes them: a V2 message cannot have `content` or `embeds`, and a classic one holds nothing but action rows. So a switch discards what the other kind cannot hold, and the person is told exactly what before it happens.
 */

export type MessageKind = `classic` | `v2`;

export interface KindSwitch {
  payload: MessagePayload;
  /** What the switch throws away, one line each, for the warning. Empty when nothing is lost. */
  discarded: string[];
}

const plural = (count: number, one: string): string =>
  `${String(count)} ${one}${count === 1 ? `` : `s`}`;

export const switchKind = (
  payload: MessagePayload,
  to: MessageKind
): KindSwitch => {
  const flags = payload.flags ?? 0;
  const components = asList(payload.components);
  if (to === `v2`) {
    const { content, embeds, ...rest } = payload;
    const discarded: string[] = [];
    if (content !== undefined && content !== ``) {
      discarded.push(
        `The message's text (${plural(characters(content), `character`)})`
      );
    }
    if (embeds !== undefined && embeds.length > 0) {
      discarded.push(plural(embeds.length, `embed`));
    }
    return {
      payload: { ...rest, flags: flags | componentsV2Flag },
      discarded
    };
  }
  const dropped = components.filter(
    (component) => component.type !== ComponentType.ActionRow
  );
  const counts = new Map<string, number>();
  const holders = new Set<string>();
  for (const component of dropped) {
    const name = componentName(component.type);
    counts.set(name, (counts.get(name) ?? 0) + 1);
    if (
      component.type === ComponentType.Container ||
      component.type === ComponentType.Section
    ) {
      holders.add(name);
    }
  }
  const { flags: _, ...rest } = payload;
  const remaining = flags & ~componentsV2Flag;
  return {
    payload: {
      ...rest,
      ...(remaining === 0 ? {} : { flags: remaining }),
      ...(payload.components === undefined
        ? {}
        : { components: payload.components.filter(isActionRow) })
    },
    discarded: [...counts].map(([name, count]) =>
      holders.has(name)
        ? `${plural(count, name)}, and everything in ${count === 1 ? `it` : `them`}`
        : plural(count, name)
    )
  };
};
