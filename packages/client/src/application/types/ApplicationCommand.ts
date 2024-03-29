import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { localesSchema } from "./Locales.js";
import { applicationCommandOptionSchema } from "./ApplicationCommandOption.js";
import {
  ApplicationCommandType,
  applicationCommandTypeSchema
} from "./ApplicationCommandType.js";

export const applicationCommandSchema = z.object({
  /** Unique ID of command */
  id: snowflake,
  /** Type of command, defaults to 1 */
  type: applicationCommandTypeSchema
    .nullish()
    .default(ApplicationCommandType.CHAT_INPUT),
  /** ID of the parent application */
  applicationId: snowflake,
  /** Guild ID of the command, if not global */
  guildId: snowflake.nullish(),
  /** Name of command, 1-32 characters */
  name: z.string().min(1).max(32),
  /** Localization dictionary for name field. Values follow the same restrictions as name */
  nameLocalizations: z
    .record(localesSchema, z.string().min(1).max(32))
    .nullish(),
  /** Description for CHAT_INPUT commands, 1-100 characters. Empty string for USER and MESSAGE commands */
  description: z.string().min(0).max(100).default(``),
  /** Localization dictionary for description field. Values follow the same restrictions as description */
  descriptionLocalizations: z
    .record(localesSchema, z.string().min(1).max(100))
    .nullish(),
  /** Parameters for the command, max of 25 */
  options: applicationCommandOptionSchema.array().max(25).nullish(),
  /** Set of permissions represented as a bit set */
  defaultMemberPermissions: z.string().optional(),
  /** Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible. */
  dmPermission: z.boolean().nullish(),
  /** Not recommended for use as field will soon be deprecated. Indicates whether the command is enabled by default when the app is added to a guild, defaults to true */
  defaultPermission: z.boolean().nullish(),
  /** Indicates whether the command is age-restricted, defaults to false */
  nsfw: z.boolean().nullish(),
  /** Autoincrementing version identifier updated during substantial record changes */
  version: snowflake
});

export type ApplicationCommand = z.infer<typeof applicationCommandSchema>;
