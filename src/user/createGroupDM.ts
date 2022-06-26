import { z } from "zod";
import type { Channel } from "../channel";
import { mutation, post } from "../utils";

const createGroupDMSchema = z.object({
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
export const createGroupDM = mutation(createGroupDMSchema, async ({ body }) =>
  post<Channel>(`/users/@me/channels`, body)
);
