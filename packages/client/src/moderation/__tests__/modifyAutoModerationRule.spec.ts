import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  modifyAutoModerationRule,
  modifyAutoModerationRuleProcedure,
  modifyAutoModerationRuleSafe,
  modifyAutoModerationRuleSchema
} from "../modifyAutoModerationRule.js";
import { moderationRuleSchema } from "../types/ModerationRule.js";

describe(`modifyAutoModerationRule`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/auto-moderation/rules/:rule`,
    moderationRuleSchema,
    { seed: 1 }
  );
  const config = mockSchema(modifyAutoModerationRuleSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyAutoModerationRuleSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyAutoModerationRuleProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyAutoModerationRule);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
