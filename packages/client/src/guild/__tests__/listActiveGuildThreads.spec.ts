import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  activeGuildThreadsSchema,
  listActiveGuildThreadsProcedure,
  listActiveGuildThreadsQuery,
  listActiveGuildThreadsSafe,
  listActiveGuildThreadsSchema
} from "../listActiveGuildThreads.js";

describe(`listActiveGuildThreads`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/threads/active`,
    listActiveGuildThreadsSchema,
    activeGuildThreadsSchema
  );

  it(`can be used standalone`, async () => {
    await expect(listActiveGuildThreadsSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listActiveGuildThreadsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listActiveGuildThreadsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
