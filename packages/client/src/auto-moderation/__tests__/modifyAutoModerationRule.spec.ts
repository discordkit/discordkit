import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  modifyAutoModerationRule,
  modifyAutoModerationRuleSchema
} from "../modifyAutoModerationRule.js";
import { moderationRuleSchema } from "../types/ModerationRule.js";

describe(`modifyAutoModerationRule`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/auto-moderation/rules/:rule`,
    modifyAutoModerationRuleSchema,
    moderationRuleSchema,
    { seed: 1 }
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyAutoModerationRule,
        modifyAutoModerationRuleSchema,
        moderationRuleSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
