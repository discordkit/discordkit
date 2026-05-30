import * as v from "valibot";
import type { Fetcher } from "@discordkit/core";
import { post } from "@discordkit/core";
import { groupDirectMessageChannelSchema } from "../channel/types/Channel.js";

export const createGroupDMSchema = v.object({
  body: v.object({
    /** access tokens of users that have granted your app the `gdm.join` scope */
    accessTokens: v.array(v.string()),
    /** a dictionary of user ids to their respective nicknames */
    nicks: v.record(v.pipe(v.string(), v.minLength(1)), v.string())
  })
});

/**
 * ### [Create Group DM](https://discord.com/developers/docs/resources/user#create-group-dm)
 *
 * **POST** `/users/@me/channels`
 *
 * Create a new group {@link Channel | DM channel} with multiple users. Returns a {@link Channel | DM channel object}. This endpoint was intended to be used with the now-deprecated GameBridge SDK. Fires a Channel Create Gateway event.
 *
 * > [!WARNING]
 * >
 * > This endpoint is limited to 10 active group DMs.
 */
export const createGroupDM: Fetcher<
  typeof createGroupDMSchema,
  v.InferOutput<typeof groupDirectMessageChannelSchema>
> = async ({ body }) => post(`/users/@me/channels`, body);
