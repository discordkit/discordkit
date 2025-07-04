import * as v from "valibot";
import {
  snowflake,
  timestamp,
  boundedInteger,
  boundedString
} from "@discordkit/core";
import { guildSchema } from "../../guild/types/Guild.js";
import { userSchema } from "../../user/types/User.js";

export const guildTemplateSchema = v.object({
  /** the template code (unique ID) */
  code: boundedString(),
  /** template name */
  name: boundedString(),
  /** the description for the template */
  description: v.nullable(v.string()),
  /** number of times this template has been used */
  usageCount: boundedInteger(),
  /** the ID of the user who created the template
    creator	user object	the user who created the template */
  creatorId: snowflake,
  /** the user who created the template */
  creator: userSchema,
  /** when this template was created */
  createdAt: timestamp,
  /** when this template was last synced to the source guild */
  updatedAt: timestamp,
  /** the ID of the guild this template is based on */
  sourceGuildId: snowflake,
  /** the guild snapshot this template contains */
  serializedSourceGuild: v.partial(guildSchema),
  /** whether the template has unsynced changes */
  isDirty: v.nullable(v.boolean())
});

export interface GuildTemplate
  extends v.InferOutput<typeof guildTemplateSchema> {}
