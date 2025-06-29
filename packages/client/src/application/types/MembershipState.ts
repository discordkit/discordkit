// https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum

import { enum_ } from "valibot";

export const MembershipState = {
  INVITED: 1,
  ACCEPTED: 2
} as const;

export const membershipStateSchema = enum_(MembershipState);
