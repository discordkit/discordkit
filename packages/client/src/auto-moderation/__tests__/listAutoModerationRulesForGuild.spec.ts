import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { moderationRuleSchema } from "../types/ModerationRule.js";
import {
  listAutoModerationRulesForGuildSchema,
  listAutoModerationRulesForGuild
} from "../listAutoModerationRulesForGuild.js";

describe(`listAutoModerationRulesForGuild`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/auto-moderation/rules`,
    listAutoModerationRulesForGuildSchema,
    v.pipe(v.array(moderationRuleSchema), v.length(1)),
    { seed: 1 }
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listAutoModerationRulesForGuild,
        listAutoModerationRulesForGuildSchema,
        v.pipe(v.array(moderationRuleSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
