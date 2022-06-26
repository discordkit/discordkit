import { z } from "zod";
import { get, query } from "../utils";
import type { ThreadMember } from "./types";

export const getThreadMemberSchema = z.object({
  channel: z.string().min(1),
  user: z.string().min(1)
});

/**
 * Returns a [thread member](https://discord.com/developers/docs/resources/channel#thread-member-object) object for the specified user if they are a member of the thread, returns a 404 response otherwise.
 *
 * https://discord.com/developers/docs/resources/channel#get-thread-member
 */
export const getThreadMember = query(getThreadMemberSchema, ({ channel, user }) =>
  get<ThreadMember>(`/channels/${channel}/thread-members/${user}`)
);
