import { z } from "zod";
import { put, type Fetcher, createProcedure } from "../utils";
import { guildTemplateSchema, type GuildTemplate } from "./types";

export const syncGuildTemplateSchema = z.object({
  guild: z.string().min(1),
  template: z.string().min(1)
});

/**
 * Syncs the template to the guild's current state. Requires the `MANAGE_GUILD` permission. Returns the guild template object on success.
 *
 * https://discord.com/developers/docs/resources/guild-template#sync-guild-template
 */
export const syncGuildTemplate: Fetcher<
  typeof syncGuildTemplateSchema,
  GuildTemplate
> = async ({ guild, template }) =>
  put(`/guilds/${guild}/templates/${template}`);

export const syncGuildTemplateProcedure = createProcedure(
  `mutation`,
  syncGuildTemplate,
  syncGuildTemplateSchema,
  guildTemplateSchema
);
