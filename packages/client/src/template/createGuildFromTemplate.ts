import { z } from "zod";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { guildSchema, type Guild } from "#/guild/types/Guild.ts";

export const createGuildFromTemplateSchema = z.object({
  template: snowflake,
  body: z.object({
    /** name of the guild (2-100 characters) */
    name: z.string().min(2).max(100),
    /** base64 128x128 image for the guild icon */
    icon: z.string().nullable()
  })
});

/**
 * ### [Create Guild from Guild Template](https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template)
 *
 * **POST** `/guilds/templates/:template`
 *
 * Create a new guild based on a template. Returns a {@link Guild | guild object} on success. Fires a Guild Create Gateway event.
 *
 * > **WARNING**
 * >
 * > This endpoint can be used only by bots in less than 10 guilds.
 */
export const createGuildFromTemplate: Fetcher<
  typeof createGuildFromTemplateSchema,
  Guild
> = async ({ template, body }) => post(`/guilds/templates/${template}`, body);

export const createGuildFromTemplateSafe = toValidated(
  createGuildFromTemplate,
  createGuildFromTemplateSchema,
  guildSchema
);

export const createGuildFromTemplateProcedure = toProcedure(
  `mutation`,
  createGuildFromTemplate,
  createGuildFromTemplateSchema,
  guildSchema
);
