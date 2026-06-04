import * as v from "valibot";
import { remove, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const deleteGuildApplicationCommandSchema = v.object({
  application: snowflake,
  guild: snowflake,
  command: snowflake
});

/**
 * ### [Delete Guild Application Command](https://discord.com/developers/docs/interactions/application-commands#delete-guild-application-command)
 *
 * **DELETE** `/applications/:application/guilds/:guild/commands/:command`
 *
 * Delete a guild command. Returns `204 No Content` on success.
 */
export const deleteGuildApplicationCommand: Fetcher<
  typeof deleteGuildApplicationCommandSchema
> = async ({ application, guild, command }) =>
  remove(`/applications/${application}/guilds/${guild}/commands/${command}`);
