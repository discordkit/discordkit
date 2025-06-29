import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getGuildPruneCountProcedure,
  getGuildPruneCountQuery,
  getGuildPruneCountSafe,
  getGuildPruneCountSchema,
  guildPruneCountSchema
} from "../getGuildPruneCount.js";

describe(`getGuildPruneCount`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/prune`,
    getGuildPruneCountSchema,
    guildPruneCountSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildPruneCountSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildPruneCountProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildPruneCountQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
