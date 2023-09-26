import { z } from "zod";
import { applicationCommandTypeSchema } from "../../application";
import { resolvedDataSchema } from "./ResolvedData";
import { applicationCommandInteractionDataOptionSchema } from "./ApplicationCommandInteractionDataOption";

export const interactionDataSchema = z.object({
  /** the ID of the invoked command */
  id: z.string().min(1),
  /** the name of the invoked command */
  name: z.string().min(1),
  /** the type of the invoked command */
  type: applicationCommandTypeSchema,
  /** converted users + roles + channels + attachments */
  resolved: resolvedDataSchema.nullable(),
  /** the params + values from the user */
  options: applicationCommandInteractionDataOptionSchema.array().nullable(),
  /** the id of the guild the command is registered to */
  guildId: z.string().min(1).nullable(),
  /** id of the user or message targeted by a user or message command */
  targetId: z.string().min(1).nullable()
});

export type InteractionDataSchema = z.infer<typeof interactionDataSchema>;
