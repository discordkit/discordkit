import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  listAutoModerationRulesForGuildProcedure,
  listAutoModerationRulesForGuildQuery,
  listAutoModerationRulesForGuildSafe,
  listAutoModerationRulesForGuildSchema
} from "../listAutoModerationRulesForGuild.js";
import { moderationRuleSchema } from "../types/ModerationRule.js";

describe(`listAutoModerationRulesForGuild`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/auto-moderation/rules`,
    moderationRuleSchema.array().length(1),
    { seed: 1 }
  );
  const config = mockSchema(listAutoModerationRulesForGuildSchema);

  it(`can be used standalone`, async () => {
    await expect(
      listAutoModerationRulesForGuildSafe(config)
    ).resolves.toStrictEqual(expected);
  });

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
