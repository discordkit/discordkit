import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { applicationCommandTypeSchema } from "../../application/types/ApplicationCommandType.ts";
import { resolvedDataSchema } from "./ResolvedData.ts";
import { applicationCommandInteractionDataOptionSchema } from "./ApplicationCommandInteractionDataOption.ts";

export const interactionDataSchema = z.object({
  /** the ID of the invoked command */
  id: snowflake,
  /** the name of the invoked command */
  name: z.string().min(1),
  /** the type of the invoked command */
  type: applicationCommandTypeSchema,
  /** converted users + roles + channels + attachments */
  resolved: resolvedDataSchema.nullable(),
  /** the params + values from the user */
  options: applicationCommandInteractionDataOptionSchema.array().nullable(),
  /** the id of the guild the command is registered to */
  guildId: snowflake.nullable(),
  /** id of the user or message targeted by a user or message command */
  targetId: snowflake.nullable()
});

export type InteractionDataSchema = z.infer<typeof interactionDataSchema>;
