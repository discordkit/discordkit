import { z } from "zod";
import { mutation, remove } from "../utils";

export const deleteGuildTemplateSchema = z.object({
  guild: z.string().min(1),
  template: z.string().min(1)
});

/**
 * Deletes the template. Requires the `MANAGE_GUILD` permission. Returns the deleted guild template object on success.
 *
 * https://discord.com/developers/docs/resources/guild-template#delete-guild-template
 */
export const deleteGuildTemplate = mutation(
  deleteGuildTemplateSchema,
  async ({ guild, template }) =>
    remove(`/guilds/${guild}/templates/${template}`)
);
