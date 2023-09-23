import { z } from "zod";
import { post, type Fetcher, toProcedure } from "../utils";
import { channelSchema, type Channel } from "../channel/types/Channel";

export const createGroupDMSchema = z.object({
  body: z.object({
    /** access tokens of users that have granted your app the `gdm.join` scope */
    accessTokens: z.array(z.string()),
    /** a dictionary of user ids to their respective nicknames */
    nicks: z.record(z.string(), z.string())
  })
});

/**
 * Create a new group DM channel with multiple users. Returns a DM channel object. This endpoint was intended to be used with the now-deprecated GameBridge SDK. DMs created with this endpoint will not be shown in the Discord client
 *
 * *This endpoint is limited to 10 active group DMs.*
 *
 * https://discord.com/developers/docs/resources/user#create-group-dm
 */
export const createGroupDM: Fetcher<
  typeof createGroupDMSchema,
  Channel
> = async ({ body }) => post(`/users/@me/channels`, body);

export const createGroupDMProcedure = toProcedure(
  `mutation`,
  createGroupDM,
  createGroupDMSchema,
  channelSchema
);
