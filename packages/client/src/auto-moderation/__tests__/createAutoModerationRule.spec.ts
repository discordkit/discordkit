import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  createAutoModerationRule,
  createAutoModerationRuleSchema
} from "../createAutoModerationRule.js";
import { moderationRuleSchema } from "../types/ModerationRule.js";

describe(`createAutoModerationRule`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/auto-moderation/rules`,
    createAutoModerationRuleSchema,
    moderationRuleSchema,
    { seed: 1 }
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createAutoModerationRule,
        createAutoModerationRuleSchema,
        moderationRuleSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
