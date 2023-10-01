import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "@discordkit/core";
import {
  moderationRuleSchema,
  type ModerationRule
} from "./types/ModerationRule.ts";

export const listAutoModerationRulesForGuildSchema = z.object({
  guild: z.string().min(1)
});

/**
 * ### [List Auto Moderation Rules for Guild](https://discord.com/developers/docs/resources/auto-moderation#list-auto-moderation-rules-for-guild)
 *
 * **GET** `/guilds/:guild/auto-moderation/rules`
 *
 * Get a list of all rules currently configured for the guild. Returns a list of {@link ModerationRule | auto moderation rule objects} for the given guild.
 *
 * > **NOTE**
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
  moderationRuleSchema.array()
);

export const listAutoModerationRulesForGuildProcedure = toProcedure(
  `query`,
  listAutoModerationRulesForGuild,
  listAutoModerationRulesForGuildSchema,
  moderationRuleSchema.array()
);

export const listAutoModerationRulesForGuildQuery = toQuery(
  listAutoModerationRulesForGuild
);
