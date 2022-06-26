import { z } from "zod";
import { get, query } from "../utils";
import type { ThreadMember } from "./types";

export const listThreadMembersSchema = z.object({
  channel: z.string().min(1)
});

/**
 * Returns array of [thread members](https://discord.com/developers/docs/resources/channel#thread-member-object) objects that are members of the thread.
 *
 * *This endpoint is restricted according to whether the `GUILD_MEMBERS` [Privileged Intent](https://discord.com/developers/docs/topics/gateway#privileged-intents) is enabled for your application.*
 *
 * https://discord.com/developers/docs/resources/channel#list-thread-members
 */
export const listThreadMembers = query(listThreadMembersSchema, ({ channel }) =>
  get<ThreadMember[]>(`/channels/${channel}/thread-members`)
);
