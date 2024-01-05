import { enum_ } from "valibot";

export enum InviteTarget {
  STREAM = 1,
  EMBEDDED_APPLICATION = 2
}

export const inviteTargetSchema = enum_(InviteTarget);
