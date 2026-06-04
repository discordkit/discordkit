import * as v from "valibot";

/**
 * ### [Invite Target](https://discord.com/developers/docs/resources/invite#invite-object-invite-target-types)
 */
export enum InviteTarget {
  STREAM = 1,
  EMBEDDED_APPLICATION = 2
}

export const inviteTargetSchema = v.enum_(InviteTarget);
