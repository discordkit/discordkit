import * as v from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  asDigits
} from "@discordkit/core";
import {
  applicationCommandSchema,
  type ApplicationCommand
} from "../application-commands/types/ApplicationCommand.js";
import { applicationCommandOptionSchema } from "../application-commands/types/ApplicationCommandOption.js";
import {
  ApplicationCommandType,
  applicationCommandTypeSchema
} from "../application-commands/types/ApplicationCommandType.js";
import { localesSchema } from "./types/Locales.js";
import { permissionFlag } from "../permissions/Permissions.js";

export const createGlobalApplicationCommandSchema = v.object({
  application: snowflake,
  body: v.object({
    /** Name of command, 1-32 characters */
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(32)),
    /** Localization dictionary for the name field. Values follow the same restrictions as name */
    nameLocalizations: v.nullish(
      v.record(
        localesSchema,
        v.pipe(v.string(), v.minLength(1), v.maxLength(32))
      )
    ),
    /** 1-100 character description for CHAT_INPUT commands */
    description: v.nullish(
      v.pipe(v.string(), v.minLength(1), v.maxLength(100))
    ),
    /** Localization dictionary for the description field. Values follow the same restrictions as description */
    descriptionLocalizations: v.nullish(
      v.record(
        localesSchema,
        v.pipe(v.string(), v.minLength(1), v.maxLength(100))
      )
    ),
    /** the parameters for the command */
    options: v.nullish(v.array(applicationCommandOptionSchema)),
    /** Set of permissions represented as a bit set */
    defaultMemberPermissions: v.nullish(
      asDigits(permissionFlag) as v.GenericSchema<string>
    ),
    /** Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible. */
    dmPermission: v.nullish(v.boolean()),
    /** Replaced by defaultMemberPermissions and will be deprecated in the future. Indicates whether the command is enabled by default when the app is added to a guild. Defaults to true */
    defaultPermission: v.nullish(v.boolean(), true),
    /** Type of command, defaults 1 if not set */
    type: v.nullish(
      applicationCommandTypeSchema,
      ApplicationCommandType.CHAT_INPUT
    ),
    /** Indicates whether the command is age-restricted */
    nsfw: v.nullish(v.boolean())
  })
});

/**
 * ### [Create Global Application Command](https://discord.com/developers/docs/interactions/application-commands#create-global-application-command)
 *
 * **POST** `/applications/:application/commands`
 *
 * > [!CAUTION]
 * >
 * > Creating a command with the same name as an existing command for your application will overwrite the old command.
 *
 * Create a new global command. Returns `201` if a command with the same name does not already exist, or a `200` if it does (in which case the previous command will be overwritten). Both responses include an {@link ApplicationCommand | application command object}.
 */
export const createGlobalApplicationCommand: Fetcher<
  typeof createGlobalApplicationCommandSchema,
  ApplicationCommand
> = async ({ application, body }) =>
  post(`/applications/${application}/commands`, body);

export const createGlobalApplicationCommandSafe = toValidated(
  createGlobalApplicationCommand,
  createGlobalApplicationCommandSchema,
  applicationCommandSchema
);

export const createGlobalApplicationCommandProcedure = toProcedure(
  `mutation`,
  createGlobalApplicationCommand,
  createGlobalApplicationCommandSchema,
  applicationCommandSchema
);
