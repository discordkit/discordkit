import { z } from "zod";
import { applicationCommandPermissionsSchema } from "./ApplicationCommandPermissions.ts";

export const guildApplicationCommandPermissionsSchema = z.object({
  /** ID of the command or the application ID */
  id: z.string().min(1),
  /** ID of the application the command belongs to */
  applicationId: z.string().min(1),
  /** ID of the guild */
  guildId: z.string().min(1),
  /** Permissions for the command in the guild, max of 100 */
  permissions: applicationCommandPermissionsSchema.array().max(100)
});

export type GuildApplicationCommandPermissions = z.infer<
  typeof guildApplicationCommandPermissionsSchema
>;
