import * as v from "valibot";
import { remove, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const removeTargetUserSchema = v.object({
  code: boundedString(),
  user: snowflake
});

/**
 * ### [Remove Target User](https://discord.com/developers/docs/resources/invite#remove-target-user)
 *
 * **DELETE** `/invites/:code/target-users/:user`
 *
 * Removes a target user from an existing invite. Requires the caller to be the inviter or have the `MANAGE_GUILD` permission. Returns a 204 empty response on success.
 */
export const removeTargetUser: Fetcher<typeof removeTargetUserSchema> = async ({
  code,
  user
}) => remove(`/invites/${code}/target-users/${user}`);
