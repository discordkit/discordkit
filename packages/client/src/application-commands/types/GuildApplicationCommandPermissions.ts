import * as v from "valibot";
import { snowflake, boundedArray } from "@discordkit/core";
import { applicationCommandPermissionsSchema } from "./ApplicationCommandPermissions.js";

export const guildApplicationCommandPermissionsSchema = v.object({
  /** ID of the command or the application ID */
  id: snowflake,
  /** ID of the application the command belongs to */
  applicationId: snowflake,
  /** ID of the guild */
  guildId: snowflake,
  /** Permissions for the command in the guild, max of 100 */
  permissions: boundedArray(applicationCommandPermissionsSchema, { max: 100 })
});

export interface GuildApplicationCommandPermissions
  extends v.InferOutput<typeof guildApplicationCommandPermissionsSchema> {}
