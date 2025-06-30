import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  listPrivateArchivedThreadsProcedure,
  listPrivateArchivedThreadsQuery,
  listPrivateArchivedThreadsSafe,
  listPrivateArchivedThreadsSchema
} from "../listPrivateArchivedThreads.js";
import { archivedThreadsSchema } from "../types/ArchivedThreads.js";

describe(`listPrivateArchivedThreads`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/threads/archived/private`,
    listPrivateArchivedThreadsSchema,
    archivedThreadsSchema
  );

  it(`can be used standalone`, async () => {
    await expect(listPrivateArchivedThreadsSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listPrivateArchivedThreadsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listPrivateArchivedThreadsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
