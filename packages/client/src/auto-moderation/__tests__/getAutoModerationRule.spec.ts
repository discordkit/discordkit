import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getAutoModerationRuleProcedure,
  getAutoModerationRuleQuery,
  getAutoModerationRuleSafe,
  getAutoModerationRuleSchema
} from "../getAutoModerationRule.js";
import { moderationRuleSchema } from "../types/ModerationRule.js";

describe(`getAutoModerationRule`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/auto-moderation/rules/:rule`,
    getAutoModerationRuleSchema,
    moderationRuleSchema,
    { seed: 1 }
  );

  it(`can be used standalone`, async () => {
    await expect(getAutoModerationRuleSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getAutoModerationRuleProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getAutoModerationRuleQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
