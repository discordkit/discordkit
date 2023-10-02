import { z } from "zod";
import { post, type Fetcher, toProcedure, toValidated } from "@discordkit/core";
import { channelSchema, type Channel } from "../channel/types/Channel.ts";
import { ChannelType } from "../channel/types/ChannelType.ts";

export const createGroupDMSchema = z.object({
  body: z.object({
    /** access tokens of users that have granted your app the `gdm.join` scope */
    accessTokens: z.string().array(),
    /** a dictionary of user ids to their respective nicknames */
    nicks: z.record(z.string().min(1), z.string())
  })
});

/**
 * ### [Create Group DM](https://discord.com/developers/docs/resources/user#create-group-dm)
 *
 * **POST** `/users/@me/channels`
 *
 * Create a new group DM channel with multiple users. Returns a {@link Channel | DM channel object}. This endpoint was intended to be used with the now-deprecated GameBridge SDK. Fires a Channel Create Gateway event.
 *
 * > **WARNING**
 * >
 * > This endpoint is limited to 10 active group DMs.
 */
export const createGroupDM: Fetcher<
  typeof createGroupDMSchema,
  Channel & { type: typeof ChannelType.GROUP_DM }
> = async ({ body }) => post(`/users/@me/channels`, body);

export const createGroupDMSafe = toValidated(
  createGroupDM,
  createGroupDMSchema,
  channelSchema.extend({ type: z.literal(ChannelType.GROUP_DM) })
);

export const createGroupDMProcedure = toProcedure(
  `mutation`,
  createGroupDM,
  createGroupDMSchema,
  channelSchema.extend({ type: z.literal(ChannelType.GROUP_DM) })
);
