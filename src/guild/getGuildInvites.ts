import { z } from "zod";
import type { Invite } from "../invite";
import { get, query } from "../utils";

export const getGuildInvitesSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns a list of invite objects (with invite metadata) for the guild. Requires the `MANAGE_GUILD` permission.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-invites
 */
export const getGuildInvites = query(getGuildInvitesSchema, ({ guild }) => get<Invite[]>(`/guilds/${guild}/invites`));
