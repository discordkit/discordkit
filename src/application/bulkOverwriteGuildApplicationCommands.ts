import { z } from "zod";
import { put, type Fetcher, toProcedure } from "#/utils/index.ts";
import {
  type ApplicationCommand,
  applicationCommandSchema
} from "./types/ApplicationCommand.ts";
import { localesSchema } from "./types/Locales.ts";
import { applicationCommandOptionSchema } from "./types/ApplicationCommandOption.ts";
import {
  ApplicationCommandType,
  applicationCommandTypeSchema
} from "./types/ApplicationCommandType.ts";

export const bulkOverwriteGuildApplicationCommandsSchema = z.object({
  application: z.string().min(1),
  guild: z.string().min(1),
  body: z
    .object({
      /** ID of the command, if known */
      id: z.string().min(1).nullable(),
      /** Name of command, 1-32 characters */
      name: z.string().min(1).max(32),
      /** Localization dictionary for the `name` field. Values follow the same restrictions as `name` */
      nameLocalizations: z
        .record(localesSchema, z.string().min(1).max(32))
        .nullable()
        .optional(),
      /** 1-100 character description */
      description: z.string().min(1).max(100),
      /** Localization dictionary for the `description` field. Values follow the same restrictions as `description` */
      descriptionLocalizations: z
        .record(localesSchema, z.string().min(1).max(100))
        .nullable()
        .optional(),
      /** Parameters for the command */
      options: applicationCommandOptionSchema.array().nullable(),
      /** Set of permissions represented as a bit set */
      defaultMemberPermissions: z.string().nullable().optional(),
      /** Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible. */
      dmPermission: z.boolean().nullable().optional(),
      /** Replaced by `defaultMemberPermissions` and will be deprecated in the future. Indicates whether the command is enabled by default when the app is added to a guild. Defaults to `true` */
      defaultPermission: z.boolean().default(true).nullable(),
      /** Type of command, defaults `1` if not set */
      type: applicationCommandTypeSchema
        .default(ApplicationCommandType.CHAT_INPUT)
        .nullable(),
      /** Indicates whether the command is age-restricted */
      nsfw: z.boolean().nullable()
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

export const bulkOverwriteGuildApplicationCommandsProcedure = toProcedure(
  `mutation`,
  bulkOverwriteGuildApplicationCommands,
  bulkOverwriteGuildApplicationCommandsSchema,
  applicationCommandSchema.array()
);
