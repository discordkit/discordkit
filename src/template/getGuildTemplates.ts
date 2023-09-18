import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { GuildTemplate } from "./types";

export const getGuildTemplatesSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns an array of guild template objects. Requires the `MANAGE_GUILD` permission.
 *
 * https://discord.com/developers/docs/resources/guild-template#get-guild-templates
 */
export const getGuildTemplates: Fetcher<
  typeof getGuildTemplatesSchema,
  GuildTemplate[]
> = async ({ guild }) => get(`/guilds/${guild}/templates`);
