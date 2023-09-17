// https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum

import { z } from "zod";

export enum MembershipState {
  INVITED = 1,
  ACCEPTED = 2
}

export const membershipState = z.nativeEnum(MembershipState);
