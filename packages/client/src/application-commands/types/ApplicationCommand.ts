import * as v from "valibot";
import { asDigits, snowflake } from "@discordkit/core";
import { localesSchema } from "../../application/types/Locales.js";
import { applicationCommandOptionSchema } from "./ApplicationCommandOption.js";
import {
  ApplicationCommandType,
  applicationCommandTypeSchema
} from "./ApplicationCommandType.js";
import { permissionFlag } from "../../permissions/Permissions.js";

export const applicationCommandSchema = v.intersect([
  v.object({
    /** Unique ID of command */
    id: snowflake as v.GenericSchema<string>,
    /** ID of the parent application */
    applicationId: snowflake as v.GenericSchema<string>,
    /** Guild ID of the command, if not global */
    guildId: v.exactOptional<v.GenericSchema<string>>(snowflake),
    /** Name of command, 1-32 characters */
    name: v.pipe(
      v.string(),
      v.minLength(1),
      v.maxLength(32)
    ) as v.GenericSchema<string>,
    /** Localization dictionary for name field. Values follow the same restrictions as name */
    nameLocalizations: v.nullish(
      v.record(
        localesSchema,
        v.pipe(
          v.string(),
          v.minLength(1),
          v.maxLength(32)
        ) as v.GenericSchema<string>
      )
    ),
    /** Description for CHAT_INPUT commands, 1-100 characters. Empty string for USER and MESSAGE commands */
    description: v.exactOptional<v.GenericSchema<string>>(
      v.pipe(v.string(), v.minLength(0), v.maxLength(100))
    ),
    /** Localization dictionary for description field. Values follow the same restrictions as description */
    descriptionLocalizations: v.nullish(
      v.record(
        localesSchema,
        v.pipe(
          v.string(),
          v.minLength(0),
          v.maxLength(100)
        ) as v.GenericSchema<string>
      )
    ),
    /** Set of permissions represented as a bit set */
    defaultMemberPermissions: v.nullable(
      asDigits(permissionFlag) as v.GenericSchema<string>
    ),
    /** Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible. */
    dmPermission: v.exactOptional(v.boolean()),
    /** Not recommended for use as field will soon be deprecated. Indicates whether the command is enabled by default when the app is added to a guild, defaults to true */
    defaultPermission: v.exactOptional(v.boolean()),
    /** Indicates whether the command is age-restricted, defaults to false */
    nsfw: v.exactOptional(v.boolean()),
    // TODO: integrationTypes
    // TODO: contexts
    /** Autoincrementing version identifier updated during substantial record changes */
    version: snowflake as v.GenericSchema<string>
  }),
  v.union([
    // Common variants
    v.object({
      /** Type of command, defaults to 1 */
      type: v.exactOptional(applicationCommandTypeSchema)
    }),
    v.variant(`type`, [
      // Properties unique to CHAT_INPUT
      v.object({
        type: v.literal(ApplicationCommandType.CHAT_INPUT),
        /** Parameters for the command, max of 25 */
        options: v.exactOptional(
          v.pipe(v.array(applicationCommandOptionSchema), v.maxLength(25))
        )
      }),
      // Properties unique to PRIMARY_ENTRY_POINT
      v.object({
        type: v.literal(ApplicationCommandType.PRIMARY_ENTRY_POINT)
        // TODO: handler
      })
    ])
  ])
]);

export type ApplicationCommand = v.InferOutput<typeof applicationCommandSchema>;
