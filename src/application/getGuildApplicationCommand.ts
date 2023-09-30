import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "#/utils/index.ts";
import {
  type ApplicationCommand,
  applicationCommandSchema
} from "./types/ApplicationCommand.ts";

export const getGuildApplicationCommandSchema = z.object({
  application: z.string().min(1),
  guild: z.string().min(1),
  command: z.string().min(1)
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

export const getGuildApplicationCommandSafe = toValidated(
  getGuildApplicationCommand,
  getGuildApplicationCommandSchema,
  applicationCommandSchema
);

export const getGuildApplicationCommandProcedure = toProcedure(
  `query`,
  getGuildApplicationCommand,
  getGuildApplicationCommandSchema,
  applicationCommandSchema
);

export const getGuildApplicationCommandQuery = toQuery(
  getGuildApplicationCommand
);
