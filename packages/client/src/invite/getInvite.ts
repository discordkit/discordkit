import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake,
  boundedString
} from "@discordkit/core";
import { inviteSchema, type Invite } from "./types/Invite.js";

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

export const getInviteSafe = toValidated(
  getInvite,
  getInviteSchema,
  inviteSchema
);

export const getInviteProcedure = toProcedure(
  `query`,
  getInvite,
  getInviteSchema,
  inviteSchema
);

export const getInviteQuery = toQuery(getInvite);
