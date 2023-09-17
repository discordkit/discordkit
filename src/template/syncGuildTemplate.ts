import { z } from "zod";
import { mutation, put } from "../utils";
import type { GuildTemplate } from "./types";

export const syncGuildTemplateSchema = z.object({
  guild: z.string().min(1),
  template: z.string().min(1)
});

/**
 * Syncs the template to the guild's current state. Requires the `MANAGE_GUILD` permission. Returns the guild template object on success.
 *
 * https://discord.com/developers/docs/resources/guild-template#sync-guild-template
 */
export const syncGuildTemplate = mutation(
  syncGuildTemplateSchema,
  async ({ guild, template }) =>
    put<GuildTemplate>(`/guilds/${guild}/templates/${template}`)
);
