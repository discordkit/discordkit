import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "../utils";
import { guildTemplateSchema, type GuildTemplate } from "./types/GuildTemplate";

export const deleteGuildTemplateSchema = z.object({
  guild: z.string().min(1),
  template: z.string().min(1)
});

/**
 * ### [Delete Guild Template](https://discord.com/developers/docs/resources/guild-template#delete-guild-template)
 *
 * **DELETE** `/guilds/:guild/templates/:template`
 *
 * Deletes the template. Requires the `MANAGE_GUILD` permission. Returns the deleted {@link GuildTemplate | guild template object} on success.
 */
export const deleteGuildTemplate: Fetcher<
  typeof deleteGuildTemplateSchema,
  GuildTemplate
> = async ({ guild, template }) =>
  remove(`/guilds/${guild}/templates/${template}`);

export const deleteGuildTemplateProcedure = toProcedure(
  `mutation`,
  deleteGuildTemplate,
  deleteGuildTemplateSchema,
  guildTemplateSchema
);
