// https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum

import { nativeEnum } from "valibot";

export enum MembershipState {
  INVITED = 1,
  ACCEPTED = 2
}

export const membershipStateSchema = nativeEnum(MembershipState);
