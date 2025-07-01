import * as v from "valibot";
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
} from "./types/GuildTemplate.js";

export const modifyGuildTemplateSchema = v.object({
  guild: snowflake,
  template: snowflake,
  body: v.partial(
    v.object({
      /** name of the template (1-100 characters) */
      name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
      /** description for the template (0-120 characters) */
      description: v.nullish(
        v.pipe(v.string(), v.minLength(1), v.maxLength(120))
      )
    })
  )
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
