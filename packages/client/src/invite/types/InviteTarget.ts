import * as v from "valibot";

export enum InviteTarget {
  STREAM = 1,
  EMBEDDED_APPLICATION = 2
}

export const inviteTargetSchema = v.enum_(InviteTarget);
