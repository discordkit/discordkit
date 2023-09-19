import { z } from "zod";
import { remove, type Fetcher, createProcedure } from "../utils";

export const deleteGuildTemplateSchema = z.object({
  guild: z.string().min(1),
  template: z.string().min(1)
});

/**
 * Deletes the template. Requires the `MANAGE_GUILD` permission. Returns the deleted guild template object on success.
 *
 * https://discord.com/developers/docs/resources/guild-template#delete-guild-template
 */
export const deleteGuildTemplate: Fetcher<
  typeof deleteGuildTemplateSchema
> = async ({ guild, template }) =>
  remove(`/guilds/${guild}/templates/${template}`);

export const deleteGuildTemplateProcedure = createProcedure(
  `mutation`,
  deleteGuildTemplate,
  deleteGuildTemplateSchema
);
