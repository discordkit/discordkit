import { z } from "zod";
import { get, query } from "../utils";
import type { GuildTemplate } from "./types";

export const getGuildTemplatesSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns an array of guild template objects. Requires the `MANAGE_GUILD` permission.
 *
 * https://discord.com/developers/docs/resources/guild-template#get-guild-templates
 */
export const getGuildTemplates = query(getGuildTemplatesSchema, ({ guild }) =>
  get<GuildTemplate[]>(`/guilds/${guild}/templates`)
);
