import * as v from "valibot";

export const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
  MODAL_SUBMIT: 5
} as const;

/**
 * ### [Interaction Type](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object)
 */
export const interactionTypeSchema = v.enum_(InteractionType);
