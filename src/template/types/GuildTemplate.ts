import { z } from "zod";
import { guild } from "../../guild";

export const guildTemplate = z.object({
  /** the template code (unique ID) */
  code: z.string(),
  /** template name */
  name: z.string(),
  /** the description for the template */
  description: z.string().optional(),
  /** number of times this template has been used */
  usageCount: z.number(),
  /** the ID of the user who created the template
    creator	user object	the user who created the template */
  creatorId: z.string(),
  /** when this template was created */
  createdAt: z.string(),
  /** when this template was last synced to the source guild */
  updatedAt: z.string(),
  /** the ID of the guild this template is based on */
  sourceGuildId: z.string(),
  /** the guild snapshot this template contains */
  serializedSourceGuild: guild.partial(),
  /** whether the template has unsynced changes */
  isDirty: z.boolean().optional()
});

export type GuildTemplate = z.infer<typeof guildTemplate>;
