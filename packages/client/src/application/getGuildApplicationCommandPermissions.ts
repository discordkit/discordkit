import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  guildApplicationCommandPermissionsSchema,
  type GuildApplicationCommandPermissions
} from "./types/GuildApplicationCommandPermissions.ts";

export const getGuildApplicationCommandPermissionsSchema = z.object({
  application: snowflake,
  guild: snowflake
});

/**
 * ### [Get Guild Application Command Permissions](https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command-permissions)
 *
 * **GET** `/applications/:application/guilds/:guild/commands/permissions`
 *
 * Fetches permissions for all commands for your application in a guild. Returns an array of guild {@link GuildApplicationCommandPermissions | application command permissions objects}.
 */
export const getGuildApplicationCommandPermissions: Fetcher<
  typeof getGuildApplicationCommandPermissionsSchema,
  GuildApplicationCommandPermissions[]
> = async ({ application, guild }) =>
  get(`/applications/${application}/guilds/${guild}/commands/permissions`);

export const getGuildApplicationCommandPermissionsSafe = toValidated(
  getGuildApplicationCommandPermissions,
  getGuildApplicationCommandPermissionsSchema,
  guildApplicationCommandPermissionsSchema.array()
);

export const getGuildApplicationCommandPermissionsProcedure = toProcedure(
  `query`,
  getGuildApplicationCommandPermissions,
  getGuildApplicationCommandPermissionsSchema,
  guildApplicationCommandPermissionsSchema.array()
);

export const getGuildApplicationCommandPermissionsQuery = toQuery(
  getGuildApplicationCommandPermissions
);
