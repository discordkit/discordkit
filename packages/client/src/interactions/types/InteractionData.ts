import {
  object,
  nullish,
  array,
  string,
  type InferOutput,
  pipe,
  nonEmpty
} from "valibot";
import { snowflake } from "@discordkit/core";
import { applicationCommandTypeSchema } from "../../application/types/ApplicationCommandType.js";
import { resolvedDataSchema } from "./ResolvedData.js";
import { applicationCommandInteractionDataOptionSchema } from "./ApplicationCommandInteractionDataOption.js";

export const interactionDataSchema = object({
  /** the ID of the invoked command */
  id: snowflake,
  /** the name of the invoked command */
  name: pipe(string(), nonEmpty()),
  /** the type of the invoked command */
  type: applicationCommandTypeSchema,
  /** converted users + roles + channels + attachments */
  resolved: nullish(resolvedDataSchema),
  /** the params + values from the user */
  options: nullish(array(applicationCommandInteractionDataOptionSchema)),
  /** the id of the guild the command is registered to */
  guildId: nullish(snowflake),
  /** id of the user or message targeted by a user or message command */
  targetId: nullish(snowflake)
});

export type InteractionDataSchema = InferOutput<typeof interactionDataSchema>;
