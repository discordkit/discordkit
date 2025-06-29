import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  beginGuildPrune,
  beginGuildPruneProcedure,
  beginGuildPruneSafe,
  beginGuildPruneSchema,
  guildPruneResultSchema
} from "../beginGuildPrune.js";

describe(`beginGuildPrune`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/prune`,
    beginGuildPruneSchema,
    guildPruneResultSchema
  );

  it(`can be used standalone`, async () => {
    await expect(beginGuildPruneSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(beginGuildPruneProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(beginGuildPrune);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
