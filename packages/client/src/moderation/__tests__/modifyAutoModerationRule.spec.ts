import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  modifyAutoModerationRule,
  modifyAutoModerationRuleProcedure,
  modifyAutoModerationRuleSafe,
  modifyAutoModerationRuleSchema
} from "../modifyAutoModerationRule.ts";
import { moderationRuleSchema } from "../types/ModerationRule.ts";

describe(`modifyAutoModerationRule`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/auto-moderation/rules/:rule`,
    moderationRuleSchema,
    { seed: 1 }
  );
  const config = generateMock(modifyAutoModerationRuleSchema);

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
