import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { Role } from "./types";

export const getGuildRolesSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns a list of role objects for the guild.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-roles
 */
export const getGuildRoles: Fetcher<
  typeof getGuildRolesSchema,
  Role[]
> = async ({ guild }) => get(`/guilds/${guild}/roles`);
