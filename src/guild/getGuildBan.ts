import { z } from "zod";
import { get, query } from "../utils";
import type { Ban } from "./types";

export const getGuildBanSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1)
});

/**
 * Returns a ban object for the given user or a 404 not found if the ban cannot be found. Requires the `BAN_MEMBERS` permission.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-ban
 */
export const getGuildBan = query(getGuildBanSchema, ({ guild, user }) => get<Ban>(`/guilds/${guild}/bans/${user}`));
