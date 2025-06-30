import { object, array } from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  moderationRuleSchema,
  type ModerationRule
} from "./types/ModerationRule.js";

export const listAutoModerationRulesForGuildSchema = object({
  guild: snowflake
});

/**
 * ### [List Auto Moderation Rules for Guild](https://discord.com/developers/docs/resources/auto-moderation#list-auto-moderation-rules-for-guild)
 *
 * **GET** `/guilds/:guild/auto-moderation/rules`
 *
 * Get a list of all rules currently configured for the guild. Returns a list of {@link ModerationRule | auto moderation rule objects} for the given guild.
 *
 * > [!NOTE]
 * >
 * > This endpoint requires the `MANAGE_GUILD` permission.
 */
export const listAutoModerationRulesForGuild: Fetcher<
  typeof listAutoModerationRulesForGuildSchema,
  ModerationRule[]
> = async ({ guild }) => get(`/guilds/${guild}/auto-moderation/rules`);

export const listAutoModerationRulesForGuildSafe = toValidated(
  listAutoModerationRulesForGuild,
  listAutoModerationRulesForGuildSchema,
  array(moderationRuleSchema)
);

export const listAutoModerationRulesForGuildProcedure = toProcedure(
  `query`,
  listAutoModerationRulesForGuild,
  listAutoModerationRulesForGuildSchema,
  array(moderationRuleSchema)
);

export const listAutoModerationRulesForGuildQuery = toQuery(
  listAutoModerationRulesForGuild
);
