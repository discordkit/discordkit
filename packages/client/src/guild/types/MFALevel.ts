import { enum_ } from "valibot";

export enum MFALevel {
  /** guild has no MFA/2FA requirement for moderation actions */
  NONE = 0,
  /** guild has a 2FA requirement for moderation actions */
  ELEVATED = 1
}

export const mfaLevelSchema = enum_(MFALevel);
