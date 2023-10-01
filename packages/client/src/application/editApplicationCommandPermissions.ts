import { z } from "zod";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated
} from "@discordkit/core";
import {
  guildApplicationCommandPermissionsSchema,
  type GuildApplicationCommandPermissions
} from "./types/GuildApplicationCommandPermissions.ts";
import { applicationCommandPermissionsSchema } from "./types/ApplicationCommandPermissions.ts";

export const editApplicationCommandPermissionsSchema = z.object({
  application: z.string().min(1),
  guild: z.string().min(1),
  command: z.string().min(1),
  body: z.object({
    /** Permissions for the command in the guild */
    permissions: applicationCommandPermissionsSchema.array().max(100)
  })
});

/**
 * ### [Edit Application Command Permissions](https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions)
 *
 * **PUT* `/applications/:application/guilds/:guild/commands/:command/permissions`
 *
 * > **DANGER**
 * >
 * > Apps that use this endpoint may be affected by upcoming breaking changes around permission configuration behavior starting on December 16, 2022. Read the changelog for details.
 *
 * > **WARNING**
 * >
 * > This endpoint will overwrite existing permissions for the command in that guild
 *
 * Edits command permissions for a specific command for your application in a guild and returns a guild application command permissions object. Fires an Application Command Permissions Update Gateway event.
 *
 * You can add up to 100 permission overwrites for a command.
 *
 * > **NOTE**
 * >
 * > This endpoint requires authentication with a Bearer token that has permission to manage the guild and its roles. For more information, read above about application command permissions.
 *
 * > **WARNING**
 * >
 * > Deleting or renaming a command will permanently delete all permissions for the command
 */
export const editApplicationCommandPermissions: Fetcher<
  typeof editApplicationCommandPermissionsSchema,
  GuildApplicationCommandPermissions
> = async ({ application, guild, command, body }) =>
  patch(
    `/applications/${application}/guilds/${guild}/commands/${command}/permissions`,
    body
  );

export const editApplicationCommandPermissionsSafe = toValidated(
  editApplicationCommandPermissions,
  editApplicationCommandPermissionsSchema,
  guildApplicationCommandPermissionsSchema
);

export const editApplicationCommandPermissionsProcedure = toProcedure(
  `mutation`,
  editApplicationCommandPermissions,
  editApplicationCommandPermissionsSchema,
  guildApplicationCommandPermissionsSchema
);
