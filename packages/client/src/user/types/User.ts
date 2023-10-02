import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { localesSchema } from "../../application/types/Locales.ts";
import { userFlagsSchema } from "./UserFlags.ts";
import { premiumTypeSchema } from "./PremiumType.ts";

// https://discord.com/developers/docs/resources/user#user-object-user-structure
export const userSchema = z.object({
  /** the user's id (scope: `identify`) */
  id: snowflake,
  /** the user's username, not unique across the platform (scope: `identify`) */
  username: z.string().min(1),
  /** the user's 4-digit discord-tag (scope: `identify`) */
  discriminator: z.string().length(4),
  /** the user's display name, if it is set. For bots, this is the application name (scope: `identify`) */
  globalName: z.string().optional(),
  /** the user's avatar hash (scope: `identify`) */
  avatar: z.string().min(1).optional(),
  /** whether the user belongs to an OAuth2 application (scope: `identify`) */
  bot: z.boolean().nullable(),
  /** whether the user is an Official Discord System user (part of the urgent message system) (scope: `identify`) */
  system: z.boolean().nullable(),
  /** whether the user has two factor enabled on their account (scope: `identify`) */
  mfaEnabled: z.boolean().nullable(),
  /** the user's banner hash (scope: `identify`) */
  banner: z.string().min(1).nullable().optional(),
  /** the user's banner color encoded as an integer representation of hexadecimal color code (scope: `identify`) */
  accentColor: z.number().int().nullable().optional(),
  /** the user's chosen language option (scope: `identify`) */
  locale: localesSchema.nullable(),
  /** whether the email on this account has been verified (scope: `email`) */
  verified: z.boolean().nullable(),
  /** the user's email (scope: `email`) */
  email: z.string().email().nullable().optional(),
  /** the flags on a user's account (scope: `identify`) */
  flags: userFlagsSchema.nullable(),
  /** the type of Nitro subscription on a user's account (scope: `identify`) */
  premiumType: premiumTypeSchema.nullable(),
  /** the public flags on a user's account (scope: `identify`) */
  publicFlags: userFlagsSchema.nullable(),
  /** the user's avatar decoration hash	(scope: `identify`) */
  avatarDecoration: z.string().nullable().optional()
});

export type User = z.infer<typeof userSchema>;
