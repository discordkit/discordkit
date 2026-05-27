import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type ThreadMember } from "./types/ThreadMember.js";

export const getThreadMemberSchema = v.object({
  channel: snowflake,
  user: snowflake,
  params: v.exactOptional(
    v.partial(
      v.object({
        /** Whether to include a guild member object for the thread member */
        withMember: v.nullish(v.boolean())
      })
    )
  )
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
