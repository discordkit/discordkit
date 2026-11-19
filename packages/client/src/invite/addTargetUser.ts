import * as v from "valibot";
import { put, type Fetcher } from "@discordkit/core/requests/methods";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const addTargetUserSchema = v.object({
  code: boundedString(),
  user: snowflake
});

/**
 * ### [Add Target User](https://discord.com/developers/docs/resources/invite#add-target-user)
 *
 * **PUT** `/invites/:code/target-users/:user`
 *
 * Adds a target user to an existing invite. Requires the caller to be the inviter or have the `MANAGE_GUILD` permission. Returns a 204 empty response on success.
 */
export const addTargetUser: Fetcher<typeof addTargetUserSchema> = async ({
  code,
  user
}) => put(`/invites/${code}/target-users/${user}`);
