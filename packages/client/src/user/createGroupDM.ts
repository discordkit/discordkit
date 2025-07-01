import { post, type Fetcher, toProcedure, toValidated } from "@discordkit/core";
import type { InferOutput } from "valibot";
import { array, minLength, object, pipe, record, string } from "valibot";
import { groupDirectMessageChannelSchema } from "../channel/types/Channel.js";

export const createGroupDMSchema = object({
  body: object({
    /** access tokens of users that have granted your app the `gdm.join` scope */
    accessTokens: array(string()),
    /** a dictionary of user ids to their respective nicknames */
    nicks: record(pipe(string(), minLength(1)), string())
  })
});

/**
 * ### [Create Group DM](https://discord.com/developers/docs/resources/user#create-group-dm)
 *
 * **POST** `/users/@me/channels`
 *
 * Create a new group DM channel with multiple users. Returns a {@link Channel | DM channel object}. This endpoint was intended to be used with the now-deprecated GameBridge SDK. Fires a Channel Create Gateway event.
 *
 * > [!WARNING]
 * >
 * > This endpoint is limited to 10 active group DMs.
 */
export const createGroupDM: Fetcher<
  typeof createGroupDMSchema,
  InferOutput<typeof groupDirectMessageChannelSchema>
> = async ({ body }) => post(`/users/@me/channels`, body);

export const createGroupDMSafe = toValidated(
  createGroupDM,
  createGroupDMSchema,
  groupDirectMessageChannelSchema
);

export const createGroupDMProcedure = toProcedure(
  `mutation`,
  createGroupDM,
  createGroupDMSchema,
  groupDirectMessageChannelSchema
);
