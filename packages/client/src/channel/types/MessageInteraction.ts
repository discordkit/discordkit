import { z } from "zod";
import { interactionTypeSchema } from "#/interactions/types/InteractionType.ts";
import { userSchema } from "#/user/types/User.ts";
import { memberSchema } from "#/guild/types/Member.ts";
import { snowflake } from "@discordkit/core";

export const messageInteractionSchema = z.object({
  /** id of the interaction */
  id: snowflake,
  /** the type of interaction */
  type: interactionTypeSchema,
  /** the name of the application command */
  name: z.string().min(1),
  /** the user who invoked the interaction */
  user: userSchema,
  /** the member who invoked the interaction in the guild */
  member: memberSchema.partial().nullable()
});

export type MessageInteraction = z.infer<typeof messageInteractionSchema>;
