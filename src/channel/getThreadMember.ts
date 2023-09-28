import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "#/utils/index.ts";
import { threadMemberSchema, type ThreadMember } from "./types/ThreadMember.ts";

export const getThreadMemberSchema = z.object({
  channel: z.string().min(1),
  user: z.string().min(1),
  params: z
    .object({
      /** Whether to include a guild member object for the thread member */
      withMember: z.boolean().nullable()
    })
    .partial()
    .optional()
});

/**
 * ### [Get Thread Member](https://discord.com/developers/docs/resources/channel#get-thread-member)
 *
 * **GET** `/channels/:channel/thread-members/:user`
 *
 * Returns a {@link ThreadMember | thread member object} for the specified user if they are a member of the thread, returns a `404 response` otherwise.
 *
 * When `withMember` is set to `true`, the thread member object will include a member field containing a guild member object.
 */
export const getThreadMember: Fetcher<
  typeof getThreadMemberSchema,
  ThreadMember
> = async ({ channel, user, params }) =>
  get(`/channels/${channel}/thread-members/${user}`, params);

export const getThreadMemberProcedure = toProcedure(
  `query`,
  getThreadMember,
  getThreadMemberSchema,
  threadMemberSchema
);

export const getThreadMemberQuery = toQuery(getThreadMember);
