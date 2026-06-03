import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type ApplicationCommand } from "../application-commands/types/ApplicationCommand.js";

export const getGuildApplicationCommandSchema = v.object({
  application: snowflake,
  guild: snowflake,
  command: snowflake
});

/**
 * ### [Get Guild Application Command](https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command)
 *
 * **GET** `/applications/:application/guilds/:guild/commands/:command`
 *
 * Fetch a guild command for your application. Returns an {@link ApplicationCommand | application command object}.
 */
export const getGuildApplicationCommand: Fetcher<
  typeof getGuildApplicationCommandSchema,
  ApplicationCommand
> = async ({ application, guild, command }) =>
  get(`/applications/${application}/guilds/${guild}/commands/${command}`);
