import {
  object,
  nullish,
  minLength,
  maxLength,
  string,
  record,
  optional,
  boolean,
  array,
  type Output
} from "valibot";
import { snowflake } from "@discordkit/core";
import { localesSchema } from "./Locales.js";
import { applicationCommandOptionSchema } from "./ApplicationCommandOption.js";
import {
  ApplicationCommandType,
  applicationCommandTypeSchema
} from "./ApplicationCommandType.js";

export const applicationCommandSchema = object({
  /** Unique ID of command */
  id: snowflake,
  /** Type of command, defaults to 1 */
  type: nullish(
    applicationCommandTypeSchema,
    ApplicationCommandType.CHAT_INPUT
  ),
  /** ID of the parent application */
  applicationId: snowflake,
  /** Guild ID of the command, if not global */
  guildId: nullish(snowflake),
  /** Name of command, 1-32 characters */
  name: string([minLength(1), maxLength(32)]),
  /** Localization dictionary for name field. Values follow the same restrictions as name */
  nameLocalizations: nullish(
    record(localesSchema, string([minLength(1), maxLength(32)]))
  ),
  /** Description for CHAT_INPUT commands, 1-100 characters. Empty string for USER and MESSAGE commands */
  description: optional(string([minLength(0), maxLength(100)]), ``),
  /** Localization dictionary for description field. Values follow the same restrictions as description */
  descriptionLocalizations: nullish(
    record(localesSchema, string([minLength(0), maxLength(100)]))
  ),
  /** Parameters for the command, max of 25 */
  options: nullish(array(applicationCommandOptionSchema, [maxLength(25)])),
  /** Set of permissions represented as a bit set */
  defaultMemberPermissions: optional(string()),
  /** Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible. */
  dmPermission: nullish(boolean()),
  /** Not recommended for use as field will soon be deprecated. Indicates whether the command is enabled by default when the app is added to a guild, defaults to true */
  defaultPermission: nullish(boolean()),
  /** Indicates whether the command is age-restricted, defaults to false */
  nsfw: nullish(boolean()),
  /** Autoincrementing version identifier updated during substantial record changes */
  version: snowflake
});

export type ApplicationCommand = Output<typeof applicationCommandSchema>;
