import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  createAutoModerationRule,
  createAutoModerationRuleProcedure,
  createAutoModerationRuleSafe,
  createAutoModerationRuleSchema
} from "../createAutoModerationRule.js";
import { moderationRuleSchema } from "../types/ModerationRule.js";

describe(`createAutoModerationRule`, () => {
  const expected = mockRequest.post(
    `/guilds/:guild/auto-moderation/rules`,
    moderationRuleSchema,
    { seed: 1 }
  );
  const config = mockSchema(createAutoModerationRuleSchema);

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
