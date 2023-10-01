import { z } from "zod";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  guildTemplateSchema,
  type GuildTemplate
} from "./types/GuildTemplate.ts";

export const modifyGuildTemplateSchema = z.object({
  guild: snowflake,
  template: snowflake,
  body: z
    .object({
      /** name of the template (1-100 characters) */
      name: z.string().min(1).max(120).nullable(),
      /** description for the template (0-120 characters) */
      description: z.string().min(0).max(120).nullable().optional()
    })
    .partial()
});

/**
 * ### [Modify Guild Template](https://discord.com/developers/docs/resources/guild-template#modify-guild-template)
 *
 * **PATCH** `/guilds/:guild/templates/:template`
 *
 * Modifies the template's metadata. Requires the `MANAGE_GUILD` permission. Returns the {@link GuildTemplate | guild template object} on success.
 */
export const modifyGuildTemplate: Fetcher<
  typeof modifyGuildTemplateSchema,
  GuildTemplate
> = async ({ guild, template, body }) =>
  patch(`/guilds/${guild}/templates/${template}`, body);

export const modifyGuildTemplateSafe = toValidated(
  modifyGuildTemplate,
  modifyGuildTemplateSchema,
  guildTemplateSchema
);

export const modifyGuildTemplateProcedure = toProcedure(
  `mutation`,
  modifyGuildTemplate,
  modifyGuildTemplateSchema,
  guildTemplateSchema
);
