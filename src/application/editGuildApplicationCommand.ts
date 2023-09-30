import { z } from "zod";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated
} from "#/utils/index.ts";
import {
  applicationCommandSchema,
  type ApplicationCommand
} from "./types/ApplicationCommand.ts";
import { applicationCommandOptionSchema } from "./types/ApplicationCommandOption.ts";
import { localesSchema } from "./types/Locales.ts";

export const editGuildApplicationCommandSchema = z.object({
  application: z.string().min(1),
  guild: z.string().min(1),
  command: z.string().min(1),
  body: z
    .object({
      /** Name of command, 1-32 characters */
      name: z.string().min(1).max(32).nullable(),
      /** Localization dictionary for the name field. Values follow the same restrictions as name */
      nameLocalizations: z
        .record(localesSchema, z.string().min(1).max(32))
        .nullable()
        .optional(),
      /** 1-100 character description */
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
      /** Replaced by default_member_permissions and will be deprecated in the future. Indicates whether the command is enabled by default when the app is added to a guild. Defaults to true */
      defaultPermission: z.boolean().default(true).nullable(),
      /** Indicates whether the command is age-restricted */
      nsfw: z.boolean().nullable()
    })
    .partial()
});

/**
 * ### [Edit Guild Application Command](https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command)
 *
 * **PATCH* `/applications/:application/guilds/:guild/commands/:command`
 *
 * > **NOTE**
 * >
 * > All parameters for this endpoint are optional.
 *
 * Edit a guild command. Updates for guild commands will be available immediately. Returns `200` and an {@link ApplicationCommand | application command object}. All fields are optional, but any fields provided will entirely overwrite the existing values of those fields.
 */
export const editGuildApplicationCommand: Fetcher<
  typeof editGuildApplicationCommandSchema,
  ApplicationCommand
> = async ({ application, guild, command, body }) =>
  patch(
    `/applications/${application}/guilds/${guild}/commands/${command}`,
    body
  );

export const editGuildApplicationCommandSafe = toValidated(
  editGuildApplicationCommand,
  editGuildApplicationCommandSchema,
  applicationCommandSchema
);

export const editGuildApplicationCommandProcedure = toProcedure(
  `mutation`,
  editGuildApplicationCommand,
  editGuildApplicationCommandSchema,
  applicationCommandSchema
);
