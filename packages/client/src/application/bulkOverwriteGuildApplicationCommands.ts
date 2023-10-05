import { z } from "zod";
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
import { localesSchema } from "./types/Locales.js";
import { applicationCommandOptionSchema } from "./types/ApplicationCommandOption.js";
import {
  ApplicationCommandType,
  applicationCommandTypeSchema
} from "./types/ApplicationCommandType.js";

export const bulkOverwriteGuildApplicationCommandsSchema = z.object({
  application: snowflake,
  guild: snowflake,
  body: z
    .object({
      /** ID of the command, if known */
      id: snowflake.nullish(),
      /** Name of command, 1-32 characters */
      name: z.string().min(1).max(32),
      /** Localization dictionary for the `name` field. Values follow the same restrictions as `name` */
      nameLocalizations: z
        .record(localesSchema, z.string().min(1).max(32))
        .nullish(),
      /** 1-100 character description */
      description: z.string().min(1).max(100),
      /** Localization dictionary for the `description` field. Values follow the same restrictions as `description` */
      descriptionLocalizations: z
        .record(localesSchema, z.string().min(1).max(100))
        .nullish(),
      /** Parameters for the command */
      options: applicationCommandOptionSchema.array().nullish(),
      /** Set of permissions represented as a bit set */
      defaultMemberPermissions: z.string().nullish(),
      /** Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible. */
      dmPermission: z.boolean().nullish(),
      /** Replaced by `defaultMemberPermissions` and will be deprecated in the future. Indicates whether the command is enabled by default when the app is added to a guild. Defaults to `true` */
      defaultPermission: z.boolean().default(true).nullish(),
      /** Type of command, defaults `1` if not set */
      type: applicationCommandTypeSchema
        .default(ApplicationCommandType.CHAT_INPUT)
        .nullish(),
      /** Indicates whether the command is age-restricted */
      nsfw: z.boolean().nullish()
    })
    .array()
    .max(25)
});

/**
 * ### [Bulk Overwrite Guild Application Commands](https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands)
 *
 * **PUT** `/applications/:application/guilds/:guild/commands`
 *
 * Takes a list of application commands, overwriting the existing command list for this application for the targeted guild. Returns `200` and a list of {@link ApplicationCommand | application command objects}.
 *
 * > **DANGER**
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
  applicationCommandSchema.array()
);

export const bulkOverwriteGuildApplicationCommandsProcedure = toProcedure(
  `mutation`,
  bulkOverwriteGuildApplicationCommands,
  bulkOverwriteGuildApplicationCommandsSchema,
  applicationCommandSchema.array()
);
