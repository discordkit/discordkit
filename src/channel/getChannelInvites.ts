import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { Invite } from "../invite";

export const getChannelInvitesSchema = z.object({
  channel: z.string().min(1)
});

/**
 * Returns a list of invite objects (with invite metadata) for the channel. Only usable for guild channels. Requires the `MANAGE_CHANNELS` permission.
 *
 * https://discord.com/developers/docs/resources/channel#get-channel-invites
 */
export const getChannelInvites: Fetcher<
  typeof getChannelInvitesSchema,
  Invite[]
> = async ({ channel }) => get(`/channels/${channel}/invites`);
