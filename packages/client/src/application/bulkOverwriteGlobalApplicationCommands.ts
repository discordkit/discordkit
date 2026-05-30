import * as v from "valibot";
import { put, type Fetcher, snowflake } from "@discordkit/core";
import {
  type ApplicationCommand,
  applicationCommandSchema
} from "../application-commands/types/ApplicationCommand.js";

export const bulkOverwriteGlobalApplicationCommandsSchema = v.object({
  application: snowflake,
  body: v.pipe(v.array(applicationCommandSchema), v.maxLength(25))
});

/**
 * ### [Bulk Overwrite Global Application Commands](https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands)
 *
 * **PUT** `/applications/:application/commands`
 *
 * Takes a list of application commands, overwriting the existing global command list for this application. Returns `200` and a list of {@link ApplicationCommand | application command objects}. Commands that do not already exist will count toward daily {@link ApplicationCommand | application command} create limits.
 *
 * > [!WARNING]
 * >
 * > This will overwrite **all** types of application commands: slash commands, user commands, and message commands.
 */
export const bulkOverwriteGlobalApplicationCommands: Fetcher<
  typeof bulkOverwriteGlobalApplicationCommandsSchema,
  ApplicationCommand[]
> = async ({ application, body }) =>
  put(`/applications/${application}/commands`, body);
