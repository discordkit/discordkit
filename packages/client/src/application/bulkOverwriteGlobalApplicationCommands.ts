import { z } from "zod";
import { put, type Fetcher, toProcedure, toValidated } from "@discordkit/core";
import {
  type ApplicationCommand,
  applicationCommandSchema
} from "./types/ApplicationCommand.ts";

export const bulkOverwriteGlobalApplicationCommandsSchema = z.object({
  application: z.string().min(1),
  body: applicationCommandSchema.array().max(25)
});

/**
 * ### [Bulk Overwrite Global Application Commands](https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands)
 *
 * **PUT** `/applications/:application/commands`
 *
 * Takes a list of application commands, overwriting the existing global command list for this application. Returns `200` and a list of {@link ApplicationCommand | application command objects}. Commands that do not already exist will count toward daily application command create limits.
 *
 * > **DANGER**
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
  applicationCommandSchema.array()
);

export const bulkOverwriteGlobalApplicationCommandsProcedure = toProcedure(
  `mutation`,
  bulkOverwriteGlobalApplicationCommands,
  bulkOverwriteGlobalApplicationCommandsSchema,
  applicationCommandSchema.array()
);
