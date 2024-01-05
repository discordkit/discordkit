import { object } from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  type ApplicationCommand,
  applicationCommandSchema
} from "./types/ApplicationCommand.js";

export const getGlobalApplicationCommandSchema = object({
  application: snowflake,
  command: snowflake
});

/**
 * ### [Get Global Application Command](https://discord.com/developers/docs/interactions/application-commands#get-global-application-command)
 *
 * **GET** `/applications/:application/commands/:command`
 *
 * Fetch a global command for your application. Returns an {@link ApplicationCommand | application command object}.
 */
export const getGlobalApplicationCommand: Fetcher<
  typeof getGlobalApplicationCommandSchema,
  ApplicationCommand
> = async ({ application, command }) =>
  get(`/applications/${application}/commands/${command}`);

export const getGlobalApplicationCommandSafe = toValidated(
  getGlobalApplicationCommand,
  getGlobalApplicationCommandSchema,
  applicationCommandSchema
);

export const getGlobalApplicationCommandProcedure = toProcedure(
  `query`,
  getGlobalApplicationCommand,
  getGlobalApplicationCommandSchema,
  applicationCommandSchema
);

export const getGlobalApplicationCommandQuery = toQuery(
  getGlobalApplicationCommand
);
