import {
  minLength,
  object,
  length,
  union,
  literal,
  exactOptional,
  boolean,
  integer,
  string,
  nullish,
  number,
  email,
  type InferOutput,
  pipe,
  nullable,
  type GenericSchema
} from "valibot";
import { asInteger, snowflake } from "@discordkit/core";
import { localesSchema } from "../../application/types/Locales.js";
import { premiumTypeSchema } from "./PremiumType.js";
import { userFlag } from "./UserFlags.js";

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
  bot: exactOptional(boolean()),
  /** whether the user is an Official Discord System user (part of the urgent message system) (scope: `identify`) */
  system: exactOptional(boolean()),
  /** whether the user has two factor enabled on their account (scope: `identify`) */
  mfaEnabled: exactOptional(boolean()),
  /** the user's banner hash (scope: `identify`) */
  banner: nullish(pipe(string(), minLength(1))),
  /** the user's banner color encoded as an integer representation of hexadecimal color code (scope: `identify`) */
  accentColor: nullish(pipe(number(), integer())),
  /** the user's chosen language option (scope: `identify`) */
  locale: exactOptional(localesSchema),
  /** whether the email on this account has been verified (scope: `email`) */
  verified: exactOptional(boolean()),
  /** the user's email (scope: `email`) */
  email: nullish(pipe(string(), email())),
  /** the flags on a user's account (scope: `identify`) */
  flags: exactOptional(asInteger(userFlag) as GenericSchema<number>),
  /** the type of Nitro subscription on a user's account (scope: `identify`) */
  premiumType: exactOptional(premiumTypeSchema),
  /** the public flags on a user's account (scope: `identify`) */
  publicFlags: exactOptional(asInteger(userFlag) as GenericSchema<number>),
  /** the user's avatar decoration hash	(scope: `identify`) */
  avatarDecoration: nullish(string())
});

export type User = InferOutput<typeof userSchema>;
