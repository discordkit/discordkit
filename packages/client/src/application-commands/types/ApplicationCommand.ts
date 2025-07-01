import {
  object,
  nullish,
  minLength,
  maxLength,
  string,
  record,
  boolean,
  array,
  type InferOutput,
  pipe,
  nullable,
  intersect,
  literal,
  variant,
  union,
  exactOptional,
  type GenericSchema
} from "valibot";
import { asDigits, snowflake } from "@discordkit/core";
import { localesSchema } from "../../application/types/Locales.js";
import { applicationCommandOptionSchema } from "./ApplicationCommandOption.js";
import {
  ApplicationCommandType,
  applicationCommandTypeSchema
} from "./ApplicationCommandType.js";
import { permissionFlag } from "../../permissions/Permissions.js";

export const applicationCommandSchema = intersect([
  object({
    /** Unique ID of command */
    id: snowflake as GenericSchema<string>,
    /** ID of the parent application */
    applicationId: snowflake as GenericSchema<string>,
    /** Guild ID of the command, if not global */
    guildId: exactOptional<GenericSchema<string>>(snowflake),
    /** Name of command, 1-32 characters */
    name: pipe(string(), minLength(1), maxLength(32)) as GenericSchema<string>,
    /** Localization dictionary for name field. Values follow the same restrictions as name */
    nameLocalizations: nullish(
      record(
        localesSchema,
        pipe(string(), minLength(1), maxLength(32)) as GenericSchema<string>
      )
    ),
    /** Description for CHAT_INPUT commands, 1-100 characters. Empty string for USER and MESSAGE commands */
    description: exactOptional<GenericSchema<string>>(
      pipe(string(), minLength(0), maxLength(100))
    ),
    /** Localization dictionary for description field. Values follow the same restrictions as description */
    descriptionLocalizations: nullish(
      record(
        localesSchema,
        pipe(string(), minLength(0), maxLength(100)) as GenericSchema<string>
      )
    ),
    /** Set of permissions represented as a bit set */
    defaultMemberPermissions: nullable(
      asDigits(permissionFlag) as GenericSchema<string>
    ),
    /** Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible. */
    dmPermission: exactOptional(boolean()),
    /** Not recommended for use as field will soon be deprecated. Indicates whether the command is enabled by default when the app is added to a guild, defaults to true */
    defaultPermission: exactOptional(boolean()),
    /** Indicates whether the command is age-restricted, defaults to false */
    nsfw: exactOptional(boolean()),
    // TODO: integrationTypes
    // TODO: contexts
    /** Autoincrementing version identifier updated during substantial record changes */
    version: snowflake as GenericSchema<string>
  }),
  union([
    // Common variants
    object({
      /** Type of command, defaults to 1 */
      type: exactOptional(applicationCommandTypeSchema)
    }),
    variant(`type`, [
      // Properties unique to CHAT_INPUT
      object({
        type: literal(ApplicationCommandType.CHAT_INPUT),
        /** Parameters for the command, max of 25 */
        options: exactOptional(
          pipe(array(applicationCommandOptionSchema), maxLength(25))
        )
      }),
      // Properties unique to PRIMARY_ENTRY_POINT
      object({
        type: literal(ApplicationCommandType.PRIMARY_ENTRY_POINT)
        // TODO: handler
      })
    ])
  ])
]);

export type ApplicationCommand = InferOutput<typeof applicationCommandSchema>;
