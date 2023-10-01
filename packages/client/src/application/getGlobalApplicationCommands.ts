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
  type ApplicationCommand,
  applicationCommandSchema
} from "./types/ApplicationCommand.ts";

export const getGlobalApplicationCommandsSchema = z.object({
  application: snowflake,
  params: z
    .object({
      /** Whether to include full localization dictionaries (nameLocalizations and descriptionLocalizations) in the returned objects, instead of the nameLocalized and descriptionLocalized fields. Default false. */
      withLocalizations: z.boolean().default(false).nullable()
    })
    .optional()
});

/**
 * ### [Get Global Application Commands](https://discord.com/developers/docs/interactions/application-commands#get-global-application-commands)
 *
 * **GET** `/applications/:application/commands`
 *
 * > **WARNING**
 * >
 * > The objects returned by this endpoint may be augmented with additional fields if localization is active.
 *
 * Fetch all of the global commands for your application. Returns an array of {@link ApplicationCommand|application command objects}.
 */
export const getGlobalApplicationCommands: Fetcher<
  typeof getGlobalApplicationCommandsSchema,
  ApplicationCommand[]
> = async ({ application, params }) =>
  get(`/applications/${application}/commands`, params);

export const getGlobalApplicationCommandsSafe = toValidated(
  getGlobalApplicationCommands,
  getGlobalApplicationCommandsSchema,
  applicationCommandSchema.array()
);

export const getGlobalApplicationCommandsProcedure = toProcedure(
  `query`,
  getGlobalApplicationCommands,
  getGlobalApplicationCommandsSchema,
  applicationCommandSchema.array()
);

export const getGlobalApplicationCommandsQuery = toQuery(
  getGlobalApplicationCommands
);
