import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteAutoModerationRule,
  deleteAutoModerationRuleProcedure,
  deleteAutoModerationRuleSchema
} from "../deleteAutoModerationRule";

describe(`deleteAutoModerationRule`, () => {
  mockRequest.delete(`/guilds/:guild/auto-moderation/rules/:rule`);
  const config = generateMock(deleteAutoModerationRuleSchema);

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
