/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
/* eslint-disable no-bitwise */

import { z } from "zod";
import type { Integration } from "../guild";

export enum UserFlags {
  /** None */
  None = 0,
  /** Discord Employee */
  STAFF = 1 << 0,
  /** Partnered Server Owner */
  PARTNER = 1 << 1,
  /** HypeSquad Events Coordinator */
  HYPESQUAD = 1 << 2,
  /** Bug Hunter Level 1 */
  BUG_HUNTER_LEVEL_1 = 1 << 3,
  /** House Bravery Member */
  HYPESQUAD_ONLINE_HOUSE_1 = 1 << 6,
  /** House Brilliance Member */
  HYPESQUAD_ONLINE_HOUSE_2 = 1 << 7,
  /** House Balance Member */
  HYPESQUAD_ONLINE_HOUSE_3 = 1 << 8,
  /** Early Nitro Supporter */
  PREMIUM_EARLY_SUPPORTER = 1 << 9,
  /** User is a team */
  TEAM_PSEUDO_USER = 1 << 10,
  /** Bug Hunter Level 2 */
  BUG_HUNTER_LEVEL_2 = 1 << 14,
  /** Verified Bot */
  VERIFIED_BOT = 1 << 16,
  /** Early Verified Bot Developer */
  VERIFIED_DEVELOPER = 1 << 17,
  /** Discord Certified Moderator */
  CERTIFIED_MODERATOR = 1 << 18,
  /** Bot uses only HTTP interactions and is shown in the online member list */
  BOT_HTTP_INTERACTIONS = 1 << 19
}

/** Premium types denote the level of premium a user has. Visit the Nitro page to learn more about the premium plans we currently offer. */
export enum UserPremiumType {
  None = 0,
  NitroClassic = 1,
  Nitro = 2
}

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
  flags: z.nativeEnum(UserFlags).optional(),
  /** the type of Nitro subscription on a user's account (scope: `identify`) */
  premiumType: z.nativeEnum(UserPremiumType).optional(),
  /** the public flags on a user's account (scope: `identify`) */
  publicFlags: z.nativeEnum(UserFlags).optional()
});

export type User = z.infer<typeof user>;

export interface Connection {
  /** id of the connection account */
  id: string;
  /** the username of the connection account */
  name: string;
  /** the service of the connection (twitch, youtube) */
  type: string;
  /** whether the connection is revoked */
  revoked?: boolean;
  /** an array of partial server integrations */
  integrations?: Integration[];
  /** whether the connection is verified */
  verified: boolean;
  /** whether friend sync is enabled for this connection */
  friendSync: boolean;
  /** whether activities related to this connection will be shown in presence updates */
  showActivity: boolean;
  /** visibility of this connection */
  visibility: ConnectionVisibilty;
}

export enum ConnectionVisibilty {
  /** invisible to everyone except the user themselves */
  NONE = 0,
  /** visible to everyone */
  EVERYONE = 1
}
