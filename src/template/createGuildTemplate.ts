import { z } from "zod";
import { mutation, post } from "../utils";
import type { GuildTemplate } from "./types";

export const createGuildTemplateSchema = z.object({
  guild: z.string().min(1),
  body: z.object({
    /** name of the template (1-100 characters) */
    name: z.string().min(1).max(100),
    /** description for the template (0-120 characters) */
    description: z.string().min(0).max(120).optional()
  })
});

/**
 * Creates a template for the guild. Requires the `MANAGE_GUILD` permission. Returns the created guild template object on success.
 *
 * https://discord.com/developers/docs/resources/guild-template#create-guild-template
 */
export const createGuildTemplate = mutation(
  createGuildTemplateSchema,
  async ({ guild, body }) =>
    post<GuildTemplate>(`/guilds/${guild}/templates`, body)
);
