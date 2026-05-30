import * as v from "valibot";
import {
  asDigits,
  snowflake,
  boundedArray,
  boundedString
} from "@discordkit/core";
import type { Locales } from "../../application/types/Locales.js";
import { localesSchema } from "../../application/types/Locales.js";
import { applicationCommandOptionSchema } from "./ApplicationCommandOption.js";
import {
  ApplicationCommandType,
  applicationCommandTypeSchema
} from "./ApplicationCommandType.js";
import { permissionFlag } from "../../permissions/Permissions.js";
import { applicationIntegrationTypesSchema } from "../../application/types/ApplicationIntegrationTypes.js";
import { interactionContextSchema } from "../../interactions/types/InteractionContextType.js";
import { entryPointCommandHandlerTypeSchema } from "./EntryPointCommandHandlerType.js";

/**
 * ### [Application Command](https://discord.com/developers/docs/interactions/application-commands#application-command-object)
 */
export const applicationCommandSchema = v.intersect([
  v.object({
    /** Unique ID of command */
    id: snowflake,
    /** ID of the parent application */
    applicationId: snowflake,
    /** Guild ID of the command, if not global */
    guildId: v.exactOptional(snowflake),
    /** Name of command, 1-32 characters */
    name: boundedString({ max: 32 }),
    /** Localization dictionary for name field. Values follow the same restrictions as name */
    nameLocalizations: v.nullish(
      v.record(localesSchema, boundedString({ max: 32 })) as v.GenericSchema<
        Record<Locales, string>
      >
    ),
    /** Description for CHAT_INPUT commands, 1-100 characters. Empty string for USER and MESSAGE commands */
    description: v.exactOptional(boundedString({ min: 0, max: 100 })),
    /** Localization dictionary for description field. Values follow the same restrictions as description */
    descriptionLocalizations: v.nullish(
      v.record(localesSchema, boundedString({ min: 0, max: 100 }))
    ),
    /** Set of permissions represented as a bit set */
    defaultMemberPermissions: v.nullable(asDigits(permissionFlag)),
    /**
     * Indicates whether the command is available in DMs with the app, only
     * for globally-scoped commands. By default, commands are visible.
     *
     * @deprecated Discord recommends `contexts` instead.
     */
    dmPermission: v.exactOptional(v.boolean()),
    /** @deprecated Indicates whether the command is enabled by default when the app is added to a guild, defaults to true. Not recommended for use; field will be removed in a future release. */
    defaultPermission: v.exactOptional(v.boolean()),
    /** Indicates whether the command is age-restricted, defaults to false */
    nsfw: v.exactOptional(v.boolean()),
    /** Installation context(s) where the command is available */
    integrationTypes: v.exactOptional(
      v.array(applicationIntegrationTypesSchema)
    ),
    /** Interaction context(s) where the command can be used */
    contexts: v.nullish(v.array(interactionContextSchema)),
    /** Autoincrementing version identifier updated during substantial record changes */
    version: snowflake
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
          boundedArray(applicationCommandOptionSchema, { max: 25 })
        )
      }),
      // Properties unique to PRIMARY_ENTRY_POINT
      v.object({
        type: v.literal(ApplicationCommandType.PRIMARY_ENTRY_POINT),
        /**
         * Determines whether the interaction is handled by the app's
         * interactions handler or by Discord. Can only be set for
         * `PRIMARY_ENTRY_POINT` commands belonging to applications with
         * the `EMBEDDED` flag (i.e. apps with an Activity).
         */
        handler: v.exactOptional(entryPointCommandHandlerTypeSchema)
      })
    ])
  ])
]);

export type ApplicationCommand = v.InferOutput<typeof applicationCommandSchema>;
