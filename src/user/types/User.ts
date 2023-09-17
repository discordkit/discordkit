import { z } from "zod";
import { userFlags } from "./UserFlags";
import { userPremiumType } from "./UserPremiumType";

// https://discord.com/developers/docs/resources/user#user-object-user-structure
export const user = z.object({
  /** the user's id (scope: `identify`) */
  id: z.string().min(1),
  /** the user's username, not unique across the platform (scope: `identify`) */
  username: z.string().min(1),
  /** the user's 4-digit discord-tag (scope: `identify`) */
  discriminator: z.string().length(4),
  /** the user's avatar hash (scope: `identify`) */
  avatar: z.string().min(1).optional(),
  /** whether the user belongs to an OAuth2 application (scope: `identify`) */
  bot: z.boolean().optional(),
  /** whether the user is an Official Discord System user (part of the urgent message system) (scope: `identify`) */
  system: z.boolean().optional(),
  /** whether the user has two factor enabled on their account (scope: `identify`) */
  mfaEnabled: z.boolean().optional(),
  /** the user's banner hash (scope: `identify`) */
  banner: z.string().min(1).optional(),
  /** the user's banner color encoded as an integer representation of hexadecimal color code (scope: `identify`) */
  accentColor: z.number().optional(),
  /** the user's chosen language option (scope: `identify`) */
  locale: z.string().min(1).optional(),
  /** whether the email on this account has been verified (scope: `email`) */
  verified: z.boolean().optional(),
  /** the user's email (scope: `email`) */
  email: z.string().min(1).optional(),
  /** the flags on a user's account (scope: `identify`) */
  flags: userFlags.optional(),
  /** the type of Nitro subscription on a user's account (scope: `identify`) */
  premiumType: userPremiumType.optional(),
  /** the public flags on a user's account (scope: `identify`) */
  publicFlags: userFlags.optional()
});

export type User = z.infer<typeof user>;
