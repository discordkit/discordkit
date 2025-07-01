import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { interactionTypeSchema } from "./InteractionType.js";
import { userSchema } from "../../user/types/User.js";
import { memberSchema } from "../../guild/types/Member.js";

export const messageInteractionSchema = v.object({
  /** id of the interaction */
  id: snowflake,
  /** the type of interaction */
  type: interactionTypeSchema,
  /** the name of the application command */
  name: v.pipe(v.string(), v.nonEmpty(), v.maxLength(32)),
  /** the user who invoked the interaction */
  user: userSchema,
  /** the member who invoked the interaction in the guild */
  member: v.exactOptional(v.partial(memberSchema))
});

export interface MessageInteraction
  extends v.InferOutput<typeof messageInteractionSchema> {}
