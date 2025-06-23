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
  type InferOutput,
  pipe,
  nullable
} from "valibot";
import { snowflake } from "@discordkit/core";
import { localesSchema } from "../../application/types/Locales.js";
import { premiumTypeSchema } from "./PremiumType.js";

// https://discord.com/developers/docs/resources/user#user-object-user-structure
export const userSchema = object({
  /** the user's id (scope: `identify`) */
  id: snowflake,
  /** the user's username, not unique across the platform (scope: `identify`) */
  username: pipe(string(), minLength(1)),
  /** the user's 4-digit discord-tag (scope: `identify`) */
  discriminator: union([pipe(string(), length(4)), literal(`0`)]),
  /** the user's display name, if it is set. For bots, this is the application name (scope: `identify`) */
  globalName: nullable(string()),
  /** the user's avatar hash (scope: `identify`) */
  avatar: nullable(pipe(string(), minLength(1))),
  /** whether the user belongs to an OAuth2 application (scope: `identify`) */
  bot: optional(boolean()),
  /** whether the user is an Official Discord System user (part of the urgent message system) (scope: `identify`) */
  system: optional(boolean()),
  /** whether the user has two factor enabled on their account (scope: `identify`) */
  mfaEnabled: optional(boolean()),
  /** the user's banner hash (scope: `identify`) */
  banner: nullish(pipe(string(), minLength(1))),
  /** the user's banner color encoded as an integer representation of hexadecimal color code (scope: `identify`) */
  accentColor: nullish(pipe(number(), integer())),
  /** the user's chosen language option (scope: `identify`) */
  locale: optional(localesSchema),
  /** whether the email on this account has been verified (scope: `email`) */
  verified: optional(boolean()),
  /** the user's email (scope: `email`) */
  email: nullish(pipe(string(), email())),
  /** the flags on a user's account (scope: `identify`) */
  flags: optional(pipe(number(), integer())),
  /** the type of Nitro subscription on a user's account (scope: `identify`) */
  premiumType: optional(premiumTypeSchema),
  /** the public flags on a user's account (scope: `identify`) */
  publicFlags: optional(pipe(number(), integer())),
  /** the user's avatar decoration hash	(scope: `identify`) */
  avatarDecoration: nullish(string())
});

export type User = InferOutput<typeof userSchema>;
