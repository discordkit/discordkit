import { z } from "zod";
import type { Invite } from "../invite";
import { get, query } from "../utils";

export const getChannelInvitesSchema = z.object({
  channel: z.string().min(1)
});

/**
 * Returns a list of invite objects (with invite metadata) for the channel. Only usable for guild channels. Requires the `MANAGE_CHANNELS` permission.
 *
 * https://discord.com/developers/docs/resources/channel#get-channel-invites
 */
export const getChannelInvites = query(getChannelInvitesSchema, ({ channel }) =>
  get<Invite[]>(`/channels/${channel}/invites`)
);
