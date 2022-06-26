import { z } from "zod";
import { get, query } from "../utils";
import type { Role } from "./types";

export const getGuildRolesSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns a list of role objects for the guild.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-roles
 */
export const getGuildRoles = query(getGuildRolesSchema, ({ guild }) => get<Role[]>(`/guilds/${guild}/roles`));
