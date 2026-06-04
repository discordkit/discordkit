import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type GuildApplicationCommandPermissions } from "../application-commands/types/GuildApplicationCommandPermissions.js";

export const getApplicationCommandPermissionsSchema = v.object({
  application: snowflake,
  guild: snowflake,
  command: snowflake
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
