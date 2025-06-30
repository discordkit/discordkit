import {
  array,
  boolean,
  integer,
  maxValue,
  minValue,
  number,
  object,
  exactOptional,
  partial,
  pipe
} from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { threadMemberSchema, type ThreadMember } from "./types/ThreadMember.js";

export const listThreadMembersSchema = object({
  channel: snowflake,
  params: exactOptional(
    partial(
      object({
        /** Whether to include a guild member object for each thread member */
        withMember: boolean(),
        /** Get thread members after this user ID */
        after: snowflake,
        /** Max number of thread members to return (1-100). Defaults to 100. */
        limit: pipe(number(), integer(), minValue(1), maxValue(100))
      })
    )
  )
});

/**
 * ### [List Thread Members](https://discord.com/developers/docs/resources/channel#list-thread-members)
 *
 * **GET** `/channels/:channel/thread-members`
 *
 * > [!WARNING]
 * >
 * > Starting in API v11, this endpoint will always return paginated results. Paginated results can be enabled before API v11 by setting `withMember` to `true`. Read the changelog for details.
 *
 * Returns array of {@link ThreadMember | thread members objects} that are members of the thread.
 *
 * When `withMember` is set to `true`, the results will be paginated and each thread member object will include a `member` field containing a guild member object.
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

export const listThreadMembersSafe = toValidated(
  listThreadMembers,
  listThreadMembersSchema,
  array(threadMemberSchema)
);

export const listThreadMembersProcedure = toProcedure(
  `query`,
  listThreadMembers,
  listThreadMembersSchema,
  array(threadMemberSchema)
);

export const listThreadMembersQuery = toQuery(listThreadMembers);
