import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { applicationCommandPermissionsSchema } from "./ApplicationCommandPermissions.js";

export const guildApplicationCommandPermissionsSchema = z.object({
  /** ID of the command or the application ID */
  id: snowflake,
  /** ID of the application the command belongs to */
  applicationId: snowflake,
  /** ID of the guild */
  guildId: snowflake,
  /** Permissions for the command in the guild, max of 100 */
  permissions: applicationCommandPermissionsSchema.array().max(100)
});

export type GuildApplicationCommandPermissions = z.infer<
  typeof guildApplicationCommandPermissionsSchema
>;
