import * as v from "valibot";
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

export const bulkOverwriteGuildApplicationCommandsSchema = v.object({
  application: snowflake,
  guild: snowflake,
  body: v.pipe(
    v.array(
      v.object({
        /** ID of the command, if known */
        id: v.nullish(snowflake),
        /** Name of command, 1-32 characters */
        name: v.pipe(v.string(), v.minLength(1), v.maxLength(32)),
        /** Localization dictionary for the `name` field. Values follow the same restrictions as `name` */
        nameLocalizations: v.nullish(
          v.record(
            localesSchema,
            v.pipe(v.string(), v.minLength(1), v.maxLength(32))
          )
        ),
        /** 1-100 character description */
        description: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
        /** Localization dictionary for the `description` field. Values follow the same restrictions as `description` */
        descriptionLocalizations: v.nullish(
          v.record(
            localesSchema,
            v.pipe(v.string(), v.minLength(1), v.maxLength(100))
          )
        ),
        /** Parameters for the command */
        options: v.nullish(v.array(applicationCommandOptionSchema)),
        /** Set of permissions represented as a bit set */
        defaultMemberPermissions: v.nullish(
          asDigits(permissionFlag) as v.GenericSchema<string>
        ),
        /** Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible. */
        dmPermission: v.nullish(v.boolean()),
        /** Replaced by `defaultMemberPermissions` and will be deprecated in the future. Indicates whether the command is enabled by default when the app is added to a guild. Defaults to `true` */
        defaultPermission: v.nullish(v.boolean(), true),
        /** Type of command, defaults `1` if not set */
        type: v.nullish(
          applicationCommandTypeSchema,
          ApplicationCommandType.CHAT_INPUT
        ),
        /** Indicates whether the command is age-restricted */
        nsfw: v.nullish(v.boolean())
      })
    ),
    v.maxLength(25)
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
  v.array(applicationCommandSchema)
);

export const bulkOverwriteGuildApplicationCommandsProcedure = toProcedure(
  `mutation`,
  bulkOverwriteGuildApplicationCommands,
  bulkOverwriteGuildApplicationCommandsSchema,
  v.array(applicationCommandSchema)
);
