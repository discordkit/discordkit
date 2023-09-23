import { z } from "zod";
import { post, type Fetcher, toProcedure } from "../utils";
import { guildSchema, type Guild } from "../guild";

export const createGuildFromTemplateSchema = z.object({
  template: z.string().min(1),
  body: z.object({
    /** name of the guild (2-100 characters) */
    name: z.string().min(1).max(100),
    /** base64 128x128 image for the guild icon */
    icon: z.string().optional()
  })
});

/**
 * Create a new guild based on a template. Returns a guild object on success. Fires a [Guild Create](https://discord.com/developers/docs/topics/gateway#guild-create) Gateway event.
 *
 * *This endpoint can be used only by bots in less than 10 guilds.*
 *
 * https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template
 */
export const createGuildFromTemplate: Fetcher<
  typeof createGuildFromTemplateSchema,
  Guild
> = async ({ template, body }) => post(`/guilds/templates/${template}`, body);

export const createGuildFromTemplateProcedure = toProcedure(
  `mutation`,
  createGuildFromTemplate,
  createGuildFromTemplateSchema,
  guildSchema
);
