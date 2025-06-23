import { object } from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteGuildApplicationCommandSchema = object({
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

export const deleteGuildApplicationCommandSafe = toValidated(
  deleteGuildApplicationCommand,
  deleteGuildApplicationCommandSchema
);

export const deleteGuildApplicationCommandProcedure = toProcedure(
  `mutation`,
  deleteGuildApplicationCommand,
  deleteGuildApplicationCommandSchema
);
