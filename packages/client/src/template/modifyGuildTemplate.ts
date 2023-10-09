import {
  maxLength,
  minLength,
  nullish,
  object,
  partial,
  string
} from "valibot";
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

export const modifyGuildTemplateSchema = object({
  guild: snowflake,
  template: snowflake,
  body: partial(
    object({
      /** name of the template (1-100 characters) */
      name: nullish(string([minLength(1), maxLength(120)])),
      /** description for the template (0-120 characters) */
      description: nullish(string([minLength(0), maxLength(120)]))
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
