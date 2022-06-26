import { z } from "zod";
import { get, query } from "../utils";
import type { GuildTemplate } from "./types";

export const getGuildTemplateSchema = z.object({
  template: z.string().min(1)
});

/**
 * Returns a guild template object for the given code.
 *
 * https://discord.com/developers/docs/resources/guild-template#get-guild-template
 */
export const getGuildTemplate = query(getGuildTemplateSchema, ({ template }) =>
  get<GuildTemplate>(`/guilds/templates/${template}`)
);
