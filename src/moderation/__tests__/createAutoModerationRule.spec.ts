import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  createAutoModerationRule,
  createAutoModerationRuleProcedure,
  createAutoModerationRuleSchema
} from "../createAutoModerationRule";
import { moderationRuleSchema } from "../types/ModerationRule";

describe(`createAutoModerationRule`, () => {
  const expected = mockRequest.post(
    `/guilds/:guild/auto-moderation/rules`,
    moderationRuleSchema,
    { seed: 1 }
  );
  const config = generateMock(createAutoModerationRuleSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createAutoModerationRuleProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createAutoModerationRule);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
