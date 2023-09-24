import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { inviteSchema, type Invite } from "../invite/types/Invite";

export const getGuildInvitesSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns a list of invite objects (with invite metadata) for the guild. Requires the `MANAGE_GUILD` permission.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-invites
 */
export const getGuildInvites: Fetcher<
  typeof getGuildInvitesSchema,
  Invite[]
> = async ({ guild }) => get(`/guilds/${guild}/invites`);

export const getGuildInvitesProcedure = toProcedure(
  `query`,
  getGuildInvites,
  getGuildInvitesSchema,
  inviteSchema.array()
);

export const getGuildInvitesQuery = toQuery(getGuildInvites);
