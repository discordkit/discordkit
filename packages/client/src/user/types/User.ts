import * as v from "valibot";
import {
  asInteger,
  snowflake,
  boundedInteger,
  boundedString
} from "@discordkit/core";
import type { Locales } from "../../application/types/Locales.js";
import { localesSchema } from "../../application/types/Locales.js";
import { premiumTypeSchema } from "./PremiumType.js";
import { userFlag } from "./UserFlags.js";

// https://discord.com/developers/docs/resources/user#user-object-user-structure
export const userSchema = v.object({
  /** the user's id (scope: `identify`) */
  id: snowflake,
  /** the user's username, not unique across the platform (scope: `identify`) */
  username: boundedString(),
  /** the user's 4-digit discord-tag (scope: `identify`) */
  discriminator: v.union([boundedString(4), v.literal(`0`)]),
  /** the user's display name, if it is set. For bots, this is the application name (scope: `identify`) */
  globalName: v.nullable(boundedString()),
  /** the user's avatar hash (scope: `identify`) */
  avatar: v.nullable(boundedString()),
  /** whether the user belongs to an OAuth2 application (scope: `identify`) */
  bot: v.exactOptional(v.boolean()),
  /** whether the user is an Official Discord System user (part of the urgent message system) (scope: `identify`) */
  system: v.exactOptional(v.boolean()),
  /** whether the user has two factor enabled on their account (scope: `identify`) */
  mfaEnabled: v.exactOptional(v.boolean()),
  /** the user's banner hash (scope: `identify`) */
  banner: v.nullish(boundedString()),
  /** the user's banner color encoded as an integer representation of hexadecimal color code (scope: `identify`) */
  accentColor: v.nullish(boundedInteger()),
  /** the user's chosen language option (scope: `identify`) */
  locale: v.exactOptional<v.GenericSchema<Locales>>(localesSchema),
  /** whether the email on this account has been verified (scope: `email`) */
  verified: v.exactOptional(v.boolean()),
  /** the user's email (scope: `email`) */
  email: v.nullish<v.GenericSchema<string>>(v.pipe(v.string(), v.email())),
  /** the flags on a user's account (scope: `identify`) */
  flags: v.exactOptional(asInteger(userFlag)),
  /** the type of Nitro subscription on a user's account (scope: `identify`) */
  premiumType: v.exactOptional(premiumTypeSchema),
  /** the public flags on a user's account (scope: `identify`) */
  publicFlags: v.exactOptional(asInteger(userFlag)),
  /** the user's avatar decoration hash	(scope: `identify`) */
  avatarDecoration: v.nullish(v.string())
});

export interface User extends v.InferOutput<typeof userSchema> {}
