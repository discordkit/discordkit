import { array, maxLength, object } from "valibot";
import {
  put,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  type ApplicationCommand,
  applicationCommandSchema
} from "./types/ApplicationCommand.js";

export const bulkOverwriteGlobalApplicationCommandsSchema = object({
  application: snowflake,
  body: array(applicationCommandSchema, [maxLength(25)])
});

/**
 * ### [Bulk Overwrite Global Application Commands](https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands)
 *
 * **PUT** `/applications/:application/commands`
 *
 * Takes a list of application commands, overwriting the existing global command list for this application. Returns `200` and a list of {@link ApplicationCommand | application command objects}. Commands that do not already exist will count toward daily application command create limits.
 *
 * > [!CAUTION]
 * >
 * > This will overwrite all types of application commands: slash commands, user commands, and message commands.
 */
export const bulkOverwriteGlobalApplicationCommands: Fetcher<
  typeof bulkOverwriteGlobalApplicationCommandsSchema,
  ApplicationCommand[]
> = async ({ application, body }) =>
  put(`/applications/${application}/commands`, body);

export const bulkOverwriteGlobalApplicationCommandsSafe = toValidated(
  bulkOverwriteGlobalApplicationCommands,
  bulkOverwriteGlobalApplicationCommandsSchema,
  array(applicationCommandSchema)
);

export const bulkOverwriteGlobalApplicationCommandsProcedure = toProcedure(
  `mutation`,
  bulkOverwriteGlobalApplicationCommands,
  bulkOverwriteGlobalApplicationCommandsSchema,
  array(applicationCommandSchema)
);
