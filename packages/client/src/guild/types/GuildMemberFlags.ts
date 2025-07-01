/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
import * as v from "valibot";
import { bitfield } from "@discordkit/core";

export enum GuildMemberFlags {
  /** Member has left and rejoined the guild */
  DID_REJOIN = 1 << 0,
  /** Member has completed onboarding */
  COMPLETED_ONBOARDING = 1 << 1,
  /** Member is exempt from guild verification requirements */
  BYPASSES_VERIFICATION = 1 << 2,
  /** Member has started onboarding */
  STARTED_ONBOARDING = 1 << 3,
  /** Member is a guest and can only access the voice channel they were invited to */
  IS_GUEST = 1 << 4,
  /** Member has started Server Guide new member actions */
  STARTED_HOME_ACTIONS = 1 << 5,
  /** Member has completed Server Guide new member actions */
  COMPLETED_HOME_ACTIONS = 1 << 6,
  /** Member's username, display name, or nickname is blocked by AutoMod */
  AUTOMOD_QUARANTINED_USERNAME = 1 << 7,
  /** Member has dismissed the DM settings upsell */
  DM_SETTINGS_UPSELL_ACKNOWLEDGED = 1 << 9
}

export const guildMemberFlagsSchema = v.enum_(GuildMemberFlags);
export const guildMemberFlag = bitfield(
  `guildMemberFlag`,
  GuildMemberFlags,
  `Invalid Guild Member Flag`
);
