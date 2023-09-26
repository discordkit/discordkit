import { z } from "zod";
import { localesSchema } from "./Locales";
import { applicationCommandOptionSchema } from "./ApplicationCommandOption";
import {
  ApplicationCommandType,
  applicationCommandTypeSchema
} from "./ApplicationCommandType";

export const applicationCommandSchema = z.object({
  /** Unique ID of command */
  id: z.string().min(1),
  /** Type of command, defaults to 1 */
  type: applicationCommandTypeSchema
    .nullable()
    .default(ApplicationCommandType.CHAT_INPUT),
  /** ID of the parent application */
  applicationId: z.string().min(1),
  /** Guild ID of the command, if not global */
  guildId: z.string().min(1).nullable(),
  /** Name of command, 1-32 characters */
  name: z.string().min(1).max(32),
  /** Localization dictionary for name field. Values follow the same restrictions as name */
  nameLocalizations: z
    .record(localesSchema, z.string().min(1).max(32))
    .nullable()
    .optional(),
  /** Description for CHAT_INPUT commands, 1-100 characters. Empty string for USER and MESSAGE commands */
  description: z.string().min(0).max(100).default(``),
  /** Localization dictionary for description field. Values follow the same restrictions as description */
  descriptionLocalizations: z
    .record(localesSchema, z.string().min(1).max(100))
    .nullable()
    .optional(),
  /** Parameters for the command, max of 25 */
  options: applicationCommandOptionSchema.array().max(25).nullable(),
  /** Set of permissions represented as a bit set */
  defaultMemberPermissions: z.string().optional(),
  /** Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible. */
  dmPermission: z.boolean().nullable(),
  /** Not recommended for use as field will soon be deprecated. Indicates whether the command is enabled by default when the app is added to a guild, defaults to true */
  defaultPermission: z.boolean().nullable().optional(),
  /** Indicates whether the command is age-restricted, defaults to false */
  nsfw: z.boolean().nullable(),
  /** Autoincrementing version identifier updated during substantial record changes */
  version: z.string().min(1)
});

export type ApplicationCommand = z.infer<typeof applicationCommandSchema>;
