import { snowflake } from "@discordkit/core";
import { z } from "zod";

export const roleTagSchema = z.object({
  /** the id of the bot this role belongs to */
  botId: snowflake,
  /** the id of the integration this role belongs to */
  integrationId: snowflake,
  /** whether this is the guild's premium subscriber role */
  premiumSubscriber: z.null()
});

export type RoleTag = z.infer<typeof roleTagSchema>;
