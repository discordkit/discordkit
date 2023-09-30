import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "#/utils/index.ts";
import {
  guildApplicationCommandPermissionsSchema,
  type GuildApplicationCommandPermissions
} from "./types/GuildApplicationCommandPermissions.ts";

export const getApplicationCommandPermissionsSchema = z.object({
  application: z.string().min(1),
  guild: z.string().min(1),
  command: z.string().min(1)
});

/**
 * ### [Get Application Command Permissions](https://discord.com/developers/docs/interactions/application-commands#get-application-command-permissions)
 *
 * **GET** `/applications/:application/guilds/:guild/commands/:command/permissions`
 *
 * Fetches permissions for a specific command for your application in a guild. Returns a {@link GuildApplicationCommandPermissions | guild application command permissions} object.
 */
export const getApplicationCommandPermissions: Fetcher<
  typeof getApplicationCommandPermissionsSchema,
  GuildApplicationCommandPermissions
> = async ({ application, guild, command }) =>
  get(
    `/applications/${application}/guilds/${guild}/commands/${command}/permissions`
  );

export const getApplicationCommandPermissionsSafe = toValidated(
  getApplicationCommandPermissions,
  getApplicationCommandPermissionsSchema,
  guildApplicationCommandPermissionsSchema
);

export const getApplicationCommandPermissionsProcedure = toProcedure(
  `query`,
  getApplicationCommandPermissions,
  getApplicationCommandPermissionsSchema,
  guildApplicationCommandPermissionsSchema
);

export const getApplicationCommandPermissionsQuery = toQuery(
  getApplicationCommandPermissions
);
