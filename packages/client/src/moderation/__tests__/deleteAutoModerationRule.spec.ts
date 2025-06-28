import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteAutoModerationRule,
  deleteAutoModerationRuleProcedure,
  deleteAutoModerationRuleSafe,
  deleteAutoModerationRuleSchema
} from "../deleteAutoModerationRule.js";

describe(`deleteAutoModerationRule`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/auto-moderation/rules/:rule`,
    deleteAutoModerationRuleSchema
  );

  it(`can be used standalone`, async () => {
    await expect(deleteAutoModerationRuleSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteAutoModerationRuleProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteAutoModerationRule);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
