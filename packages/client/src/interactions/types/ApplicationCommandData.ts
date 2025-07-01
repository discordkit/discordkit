import {
  object,
  exactOptional,
  array,
  string,
  type InferOutput,
  pipe,
  nonEmpty
} from "valibot";
import { snowflake } from "@discordkit/core";
import { applicationCommandTypeSchema } from "../../application-commands/types/ApplicationCommandType.js";
import { resolvedDataSchema } from "./ResolvedData.js";
import { applicationCommandInteractionDataOptionSchema } from "./ApplicationCommandInteractionDataOption.js";

export const applicationCommandDataSchema = object({
  /** ID of the invoked command */
  id: snowflake,
  /** name of the invoked command */
  name: pipe(string(), nonEmpty()),
  /** type of the invoked command */
  type: applicationCommandTypeSchema,
  /** Converted users + roles + channels + attachments */
  resolved: exactOptional(resolvedDataSchema),
  /** Params + values from the user */
  options: exactOptional(array(applicationCommandInteractionDataOptionSchema)),
  /** ID of the guild the command is registered to */
  guildId: exactOptional(snowflake),
  /** ID of the user or message targeted by a user or message command */
  targetId: exactOptional(snowflake)
});

export interface ApplicationCommandDataSchema
  extends InferOutput<typeof applicationCommandDataSchema> {}
