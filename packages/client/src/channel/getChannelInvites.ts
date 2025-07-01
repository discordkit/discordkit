import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  inviteMetadataSchema,
  type InviteMetadata
} from "../invite/types/InviteMetadata.js";

export const getChannelInvitesSchema = v.object({
  channel: snowflake
});

/**
 * ### [Get Channel Invites](https://discord.com/developers/docs/resources/channel#get-channel-invites)
 *
 * **GET** `/channels/:channel/invites`
 *
 * Returns a list of {@link InviteMetadata | invite objects} (with invite metadata) for the channel. Only usable for guild channels. Requires the `MANAGE_CHANNELS` permission.
 */
export const getChannelInvites: Fetcher<
  typeof getChannelInvitesSchema,
  InviteMetadata[]
> = async ({ channel }) => get(`/channels/${channel}/invites`);

export const getChannelInvitesSafe = toValidated(
  getChannelInvites,
  getChannelInvitesSchema,
  v.array(inviteMetadataSchema)
);

export const getChannelInvitesProcedure = toProcedure(
  `query`,
  getChannelInvites,
  getChannelInvitesSchema,
  v.array(inviteMetadataSchema)
);

export const getChannelInvitesQuery = toQuery(getChannelInvites);
