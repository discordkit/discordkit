import { array, boolean, nullish, object, optional } from "valibot";
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

export const getGuildApplicationCommandsSchema = object({
  application: snowflake,
  guild: snowflake,
  params: optional(
    object({
      /** Whether to include full localization dictionaries (nameLocalizations and descriptionLocalizations) in the returned objects, instead of the nameLocalized and descriptionLocalized fields. Default false. */
      withLocalizations: nullish(boolean(), false)
    })
  )
});

/**
 * ### [Get Guild Application Commands](https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands)
 *
 * **GET** `/applications/:application/guilds/:guild/commands`
 *
 * > **WARNING**
 * >
 * > The objects returned by this endpoint may be augmented with additional fields if localization is active.
 *
 * Fetch all of the guild commands for your application for a specific guild. Returns an array of {@link ApplicationCommand|application command objects}.
 */
export const getGuildApplicationCommands: Fetcher<
  typeof getGuildApplicationCommandsSchema,
  ApplicationCommand[]
> = async ({ application, guild, params }) =>
  get(`/applications/${application}/guilds/${guild}/commands`, params);

export const getGuildApplicationCommandsSafe = toValidated(
  getGuildApplicationCommands,
  getGuildApplicationCommandsSchema,
  array(applicationCommandSchema)
);

export const getGuildApplicationCommandsProcedure = toProcedure(
  `query`,
  getGuildApplicationCommands,
  getGuildApplicationCommandsSchema,
  array(applicationCommandSchema)
);

export const getGuildApplicationCommandsQuery = toQuery(
  getGuildApplicationCommands
);
