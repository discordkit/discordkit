import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyAutoModerationRule,
  modifyAutoModerationRuleProcedure,
  modifyAutoModerationRuleSchema
} from "../modifyAutoModerationRule";
import { moderationRuleSchema } from "../types/ModerationRule";

describe(`modifyAutoModerationRule`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/auto-moderation/rules/:rule`,
    moderationRuleSchema,
    { seed: 1 }
  );
  const config = generateMock(modifyAutoModerationRuleSchema);

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
