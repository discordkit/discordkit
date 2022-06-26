import type { Guild } from "../guild";

export interface GuildTemplate {
  /** the template code (unique ID) */
  code: string;
  /** template name */
  name: string;
  /** the description for the template */
  description?: string;
  /** number of times this template has been used */
  usageCount: number;
  /** the ID of the user who created the template
    creator	user object	the user who created the template */
  creatorId: string;
  /** when this template was created */
  createdAt: string;
  /** when this template was last synced to the source guild */
  updatedAt: string;
  /** the ID of the guild this template is based on */
  sourceGuildId: string;
  /** the guild snapshot this template contains */
  serializedSourceGuild: Partial<Guild>;
  /** whether the template has unsynced changes */
  isDirty?: boolean;
}
