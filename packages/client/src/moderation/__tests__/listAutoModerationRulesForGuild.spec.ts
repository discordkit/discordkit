import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  listAutoModerationRulesForGuildProcedure,
  listAutoModerationRulesForGuildQuery,
  listAutoModerationRulesForGuildSafe,
  listAutoModerationRulesForGuildSchema
} from "../listAutoModerationRulesForGuild.js";
import { moderationRuleSchema } from "../types/ModerationRule.js";

describe(`listAutoModerationRulesForGuild`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/auto-moderation/rules`,
    listAutoModerationRulesForGuildSchema,
    pipe(array(moderationRuleSchema), length(1)),
    { seed: 1 }
  );

  it(`can be used standalone`, async () => {
    await expect(listAutoModerationRulesForGuildSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listAutoModerationRulesForGuildProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listAutoModerationRulesForGuildQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
