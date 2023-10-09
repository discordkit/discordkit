import {
  minLength,
  object,
  length,
  union,
  literal,
  optional,
  boolean,
  integer,
  string,
  nullish,
  number,
  email,
  type Output
} from "valibot";
import { snowflake } from "@discordkit/core";
import { localesSchema } from "../../application/types/Locales.js";
import { premiumTypeSchema } from "./PremiumType.js";

// https://discord.com/developers/docs/resources/user#user-object-user-structure
export const userSchema = object({
  /** the user's id (scope: `identify`) */
  id: snowflake,
  /** the user's username, not unique across the platform (scope: `identify`) */
  username: string([minLength(1)]),
  /** the user's 4-digit discord-tag (scope: `identify`) */
  discriminator: union([string([length(4)]), literal(`0`)]),
  /** the user's display name, if it is set. For bots, this is the application name (scope: `identify`) */
  globalName: optional(string()),
  /** the user's avatar hash (scope: `identify`) */
  avatar: optional(string([minLength(1)])),
  /** whether the user belongs to an OAuth2 application (scope: `identify`) */
  bot: nullish(boolean()),
  /** whether the user is an Official Discord System user (part of the urgent message system) (scope: `identify`) */
  system: nullish(boolean()),
  /** whether the user has two factor enabled on their account (scope: `identify`) */
  mfaEnabled: nullish(boolean()),
  /** the user's banner hash (scope: `identify`) */
  banner: nullish(string([minLength(1)])),
  /** the user's banner color encoded as an integer representation of hexadecimal color code (scope: `identify`) */
  accentColor: nullish(number([integer()])),
  /** the user's chosen language option (scope: `identify`) */
  locale: nullish(localesSchema),
  /** whether the email on this account has been verified (scope: `email`) */
  verified: nullish(boolean()),
  /** the user's email (scope: `email`) */
  email: nullish(string([email()])),
  /** the flags on a user's account (scope: `identify`) */
  flags: nullish(number([integer()])),
  /** the type of Nitro subscription on a user's account (scope: `identify`) */
  premiumType: nullish(premiumTypeSchema),
  /** the public flags on a user's account (scope: `identify`) */
  publicFlags: nullish(number([integer()])),
  /** the user's avatar decoration hash	(scope: `identify`) */
  avatarDecoration: nullish(string())
});

export type User = Output<typeof userSchema>;
