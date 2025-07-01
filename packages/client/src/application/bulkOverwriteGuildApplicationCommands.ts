import {
  pipe,
  array,
  boolean,
  maxLength,
  minLength,
  nullish,
  object,
  record,
  string,
  type GenericSchema
} from "valibot";
import {
  put,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  asDigits
} from "@discordkit/core";
import {
  type ApplicationCommand,
  applicationCommandSchema
} from "../application-commands/types/ApplicationCommand.js";
import { localesSchema } from "./types/Locales.js";
import { applicationCommandOptionSchema } from "../application-commands/types/ApplicationCommandOption.js";
import {
  ApplicationCommandType,
  applicationCommandTypeSchema
} from "../application-commands/types/ApplicationCommandType.js";
import { permissionFlag } from "../permissions/Permissions.js";

export const bulkOverwriteGuildApplicationCommandsSchema = object({
  application: snowflake,
  guild: snowflake,
  body: pipe(
    array(
      object({
        /** ID of the command, if known */
        id: nullish(snowflake),
        /** Name of command, 1-32 characters */
        name: pipe(string(), minLength(1), maxLength(32)),
        /** Localization dictionary for the `name` field. Values follow the same restrictions as `name` */
        nameLocalizations: nullish(
          record(localesSchema, pipe(string(), minLength(1), maxLength(32)))
        ),
        /** 1-100 character description */
        description: pipe(string(), minLength(1), maxLength(100)),
        /** Localization dictionary for the `description` field. Values follow the same restrictions as `description` */
        descriptionLocalizations: nullish(
          record(localesSchema, pipe(string(), minLength(1), maxLength(100)))
        ),
        /** Parameters for the command */
        options: nullish(array(applicationCommandOptionSchema)),
        /** Set of permissions represented as a bit set */
        defaultMemberPermissions: nullish(
          asDigits(permissionFlag) as GenericSchema<string>
        ),
        /** Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible. */
        dmPermission: nullish(boolean()),
        /** Replaced by `defaultMemberPermissions` and will be deprecated in the future. Indicates whether the command is enabled by default when the app is added to a guild. Defaults to `true` */
        defaultPermission: nullish(boolean(), true),
        /** Type of command, defaults `1` if not set */
        type: nullish(
          applicationCommandTypeSchema,
          ApplicationCommandType.CHAT_INPUT
        ),
        /** Indicates whether the command is age-restricted */
        nsfw: nullish(boolean())
      })
    ),
    maxLength(25)
  )
});

/**
 * ### [Bulk Overwrite Guild Application Commands](https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands)
 *
 * **PUT** `/applications/:application/guilds/:guild/commands`
 *
 * Takes a list of application commands, overwriting the existing command list for this application for the targeted guild. Returns `200` and a list of {@link ApplicationCommand | application command objects}.
 *
 * > [!CAUTION]
 * >
 * > This will overwrite all types of application commands: slash commands, user commands, and message commands.
 */
export const bulkOverwriteGuildApplicationCommands: Fetcher<
  typeof bulkOverwriteGuildApplicationCommandsSchema,
  ApplicationCommand[]
> = async ({ application, guild, body }) =>
  put(`/applications/${application}/guilds/${guild}/commands`, body);

export const bulkOverwriteGuildApplicationCommandsSafe = toValidated(
  bulkOverwriteGuildApplicationCommands,
  bulkOverwriteGuildApplicationCommandsSchema,
  array(applicationCommandSchema)
);

export const bulkOverwriteGuildApplicationCommandsProcedure = toProcedure(
  `mutation`,
  bulkOverwriteGuildApplicationCommands,
  bulkOverwriteGuildApplicationCommandsSchema,
  array(applicationCommandSchema)
);
