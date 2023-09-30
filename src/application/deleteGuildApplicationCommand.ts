import { z } from "zod";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated
} from "#/utils/index.ts";

export const deleteGuildApplicationCommandSchema = z.object({
  application: z.string().min(1),
  guild: z.string().min(1),
  command: z.string().min(1)
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
