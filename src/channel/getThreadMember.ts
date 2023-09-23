import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { threadMemberSchema, type ThreadMember } from "./types/ThreadMember";

export const getThreadMemberSchema = z.object({
  channel: z.string().min(1),
  user: z.string().min(1)
});

/**
 * Returns a [thread member](https://discord.com/developers/docs/resources/channel#thread-member-object) object for the specified user if they are a member of the thread, returns a 404 response otherwise.
 *
 * https://discord.com/developers/docs/resources/channel#get-thread-member
 */
export const getThreadMember: Fetcher<
  typeof getThreadMemberSchema,
  ThreadMember
> = async ({ channel, user }) =>
  get(`/channels/${channel}/thread-members/${user}`);

export const getThreadMemberProcedure = toProcedure(
  `query`,
  getThreadMember,
  getThreadMemberSchema,
  threadMemberSchema
);

export const getThreadMemberQuery = toQuery(getThreadMember);
