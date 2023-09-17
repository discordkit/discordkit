import { z } from "zod";
import { get, query } from "../utils";
import type { Invite } from "./types";

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
 * Returns an invite object for the given code.
 *
 * https://discord.com/developers/docs/resources/invite#get-invite
 */
export const getInvite = query(
  getInviteSchema,
  async ({ input: { code, params } }) => get<Invite>(`/invites/${code}`, params)
);
