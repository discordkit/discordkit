import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";

export const getTargetUsersSchema = v.object({
  code: boundedString()
});

/**
 * ### [Get Target Users](https://discord.com/developers/docs/resources/invite#get-target-users)
 *
 * **GET** `/invites/:code/target-users`
 *
 * Gets the users allowed to see and accept this invite. Response is a CSV file with the header `user_id` and each user ID from the original file passed to invite create on its own line. Requires the caller to be the inviter, or have `MANAGE_GUILD` permission, or have `VIEW_AUDIT_LOG` permission.
 */
export const getTargetUsers: Fetcher<
  typeof getTargetUsersSchema,
  string
> = async ({ code }) => get(`/invites/${code}/target-users`);
