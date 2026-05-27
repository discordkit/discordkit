import * as v from "valibot";
import { get, type Fetcher, snowflake, boundedString } from "@discordkit/core";
import { type Invite } from "./types/Invite.js";

export const getInviteSchema = v.object({
  code: boundedString(),
  params: v.exactOptional(
    v.partial(
      v.object({
        /** whether the invite should contain approximate member counts */
        withCounts: v.boolean(),
        /** whether the invite should contain the expiration date */
        withExpiration: v.boolean(),
        /** the guild scheduled event to include with the invite */
        guildScheduledEventId: snowflake
      })
    )
  )
});

/**
 * ### [Get Invite](https://discord.com/developers/docs/resources/invite#get-invite)
 *
 * **GET** `/invites/:code`
 *
 * Returns an {@link Invite | invite object} for the given code.
 */
export const getInvite: Fetcher<typeof getInviteSchema, Invite> = async ({
  code,
  params
}) => get(`/invites/${code}`, params);
