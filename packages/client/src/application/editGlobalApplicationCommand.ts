import { z } from "zod";
import {
  patch,
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
import { localesSchema } from "./types/Locales.js";

export const editGlobalApplicationCommandSchema = z.object({
  application: snowflake,
  command: snowflake,
  body: z
    .object({
      /** Name of command, 1-32 characters */
      name: z.string().min(1).max(32).nullish(),
      /** Localization dictionary for the name field. Values follow the same restrictions as name */
      nameLocalizations: z
        .record(localesSchema, z.string().min(1).max(32))
        .nullish(),
      /** 1-100 character description */
      description: z.string().min(1).max(100).nullish(),
      /** Localization dictionary for the description field. Values follow the same restrictions as description */
      descriptionLocalizations: z
        .record(localesSchema, z.string().min(1).max(100))
        .nullish(),
      /** the parameters for the command */
      options: applicationCommandOptionSchema.array().nullish(),
      /** Set of permissions represented as a bit set */
      defaultMemberPermissions: z.string().nullish(),
      /** Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible. */
      dmPermission: z.boolean().nullish(),
      /** Replaced by default_member_permissions and will be deprecated in the future. Indicates whether the command is enabled by default when the app is added to a guild. Defaults to true */
      defaultPermission: z.boolean().default(true).nullish(),
      /** Indicates whether the command is age-restricted */
      nsfw: z.boolean().nullish()
    })
    .partial()
});

/**
 * ### [Edit Global Application Command](https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command)
 *
 * **PATCH* `/applications/:application/commands/:command`
 *
 * > **NOTE**
 * >
 * > All parameters for this endpoint are optional.
 *
 * Edit a global command. Returns `200` and an {@link ApplicationCommand | application command object}. All fields are optional, but any fields provided will entirely overwrite the existing values of those fields.
 */
export const editGlobalApplicationCommand: Fetcher<
  typeof editGlobalApplicationCommandSchema,
  ApplicationCommand
> = async ({ application, command, body }) =>
  patch(`/applications/${application}/commands/${command}`, body);

export const editGlobalApplicationCommandSafe = toValidated(
  editGlobalApplicationCommand,
  editGlobalApplicationCommandSchema,
  applicationCommandSchema
);

export const editGlobalApplicationCommandProcedure = toProcedure(
  `mutation`,
  editGlobalApplicationCommand,
  editGlobalApplicationCommandSchema,
  applicationCommandSchema
);
