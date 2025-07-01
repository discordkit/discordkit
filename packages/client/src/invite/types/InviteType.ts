import * as v from "valibot";

export const InviteType = {
  GUILD: 0,
  GROUP_DM: 1,
  FRIEND: 2
} as const;

export const inviteTypeSchema = v.enum_(InviteType);
