import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "../utils";
import { guildTemplateSchema, type GuildTemplate } from "./types";

export const modifyGuildTemplateSchema = z.object({
  guild: z.string().min(1),
  template: z.string().min(1),
  body: z
    .object({
      /** name of the template (1-100 characters) */
      name: z.string().min(1).max(120),
      /** description for the template (0-120 characters) */
      description: z.string().min(0).max(120)
    })
    .partial()
});

/**
 * Modifies the template's metadata. Requires the `MANAGE_GUILD` permission. Returns the guild template object on success.
 *
 * https://discord.com/developers/docs/resources/guild-template#modify-guild-template
 */
export const modifyGuildTemplate: Fetcher<
  typeof modifyGuildTemplateSchema,
  GuildTemplate
> = async ({ guild, template, body }) =>
  patch(`/guilds/${guild}/templates/${template}`, body);

export const modifyGuildTemplateProcedure = toProcedure(
  `mutation`,
  modifyGuildTemplate,
  modifyGuildTemplateSchema,
  guildTemplateSchema
);
