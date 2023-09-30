import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getAutoModerationRuleProcedure,
  getAutoModerationRuleQuery,
  getAutoModerationRuleSafe,
  getAutoModerationRuleSchema
} from "../getAutoModerationRule";
import { moderationRuleSchema } from "../types/ModerationRule";

describe(`getAutoModerationRule`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/auto-moderation/rules/:rule`,
    moderationRuleSchema,
    { seed: 1 }
  );
  const config = generateMock(getAutoModerationRuleSchema);

  it(`can be used standalone`, async () => {
    await expect(getAutoModerationRuleSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getAutoModerationRuleProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getAutoModerationRuleQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
