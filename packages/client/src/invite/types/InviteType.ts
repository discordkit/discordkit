import * as v from "valibot";

export const InviteType = {
  GUILD: 0,
  GROUP_DM: 1,
  FRIEND: 2
} as const;

/**
 * ### [Invite Type](https://discord.com/developers/docs/resources/invite#invite-object)
 *
 * Represents a code that when used, adds a user to a guild or group {@link Channel | DM channel}.
 */
export const inviteTypeSchema = v.enum_(InviteType);
