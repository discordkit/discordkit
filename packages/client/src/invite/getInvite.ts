import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "@discordkit/core";
import { inviteSchema, type Invite } from "./types/Invite.ts";

export const getInviteSchema = z.object({
  code: z.string().min(1),
  params: z
    .object({
      /** whether the invite should contain approximate member counts */
      withCounts: z.boolean(),
      /** whether the invite should contain the expiration date */
      withExpiration: z.boolean(),
      /** the guild scheduled event to include with the invite */
      guildScheduledEventId: z.string().min(1)
    })
    .partial()
    .optional()
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
