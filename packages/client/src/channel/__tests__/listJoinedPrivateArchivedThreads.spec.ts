import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  listJoinedPrivateArchivedThreadsProcedure,
  listJoinedPrivateArchivedThreadsQuery,
  listJoinedPrivateArchivedThreadsSafe,
  listJoinedPrivateArchivedThreadsSchema
} from "../listJoinedPrivateArchivedThreads.js";
import { archivedThreadsSchema } from "../types/ArchivedThreads.js";

describe(`listJoinedPrivateArchivedThreads`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/users/@me/threads/archived/private`,
    listJoinedPrivateArchivedThreadsSchema,
    archivedThreadsSchema
  );

  it(`can be used standalone`, async () => {
    await expect(listJoinedPrivateArchivedThreadsSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listJoinedPrivateArchivedThreadsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listJoinedPrivateArchivedThreadsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
