import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createAutoModerationRule,
  createAutoModerationRuleProcedure,
  createAutoModerationRuleSafe,
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

  it(`can be used standalone`, async () => {
    await expect(createAutoModerationRuleSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createAutoModerationRuleProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createAutoModerationRule);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
