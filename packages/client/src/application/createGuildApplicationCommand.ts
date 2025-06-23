import {
  array,
  boolean,
  maxLength,
  minLength,
  nullish,
  object,
  pipe,
  record,
  string
} from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  applicationCommandSchema,
  type ApplicationCommand
} from "./types/ApplicationCommand.js";
import { applicationCommandOptionSchema } from "./types/ApplicationCommandOption.js";
import {
  ApplicationCommandType,
  applicationCommandTypeSchema
} from "./types/ApplicationCommandType.js";
import { localesSchema } from "./types/Locales.js";

export const createGuildApplicationCommandSchema = object({
  application: snowflake,
  guild: snowflake,
  body: object({
    /** Name of command, 1-32 characters */
    name: pipe(string(), minLength(1), maxLength(32)),
    /** Localization dictionary for the name field. Values follow the same restrictions as name */
    nameLocalizations: nullish(
      record(localesSchema, pipe(string(), minLength(1), maxLength(32)))
    ),
    /** 1-100 character description for CHAT_INPUT commands */
    description: nullish(pipe(string(), minLength(1), maxLength(100))),
    /** Localization dictionary for the description field. Values follow the same restrictions as description */
    descriptionLocalizations: nullish(
      record(localesSchema, pipe(string(), minLength(1), maxLength(100)))
    ),
    /** the parameters for the command */
    options: nullish(array(applicationCommandOptionSchema)),
    /** Set of permissions represented as a bit set */
    defaultMemberPermissions: nullish(string()),
    /** Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible. */
    dmPermission: nullish(boolean()),
    /** Replaced by defaultMemberPermissions and will be deprecated in the future. Indicates whether the command is enabled by default when the app is added to a guild. Defaults to true */
    defaultPermission: nullish(boolean(), true),
    /** Type of command, defaults 1 if not set */
    type: nullish(
      applicationCommandTypeSchema,
      ApplicationCommandType.CHAT_INPUT
    ),
    /** Indicates whether the command is age-restricted */
    nsfw: nullish(boolean())
  })
});

/**
 * ### [Create Guild Application Command](https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command)
 *
 * **POST** `/applications/:application/guilds/:guild/commands`
 *
 * > [!CAUTION]
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

export const createGuildApplicationCommandSafe = toValidated(
  createGuildApplicationCommand,
  createGuildApplicationCommandSchema,
  applicationCommandSchema
);

export const createGuildApplicationCommandProcedure = toProcedure(
  `mutation`,
  createGuildApplicationCommand,
  createGuildApplicationCommandSchema,
  applicationCommandSchema
);
