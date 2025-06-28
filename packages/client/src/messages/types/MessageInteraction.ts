import {
  object,
  string,
  minLength,
  partial,
  nullish,
  type InferOutput,
  pipe
} from "valibot";
import { snowflake } from "@discordkit/core";
import { interactionTypeSchema } from "../../interactions/types/InteractionType.js";
import { userSchema } from "../../user/types/User.js";
import { memberSchema } from "../../guild/types/Member.js";

export const messageInteractionSchema = object({
  /** id of the interaction */
  id: snowflake,
  /** the type of interaction */
  type: interactionTypeSchema,
  /** the name of the application command */
  name: pipe(string(), minLength(1)),
  /** the user who invoked the interaction */
  user: userSchema,
  /** the member who invoked the interaction in the guild */
  member: nullish(partial(memberSchema))
});

export type MessageInteraction = InferOutput<typeof messageInteractionSchema>;
