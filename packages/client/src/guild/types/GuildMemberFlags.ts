/* eslint-disable @typescript-eslint/prefer-literal-enum-member */

import { nativeEnum } from "valibot";

/* eslint-disable no-bitwise */
export enum GuildMemberFlags {
  /** Member has left and rejoined the guild */
  DID_REJOIN = 1 << 0,
  /** Member has completed onboarding */
  COMPLETED_ONBOARDING = 1 << 1,
  /** Member is exempt from guild verification requirements */
  BYPASSES_VERIFICATION = 1 << 2,
  /** Member has started onboarding */
  STARTED_ONBOARDING = 1 << 3
}

export const guildMemberFlagsSchema = nativeEnum(GuildMemberFlags);
