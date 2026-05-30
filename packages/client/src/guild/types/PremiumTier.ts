import * as v from "valibot";

/**
 * ### [Premium Tier](https://discord.com/developers/docs/resources/guild#guild-object-premium-tier)
 */
export enum PremiumTier {
  /** guild has not unlocked any Server Boost perks */
  NONE = 0,
  /** guild has unlocked Server Boost level 1 perks */
  TIER_1 = 1,
  /** guild has unlocked Server Boost level 2 perks */
  TIER_2 = 2,
  /** guild has unlocked Server Boost level 3 perks */
  TIER_3 = 3
}

export const premiumTierSchema = v.enum_(PremiumTier);
