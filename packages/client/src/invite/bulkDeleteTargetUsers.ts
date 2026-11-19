import * as v from "valibot";
import { post, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedArray } from "@discordkit/core/validations/boundedArray";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const bulkDeleteTargetUsersSchema = v.object({
  code: boundedString(),
  body: v.object({
    /** the IDs of users to remove, max of 1000 users */
    userIds: boundedArray(snowflake, { max: 1000 })
  })
});

/**
 * ### [Bulk-Delete Target Users](https://discord.com/developers/docs/resources/invite#bulk-delete-target-users)
 *
 * **POST** `/invites/:code/target-users/bulk-delete`
 *
 * Removes multiple target users from an existing invite. Requires the caller to be the inviter or have the `MANAGE_GUILD` permission. Returns a 204 empty response on success.
 */
export const bulkDeleteTargetUsers: Fetcher<
  typeof bulkDeleteTargetUsersSchema
> = async ({ code, body }) =>
  post(`/invites/${code}/target-users/bulk-delete`, body);
