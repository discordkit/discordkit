import { createContext, useContext } from "react";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { StringSelect } from "@discordkit/client/components/types/StringSelect";
import { findOpenSelect } from "../components.js";

/** Which string select in a message the scene draws open, and the CSS anchor name its list is positioned against. */
export interface OpenSelect {
  customId: string;
  anchorName: string;
}

export const OpenSelectContext = createContext<OpenSelect | null>(null);

/** The anchor name for the select a closed control with this `customId` should carry, or `undefined` when it is not the one drawn open. */
export const useOpenSelectAnchor = (customId: string): string | undefined => {
  const open = useContext(OpenSelectContext);
  return open?.customId === customId ? open.anchorName : undefined;
};

/** The anchor name of the open select in the message at `index`, unique in the scene. */
export const openSelectAnchor = (index: number): string =>
  `--dkp-open-select-${String(index)}`;

/** Whether a component found by `customId` is a string select. Its fields are taken on trust, as every component's are once its type is known. */
const isStringSelect = (
  component: Record<string, unknown>
): component is Record<string, unknown> & StringSelect =>
  component.type === ComponentType.StringSelect;

/**
 * The string select a message's `openSelect` names, or an error saying why it cannot be drawn open: no component has that `customId`, or the one that does is not a string select, whose options are the only ones a payload carries.
 */
export const openStringSelect = (
  components: unknown,
  customId: string,
  index: number
): StringSelect | Error => {
  const found = findOpenSelect(components, customId);
  if (`select` in found && isStringSelect(found.select)) return found.select;
  return new Error(
    `problem` in found && found.problem === `missing`
      ? `@discordkit/preview cannot draw message ${String(index + 1)}'s select open: its \`openSelect\` is ${JSON.stringify(customId)}, but no component in the message has that \`customId\`. \`openSelect\` names the String Select to draw with its options listed. Set it to the \`customId\` of a String Select in the message, or leave it out to draw every select closed.`
      : `@discordkit/preview cannot draw message ${String(index + 1)}'s select open: its \`openSelect\` names ${JSON.stringify(customId)}, which is not a String Select. Only a String Select's options are in the payload; a user, role, mentionable or channel select lists what the client fetches from the server, so the preview has nothing true to show. Point \`openSelect\` at a String Select, or leave it out.`
  );
};
