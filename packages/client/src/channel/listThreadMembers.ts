import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { ThreadMember } from "./types/ThreadMember.js";

export const listThreadMembersSchema = v.object({
  channel: snowflake,
  params: v.exactOptional(
    v.partial(
      v.object({
        /** Whether to include a {@link Member | guild member object} for each {@link ThreadMember | thread member} */
        withMember: v.boolean(),
        /** Get {@link ThreadMember | thread members} after this user ID */
        after: snowflake,
        /** Max number of {@link ThreadMember | thread members} to return (1-100). Defaults to 100. */
        limit: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100))
      })
    )
  )
});

/**
 * ### [List Thread Members](https://discord.com/developers/docs/resources/channel#list-thread-members)
 *
 * **GET** `/channels/:channel/thread-members`
 *
 * Returns array of {@link ThreadMember | thread members objects} that are members of the thread.
 *
 * When `withMember` is set to `true`, the results will be paginated and each {@link ThreadMember | thread member object} will include a `member` field containing a {@link Member | guild member object}.
 *
 * > [!WARNING]
 * >
 * > Starting in API v11, this endpoint will always return paginated results. Paginated results can be enabled before API v11 by setting `withMember` to `true`. Read the changelog for details.
 *
 * > [!WARNING]
 * >
 * > This endpoint is restricted according to whether the `GUILD_MEMBERS` Privileged Intent is enabled for your application.
 */
export const listThreadMembers: Fetcher<
  typeof listThreadMembersSchema,
  ThreadMember[]
> = async ({ channel, params }) =>
  get(`/channels/${channel}/thread-members`, params);
