import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  deleteAutoModerationRule,
  deleteAutoModerationRuleProcedure,
  deleteAutoModerationRuleSafe,
  deleteAutoModerationRuleSchema
} from "../deleteAutoModerationRule.ts";

describe(`deleteAutoModerationRule`, () => {
  mockRequest.delete(`/guilds/:guild/auto-moderation/rules/:rule`);
  const config = generateMock(deleteAutoModerationRuleSchema);

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
