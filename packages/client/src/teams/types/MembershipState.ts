// https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum

import * as v from "valibot";

export const MembershipState = {
  INVITED: 1,
  ACCEPTED: 2
} as const;

/**
 * ### [Membership State](https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum)
 */
export const membershipStateSchema = v.enum_(MembershipState);
