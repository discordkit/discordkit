import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  getAutoModerationRuleSchema,
  getAutoModerationRule
} from "../getAutoModerationRule.js";
import { moderationRuleSchema } from "../types/ModerationRule.js";

describe(`getAutoModerationRule`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/auto-moderation/rules/:rule`,
    getAutoModerationRuleSchema,
    moderationRuleSchema,
    { seed: 1 }
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getAutoModerationRule,
        getAutoModerationRuleSchema,
        moderationRuleSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
