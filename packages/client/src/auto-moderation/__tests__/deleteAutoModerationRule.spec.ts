import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  deleteAutoModerationRule,
  deleteAutoModerationRuleSchema
} from "../deleteAutoModerationRule.js";

describe(`deleteAutoModerationRule`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/auto-moderation/rules/:rule`,
    deleteAutoModerationRuleSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        deleteAutoModerationRule,
        deleteAutoModerationRuleSchema
      )(config)
    ).resolves.not.toThrow();
  });
});
