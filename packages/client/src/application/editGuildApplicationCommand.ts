import * as v from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  asDigits,
  boundedString
} from "@discordkit/core";
import {
  applicationCommandSchema,
  type ApplicationCommand
} from "../application-commands/types/ApplicationCommand.js";
import { applicationCommandOptionSchema } from "../application-commands/types/ApplicationCommandOption.js";
import { localesSchema } from "./types/Locales.js";
import { permissionFlag } from "../permissions/Permissions.js";

export const editGuildApplicationCommandSchema = v.object({
  application: snowflake,
  guild: snowflake,
  command: snowflake,
  body: v.partial(
    v.object({
      /** Name of command, 1-32 characters */
      name: v.nullish(boundedString({ max: 32 })),
      /** Localization dictionary for the name field. Values follow the same restrictions as name */
      nameLocalizations: v.nullish(
        v.record(localesSchema, boundedString({ max: 32 }))
      ),
      /** 1-100 character description */
      description: v.nullish(boundedString({ max: 100 })),
      /** Localization dictionary for the description field. Values follow the same restrictions as description */
      descriptionLocalizations: v.nullish(
        v.record(localesSchema, boundedString({ max: 100 }))
      ),
      /** the parameters for the command */
      options: v.nullish(v.array(applicationCommandOptionSchema)),
      /** Set of permissions represented as a bit set */
      defaultMemberPermissions: v.nullish(asDigits(permissionFlag)),
      /** Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible. */
      dmPermission: v.nullish(v.boolean()),
      /** Replaced by default_member_permissions and will be deprecated in the future. Indicates whether the command is enabled by default when the app is added to a guild. Defaults to true */
      defaultPermission: v.nullish(v.boolean()),
      /** Indicates whether the command is age-restricted */
      nsfw: v.nullish(v.boolean())
    })
  )
});

/**
 * ### [Edit Guild Application Command](https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command)
 *
 * **PATCH* `/applications/:application/guilds/:guild/commands/:command`
 *
 * > [!NOTE]
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
