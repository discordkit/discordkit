import {
  object,
  string,
  optional,
  partial,
  number,
  integer,
  isoTimestamp,
  boolean,
  type Output
} from "valibot";
import { snowflake } from "@discordkit/core";
import { guildSchema } from "../../guild/types/Guild.js";
import { userSchema } from "../../user/types/User.js";

export const guildTemplateSchema = object({
  /** the template code (unique ID) */
  code: string(),
  /** template name */
  name: string(),
  /** the description for the template */
  description: optional(string()),
  /** number of times this template has been used */
  usageCount: number([integer()]),
  /** the ID of the user who created the template
    creator	user object	the user who created the template */
  creatorId: snowflake,
  /** the user who created the template */
  creator: userSchema,
  /** when this template was created */
  createdAt: string([isoTimestamp()]),
  /** when this template was last synced to the source guild */
  updatedAt: string([isoTimestamp()]),
  /** the ID of the guild this template is based on */
  sourceGuildId: snowflake,
  /** the guild snapshot this template contains */
  serializedSourceGuild: partial(guildSchema),
  /** whether the template has unsynced changes */
  isDirty: optional(boolean())
});

export type GuildTemplate = Output<typeof guildTemplateSchema>;
