import { z } from "zod";
import { post, type Fetcher, toProcedure } from "../utils";
import {
  applicationCommandSchema,
  type ApplicationCommand
} from "./types/ApplicationCommand";
import { applicationCommandOptionSchema } from "./types/ApplicationCommandOption";
import {
  ApplicationCommandType,
  applicationCommandTypeSchema
} from "./types/ApplicationCommandType";
import { localesSchema } from "./types/Locales";

export const createGuildApplicationCommandSchema = z.object({
  application: z.string().min(1),
  guild: z.string().min(1),
  body: z.object({
    /** Name of command, 1-32 characters */
    name: z.string().min(1).max(32),
    /** Localization dictionary for the name field. Values follow the same restrictions as name */
    nameLocalizations: z
      .record(localesSchema, z.string().min(1).max(32))
      .nullable()
      .optional(),
    /** 1-100 character description for CHAT_INPUT commands */
    description: z.string().min(1).max(100).nullable(),
    /** Localization dictionary for the description field. Values follow the same restrictions as description */
    descriptionLocalizations: z
      .record(localesSchema, z.string().min(1).max(100))
      .nullable()
      .optional(),
    /** the parameters for the command */
    options: applicationCommandOptionSchema.array().nullable(),
    /** Set of permissions represented as a bit set */
    defaultMemberPermissions: z.string().nullable().optional(),
    /** Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible. */
    dmPermission: z.boolean().nullable().optional(),
    /** Replaced by defaultMemberPermissions and will be deprecated in the future. Indicates whether the command is enabled by default when the app is added to a guild. Defaults to true */
    defaultPermission: z.boolean().default(true).nullable(),
    /** Type of command, defaults 1 if not set */
    type: applicationCommandTypeSchema
      .default(ApplicationCommandType.CHAT_INPUT)
      .nullable(),
    /** Indicates whether the command is age-restricted */
    nsfw: z.boolean().nullable()
  })
});

/**
 * ### [Create Guild Application Command](https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command)
 *
 * **POST** `/applications/:application/guilds/:guild/commands`
 *
 * > **DANGER**
 * >
 * > Creating a command with the same name as an existing command for your application will overwrite the old command.
 *
 * Create a new guild command. New guild commands will be available in the guild immediately. Returns `201` if a command with the same name does not already exist, or a `200` if it does (in which case the previous command will be overwritten). Both responses include an {@link ApplicationCommand | application command object}.
 */
export const createGuildApplicationCommand: Fetcher<
  typeof createGuildApplicationCommandSchema,
  ApplicationCommand
> = async ({ application, guild, body }) =>
  post(`/applications/${application}/guilds/${guild}/commands`, body);

export const createGuildApplicationCommandProcedure = toProcedure(
  `mutation`,
  createGuildApplicationCommand,
  createGuildApplicationCommandSchema,
  applicationCommandSchema
);
