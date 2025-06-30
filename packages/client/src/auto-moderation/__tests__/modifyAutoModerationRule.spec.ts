import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyAutoModerationRule,
  modifyAutoModerationRuleProcedure,
  modifyAutoModerationRuleSafe,
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

  it(`can be used standalone`, async () => {
    await expect(modifyAutoModerationRuleSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyAutoModerationRuleProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyAutoModerationRule);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
