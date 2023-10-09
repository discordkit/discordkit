import { snowflake } from "@discordkit/core";
import { object, nullType, type Output } from "valibot";

export const roleTagSchema = object({
  /** the id of the bot this role belongs to */
  botId: snowflake,
  /** the id of the integration this role belongs to */
  integrationId: snowflake,
  /** whether this is the guild's premium subscriber role */
  premiumSubscriber: nullType()
});

export type RoleTag = Output<typeof roleTagSchema>;
