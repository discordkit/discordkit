import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { moderationRuleSchema } from "../types/ModerationRule.js";
import {
  listAutoModerationRulesForGuildProcedure,
  listAutoModerationRulesForGuildQuery,
  listAutoModerationRulesForGuildSafe,
  listAutoModerationRulesForGuildSchema
} from "../listAutoModerationRulesForGuild.js";

describe(`listAutoModerationRulesForGuild`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/auto-moderation/rules`,
    listAutoModerationRulesForGuildSchema,
    v.pipe(v.array(moderationRuleSchema), v.length(1)),
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
