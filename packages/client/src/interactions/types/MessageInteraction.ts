import * as v from "valibot";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { partialSchema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { interactionTypeSchema } from "./InteractionType.js";
import { userSchema } from "../../user/types/User.js";
import { memberSchema } from "../../guild/types/Member.js";

/**
 * ### [Message Interaction](https://discord.com/developers/docs/interactions/receiving-and-responding#message-interaction-object)
 *
 * This is sent on the message object when the message is a response to an Interaction without an existing message.
 */
export const messageInteractionSchema = v.object({
  /** id of the interaction */
  id: snowflake,
  /** the type of interaction */
  type: interactionTypeSchema,
  /** the name of the {@link ApplicationCommand | application command} */
  name: boundedString({ max: 32 }),
  /** the user who invoked the interaction */
  user: userSchema,
  /** the member who invoked the interaction in the guild */
  member: v.exactOptional(partialSchema(memberSchema))
});

export interface MessageInteraction extends v.InferOutput<
  typeof messageInteractionSchema
> {}
