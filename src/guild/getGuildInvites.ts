import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { Invite } from "../invite";

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
