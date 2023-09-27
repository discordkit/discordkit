import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  listAutoModerationRulesForGuildProcedure,
  listAutoModerationRulesForGuildQuery,
  listAutoModerationRulesForGuildSchema
} from "../listAutoModerationRulesForGuild";
import { moderationRuleSchema } from "../types/ModerationRule";

describe(`listAutoModerationRulesForGuild`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/auto-moderation/rules`,
    moderationRuleSchema.array(),
    { seed: 1 }
  );
  const config = generateMock(listAutoModerationRulesForGuildSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listAutoModerationRulesForGuildProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listAutoModerationRulesForGuildQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
