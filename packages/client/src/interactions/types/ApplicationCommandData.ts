import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { applicationCommandTypeSchema } from "../../application-commands/types/ApplicationCommandType.js";
import { resolvedDataSchema } from "./ResolvedData.js";
import { applicationCommandInteractionDataOptionSchema } from "./ApplicationCommandInteractionDataOption.js";

export const applicationCommandDataSchema = v.object({
  /** ID of the invoked command */
  id: snowflake,
  /** name of the invoked command */
  name: v.pipe(v.string(), v.nonEmpty()),
  /** type of the invoked command */
  type: applicationCommandTypeSchema,
  /** Converted users + roles + channels + attachments */
  resolved: v.exactOptional(resolvedDataSchema),
  /** Params + values from the user */
  options: v.exactOptional(
    v.array(applicationCommandInteractionDataOptionSchema)
  ),
  /** ID of the guild the command is registered to */
  guildId: v.exactOptional(snowflake),
  /** ID of the user or message targeted by a user or message command */
  targetId: v.exactOptional(snowflake)
});

export interface ApplicationCommandDataSchema
  extends v.InferOutput<typeof applicationCommandDataSchema> {}
