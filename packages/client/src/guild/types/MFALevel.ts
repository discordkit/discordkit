import * as v from "valibot";

/**
 * ### [MFA Level](https://discord.com/developers/docs/resources/guild#guild-object-mfa-level)
 */
export enum MFALevel {
  /** guild has no MFA/2FA requirement for moderation actions */
  NONE = 0,
  /** guild has a 2FA requirement for moderation actions */
  ELEVATED = 1
}

export const mfaLevelSchema = v.enum_(MFALevel);
